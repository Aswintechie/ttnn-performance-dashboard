#!/bin/bash

# Daily Performance Measurement Script for TT-Metal
# This script runs the complete workflow: update code, build, measure performance, upload results

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/perf_log.txt"
ERROR_LOG="$SCRIPT_DIR/perf_error.txt"
PYTHON_ENV="$SCRIPT_DIR/python_env"

# Parse command line arguments
UPLOAD_TO_GITHUB=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --upload|--github)
            UPLOAD_TO_GITHUB=true
            shift
            ;;
        --no-upload|--local)
            UPLOAD_TO_GITHUB=false
            shift
            ;;
        *)
            echo "Usage: $0 [--upload|--no-upload]"
            echo "  --upload/--github: Upload results to GitHub repository"
            echo "  --no-upload/--local: Keep results local only (default)"
            exit 1
            ;;
    esac
done

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to log errors
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$ERROR_LOG"
}

# GitHub Configuration
GITHUB_REPO_URL="git@github.com:Aswintechie/ttnn-performance-dashboard.git"

# Validate GitHub configuration (only if uploading)
if [ "$UPLOAD_TO_GITHUB" = true ]; then
    log "🔗 Using repository: $GITHUB_REPO_URL"
fi

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        log "✅ $1 - SUCCESS"
    else
        log_error "$1 - FAILED"
        exit 1
    fi
}

# Start the performance measurement workflow
log "🚀 Starting daily performance measurement workflow"
log "📁 Working directory: $SCRIPT_DIR"
if [ "$UPLOAD_TO_GITHUB" = true ]; then
    log "📤 GitHub upload: ENABLED"
    log "🔗 Repository: $GITHUB_REPO_URL"
else
    log "📁 Local mode: Results will be saved locally only"
fi

# Change to script directory
cd "$SCRIPT_DIR"

# Step 1: Git operations
log "📥 Step 1: Updating repository..."
git pull origin main 2>&1 | tee -a "$LOG_FILE"
check_success "Git pull"

git submodule update --init --recursive 2>&1 | tee -a "$LOG_FILE"
check_success "Git submodule update"

# Get current commit for reference
CURRENT_COMMIT=$(git rev-parse HEAD)
log "🔧 Current commit: $CURRENT_COMMIT"

# Step 2: Activate Python environment
log "🐍 Step 2: Activating Python environment..."

# Use the smart activation script
if [ -f "$SCRIPT_DIR/activate_env.sh" ]; then
    log "🔄 Sourcing activation script..."
    
    # Source directly, then capture and display the key info
    source "$SCRIPT_DIR/activate_env.sh"
    
    if [ $? -eq 0 ] && [ -n "$VIRTUAL_ENV" ]; then
        log "✅ Smart environment activation - SUCCESS"
        log "🔍 Environment check: VIRTUAL_ENV=$VIRTUAL_ENV"
        log "🔍 Python check: $(which python 2>/dev/null || echo 'not found')"
    else
        log_error "Smart environment activation - FAILED"
        exit 1
    fi
else
    # Fallback to manual activation if activate_env.sh not found
    log "⚠️  activate_env.sh not found, using fallback activation..."
    if [ -f "$PYTHON_ENV/bin/activate" ]; then
        source "$PYTHON_ENV/bin/activate" 2>&1 | tee -a "$LOG_FILE"
        check_success "Fallback Python environment activation"
        
        if [ -n "$VIRTUAL_ENV" ]; then
            log "✅ Fallback activation successful: $VIRTUAL_ENV"
            
            # Set TT-Metal environment variables for fallback
            export TT_METAL_HOME="$SCRIPT_DIR"
            export PYTHONPATH="$TT_METAL_HOME"
            log "🔧 TT_METAL_HOME: $TT_METAL_HOME"
            log "🐍 PYTHONPATH: $PYTHONPATH"
        else
            log_error "Fallback activation failed - VIRTUAL_ENV not set"
            exit 1
        fi
    else
        log_error "Python environment not found at $PYTHON_ENV"
        exit 1
    fi
fi

# Step 3: Build the project
log "🔨 Step 3: Building TT-Metal..."
./build_metal.sh
check_success "TT-Metal build"

# Step 4: Run performance measurements
log "📊 Step 4: Running performance measurements..."

# Ensure Python executable is available
if [ -n "$VIRTUAL_ENV" ] && [ -f "$VIRTUAL_ENV/bin/python" ]; then
    PYTHON_CMD="$VIRTUAL_ENV/bin/python"
    log "🐍 Using Python: $PYTHON_CMD"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
    log "🐍 Using system Python: $(which python)"
else
    log_error "Python executable not found"
    exit 1
fi

if [ "$UPLOAD_TO_GITHUB" = true ]; then
    log "🎯 Running: $PYTHON_CMD perf_measurement_script.py --upload"
    $PYTHON_CMD -u perf_measurement_script.py --upload 2>&1 | tee -a "$LOG_FILE"
    check_success "Performance measurement and GitHub upload"
else
    log "🎯 Running: $PYTHON_CMD perf_measurement_script.py"
    $PYTHON_CMD -u perf_measurement_script.py 2>&1 | tee -a "$LOG_FILE"
    check_success "Performance measurement (local only)"
fi

# Step 5: Generate summary
log "📈 Step 5: Generating summary..."
RESULTS_FILE=$(ls -t eltwise_perf_results_*_final.json 2>/dev/null | head -1)
if [ -n "$RESULTS_FILE" ]; then
    TOTAL_TESTS=$(jq -r '.metadata.total_tests' "$RESULTS_FILE" 2>/dev/null || echo "unknown")
    SUCCESSFUL_TESTS=$(jq -r '.metadata.successful_tests' "$RESULTS_FILE" 2>/dev/null || echo "unknown")
    FAILED_TESTS=$(jq -r '.metadata.failed_tests' "$RESULTS_FILE" 2>/dev/null || echo "unknown")
    
    log "📊 Results Summary:"
    log "   📄 Results file: $RESULTS_FILE"
    log "   📈 Total tests: $TOTAL_TESTS"
    log "   ✅ Successful: $SUCCESSFUL_TESTS"
    log "   ❌ Failed: $FAILED_TESTS"
    
    if [ "$UPLOAD_TO_GITHUB" = true ]; then
        log "   📤 Uploaded to GitHub repository"
        # Extract potential GitHub Pages URL from repo URL
        if [[ "$GITHUB_REPO_URL" == *"github.com"* ]]; then
            PAGES_URL=$(echo "$GITHUB_REPO_URL" | sed 's/github\.com/github.io/' | sed 's/\.git$//')
            log "   🌐 Dashboard URL: $PAGES_URL"
        fi
    else
        log "   📁 Results saved locally only"
        log "   💡 To upload later: $PYTHON_CMD push_to_github.py $RESULTS_FILE"
    fi
else
    log_error "No results file found"
fi

# Step 6: Cleanup (optional)
log "🧹 Step 6: Cleanup..."
# Remove old log files (keep last 7 days)
find "$SCRIPT_DIR" -name "perf_log_*.txt" -mtime +7 -delete 2>/dev/null || true
# For local mode, keep more historical data (60 days vs 30)
if [ "$UPLOAD_TO_GITHUB" = true ]; then
    RETENTION_DAYS=30
else
    RETENTION_DAYS=60
fi
find "$SCRIPT_DIR" -name "eltwise_perf_results_*.json" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
find "$SCRIPT_DIR" -name "eltwise_perf_results_*.csv" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
rm -rf /home/aswin/tt-metal/generated/*

log "✅ Daily performance measurement completed successfully!"
log "=" | tr '=' '='

# Send notification (optional - uncomment if you want email notifications)
# echo "Performance measurement completed. Check $LOG_FILE for details." | mail -s "TT-Metal Performance Report" your-email@example.com

exit 0 
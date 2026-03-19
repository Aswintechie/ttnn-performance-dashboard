#!/usr/bin/env python3
"""
Test script for performance change detection
Creates mock data to demonstrate email notification functionality
"""

import json
import tempfile
import os
import shutil
from pathlib import Path
from datetime import datetime, timedelta

# Test data: Create two performance results with some operations showing >20% change
def create_test_data():
    """Create test performance data with known changes."""
    
    # Base template for results
    def create_result(date, commit, operations):
        return {
            "metadata": {
                "measurement_date": date,
                "total_tests": len(operations),
                "successful_tests": len(operations),
                "failed_tests": 0,
                "failed_test_names": [],
                "rerun_mode": False,
                "git_commit_id": commit
            },
            "results": operations
        }
    
    # Previous day results (baseline)
    previous_date = (datetime.now() - timedelta(days=1)).isoformat()
    previous_ops = [
        {
            "test_name": "test_abs",
            "operation_name": "abs",
            "runs": [1000.0, 1010.0, 1005.0],
            "successful_runs": 3,
            "average_duration_ns": 1005.0,
            "std_deviation_ns": 5.0,
            "min_duration_ns": 1000.0,
            "max_duration_ns": 1010.0,
            "timestamp": previous_date
        },
        {
            "test_name": "test_exp",
            "operation_name": "exp",
            "runs": [2000.0, 2020.0, 2010.0],
            "successful_runs": 3,
            "average_duration_ns": 2010.0,
            "std_deviation_ns": 10.0,
            "min_duration_ns": 2000.0,
            "max_duration_ns": 2020.0,
            "timestamp": previous_date
        },
        {
            "test_name": "test_sqrt",
            "operation_name": "sqrt",
            "runs": [1500.0, 1520.0, 1510.0],
            "successful_runs": 3,
            "average_duration_ns": 1510.0,
            "std_deviation_ns": 10.0,
            "min_duration_ns": 1500.0,
            "max_duration_ns": 1520.0,
            "timestamp": previous_date
        },
        {
            "test_name": "test_log",
            "operation_name": "log",
            "runs": [3000.0, 3020.0, 3010.0],
            "successful_runs": 3,
            "average_duration_ns": 3010.0,
            "std_deviation_ns": 10.0,
            "min_duration_ns": 3000.0,
            "max_duration_ns": 3020.0,
            "timestamp": previous_date
        },
        {
            "test_name": "test_sigmoid",
            "operation_name": "sigmoid",
            "runs": [2500.0, 2520.0, 2510.0],
            "successful_runs": 3,
            "average_duration_ns": 2510.0,
            "std_deviation_ns": 10.0,
            "min_duration_ns": 2500.0,
            "max_duration_ns": 2520.0,
            "timestamp": previous_date
        }
    ]
    
    # Latest results with significant changes
    latest_date = datetime.now().isoformat()
    latest_ops = [
        {
            "test_name": "test_abs",
            "operation_name": "abs",
            "runs": [1300.0, 1310.0, 1305.0],  # +30% regression
            "successful_runs": 3,
            "average_duration_ns": 1305.0,
            "std_deviation_ns": 5.0,
            "min_duration_ns": 1300.0,
            "max_duration_ns": 1310.0,
            "timestamp": latest_date
        },
        {
            "test_name": "test_exp",
            "operation_name": "exp",
            "runs": [2500.0, 2520.0, 2510.0],  # +25% regression
            "successful_runs": 3,
            "average_duration_ns": 2510.0,
            "std_deviation_ns": 10.0,
            "min_duration_ns": 2500.0,
            "max_duration_ns": 2520.0,
            "timestamp": latest_date
        },
        {
            "test_name": "test_sqrt",
            "operation_name": "sqrt",
            "runs": [1050.0, 1060.0, 1055.0],  # -30% improvement
            "successful_runs": 3,
            "average_duration_ns": 1055.0,
            "std_deviation_ns": 5.0,
            "min_duration_ns": 1050.0,
            "max_duration_ns": 1060.0,
            "timestamp": latest_date
        },
        {
            "test_name": "test_log",
            "operation_name": "log",
            "runs": [2300.0, 2320.0, 2310.0],  # -23% improvement
            "successful_runs": 3,
            "average_duration_ns": 2310.0,
            "std_deviation_ns": 10.0,
            "min_duration_ns": 2300.0,
            "max_duration_ns": 2320.0,
            "timestamp": latest_date
        },
        {
            "test_name": "test_sigmoid",
            "operation_name": "sigmoid",
            "runs": [2528.0, 2532.0, 2530.0],  # +0.8% - no alert (under threshold)
            "successful_runs": 3,
            "average_duration_ns": 2530.0,
            "std_deviation_ns": 2.0,
            "min_duration_ns": 2528.0,
            "max_duration_ns": 2532.0,
            "timestamp": latest_date
        }
    ]
    
    previous_result = create_result(previous_date, "abc123def456", previous_ops)
    latest_result = create_result(latest_date, "xyz789uvw012", latest_ops)
    
    return previous_result, latest_result


def setup_test_environment():
    """Create a temporary test environment with mock data."""
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp(prefix="perf_test_")
    print(f"📁 Created test directory: {temp_dir}")
    
    # Create data structure
    data_dir = Path(temp_dir) / "data"
    daily_dir = data_dir / "daily"
    daily_dir.mkdir(parents=True, exist_ok=True)
    
    # Create test data
    previous_result, latest_result = create_test_data()
    
    # Save results to files
    prev_date = previous_result['metadata']['measurement_date'].split('T')[0]
    latest_date = latest_result['metadata']['measurement_date'].split('T')[0]
    
    prev_file = daily_dir / f"{prev_date}_test_results_previous.json"
    latest_file = daily_dir / f"{latest_date}_test_results_latest.json"
    
    with open(prev_file, 'w') as f:
        json.dump(previous_result, f, indent=2)
    print(f"📄 Created previous results: {prev_file.name}")
    
    with open(latest_file, 'w') as f:
        json.dump(latest_result, f, indent=2)
    print(f"📄 Created latest results: {latest_file.name}")
    
    # Create index.json
    index_data = {
        "last_updated": datetime.now().isoformat(),
        "total_measurements": 2,
        "files": [
            {
                "filename": latest_file.name,
                "path": f"data/daily/{latest_file.name}",
                "measurement_date": latest_result['metadata']['measurement_date'],
                "git_commit_id": latest_result['metadata']['git_commit_id'],
                "total_tests": len(latest_result['results']),
                "successful_tests": len(latest_result['results']),
                "failed_tests": 0
            },
            {
                "filename": prev_file.name,
                "path": f"data/daily/{prev_file.name}",
                "measurement_date": previous_result['metadata']['measurement_date'],
                "git_commit_id": previous_result['metadata']['git_commit_id'],
                "total_tests": len(previous_result['results']),
                "successful_tests": len(previous_result['results']),
                "failed_tests": 0
            }
        ]
    }
    
    index_file = data_dir / "index.json"
    with open(index_file, 'w') as f:
        json.dump(index_data, f, indent=2)
    print(f"📄 Created index.json")
    
    return temp_dir


def run_test(temp_dir):
    """Run the performance change detection test."""
    import sys
    sys.path.insert(0, os.path.dirname(__file__))
    
    from check_perf_changes import PerformanceChangeDetector
    
    # Change to temp directory
    original_dir = os.getcwd()
    os.chdir(temp_dir)
    
    try:
        print("\n" + "="*60)
        print("Testing Performance Change Detection")
        print("="*60 + "\n")
        
        # Create detector
        detector = PerformanceChangeDetector(threshold_percent=20.0)
        
        # Load and compare
        latest, previous = detector.get_latest_two_results()
        
        if latest and previous:
            changes = detector.compare_results(latest, previous)
            
            print(f"\n✅ Test successful!")
            print(f"   Found {len(changes)} operations with >20% change")
            
            if changes:
                regressions = [c for c in changes if c['change_type'] == 'regression']
                improvements = [c for c in changes if c['change_type'] == 'improvement']
                
                print(f"   📉 Regressions: {len(regressions)}")
                print(f"   📈 Improvements: {len(improvements)}")
                print()
                
                for change in sorted(changes, key=lambda x: abs(x['change_percent']), reverse=True):
                    symbol = "📉" if change['change_type'] == 'regression' else "📈"
                    sign = "+" if change['change_percent'] > 0 else ""
                    print(f"{symbol} {change['operation_name']}: {sign}{change['change_percent']:.2f}% "
                          f"({change['previous_avg_ns']:.2f}ns → {change['latest_avg_ns']:.2f}ns)")
                
                # Generate email body (for preview)
                print("\n" + "="*60)
                print("Email Report Preview")
                print("="*60)
                latest_metadata = latest.get('metadata', {})
                previous_metadata = previous.get('metadata', {})
                html_body = detector.format_email_body(changes, latest_metadata, previous_metadata)
                
                # Save HTML preview
                preview_file = Path(temp_dir) / "email_preview.html"
                with open(preview_file, 'w') as f:
                    f.write(html_body)
                print(f"📧 Email preview saved to: {preview_file}")
                print(f"   Open in browser to view: file://{preview_file}")
                
            return True
        else:
            print("❌ Test failed: Could not load results")
            return False
            
    finally:
        os.chdir(original_dir)


def main():
    """Main test function."""
    print("🧪 Performance Change Detection Test\n")
    
    # Setup test environment
    temp_dir = setup_test_environment()
    
    try:
        # Run test
        success = run_test(temp_dir)
        
        if success:
            print("\n✅ All tests passed!")
            print(f"\n💡 Test data available at: {temp_dir}")
            print("   (Will be kept for inspection)")
        else:
            print("\n❌ Tests failed!")
            
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        import traceback
        traceback.print_exc()
    
    # Note: Not cleaning up temp_dir so user can inspect results
    print(f"\n📁 Test directory: {temp_dir}")
    print("   Run 'rm -rf {}' to clean up".format(temp_dir))


if __name__ == "__main__":
    main()

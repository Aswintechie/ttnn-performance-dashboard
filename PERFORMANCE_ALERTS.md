# Performance Change Detection & Email Alerts

This feature automatically monitors performance changes in TTNN operations and sends email notifications when significant changes are detected.

## Overview

The system compares the latest performance measurement with the previous one and sends an email alert to `aswin@aswincloud.com` whenever any operation's performance changes by more than 20%.

## Components

### 1. Performance Comparison Script (`check_perf_changes.py`)

A Python script that:
- Loads the two most recent performance measurement files from `data/daily/`
- Compares performance metrics for each operation
- Detects changes exceeding the threshold (default: 20%)
- Formats a detailed HTML email report
- Sends the email using the Resend API

#### Features:
- **Configurable threshold**: Set via `PERF_CHANGE_THRESHOLD` environment variable
- **Detailed reporting**: Shows both regressions (slower) and improvements (faster)
- **HTML email formatting**: Professional, readable email reports
- **Comparison metrics**: Shows previous vs. latest durations in nanoseconds and microseconds

### 2. GitHub Actions Workflow (`.github/workflows/check-performance-changes.yml`)

Automatically triggers when:
- New performance data files are pushed to `data/daily/`
- The `data/index.json` file is updated
- Latest results are updated in `data/latest/`
- Manual workflow dispatch (for testing)

## Setup Instructions

### Prerequisites

1. **Resend API Account**: 
   - Sign up at [resend.com](https://resend.com)
   - Get your API key from the dashboard

2. **GitHub Repository Secrets**:
   - Go to repository Settings → Secrets and variables → Actions
   - Add a new secret: `RESEND_API_KEY` with your Resend API key value

### Configuration

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key (required) | None |
| `ALERT_EMAIL` | Recipient email address | `aswin@aswincloud.com` |
| `FROM_EMAIL` | Sender email (optional, for verified domain) | `onboarding@resend.dev` |
| `PERF_CHANGE_THRESHOLD` | Percentage change threshold | `20.0` |

### Email Template

The email report includes:
- **Summary**: Count of total changes, regressions, and improvements
- **Metadata**: Measurement dates and git commit information
- **Detailed Changes**: 
  - Performance regressions (operations that got slower)
  - Performance improvements (operations that got faster)
  - Duration comparisons in nanoseconds and microseconds
  - Percentage change for each operation

## Manual Usage

You can run the script manually:

```bash
# Set required environment variable
export RESEND_API_KEY="your-api-key-here"

# Optional: Set custom threshold or email
export PERF_CHANGE_THRESHOLD="15.0"
export ALERT_EMAIL="custom@email.com"

# Run the script
python check_perf_changes.py
```

## Testing

To test the detection logic without sending emails:

```python
from check_perf_changes import PerformanceChangeDetector

detector = PerformanceChangeDetector(threshold_percent=20.0)
latest, previous = detector.get_latest_two_results()

if latest and previous:
    changes = detector.compare_results(latest, previous)
    print(f"Found {len(changes)} changes")
```

## Workflow Integration

The workflow automatically runs after:
1. Performance measurements are collected by `perf_measurement_script.py`
2. Results are uploaded to GitHub by `push_to_github.py`
3. New data files are committed to the repository

The workflow will:
1. ✅ Checkout the repository
2. ✅ Set up Python environment
3. ✅ Install required dependencies (`requests`)
4. ✅ Run the performance comparison script
5. ✅ Send email if significant changes are detected

## Output Examples

### Console Output (No Changes)
```
🔍 TTNN Performance Change Detector
   Threshold: 20.0%
   Data directory: /path/to/data

📄 Latest results: 2026-03-19_eltwise_perf_results_20260319_020238_final.json
   Date: 2026-03-19T02:02:38.953943
📄 Previous results: 2026-03-18_eltwise_perf_results_20260318_020008_final.json
   Date: 2026-03-18T02:00:08.729981

🔬 Comparing performance results...

📊 Found 0 operation(s) with >20% change
✅ No significant performance changes detected.
```

### Console Output (Changes Detected)
```
📊 Found 5 operation(s) with >20% change
   ⬇️ Regressions: 2
   ⬆️ Improvements: 3

📉 abs: +25.50% (1734.67ns → 2177.23ns)
📉 exp: +22.10% (3421.50ns → 4178.32ns)
📈 sqrt: -28.75% (2150.33ns → 1532.10ns)
📈 log: -21.30% (3890.12ns → 3061.45ns)
📈 sigmoid: -20.15% (4120.00ns → 3290.18ns)

📧 Sending email to aswin@aswincloud.com...
✅ Email sent successfully!
```

## Troubleshooting

### Issue: No email received
1. Check if `RESEND_API_KEY` secret is set correctly in GitHub
2. Verify the API key is valid and active in Resend dashboard
3. Check GitHub Actions logs for error messages
4. Ensure the recipient email is verified (if using Resend free tier)

### Issue: Script fails with "Not enough data"
- The script needs at least 2 measurement files in `data/daily/`
- Ensure performance measurements have been run at least twice

### Issue: Email from address shows onboarding@resend.dev
- This is the default test sender address
- For production use, configure a verified domain in Resend
- Set the `FROM_EMAIL` environment variable with your verified sender address
- Example: `FROM_EMAIL="alerts@yourdomain.com"`
- Check if there were significant system/hardware changes
- Verify the measurement methodology is consistent
- Consider adjusting the threshold if normal variance is higher

## Future Enhancements

Possible improvements:
- Multiple recipient support
- Custom email templates
- Slack/Discord integration
- Historical trend analysis
- Automatic issue creation for regressions
- Performance regression prevention (block PRs with significant regressions)

## Security Notes

- ✅ API keys are stored as GitHub secrets (never in code)
- ✅ Secrets are not exposed in logs
- ✅ Email content only includes performance metrics (no sensitive data)
- ✅ HTTPS communication with Resend API

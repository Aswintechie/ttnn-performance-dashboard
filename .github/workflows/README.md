# GitHub Actions Workflows

This directory contains automated workflows for the TTNN Performance Dashboard repository.

## Daily Commit Check Workflow

**File**: `daily-commit-check.yml`

### Purpose
Monitors repository activity by checking for commits in the last 24 hours. If no commits are detected, it automatically creates a GitHub issue to notify maintainers.

### Schedule
- **Automatic**: Runs daily at 00:00 UTC (midnight)
- **Manual**: Can be triggered manually using the "Run workflow" button in the Actions tab

### How It Works

1. **Checkout Repository**: Fetches the complete git history
2. **Check Commits**: Counts commits made in the last 24 hours using `git log --since`
3. **Conditional Notification**: 
   - If commits exist: Logs success and exits
   - If no commits: Creates a GitHub issue with label `no-recent-commits`
4. **Duplicate Prevention**: Before creating an issue, checks if an open issue with the same label already exists

### Issue Details
When no commits are detected, an automated issue is created with:
- **Title**: ⚠️ No commits in the last 24 hours
- **Labels**: `no-recent-commits`, `automated`
- **Body**: Contains timestamp and details about the check

### Permissions Required
- `contents: read` - To checkout and read repository
- `issues: write` - To create notification issues

### Testing
You can test this workflow manually:
1. Go to the "Actions" tab in GitHub
2. Select "Daily Commit Check" from the workflows list
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

### Configuration
To modify the schedule, edit the cron expression in the workflow file:
```yaml
schedule:
  - cron: '0 0 * * *'  # Currently: Daily at 00:00 UTC
```

Common cron schedules:
- `0 */12 * * *` - Every 12 hours
- `0 0 * * 1` - Every Monday at midnight
- `0 9 * * 1-5` - Weekdays at 9 AM

### Troubleshooting

**Issue: Workflow doesn't run**
- Ensure the workflow file is on the default branch
- Check that GitHub Actions is enabled for the repository
- Verify the cron schedule is valid

**Issue: False positives**
- The workflow checks the last 24 hours from when it runs
- Commits must be pushed to the repository (local commits won't count)

**Issue: Too many notification issues**
- The workflow includes duplicate prevention logic
- Only one open issue with `no-recent-commits` label will exist at a time
- Close old issues to acknowledge the alert

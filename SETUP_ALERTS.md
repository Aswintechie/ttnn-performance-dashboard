# Quick Setup Guide for Performance Email Alerts

This guide will help you quickly set up automated email notifications for performance changes in your TTNN Performance Dashboard.

## 🚀 Quick Setup (3 Steps)

### Step 1: Get a Resend API Key

1. Go to [resend.com](https://resend.com) and sign up for a free account
2. Navigate to **API Keys** in your dashboard
3. Click **Create API Key**
4. Copy the API key (starts with `re_`)

### Step 2: Add API Key to GitHub Secrets

1. Go to your repository on GitHub: `https://github.com/Aswintechie/ttnn-performance-dashboard`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Paste your Resend API key
5. Click **Add secret**

### Step 3: Test the Workflow

The workflow is now ready and will automatically run when new performance data is pushed!

To test manually:
1. Go to **Actions** tab in your repository
2. Select **Check Performance Changes** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## 📧 What Happens Next?

### Automatic Triggers

The workflow automatically runs when:
- New performance data is uploaded to `data/daily/`
- The `data/index.json` file is updated
- Latest results are updated in `data/latest/`

### Email Notifications

You'll receive an email at `aswin@aswincloud.com` when:
- Any operation's performance changes by more than 20%
- The email includes:
  - Summary of total changes, regressions, and improvements
  - Detailed breakdown of each changed operation
  - Previous vs. current performance metrics
  - Git commit information

### Example Email Content

```
⚠️ TTNN Performance Alert

Summary:
- Total Operations with Changes > 20%: 5
- Performance Regressions: 2
- Performance Improvements: 3

⬇️ Performance Regressions (Slower)
- abs: +25.50% (1734.67ns → 2177.23ns)
- exp: +22.10% (3421.50ns → 4178.32ns)

⬆️ Performance Improvements (Faster)
- sqrt: -28.75% (2150.33ns → 1532.10ns)
- log: -21.30% (3890.12ns → 3061.45ns)
- sigmoid: -20.15% (4120.00ns → 3290.18ns)
```

## ⚙️ Optional Configuration

### Change Alert Threshold

Default is 20%. To change it:

1. Go to `.github/workflows/check-performance-changes.yml`
2. Change the `PERF_CHANGE_THRESHOLD` value:
   ```yaml
   env:
     PERF_CHANGE_THRESHOLD: '15.0'  # Change to your desired percentage
   ```

### Change Recipient Email

To send alerts to a different email:

1. Edit `.github/workflows/check-performance-changes.yml`
2. Change the `ALERT_EMAIL` value:
   ```yaml
   env:
     ALERT_EMAIL: 'your-email@example.com'
   ```

### Use Custom Sender Email (Production)

> **⚠️ IMPORTANT:** The default sender (`onboarding@resend.dev`) is for testing only and can only send emails to the Resend account owner's email address. To send emails to other recipients, you must verify a custom domain.

For production use with a verified domain:

#### Option 1: Verify a Domain (Recommended for Production)

1. **Verify your domain in Resend:**
   - Go to [Resend Dashboard](https://resend.com/domains)
   - Click **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)
   - Follow the instructions to add DNS records
   - Wait for verification (usually a few minutes)

2. **Add FROM_EMAIL to GitHub secrets:**
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Set:
     - **Name**: `FROM_EMAIL`
     - **Value**: `TTNN Alerts <alerts@yourdomain.com>` (use your verified domain)
   - Click **Add secret**

3. **The workflow will automatically use this sender**

#### Option 2: Use Test Domain (Development Only)

If you're just testing and the recipient email matches your Resend account email:
- No additional setup needed
- Default sender `onboarding@resend.dev` will be used
- Can only send to the email address registered with your Resend account

#### Sender Email Format

The FROM_EMAIL should be in one of these formats:
```
alerts@yourdomain.com
TTNN Alerts <alerts@yourdomain.com>
TTNN Performance Dashboard <noreply@yourdomain.com>
```

## 🧪 Testing Locally

You can test the detection logic locally without sending emails:

```bash
# Clone the repository
cd /path/to/ttnn-performance-dashboard

# Run the test suite
python3 test_perf_alerts.py
```

This will:
- Create mock performance data with known changes
- Run the comparison logic
- Generate an HTML email preview
- Show the output in your terminal

## 📊 Monitoring

### View Workflow Runs

1. Go to **Actions** tab in GitHub
2. Click on **Check Performance Changes**
3. View recent runs and their logs

### Check Email Delivery

- Check your inbox at `aswin@aswincloud.com`
- Check spam folder if not received
- Verify RESEND_API_KEY is correctly set in GitHub secrets
- Check workflow logs for any errors

## 🔍 Troubleshooting

### Issue: "Testing domain restriction" error

**Error Message:**
```
Testing domain restriction: The resend.dev domain is for testing and can only 
send to your own email address. To send to other recipients, verify a domain 
and update the from address to use it.
```

**Cause:** You're using the default test sender (`onboarding@resend.dev`) but trying to send to an email that's not your Resend account email.

**Solutions:**
1. **Option A - Verify a custom domain (Recommended):**
   - Go to [Resend Dashboard](https://resend.com/domains)
   - Add and verify your custom domain
   - Add `FROM_EMAIL` secret with your verified domain email
   - See [Use Custom Sender Email](#use-custom-sender-email-production) section above

2. **Option B - Use account email for testing:**
   - Change `ALERT_EMAIL` in the workflow to match your Resend account email
   - This is only suitable for testing, not production use

### Issue: No email received

**Solutions:**
1. Check GitHub Actions logs for errors
2. Verify `RESEND_API_KEY` is set correctly in repository secrets
3. Ensure the API key is active in Resend dashboard
4. Check spam/junk folder
5. For Resend free tier, verify the recipient email in Resend dashboard

### Issue: Workflow fails with "RESEND_API_KEY not set"

**Solution:**
- Ensure the secret name is exactly `RESEND_API_KEY` (case-sensitive)
- Re-add the secret if needed

### Issue: No alerts even though performance changed

**Solutions:**
- Check if changes exceed the threshold (default: 20%)
- Verify at least 2 measurement files exist in `data/daily/`
- Check workflow logs for comparison results

### Issue: Getting alerts for normal variations

**Solution:**
- Increase the threshold in the workflow configuration
- Consider the normal performance variance in your environment

## 📖 Full Documentation

For complete details, see:
- **[PERFORMANCE_ALERTS.md](PERFORMANCE_ALERTS.md)** - Complete feature documentation
- **[README.md](README.md)** - Main project documentation

## 🎯 Success Checklist

- [ ] Resend account created
- [ ] API key generated
- [ ] `RESEND_API_KEY` added to GitHub secrets
- [ ] Test workflow run successful
- [ ] Email received at configured address
- [ ] Threshold configured (if different from 20%)

## 💡 Tips

- **First Run**: The first time the workflow runs after setup, it will compare the two most recent measurements
- **No Changes**: If no operations changed by >20%, no email will be sent (this is expected!)
- **Testing**: Use `test_perf_alerts.py` to test the functionality with mock data before relying on real measurements
- **Email Format**: The HTML email is mobile-friendly and looks great on all devices

## 🆘 Need Help?

If you encounter issues:
1. Check the [GitHub Actions logs](https://github.com/Aswintechie/ttnn-performance-dashboard/actions)
2. Review the [troubleshooting section](#-troubleshooting) above
3. Open an issue in the repository

---

**Setup complete! Your performance monitoring is now active.** 🎉

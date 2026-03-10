# GitHub Pages Deployment Setup

## Current Issue
GitHub Pages is showing a blank page because it's configured to use the legacy "Deploy from a branch" mode, which serves raw source files instead of the built Vite application.

## Why This Happens
1. Vite apps need to be **built** (`npm run build`) before deployment - they cannot run directly from source
2. The legacy branch deployment mode just serves files as-is from the repository
3. Without building, the browser gets the raw `index.html` which references source files in `/src/`, not the bundled JavaScript

## Solution: Enable GitHub Actions Deployment

### Step 1: Switch to GitHub Actions Mode
1. Go to your repository: https://github.com/Aswintechie/ttnn-performance-dashboard
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under "Build and deployment" → "Source", change from **"Deploy from a branch"** to **"GitHub Actions"**
4. Click **Save**

### Step 2: Merge This PR or Run the Workflow
After switching to GitHub Actions mode, you have two options:

**Option A: Merge this PR (Recommended)**
- Merge this PR to `main` branch
- The workflow will automatically run and deploy on every push to `main`

**Option B: Test from this branch first**
- Go to **Actions** → **Deploy to GitHub Pages** workflow
- Click **Run workflow** → select `copilot/fix-blank-page-on-gh-pages` branch
- Click **Run workflow** button
- This will deploy from this branch for testing

### Step 3: Verify Deployment
After the workflow completes:
1. Go to **Actions** tab and verify the "Deploy to GitHub Pages" workflow succeeded
2. Visit https://aswintechie.github.io/ttnn-performance-dashboard/
3. The dashboard should load correctly with all performance data

## What Was Fixed
- ✅ Added `base: '/ttnn-performance-dashboard/'` to `vite.config.js` for correct asset paths
- ✅ Updated all data fetch URLs to use `import.meta.env.BASE_URL` 
- ✅ Created GitHub Actions workflow to build and deploy automatically
- ✅ Added `.nojekyll` file to prevent Jekyll processing

## Cloudflare Pages vs GitHub Pages
- **Cloudflare Pages** (ttnn-eltwise-performance.aswincloud.com) - Already works ✅
  - Automatically detects Vite and builds the app
  - No additional configuration needed
  
- **GitHub Pages** (aswintechie.github.io/ttnn-performance-dashboard/) - Needs setup
  - Requires switching to "GitHub Actions" source mode
  - Uses the workflow in `.github/workflows/deploy-gh-pages.yml`

## Future Deployments
Once merged to `main` and Pages is set to "GitHub Actions" mode:
- Every push to `main` will automatically build and deploy
- Manual deployments can be triggered via the Actions tab
- Both Cloudflare and GitHub Pages will work simultaneously

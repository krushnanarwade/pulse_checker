# CI/CD & Environment Configuration Guide

This guide covers setting up the automated CI/CD pipeline and managing environment-specific configurations for the PulseCheck application.

## Table of Contents
- [Environment Configuration](#environment-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [GitHub Secrets Setup](#github-secrets-setup)
- [Render Deployment](#render-deployment)
- [Troubleshooting](#troubleshooting)

---

## Environment Configuration

### Directory Structure

```
backend/
├── .env                    # Not tracked in git (local only)
├── .env.development       # Development configuration (tracked in git)
├── .env.staging          # Staging configuration (tracked in git)
├── .env.production       # Production configuration (tracked in git)
└── app/
    └── core/
        └── settings.py   # Enhanced settings with environment support
```

### Environment Files

The application supports three environments:

#### 1. **Development** (`.env.development`)
- Used for local development
- `DEBUG=True`
- Local SQLite database
- Wider CORS origins for testing
- Shorter check intervals

#### 2. **Staging** (`.env.staging`)
- Mirror of production configuration
- `DEBUG=False`
- PostgreSQL database
- Restricted CORS
- Medium check intervals

#### 3. **Production** (`.env.production`)
- Live environment configuration
- `DEBUG=False`
- PostgreSQL database
- Restricted CORS to your domain only
- Standard check intervals

### Setting Up Environments Locally

#### Development
```bash
# Create local .env file (not tracked in git)
cp backend/.env.development backend/.env

# Run backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
export ENVIRONMENT=development
python -m uvicorn app.main:app --reload
```

#### Testing with Different Environments
```bash
# Test staging configuration locally
export ENVIRONMENT=staging
python -m uvicorn app.main:app --reload

# Test production configuration locally
export ENVIRONMENT=production
python -m uvicorn app.main:app
```

### Environment Variables Reference

| Variable | Development | Staging | Production | Notes |
|----------|-------------|---------|------------|-------|
| `ENVIRONMENT` | development | staging | production | Sets active environment |
| `DEBUG` | True | False | False | Enables debug mode |
| `SECRET_KEY` | dev-key | `${{ secrets.STAGING_SECRET_KEY }}` | `${{ secrets.PRODUCTION_SECRET_KEY }}` | JWT signing key |
| `DATABASE_URL` | SQLite | PostgreSQL | PostgreSQL | Database connection |
| `CORS_ORIGINS` | localhost:3000 | staging.yourdomain.com | yourdomain.com | Allowed origins |
| `CHECK_INTERVAL_MINUTES` | 5 | 15 | 30 | Uptime check frequency |
| `SCHEDULER_ENABLED` | True | True | True | Enable background tasks |

---

## CI/CD Pipeline

### Workflow Overview

```
┌─────────────────┐
│  Push to main   │
│  or develop     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Run Tests & Linting        │  ← .github/workflows/tests.yml
│  - Backend tests            │
│  - Frontend build           │
│  - Code linting             │
│  - Docker image build       │
└────────┬────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
 develop    main
    │         │
    ▼         ▼
┌────────┐  ┌─────────────┐
│Staging │  │ Production  │
│Deploy  │  │ Deploy      │
│        │  │             │
└────────┘  └─────────────┘
```

### Workflows

#### 1. **Tests Workflow** (`.github/workflows/tests.yml`)
Runs on every push and pull request to `main` or `develop`:
- ✅ Backend unit tests
- ✅ Frontend build
- ✅ Code linting (flake8, black, isort)
- ✅ Docker image builds (no push)
- ✅ Code coverage reports

#### 2. **Staging Deployment** (`.github/workflows/deploy-staging.yml`)
Runs on every push to `develop`:
- 🚀 Backend deployment to Render
- 🚀 Frontend deployment to Render
- 📢 Slack notification

#### 3. **Production Deployment** (`.github/workflows/deploy-production.yml`)
Runs on every push to `main`:
- ✅ Full test suite execution
- 🚀 Backend deployment to Render
- 🚀 Frontend deployment to Render
- 📝 GitHub release creation
- 📢 Slack notification (success/failure)

---

## GitHub Secrets Setup

### Required Secrets

Add these secrets to your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Render Deployment Secrets

```
RENDER_DEPLOY_KEY          # Your Render API key
RENDER_STAGING_BACKEND_SERVICE_ID    # From Render dashboard
RENDER_STAGING_FRONTEND_SERVICE_ID   # From Render dashboard
RENDER_PRODUCTION_BACKEND_SERVICE_ID # From Render dashboard
RENDER_PRODUCTION_FRONTEND_SERVICE_ID # From Render dashboard
```

#### Staging Environment Secrets

```
STAGING_SECRET_KEY         # JWT secret key for staging
STAGING_DB_USER           # PostgreSQL user
STAGING_DB_PASSWORD       # PostgreSQL password
STAGING_DB_HOST           # PostgreSQL host
STAGING_DB_NAME           # PostgreSQL database name
STAGING_SLACK_WEBHOOK     # Slack webhook URL (optional)
STAGING_DISCORD_WEBHOOK   # Discord webhook URL (optional)
```

#### Production Environment Secrets

```
PRODUCTION_SECRET_KEY          # JWT secret key for production
PRODUCTION_DB_USER            # PostgreSQL user
PRODUCTION_DB_PASSWORD        # PostgreSQL password
PRODUCTION_DB_HOST            # PostgreSQL host
PRODUCTION_DB_NAME            # PostgreSQL database name
PRODUCTION_SLACK_WEBHOOK      # Slack webhook URL
PRODUCTION_DISCORD_WEBHOOK    # Discord webhook URL
```

#### Notifications

```
SLACK_WEBHOOK_URL          # For GitHub Actions notifications
```

### How to Get Secrets

**Render Deployment Key:**
1. Go to Render dashboard
2. Account Settings → API Keys
3. Create new API key
4. Copy and add to GitHub Secrets

**Render Service IDs:**
1. Go to each service in Render dashboard
2. Settings tab
3. Copy the Service ID (appears in URL: srv-xxxxx)

**Slack Webhook URL:**
1. Go to Slack app management
2. Create new app or select existing
3. Enable Incoming Webhooks
4. Create new webhook to your channel
5. Copy webhook URL

---

## Render Deployment

### Initial Setup

1. **Connect GitHub to Render**
   - Go to render.com
   - Create account and sign in
   - Connect GitHub repository

2. **Create Backend Service**
   - Select repository
   - Environment: Python 3.11
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
   - Add environment variables from `.env.production`

3. **Create Frontend Service**
   - Select repository (same)
   - Environment: Node.js
   - Build command: `npm run build`
   - Start command: `npm run preview`
   - Add environment variables

### Deploying

**Manual Deployment via GitHub:**
- Push to `develop` → Auto-deploys to staging
- Push to `main` → Auto-deploys to production

**Manual Deployment via Render:**
```bash
# Get deploy hook from Render service
# Then trigger manually:
curl https://api.render.com/deploy/srv-xxxxx?key=YOUR_RENDER_KEY
```

---

## Local Development Workflow

### Day-to-Day Development

```bash
# 1. Clone repository
git clone <your-repo>
cd uptime_link_checker

# 2. Setup backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
export ENVIRONMENT=development

# 3. Setup frontend
cd ../frontend
npm install

# 4. Run backend (in one terminal)
cd ../backend
python -m uvicorn app.main:app --reload

# 5. Run frontend (in another terminal)
cd frontend
npm run dev
```

### Feature Branch Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Run tests locally
cd backend
pytest tests/ -v

# 4. Push and create PR
git push origin feature/my-feature

# 5. Tests run automatically (via GitHub Actions)

# 6. Once PR is approved, merge to develop
# ✅ Auto-deploys to staging

# 7. Test in staging
# https://staging.yourdomain.com

# 8. After validation, create PR from develop → main
# ✅ Auto-deploys to production
```

### Production Hotfixes

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-bug main

# 2. Fix the issue
# ... edit files ...

# 3. Test locally
pytest tests/ -v

# 4. Push and create PR to main
git push origin hotfix/critical-bug

# 5. Once tests pass and reviewed, merge to main
# ✅ Auto-deploys to production
```

---

## Monitoring Deployments

### GitHub Actions

1. Go to repository → Actions tab
2. View workflow runs and logs
3. See deployment status and test results

### Render Dashboard

1. Go to your service in Render
2. View deployment logs
3. Monitor application health
4. Check environment variables

### Slack Notifications

When configured, you'll receive:
- ✅ Staging deployment notifications (push to develop)
- ✅/❌ Production deployment success/failure (push to main)

---

## Troubleshooting

### Deployment Fails

**Check deployment logs:**
1. GitHub Actions → View workflow run
2. Render Dashboard → Deployment logs
3. Look for error messages

**Common issues:**
- Missing environment variables → Add to GitHub Secrets
- Database connection error → Verify DATABASE_URL
- Missing dependencies → Run `pip install -r requirements.txt`

### Tests Fail Locally But Pass on GitHub

**Possible causes:**
- Different Python version (check with `python --version`)
- Missing .env file → Copy `.env.development`
- Environment variables not set → `export ENVIRONMENT=development`

**Fix:**
```bash
# Ensure you're using the right environment
export ENVIRONMENT=development
python -m pytest tests/ -v
```

### Cannot Deploy to Render

**Verify:**
1. Render API key is valid (`RENDER_DEPLOY_KEY` secret)
2. Service IDs are correct (check Render dashboard)
3. Render account has active services

**Debug:**
```bash
# Test Render API manually
curl https://api.render.com/deploy/srv-xxxxx?key=YOUR_KEY
```

### Environment Variables Not Loading

**Check:**
1. Variable is in the right `.env.{environment}` file
2. `ENVIRONMENT` variable is set correctly
3. Settings class is properly configured

**Debug:**
```python
# In backend/app/main.py, add:
from app.core.settings import settings
print(f"Environment: {settings.ENVIRONMENT}")
print(f"Debug: {settings.DEBUG}")
```

---

## Best Practices

1. **Never commit `.env` file** (only `.env.{environment}` files)
2. **Use strong SECRET_KEY values** in production
3. **Restrict CORS_ORIGINS** to your domain in production
4. **Test in staging before production** deployment
5. **Keep secrets secure** - rotate them periodically
6. **Monitor deployments** via Slack notifications
7. **Run tests locally** before pushing
8. **Use feature branches** for all development

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [PostgreSQL Configuration](https://www.postgresql.org/docs/current/runtime-config.html)

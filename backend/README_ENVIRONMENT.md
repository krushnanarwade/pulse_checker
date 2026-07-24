# Backend - Environment Configuration

This directory contains the FastAPI backend with environment-specific configuration support.

## Quick Start

### Development

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run development server
export ENVIRONMENT=development
python -m uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Environment Variables

The application loads configuration from multiple sources in order of precedence:

1. **Environment variables** (highest priority)
2. **.env.{ENVIRONMENT}** file (e.g., `.env.development`)
3. **.env** file (local, not tracked in git)
4. **Default values** in `app/core/settings.py` (lowest priority)

### Available Environments

#### Development
```bash
export ENVIRONMENT=development
python -m uvicorn app.main:app --reload
```
- Uses SQLite database
- Debug mode enabled
- Wider CORS origins

#### Staging
```bash
export ENVIRONMENT=staging
python -m uvicorn app.main:app
```
- Requires PostgreSQL
- Debug mode disabled
- Restricted CORS

#### Production
```bash
export ENVIRONMENT=production
python -m uvicorn app.main:app
```
- Requires PostgreSQL
- Debug mode disabled
- Restricted CORS to domain only

## Configuration Files

### `.env.development`
Development configuration with SQLite and debug mode.
```
ENVIRONMENT=development
DEBUG=True
DATABASE_URL=sqlite:///./uptime.db
```

### `.env.staging`
Staging configuration with PostgreSQL and secrets.
```
ENVIRONMENT=staging
DEBUG=False
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### `.env.production`
Production configuration with secrets (set via GitHub Secrets).
```
ENVIRONMENT=production
DEBUG=False
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=${PRODUCTION_SECRET_KEY}
```

### `.env` (local, not tracked)
For local overrides not in version control:
```bash
# Copy from development template
cp .env.development .env
# Then edit as needed
```

## Environment-Specific Variables

| Variable | Default | Development | Staging | Production |
|----------|---------|-------------|---------|------------|
| `ENVIRONMENT` | development | development | staging | production |
| `DEBUG` | False | True | False | False |
| `SECRET_KEY` | dev-secret | dev-secret | $SECRET | $SECRET |
| `DATABASE_URL` | sqlite | sqlite | postgresql | postgresql |
| `CORS_ORIGINS` | ["*"] | ["localhost:*"] | restricted | domain only |
| `SCHEDULER_ENABLED` | True | True | True | True |
| `CHECK_INTERVAL_MINUTES` | 30 | 5 | 15 | 30 |

## Database

### Development (SQLite)
```bash
# Database is created automatically
export ENVIRONMENT=development
python -m uvicorn app.main:app --reload

# Database file: uptime.db
```

### Staging/Production (PostgreSQL)
Create database first:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE uptime_checker;

# Set environment variable
export DATABASE_URL=postgresql://user:password@localhost:5432/uptime_checker
```

## Settings Management

### Accessing Settings

```python
from app.core.settings import settings

# Check environment
if settings.is_production:
    # Production-only logic
    pass

# Access settings
print(settings.ENVIRONMENT)
print(settings.DATABASE_URL)
print(settings.SECRET_KEY)
```

### Adding New Settings

1. Add to `app/core/settings.py`:
```python
class Settings(BaseSettings):
    MY_NEW_SETTING: str = "default_value"
```

2. Add to `.env.{environment}` files:
```
MY_NEW_SETTING=my_value
```

3. Use in code:
```python
from app.core.settings import settings
value = settings.MY_NEW_SETTING
```

## Testing

### Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test
pytest tests/test_auth.py::test_login -v
```

### Test Configuration

Tests use development environment by default:
```bash
export ENVIRONMENT=development
export DATABASE_URL=sqlite:///./test.db
pytest tests/ -v
```

## Troubleshooting

### ModuleNotFoundError: No module named 'app'

**Solution:** Run from backend directory with proper path:
```bash
cd backend
export PYTHONPATH=${PWD}
python -m uvicorn app.main:app --reload
```

### Environment Variables Not Loading

**Check:**
1. Variable is in correct `.env.{environment}` file
2. `ENVIRONMENT` variable is set: `echo $ENVIRONMENT`
3. Restart server after changing environment

**Debug:**
```python
# Add to app/main.py temporarily
from app.core.settings import settings
print(f"Environment: {settings.ENVIRONMENT}")
print(f"Debug: {settings.DEBUG}")
print(f"Database: {settings.DATABASE_URL}")
```

### Database Connection Error

**For PostgreSQL:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL format: `postgresql://user:password@host:5432/dbname`
3. Verify database exists
4. Test connection: `psql -U user -h host -d dbname`

**For SQLite:**
1. Check database file exists: `ls -la uptime.db`
2. Verify write permissions: `touch uptime.db`

### Port Already in Use

**Solution:**
```bash
# Use different port
python -m uvicorn app.main:app --reload --port 8001

# Or kill existing process
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# On macOS/Linux:
lsof -i :8000
kill -9 <pid>
```

## Production Deployment

See [CI_CD_SETUP.md](../CI_CD_SETUP.md) for automated deployment via GitHub Actions and Render.

### Manual Deployment

```bash
# 1. Build Docker image
docker build -t uptime-checker:latest .

# 2. Set environment variables
export ENVIRONMENT=production
export SECRET_KEY=your-secret-key
export DATABASE_URL=postgresql://...

# 3. Run container
docker run -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e SECRET_KEY=$SECRET_KEY \
  -e DATABASE_URL=$DATABASE_URL \
  uptime-checker:latest
```

## Performance Tips

1. **Use PostgreSQL in production** (not SQLite)
2. **Enable caching** for static assets
3. **Set appropriate check intervals** based on load
4. **Monitor scheduler tasks** for performance
5. **Use connection pooling** for database
6. **Enable CORS** only for trusted domains

## Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Restrict `CORS_ORIGINS` to your domain
- [ ] Use PostgreSQL (not SQLite) in production
- [ ] Enable HTTPS/SSL in production
- [ ] Rotate API keys regularly
- [ ] Never commit real secrets to git
- [ ] Use GitHub Secrets for sensitive values
- [ ] Audit database access permissions

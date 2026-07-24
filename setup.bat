@echo off
REM Setup script for PulseCheck development environment on Windows

echo.
echo ================================
echo  PulseCheck Setup Script
echo ================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/6] Creating Python virtual environment...
cd backend
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/6] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

echo [3/6] Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/6] Setting up .env file...
if not exist ".env" (
    copy .env.development .env
    echo Created .env file from .env.development
) else (
    echo .env file already exists, skipping...
)

echo [5/6] Testing database connection...
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine); print('Database initialized successfully')"
if errorlevel 1 (
    echo ERROR: Failed to initialize database
    pause
    exit /b 1
)

cd ..
echo [6/6] Setting up frontend...
if exist "frontend\node_modules" (
    echo Node modules already installed, skipping...
) else (
    if not exist node.exe (
        echo.
        echo WARNING: Node.js is not installed
        echo Please install Node.js 18+ from https://nodejs.org/
        echo Then run: cd frontend && npm install
    ) else (
        cd frontend
        npm install
        if errorlevel 1 (
            echo ERROR: Failed to install frontend dependencies
            pause
            exit /b 1
        )
        cd ..
    )
)

echo.
echo ================================
echo  Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Backend development:
echo    cd backend
echo    venv\Scripts\activate
echo    python -m uvicorn app.main:app --reload
echo.
echo 2. Frontend development (in another terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 3. View API documentation:
echo    http://localhost:8000/docs
echo.
echo 4. View frontend:
echo    http://localhost:5173
echo.
echo For more information, see:
echo    - CI_CD_SETUP.md (for production deployment)
echo    - backend/README_ENVIRONMENT.md (for environment configuration)
echo.
pause

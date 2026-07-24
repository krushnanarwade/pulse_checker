#!/bin/bash

# Setup script for PulseCheck development environment on macOS/Linux

echo ""
echo "================================"
echo "  PulseCheck Setup Script"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.11+ from https://www.python.org/"
    exit 1
fi

echo "[1/6] Creating Python virtual environment..."
cd backend
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo "[2/6] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to activate virtual environment"
    exit 1
fi

echo "[3/6] Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo "[4/6] Setting up .env file..."
if [ ! -f ".env" ]; then
    cp .env.development .env
    echo "Created .env file from .env.development"
else
    echo ".env file already exists, skipping..."
fi

echo "[5/6] Testing database connection..."
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine); print('Database initialized successfully')"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to initialize database"
    exit 1
fi

cd ..

echo "[6/6] Setting up frontend..."
if [ -d "frontend/node_modules" ]; then
    echo "Node modules already installed, skipping..."
else if ! command -v node &> /dev/null; then
        echo ""
        echo "WARNING: Node.js is not installed"
        echo "Please install Node.js 18+ from https://nodejs.org/"
        echo "Then run: cd frontend && npm install"
    else
        cd frontend
        npm install
        if [ $? -ne 0 ]; then
            echo "ERROR: Failed to install frontend dependencies"
            exit 1
        fi
        cd ..
    fi
fi

echo ""
echo "================================"
echo "  Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Backend development:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m uvicorn app.main:app --reload"
echo ""
echo "2. Frontend development (in another terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. View API documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "4. View frontend:"
echo "   http://localhost:5173"
echo ""
echo "For more information, see:"
echo "   - CI_CD_SETUP.md (for production deployment)"
echo "   - backend/README_ENVIRONMENT.md (for environment configuration)"
echo ""

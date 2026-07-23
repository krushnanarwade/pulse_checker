# PulseCheck - Automated Website Uptime & Link Checker

![PulseCheck Banner](https://img.shields.io/badge/FastAPI-0.109-009688.svg?style=flat&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat&logo=python)
![BeautifulSoup](https://img.shields.io/badge/BeautifulSoup-4.12-4169E1.svg?style=flat)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg?style=flat&logo=react)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?style=flat&logo=docker)

## 📌 Problem & Solution Overview

**Problem**: Companies frequently lose customers or drop SEO search rankings due to silent website outages, broken navigation buttons, dead external partner links, or 404 error pages that remain unnoticed until a client complains.

**Solution**: **PulseCheck** is a full-stack, production-ready Automated Website Uptime & Link Audit engine. It periodically pings company website URLs, measures HTTP latency, parses HTML documents with `BeautifulSoup` to extract and verify all page links (`<a>`), flags 404/500/timeout errors, and dispatches instant webhook alerts to Slack or Discord.

---

## ⚡ Core Features

- 🟢 **Automated Periodic Pings**: APScheduler background tasks run recurring uptime checks with zero loop blocking.
- 🔍 **BeautifulSoup Link Audit Engine**: Extracts anchor tags, normalizes relative URLs (`urllib.parse.urljoin`), and concurrently tests target URLs for dead endpoints (404, 500, timeouts, SSL errors).
- 📊 **Interactive Dashboard & Latency Sparkline**: Real-time response time metrics, SLO status indicators, and broken link inspection breakdown.
- 🔐 **JWT Authentication & Security**: Password hashing via `bcrypt` and bearer token protected endpoints.
- 🔔 **Custom Webhook Alerts**: Send real-time JSON alert payloads to Slack / Discord / PagerDuty when an endpoint goes down or broken links are flagged.
- 🐳 **Docker Compose Orchestration**: Multi-container setup with Python FastAPI backend and Vite React Nginx frontend.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy, BeautifulSoup4, Pydantic, APScheduler, Requests |
| **Frontend** | React 18, Vite, Glassmorphic Vanilla CSS system, Lucide Icons |
| **Database** | SQLite (Production-ready, easily swappable with PostgreSQL) |
| **DevOps & CI** | Docker, Docker Compose, Nginx, GitHub Actions |

---

## 🚀 Quick Setup & Installation

### Option A: Local Development

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API will be accessible at: `http://localhost:8000`  
Swagger API Docs available at: `http://localhost:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Dashboard will be accessible at: `http://localhost:3000`

#### Windows Example (Exact Paths Used)
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 0.0.0.0 --port 8000

cd ..\frontend
"C:\Program Files\nodejs\npm.cmd" install
"C:\Program Files\nodejs\npm.cmd" run dev
```

### Option B: Docker Compose (One-Command Deployment)

```bash
docker-compose up --build
```
Access the application at `http://localhost`.

---

## 🧪 Running Unit Tests

```bash
cd backend
pytest
```

---

## 📄 License

MIT License. Designed & Built for production-ready reliability.

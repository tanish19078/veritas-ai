# Deployment Guide

## Recommended Demo Deployment

Use Docker Compose for the most reliable local or VPS demo:

```powershell
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

This keeps OpenCV, uploads, generated ELA files, and SQLite history in a predictable environment.

## Manual Local Run

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Vercel Note

The frontend can be deployed on Vercel, but the backend uses OpenCV and local file storage for uploads/ELA output. For a complete cloud deployment, host the backend separately on a container platform such as Render, Railway, Fly.io, or a VPS, then set:

```text
NEXT_PUBLIC_API_URL=https://your-backend.example.com
```

## Production Hardening

- Replace SQLite with Postgres.
- Store uploads and ELA images in object storage.
- Add authentication/rate limiting before public deployment.
- Move heavy model inference into a worker queue.
- Use trained and calibrated detectors before making real forensic claims.

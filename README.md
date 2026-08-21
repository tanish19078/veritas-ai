# Veritas AI

Veritas AI is a full-stack deepfake forensics demo for inspecting images and videos with a transparent, multi-layer analysis pipeline. It combines metadata checks, face/biology heuristics, frequency-domain analysis, lightweight AI-artifact statistics, physics cues, signature detection, and Error Level Analysis (ELA).

The project is designed as a strong portfolio/demo project, not as courtroom-grade forensic evidence. The current detectors are deterministic heuristics that explain their signals and leave room for trained model upgrades.

## Features

- FastAPI backend with upload analysis and scan history.
- Next.js dashboard with batch uploads, result cards, radar charts, score breakdowns, ELA preview, and CSV export.
- SQLite audit/history table through SQLAlchemy.
- Docker Compose setup for local full-stack runs.
- Optional C2PA integration path for signed-media provenance.

## Project Structure

```text
deepfake_forensics/
  backend/
    app/
      api/endpoints.py
      core/orchestrator.py
      layers/
    requirements.txt
  frontend/
    src/components/Dashboard.tsx
    src/pages/
    .env.example
  docker-compose.yml
```

## Quick Start

### Backend

```powershell
cd deepfake_forensics\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

Use a standard python.org or Conda Python distribution for local installs. MSYS Python may try to compile packages such as NumPy from source; Docker avoids that toolchain issue.

### Frontend

```powershell
cd deepfake_forensics\frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The dashboard runs at `http://localhost:3000`.

## API

- `POST /api/v1/analyze` accepts one image or video upload.
- `GET /api/v1/history` returns recent scan records.
- `/uploads/...` serves generated ELA images.

## Detection Layers

1. Metadata and provenance: EXIF count, MIME type, editing signatures, optional C2PA.
2. Biological signals: face detection and rPPG-style temporal variance for videos.
3. Mathematical forensics: FFT, DCT block artifacts, and RGB residual consistency.
4. AI artifact heuristic: blur, entropy, and color-channel statistics.
5. Physics and lighting: global lighting-gradient consistency.
6. Early AI signatures: high-frequency periodic FFT peaks.
7. ELA: compression-difference visualization and weak supporting score.

## Docker

```powershell
cd deepfake_forensics
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8000`

## Roadmap

- Replace heuristic Layer 4 with a trained detector and calibration set.
- Add a real rPPG implementation with heart-rate band validation.
- Move long-running inference to a worker queue.
- Replace SQLite with Postgres for persistent cloud deployments.
- Add automated API tests with sample media fixtures.

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
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

Use a standard python.org or Conda Python distribution for local installs. MSYS Python may try to compile packages such as NumPy from source; Docker avoids that toolchain issue.

### Frontend

```powershell
cd frontend
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

1. Metadata and provenance: EXIF count, MIME type, editing signatures, real C2PA verification via `c2pa-python`.
2. Biological signals: CHROM rPPG with cardiac-band FFT (0.7-4 Hz), BPM estimate, and pulse waveform for videos.
3. Mathematical forensics: FFT, DCT block artifacts, and RGB residual consistency (configurable thresholds).
4. AI artifact detection: optional pretrained Hugging Face detector (`LAYER4_MODE=auto|pretrained|heuristic`) with a deterministic blur/entropy/color heuristic fallback.
5. Physics and lighting: quadrant lighting-gradient consistency plus eye-glint symmetry inside detected faces.
6. Early AI signatures: high-frequency periodic FFT peaks (calibration knobs configurable).
7. ELA: compression-difference visualization and weak supporting score.

Layers that cannot judge the media (e.g., no face in a video) abstain instead of voting "Real"; the orchestrator re-normalizes weights over active layers only.

## Configuration

Backend environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `LAYER4_MODE` | `auto` | `pretrained`, `heuristic`, or `auto` (pretrained when available). Docker defaults to heuristic-only. |
| `LAYER4_MODEL_NAME` | `umm-maybe/AI-image-detector` | Any Hugging Face image-classification model. |
| `L3_FFT_THRESHOLD` / `L3_DCT_THRESHOLD` / `L3_CFA_THRESHOLD` | `0.7` / `0.6` / `0.8` | Layer 3 anomaly thresholds. |
| `L6_HIGH_FREQ_DIVISOR` / `L6_PEAK_DIVISOR` / `L6_ANOMALY_THRESHOLD` | `200` / `100` / `0.6` | Layer 6 sensitivity knobs. |

Frontend: set `NEXT_PUBLIC_API_URL` in `.env.local` (see `.env.example`).

Optional heavy extras live in `backend/requirements-optional.txt` (`torch`, `transformers`, `c2pa-python`).

## Docker

```powershell
docker compose up --build
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:8000`

## Roadmap

- Calibrate Layer 3/6 thresholds against labeled datasets (GenImage, FaceForensics++).
- Move long-running inference to a worker queue.
- Replace SQLite with Postgres for persistent cloud deployments.
- Real-time webcam rPPG mode in the dashboard.

## Tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt pytest httpx
python -m pytest tests -v
```

# Veritas AI Technical Notes

Veritas AI is a modular deepfake-forensics application. The backend is a FastAPI service that runs media through independent analysis layers, and the frontend is a Next.js dashboard for upload, review, visualization, and export.

## Architecture

```text
Browser Dashboard
  -> POST /api/v1/analyze
  -> FastAPI upload handler
  -> ForensicsOrchestrator
  -> Layer analyzers
  -> SQLite history log
  -> JSON response + ELA image URL
```

## Backend

- `app/main.py`: FastAPI app, CORS, static upload serving, API router.
- `app/api/endpoints.py`: upload validation, file storage, analysis endpoint, history endpoint.
- `app/core/orchestrator.py`: coordinates layers, aggregates weighted scores, builds verdicts and explanations.
- `app/core/database.py`: SQLite connection and SQLAlchemy session management.
- `app/models.py`: analysis history table.

## Frontend

- `src/components/Dashboard.tsx`: upload workflow, history panel, results, charts, ELA toggle, CSV export.
- `src/pages/index.tsx`: dashboard route.
- `src/pages/docs.tsx`: explanatory documentation page.

The frontend reads `NEXT_PUBLIC_API_URL`; copy `.env.example` to `.env.local` for local development.

## Layer Summary

| Layer | Implementation | Notes |
| --- | --- | --- |
| Metadata | MIME, EXIF count, editing signatures, optional C2PA | Good weak signal, not decisive alone |
| Biology | Haar face detection and green-channel variance | Works best for videos with visible faces |
| Math | FFT, DCT blockiness, RGB residual consistency | Heuristic, useful for artifact inspection |
| AI artifacts | Blur, entropy, color-channel statistics | Lightweight replacement until a trained model is added |
| Physics | Lighting-gradient consistency | Weak signal, scene-dependent |
| Signature | FFT peak detection | Looks for periodic high-frequency artifacts |
| ELA | JPEG resave difference image | Best used visually, not as a primary score |

## Local Development

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Use python.org or Conda Python for local installs. If your shell points at MSYS Python, prefer Docker because scientific packages may build from source.

Frontend:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

## Optional C2PA

For signed-media provenance checks:

```powershell
cd backend
pip install -r requirements-optional.txt
```

If `c2pa-python` is unavailable, the metadata layer still runs and reports that C2PA verification is disabled.

## Production Notes

- SQLite is fine for local demos, but use Postgres for cloud persistence.
- Uploaded media and generated ELA images are stored in `backend/uploads`.
- The current detection logic is explainable and deterministic, but it is not a substitute for trained, calibrated forensic models.

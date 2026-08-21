@echo off
echo Starting Veritas AI...

:: Start Backend
start cmd /k "cd backend && venv\Scripts\activate && python -m uvicorn app.main:app --reload"

:: Start Frontend
start cmd /k "cd frontend && npm run dev"

echo System started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause

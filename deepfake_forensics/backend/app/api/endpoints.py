from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Any, List
import shutil
import os
import uuid
from app.core.orchestrator import ForensicsOrchestrator
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import AnalysisLog

router = APIRouter()
orchestrator = ForensicsOrchestrator()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/analyze", response_model=Any)
async def analyze_media(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Upload an image or video for deepfake analysis.
    """
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Run analysis
        results = orchestrator.analyze_media(file_path)
        
        # Save to DB
        db_log = AnalysisLog(
            filename=file.filename,
            media_type="video" if file_ext.lower() in ['.mp4', '.avi', '.mov'] else "image",
            verdict=results["verdict"],
            confidence=results["confidence"],
            layer_scores=results["layer_scores"]
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        
        return results
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[Any])
def get_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    logs = db.query(AnalysisLog).order_by(AnalysisLog.timestamp.desc()).offset(skip).limit(limit).all()
    return logs

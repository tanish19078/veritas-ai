from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    media_type = Column(String) # 'image' or 'video'
    verdict = Column(String)
    confidence = Column(Float)
    layer_scores = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

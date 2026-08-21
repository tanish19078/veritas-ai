from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict


class AnalysisLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    media_type: Optional[str] = None
    verdict: Optional[str] = None
    confidence: Optional[float] = None
    layer_scores: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None

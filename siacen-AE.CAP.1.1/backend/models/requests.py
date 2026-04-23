from pydantic import BaseModel, validator
from typing import Optional
from .diagnosis import DiseaseDetection
from .sources import SourceReference


class AnalyzeRequest(BaseModel):
    """
    What the frontend sends when farmer
    uploads a leaf photo
    """
    image_data: str
    image_type: str = "image/jpeg"
    plant_type: Optional[str] = None
    personality: str = "friendly"
    selected_model: str = "gpt-4o"

    @validator("personality")
    def validate_personality(cls, v):
        allowed = ["formal", "friendly", "concise"]
        if v not in allowed:
            raise ValueError(
                f"Personality must be one of {allowed}"
            )
        return v

    @validator("selected_model")
    def validate_model(cls, v):
        allowed = [
            "gpt-4o",
            "gpt-4-turbo",
            "claude-3-opus"
        ]
        if v not in allowed:
            raise ValueError(
                f"Model must be one of {allowed}"
            )
        return v


class AnalyzeResponse(BaseModel):
    """
    What the backend sends back to the frontend
    after the LangGraph agent finishes
    """
    diagnosis: DiseaseDetection
    sources: list[SourceReference] = []
    confidence_level: str = "medium"
    fallback_triggered: bool = False
    tokens_used: Optional[int] = None
    cost_usd: Optional[float] = None
    session_id: Optional[str] = None
    diagnosis_id: Optional[str] = None  



class HealthCheck(BaseModel):
    """Response for GET /health endpoint"""
    status: str = "ok"
    version: str = "1.0.0"
    environment: str


class TokenUsageResponse(BaseModel):
    """Response for GET /token-usage endpoint"""
    total_tokens: int
    total_cost_usd: float
    requests_made: int
    average_tokens_per_request: float
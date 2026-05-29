# backend/models/requests.py
# UPDATED VERSION — adds language field to AnalyzeRequest
"""
Request and response models for CropGuard AI API.
"""

from pydantic import BaseModel, validator, EmailStr, Field
from typing import Optional
from .diagnosis import DiseaseDetection
from .sources import SourceReference


class AnalyzeRequest(BaseModel):
    """
    What the frontend sends when farmer uploads a leaf photo.
    """
    image_data:     str
    image_type:     str           = "image/jpeg"
    plant_type:     Optional[str] = None
    personality:    str           = "friendly"
    selected_model: str           = "gpt-4o"
    language:       str           = "English"   # ← NEW FIELD

    @validator("personality")
    def validate_personality(cls, v):
        allowed = ["formal", "friendly", "concise"]
        if v not in allowed:
            raise ValueError(f"Personality must be one of {allowed}")
        return v

    @validator("selected_model")
    def validate_model(cls, v):
        allowed = [
            "gpt-4o", "gpt-4-turbo",
            "claude-3-opus", "claude-3-sonnet",
            "gemini-1.5-pro", "gemini-1.5-flash",
        ]
        if v not in allowed:
            raise ValueError(f"Model must be one of {allowed}")
        return v

    @validator("language")
    def validate_language(cls, v):
        allowed = ["English", "Swahili", "French", "Luganda", "Runyankole"]
        if v not in allowed:
            return "English"   # graceful fallback
        return v


class AnalyzeResponse(BaseModel):
    """
    What the backend sends back after the LangGraph agent finishes.
    """
    diagnosis:          DiseaseDetection
    sources:            list[SourceReference] = []
    confidence_level:   str                  = "medium"
    fallback_triggered: bool                 = False
    tokens_used:        Optional[int]        = None
    cost_usd:           Optional[float]      = None
    session_id:         Optional[str]        = None
    diagnosis_id:       Optional[str]        = None
    language:           str                  = "English"  # ← NEW


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class SignupRequest(BaseModel):
    email:     EmailStr
    password:  str = Field(..., min_length=8,  max_length=128)
    full_name: str = Field(..., min_length=1,  max_length=200)


class HealthCheck(BaseModel):
    status:      str = "ok"
    version:     str = "1.0.0"
    environment: str


class TokenUsageResponse(BaseModel):
    total_tokens:               int
    total_cost_usd:             float
    requests_made:              int
    average_tokens_per_request: float

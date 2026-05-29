# Defines all disease diagnosis related data shapes

from pydantic import BaseModel, Field, validator
from typing import Optional
from enum import Enum


class HealthStatus(str, Enum):
    """Overall health status of the plant"""
    healthy = "healthy"
    diseased = "diseased"
    stressed = "stressed"
    uncertain = "uncertain"


class Severity(str, Enum):
    """How severe the disease is"""
    none = "none"
    mild = "mild"
    moderate = "moderate"
    severe = "severe"


class Urgency(str, Enum):
    """How urgently the farmer needs to act"""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class TreatmentType(str, Enum):
    """Category of treatment recommended"""
    immediate = "immediate"
    organic = "organic"
    chemical = "chemical"
    preventive = "preventive"


class Treatment(BaseModel):
    """A single treatment recommendation"""
    type: TreatmentType
    action: str           # short title e.g. "Apply copper fungicide"
    details: str          # full instructions for the farmer


class DiagnosisDetail(BaseModel):
    """Details about the identified disease"""
    name: str                           # e.g. "Early Blight"
    scientific_name: Optional[str] = None  # e.g. "Alternaria solani"
    severity: Severity
    description: str                    # 2-3 sentence description


class DiseaseDetection(BaseModel):
    """
    Complete diagnosis result returned by the agent.
    This is the main model that flows through the 
    entire LangGraph pipeline.
    """
    plant_identified: str
    health_status: HealthStatus
    confidence_score: float = Field(ge=0.0, le=100.0)
    diagnosis: DiagnosisDetail
    causes: list[str] = []          # ← add default
    symptoms: list[str] = []        # ← add default
    treatments: list[Treatment] = []      # ← add default
    prevention_tips: list[str] = []       # ← add default
    urgency: Urgency
    farmer_advice: str  # one plain language sentence for farmer

    @validator("confidence_score")
    def round_confidence(cls, v):
        return round(v, 2)

    @validator("health_status", pre=True)
    def lowercase_status(cls, v):
        return v.lower() if isinstance(v, str) else v

    @validator("urgency", pre=True)
    def lowercase_urgency(cls, v):
        return v.lower() if isinstance(v, str) else v
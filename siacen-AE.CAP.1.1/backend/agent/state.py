# backend/agent/state.py
"""
LangGraph AgentState — extended to support:
  - Separate crop identification step with confidence gating
  - Top-3 differential diagnoses
  - Consistency check results
  - Calibrated confidence score
  - Abiotic/nutrient disorder fields
"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from models.diagnosis import DiseaseDetection
from models.sources import SourceReference


class AgentState(BaseModel):

    # ── Input ──────────────────────────────────────────────────────────
    image_data:     str
    image_type:     str = "image/jpeg"
    plant_type:     Optional[str] = None   # farmer hint
    personality:    str = "friendly"
    selected_model: str = "gpt-4o"
    user_id:        Optional[str] = None
    session_id:     Optional[str] = None
    location:       Optional[str] = None

    # ── Memory ─────────────────────────────────────────────────────────
    past_diagnoses:  list[dict] = Field(default_factory=list)
    history_summary: Optional[str] = None

    # ── Weather ────────────────────────────────────────────────────────
    weather_data: Optional[dict] = None

    # ── Crop Identification (NEW — separate gated step) ────────────────
    crop_identified:          Optional[str] = None   # e.g. "coffee", "tea"
    crop_confidence:          Optional[int] = None   # 0-100
    crop_needs_confirmation:  bool = False            # True if conf < 60
    symptom_description:      Optional[str] = None   # pure symptom text, no disease names

    # ── RAG ────────────────────────────────────────────────────────────
    retrieved_sources:  list[SourceReference] = Field(default_factory=list)
    rag_query:          Optional[str] = None
    fallback_triggered: bool = False

    # ── Differential Diagnosis (NEW — top 3) ──────────────────────────
    differential_diagnoses: list[dict] = Field(default_factory=list)
    # Each dict: {rank, name, category, probability, scientific_name,
    #             severity, supporting_evidence, against_evidence,
    #             description, requires_lab_confirmation}

    # ── Consistency Check (NEW) ────────────────────────────────────────
    consistency_warnings:  list[str] = Field(default_factory=list)
    consistency_penalty:   int = 0

    # ── Primary Diagnosis (built from differential rank-1) ────────────
    diagnosis: Optional[DiseaseDetection] = None

    # ── Calibrated Confidence (NEW — replaces GPT self-report) ────────
    calibrated_confidence: Optional[float] = None

    # ── Treatments / Prevention ────────────────────────────────────────
    treatments:      list[dict] = Field(default_factory=list)
    prevention_tips: list[str]  = Field(default_factory=list)

    # ── Output ─────────────────────────────────────────────────────────
    final_response: Optional[dict] = None
    diagnosis_id:   Optional[str]  = None
    tokens_used:    int   = 0
    cost_usd:       float = 0.0

    # ── Error ──────────────────────────────────────────────────────────
    error:      Optional[str] = None
    error_node: Optional[str] = None

    class Config:
        arbitrary_types_allowed = True
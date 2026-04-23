# backend/agent/state.py
"""
LangGraph-native AgentState using TypedDict + Annotated reducers.

Reducer decisions (explained inline):
  operator.add  → lists written by multiple nodes OR across retries
  _replace      → lists owned by exactly one node (overwrite semantics)
  (none)        → scalars and dicts; last-write-wins is correct

Compatibility shim:
  DiseaseDetection and SourceReference are kept as Pydantic models
  because they are deeply referenced throughout nodes.py via .dict(),
  .copy(update={}), and attribute access. They are NOT stored in
  checkpointed state fields — diagnosis is stored as Optional[dict]
  after serialisation. See `diagnosis_obj` note in nodes.py.
"""

from __future__ import annotations

import operator
from typing import Annotated, Any, Optional, TypedDict

# DiseaseDetection and SourceReference remain Pydantic models —
# they are used as value objects inside nodes, not as state field types.
# State stores them serialised as dicts where persistence is needed.
from models.diagnosis import DiseaseDetection
from models.sources import SourceReference


# ---------------------------------------------------------------------------
# Reducer: explicit replace (last-write-wins for list fields)
# ---------------------------------------------------------------------------

def _replace(existing: Any, new: Any) -> Any:
    """
    Explicit last-write-wins for list fields owned by a single node.
    Using this instead of the implicit default makes parallelisation-safe
    intent clear and prevents accidental accumulation on graph replay.
    """
    return new


# ---------------------------------------------------------------------------
# AgentState
# ---------------------------------------------------------------------------

class AgentState(TypedDict, total=False):
    """
    LangGraph state for the CropGuard AI 11-node pipeline.

    Field-by-field reducer rationale
    ─────────────────────────────────
    past_diagnoses        operator.add   Written once by load_memory.
                                         Using add is safe and future-proofs
                                         against parallel memory shards.

    consistency_warnings  operator.add   Written by BOTH run_consistency_check
                                         AND treatment_path (post-generation
                                         check). Must accumulate, not overwrite.

    retrieved_sources     _replace       Written once by lookup_disease_node.
                                         RAG does not run in parallel here.
                                         _replace prevents double-append on retry.

    differential_diagnoses _replace      Written once by detect_disease.
                                         The full top-3 list is produced in one
                                         LLM call — accumulation is wrong.

    treatments            _replace       Written once by treatment_path.
    prevention_tips       _replace       Written once by healthy_path.

    tokens_used           (none)         Each node reads the current total and
    cost_usd              (none)         adds its increment:
                                           state["tokens_used"] + new_tokens
                                         operator.add on integers would
                                         DOUBLE-COUNT because the node already
                                         embeds the running total. Last-write-
                                         wins is the only correct semantic here.

    diagnosis             (none)         Single Pydantic object (or None).
                                         Overwritten by detect_disease, then
                                         updated by run_consistency_check.
                                         No accumulation needed.

    All other scalar/dict/bool fields: last-write-wins (no reducer).
    """

    # ── Input ──────────────────────────────────────────────────────────
    image_data:     Optional[str]         # base64 string, not bytes
    image_type:     Optional[str]         # "image/jpeg" | "image/png"
    plant_type:     Optional[str]         # farmer hint
    personality:    Optional[str]         # "friendly" | "technical" | …
    selected_model: Optional[str]         # "gpt-4o" | …
    user_id:        Optional[str]
    session_id:     Optional[str]
    location:       Optional[str]

    # ── Memory ─────────────────────────────────────────────────────────
    # operator.add: safe against future parallel memory shards
    past_diagnoses:  Annotated[list[dict], operator.add]
    history_summary: Optional[str]

    # ── Weather ────────────────────────────────────────────────────────
    weather_data: Optional[dict]

    # ── Crop Identification ────────────────────────────────────────────
    crop_identified:         Optional[str]   # e.g. "coffee", "general"
    crop_confidence:         Optional[int]   # 0–100
    crop_needs_confirmation: Optional[bool]  # True if confidence < 60
    symptom_description:     Optional[str]   # pure symptom text

    # ── RAG ────────────────────────────────────────────────────────────
    # _replace: lookup_disease_node owns this entirely; one write per run
    retrieved_sources:  Annotated[list[SourceReference], _replace]
    rag_query:          Optional[str]
    fallback_triggered: Optional[bool]

    # ── Differential Diagnosis ─────────────────────────────────────────
    # _replace: produced in one LLM call by detect_disease
    differential_diagnoses: Annotated[list[dict], _replace]

    # ── Consistency Check ──────────────────────────────────────────────
    # operator.add: written by run_consistency_check AND treatment_path
    consistency_warnings:  Annotated[list[str], operator.add]
    consistency_penalty:   Optional[int]

    # ── Primary Diagnosis ──────────────────────────────────────────────
    # Stored as the Pydantic object during graph execution.
    # If checkpoint persistence is needed, serialise to dict in save_memory.
    diagnosis:             Optional[DiseaseDetection]

    # ── Calibrated Confidence ──────────────────────────────────────────
    calibrated_confidence: Optional[float]

    # ── Treatments / Prevention ────────────────────────────────────────
    # _replace: each is owned by exactly one node
    treatments:      Annotated[list[dict], _replace]
    prevention_tips: Annotated[list[str], _replace]

    # ── Output ─────────────────────────────────────────────────────────
    final_response: Optional[dict]
    diagnosis_id:   Optional[str]

    # ── Token / Cost tracking ──────────────────────────────────────────
    # NO reducer. Each node does: state["tokens_used"] + new_tokens
    # operator.add would double-count the accumulated total.
    tokens_used: Optional[int]
    cost_usd:    Optional[float]

    # ── Error ──────────────────────────────────────────────────────────
    error:      Optional[str]
    error_node: Optional[str]


# ---------------------------------------------------------------------------
# Factory — always use this at graph entry points
# ---------------------------------------------------------------------------

def make_initial_state(
    image_data:     str,
    image_type:     str  = "image/jpeg",
    plant_type:     Optional[str] = None,
    personality:    str  = "friendly",
    selected_model: str  = "gpt-4o",
    user_id:        Optional[str] = None,
    session_id:     Optional[str] = None,
    location:       Optional[str] = None,
) -> AgentState:
    """
    Return a fully-initialised AgentState dict.

    All Annotated[list, reducer] fields are seeded as [] so that
    reducers never receive None as their left-hand operand.
    Scalar fields match the original Pydantic defaults exactly.
    """
    return AgentState(
        image_data=image_data,
        image_type=image_type,
        plant_type=plant_type,
        personality=personality,
        selected_model=selected_model,
        user_id=user_id,
        session_id=session_id,
        location=location,
        # Memory
        past_diagnoses=[],
        history_summary=None,
        # Weather
        weather_data=None,
        # Crop
        crop_identified=None,
        crop_confidence=None,
        crop_needs_confirmation=False,
        symptom_description=None,
        # RAG
        retrieved_sources=[],
        rag_query=None,
        fallback_triggered=False,
        # Diagnosis
        differential_diagnoses=[],
        consistency_warnings=[],
        consistency_penalty=0,
        diagnosis=None,
        calibrated_confidence=None,
        # Treatments
        treatments=[],
        prevention_tips=[],
        # Output
        final_response=None,
        diagnosis_id=None,
        tokens_used=0,
        cost_usd=0.0,
        # Error
        error=None,
        error_node=None,
    )
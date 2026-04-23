# backend/agent/edges.py

"""
LangGraph conditional edge functions — FIXED.

IMPORTANT:
Routers MUST return LABELS, not node names.
"""

import logging
from typing import Literal
from agent.state import AgentState

logger = logging.getLogger(__name__)


def _get(state, key, default=None):
    if isinstance(state, dict):
        return state.get(key, default)
    return getattr(state, key, default)


# ─────────────────────────────────────────────
# 1. After Validation
# ─────────────────────────────────────────────

def route_after_validation(state: AgentState) -> Literal["error", "continue"]:
    if _get(state, "error"):
        logger.warning(f"Routing to error: {_get(state, 'error')}")
        return "error"

    return "continue"


# ─────────────────────────────────────────────
# 2. After Crop Identification
# ─────────────────────────────────────────────

def route_after_crop_id(state: AgentState) -> Literal["continue", "needs_confirmation"]:
    if _get(state, "error"):
        return "needs_confirmation"

    if _get(state, "crop_needs_confirmation", False):
        logger.warning("Crop confidence too low — needs confirmation")
        return "needs_confirmation"

    return "continue"


# ─────────────────────────────────────────────
# 3. After RAG
# ─────────────────────────────────────────────

def route_after_rag(state: AgentState) -> Literal["fallback", "continue"]:
    if _get(state, "fallback_triggered", False):
        logger.warning("RAG fallback triggered")
        return "fallback"

    return "continue"


# ─────────────────────────────────────────────
# 4. After Detection
# ─────────────────────────────────────────────

def route_after_detection(state: AgentState) -> Literal["healthy", "diseased"]:
    if _get(state, "error"):
        logger.warning(f"Error after detection: {_get(state, 'error')}")
        return "diseased"  # safe fallback

    diagnosis = _get(state, "diagnosis")

    if not diagnosis:
        logger.warning("No diagnosis — treating as diseased fallback")
        return "diseased"

    # supports both dict + Pydantic
    if isinstance(diagnosis, dict):
        status = diagnosis.get("health_status", "diseased")
    else:
        status = getattr(diagnosis.health_status, "value", "diseased")

    logger.info(f"Routing after detection: health_status={status}")

    if status == "healthy":
        return "healthy"

    return "diseased"
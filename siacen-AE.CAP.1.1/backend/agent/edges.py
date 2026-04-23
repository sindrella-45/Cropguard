# backend/agent/edges.py
"""
LangGraph conditional edge functions — updated for new 11-node pipeline.
"""
import logging
from agent.state import AgentState

logger = logging.getLogger(__name__)


def route_after_validation(state: AgentState) -> str:
    if state.error:
        logger.warning(f"Routing to error: {state.error}")
        return "handle_error"
    return "load_memory"


def route_after_crop_id(state: AgentState) -> str:
    """
    After crop identification, always proceed to symptom description.
    crop_needs_confirmation is surfaced in the response but does not
    block the pipeline — we use 'general' as the fallback crop.
    """
    if state.error:
        return "handle_error"
    return "describe_symptoms"


def route_after_rag(state: AgentState) -> str:
    if state.fallback_triggered:
        logger.warning("RAG fallback triggered — insufficient knowledge base matches")
        return "handle_fallback"
    return "detect_disease"


def route_after_detection(state: AgentState) -> str:
    if state.error:
        logger.warning(f"Routing to error after detection: {state.error}")
        return "handle_error"
    if not state.diagnosis:
        logger.warning("No diagnosis produced — routing to error")
        return "handle_error"

    status = state.diagnosis.health_status.value
    logger.info(f"Routing after detection: health_status={status}")

    if status == "healthy":
        return "healthy_path"
    # diseased, stressed, uncertain — all go to treatment
    return "treatment_path"
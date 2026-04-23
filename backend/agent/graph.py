# backend/agent/graph.py

import logging
import uuid
from langgraph.graph import StateGraph, END

from agent.state import AgentState, make_initial_state

from agent.nodes import (
    validate_input, load_memory, fetch_weather,
    identify_crop, describe_symptoms,
    lookup_disease_node, detect_disease,
    run_consistency_check,
    healthy_path, treatment_path,
    format_response, save_memory,
)

from agent.edges import (
    route_after_validation,
    route_after_crop_id,
    route_after_rag,
    route_after_detection,
)

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def _get_field(state, field: str, default=None):
    if isinstance(state, dict):
        return state.get(field, default)
    return getattr(state, field, default)


# ─────────────────────────────────────────────────────────────
# Error / Fallback Handlers
# ─────────────────────────────────────────────────────────────

async def handle_error(state: AgentState) -> dict:
    error      = _get_field(state, "error", "Unknown error")
    error_node = _get_field(state, "error_node", "unknown")

    logger.error(f"Error in '{error_node}': {error}")

    return {
        "final_response": {
            "error": True,
            "message": error,
            "error_node": error_node,
            "diagnosis": None,
        }
    }


async def handle_fallback(state: AgentState) -> dict:
    logger.warning("RAG fallback — no confident knowledge base match")

    return {
        "final_response": {
            "error": False,
            "fallback_triggered": True,
            "fallback_message": "Low confidence in diagnosis. Please retake a clearer image.",
            "recommended_actions": [
                "Retake photo in good lighting",
                "Ensure the leaf fills the frame",
                "Consult an agricultural expert",
            ],
            "diagnosis": None,
        }
    }


# ─────────────────────────────────────────────────────────────
# Graph Builder (FIXED ✅)
# ─────────────────────────────────────────────────────────────

def build_graph_v2():
    graph = StateGraph(AgentState)

    # ── Nodes ────────────────────────────────────────────────
    graph.add_node("validate_input", validate_input)
    graph.add_node("load_memory", load_memory)
    graph.add_node("fetch_weather", fetch_weather)
    graph.add_node("identify_crop", identify_crop)
    graph.add_node("describe_symptoms", describe_symptoms)
    graph.add_node("lookup_disease", lookup_disease_node)
    graph.add_node("detect_disease", detect_disease)
    graph.add_node("consistency_check", run_consistency_check)
    graph.add_node("healthy_path", healthy_path)
    graph.add_node("treatment_path", treatment_path)
    graph.add_node("format_response", format_response)
    graph.add_node("save_memory", save_memory)

    # ── Entry Point ──────────────────────────────────────────
    graph.set_entry_point("validate_input")

    # ── Flow ─────────────────────────────────────────────────
    graph.add_conditional_edges(
        "validate_input",
        route_after_validation,
        {
            "error": "handle_error",
            "continue": "load_memory",
        },
    )

    graph.add_node("handle_error", handle_error)

    graph.add_edge("load_memory", "fetch_weather")
    graph.add_edge("fetch_weather", "identify_crop")

    graph.add_conditional_edges(
        "identify_crop",
        route_after_crop_id,
        {
            "continue": "describe_symptoms",
            "needs_confirmation": "handle_error",
        },
    )

    graph.add_edge("describe_symptoms", "lookup_disease")

    graph.add_conditional_edges(
        "lookup_disease",
        route_after_rag,
        {
            "fallback": "handle_fallback",
            "continue": "detect_disease",
        },
    )

    graph.add_node("handle_fallback", handle_fallback)

    graph.add_edge("detect_disease", "consistency_check")

    graph.add_conditional_edges(
        "consistency_check",
        route_after_detection,
        {
            "healthy": "healthy_path",
            "diseased": "treatment_path",
        },
    )

    graph.add_edge("healthy_path", "format_response")
    graph.add_edge("treatment_path", "format_response")

    graph.add_edge("format_response", "save_memory")
    graph.add_edge("save_memory", END)

    # 🚨 CRITICAL FIX
    return graph.compile()


# ─────────────────────────────────────────────────────────────
# Initialize Graph
# ─────────────────────────────────────────────────────────────

_graph = build_graph_v2()

if _graph is None:
    raise RuntimeError("Graph failed to build")


# ─────────────────────────────────────────────────────────────
# Run Agent
# ─────────────────────────────────────────────────────────────

async def run_agent(
    image_data: str,
    image_type: str = "image/jpeg",
    plant_type: str = None,
    personality: str = "friendly",
    selected_model: str = "gpt-4o",
    user_id: str = None,
    session_id: str = None,
    location: str = None,
) -> dict:

    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"Agent run: model={selected_model} session={session_id}")

    initial = make_initial_state(
        image_data=image_data,
        image_type=image_type,
        plant_type=plant_type,
        personality=personality,
        selected_model=selected_model,
        user_id=user_id,
        session_id=session_id,
        location=location,
    )

    try:
        final_state = await _graph.ainvoke(initial)

        tokens = _get_field(final_state, "tokens_used", 0)

        logger.info(f"Agent run complete: tokens={tokens} session={session_id}")

        final_response = _get_field(final_state, "final_response", None)

        if final_response is None:
            return {
                "error": True,
                "message": "Agent completed but produced no response.",
                "diagnosis": None,
            }

        if isinstance(final_response, dict) and "session_id" not in final_response:
            final_response["session_id"] = session_id

        return final_response

    except Exception as e:
        logger.error(f"Agent run failed: {e}", exc_info=True)

        return {
            "error": True,
            "message": "Unexpected error. Please try again.",
            "diagnosis": None,
        }
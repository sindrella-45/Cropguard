# backend/agent/graph.py
"""
LangGraph workflow — updated for 11-node pipeline with:
  - Separate crop ID node (gated)
  - Separate symptom description node
  - Consistency check node
  - Differential top-3 diagnosis
"""
import logging
import uuid
from langgraph.graph import StateGraph, END
from agent.state import AgentState
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


def _get_field(state, field: str, default=None):
    if isinstance(state, dict):
        return state.get(field, default)
    return getattr(state, field, default)


async def handle_error(state: AgentState) -> dict:
    error     = _get_field(state, "error", "Unknown error")
    error_node = _get_field(state, "error_node", "unknown")
    logger.error(f"Error in '{error_node}': {error}")
    return {"final_response": {
        "error": True, "message": error,
        "error_node": error_node, "diagnosis": None,
    }}


async def handle_fallback(state: AgentState) -> dict:
    logger.warning("RAG fallback — no confident knowledge base match")
    personality = _get_field(state, "personality", "friendly")
    try:
        from rag.retrieval.fallback import handle_fallback as rag_fb
        fb = rag_fb(confidence_score=0.0, personality=personality)
    except Exception:
        fb = {
            "message": (
                "I could not find enough information in the knowledge base "
                "to give a reliable diagnosis. Please retake the photo in "
                "good natural lighting and try again."
            ),
            "recommended_actions": [
                "Retake photo in good natural lighting",
                "Make sure the affected leaf fills the frame",
                "Contact your local agricultural extension officer",
            ],
        }
    return {"final_response": {
        "error": False, "fallback_triggered": True,
        "fallback_message": fb.get("message", ""),
        "recommended_actions": fb.get("recommended_actions", []),
        "diagnosis": None,
    }}


def build_graph() -> StateGraph:
    logger.info("Building updated LangGraph workflow (11 nodes)")
    wf = StateGraph(AgentState)

    # Register all nodes
    wf.add_node("validate_input",       validate_input)
    wf.add_node("load_memory",          load_memory)
    wf.add_node("fetch_weather",        fetch_weather)
    wf.add_node("identify_crop",        identify_crop)
    wf.add_node("describe_symptoms",    describe_symptoms)
    wf.add_node("lookup_disease",       lookup_disease_node)
    wf.add_node("detect_disease",       detect_disease)
    wf.add_node("run_consistency_check",run_consistency_check)
    wf.add_node("healthy_path",         healthy_path)
    wf.add_node("treatment_path",       treatment_path)
    wf.add_node("format_response",      format_response)
    wf.add_node("save_memory",          save_memory)
    wf.add_node("handle_error",         handle_error)
    wf.add_node("handle_fallback",      handle_fallback)

    wf.set_entry_point("validate_input")

    # Conditional edges
    wf.add_conditional_edges("validate_input",  route_after_validation,
        {"handle_error": "handle_error", "load_memory": "load_memory"})

    wf.add_conditional_edges("identify_crop",   route_after_crop_id,
        {"handle_error": "handle_error", "describe_symptoms": "describe_symptoms"})

    wf.add_conditional_edges("lookup_disease",  route_after_rag,
        {"handle_fallback": "handle_fallback", "detect_disease": "detect_disease"})

    wf.add_conditional_edges("detect_disease",  route_after_detection,
        {"handle_error": "handle_error",
         "healthy_path": "healthy_path",
         "treatment_path": "treatment_path"})

    # Linear edges
    wf.add_edge("load_memory",           "fetch_weather")
    wf.add_edge("fetch_weather",         "identify_crop")
    wf.add_edge("describe_symptoms",     "lookup_disease")
    wf.add_edge("detect_disease",        "run_consistency_check")
    wf.add_edge("run_consistency_check", "healthy_path")   # overridden by conditional
    wf.add_edge("healthy_path",          "format_response")
    wf.add_edge("treatment_path",        "format_response")
    wf.add_edge("format_response",       "save_memory")

    # Terminal edges
    wf.add_edge("save_memory",     END)
    wf.add_edge("handle_error",    END)
    wf.add_edge("handle_fallback", END)

    compiled = wf.compile()
    logger.info("LangGraph workflow compiled successfully")
    return compiled


# NOTE: After consistency_check we need to re-route to healthy/treatment
# LangGraph doesn't allow a node to be both a linear target and a
# conditional source. Fix: make consistency_check always go to a router node.

def build_graph_v2() -> StateGraph:
    """
    Corrected graph: consistency_check routes to healthy_path or treatment_path
    via a dedicated edge function.
    """
    from agent.edges import route_after_detection

    logger.info("Building LangGraph workflow v2 (correct consistency routing)")
    wf = StateGraph(AgentState)

    wf.add_node("validate_input",       validate_input)
    wf.add_node("load_memory",          load_memory)
    wf.add_node("fetch_weather",        fetch_weather)
    wf.add_node("identify_crop",        identify_crop)
    wf.add_node("describe_symptoms",    describe_symptoms)
    wf.add_node("lookup_disease",       lookup_disease_node)
    wf.add_node("detect_disease",       detect_disease)
    wf.add_node("run_consistency_check",run_consistency_check)
    wf.add_node("healthy_path",         healthy_path)
    wf.add_node("treatment_path",       treatment_path)
    wf.add_node("format_response",      format_response)
    wf.add_node("save_memory",          save_memory)
    wf.add_node("handle_error",         handle_error)
    wf.add_node("handle_fallback",      handle_fallback)

    wf.set_entry_point("validate_input")

    wf.add_conditional_edges("validate_input", route_after_validation,
        {"handle_error": "handle_error", "load_memory": "load_memory"})

    wf.add_conditional_edges("identify_crop", route_after_crop_id,
        {"handle_error": "handle_error", "describe_symptoms": "describe_symptoms"})

    wf.add_conditional_edges("lookup_disease", route_after_rag,
        {"handle_fallback": "handle_fallback", "detect_disease": "detect_disease"})

    # After consistency check, re-route based on health status
    wf.add_conditional_edges("run_consistency_check", route_after_detection,
        {"handle_error":   "handle_error",
         "healthy_path":   "healthy_path",
         "treatment_path": "treatment_path"})

    wf.add_edge("load_memory",        "fetch_weather")
    wf.add_edge("fetch_weather",      "identify_crop")
    wf.add_edge("describe_symptoms",  "lookup_disease")
    wf.add_edge("detect_disease",     "run_consistency_check")
    wf.add_edge("healthy_path",       "format_response")
    wf.add_edge("treatment_path",     "format_response")
    wf.add_edge("format_response",    "save_memory")
    wf.add_edge("save_memory",        END)
    wf.add_edge("handle_error",       END)
    wf.add_edge("handle_fallback",    END)

    return wf.compile()


_graph = build_graph_v2()


async def run_agent(
    image_data: str, image_type: str = "image/jpeg",
    plant_type: str = None, personality: str = "friendly",
    selected_model: str = "gpt-4o", user_id: str = None,
    session_id: str = None, location: str = None,
) -> dict:
    if not session_id:
        session_id = str(uuid.uuid4())

    logger.info(f"Agent run: model={selected_model} session={session_id}")

    initial = AgentState(
        image_data=image_data, image_type=image_type,
        plant_type=plant_type, personality=personality,
        selected_model=selected_model, user_id=user_id,
        session_id=session_id, location=location,
    )

    try:
        final_state = await _graph.ainvoke(initial)

        tokens = _get_field(final_state, "tokens_used", 0)
        logger.info(f"Agent run complete: tokens={tokens} session={session_id}")

        final_response = _get_field(final_state, "final_response", None)

        if final_response is None:
            diagnosis = _get_field(final_state, "diagnosis", None)
            if diagnosis:
                d = diagnosis.dict() if hasattr(diagnosis, "dict") else diagnosis
                sources = _get_field(final_state, "retrieved_sources", [])
                return {
                    "diagnosis":              d,
                    "differential_diagnoses": _get_field(final_state, "differential_diagnoses", []),
                    "consistency_warnings":   _get_field(final_state, "consistency_warnings", []),
                    "sources":                [s.dict() if hasattr(s, "dict") else s for s in sources],
                    "treatments":             _get_field(final_state, "treatments", []),
                    "prevention_tips":        _get_field(final_state, "prevention_tips", []),
                    "tokens_used":            tokens,
                    "cost_usd":               _get_field(final_state, "cost_usd", 0.0),
                    "session_id":             session_id,
                    "fallback_triggered":     False,
                    "model_used":             selected_model,
                }
            return {"error": True, "message": "Agent completed but produced no response.", "diagnosis": None}

        if isinstance(final_response, dict) and "session_id" not in final_response:
            final_response["session_id"] = session_id

        return final_response

    except Exception as e:
        logger.error(f"Agent run failed: {e}", exc_info=True)
        return {"error": True, "message": "Unexpected error. Please try again.", "diagnosis": None}
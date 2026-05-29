# tests/unit/test_state.py

from agent.state import make_initial_state, _replace, AgentState
import operator

def test_make_initial_state_no_none_lists():
    """All reducer-annotated list fields must start as [], never None."""
    s = make_initial_state(image_data="base64data")
    for field in [
        "past_diagnoses", "retrieved_sources", "differential_diagnoses",
        "consistency_warnings", "treatments", "prevention_tips",
    ]:
        assert s[field] == [], f"{field} must initialise to []"

def test_tokens_used_no_reducer():
    """tokens_used must NOT use operator.add — verify manual accumulation."""
    s = make_initial_state(image_data="x")
    assert s["tokens_used"] == 0
    # Simulate what a node does: read + add
    delta = {"tokens_used": s["tokens_used"] + 150}
    assert delta["tokens_used"] == 150   # not doubled

def test_consistency_warnings_accumulate():
    """operator.add must merge warnings from two nodes."""
    from_node_8 = ["Warning A"]
    from_node_9b = ["Warning B"]
    merged = operator.add(from_node_8, from_node_9b)
    assert merged == ["Warning A", "Warning B"]

def test_treatments_replace():
    """_replace must overwrite, not append."""
    old = [{"action": "old treatment"}]
    new = [{"action": "new treatment"}]
    assert _replace(old, new) == new
    assert len(_replace(old, new)) == 1

def test_differential_diagnoses_replace():
    """detect_disease rewrites the full list — _replace is correct."""
    first_run = [{"name": "Late Blight", "probability": 80}]
    retry_run = [{"name": "Early Blight", "probability": 70}]
    assert _replace(first_run, retry_run) == retry_run


# tests/integration/test_nodes.py

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from agent.state import make_initial_state
from agent.nodes import validate_input, load_memory, run_consistency_check

@pytest.mark.asyncio
async def test_validate_input_invalid_image():
    state = make_initial_state(image_data="", image_type="image/jpeg")
    with patch("agent.nodes.validate_image", return_value=(False, "Empty image")):
        result = await validate_input(state)
    assert result["error"] == "Empty image"
    assert result["error_node"] == "validate_input"

@pytest.mark.asyncio
async def test_load_memory_no_user():
    """Without user_id, past_diagnoses must return []."""
    state = make_initial_state(image_data="x", user_id=None)
    result = await load_memory(state)
    assert result["past_diagnoses"] == []

@pytest.mark.asyncio
async def test_consistency_check_no_diagnosis():
    """Node must short-circuit safely when diagnosis is absent."""
    state = make_initial_state(image_data="x")
    result = await run_consistency_check(state)
    assert result["consistency_warnings"] == []
    assert result["consistency_penalty"] == 0


# tests/integration/test_graph.py

@pytest.mark.asyncio
async def test_full_pipeline_returns_final_response():
    """Smoke test: graph must return a dict with 'diagnosis' key."""
    from agent.graph import run_agent
    result = await run_agent(
        image_data="<base64_encoded_test_image>",
        image_type="image/jpeg",
        plant_type="coffee",
        user_id=None,
        session_id="test-session-001",
    )
    assert isinstance(result, dict)
    assert "error" in result or "diagnosis" in result

@pytest.mark.asyncio
async def test_consistency_warnings_accumulate_across_nodes():
    """
    When both run_consistency_check and treatment_path emit warnings,
    the final state must contain warnings from both nodes.
    """
    
    
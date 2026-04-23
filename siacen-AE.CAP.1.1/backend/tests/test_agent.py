"""
Tests for the LangGraph agent workflow.

Tests each node independently and the
complete agent workflow end to end.

How to run:
    cd backend
    pytest tests/test_agent.py -v

Test coverage:
    - AgentState validation
    - Individual node functions
    - Conditional edge routing logic
    - Complete agent workflow
    - Error handling scenarios
    - Fallback triggering
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from agent.state import AgentState
from agent.edges import (
    route_after_validation,
    route_after_detection,
    route_after_fallback_check
)


# ── Fixtures ───────────────────────────────────────────────

@pytest.fixture
def valid_state():
    """
    Returns a valid AgentState with minimal
    required fields for testing.
    """
    return AgentState(
        image_data="dGVzdA==",  # base64 "test"
        image_type="image/jpeg",
        personality="friendly",
        selected_model="gpt-4o"
    )


@pytest.fixture
def state_with_error():
    """
    Returns an AgentState with an error set
    to test error routing.
    """
    return AgentState(
        image_data="dGVzdA==",
        image_type="image/jpeg",
        personality="friendly",
        selected_model="gpt-4o",
        error="Test error message",
        error_node="validate_input"
    )


@pytest.fixture
def state_with_healthy_diagnosis():
    """
    Returns an AgentState with a healthy
    plant diagnosis for testing healthy routing.
    """
    from models.diagnosis import (
        DiseaseDetection,
        DiagnosisDetail,
        HealthStatus,
        Severity,
        Urgency
    )

    diagnosis = DiseaseDetection(
        plant_identified="Tomato",
        health_status=HealthStatus.healthy,
        confidence_score=92.5,
        diagnosis=DiagnosisDetail(
            name="No Disease Detected",
            scientific_name=None,
            severity=Severity.none,
            description="The plant appears healthy."
        ),
        causes=[],
        symptoms=[],
        treatments=[],
        prevention_tips=[
            "Water at base of plant"
        ],
        urgency=Urgency.low,
        farmer_advice="Your plant looks great!"
    )

    return AgentState(
        image_data="dGVzdA==",
        image_type="image/jpeg",
        personality="friendly",
        selected_model="gpt-4o",
        diagnosis=diagnosis
    )


@pytest.fixture
def state_with_diseased_diagnosis():
    """
    Returns an AgentState with a diseased
    plant diagnosis for testing disease routing.
    """
    from models.diagnosis import (
        DiseaseDetection,
        DiagnosisDetail,
        HealthStatus,
        Severity,
        Urgency
    )

    diagnosis = DiseaseDetection(
        plant_identified="Tomato",
        health_status=HealthStatus.diseased,
        confidence_score=87.3,
        diagnosis=DiagnosisDetail(
            name="Early Blight",
            scientific_name="Alternaria solani",
            severity=Severity.moderate,
            description="Brown spots with yellow halos."
        ),
        causes=["Fungal infection"],
        symptoms=["Brown spots", "Yellow halos"],
        treatments=[],
        prevention_tips=[],
        urgency=Urgency.high,
        farmer_advice="Act quickly to treat this."
    )

    return AgentState(
        image_data="dGVzdA==",
        image_type="image/jpeg",
        personality="friendly",
        selected_model="gpt-4o",
        diagnosis=diagnosis
    )


# ── AgentState Tests ───────────────────────────────────────

class TestAgentState:
    """Tests for AgentState Pydantic model validation."""

    def test_valid_state_creation(self, valid_state):
        """
        Test that a valid AgentState is created
        with correct default values.
        """
        assert valid_state.image_data == "dGVzdA=="
        assert valid_state.image_type == "image/jpeg"
        assert valid_state.personality == "friendly"
        assert valid_state.selected_model == "gpt-4o"
        assert valid_state.tokens_used == 0
        assert valid_state.cost_usd == 0.0
        assert valid_state.error is None
        assert valid_state.diagnosis is None

    def test_state_defaults(self):
        """
        Test that AgentState default values
        are correctly initialised.
        """
        state = AgentState(
            image_data="dGVzdA==",
            image_type="image/jpeg"
        )
        assert state.personality == "friendly"
        assert state.selected_model == "gpt-4o"
        assert state.past_diagnoses == []
        assert state.retrieved_sources == []
        assert state.treatments == []
        assert state.prevention_tips == []
        assert state.fallback_triggered is False

    def test_state_with_user_id(self):
        """
        Test AgentState accepts optional user_id
        and session_id fields correctly.
        """
        state = AgentState(
            image_data="dGVzdA==",
            image_type="image/jpeg",
            user_id="user123",
            session_id="session456"
        )
        assert state.user_id == "user123"
        assert state.session_id == "session456"


# ── Edge Routing Tests ─────────────────────────────────────

class TestEdgeRouting:
    """
    Tests for conditional edge routing logic.
    
    These are the most important tests as they
    verify the agent makes correct decisions.
    """

    def test_route_after_validation_no_error(
        self, valid_state
    ):
        """
        Test routing continues to load_memory
        when validation passes with no error.
        """
        result = route_after_validation(valid_state)
        assert result == "load_memory"

    def test_route_after_validation_with_error(
        self, state_with_error
    ):
        """
        Test routing goes to handle_error
        when validation finds an error.
        """
        result = route_after_validation(
            state_with_error
        )
        assert result == "handle_error"

    def test_route_healthy_plant(
        self, state_with_healthy_diagnosis
    ):
        """
        Test that healthy plants route to
        healthy_path node correctly.
        
        This is the main conditional edge —
        the core agent decision making test.
        """
        result = route_after_detection(
            state_with_healthy_diagnosis
        )
        assert result == "healthy_path"

    def test_route_diseased_plant(
        self, state_with_diseased_diagnosis
    ):
        """
        Test that diseased plants route to
        treatment_path node correctly.
        """
        result = route_after_detection(
            state_with_diseased_diagnosis
        )
        assert result == "treatment_path"

    def test_route_no_diagnosis_to_error(
        self, valid_state
    ):
        """
        Test that missing diagnosis routes to
        handle_error node.
        """
        result = route_after_detection(valid_state)
        assert result == "handle_error"

    def test_route_fallback_triggered(
        self, valid_state
    ):
        """
        Test routing to handle_fallback when
        RAG confidence is too low.
        """
        valid_state.fallback_triggered = True
        result = route_after_fallback_check(
            valid_state
        )
        assert result == "handle_fallback"

    def test_route_fallback_not_triggered(
        self, valid_state
    ):
        """
        Test routing continues to detect_disease
        when RAG retrieval succeeds.
        """
        valid_state.fallback_triggered = False
        result = route_after_fallback_check(
            valid_state
        )
        assert result == "detect_disease"


# ── Node Tests ─────────────────────────────────────────────

class TestNodes:
    """Tests for individual agent node functions."""

    @pytest.mark.asyncio
    async def test_validate_input_valid_image(
        self, valid_state
    ):
        """
        Test validate_input passes with valid
        base64 image data.
        """
        from agent.nodes import validate_input

        with patch(
            "agent.nodes.validate_image",
            return_value=(True, "")
        ):
            result = await validate_input(valid_state)
            assert "error" not in result or \
                   result.get("error") is None

    @pytest.mark.asyncio
    async def test_validate_input_invalid_image(
        self, valid_state
    ):
        """
        Test validate_input returns error dict
        when image validation fails.
        """
        from agent.nodes import validate_input

        with patch(
            "agent.nodes.validate_image",
            return_value=(
                False,
                "Image too small"
            )
        ):
            result = await validate_input(valid_state)
            assert result.get("error") == "Image too small"
            assert result.get("error_node") == (
                "validate_input"
            )

    @pytest.mark.asyncio
    async def test_load_memory_no_user(
        self, valid_state
    ):
        """
        Test load_memory returns empty history
        when no user_id is provided.
        """
        from agent.nodes import load_memory

        result = await load_memory(valid_state)

        assert result["past_diagnoses"] == []
        assert result["history_summary"] is None

    @pytest.mark.asyncio
    async def test_fetch_weather_no_location(
        self, valid_state
    ):
        """
        Test fetch_weather returns None weather
        when no location is provided.
        """
        from agent.nodes import fetch_weather

        result = await fetch_weather(valid_state)

        assert result["weather_data"] is None

    @pytest.mark.asyncio
    async def test_format_response_healthy(
        self, state_with_healthy_diagnosis
    ):
        """
        Test format_response correctly assembles
        response for a healthy plant.
        """
        from agent.nodes import format_response

        state_with_healthy_diagnosis.prevention_tips = [
            "Water at base"
        ]

        result = await format_response(
            state_with_healthy_diagnosis
        )

        assert "final_response" in result
        response = result["final_response"]
        assert response["diagnosis"] is not None
        assert "tokens_used" in response
        assert "cost_usd" in response


# ── Integration Tests ──────────────────────────────────────

class TestAgentIntegration:
    """
    Integration tests for the complete agent.
    
    These tests mock external API calls to test
    the full workflow without making real API calls.
    """

    @pytest.mark.asyncio
    async def test_run_agent_invalid_image(self):
        """
        Test that run_agent handles invalid images
        gracefully without crashing.
        """
        from agent import run_agent

        with patch(
            "agent.nodes.validate_image",
            return_value=(False, "Invalid image")
        ):
            result = await run_agent(
                image_data="invalid_data",
                image_type="image/jpeg"
            )

            # Should return error response
            # not raise an exception
            assert result is not None

    @pytest.mark.asyncio
    async def test_run_agent_returns_dict(self):
        """
        Test that run_agent always returns a dict
        even when something fails internally.
        """
        from agent import run_agent

        with patch(
            "agent.graph._graph.ainvoke",
            side_effect=Exception("Mock failure")
        ):
            result = await run_agent(
                image_data="dGVzdA==",
                image_type="image/jpeg"
            )

            assert isinstance(result, dict)
            assert result.get("error") is True
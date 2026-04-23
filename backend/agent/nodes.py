# backend/agent/nodes.py
"""
LangGraph node functions for CropGuard AI.
[docstring unchanged]
"""

import json
import logging
from typing import Any

from agent.state import AgentState
from agent.consistency_checker import (
    check_consistency,
    compute_calibrated_confidence,
    infer_category,
)
from llm.factory import get_llm_client
from tools.disease_lookup import lookup_disease
from tools.weather import get_weather
from memory.short_term import ShortTermMemory
from memory.long_term import LongTermMemory
from models.diagnosis import (
    DiseaseDetection, DiagnosisDetail,
    HealthStatus, Severity, Urgency,
)
from prompts import render_prompt
from utils.costs import calculate_cost
from utils.image import validate_image

logger = logging.getLogger(__name__)

KNOWN_CROPS = ["coffee", "tea", "cocoa", "cotton", "sunflower"]


def _parse_json(text: str):
    clean = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)


# ── Node 1: Validate Input ─────────────────────────────────────────────────────

async def validate_input(state: AgentState) -> dict[str, Any]:
    logger.info("Node 1: Validating input image")
    try:
        # CHANGED: state.image_data → state["image_data"]
        # CHANGED: state.image_type → state["image_type"]
        is_valid, message = validate_image(
            state["image_data"], state["image_type"]
        )
        if not is_valid:
            logger.warning(f"Image validation failed: {message}")
            return {"error": message, "error_node": "validate_input"}
        logger.info("Image validation passed")
        return {}
    except Exception as e:
        return {
            "error": f"Image validation error: {str(e)}",
            "error_node": "validate_input",
        }


# ── Node 2: Load Memory ────────────────────────────────────────────────────────

async def load_memory(state: AgentState) -> dict[str, Any]:
    logger.info("Node 2: Loading farmer memory")
    try:
        past_diagnoses  = []
        history_summary = None
        # CHANGED: state.user_id → state.get("user_id")
        if state.get("user_id"):
            lt      = LongTermMemory(user_id=state["user_id"])
            summary = lt.get_history_summary()
            past_diagnoses = summary.get("recent_diagnoses", [])
            if past_diagnoses:
                history_summary = render_prompt(
                    "memory/context_recall.j2",
                    past_diagnoses=past_diagnoses,
                    farmer_name=None,
                )
        # CHANGED: state.session_id → state.get("session_id")
        if state.get("session_id"):
            ShortTermMemory(session_id=state["session_id"]).extend_session()
        return {"past_diagnoses": past_diagnoses, "history_summary": history_summary}
    except Exception as e:
        logger.error(f"Memory load error: {e}")
        return {"past_diagnoses": [], "history_summary": None}


# ── Node 3: Fetch Weather ──────────────────────────────────────────────────────

async def fetch_weather(state: AgentState) -> dict[str, Any]:
    logger.info("Node 3: Fetching weather data")
    # CHANGED: state.location → state.get("location")
    if not state.get("location"):
        logger.info("No location — skipping weather")
        return {"weather_data": None}
    try:
        return {"weather_data": await get_weather(location=state["location"])}
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return {"weather_data": None}


# ── Node 4: Identify Crop ──────────────────────────────────────────────────────

async def identify_crop(state: AgentState) -> dict[str, Any]:
    logger.info("Node 4: Identifying crop from image")

    # CHANGED: state.plant_type → state.get("plant_type")
    plant_type = state.get("plant_type")
    if plant_type and plant_type.lower() not in ("unknown", ""):
        crop = plant_type.lower().strip()
        logger.info(f"Crop from farmer hint: '{crop}' (100%)")
        return {
            "crop_identified":         crop,
            "crop_confidence":         100,
            "crop_needs_confirmation": False,
        }

    try:
        # CHANGED: state.selected_model → state["selected_model"]
        client = get_llm_client(state["selected_model"])

        user_prompt   = render_prompt(
            "agent/crop_identification.j2",
            known_crops=KNOWN_CROPS,
        )
        system_prompt = render_prompt("agent/crop_identification_system.j2")

        raw, tokens = await client.complete_with_image(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            # CHANGED: state.image_data → state["image_data"]
            # CHANGED: state.image_type → state["image_type"]
            image_data=state["image_data"],
            image_type=state["image_type"],
            max_tokens=150,
            temperature=0.1,
        )

        parsed     = _parse_json(raw)
        crop       = parsed.get("crop", "general").lower().strip()
        confidence = int(parsed.get("confidence", 0))
        reasoning  = parsed.get("reasoning", "")
        # CHANGED: state.selected_model → state["selected_model"]
        cost       = calculate_cost(tokens=tokens, model=state["selected_model"])

        logger.info(f"Crop identified: '{crop}' ({confidence}%) — {reasoning}")

        if confidence < 60:
            logger.warning(f"Low crop confidence {confidence}% — using 'general'")
            return {
                "crop_identified":         "general",
                "crop_confidence":         confidence,
                "crop_needs_confirmation": True,
                # CHANGED: state.tokens_used → state["tokens_used"]
                # CHANGED: state.cost_usd    → state["cost_usd"]
                "tokens_used": state["tokens_used"] + tokens,
                "cost_usd":    state["cost_usd"] + cost,
            }

        return {
            "crop_identified":         crop,
            "crop_confidence":         confidence,
            "crop_needs_confirmation": False,
            "tokens_used": state["tokens_used"] + tokens,
            "cost_usd":    state["cost_usd"] + cost,
        }

    except Exception as e:
        logger.error(f"Crop identification failed: {e}")
        return {
            # CHANGED: state.plant_type → state.get("plant_type")
            "crop_identified":         state.get("plant_type") or "general",
            "crop_confidence":         0,
            "crop_needs_confirmation": False,
        }


# ── Node 5: Describe Symptoms ──────────────────────────────────────────────────

async def describe_symptoms(state: AgentState) -> dict[str, Any]:
    logger.info("Node 5: Describing symptoms (no disease naming)")

    # CHANGED: state.crop_identified → state.get("crop_identified")
    crop = state.get("crop_identified") or "plant"

    try:
        client = get_llm_client(state["selected_model"])

        user_prompt = render_prompt(
            "agent/symptom_description.j2",
            crop=crop,
            # CHANGED: state.weather_data → state.get("weather_data")
            weather_data=state.get("weather_data"),
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            # CHANGED: state.personality → state["personality"]
            personality=state["personality"],
        )

        raw, tokens = await client.complete_with_image(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            image_data=state["image_data"],
            image_type=state["image_type"],
            max_tokens=500,
            temperature=0.2,
        )

        cost = calculate_cost(tokens=tokens, model=state["selected_model"])
        logger.info(f"Symptom description: {len(raw)} chars, {tokens} tokens")

        return {
            "symptom_description": raw,
            "tokens_used":         state["tokens_used"] + tokens,
            "cost_usd":            state["cost_usd"] + cost,
        }

    except Exception as e:
        logger.error(f"Symptom description failed: {e}")
        return {
            "symptom_description": "",
            "error":               f"Symptom description failed: {str(e)}",
            "error_node":          "describe_symptoms",
        }


# ── Node 6: Lookup Disease (RAG) ──────────────────────────────────────────────

async def lookup_disease_node(state: AgentState) -> dict[str, Any]:
    logger.info("Node 6: RAG lookup")

    # CHANGED: state.crop_identified / state.plant_type → .get()
    effective_crop = (
        state.get("crop_identified") or state.get("plant_type") or "general"
    ).lower()

    logger.info(f"RAG: crop='{effective_crop}'")

    try:
        sources = await lookup_disease(
            # CHANGED: state.symptom_description → state.get(...)
            visual_description=state.get("symptom_description") or "",
            plant_type=state.get("plant_type"),
            crop=effective_crop,
        )
        logger.info(f"RAG: {len(sources)} sources found")
        return {
            "retrieved_sources":  sources,
            "fallback_triggered": len(sources) == 0,
        }
    except Exception as e:
        logger.error(f"RAG lookup failed: {e}")
        return {"retrieved_sources": [], "fallback_triggered": False}


# ── Node 7: Detect Disease ────────────────────────────────────────────────────

async def detect_disease(state: AgentState) -> dict[str, Any]:
    logger.info("Node 7: Differential diagnosis (top-3)")

    try:
        client = get_llm_client(state["selected_model"])

        # CHANGED: state.crop_identified → state.get("crop_identified")
        # CHANGED: state.plant_type      → state.get("plant_type")
        # CHANGED: state.crop_confidence → state.get("crop_confidence")
        crop      = state.get("crop_identified") or state.get("plant_type") or "unknown plant"
        crop_conf = state.get("crop_confidence") or 0

        user_prompt = render_prompt(
            "agent/disease_detection.j2",
            # CHANGED: state.symptom_description → state.get(...)
            visual_analysis=state.get("symptom_description") or "",
            # CHANGED: state.retrieved_sources → state["retrieved_sources"]
            retrieved_context=state["retrieved_sources"],
            plant_type=crop,
            crop_confidence=crop_conf,
            personality=state["personality"],
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state["personality"],
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1200,
            temperature=0.15,
        )

        parsed    = _parse_json(raw)
        cost      = calculate_cost(tokens=tokens, model=state["selected_model"])
        diagnoses = parsed.get("diagnoses", [])

        if not diagnoses:
            raise ValueError("No diagnoses in LLM response")

        primary  = diagnoses[0]
        category = primary.get("category", "unknown")

        severity_map = {
            "none": Severity.none, "mild": Severity.mild,
            "moderate": Severity.moderate, "severe": Severity.severe,
        }
        urgency_map = {
            "low": Urgency.low, "medium": Urgency.medium,
            "high": Urgency.high, "critical": Urgency.critical,
        }

        if category == "healthy":
            health_status = HealthStatus.healthy
        elif category in ("nutrient_deficiency", "abiotic_stress"):
            health_status = HealthStatus.stressed
        else:
            health_status = HealthStatus.diseased

        # DiseaseDetection is still constructed as a Pydantic model here —
        # it is stored in state["diagnosis"] as a live object during graph
        # execution. format_response and save_memory call .dict() on it.
        # If LangGraph checkpointing is enabled, serialise to dict in
        # save_memory and reconstruct with DiseaseDetection(**d) on reload.
        diagnosis_obj = DiseaseDetection(
            plant_identified=parsed.get("plant_identified", crop),
            health_status=health_status,
            confidence_score=float(primary.get("probability", 50)),
            diagnosis=DiagnosisDetail(
                name=primary.get("name", "Unknown"),
                scientific_name=primary.get("scientific_name"),
                severity=severity_map.get(
                    primary.get("severity", "mild"), Severity.mild
                ),
                description=primary.get("description", ""),
            ),
            causes=primary.get("causes", primary.get("supporting_evidence", [])),
            symptoms=[],
            treatments=[],
            prevention_tips=[],
            urgency=urgency_map.get(
                parsed.get("urgency", "medium"), Urgency.medium
            ),
            farmer_advice=parsed.get("farmer_advice", ""),
        )

        logger.info(
            f"Differential: "
            f"1={diagnoses[0].get('name')} ({diagnoses[0].get('probability')}%) | "
            f"2={diagnoses[1].get('name') if len(diagnoses) > 1 else 'N/A'} | "
            f"3={diagnoses[2].get('name') if len(diagnoses) > 2 else 'N/A'}"
        )

        return {
            "differential_diagnoses": diagnoses,
            "diagnosis":              diagnosis_obj,
            "tokens_used":            state["tokens_used"] + tokens,
            "cost_usd":               state["cost_usd"] + cost,
        }

    except Exception as e:
        logger.error(f"Disease detection failed: {e}")
        return {
            "error":      f"Disease detection failed: {str(e)}",
            "error_node": "detect_disease",
        }


# ── Node 8: Consistency Check ─────────────────────────────────────────────────

async def run_consistency_check(state: AgentState) -> dict[str, Any]:
    logger.info("Node 8: Biological consistency check")

    # CHANGED: state.diagnosis / state.differential_diagnoses → dict access
    if not state.get("diagnosis") or not state.get("differential_diagnoses"):
        return {"consistency_warnings": [], "consistency_penalty": 0}

    primary  = state["differential_diagnoses"][0]
    category = primary.get("category", "unknown")

    if category == "unknown":
        category = infer_category(
            primary.get("name", ""),
            primary.get("description", ""),
        )

    result = check_consistency(
        diagnosis_name=primary.get("name", ""),
        category=category,
        symptoms_seen=primary.get("supporting_evidence", []),
        treatments=[],
        description=primary.get("description", ""),
    )

    # CHANGED: state.retrieved_sources → state["retrieved_sources"]
    rag_top_score = (
        max(s.similarity_score for s in state["retrieved_sources"])
        if state["retrieved_sources"] else 0.0
    )

    calibrated = compute_calibrated_confidence(
        gpt_raw_score       =primary.get("probability", 50),
        rag_top_score       =rag_top_score,
        rag_chunks_passed   =len(state["retrieved_sources"]),
        consistency_penalty =result["confidence_penalty"],
        # CHANGED: state.crop_confidence → state.get("crop_confidence")
        crop_confidence     =float(state.get("crop_confidence") or 0),
    )

    logger.info(
        f"Consistency: {'OK' if result['consistent'] else 'WARNINGS'} | "
        f"Calibrated confidence: {calibrated}% "
        f"(raw was {primary.get('probability', 50)}%)"
    )

    # CHANGED: state.diagnosis.copy(update={...}) is Pydantic-specific.
    # DiseaseDetection is still a Pydantic model, so .copy() still works —
    # but we re-assign via the returned delta dict, not in-place mutation.
    current_diagnosis = state["diagnosis"]
    updated_diagnosis = (
        current_diagnosis.copy(update={"confidence_score": calibrated})
        if current_diagnosis else None
    )

    return {
        # operator.add reducer: these warnings ACCUMULATE with any
        # warnings already in state from earlier nodes.
        "consistency_warnings":  result["warnings"],
        "consistency_penalty":   result["confidence_penalty"],
        "calibrated_confidence": calibrated,
        "diagnosis":             updated_diagnosis,
    }


# ── Node 9a: Healthy Path ─────────────────────────────────────────────────────

async def healthy_path(state: AgentState) -> dict[str, Any]:
    logger.info("Node 9a: Healthy path")
    try:
        client = get_llm_client(state["selected_model"])
        # CHANGED: state.diagnosis.plant_identified → dict access with guard
        diagnosis = state.get("diagnosis")
        plant     = diagnosis.plant_identified if diagnosis else "plant"

        user_prompt = render_prompt(
            "agent/healthy_path.j2",
            plant_identified=plant,
            weather_data=state.get("weather_data"),
            personality=state["personality"],
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state["personality"],
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=400,
            temperature=0.3,
        )
        tips = _parse_json(raw) if raw.strip().startswith("[") else []
        cost = calculate_cost(tokens=tokens, model=state["selected_model"])

        return {
            "prevention_tips": tips,
            "tokens_used":     state["tokens_used"] + tokens,
            "cost_usd":        state["cost_usd"] + cost,
        }
    except Exception as e:
        logger.error(f"Healthy path failed: {e}")
        return {
            "prevention_tips": [
                "Water plants at the base, not the leaves",
                "Inspect leaves weekly for early signs of disease",
                "Ensure good air circulation around plants",
            ]
        }


# ── Node 9b: Treatment Path ───────────────────────────────────────────────────

async def treatment_path(state: AgentState) -> dict[str, Any]:
    logger.info("Node 9b: Treatment path")
    try:
        client = get_llm_client(state["selected_model"])

        # CHANGED: state.differential_diagnoses → state.get(...)
        # CHANGED: state.diagnosis              → state.get(...)
        diff_diagnoses = state.get("differential_diagnoses") or []
        primary        = diff_diagnoses[0] if diff_diagnoses else {}
        category       = primary.get("category", "unknown")
        diagnosis      = state.get("diagnosis")
        plant          = diagnosis.plant_identified if diagnosis else "plant"
        diag_detail    = diagnosis.diagnosis if diagnosis else None

        user_prompt = render_prompt(
            "agent/treatment.j2",
            diagnosis=diag_detail,
            plant_identified=plant,
            disease_category=category,
            # CHANGED: state.retrieved_sources → state["retrieved_sources"]
            retrieved_context=state["retrieved_sources"],
            weather_data=state.get("weather_data"),
            personality=state["personality"],
            differential_diagnoses=diff_diagnoses,
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state["personality"],
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=800,
            temperature=0.2,
        )
        treatments = _parse_json(raw) if raw.strip().startswith("[") else []
        cost       = calculate_cost(tokens=tokens, model=state["selected_model"])

        # Post-generation consistency check — warnings go into
        # consistency_warnings via operator.add (accumulates with node 8's
        # warnings; does NOT overwrite them).
        if diff_diagnoses:
            consistency = check_consistency(
                diagnosis_name=primary.get("name", ""),
                category=category,
                symptoms_seen=primary.get("supporting_evidence", []),
                treatments=treatments,
                description=primary.get("description", ""),
            )
            if consistency["warnings"]:
                treatments.append({
                    "type":    "preventive",
                    "action":  "⚠ Consistency Note",
                    "details": " | ".join(consistency["warnings"]),
                })
                # Return warnings so they accumulate via operator.add
                extra_warnings = consistency["warnings"]
            else:
                extra_warnings = []
        else:
            extra_warnings = []

        logger.info(f"Generated {len(treatments)} treatments for category='{category}'")
        return {
            "treatments":           treatments,
            # operator.add will merge these with node 8's warnings
            "consistency_warnings": extra_warnings,
            "tokens_used":          state["tokens_used"] + tokens,
            "cost_usd":             state["cost_usd"] + cost,
        }

    except Exception as e:
        logger.error(f"Treatment path failed: {e}")
        return {
            "error":      f"Treatment generation failed: {str(e)}",
            "error_node": "treatment_path",
        }


# ── Node 10: Format Response ──────────────────────────────────────────────────

async def format_response(state: AgentState) -> dict[str, Any]:
    logger.info("Node 10: Formatting final response")
    try:
        # CHANGED: state.diagnosis → state.get("diagnosis")
        diagnosis = state.get("diagnosis")
        diagnosis_dict = (
            diagnosis.dict()
            if diagnosis and hasattr(diagnosis, "dict")
            else None
        )
        # CHANGED: state.calibrated_confidence → state.get("calibrated_confidence")
        if diagnosis_dict and state.get("calibrated_confidence") is not None:
            diagnosis_dict["confidence_score"] = state["calibrated_confidence"]

        # CHANGED: state.retrieved_sources → state["retrieved_sources"]
        sources_list = [
            s.dict() if hasattr(s, "dict") else s
            for s in state["retrieved_sources"]
        ]

        return {
            "final_response": {
                "diagnosis":               diagnosis_dict,
                # CHANGED: all state.field → state["field"] / state.get("field")
                "differential_diagnoses":  state.get("differential_diagnoses", []),
                "consistency_warnings":    state.get("consistency_warnings", []),
                "treatments":              state.get("treatments", []),
                "prevention_tips":         state.get("prevention_tips", []),
                "sources":                 sources_list,
                "retrieved_context": [
                    {
                        "document":  s.get("document_name", ""),
                        "relevance": s.get("similarity_score", 0),
                        "text":      s.get("chunk_text", ""),
                    }
                    for s in sources_list
                ],
                "crop_identified":         state.get("crop_identified"),
                "crop_confidence":         state.get("crop_confidence"),
                "crop_needs_confirmation": state.get("crop_needs_confirmation"),
                "tokens_used":             state.get("tokens_used", 0),
                "cost_usd":                round(state.get("cost_usd", 0.0), 6),
                "session_id":              state.get("session_id"),
                "fallback_triggered":      state.get("fallback_triggered", False),
                "weather_data":            state.get("weather_data"),
                "model_used":              state.get("selected_model"),
            }
        }
    except Exception as e:
        logger.error(f"Format response failed: {e}")
        return {
            "error":      f"Response formatting failed: {str(e)}",
            "error_node": "format_response",
        }


# ── Node 11: Save Memory ──────────────────────────────────────────────────────

async def save_memory(state: AgentState) -> dict[str, Any]:
    logger.info("Node 11: Saving to memory")
    diagnosis_id = None
    try:
        # CHANGED: state.user_id / state.diagnosis → dict access
        diagnosis = state.get("diagnosis")
        if state.get("user_id") and diagnosis:
            lt = LongTermMemory(user_id=state["user_id"])
            diagnosis_id = lt.save_diagnosis(
                diagnosis=diagnosis.dict(),
                tokens_used=state.get("tokens_used", 0),
                cost_usd=state.get("cost_usd", 0.0),
            )
            logger.info(f"Saved to Supabase: {diagnosis_id}")

        # CHANGED: state.session_id → state.get("session_id")
        if state.get("session_id") and diagnosis:
            st = ShortTermMemory(session_id=state["session_id"])
            st.save_diagnosis(diagnosis.dict())
            st.save_message(
                role="assistant",
                content=f"Diagnosed: {diagnosis.diagnosis.name}",
            )
            logger.info(f"Saved to Redis: {state['session_id']}")

        return {"diagnosis_id": diagnosis_id}
    except Exception as e:
        logger.error(f"Memory save failed: {e}")
        return {"diagnosis_id": None}
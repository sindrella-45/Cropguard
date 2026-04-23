"""
LangGraph node functions for CropGuard AI.

Pipeline (11 nodes):
  1.  validate_input         — image validation
  2.  load_memory            — farmer history from Supabase + Redis
  3.  fetch_weather          — weather context from API
  4.  identify_crop          — crop ID only (gated, separate call)
  5.  describe_symptoms      — symptom description only (no disease naming)
  6.  lookup_disease_node    — ChromaDB RAG retrieval
  7.  detect_disease         — differential top-3 diagnosis
  8.  run_consistency_check  — biological consistency rules (pure Python)
  9a. healthy_path           — prevention tips
  9b. treatment_path         — category-constrained treatments
  10. format_response        — assemble final output
  11. save_memory            — persist to Supabase + Redis
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

# Crops covered by the knowledge base — used in crop_identification.j2
KNOWN_CROPS = ["coffee", "tea", "cocoa", "cotton", "sunflower"]


# ── helpers ────────────────────────────────────────────────────────────────────

def _parse_json(text: str):
    clean = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)


# ── Node 1: Validate Input ─────────────────────────────────────────────────────

async def validate_input(state: AgentState) -> dict[str, Any]:
    logger.info("Node 1: Validating input image")
    try:
        is_valid, message = validate_image(state.image_data, state.image_type)
        if not is_valid:
            logger.warning(f"Image validation failed: {message}")
            return {"error": message, "error_node": "validate_input"}
        logger.info("Image validation passed")
        return {}
    except Exception as e:
        return {"error": f"Image validation error: {str(e)}", "error_node": "validate_input"}


# ── Node 2: Load Memory ────────────────────────────────────────────────────────

async def load_memory(state: AgentState) -> dict[str, Any]:
    logger.info("Node 2: Loading farmer memory")
    try:
        past_diagnoses  = []
        history_summary = None
        if state.user_id:
            lt      = LongTermMemory(user_id=state.user_id)
            summary = lt.get_history_summary()
            past_diagnoses = summary.get("recent_diagnoses", [])
            if past_diagnoses:
                history_summary = render_prompt(
                    "memory/context_recall.j2",
                    past_diagnoses=past_diagnoses,
                    farmer_name=None,
                )
        if state.session_id:
            ShortTermMemory(session_id=state.session_id).extend_session()
        return {"past_diagnoses": past_diagnoses, "history_summary": history_summary}
    except Exception as e:
        logger.error(f"Memory load error: {e}")
        return {"past_diagnoses": [], "history_summary": None}


# ── Node 3: Fetch Weather ──────────────────────────────────────────────────────

async def fetch_weather(state: AgentState) -> dict[str, Any]:
    logger.info("Node 3: Fetching weather data")
    if not state.location:
        logger.info("No location — skipping weather")
        return {"weather_data": None}
    try:
        return {"weather_data": await get_weather(location=state.location)}
    except Exception as e:
        logger.error(f"Weather fetch error: {e}")
        return {"weather_data": None}


# ── Node 4: Identify Crop ──────────────────────────────────────────────────────

async def identify_crop(state: AgentState) -> dict[str, Any]:
    """
    Dedicated crop identification step — prompt lives in
    agent/crop_identification.j2 and agent/crop_identification_system.j2

    If farmer provided plant_type, that always takes priority over
    model inference — the farmer knows what they planted.

    Confidence gate: < 60% → use 'general', set needs_confirmation=True
    so the frontend can ask the farmer to confirm.
    """
    logger.info("Node 4: Identifying crop from image")

    # Farmer hint always wins
    if state.plant_type and state.plant_type.lower() not in ("unknown", ""):
        crop = state.plant_type.lower().strip()
        logger.info(f"Crop from farmer hint: '{crop}' (100%)")
        return {
            "crop_identified":         crop,
            "crop_confidence":         100,
            "crop_needs_confirmation": False,
        }

    try:
        client = get_llm_client(state.selected_model)

        user_prompt   = render_prompt(
            "agent/crop_identification.j2",
            known_crops=KNOWN_CROPS,
        )
        system_prompt = render_prompt(
            "agent/crop_identification_system.j2",
        )

        raw, tokens = await client.complete_with_image(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            image_data=state.image_data,
            image_type=state.image_type,
            max_tokens=150,
            temperature=0.1,
        )

        parsed     = _parse_json(raw)
        crop       = parsed.get("crop", "general").lower().strip()
        confidence = int(parsed.get("confidence", 0))
        reasoning  = parsed.get("reasoning", "")
        cost       = calculate_cost(tokens=tokens, model=state.selected_model)

        logger.info(f"Crop identified: '{crop}' ({confidence}%) — {reasoning}")

        if confidence < 60:
            logger.warning(f"Low crop confidence {confidence}% — using 'general'")
            return {
                "crop_identified":         "general",
                "crop_confidence":         confidence,
                "crop_needs_confirmation": True,
                "tokens_used":             state.tokens_used + tokens,
                "cost_usd":                state.cost_usd + cost,
            }

        return {
            "crop_identified":         crop,
            "crop_confidence":         confidence,
            "crop_needs_confirmation": False,
            "tokens_used":             state.tokens_used + tokens,
            "cost_usd":                state.cost_usd + cost,
        }

    except Exception as e:
        logger.error(f"Crop identification failed: {e}")
        return {
            "crop_identified":         state.plant_type or "general",
            "crop_confidence":         0,
            "crop_needs_confirmation": False,
        }


# ── Node 5: Describe Symptoms ──────────────────────────────────────────────────

async def describe_symptoms(state: AgentState) -> dict[str, Any]:
    """
    Pure symptom description — no disease naming allowed.
    Prompt lives in agent/symptom_description.j2

    Separated from crop identification so GPT-4o cannot anchor on
    a known disease during the visual analysis phase.
    """
    logger.info("Node 5: Describing symptoms (no disease naming)")

    crop = state.crop_identified or "plant"

    try:
        client = get_llm_client(state.selected_model)

        user_prompt   = render_prompt(
            "agent/symptom_description.j2",
            crop=crop,
            weather_data=state.weather_data,
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state.personality,
        )

        raw, tokens = await client.complete_with_image(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            image_data=state.image_data,
            image_type=state.image_type,
            max_tokens=500,
            temperature=0.2,
        )

        cost = calculate_cost(tokens=tokens, model=state.selected_model)
        logger.info(f"Symptom description: {len(raw)} chars, {tokens} tokens")

        return {
            "symptom_description": raw,
            "tokens_used":         state.tokens_used + tokens,
            "cost_usd":            state.cost_usd + cost,
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

    effective_crop = (
        state.crop_identified or state.plant_type or "general"
    ).lower()

    logger.info(f"RAG: crop='{effective_crop}'")

    try:
        sources = await lookup_disease(
            visual_description=state.symptom_description or "",
            plant_type=state.plant_type,
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


# ── Node 7: Detect Disease — differential top-3 ───────────────────────────────

async def detect_disease(state: AgentState) -> dict[str, Any]:
    """
    Differential diagnosis — prompt lives in agent/disease_detection.j2

    Returns top-3 diagnoses. Includes abiotic/nutrient options.
    Forces against_evidence for honest uncertainty.
    """
    logger.info("Node 7: Differential diagnosis (top-3)")

    try:
        client = get_llm_client(state.selected_model)

        crop      = state.crop_identified or state.plant_type or "unknown plant"
        crop_conf = state.crop_confidence or 0

        user_prompt   = render_prompt(
            "agent/disease_detection.j2",
            visual_analysis=state.symptom_description or "",
            retrieved_context=state.retrieved_sources,
            plant_type=crop,
            crop_confidence=crop_conf,
            personality=state.personality,
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state.personality,
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=1200,
            temperature=0.15,
        )

        parsed    = _parse_json(raw)
        cost      = calculate_cost(tokens=tokens, model=state.selected_model)
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
            "tokens_used":            state.tokens_used + tokens,
            "cost_usd":               state.cost_usd + cost,
        }

    except Exception as e:
        logger.error(f"Disease detection failed: {e}")
        return {
            "error":      f"Disease detection failed: {str(e)}",
            "error_node": "detect_disease",
        }


# ── Node 8: Consistency Check — pure Python, no LLM ──────────────────────────

async def run_consistency_check(state: AgentState) -> dict[str, Any]:
    """
    Validates biological consistency of the primary diagnosis.
    No API call. No cost. Instant.
    """
    logger.info("Node 8: Biological consistency check")

    if not state.diagnosis or not state.differential_diagnoses:
        return {"consistency_warnings": [], "consistency_penalty": 0}

    primary  = state.differential_diagnoses[0]
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
        treatments=[],      # treatments not yet generated at this stage
        description=primary.get("description", ""),
    )

    rag_top_score = (
        max(s.similarity_score for s in state.retrieved_sources)
        if state.retrieved_sources else 0.0
    )

    calibrated = compute_calibrated_confidence(
        gpt_raw_score       =primary.get("probability", 50),
        rag_top_score       =rag_top_score,
        rag_chunks_passed   =len(state.retrieved_sources),
        consistency_penalty =result["confidence_penalty"],
        crop_confidence     =float(state.crop_confidence or 0),
    )

    logger.info(
        f"Consistency: {'OK' if result['consistent'] else 'WARNINGS'} | "
        f"Calibrated confidence: {calibrated}% "
        f"(raw was {primary.get('probability', 50)}%)"
    )

    updated_diagnosis = state.diagnosis
    if updated_diagnosis:
        updated_diagnosis = updated_diagnosis.copy(
            update={"confidence_score": calibrated}
        )

    return {
        "consistency_warnings":  result["warnings"],
        "consistency_penalty":   result["confidence_penalty"],
        "calibrated_confidence": calibrated,
        "diagnosis":             updated_diagnosis,
    }


# ── Node 9a: Healthy Path ──────────────────────────────────────────────────────

async def healthy_path(state: AgentState) -> dict[str, Any]:
    logger.info("Node 9a: Healthy path")
    try:
        client = get_llm_client(state.selected_model)
        plant  = state.diagnosis.plant_identified if state.diagnosis else "plant"

        user_prompt   = render_prompt(
            "agent/healthy_path.j2",
            plant_identified=plant,
            weather_data=state.weather_data,
            personality=state.personality,
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state.personality,
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=400,
            temperature=0.3,
        )
        tips = _parse_json(raw) if raw.strip().startswith("[") else []
        cost = calculate_cost(tokens=tokens, model=state.selected_model)

        return {
            "prevention_tips": tips,
            "tokens_used":     state.tokens_used + tokens,
            "cost_usd":        state.cost_usd + cost,
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


# ── Node 9b: Treatment Path ────────────────────────────────────────────────────

async def treatment_path(state: AgentState) -> dict[str, Any]:
    """
    Category-constrained treatment generation.
    Prompt lives in agent/treatment.j2 — category rules are in the template.
    """
    logger.info("Node 9b: Treatment path")
    try:
        client = get_llm_client(state.selected_model)

        primary  = state.differential_diagnoses[0] if state.differential_diagnoses else {}
        category = primary.get("category", "unknown")
        plant    = state.diagnosis.plant_identified if state.diagnosis else "plant"
        diag     = state.diagnosis.diagnosis if state.diagnosis else None

        user_prompt   = render_prompt(
            "agent/treatment.j2",
            diagnosis=diag,
            plant_identified=plant,
            disease_category=category,
            retrieved_context=state.retrieved_sources,
            weather_data=state.weather_data,
            personality=state.personality,
            differential_diagnoses=state.differential_diagnoses,
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state.personality,
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=800,
            temperature=0.2,
        )
        treatments = _parse_json(raw) if raw.strip().startswith("[") else []
        cost       = calculate_cost(tokens=tokens, model=state.selected_model)

        # Post-generation consistency check on the actual treatments
        if state.differential_diagnoses:
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

        logger.info(f"Generated {len(treatments)} treatments for category='{category}'")
        return {
            "treatments":  treatments,
            "tokens_used": state.tokens_used + tokens,
            "cost_usd":    state.cost_usd + cost,
        }

    except Exception as e:
        logger.error(f"Treatment path failed: {e}")
        return {
            "error":      f"Treatment generation failed: {str(e)}",
            "error_node": "treatment_path",
        }


# ── Node 10: Format Response ───────────────────────────────────────────────────

async def format_response(state: AgentState) -> dict[str, Any]:
    logger.info("Node 10: Formatting final response")
    try:
        diagnosis_dict = (
            state.diagnosis.dict()
            if state.diagnosis and hasattr(state.diagnosis, "dict")
            else None
        )
        if diagnosis_dict and state.calibrated_confidence is not None:
            diagnosis_dict["confidence_score"] = state.calibrated_confidence

        sources_list = [
            s.dict() if hasattr(s, "dict") else s
            for s in state.retrieved_sources
        ]

        return {
            "final_response": {
                "diagnosis":               diagnosis_dict,
                "differential_diagnoses":  state.differential_diagnoses,
                "consistency_warnings":    state.consistency_warnings,
                "treatments":              state.treatments,
                "prevention_tips":         state.prevention_tips,
                "sources":                 sources_list,
                "retrieved_context": [
                    {
                        "document":  s.get("document_name", ""),
                        "relevance": s.get("similarity_score", 0),
                        "text":      s.get("chunk_text", ""),
                    }
                    for s in sources_list
                ],
                "crop_identified":          state.crop_identified,
                "crop_confidence":          state.crop_confidence,
                "crop_needs_confirmation":  state.crop_needs_confirmation,
                "tokens_used":              state.tokens_used,
                "cost_usd":                 round(state.cost_usd, 6),
                "session_id":               state.session_id,
                "fallback_triggered":       state.fallback_triggered,
                "weather_data":             state.weather_data,
                "model_used":               state.selected_model,
            }
        }
    except Exception as e:
        logger.error(f"Format response failed: {e}")
        return {"error": f"Response formatting failed: {str(e)}", "error_node": "format_response"}


# ── Node 11: Save Memory ───────────────────────────────────────────────────────

async def save_memory(state: AgentState) -> dict[str, Any]:
    logger.info("Node 11: Saving to memory")
    diagnosis_id = None
    try:
        if state.user_id and state.diagnosis:
            lt = LongTermMemory(user_id=state.user_id)
            diagnosis_id = lt.save_diagnosis(
                diagnosis=state.diagnosis.dict(),
                tokens_used=state.tokens_used,
                cost_usd=state.cost_usd,
            )
            logger.info(f"Saved to Supabase: {diagnosis_id}")

        if state.session_id and state.diagnosis:
            st = ShortTermMemory(session_id=state.session_id)
            st.save_diagnosis(state.diagnosis.dict())
            st.save_message(
                role="assistant",
                content=f"Diagnosed: {state.diagnosis.diagnosis.name}",
            )
            logger.info(f"Saved to Redis: {state.session_id}")

        return {"diagnosis_id": diagnosis_id}
    except Exception as e:
        logger.error(f"Memory save failed: {e}")
        return {"diagnosis_id": None}
# backend/agent/nodes.py
"""
LangGraph node functions for CropGuard AI.

NO PROMPTS IN THIS FILE.
All prompts live in backend/prompts/templates/agent/*.j2
and are loaded via render_prompt() from prompts/loader.py.

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
  10. format_response        — assemble + enrich final output
  11. save_memory            — persist to Supabase + Redis

State access: LangGraph passes state as a plain dict in this setup.
Use state["field"] for required fields, state.get("field") for optional.
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
        if state.get("session_id"):
            ShortTermMemory(session_id=state["session_id"]).extend_session()
        return {"past_diagnoses": past_diagnoses, "history_summary": history_summary}
    except Exception as e:
        logger.error(f"Memory load error: {e}")
        return {"past_diagnoses": [], "history_summary": None}


# ── Node 3: Fetch Weather ──────────────────────────────────────────────────────

async def fetch_weather(state: AgentState) -> dict[str, Any]:
    logger.info("Node 3: Fetching weather data")
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
    """
    Dedicated crop identification — prompt in agent/crop_identification.j2.
    Farmer-provided plant_type always takes priority over model inference.
    Confidence gate: < 60% → use 'general', set needs_confirmation=True.
    """
    logger.info("Node 4: Identifying crop from image")

    # ── Step 4a: Strict content validation ────────────────────────────
    try:
        val_client = get_llm_client(state["selected_model"])
        val_prompt = render_prompt("agent/leaf_validator.j2")

        val_raw, val_tokens = await val_client.complete_with_image(
            system_prompt="You are a strict plant image validator. Return only JSON.",
            user_prompt=val_prompt,
            image_data=state["image_data"],
            image_type=state["image_type"],
            max_tokens=80,
            temperature=0.0,
        )
        val_cost   = calculate_cost(tokens=val_tokens, model=state["selected_model"])
        val_parsed = _parse_json(val_raw)

        if not val_parsed.get("accepted", False):
            reason       = val_parsed.get("rejection_reason") or "not a suitable crop leaf image"
            reason_lower = reason.lower()
            logger.warning(f"Image rejected: {reason}")

            person_words = ("person", "human", "face", "people", "man", "woman", "child", "body")
            blur_words   = ("blur", "dark", "bright", "pixelat", "focus", "unclear")
            object_words = ("food", "table", "vehicle", "building", "animal", "object",
                            "screen", "phone", "furniture", "cloth")

            if any(w in reason_lower for w in person_words):
                msg = (
                    "This image shows a person, not a crop leaf. "
                    "Please upload a clear close-up photo of the affected plant leaf only."
                )
            elif any(w in reason_lower for w in blur_words):
                msg = (
                    "The image is not clear enough for reliable diagnosis. "
                    "Please retake the photo in good natural daylight, "
                    "hold the camera steady, and focus directly on the leaf surface."
                )
            elif any(w in reason_lower for w in object_words):
                msg = (
                    f"This image appears to show {reason}, not a crop leaf. "
                    "Please upload a clear close-up photo of the affected plant leaf."
                )
            else:
                msg = (
                    "This image is not suitable for crop disease diagnosis. "
                    f"Reason: {reason}. "
                    "Please upload a clear close-up photo of a crop leaf "
                    "where the leaf fills most of the frame."
                )

            return {
                "error":      msg,
                "error_node": "identify_crop",
                "tokens_used": state["tokens_used"] + val_tokens,
                "cost_usd":    state["cost_usd"] + val_cost,
            }

        logger.info("Image content validated — clear crop leaf confirmed")

    except Exception as val_err:
        # Non-fatal — if validator fails, let pipeline continue
        logger.warning(f"Image content validation failed (non-fatal): {val_err}")

    # ── Step 4b: Identify crop ─────────────────────────────────────────
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
        client = get_llm_client(state["selected_model"])

        user_prompt   = render_prompt(
            "agent/crop_identification.j2",
            known_crops=KNOWN_CROPS,
        )
        system_prompt = render_prompt("agent/crop_identification_system.j2")

        raw, tokens = await client.complete_with_image(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            image_data=state["image_data"],
            image_type=state["image_type"],
            max_tokens=150,
            temperature=0.1,
        )

        parsed     = _parse_json(raw)
        crop       = parsed.get("crop", "general").lower().strip()
        confidence = int(parsed.get("confidence", 0))
        reasoning  = parsed.get("reasoning", "")
        cost       = calculate_cost(tokens=tokens, model=state["selected_model"])

        logger.info(f"Crop identified: '{crop}' ({confidence}%) — {reasoning}")

        if confidence < 60:
            logger.warning(f"Low crop confidence {confidence}% — using 'general'")
            return {
                "crop_identified":         "general",
                "crop_confidence":         confidence,
                "crop_needs_confirmation": True,
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
            "crop_identified":         state.get("plant_type") or "general",
            "crop_confidence":         0,
            "crop_needs_confirmation": False,
        }


# ── Node 5: Describe Symptoms ──────────────────────────────────────────────────

async def describe_symptoms(state: AgentState) -> dict[str, Any]:
    """
    Pure symptom description — prompt in agent/symptom_description.j2.
    Never names a disease. Feeds RAG retrieval and differential diagnosis.
    """
    logger.info("Node 5: Describing symptoms (no disease naming)")

    crop = state.get("crop_identified") or "plant"

    try:
        client = get_llm_client(state["selected_model"])

        user_prompt = render_prompt(
            "agent/symptom_description.j2",
            crop=crop,
            weather_data=state.get("weather_data"),
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state["personality"],
            language=state.get("language", "English"),
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

    effective_crop = (
        state.get("crop_identified") or state.get("plant_type") or "general"
    ).lower()

    logger.info(f"RAG: crop='{effective_crop}'")

    try:
        sources = await lookup_disease(
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


# ── Node 7: Detect Disease ─────────────────────────────────────────────────────

async def detect_disease(state: AgentState) -> dict[str, Any]:
    """
    Differential diagnosis — prompt in agent/disease_detection.j2.
    Returns top-3 diagnoses with causes, evidence, and lab flag.
    """
    logger.info("Node 7: Differential diagnosis (top-3)")

    try:
        client = get_llm_client(state["selected_model"])

        crop      = state.get("crop_identified") or state.get("plant_type") or "unknown plant"
        crop_conf = state.get("crop_confidence") or 0

        user_prompt = render_prompt(
            "agent/disease_detection.j2",
            visual_analysis=state.get("symptom_description") or "",
            retrieved_context=state["retrieved_sources"],
            plant_type=crop,
            crop_confidence=crop_conf,
            personality=state["personality"],
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state["personality"],
            language=state.get("language", "English"),
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


# ── Node 8: Consistency Check ──────────────────────────────────────────────────

async def run_consistency_check(state: AgentState) -> dict[str, Any]:
    """
    Validates biological consistency — pure Python, no LLM, no cost.
    Also replaces GPT's self-reported confidence with a calibrated score.
    """
    logger.info("Node 8: Biological consistency check")

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

    rag_top_score = (
        max(s.similarity_score for s in state["retrieved_sources"])
        if state["retrieved_sources"] else 0.0
    )

    calibrated = compute_calibrated_confidence(
        gpt_raw_score       =primary.get("probability", 50),
        rag_top_score       =rag_top_score,
        rag_chunks_passed   =len(state["retrieved_sources"]),
        consistency_penalty =result["confidence_penalty"],
        crop_confidence     =float(state.get("crop_confidence") or 0),
    )

    logger.info(
        f"Consistency: {'OK' if result['consistent'] else 'WARNINGS'} | "
        f"Calibrated confidence: {calibrated}% "
        f"(raw was {primary.get('probability', 50)}%)"
    )

    current_diagnosis = state["diagnosis"]
    updated_diagnosis = (
        current_diagnosis.copy(update={"confidence_score": calibrated})
        if current_diagnosis else None
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
        client    = get_llm_client(state["selected_model"])
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
            language=state.get("language", "English"),
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


# ── Node 9b: Treatment Path ────────────────────────────────────────────────────
async def treatment_path(state: AgentState) -> dict[str, Any]:
    """
    Category-constrained treatment generation.
    Prompt in agent/treatment.j2 — category rules are in the template.
    Post-generation consistency check validates treatments are appropriate.
    """
    logger.info("Node 9b: Treatment path")
    try:
        client         = get_llm_client(state["selected_model"])
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
            retrieved_context=state["retrieved_sources"],
            weather_data=state.get("weather_data"),
            personality=state["personality"],
            differential_diagnoses=diff_diagnoses,
        )
        system_prompt = render_prompt(
            "agent/system.j2",
            personality=state["personality"],
            language=state.get("language", "English"),
        )

        raw, tokens = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            max_tokens=800,
            temperature=0.2,
        )
        treatments = _parse_json(raw) if raw.strip().startswith("[") else []
        cost       = calculate_cost(tokens=tokens, model=state["selected_model"])

        # Post-generation consistency check on actual treatments
        extra_warnings = []
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
                extra_warnings = consistency["warnings"]

        logger.info(f"Generated {len(treatments)} treatments for category='{category}'")

        # ── Generate prevention tips for diseased plants ───────────────────────
        prevention_tips = []
        try:
            prev_prompt = render_prompt(
                "agent/prevention.j2",
                plant_identified=plant,
                diagnosis=diag_detail,
                disease_category=category,
                retrieved_context=state["retrieved_sources"],
                personality=state["personality"],
            )
            prev_system = render_prompt(
                "agent/system.j2",
                personality=state["personality"],
                language=state.get("language", "English"),
            )

            prev_raw, prev_tokens = await client.complete(
                system_prompt=prev_system,
                user_prompt=prev_prompt,
                max_tokens=600,
                temperature=0.2,
            )

            prevention_tips = _parse_json(prev_raw) if prev_raw.strip().startswith("[") else []

            tokens += prev_tokens
            cost   += calculate_cost(tokens=prev_tokens, model=state["selected_model"])

            logger.info(f"Generated {len(prevention_tips)} prevention tips")

        except Exception as e:
            logger.warning(f"Prevention tips generation failed (non-fatal): {e}")

            prevention_tips = [
                f"Scout your {plant} field twice weekly for early signs of {diag_detail.name if diag_detail else 'disease'}",
                "Remove and destroy all infected plant material immediately — do not compost",
                "Avoid working in the field when leaves are wet to prevent disease spread",
                "Rotate crops each season to break disease cycles",
                "Consult your nearest agricultural extension officer for localised advice",
            ]

        return {
            "treatments":           treatments,
            "prevention_tips":      prevention_tips,
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
# ── Node 10: Format Response ───────────────────────────────────────────────────

async def format_response(state: AgentState) -> dict[str, Any]:
    """
    Assemble and enrich final response.
    """
    logger.info("Node 10: Formatting final response")

    try:
        from utils.output_formatter import enrich_response
        from utils.disease_resources import enrich_response_with_resources

        diagnosis = state.get("diagnosis")

        # Convert diagnosis to dict safely
        if diagnosis:
            if hasattr(diagnosis, "model_dump"):
                diagnosis_dict = diagnosis.model_dump(mode="json")
            elif hasattr(diagnosis, "dict"):
                diagnosis_dict = diagnosis.dict()
            else:
                diagnosis_dict = None
        else:
            diagnosis_dict = None

        # Override confidence with calibrated value
        if diagnosis_dict and state.get("calibrated_confidence") is not None:
            diagnosis_dict["confidence_score"] = state["calibrated_confidence"]

        # Normalize sources
        sources_list = [
            s.dict() if hasattr(s, "dict") else s
            for s in state.get("retrieved_sources", [])
        ]

        raw_response = {
            "diagnosis":               diagnosis_dict,
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

        # First enrichment
        enriched = enrich_response(raw_response)

        # ── Get disease name and plant for API lookups ─────────────────────────────
        disease_name = ""
        plant_name = ""

        if diagnosis_dict and diagnosis_dict.get("diagnosis"):
            disease_name = diagnosis_dict["diagnosis"].get("name", "")

        if diagnosis_dict:
            plant_name = diagnosis_dict.get("plant_identified", "")

        resources = enriched.get("resources", [])

        # ── API 1: EPPO Global Database ───────────────────────────────────────────
        try:
            from tools.eppo_api import get_disease_info

            if disease_name and disease_name != "Unknown":
                eppo_data = await get_disease_info(disease_name)

                if eppo_data:
                    enriched["eppo_data"] = eppo_data
                    resources.append({
                        "title":  f"{disease_name} — EPPO Global Database",
                        "url":    eppo_data["url"],
                        "source": "EPPO",
                        "type":   "factsheet",
                    })
                    logger.info(f"EPPO data added for: {disease_name}")

        except Exception as e:
            logger.warning(f"EPPO enrichment failed (non-fatal): {e}")

        # ── API 2: Kindwise Crop.health ───────────────────────────────────────────
        try:
            from tools.crop_health_api import identify_with_crop_health

            image_data = state.get("image_data", "")
            image_type = state.get("image_type", "image/jpeg")

            if image_data:
                crop_health_result = await identify_with_crop_health(
                    image_base64=image_data,
                    image_type=image_type,
                )

                if crop_health_result:
                    enriched["crop_health_data"] = crop_health_result
                    resources.append({
                        "title":  f"{disease_name} — Kindwise Crop.health AI",
                        "url":    "https://crop.kindwise.com",
                        "source": "Kindwise",
                        "type":   "ai_second_opinion",
                    })
                    logger.info("Crop.health second opinion added")

        except Exception as e:
            logger.warning(f"Crop.health enrichment failed (non-fatal): {e}")

        # ── API 3: CGIAR Open Data ────────────────────────────────────────────────
        try:
            from tools.cgiar_api import search_cgiar

            if disease_name and plant_name:
                cgiar_resources = await search_cgiar(
                    crop=plant_name,
                    disease=disease_name,
                )

                if cgiar_resources:
                    resources.extend(cgiar_resources)
                    logger.info(f"CGIAR resources added: {len(cgiar_resources)}")

        except Exception as e:
            logger.warning(f"CGIAR enrichment failed (non-fatal): {e}")

        # ── API 4: Disease Resources (local mapping) ──────────────────────────────
        try:
            from utils.disease_resources import get_resources_for_disease

            local_resources = get_resources_for_disease(
                disease_name=disease_name,
                plant=plant_name,
            )

            existing_urls = {r.get("url") for r in resources}

            for r in local_resources:
                if r["url"] not in existing_urls:
                    resources.append(r)

            logger.info(f"Local disease resources added: {len(local_resources)}")

        except Exception as e:
            logger.warning(f"Local resources failed (non-fatal): {e}")

        # ── Save resources ────────────────────────────────────────────────────────
        enriched["resources"] = resources
        logger.info(f"Total resources attached to diagnosis: {len(resources)}")

        # Resource enrichment
        disease_name = ""
        plant_name = ""

        if diagnosis_dict:
            plant_name = diagnosis_dict.get("plant_identified", "")
            if diagnosis_dict.get("diagnosis"):
                disease_name = diagnosis_dict["diagnosis"].get("name", "")

        enriched = enrich_response_with_resources(
            response=enriched,
            disease_name=disease_name,
            plant=plant_name,
        )

        logger.info("Response formatted and enriched successfully")

        return {"final_response": enriched}

    except Exception as e:
        logger.error(f"Format response failed: {e}")
        return {
            "error": f"Response formatting failed: {str(e)}",
            "error_node": "format_response",
        }
# ── Node 11: Save Memory ───────────────────────────────────────────────────────

async def save_memory(state: AgentState) -> dict[str, Any]:
    logger.info("Node 11: Saving to memory")
    diagnosis_id = None
    try:
        diagnosis = state.get("diagnosis")
        if state.get("user_id") and diagnosis:
            lt = LongTermMemory(user_id=state["user_id"])
            _d = diagnosis.model_dump(mode="json") if hasattr(diagnosis, "model_dump") else diagnosis.dict()
            diagnosis_id = lt.save_diagnosis(
                diagnosis=_d,
                tokens_used=state.get("tokens_used", 0),
                cost_usd=state.get("cost_usd", 0.0),
            )
            logger.info(f"Saved to Supabase: {diagnosis_id}")

        if state.get("session_id") and diagnosis:
            st = ShortTermMemory(session_id=state["session_id"])
            _d2 = diagnosis.model_dump(mode="json") if hasattr(diagnosis, "model_dump") else diagnosis.dict()
            st.save_diagnosis(_d2)
            st.save_message(
                role="assistant",
                content=f"Diagnosed: {diagnosis.diagnosis.name}",
            )
            logger.info(f"Saved to Redis: {state['session_id']}")

        return {"diagnosis_id": diagnosis_id}
    except Exception as e:
        logger.error(f"Memory save failed: {e}")
        return {"diagnosis_id": None}
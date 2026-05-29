"""
agent/consistency_checker.py

LangGraph node that validates the top diagnosis against
visual evidence before the response is formatted.

Catches cases where the LLM makes an overconfident or
inconsistent diagnosis — e.g. diagnosing a bacterial
disease with no bacterial symptoms, or diagnosing a
disease not present in the knowledge base.

Added as part of reviewer improvement:
  "add consistency_checker.py under agent"
"""

import logging
from typing import Any
from agent.state import AgentState

logger = logging.getLogger(__name__)


def _get(state, key, default=None):
    if isinstance(state, dict):
        return state.get(key, default)
    return getattr(state, key, default)


async def run_consistency_check(
    state: AgentState
) -> dict[str, Any]:
    """
    Validate the top diagnosis for internal consistency.

    Checks:
    1. Probability is appropriate given RAG support level
    2. Disease category matches treatment type
    3. Confidence is not inflated without knowledge base support
    4. Flags diagnosis for lab confirmation if confidence is low

    Args:
        state: Current agent state with diagnosis set

    Returns:
        dict: Updated state — may lower confidence,
              add requires_lab_confirmation flag,
              or set a consistency warning.
    """
    logger.info("Consistency check: validating diagnosis")

    diagnosis = _get(state, "diagnosis")
    retrieved_sources = _get(state, "retrieved_sources", [])
    crop_confidence = _get(state, "crop_confidence", 0) or 0

    if not diagnosis:
        logger.warning("Consistency check: no diagnosis to validate")
        return {}

    # Get top diagnosis details
    diagnoses = getattr(diagnosis, "diagnoses", None)
    if isinstance(diagnosis, dict):
        diagnoses = diagnosis.get("diagnoses", [])

    if not diagnoses:
        return {}

    top = diagnoses[0] if isinstance(diagnoses, list) else diagnoses
    if isinstance(top, dict):
        probability     = top.get("probability", 0)
        category        = top.get("category", "unknown")
        requires_lab    = top.get("requires_lab_confirmation", False)
    else:
        probability     = getattr(top, "probability", 0)
        category        = getattr(top, "category", "unknown")
        requires_lab    = getattr(top, "requires_lab_confirmation", False)

    warnings = []
    adjusted = False

    # Rule 1: No RAG support → cap confidence at 40%
    if not retrieved_sources and probability > 40:
        logger.warning(
            f"Consistency: no RAG sources but probability={probability}% "
            f"— capping at 40%"
        )
        if isinstance(top, dict):
            top["probability"] = 40
            top["requires_lab_confirmation"] = True
        warnings.append(
            "Diagnosis confidence reduced — no verified knowledge base "
            "match found. Field or laboratory confirmation recommended."
        )
        adjusted = True

    # Rule 2: Low crop confidence → cap disease confidence
    if crop_confidence < 60 and probability > 35:
        logger.warning(
            f"Consistency: crop_confidence={crop_confidence}% is low "
            f"— capping disease probability at 35%"
        )
        if isinstance(top, dict):
            top["probability"] = min(top.get("probability", 35), 35)
            top["requires_lab_confirmation"] = True
        warnings.append(
            "Crop identification confidence is low — disease diagnosis "
            "certainty is limited. Upload a clearer image for better results."
        )
        adjusted = True

    # Rule 3: Viral disease → always requires lab confirmation
    if category == "viral" and not requires_lab:
        if isinstance(top, dict):
            top["requires_lab_confirmation"] = True
        warnings.append(
            "Viral diseases cannot be confirmed from image alone — "
            "laboratory testing is strongly recommended."
        )

    # Rule 4: Very high confidence without RAG → warn
    if probability > 85 and len(retrieved_sources) < 2:
        logger.warning(
            f"Consistency: high probability={probability}% "
            f"with only {len(retrieved_sources)} RAG sources"
        )
        warnings.append(
            "High confidence diagnosis based primarily on visual analysis. "
            "Verify with a local extension officer or agrovet."
        )

    if adjusted or warnings:
        logger.info(
            f"Consistency check complete — "
            f"adjusted={adjusted}, warnings={len(warnings)}"
        )
    else:
        logger.info("Consistency check passed — no adjustments needed")

    # Return updated state
    updates = {}
    if warnings:
        # Append consistency warnings to farmer_advice
        if isinstance(diagnosis, dict):
            existing = diagnosis.get("farmer_advice", "")
            diagnosis["farmer_advice"] = (
                existing + " " + " ".join(warnings)
            ).strip()
            updates["diagnosis"] = diagnosis

    return updates

CATEGORY_RULES: dict = {
    "fungal":              {"incompatible_symptoms": ["water-soaked streaks","bacterial ooze","mosaic pattern","interveinal chlorosis"], "invalid_treatments": ["bactericide","antibiotic"]},
    "bacterial":           {"incompatible_symptoms": ["powdery coating","rust pustules","mosaic","ring spots","interveinal chlorosis"], "invalid_treatments": ["fungicide","neem oil for disease"]},
    "viral":               {"incompatible_symptoms": ["powdery coating","rust","water-soaked","ooze","angular"], "invalid_treatments": ["fungicide","bactericide","copper spray","neem oil"]},
    "insect":              {"incompatible_symptoms": ["powdery coating","water-soaked","angular","mosaic"], "invalid_treatments": ["fungicide","bactericide"]},
    "nutrient_deficiency": {"incompatible_symptoms": ["water-soaked","ooze","ring pattern","lesions with halo","powdery coating","discrete spots with border"], "invalid_treatments": ["fungicide","bactericide","insecticide"]},
    "abiotic_stress":      {"incompatible_symptoms": ["discrete spots with halo","powdery coating","ooze","water-soaked angular spots"], "invalid_treatments": ["fungicide","bactericide","insecticide"]},
}
 
 
def infer_category(disease_name: str, description: str = "") -> str:
    """Infer biological category from disease name and description."""
    combined = (disease_name + " " + description).lower()
    checks = [
        ("viral",              ["virus","viral","mosaic","mottle","streak virus"]),
        ("bacterial",          ["bacterial","xanthomonas","pseudomonas","erwinia","angular leaf spot"]),
        ("fungal",             ["fungal","rust","mildew","anthracnose","blight","alternaria","cercospora","phoma","fusarium","powdery","downy","smut"]),
        ("insect",             ["aphid","mite","thrips","bollworm","caterpillar","leafminer","whitefly","scale"]),
        ("nutrient_deficiency",["deficiency","chlorosis","nutrient"]),
        ("abiotic_stress",     ["drought","stress","toxicity","injury","burn","frost","salinity","flooding"]),
    ]
    for category, keywords in checks:
        if any(kw in combined for kw in keywords):
            return category
    return "unknown"
 
 
def check_consistency(
    diagnosis_name: str,
    category: str,
    symptoms_seen: list,
    treatments: list,
    description: str = "",
) -> dict:
    """
    Validate biological consistency of a diagnosis.
    Returns dict with keys: consistent, warnings, confidence_penalty, category
    """
    import logging as _logging
    _logger = _logging.getLogger(__name__)
 
    warnings: list = []
 
    if category not in CATEGORY_RULES:
        return {"consistent": True, "warnings": [], "confidence_penalty": 0, "category": category}
 
    rules = CATEGORY_RULES[category]
    symptoms_lower = " ".join(str(s).lower() for s in symptoms_seen) + " " + description.lower()
 
    for incompatible in rules.get("incompatible_symptoms", []):
        if incompatible in symptoms_lower:
            warnings.append(
                f"Symptom '{incompatible}' is inconsistent with a {category} "
                f"diagnosis of '{diagnosis_name}'."
            )
 
    for treatment in treatments:
        action = treatment.get("action", "").lower() if isinstance(treatment, dict) else ""
        details = treatment.get("details", "").lower() if isinstance(treatment, dict) else ""
        combined = action + " " + details
        for invalid in rules.get("invalid_treatments", []):
            if invalid in combined:
                warnings.append(
                    f"Treatment '{action}' is not appropriate for a {category} diagnosis."
                )
 
    confidence_penalty = min(len(warnings) * 10, 40)
 
    if warnings:
        _logger.warning(f"Consistency warnings for '{diagnosis_name}': {len(warnings)}")
 
    return {
        "consistent":         len(warnings) == 0,
        "warnings":           warnings,
        "confidence_penalty": confidence_penalty,
        "category":           category,
    }
 
 
def compute_calibrated_confidence(
    gpt_raw_score: float,
    rag_top_score: float,
    rag_chunks_passed: int,
    consistency_penalty: int,
    crop_confidence: float,
) -> float:
    """Evidence-based confidence score replacing GPT self-report."""
    rag_score  = (rag_top_score * 0.7 + min(rag_chunks_passed, 3) / 3 * 0.3)
    gpt_score  = gpt_raw_score / 100
    crop_score = crop_confidence / 100
 
    base = (rag_score * 0.40 + gpt_score * 0.25 + crop_score * 0.20 + 0.15) * 100
    calibrated = base - consistency_penalty
 
    if rag_chunks_passed == 0:
        calibrated = min(calibrated, 40)
    if crop_confidence < 60:
        calibrated = min(calibrated, 35)
    if consistency_penalty >= 20:
        calibrated = min(calibrated, 30)
 
    return round(max(5.0, min(95.0, calibrated)), 1)
"""
Output formatter for CropGuard AI.

Enriches the raw agent response with:
  - Confidence labels (Low / Moderate / Good / High / Very High)
  - Urgency descriptions (act within X days)
  - Hedged disease naming (Likely / Probable / Consistent with)
  - Low-confidence disclaimer
  - Professional agronomic language throughout

Called by format_response node before returning to the frontend.
No LLM call — pure Python transformation.
"""

from typing import Optional


def get_confidence_label(score: float) -> str:
    if score >= 90: return "Very High Confidence"
    elif score >= 80: return "High Confidence"
    elif score >= 65: return "Good Confidence"
    elif score >= 50: return "Moderate Confidence"
    elif score >= 35: return "Low Confidence"
    else: return "Very Low Confidence — Laboratory Confirmation Recommended"


def get_confidence_disclaimer(score: float, rag_sources: int) -> Optional[str]:
    if score < 50:
        return (
            "Image quality or overlapping symptom patterns may reduce certainty. "
            "This assessment is indicative only. Laboratory analysis or expert "
            "field inspection is strongly recommended before applying treatments."
        )
    if score < 65 and rag_sources == 0:
        return (
            "No matching records were found in the knowledge base for this crop "
            "and symptom combination. The diagnosis is based on visual pattern "
            "recognition only. Consider consulting an agricultural extension officer."
        )
    if score < 65:
        return (
            "Moderate confidence — visual symptoms are consistent with this diagnosis "
            "but are not definitive from image alone. Monitor closely and confirm "
            "with a field agronomist if symptoms progress."
        )
    return None


URGENCY_DESCRIPTIONS = {
    "low":      "Monitor — No immediate action required. Observe for changes over the next 2–3 weeks.",
    "medium":   "Act within 3–7 days — Symptoms are progressing. Begin management soon to prevent spread.",
    "high":     "Act within 48 hours — Disease is actively spreading. Immediate intervention required.",
    "critical": "Act today — Severe infection risk. Delay will result in significant crop loss.",
}


def get_urgency_description(urgency: str) -> str:
    return URGENCY_DESCRIPTIONS.get(urgency.lower(), URGENCY_DESCRIPTIONS["medium"])


def get_hedged_disease_name(
    disease_name: str,
    confidence: float,
    requires_lab: bool = False,
) -> str:
    name = disease_name.strip()
    if confidence >= 80 and not requires_lab: return name
    elif confidence >= 65: return f"Likely {name}"
    elif confidence >= 50: return f"Probable {name}"
    else: return f"Possible {name} (confirmation required)"


def get_diagnosis_preamble(
    disease_name: str,
    category: str,
    confidence: float,
    scientific_name: Optional[str] = None,
) -> str:
    sci = f" (*{scientific_name}*)" if scientific_name else ""
    category_phrases = {
        "fungal":              "fungal pathogens",
        "bacterial":           "bacterial infection",
        "viral":               "viral infection",
        "insect":              "insect or pest activity",
        "nutrient_deficiency": "nutrient deficiency",
        "abiotic_stress":      "abiotic stress factors",
    }
    category_phrase = category_phrases.get(category, "an unidentified cause")

    if confidence >= 80:
        return (
            f"Visual symptoms are strongly consistent with {disease_name}{sci}, "
            f"associated with {category_phrase}."
        )
    elif confidence >= 65:
        return (
            f"Symptoms are likely consistent with {disease_name}{sci}. "
            f"Image-based assessment suggests involvement of {category_phrase}, "
            f"though field confirmation is advisable."
        )
    elif confidence >= 50:
        return (
            f"Observed symptoms may be associated with {disease_name}{sci}, "
            f"possibly linked to {category_phrase}. "
            f"Diagnosis from image alone is not definitive."
        )
    else:
        return (
            f"Symptoms resemble those of {disease_name}{sci}, "
            f"potentially involving {category_phrase}. "
            f"Confidence is low — laboratory or expert confirmation is required "
            f"before initiating treatment."
        )


SEVERITY_DESCRIPTIONS = {
    "none":     "No visible symptoms — plant appears healthy.",
    "mild":     "Mild — Early-stage symptoms affecting a small proportion of leaf area. Monitor closely.",
    "moderate": "Moderate — Symptoms are established and spreading. Prompt management is advised.",
    "severe":   "Severe — Extensive damage observed. Immediate intervention is necessary.",
    "critical": "Critical — Widespread infection threatening plant survival. Act today.",
}


def get_severity_description(severity: str) -> str:
    return SEVERITY_DESCRIPTIONS.get(severity.lower(), SEVERITY_DESCRIPTIONS["mild"])


def enrich_response(response: dict) -> dict:
    """
    Takes the raw agent response dict and adds professional
    wording fields without modifying existing fields.
    """
    if not response or response.get("error"):
        return response

    diagnosis      = response.get("diagnosis") or {}
    diag_detail    = diagnosis.get("diagnosis") or {}
    differential   = response.get("differential_diagnoses") or []
    primary        = differential[0] if differential else {}

    confidence   = float(diagnosis.get("confidence_score") or 0)
    rag_count    = len(response.get("sources") or [])
    _sev         = diag_detail.get("severity", "mild")
    severity     = _sev.value if hasattr(_sev, "value") else str(_sev)
    _urg         = diagnosis.get("urgency", "medium")
    urgency      = _urg.value if hasattr(_urg, "value") else str(_urg)
    disease_name = str(diag_detail.get("name") or "Unknown")
    scientific   = diag_detail.get("scientific_name")
    category     = str(primary.get("category") or "unknown")
    requires_lab = bool(primary.get("requires_lab_confirmation", False))

    response["confidence_label"]      = get_confidence_label(confidence)
    response["confidence_disclaimer"] = get_confidence_disclaimer(confidence, rag_count)
    response["hedged_disease_name"]   = get_hedged_disease_name(disease_name, confidence, requires_lab)
    response["diagnosis_preamble"]    = get_diagnosis_preamble(disease_name, category, confidence, scientific)
    response["severity_description"]  = get_severity_description(severity)
    response["urgency_description"]   = get_urgency_description(urgency)

    for d in differential:
        d["hedged_name"] = get_hedged_disease_name(
            d.get("name", "Unknown"),
            d.get("probability", 0),
            d.get("requires_lab_confirmation", False),
        )

    return response
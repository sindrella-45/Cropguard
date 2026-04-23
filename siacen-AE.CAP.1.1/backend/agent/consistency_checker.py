"""
Biological consistency checker — pure Python, no LLM.

Validates that the diagnosis category (fungal/bacterial/viral/
nutrient/abiotic) is consistent with the symptoms described and
that treatments are appropriate for that category.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Category rules ─────────────────────────────────────────────────────────────

CATEGORY_RULES: dict[str, dict] = {
    "fungal": {
        "indicator_keywords": [
            "rust", "mildew", "mold", "blight", "rot", "anthracnose",
            "cercospora", "alternaria", "fusarium", "phoma", "scab",
            "powdery", "downy", "smut", "leaf spot", "gray mold",
        ],
        "compatible_symptoms": [
            "powdery coating", "rust pustules", "gray mold", "brown spots",
            "leaf spot", "ring pattern", "concentric", "sporulation",
            "white growth", "orange spots", "black spots", "necrotic",
        ],
        "incompatible_symptoms": [
            "water-soaked streaks", "bacterial ooze", "mosaic pattern",
            "interveinal chlorosis", "uniform yellowing", "tip burn only",
        ],
        "valid_treatments": ["fungicide", "copper", "neem", "remove infected", "improve air"],
        "invalid_treatments": ["bactericide", "antibiotic"],
        "has_cure": True,
    },
    "bacterial": {
        "indicator_keywords": [
            "bacterial", "blight", "canker", "wilt", "rot", "xanthomonas",
            "pseudomonas", "erwinia", "agrobacterium", "angular leaf spot",
        ],
        "compatible_symptoms": [
            "water-soaked", "angular lesions", "yellowing halo", "ooze",
            "wilting", "streak", "blight", "water-soaked spots", "greasy",
        ],
        "incompatible_symptoms": [
            "powdery coating", "rust pustules", "mosaic", "ring spots",
            "interveinal chlorosis",
        ],
        "valid_treatments": [
            "copper bactericide", "copper hydroxide", "copper oxychloride",
            "remove infected", "avoid overhead irrigation", "disinfect tools",
        ],
        "invalid_treatments": ["fungicide", "neem oil for disease"],
        "has_cure": True,
    },
    "viral": {
        "indicator_keywords": [
            "virus", "viral", "mosaic", "mottle", "streak virus", "ring spot",
            "yellows", "dwarf", "stunt", "curl", "gemini",
        ],
        "compatible_symptoms": [
            "mosaic", "mottling", "distortion", "curling", "stunting",
            "ring spots", "yellowing pattern", "vein clearing", "necrotic ring",
        ],
        "incompatible_symptoms": [
            "powdery coating", "rust", "water-soaked", "ooze", "angular",
        ],
        "valid_treatments": [
            "remove infected plant", "control insect vector", "resistant variety",
            "rogueing", "disinfect tools",
        ],
        "invalid_treatments": [
            "fungicide", "bactericide", "copper spray", "neem oil",
        ],
        "has_cure": False,
    },
    "insect": {
        "indicator_keywords": [
            "aphid", "mite", "thrips", "whitefly", "caterpillar", "bollworm",
            "leafminer", "scale", "mealybug", "weevil", "moth", "beetle",
        ],
        "compatible_symptoms": [
            "holes", "bite marks", "tunneling", "silvering", "stippling",
            "webbing", "honeydew", "sooty mold", "distortion", "galls",
        ],
        "incompatible_symptoms": [
            "powdery coating", "water-soaked", "angular", "mosaic",
        ],
        "valid_treatments": [
            "insecticide", "neem oil", "soap spray", "remove pests",
            "biological control", "sticky traps",
        ],
        "invalid_treatments": ["fungicide", "bactericide"],
        "has_cure": True,
    },
    "nutrient_deficiency": {
        "indicator_keywords": [
            "deficiency", "chlorosis", "nitrogen", "phosphorus", "potassium",
            "magnesium", "iron", "zinc", "manganese", "calcium", "sulfur",
            "micronutrient",
        ],
        "compatible_symptoms": [
            "interveinal chlorosis", "marginal scorch", "purple tint",
            "uniform yellowing", "tip burn", "pale green", "stunted growth",
            "older leaves yellow", "youngest leaves pale",
        ],
        "incompatible_symptoms": [
            "water-soaked", "ooze", "ring pattern", "lesions with halo",
            "powdery coating", "discrete spots with border",
        ],
        "valid_treatments": [
            "apply fertilizer", "soil amendment", "foliar spray",
            "soil ph correction", "liming", "micronutrient supplement",
        ],
        "invalid_treatments": ["fungicide", "bactericide", "insecticide"],
        "has_cure": True,
    },
    "abiotic_stress": {
        "indicator_keywords": [
            "drought", "heat stress", "waterlogging", "chemical injury",
            "frost", "salinity", "toxicity", "sunscald", "windburn",
            "root damage", "compaction", "flooding",
        ],
        "compatible_symptoms": [
            "wilting", "scorch", "bleaching", "tip burn", "uniform pattern",
            "whole-plant symptoms", "marginal burn", "crispy edges",
        ],
        "incompatible_symptoms": [
            "discrete spots with halo", "powdery coating", "ooze",
            "water-soaked angular spots",
        ],
        "valid_treatments": [
            "improve irrigation", "reduce chemical application",
            "improve drainage", "shade cloth", "soil moisture management",
        ],
        "invalid_treatments": [
            "fungicide", "bactericide", "insecticide",
        ],
        "has_cure": True,
    },
}

# ── Category inference ─────────────────────────────────────────────────────────

def infer_category(disease_name: str, description: str = "") -> str:
    """Infer the biological category from disease name and description."""
    combined = (disease_name + " " + description).lower()

    # Order matters — check most specific first
    checks = [
        ("viral",              ["virus", "viral", "mosaic", "mottle", "streak virus"]),
        ("bacterial",          ["bacterial", "xanthomonas", "pseudomonas", "erwinia",
                                "angular leaf spot", "fire blight"]),
        ("fungal",             ["fungal", "rust", "mildew", "anthracnose", "blight",
                                "alternaria", "cercospora", "phoma", "fusarium",
                                "powdery", "downy", "smut"]),
        ("insect",             ["aphid", "mite", "thrips", "bollworm", "caterpillar",
                                "leafminer", "whitefly", "scale"]),
        ("nutrient_deficiency",["deficiency", "chlorosis", "nutrient"]),
        ("abiotic_stress",     ["drought", "stress", "toxicity", "injury", "burn",
                                "frost", "salinity", "flooding"]),
    ]

    for category, keywords in checks:
        if any(kw in combined for kw in keywords):
            return category

    return "unknown"


# ── Main checker ───────────────────────────────────────────────────────────────

def check_consistency(
    diagnosis_name:  str,
    category:        str,
    symptoms_seen:   list[str],
    treatments:      list[dict],
    description:     str = "",
) -> dict:
    """
    Validate biological consistency of a diagnosis.

    Returns:
        dict with keys:
            consistent:         bool
            warnings:           list of warning strings
            confidence_penalty: int (deducted from confidence score)
            category:           inferred category
    """
    warnings: list[str] = []

    if category not in CATEGORY_RULES:
        logger.debug(f"No rules for category '{category}' — skipping check")
        return {"consistent": True, "warnings": [], "confidence_penalty": 0, "category": category}

    rules = CATEGORY_RULES[category]
    symptoms_lower = " ".join(s.lower() for s in symptoms_seen) + " " + description.lower()

    # Check for incompatible symptoms
    for incompatible in rules["incompatible_symptoms"]:
        if incompatible in symptoms_lower:
            warnings.append(
                f"Symptom '{incompatible}' is biologically inconsistent "
                f"with a {category} diagnosis of '{diagnosis_name}'. "
                f"Consider nutrient deficiency or alternative category."
            )

    # Check treatment appropriateness
    for treatment in treatments:
        action = treatment.get("action", "").lower()
        details = treatment.get("details", "").lower()
        combined = action + " " + details

        for invalid in rules.get("invalid_treatments", []):
            if invalid in combined:
                warnings.append(
                    f"Treatment '{action}' ({invalid}) is NOT appropriate "
                    f"for a {category} diagnosis. "
                    + _get_treatment_correction(category, invalid)
                )

    # Special rule: viral diseases have no chemical cure
    if category == "viral" and not rules["has_cure"]:
        for treatment in treatments:
            action = treatment.get("action", "").lower()
            if any(chem in action for chem in ["spray", "apply", "fungicide", "bactericide", "neem"]):
                if "vector" not in action and "insect" not in action:
                    warnings.append(
                        f"Viral diseases cannot be cured chemically. "
                        f"Treatment '{action}' will not eliminate the virus. "
                        f"Focus on removing infected plants and controlling insect vectors."
                    )

    confidence_penalty = min(len(warnings) * 10, 40)  # max -40

    if warnings:
        logger.warning(
            f"Consistency check failed for '{diagnosis_name}' ({category}): "
            f"{len(warnings)} warning(s)"
        )
        for w in warnings:
            logger.warning(f"  ⚠ {w}")

    return {
        "consistent":         len(warnings) == 0,
        "warnings":           warnings,
        "confidence_penalty": confidence_penalty,
        "category":           category,
    }


def _get_treatment_correction(category: str, invalid_treatment: str) -> str:
    corrections = {
        ("bacterial", "fungicide"): "Use copper-based bactericide instead.",
        ("bacterial", "neem oil"):  "Neem oil treats fungal/insect issues. Use copper bactericide.",
        ("viral",    "fungicide"):  "No fungicide works on viruses. Remove plant and control vectors.",
        ("viral",    "bactericide"):"No bactericide works on viruses. Remove plant and control vectors.",
        ("nutrient_deficiency", "fungicide"):   "This is a nutrient issue, not a disease. Apply the deficient nutrient.",
        ("nutrient_deficiency", "bactericide"): "This is a nutrient issue. Correct soil pH and fertilize.",
        ("abiotic_stress", "fungicide"):        "This is environmental stress, not a disease. Fix the root cause.",
    }
    return corrections.get((category, invalid_treatment), "Review treatment suitability.")


# ── Confidence calibration ─────────────────────────────────────────────────────

def compute_calibrated_confidence(
    gpt_raw_score:       float,
    rag_top_score:       float,
    rag_chunks_passed:   int,
    consistency_penalty: int,
    crop_confidence:     float,   # 0-100
) -> float:
    """
    Compute evidence-based confidence replacing GPT's self-reported score.

    Weights:
      40% — RAG evidence quality (most reliable signal)
      25% — GPT's own estimate (discounted — tends to overstate)
      20% — Crop identification confidence
      15% — Consistency (penalties applied separately)
    """
    rag_score  = (rag_top_score * 0.7 + min(rag_chunks_passed, 3) / 3 * 0.3)
    gpt_score  = gpt_raw_score / 100
    crop_score = crop_confidence / 100

    base = (
        rag_score  * 0.40 +
        gpt_score  * 0.25 +
        crop_score * 0.20 +
        0.15               # baseline for having a valid image
    ) * 100

    # Penalties
    calibrated = base - consistency_penalty
    if rag_chunks_passed == 0:
        calibrated = min(calibrated, 40)   # no knowledge base = max 40%
    if crop_confidence < 60:
        calibrated = min(calibrated, 35)   # uncertain crop = max 35%
    if consistency_penalty >= 20:
        calibrated = min(calibrated, 30)   # contradictory = max 30%

    return round(max(5.0, min(95.0, calibrated)), 1)
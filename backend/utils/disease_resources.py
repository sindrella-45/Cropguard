# backend/utils/disease_resources.py
"""
Maps disease names to authoritative online resources.

These are real, free, publicly accessible URLs from
CABI, FAO, NARO Uganda, and other agricultural bodies.

Used by format_response node to enrich every diagnosis
with reading resources for the farmer or extension officer.

Usage:
    from utils.disease_resources import get_resources_for_disease

    resources = get_resources_for_disease(
        disease_name="Late Blight",
        plant="Tomato"
    )
    # Returns list of {title, url, source, type} dicts
"""

from typing import Optional

# ── Disease → Resources Mapping ───────────────────────────────────────────────
# Each entry maps a disease keyword to a list of authoritative resources.
# Keys are lowercase for case-insensitive matching.

DISEASE_RESOURCES: dict[str, list[dict]] = {

    # ── Tomato Diseases ────────────────────────────────────────────────────────
    "late blight": [
        {
            "title":  "Late Blight of Tomato — CABI Compendium",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.40970",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Managing Late Blight in East Africa — FAO",
            "url":    "https://www.fao.org/agriculture/crops/thematic-sitemap/theme/spi/scpi-home/managing-ecosystems/en/",
            "source": "FAO",
            "type":   "guide",
        },
        {
            "title":  "Tomato Late Blight Control — NARO Uganda",
            "url":    "https://www.naro.go.ug/index.php/resource-centre",
            "source": "NARO Uganda",
            "type":   "local_guide",
        },
    ],

    "early blight": [
        {
            "title":  "Early Blight of Tomato — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.5765",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Alternaria Early Blight Management",
            "url":    "https://plantix.net/en/library/plant-diseases/200044/early-blight-of-tomato",
            "source": "Plantix",
            "type":   "guide",
        },
    ],

    "bacterial spot": [
        {
            "title":  "Bacterial Spot of Tomato — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.10179",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    "mosaic virus": [
        {
            "title":  "Tomato Mosaic Virus — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.54094",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    # ── Maize Diseases ─────────────────────────────────────────────────────────
    "fall armyworm": [
        {
            "title":  "Fall Armyworm in Africa — FAO Emergency Guide",
            "url":    "https://www.fao.org/fall-armyworm/en/",
            "source": "FAO",
            "type":   "emergency_guide",
        },
        {
            "title":  "Fall Armyworm Management — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.29810",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Fall Armyworm Uganda — MAAIF Advisory",
            "url":    "https://www.agriculture.go.ug/fall-armyworm/",
            "source": "Uganda MAAIF",
            "type":   "local_guide",
        },
        {
            "title":  "IITA Fall Armyworm Control in East Africa",
            "url":    "https://www.iita.org/news-item/iita-leads-efforts-to-address-fall-armyworm-in-sub-saharan-africa/",
            "source": "IITA",
            "type":   "research",
        },
    ],

    "maize streak virus": [
        {
            "title":  "Maize Streak Virus — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.32246",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Maize Streak Disease in Africa — IITA",
            "url":    "https://www.iita.org/iita-research/maize/",
            "source": "IITA",
            "type":   "research",
        },
    ],

    "grey leaf spot": [
        {
            "title":  "Grey Leaf Spot of Maize — CIMMYT",
            "url":    "https://www.cimmyt.org/news/maize-grey-leaf-spot/",
            "source": "CIMMYT",
            "type":   "guide",
        },
    ],

    "northern corn leaf blight": [
        {
            "title":  "Northern Corn Leaf Blight — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.26822",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    # ── Coffee Diseases ────────────────────────────────────────────────────────
    "leaf rust": [
        {
            "title":  "Coffee Leaf Rust — CABI Compendium",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.46649",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Coffee Rust Management — ICO Guidelines",
            "url":    "https://www.ico.org/documents/cy2020-21/icc-126-6e-leaf-rust.pdf",
            "source": "International Coffee Organization",
            "type":   "guide",
        },
        {
            "title":  "Coffee Wilt and Rust in Uganda — NARO",
            "url":    "https://www.naro.go.ug/index.php/resource-centre",
            "source": "NARO Uganda",
            "type":   "local_guide",
        },
    ],

    "coffee wilt": [
        {
            "title":  "Coffee Wilt Disease (Tracheomycosis) — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.16500",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Coffee Wilt in Uganda — CQI",
            "url":    "https://www.coffeeinstitute.org/",
            "source": "Coffee Quality Institute",
            "type":   "guide",
        },
    ],

    "coffee berry disease": [
        {
            "title":  "Coffee Berry Disease — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.14235",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    # ── Banana Diseases ────────────────────────────────────────────────────────
    "xanthomonas wilt": [
        {
            "title":  "Banana Xanthomonas Wilt — IITA Guide",
            "url":    "https://www.iita.org/news-item/xanthomonas-wilt/",
            "source": "IITA",
            "type":   "guide",
        },
        {
            "title":  "BXW Management in Uganda — NARO",
            "url":    "https://www.naro.go.ug/index.php/resource-centre",
            "source": "NARO Uganda",
            "type":   "local_guide",
        },
        {
            "title":  "Xanthomonas Wilt of Banana — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.9587",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    "fusarium wilt": [
        {
            "title":  "Fusarium Wilt of Banana (Panama Disease) — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.24179",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Panama Disease — FAO Emergency Alert",
            "url":    "https://www.fao.org/plant-health-2020/focus-areas/banana-fusarium-wilt/en/",
            "source": "FAO",
            "type":   "emergency_guide",
        },
    ],

    "black sigatoka": [
        {
            "title":  "Black Sigatoka of Banana — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.33649",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    # ── Bean Diseases ──────────────────────────────────────────────────────────
    "bean rust": [
        {
            "title":  "Bean Rust — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.49584",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Bean Rust Management — CIAT",
            "url":    "https://ciat.cgiar.org/research/beans/",
            "source": "CIAT",
            "type":   "research",
        },
    ],

    "angular leaf spot": [
        {
            "title":  "Angular Leaf Spot of Bean — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.9616",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    "bean common mosaic": [
        {
            "title":  "Bean Common Mosaic Virus — CABI",
            "url":    "https://www.cabidigitallibrary.org/doi/10.1079/cabicompendium.9617",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    # ── General ───────────────────────────────────────────────────────────────
    "powdery mildew": [
        {
            "title":  "Powdery Mildew Diseases — CABI",
            "url":    "https://www.cabidigitallibrary.org/",
            "source": "CABI",
            "type":   "factsheet",
        },
        {
            "title":  "Powdery Mildew Management — FAO",
            "url":    "https://www.fao.org/agriculture/en/",
            "source": "FAO",
            "type":   "guide",
        },
    ],

    "downy mildew": [
        {
            "title":  "Downy Mildew Diseases — CABI",
            "url":    "https://www.cabidigitallibrary.org/",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],

    "anthracnose": [
        {
            "title":  "Anthracnose Diseases — CABI",
            "url":    "https://www.cabidigitallibrary.org/",
            "source": "CABI",
            "type":   "factsheet",
        },
    ],
}

# ── General resources always included ─────────────────────────────────────────
GENERAL_RESOURCES = [
    {
        "title":  "CABI Crop Protection Compendium — Search Any Disease",
        "url":    "https://www.cabidigitallibrary.org/product/cpc",
        "source": "CABI",
        "type":   "database",
    },
    {
        "title":  "FAO Plant Health Portal",
        "url":    "https://www.fao.org/plant-health-2020/en/",
        "source": "FAO",
        "type":   "portal",
    },
    {
        "title":  "NARO Uganda — Crop Disease Publications",
        "url":    "https://www.naro.go.ug/index.php/resource-centre/publications",
        "source": "NARO Uganda",
        "type":   "local_guide",
    },
    {
        "title":  "Plantix — East Africa Crop Disease App",
        "url":    "https://plantix.net/en/",
        "source": "Plantix",
        "type":   "app",
    },
]


def get_resources_for_disease(
    disease_name: str,
    plant: Optional[str] = None,
    max_results: int = 4,
) -> list[dict]:
    """
    Get authoritative resources for a specific disease.

    Args:
        disease_name: Name of the disease (e.g. "Late Blight")
        plant: Plant name for context (e.g. "Tomato")
        max_results: Maximum resources to return

    Returns:
        List of resource dicts with title, url, source, type

    Example:
        resources = get_resources_for_disease("Late Blight", "Tomato")
        for r in resources:
            print(f"{r['title']}: {r['url']}")
    """
    disease_lower = (disease_name or "").lower()
    resources = []

    # Match against disease keywords
    for keyword, res_list in DISEASE_RESOURCES.items():
        if keyword in disease_lower or disease_lower in keyword:
            resources.extend(res_list)

    # Deduplicate by URL
    seen_urls = set()
    unique = []
    for r in resources:
        if r["url"] not in seen_urls:
            seen_urls.add(r["url"])
            unique.append(r)

    # If few specific resources found, add general ones
    if len(unique) < 2:
        for r in GENERAL_RESOURCES:
            if r["url"] not in seen_urls:
                seen_urls.add(r["url"])
                unique.append(r)

    return unique[:max_results]


def enrich_response_with_resources(
    response: dict,
    disease_name: str,
    plant: Optional[str] = None,
) -> dict:
    """
    Add disease resources to the agent's final response.

    Call this in the format_response node to add
    reading resources to every diagnosis.

    Args:
        response: The agent's final_response dict
        disease_name: Detected disease name
        plant: Plant name

    Returns:
        Response dict with 'resources' field added
    """
    resources = get_resources_for_disease(disease_name, plant)
    response["resources"] = resources
    return response

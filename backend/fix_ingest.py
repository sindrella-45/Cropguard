import asyncio
import logging
from pathlib import Path
from rag.vectorstore.collections import get_or_create_collection
from rag.pipeline import RAGPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PDF_CROP_MAP = {
    # ── Coffee ────────────────────────────────────────────
    "coffee_diseases.pdf":                    "coffee",

    # ── Cocoa ─────────────────────────────────────────────
    "cocoa_diseases.pdf":                     "cocoa",

    # ── Cotton ────────────────────────────────────────────
    "cotton_diseases.pdf":                    "cotton",

    # ── Maize ─────────────────────────────────────────────
    "maize_pests_management.pdf":             "maize",
    "maize_streak_virus.pdf":                 "maize",

    # ── Tomato ────────────────────────────────────────────
    "early_blight_tomato.pdf":                "tomato",
    "cabi_tomato_mosaic.pdf":                 "tomato",
    "Tomato_Disease_Guide.pdf":               "tomato",

    # ── Potato ────────────────────────────────────────────
    "potato_late_blight.pdf":                 "potato",

    # ── Cassava ───────────────────────────────────────────
    "cassava_disease.pdf":                    "cassava",
    "Disease_control_in_cassava_farms_IPM_field_guide_for_extension_agents-1.pdf": "cassava",
    "Pest_control_in_cassava_farms.pdf":      "cassava",

    # ── Cabbage / Kale ────────────────────────────────────
    "aphids_on_cabbage_and_kale.pdf":         "cabbage",

    # ── Sunflower ─────────────────────────────────────────
    "sunflower_diseases.pdf":                 "sunflower",
    "sunflower-diseases.pdf":                 "sunflower",

    # ── Tea ───────────────────────────────────────────────
    "tea-diseases.pdf":                       "tea",

    # ── General / Multi-crop ──────────────────────────────
    "General_diseases.pdf":                   "general",
    "crop_pest_and_diseases.pdf":             "general",
    "integrated_pest_management.pdf":         "general",
    "Seed-Lot-Assessment-Report-Design.pdf":  "general",
}

async def main():
    col = get_or_create_collection()
    total = col.count()
    logger.info(f"Chunks before: {total}")

    if total > 0:
        all_ids = col.get(limit=10000)["ids"]
        col.delete(ids=all_ids)
        logger.info(f"Cleared {len(all_ids)} chunks")

    pipeline = RAGPipeline()
    pipeline.collection = col
    raw_dir = Path("data/raw")

    for pdf_name, crop_tag in PDF_CROP_MAP.items():
        pdf_path = raw_dir / pdf_name
        if not pdf_path.exists():
            logger.warning(f"Not found: {pdf_name}")
            continue
        try:
            logger.info(f"Ingesting {pdf_name} as crop='{crop_tag}'")
            count = await pipeline.ingest_document(str(pdf_path), crop=crop_tag)
            logger.info(f"  Done: {count} chunks")
        except Exception as e:
            logger.error(f"  Failed: {e}")

    final = col.count()
    logger.info(f"Final total: {final} chunks")

    res = col.get(limit=10000)
    if res["metadatas"]:
        crops = {}
        for m in res["metadatas"]:
            c = m.get("crop", "unknown")
            crops[c] = crops.get(c, 0) + 1
        logger.info("By crop:")
        for k, v in sorted(crops.items()):
            logger.info(f"  {k}: {v}")

asyncio.run(main())
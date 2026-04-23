"""
Data ingestion script — updated to include nutrient and abiotic categories.

These are always retrieved alongside crop-specific chunks so the
differential diagnosis model always considers non-disease causes.

"""

import asyncio
import os
import sys
import logging

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from rag import RAGPipeline
from utils.logger import setup_logging

setup_logging(log_level="INFO")
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "data", "raw"
)

# ── UPDATED: includes nutrient and abiotic categories ─────────────────────────
CROP_KEYWORDS: dict[str, list[str]] = {
    "coffee":    ["coffee", "coffea"],
    "tea":       ["tea", "camellia"],
    "cocoa":     ["cocoa", "cacao", "theobroma"],
    "cotton":    ["cotton", "gossypium"],
    "sunflower": ["sunflower", "helianthus"],
    # NEW: non-disease cause categories
    "nutrient":  [
        "nutrient", "deficiency", "nitrogen", "phosphorus", "potassium",
        "magnesium", "iron", "zinc", "manganese", "calcium", "chlorosis",
        "micronutrient", "fertilizer",
    ],
    "abiotic":   [
        "drought", "heat stress", "waterlogging", "flooding", "frost",
        "salinity", "chemical injury", "toxicity", "windburn", "sunscald",
        "abiotic", "stress disorder", "environmental",
    ],
    "general":   [],   # catch-all — matches anything not above
}


def detect_crop(filename: str) -> str:
    """Infer crop category from filename."""
    name_lower = filename.lower()
    for crop, keywords in CROP_KEYWORDS.items():
        if crop == "general":
            continue
        if any(kw in name_lower for kw in keywords):
            logger.info(f"  '{filename}' → crop='{crop}'")
            return crop
    logger.info(f"  '{filename}' → crop='general' (no keyword match)")
    return "general"


async def ingest_all_documents() -> None:
    if not os.path.exists(DATA_DIR):
        logger.error(f"Data directory not found: {DATA_DIR}")
        sys.exit(1)

    pdf_files = [f for f in os.listdir(DATA_DIR) if f.lower().endswith(".pdf")]

    if not pdf_files:
        logger.error(f"No PDF files in {DATA_DIR}")
        sys.exit(1)

    logger.info(f"Found {len(pdf_files)} PDFs to ingest")

    pipeline     = RAGPipeline()
    stats_before = pipeline.get_collection_stats()
    logger.info(f"ChromaDB before: {stats_before['total_chunks']} chunks")

    total_stored = 0

    for pdf_file in pdf_files:
        file_path = os.path.join(DATA_DIR, pdf_file)
        crop      = detect_crop(pdf_file)

        logger.info(f"\n{'─'*50}\nIngesting: {pdf_file} → crop='{crop}'")

        try:
            stored = await pipeline.ingest_document(
                file_path=file_path,
                crop_override=crop,   # pass crop to chunker
            )
            total_stored += stored
            logger.info(f"✓ {pdf_file}: {stored} chunks stored")
        except Exception as e:
            logger.error(f"✗ Failed to ingest {pdf_file}: {e}")
            continue

    stats_after = pipeline.get_collection_stats()
    logger.info(
        f"\n{'═'*50}\n"
        f"Ingestion complete\n"
        f"PDFs processed: {len(pdf_files)}\n"
        f"Chunks stored:  {total_stored}\n"
        f"Total in DB:    {stats_after['total_chunks']}\n"
        f"{'═'*50}"
    )


if __name__ == "__main__":
    asyncio.run(ingest_all_documents())
"""
Disease lookup tool for CropGuard AI.

ROOT CAUSE FIX:
The old version called retrieve_chunks(query, top_k, collection_name)
but retriever.py expects retrieve_chunks(query, crop, top_k, threshold).
This mismatch caused retrieve_chunks to silently fail or return nothing,
which is why the knowledge base always showed 0 sources used.

This version passes the correct arguments.
"""

import logging
from typing import Optional
from config import get_settings
from rag.retrieval.retriever import retrieve_chunks
from models.sources import SourceReference

logger = logging.getLogger(__name__)


async def lookup_disease(
    visual_description: str,
    plant_type: Optional[str] = None,
    crop: Optional[str] = None,
) -> list[SourceReference]:
    """
    Search ChromaDB for disease information matching
    the observed visual symptoms.

    Uses the correct retrieve_chunks(query, crop, top_k, threshold)
    signature that matches what retriever.py actually expects.

    Args:
        visual_description: Description from vision analysis
        plant_type:  Optional farmer hint e.g. "tomato"
        crop:        Auto-detected crop from GPT-4o vision
                     e.g. "coffee", "tea", "cocoa", "general"

    Returns:
        list[SourceReference]: Relevant chunks, empty if none found
    """
    settings = get_settings()

    # Build a focused search query from the visual description
    # Use first 300 chars — enough context without diluting the search
    query_parts = []

    # Use crop or plant_type as the leading term for better retrieval
    effective_crop = crop or plant_type or "general"
    if effective_crop and effective_crop != "general":
        query_parts.append(effective_crop)

    # Append the visual description (truncated)
    query_parts.append(visual_description[:300])
    search_query = " ".join(query_parts)

    logger.info(f"Disease lookup — crop='{effective_crop}', query length={len(search_query)}")

    try:
        # FIXED: call retrieve_chunks with correct signature
        # retriever.py: retrieve_chunks(query, crop, top_k, threshold)
        result = retrieve_chunks(
            query=search_query,
            crop=effective_crop,
            top_k=settings.rag_top_k,
            threshold=settings.rag_similarity_threshold,
        )

        # retrieve_chunks returns a dict:
        # { chunks, sources, fallback, top_score, crop_used }
        if result.get("fallback"):
            top_score = result.get("top_score", 0)
            logger.warning(
                f"RAG fallback triggered — top_score={top_score:.3f} "
                f"below threshold={settings.rag_similarity_threshold}"
            )
            return []

        raw_chunks = result.get("chunks", [])

        if not raw_chunks:
            logger.warning("retrieve_chunks returned empty chunks list")
            return []

        logger.info(
            f"RAG success: {len(raw_chunks)} chunks retrieved "
            f"for crop='{effective_crop}'"
        )

        # Convert to SourceReference models
        sources = []
        for chunk in raw_chunks:
            try:
                sources.append(SourceReference(
                    document_name=chunk.get("source_file", chunk.get("document_name", "unknown")),
                    chunk_id=chunk.get("chunk_id", f"chunk_{len(sources)}"),
                    similarity_score=min(chunk.get("similarity_score", 0.0), 1.0),
                    page_number=chunk.get("page_number"),
                    chunk_text=chunk.get("text", chunk.get("chunk_text", "")),
                ))
            except Exception as e:
                logger.warning(f"Failed to convert chunk to SourceReference: {e}")
                continue

        return sources

    except TypeError as e:
        # Signature mismatch — log clearly so it's obvious
        logger.error(
            f"retrieve_chunks signature error: {e}\n"
            f"Check that retriever.py accepts (query, crop, top_k, threshold)"
        )
        return []

    except Exception as e:
        logger.error(f"Disease lookup failed: {e}")
        return []
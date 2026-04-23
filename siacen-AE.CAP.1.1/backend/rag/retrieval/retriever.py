"""
ChromaDB retriever — always includes nutrient + abiotic chunks
so those cause categories are always in the differential diagnosis space.
"""

import logging
import os
from typing import Optional

from rag.vectorstore.collections import get_collection

logger = logging.getLogger(__name__)

RAG_TOP_K        = int(os.getenv("RAG_TOP_K", "3"))
RAG_FETCH_FACTOR = 4   # fetch top_k * 4, then filter down


def retrieve_chunks(
    query:     str,
    crop:      str,
    top_k:     int = RAG_TOP_K,
    threshold: Optional[float] = None,
) -> dict:
    """
    Retrieve relevant chunks from ChromaDB.

    Always queries four buckets:
      1. crop-specific  (e.g. crop='coffee')
      2. general        (multi-crop PDFs)
      3. nutrient       (deficiency guides)
      4. abiotic        (stress guides)

    This ensures nutrient deficiency and abiotic stress are always
    in the retrieval space, preventing the model from ignoring
    non-disease causes.
    """
    if threshold is None:
        threshold = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.45"))

    fetch_n = top_k * RAG_FETCH_FACTOR

    try:
        collection = get_collection()
    except RuntimeError as e:
        logger.error(f"ChromaDB collection unavailable: {e}")
        return _empty_result(crop, fallback=True)

    total_count = collection.count()
    if total_count == 0:
        logger.error("ChromaDB collection is empty — run ingest_data.py first")
        return _empty_result(crop, fallback=True)

    # ── Query 1: crop-specific ────────────────────────────────────────
    crop_chunks = []
    if crop and crop not in ("general", "unknown", ""):
        try:
            res = collection.query(
                query_texts=[query],
                n_results=min(fetch_n, total_count),
                where={"crop": crop},
                include=["documents", "metadatas", "distances"],
            )
            crop_chunks = _parse_results(res)
            logger.debug(f"Crop '{crop}': {len(crop_chunks)} chunks")
        except Exception as e:
            logger.warning(f"Crop query failed for '{crop}': {e}")

    # ── Query 2: general ──────────────────────────────────────────────
    general_chunks = []
    try:
        gen_count = _count_by_crop(collection, "general")
        if gen_count > 0:
            res = collection.query(
                query_texts=[query],
                n_results=min(fetch_n, gen_count),
                where={"crop": "general"},
                include=["documents", "metadatas", "distances"],
            )
            general_chunks = _parse_results(res)
            logger.debug(f"General: {len(general_chunks)} chunks")
    except Exception as e:
        logger.warning(f"General query failed: {e}")

    # ── Query 3: nutrient deficiency ──────────────────────────────────
    nutrient_chunks = []
    try:
        nut_count = _count_by_crop(collection, "nutrient")
        if nut_count > 0:
            res = collection.query(
                query_texts=[query],
                n_results=min(max(2, top_k), nut_count),
                where={"crop": "nutrient"},
                include=["documents", "metadatas", "distances"],
            )
            nutrient_chunks = _parse_results(res)
            logger.debug(f"Nutrient: {len(nutrient_chunks)} chunks")
    except Exception as e:
        logger.warning(f"Nutrient query failed: {e}")

    # ── Query 4: abiotic stress ───────────────────────────────────────
    abiotic_chunks = []
    try:
        ab_count = _count_by_crop(collection, "abiotic")
        if ab_count > 0:
            res = collection.query(
                query_texts=[query],
                n_results=min(max(2, top_k), ab_count),
                where={"crop": "abiotic"},
                include=["documents", "metadatas", "distances"],
            )
            abiotic_chunks = _parse_results(res)
            logger.debug(f"Abiotic: {len(abiotic_chunks)} chunks")
    except Exception as e:
        logger.warning(f"Abiotic query failed: {e}")

    # ── Merge, deduplicate, filter ─────────────────────────────────────
    all_chunks = _merge_chunks(
        crop_chunks, general_chunks, nutrient_chunks, abiotic_chunks
    )

    if not all_chunks:
        logger.warning(f"No chunks from any source for crop='{crop}'")
        return _empty_result(crop, fallback=True)

    passed = [c for c in all_chunks if c["similarity_score"] >= threshold]
    passed.sort(key=lambda x: x["similarity_score"], reverse=True)
    final  = passed[:top_k]

    top_score = all_chunks[0]["similarity_score"] if all_chunks else 0.0
    fallback  = len(final) == 0

    logger.info(
        f"RAG retrieval: crop='{crop}', "
        f"total={len(all_chunks)}, passed={len(passed)}, "
        f"returned={len(final)}/{top_k}, top_score={top_score:.3f}"
    )

    sources = [
        {
            "document_name":    c["source_file"],
            "chunk_id":         c["chunk_id"],
            "similarity_score": c["similarity_score"],
            "page_number":      c.get("page_number"),
            "chunk_text":       c["text"],
        }
        for c in final
    ]

    return {
        "chunks":    final,
        "sources":   sources,
        "fallback":  fallback,
        "top_score": top_score,
        "crop_used": crop,
    }


# ── Helpers ────────────────────────────────────────────────────────────────────

def _parse_results(results: dict) -> list[dict]:
    if not results or not results.get("documents"):
        return []
    chunks = []
    docs  = results["documents"][0]
    metas = results["metadatas"][0]
    dists = results["distances"][0]
    for doc, meta, dist in zip(docs, metas, dists):
        chunks.append({
            "text":             doc,
            "source_file":      meta.get("source_file", "unknown"),
            "chunk_id":         f"{meta.get('source_file', 'doc')}_chunk_{meta.get('chunk_index', 0)}",
            "similarity_score": round(1 - dist, 4),
            "page_number":      meta.get("page_number", 0),
            "chunk_index":      meta.get("chunk_index", 0),
            "crop":             meta.get("crop", "general"),
        })
    return chunks


def _merge_chunks(*chunk_lists) -> list[dict]:
    seen  = set()
    merged = []
    all_chunks = []
    for lst in chunk_lists:
        all_chunks.extend(lst)
    all_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
    for chunk in all_chunks:
        cid = chunk["chunk_id"]
        if cid not in seen:
            seen.add(cid)
            merged.append(chunk)
    return merged


def _count_by_crop(collection, crop: str) -> int:
    try:
        res = collection.get(where={"crop": crop}, limit=1)
        if res and res.get("ids"):
            # Approximate count using get with high limit
            res2 = collection.get(where={"crop": crop}, limit=10000)
            return len(res2.get("ids", []))
    except Exception:
        pass
    return 0


def _empty_result(crop: str, fallback: bool = True) -> dict:
    return {
        "chunks":    [],
        "sources":   [],
        "fallback":  fallback,
        "top_score": 0.0,
        "crop_used": crop,
    }
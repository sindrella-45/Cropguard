# backend/rag/vectorstore/collections.py
"""
ChromaDB collection management for CropGuard AI.

Handles creating the collection, defining the
metadata schema, and storing chunks with their
crop metadata so filtered retrieval works.

The crop field in metadata is what makes this
query work:
    collection.query(
        query_embeddings=[...],
        where={"crop": "coffee"},   ← filters to coffee chunks only
        n_results=3
    )

Without the crop field stored correctly in metadata,
that filter returns zero results silently.
"""

import os
import logging
from typing import Optional

import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

# ── Config ──────────

CHROMA_PERSIST_DIR = os.getenv(
    "CHROMA_PERSIST_DIRECTORY",
    "./chroma_db"
)
COLLECTION_NAME = os.getenv(
    "CHROMA_COLLECTION_NAME",
    "crop_diseases"
)


_client: Optional[chromadb.PersistentClient] = None


def get_chroma_client() -> chromadb.PersistentClient:
    """
    Get or create the ChromaDB persistent client.

    Uses a module-level singleton so we don't
    create a new client on every function call.

    Returns:
        ChromaDB PersistentClient instance
    """
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_PERSIST_DIR,
        )
        logger.debug(f"ChromaDB client created at: {CHROMA_PERSIST_DIR}")
    return _client


# ── Collection ──────────

def get_or_create_collection() -> chromadb.Collection:
    """
    Get the crop_diseases collection or create it.

    The collection stores disease knowledge chunks
    from agricultural PDFs with the following metadata
    schema per chunk:

        crop        (str)  — e.g. "coffee", "cotton", "general"
        source_file (str)  — e.g. "cabi_coffee_east_africa.pdf"
        page_number (int)  — page the chunk came from
        chunk_index (int)  — position of chunk in document
        chunk_size  (int)  — character count of the chunk

    Returns:
        ChromaDB Collection ready for use
    """
    client = get_chroma_client()

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={
            "description": (
                "CropGuard AI disease knowledge base. "
                "Contains chunked agricultural PDF data "
                "with crop metadata for filtered retrieval."
            ),
            # Cosine similarity is standard for text embeddings
            "hnsw:space": "cosine",
        }
    )

    logger.debug(
        f"Collection '{COLLECTION_NAME}' ready "
        f"({collection.count()} chunks)"
    )

    return collection


def get_collection() -> chromadb.Collection:
    """
    Get the existing collection.

    Use this at query time (retriever.py) — it
    does not create the collection if missing.

    Raises:
        Exception if collection doesn't exist yet
        (run ingest_data.py first)

    Returns:
        ChromaDB Collection
    """
    client = get_chroma_client()

    try:
        return client.get_collection(name=COLLECTION_NAME)
    except Exception:
        raise RuntimeError(
            f"Collection '{COLLECTION_NAME}' not found. "
            f"Run: uv run python scripts/ingest_data.py"
        )


# ── Storage ─────────────

def store_chunks(
    chunks: list[dict],
    collection: Optional[chromadb.Collection] = None,
) -> None:
    """
    Store a list of chunks into ChromaDB.

    Each chunk must have:
        chunk_id    — unique string ID
        text        — the content to embed
        crop        — REQUIRED: crop name for filtering
        source_file — PDF filename
        page_number — page number (can be None)
        chunk_index — position in document
        chunk_size  — character count

    ChromaDB generates embeddings automatically using
    the default embedding function (all-MiniLM-L6-v2)
    unless a custom embeddings.py client is configured.

    Args:
        chunks:     List of chunk dicts from chunker.py
        collection: Optional pre-fetched collection.
                    If None, fetches it internally.
    """
    if not chunks:
        logger.warning("store_chunks called with empty list — nothing stored")
        return

    if collection is None:
        collection = get_or_create_collection()

    # ChromaDB expects parallel lists
    ids         = []
    documents   = []
    metadatas   = []

    for chunk in chunks:
        ids.append(chunk["chunk_id"])
        documents.append(chunk["text"])

        # Build metadata dict — ONLY string/int/float/bool
        # values are allowed in ChromaDB metadata.
        # None values must be converted to empty string.
        metadatas.append({
            "crop":        chunk.get("crop", "general"),
            "source_file": chunk.get("source_file", ""),
            "page_number": chunk.get("page_number") or 0,
            "chunk_index": chunk.get("chunk_index", 0),
            "chunk_size":  chunk.get("chunk_size", 0),
        })

    # Store in batches of 100 to avoid memory issues
    # with large PDF collections
    batch_size = 100
    stored     = 0

    for i in range(0, len(ids), batch_size):
        batch_ids   = ids[i:i + batch_size]
        batch_docs  = documents[i:i + batch_size]
        batch_metas = metadatas[i:i + batch_size]

        collection.add(
            ids=batch_ids,
            documents=batch_docs,
            metadatas=batch_metas,
        )
        stored += len(batch_ids)

    logger.debug(f"Stored {stored} chunks in ChromaDB")


# ── Debug helper ─────────────

def inspect_collection() -> dict:
    """
    Return a summary of what's currently in ChromaDB.

    Useful for debugging after ingestion.

    Returns:
        dict with total count and breakdown by crop

    Example:
        {
            "total": 423,
            "by_crop": {
                "coffee":   89,
                "tea":      67,
                "cocoa":    54,
                "cotton":   71,
                "sunflower": 43,
                "general":  99,
            }
        }
    """
    try:
        collection = get_collection()
        total      = collection.count()

        # Get all metadata to count by crop
        result   = collection.get(include=["metadatas"])
        by_crop: dict[str, int] = {}

        for meta in result["metadatas"]:
            crop = meta.get("crop", "unknown")
            by_crop[crop] = by_crop.get(crop, 0) + 1

        return {
            "total":   total,
            "by_crop": by_crop,
        }

    except Exception as e:
        return {"error": str(e)}
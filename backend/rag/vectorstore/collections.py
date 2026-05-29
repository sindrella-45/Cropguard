# backend/rag/vectorstore/collections.py

import os
import logging
from typing import Optional

import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

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
    global _client

    if _client is None:
        _client = chromadb.PersistentClient(
            path=CHROMA_PERSIST_DIR,
        )
        logger.debug(f"ChromaDB client created at: {CHROMA_PERSIST_DIR}")

    return _client


def get_or_create_collection() -> chromadb.Collection:
    client = get_chroma_client()

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={
            "description": (
                "CropGuard AI disease knowledge base. "
                "Contains chunked agricultural PDF data "
                "with crop metadata for filtered retrieval."
            ),
            "hnsw:space": "cosine",
        }
    )

    logger.debug(
        f"Collection '{COLLECTION_NAME}' ready "
        f"({collection.count()} chunks)"
    )

    return collection


def get_collection() -> chromadb.Collection:
    client = get_chroma_client()

    try:
        return client.get_collection(name=COLLECTION_NAME)

    except Exception:
        raise RuntimeError(
            f"Collection '{COLLECTION_NAME}' not found. "
            f"Run: uv run python scripts/ingest_data.py"
        )


def store_chunks(
    chunks: list[dict],
    collection: Optional[chromadb.Collection] = None,
) -> int:

    if not chunks:
        logger.warning("store_chunks called with empty list")
        return 0

    if collection is None:
        collection = get_or_create_collection()

    ids = []
    documents = []
    metadatas = []

    for chunk in chunks:
        ids.append(chunk["chunk_id"])
        documents.append(chunk["text"])

        metadatas.append({
            "crop": chunk.get("crop", "general"),
            "source_file": chunk.get("source_file", ""),
            "page_number": chunk.get("page_number") or 0,
            "chunk_index": chunk.get("chunk_index", 0),
            "chunk_size": chunk.get("chunk_size", 0),
        })

    batch_size = 100
    stored = 0

    for i in range(0, len(ids), batch_size):

        batch_ids = ids[i:i + batch_size]
        batch_docs = documents[i:i + batch_size]
        batch_metas = metadatas[i:i + batch_size]

        collection.add(
            ids=batch_ids,
            documents=batch_docs,
            metadatas=batch_metas,
        )

        stored += len(batch_ids)

    logger.debug(f"Stored {stored} chunks in ChromaDB")

    return stored


def inspect_collection() -> dict:

    try:
        collection = get_collection()

        total = collection.count()

        result = collection.get(include=["metadatas"])

        by_crop: dict[str, int] = {}

        for meta in result["metadatas"]:
            crop = meta.get("crop", "unknown")
            by_crop[crop] = by_crop.get(crop, 0) + 1

        return {
            "total": total,
            "by_crop": by_crop,
        }

    except Exception as e:
        return {"error": str(e)}
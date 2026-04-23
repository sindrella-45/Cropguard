"""
ChromaDB client setup for CropGuard AI.

Creates and manages the ChromaDB client that
connects to the local persistent vector store.

ChromaDB stores data on disk at the path
specified in settings.chroma_persist_directory.
This means data survives server restarts.

Usage:
    from rag.vectorstore import get_chroma_client
    
    client = get_chroma_client()
    collections = client.list_collections()
"""

import chromadb
from chromadb.config import Settings as ChromaSettings
from functools import lru_cache
from config import get_settings
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_chroma_client() -> chromadb.PersistentClient:
    """
    Returns a cached persistent ChromaDB client.
    
    Uses lru_cache to ensure only one client
    instance is created and reused across
    all requests.
    
    Data is persisted to disk at the path
    defined in settings.chroma_persist_directory
    so the knowledge base survives restarts.
    
    Returns:
        chromadb.PersistentClient: Connected client
        
    Example:
        client = get_chroma_client()
        print(client.list_collections())
    """
    settings = get_settings()

    try:
        client = chromadb.PersistentClient(
            path=settings.chroma_persist_directory,
            settings=ChromaSettings(
                anonymized_telemetry=False
            )
        )
        logger.info(
            f"ChromaDB client connected at: "
            f"{settings.chroma_persist_directory}"
        )
        return client

    except Exception as e:
        logger.error(
            f"Failed to connect to ChromaDB: {e}"
        )
        raise
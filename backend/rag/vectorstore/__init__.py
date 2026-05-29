"""
Vectorstore package for CropGuard AI.

Manages the ChromaDB vector database that stores
disease knowledge as searchable embeddings.

ChromaDB Structure:
    Collection: "crop_diseases"
        └── Documents (one per source PDF)
            └── Chunks (preprocessed text segments)
                └── Embeddings (vector representations)
                    └── Metadata (source, page, chunk_id)

Why ChromaDB?
    - Runs locally — no external service needed
    - Persistent storage on disk
    - Fast similarity search
    - Simple Python API
    - Perfect for this project's scale

Usage:
    from rag.vectorstore import get_collection
    from rag.vectorstore import store_chunks
    
    collection = get_collection()
    store_chunks(chunks, collection)
"""

from .chromadb_client import get_chroma_client
from .collections import get_collection
from .embeddings import get_embedding_function
"""
Embedding function setup for CropGuard AI.

Defines the embedding model used to convert
text chunks into vector representations for
storage and search in ChromaDB.

Why embeddings matter:
    Embeddings convert text into numbers (vectors).
    Similar texts get similar vectors.
    ChromaDB uses these vectors for similarity search.

Embedding model used:
    OpenAI text-embedding-3-small
    
    Why this model?
    - Best performance for agricultural text
    - Consistent with GPT-4o (same provider)
    - Cost effective for this project scale
    - 1536 dimensions for high precision search

Usage:
    from rag.vectorstore import get_embedding_function
    
    embed_fn = get_embedding_function()
    vectors = embed_fn(["tomato early blight symptoms"])
"""

from chromadb.utils.embedding_functions import (
    OpenAIEmbeddingFunction
)
from functools import lru_cache
from config import get_settings
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_embedding_function() -> OpenAIEmbeddingFunction:
    """
    Returns a cached OpenAI embedding function
    for use with ChromaDB.
    
    Uses text-embedding-3-small which provides
    the best balance of quality and cost for
    agricultural disease text.
    
    Returns:
        OpenAIEmbeddingFunction: Ready to use
        
    Example:
        embed_fn = get_embedding_function()
        collection = client.get_collection(
            name="crop_diseases",
            embedding_function=embed_fn
        )
    """
    settings = get_settings()

    try:
        embedding_fn = OpenAIEmbeddingFunction(
            api_key=settings.openai_api_key,
            model_name="text-embedding-3-small"
        )
        logger.info(
            "Embedding function initialised: "
            "text-embedding-3-small"
        )
        return embedding_fn

    except Exception as e:
        logger.error(
            f"Failed to initialise embedding function: {e}"
        )
        raise
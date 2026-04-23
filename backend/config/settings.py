"""
Central configuration file for CropGuard AI.

Loads all environment variables from the .env file
and makes them available throughout the application
via the get_settings() function.

Usage:
    from config import get_settings
    settings = get_settings()
    print(settings.openai_api_key)
"""

from dotenv import load_dotenv
load_dotenv() 

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    All fields map directly to variables in your .env file.
    Pydantic automatically validates types and raises
    clear errors if required variables are missing.
    """

    # ── OpenAI ──────────────────────────────────────────
    openai_api_key: str
    """Your OpenAI API key for GPT-4o calls"""

    # ── Supabase ─────────────────────────────────────────
    supabase_url: str
    """Your Supabase project URL"""

    supabase_key: str
    """Your Supabase anonymous/service key"""

    # ── Redis ────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379"
    """Redis connection URL for short-term memory"""

    # ── LangSmith Observability ──────────────────────────
    langsmith_api_key: Optional[str] = None
    """LangSmith API key for agent observability"""

    langsmith_project: str = "cropguard-ai"
    """LangSmith project name to group traces under"""

    # ── Weather API ──────────────────────────────────────
    weather_api_key: Optional[str] = None
    """OpenWeatherMap API key for weather tool"""

    # ── App ──────────────────────────────────────────────
    app_env: str = "development"
    """App environment: development or production"""

    app_port: int = 8000
    """Port the FastAPI server runs on"""

    app_version: str = "1.0.0"
    """Current version of the application"""

    # ── RAG Settings ─────────────────────────────────────
    chroma_collection_name: str = "crop_diseases"
    """Name of the ChromaDB collection"""

    chroma_persist_directory: str = "./chroma_db"
    """Where ChromaDB stores its data locally"""

    rag_top_k: int = 3
    """
    Number of chunks to retrieve from ChromaDB.
    Based on evaluation results in docs/retrieval_evaluation.md
    top_k=3 gave the best balance of relevance vs noise.
    """

    rag_similarity_threshold: float = 0.6
    """
    Minimum similarity score for a chunk to be used.
    Chunks below this score trigger the fallback response.
    Addresses reviewer feedback on hallucination prevention.
    """

    rag_chunk_size: int = 500
    """
    Number of tokens per chunk when preprocessing PDFs.
    Based on evaluation — 500 tokens preserved enough
    context while keeping chunks focused.
    """

    rag_chunk_overlap: int = 50
    """
    Number of overlapping tokens between chunks.
    Prevents context loss at chunk boundaries.
    """

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    load_dotenv() 
    """
    Returns a cached instance of the Settings class.
    
    Using lru_cache means the .env file is only read
    once, not on every function call. This improves
    performance across the application.
    
    Returns:
        Settings: The application settings instance.
        
    Example:
        from config import get_settings
        settings = get_settings()
        api_key = settings.openai_api_key
    """
    return Settings()
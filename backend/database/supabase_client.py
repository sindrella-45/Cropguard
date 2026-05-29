"""
Supabase client setup for CropGuard AI.

Supabase handles three things in this project:
1. PostgreSQL database — stores users, diagnoses,
   feedback and token usage permanently
2. Authentication — handles farmer login and signup
3. Storage — stores uploaded leaf images

Database Tables:
    users          — farmer accounts
    diagnoses      — all diagnosis history
    feedback       — farmer ratings and comments
    token_usage    — API cost tracking per user

Why Supabase?
    Single platform that replaces three separate 
    services (database + auth + file storage).
    Free tier is sufficient for this project.

Usage:
    from database import get_supabase
    
    supabase = get_supabase()
    
    # Save a diagnosis
    supabase.table("diagnoses").insert({...}).execute()
    
    # Get farmer history
    supabase.table("diagnoses")
        .select("*")
        .eq("user_id", user_id)
        .execute()
"""

from supabase import create_client, Client
from functools import lru_cache
from config import get_settings
import logging

logger = logging.getLogger(__name__)


@lru_cache()
def get_supabase() -> Client:
    """
    Returns a cached Supabase client instance.
    
    Using lru_cache ensures only one connection
    is created and reused across all requests,
    improving performance.
    
    Returns:
        Client: Authenticated Supabase client.
        
    Raises:
        Exception: If SUPABASE_URL or SUPABASE_KEY
                   are missing from .env file.
                   
    Example:
        from database import get_supabase
        supabase = get_supabase()
        result = supabase.table("diagnoses")
                    .select("*").execute()
    """
    settings = get_settings()

    try:
        client = create_client(
            settings.supabase_url,
            settings.supabase_key
        )
        logger.info("Supabase client connected successfully")
        return client

    except Exception as e:
        logger.error(f"Failed to connect to Supabase: {e}")
        raise


# ── Supabase Table Names ───────────────────────────────────
# Centralised here so table names are never hardcoded
# anywhere else in the project

class Tables:
    """
    Central registry of all Supabase table names.
    
    Use these constants instead of hardcoding 
    table name strings throughout the codebase.
    
    Example:
        from database.supabase_client import Tables
        
        supabase.table(Tables.DIAGNOSES)
                .select("*").execute()
    """
    USERS = "users"
    DIAGNOSES = "diagnoses"
    FEEDBACK = "feedback"
    TOKEN_USAGE = "token_usage"


# ── Supabase Storage Buckets ───────────────────────────────

class Buckets:
    """
    Central registry of all Supabase storage bucket names.
    
    Example:
        from database.supabase_client import Buckets
        
        supabase.storage.from_(Buckets.LEAF_IMAGES)
                .upload(path, file)
    """
    LEAF_IMAGES = "leaf-images"


# ── SQL Schema Reference ───────────────────────────────────
# This is the SQL you run in Supabase dashboard
# to create all required tables.
# Kept here as documentation reference.

SCHEMA_SQL = """
-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnoses table
CREATE TABLE diagnoses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    plant_identified TEXT,
    disease_name TEXT,
    severity TEXT,
    confidence_score FLOAT,
    urgency TEXT,
    treatments JSONB,
    prevention_tips JSONB,
    sources JSONB,
    farmer_advice TEXT,
    tokens_used INTEGER,
    cost_usd FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diagnosis_id UUID REFERENCES diagnoses(id),
    user_id UUID REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    was_accurate BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token usage table
CREATE TABLE token_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    diagnosis_id UUID REFERENCES diagnoses(id),
    tokens_used INTEGER,
    cost_usd FLOAT,
    model_used TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""
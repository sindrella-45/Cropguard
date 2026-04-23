"""
Database package for CropGuard AI.

Provides database client connections for:
- Supabase: permanent storage for users, 
            diagnoses, feedback and images
- Redis: short-term memory for active 
         conversation sessions

Usage:
    from database import get_supabase, get_redis
    
    supabase = get_supabase()
    redis = get_redis()
"""

from .supabase_client import get_supabase
from .redis_client import get_redis
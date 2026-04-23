"""
Redis client setup for CropGuard AI.

Redis handles short-term memory in this project.
It stores active session data temporarily while
a farmer is using the app.

What gets stored in Redis:
    session:{session_id}  — current diagnosis context
    history:{session_id}  — conversation turns in session

Why Redis for short-term memory?
    - Extremely fast in-memory reads and writes
    - Data automatically expires after session ends
    - Perfect for temporary conversation context
    - Does not pollute permanent Supabase database

Difference from Supabase (long-term memory):
    Redis          — forgets after session expires
    Supabase       — remembers permanently

Usage:
    from database import get_redis
    
    redis = get_redis()
    
    # Save session data
    redis.setex("session:abc123", 3600, json.dumps(data))
    
    # Get session data
    data = redis.get("session:abc123")
"""

# backend/database/redis_client.py
"""
Redis client for CropGuard AI.

CRITICAL FIX: The original get_redis() called client.ping() immediately
which raised ConnectionError if Redis wasn't running. This crashed the
entire /followup endpoint with a 500 error.

Fix: Use lazy connection — only attempt to connect when a command is
actually executed. The ping() call is removed from the factory so the
app starts even when Redis is down, and individual operations fail
gracefully instead of crashing.
"""

import redis
import logging
from functools import lru_cache
from config import get_settings

logger = logging.getLogger(__name__)

SESSION_EXPIRY = 3600  # 1 hour


@lru_cache()
def get_redis() -> redis.Redis:
    settings = get_settings()

    try:
        client = redis.from_url(
            settings.redis_url,
            decode_responses=True,
            socket_connect_timeout=2,    # fail fast instead of hanging
            socket_timeout=2,
            retry_on_timeout=False,
        )
        # DO NOT call client.ping() here — that's what was crashing everything
        logger.info("Redis client created (lazy connection)")
        return client

    except Exception as e:
        logger.error(f"Failed to create Redis client: {e}")
        raise


class RedisKeys:
    @staticmethod
    def session(session_id: str) -> str:
        return f"session:{session_id}"

    @staticmethod
    def history(session_id: str) -> str:
        return f"history:{session_id}"

    @staticmethod
    def diagnosis(session_id: str) -> str:
        return f"diagnosis:{session_id}"
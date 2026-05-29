"""
Memory package for CropGuard AI.

Provides two types of memory for the agent:

Short-term memory (Redis):
    Remembers context within a single session.
    For example, if a farmer asks a follow-up
    question about their current diagnosis,
    the agent remembers without re-uploading.
    Expires automatically after 1 hour.

Long-term memory (Supabase):
    Remembers diagnosis history across sessions.
    For example, if a farmer comes back next week,
    the agent can reference past diagnoses and
    track whether diseases are recurring.
    Stored permanently in the database.

Why both?
    Redis is fast but temporary.
    Supabase is permanent but slower.
    Together they cover all memory needs.

Usage:
    from memory import ShortTermMemory, LongTermMemory
    
    short = ShortTermMemory(session_id="abc123")
    long = LongTermMemory(user_id="user456")
"""

from .short_term import ShortTermMemory
from .long_term import LongTermMemory
"""
Short-term memory for CropGuard AI.

"""

import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)
SESSION_TTL = 3600


def _get_redis_safe():
    """Get Redis client, return None if unavailable."""
    try:
        from database.redis_client import get_redis
        return get_redis()
    except Exception as e:
        logger.warning(f"Redis unavailable: {e}")
        return None


class ShortTermMemory:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self._diag_key  = f"diagnosis:{session_id}"
        self._hist_key  = f"history:{session_id}"
        self._sess_key  = f"session:{session_id}"

    def save_diagnosis(self, diagnosis: dict) -> bool:
        r = _get_redis_safe()
        if r is None: return False
        try:
            r.setex(self._diag_key, SESSION_TTL, json.dumps(diagnosis, default=str))
            return True
        except Exception as e:
            logger.warning(f"Redis save_diagnosis failed (non-fatal): {e}")
            return False

    def get_diagnosis(self) -> Optional[dict]:
        r = _get_redis_safe()
        if r is None: return None
        try:
            data = r.get(self._diag_key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.warning(f"Redis get_diagnosis failed (non-fatal): {e}")
            return None

    def save_message(self, role: str, content: str) -> bool:
        r = _get_redis_safe()
        if r is None: return False
        try:
            history = self.get_history()
            history.append({"role": role, "content": content})
            r.setex(self._hist_key, SESSION_TTL, json.dumps(history))
            return True
        except Exception as e:
            logger.warning(f"Redis save_message failed (non-fatal): {e}")
            return False

    def get_history(self) -> list:
        r = _get_redis_safe()
        if r is None: return []
        try:
            data = r.get(self._hist_key)
            return json.loads(data) if data else []
        except Exception as e:
            logger.warning(f"Redis get_history failed (non-fatal): {e}")
            return []

    def extend_session(self) -> bool:
        r = _get_redis_safe()
        if r is None: return False
        try:
            for key in [self._diag_key, self._hist_key, self._sess_key]:
                if r.exists(key):
                    r.expire(key, SESSION_TTL)
            return True
        except Exception as e:
            logger.warning(f"Redis extend_session failed (non-fatal): {e}")
            return False

    def session_exists(self) -> bool:
        r = _get_redis_safe()
        if r is None: return False
        try:
            return bool(r.exists(self._diag_key) or r.exists(self._hist_key))
        except Exception:
            return False
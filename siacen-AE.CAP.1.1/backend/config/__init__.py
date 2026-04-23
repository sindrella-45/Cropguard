"""
Configuration package for CropGuard AI.

Exposes:
- get_settings(): loads all environment variables
- Settings: the settings class itself
- get_personality(): loads personality config by name
- get_all_personalities(): returns all personalities
- PersonalityConfig: the personality model
"""

from .settings import get_settings, Settings
from .personality import (
    PersonalityConfig,
    get_personality,
    get_all_personalities,
    PERSONALITIES
)
"""
Tools package for CropGuard AI.

These are the tools available to the LangGraph agent.
Each tool performs a specific task that enriches
the agent's diagnosis capability.

Available tools:
    vision          — analyzes leaf image with GPT-4o
    weather         — fetches current weather conditions
    disease_lookup  — searches ChromaDB for disease info

Why separate tools?
    Each tool can be enabled or disabled independently
    via the plugin system. This implements the plugin
    system from Optional Task Medium #8.

Usage:
    from tools import analyze_image, get_weather
    from tools import lookup_disease
"""

from .vision import analyze_image
from .weather import get_weather
from .disease_lookup import lookup_disease
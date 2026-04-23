"""
Plugin system package for CropGuard AI.

Allows the agent's tools to be dynamically
enabled or disabled by the farmer through
the UI without restarting the server.

Implements Optional Task Medium #8:
    'Implement a plugin system that allows users
    to add or remove functionalities from the
    chatbot dynamically'

Available plugins:
    vision_analysis  — core image analysis (always on)
    weather_tool     — weather data enrichment
    disease_lookup   — RAG knowledge base search
    help_chatbot     — interactive help assistant

Why a plugin system?
    Different farmers have different needs:
    - A farmer with slow internet may disable
      weather to speed up diagnosis
    - A developer testing may disable RAG to
      test the base model performance
    - Future tools can be added without changing
      the core agent code

Usage:
    from plugins import PluginManager
    
    manager = PluginManager()
    manager.enable("weather_tool")
    manager.disable("weather_tool")
    
    active = manager.get_active_plugins()
"""

from .manager import PluginManager
from .registry import PLUGIN_REGISTRY
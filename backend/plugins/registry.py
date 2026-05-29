# backend/plugins/registry.py
"""
Plugin registry for CropGuard AI.

FIX: disease_lookup is now required=True so the knowledge
base is ALWAYS used and cannot be accidentally disabled.
"""

PLUGIN_REGISTRY: list[dict] = [
    {
        "id": "vision_analysis",
        "name": "Vision Analysis",
        "description": (
            "Core image analysis using GPT-4o vision. "
            "Examines the leaf photo for symptoms."
        ),
        "enabled": True,
        "required": True,   # Cannot be disabled
        "icon": "🔬",
        "tool_file": "tools/vision.py"
    },
    {
        "id": "disease_lookup",
        "name": "Disease Knowledge Base",
        "description": (
            "Searches verified agricultural documents "
            "for disease information matching symptoms. "
            "Improves diagnosis accuracy significantly."
        ),
        "enabled": True,
        "required": True,   # FIX: was False — now required so RAG always runs
        "icon": "📚",
        "tool_file": "tools/disease_lookup.py"
    },
    {
        "id": "weather_tool",
        "name": "Weather Analysis",
        "description": (
            "Fetches current weather conditions to "
            "enrich diagnosis. High humidity and "
            "rainfall can indicate disease risk."
        ),
        "enabled": True,
        "required": False,
        "icon": "🌤️",
        "tool_file": "tools/weather.py"
    },
    {
        "id": "help_chatbot",
        "name": "Help Assistant",
        "description": (
            "Interactive chatbot that guides farmers "
            "on how to use the application effectively."
        ),
        "enabled": True,
        "required": False,
        "icon": "💬",
        "tool_file": None
    },
    {
        "id": "history_memory",
        "name": "Diagnosis History",
        "description": (
            "Saves diagnoses to history and loads "
            "past diagnoses for personalised context. "
            "Requires account login."
        ),
        "enabled": True,
        "required": False,
        "icon": "📋",
        "tool_file": None
    }
]
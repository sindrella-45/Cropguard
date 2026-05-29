"""
Personality configuration for CropGuard AI agent.

The agent can communicate in three different styles
depending on what the farmer prefers:
- friendly: warm, simple language for everyday farmers
- formal: technical, precise for agronomists/experts
- concise: brief, direct for quick actionable answers

This directly implements Easy Optional Task #2:
'Give the agent a personality'
"""

from pydantic import BaseModel
from typing import Optional


class PersonalityConfig(BaseModel):
    """
    Configuration for a single personality mode.
    
    Each personality affects:
    - How the agent phrases its diagnosis
    - The complexity of language used
    - The length of responses
    - The tone of farmer advice
    """

    name: str
    """Internal name used in prompts and API requests"""

    display_name: str
    """Human readable name shown in the UI"""

    description: str
    """Short description shown in the UI selector"""

    tone: str
    """How the agent should sound"""

    language_level: str
    """Technical vs simple language guidance"""

    response_length: str
    """How long responses should be"""

    emoji: str
    """Emoji shown next to personality in UI"""


# ── Personality Definitions ────────────────────────────────

PERSONALITIES: dict[str, PersonalityConfig] = {

    "friendly": PersonalityConfig(
        name="friendly",
        display_name="Friendly",
        description="Warm and encouraging. Best for everyday farmers.",
        tone="warm, encouraging, empathetic",
        language_level="simple everyday language, avoid jargon",
        response_length="moderate, include reassurance",
        emoji="😊"
    ),

    "formal": PersonalityConfig(
        name="formal",
        display_name="Formal",
        description="Technical and precise. Best for agronomists.",
        tone="professional, technical, authoritative",
        language_level=(
            "technical terminology, include scientific names, "
            "precise dosages"
        ),
        response_length="detailed and comprehensive",
        emoji="👨‍🔬"
    ),

    "concise": PersonalityConfig(
        name="concise",
        display_name="Concise",
        description="Short and direct. Best for quick answers.",
        tone="direct, no-nonsense, actionable",
        language_level="plain simple words",
        response_length="as short as possible, bullet points preferred",
        emoji="⚡"
    ),
}


def get_personality(name: str) -> PersonalityConfig:
    """
    Retrieve a personality configuration by name.
    
    Falls back to 'friendly' if the requested
    personality is not found.
    
    Args:
        name: The personality name ('friendly', 
              'formal', or 'concise')
              
    Returns:
        PersonalityConfig: The personality configuration.
        
    Example:
        from config import get_personality
        personality = get_personality("formal")
        print(personality.tone)
    """
    return PERSONALITIES.get(name, PERSONALITIES["friendly"])


def get_all_personalities() -> list[PersonalityConfig]:
    """
    Returns all available personality configurations.
    
    Used by the frontend ModelSelector component to
    populate the personality dropdown.
    
    Returns:
        list[PersonalityConfig]: All personality options.
    """
    return list(PERSONALITIES.values())
# backend/llm/factory.py
"""
LLM factory for CropGuard AI.

Returns the correct LLM client based on the
model name selected by the farmer in the UI.

This is the single entry point for all LLM
client creation in the application. No other
file should instantiate LLM clients directly.

Why a factory pattern?
    - Single place to add new LLM providers
    - Easy to switch providers without changing
      agent code
    - Consistent interface for all providers
    - Simplifies testing and mocking

Implements:
    Easy Optional Task #3:
        'Provide the user with the ability to 
        choose from a list of LLMs'
    Medium Optional Task #9:
        'Implement multi-model support'

Usage:
    from llm import get_llm_client
    
    # Returns correct client automatically
    client = get_llm_client("gpt-4o")
    client = get_llm_client("claude-3-opus-20240229")
    client = get_llm_client("gemini-1.5-pro")
    
    # Same interface regardless of provider
    response, tokens = await client.complete_with_image(
        system_prompt="...",
        user_prompt="...",
        image_data=base64_string
    )
"""

import logging
from .openai_client import OpenAIClient
from .anthropic_client import AnthropicClient
from .gemini_client import GeminiClient

logger = logging.getLogger(__name__)

# Registry of all available models
# Used by frontend ModelSelector component
AVAILABLE_MODELS = [
    {
        "id": "gpt-4o",
        "name": "GPT-4o",
        "provider": "OpenAI",
        "description": (
            "Best overall performance. "
            "Recommended for most users."
        ),
        "supports_vision": True,
        "recommended": True
    },
    {
        "id": "gpt-4-turbo",
        "name": "GPT-4 Turbo",
        "provider": "OpenAI",
        "description": (
            "Slightly cheaper alternative to GPT-4o."
        ),
        "supports_vision": True,
        "recommended": False
    },
    {
        "id": "claude-3-opus-20240229",
        "name": "Claude 3 Opus",
        "provider": "Anthropic",
        "description": (
            "Anthropic's most capable model."
        ),
        "supports_vision": True,
        "recommended": False
    },
    {
        "id": "claude-3-sonnet-20240229",
        "name": "Claude 3 Sonnet",
        "provider": "Anthropic",
        "description": (
            "Balanced Anthropic model."
        ),
        "supports_vision": True,
        "recommended": False
    },
    {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro",
        "provider": "Google",
        "description": (
            "Google's most capable model."
        ),
        "supports_vision": True,
        "recommended": False
    },
    {
        "id": "gemini-1.5-flash",
        "name": "Gemini 1.5 Flash",
        "provider": "Google",
        "description": (
            "Faster and cheaper Gemini model."
        ),
        "supports_vision": True,
        "recommended": False
    }
]


def get_llm_client(
    model: str
) -> OpenAIClient | AnthropicClient | GeminiClient:
    """
    Factory function that returns the correct
    LLM client for the requested model.
    
    Automatically determines which provider
    to use based on the model name prefix.
    
    Args:
        model: Model identifier string
               e.g. "gpt-4o", "claude-3-opus-20240229"
               
    Returns:
        The appropriate LLM client instance
        with a consistent complete() and
        complete_with_image() interface.
        
    Raises:
        ValueError: If model is not recognised.
        
    Example:
        client = get_llm_client("gpt-4o")
        response, tokens = await client.complete_with_image(
            system_prompt="...",
            user_prompt="...",
            image_data=base64_string
        )
    """
    logger.info(f"Creating LLM client for: {model}")

    # OpenAI models
    if model.startswith("gpt-"):
        return OpenAIClient(model=model)

    # Anthropic models
    elif model.startswith("claude-"):
        return AnthropicClient(model=model)

    # Google Gemini models
    elif model.startswith("gemini-"):
        return GeminiClient(model=model)

    else:
        raise ValueError(
            f"Unknown model: '{model}'. "
            f"Available models: "
            f"{[m['id'] for m in AVAILABLE_MODELS]}"
        )


def get_available_models() -> list[dict]:
    """
    Returns all available LLM models for the
    frontend ModelSelector component.
    
    Returns:
        list[dict]: All model configurations
                    including name, provider,
                    description and vision support.
                    
    Example:
        models = get_available_models()
        for model in models:
            print(model["name"])
            print(model["provider"])
    """
    return AVAILABLE_MODELS
"""
LLM package for CropGuard AI.

Provides OpenAI client for GPT-4o vision
analysis and text completion.

Usage:
    from llm import get_llm_client

    client = get_llm_client("gpt-4o")
    response, tokens = await client.complete_with_image(
        system_prompt="...",
        user_prompt="...",
        image_data=base64_string
    )
"""

from .factory import get_llm_client, get_available_models
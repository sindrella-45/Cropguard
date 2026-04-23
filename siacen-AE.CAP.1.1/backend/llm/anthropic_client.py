# backend/llm/anthropic_client.py
"""
Anthropic Claude client for CropGuard AI.

Handles communication with the Anthropic API
as an alternative LLM provider to OpenAI.

Models supported:
    claude-3-opus   — most capable Claude model
    claude-3-sonnet — balanced performance/cost

Why include Anthropic?
    Implements Medium Optional Task #9:
    'Implement multi-model support'
    
    Gives farmers and developers the option to
    compare diagnosis quality across providers.

Note:
    Requires ANTHROPIC_API_KEY in .env file.
    Add to settings.py if using this provider.

Usage:
    from llm.anthropic_client import AnthropicClient
    
    client = AnthropicClient(model="claude-3-opus")
    response, tokens = await client.complete(
        system_prompt="...",
        user_prompt="..."
    )
"""

import logging
from typing import Optional
from config import get_settings
from utils.retry import with_retry

logger = logging.getLogger(__name__)


class AnthropicClient:
    """
    Async Anthropic Claude client for CropGuard AI.
    
    Wraps the Anthropic Python SDK with retry logic
    and a consistent interface matching OpenAIClient.
    
    Attributes:
        model: The Claude model to use
        client: Anthropic async client instance
        
    Example:
        client = AnthropicClient("claude-3-opus")
        response, tokens = await client.complete(
            system_prompt="...",
            user_prompt="..."
        )
    """

    SUPPORTED_MODELS = [
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229"
    ]

    def __init__(
        self,
        model: str = "claude-3-opus-20240229"
    ):
        """
        Initialise the Anthropic client.
        
        Args:
            model: Claude model name to use.
            
        Raises:
            ImportError: If anthropic package not installed.
            ValueError: If model is not supported.
        """
        try:
            import anthropic
            self._anthropic = anthropic
        except ImportError:
            raise ImportError(
                "anthropic package not installed. "
                "Run: pip install anthropic"
            )

        if model not in self.SUPPORTED_MODELS:
            raise ValueError(
                f"Model '{model}' not supported. "
                f"Choose from: {self.SUPPORTED_MODELS}"
            )

        # Note: Add ANTHROPIC_API_KEY to .env and settings
        import os
        self.model = model
        self.client = anthropic.AsyncAnthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY", "")
        )
        logger.info(
            f"AnthropicClient initialised: {model}"
        )

    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        max_tokens: int = 1000,
        temperature: float = 0.3,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0
    ) -> tuple[str, int]:
        """
        Send a text completion request to Claude.
        
        Args:
            system_prompt: Instructions for Claude
            user_prompt: The user message
            max_tokens: Maximum tokens in response
            temperature: Creativity level (0-1)
            top_p: Nucleus sampling parameter
            frequency_penalty: Not used by Claude
            
        Returns:
            tuple:
                - str: Claude's response text
                - int: Total tokens used
        """
        @with_retry(max_attempts=3)
        async def _call():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ]
            )

        try:
            response = await _call()
            content = response.content[0].text
            tokens = (
                response.usage.input_tokens
                + response.usage.output_tokens
            )

            logger.info(
                f"Anthropic completion: "
                f"{tokens} tokens used"
            )

            return content, tokens

        except Exception as e:
            logger.error(
                f"Anthropic completion failed: {e}"
            )
            raise

    async def complete_with_image(
        self,
        system_prompt: str,
        user_prompt: str,
        image_data: str,
        image_type: str = "image/jpeg",
        max_tokens: int = 1000,
        temperature: float = 0.3,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0
    ) -> tuple[str, int]:
        """
        Send a vision completion request to Claude.
        
        Args:
            system_prompt: Instructions for Claude
            user_prompt: Text question about image
            image_data: Base64 encoded image string
            image_type: MIME type e.g. "image/jpeg"
            max_tokens: Maximum tokens in response
            temperature: Creativity level
            top_p: Nucleus sampling
            frequency_penalty: Not used by Claude
            
        Returns:
            tuple:
                - str: Claude's visual description
                - int: Total tokens used
        """
        @with_retry(max_attempts=3)
        async def _call():
            return await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": image_type,
                                    "data": image_data
                                }
                            },
                            {
                                "type": "text",
                                "text": user_prompt
                            }
                        ]
                    }
                ]
            )

        try:
            response = await _call()
            content = response.content[0].text
            tokens = (
                response.usage.input_tokens
                + response.usage.output_tokens
            )

            logger.info(
                f"Anthropic vision completion: "
                f"{tokens} tokens used"
            )

            return content, tokens

        except Exception as e:
            logger.error(
                f"Anthropic vision completion failed: {e}"
            )
            raise
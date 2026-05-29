"""
OpenAI client for CropGuard AI.

Handles all communication with the OpenAI API
including vision analysis and text completion.

Models supported:
    gpt-4o       — best vision + reasoning (recommended)
    gpt-4-turbo  — slightly cheaper alternative

Why OpenAI as primary provider?
    GPT-4o has the best multimodal performance
    for plant disease image analysis based on
    testing during development.

Usage:
    from llm.openai_client import OpenAIClient
    
    client = OpenAIClient(model="gpt-4o")
    
    # Text completion
    response = await client.complete(
        system_prompt="You are a plant pathologist",
        user_prompt="What disease is this?"
    )
    
    # Vision completion
    response = await client.complete_with_image(
        system_prompt="Analyze this leaf",
        user_prompt="Describe what you see",
        image_data=base64_string,
        image_type="image/jpeg"
    )
"""

import logging
from typing import Optional
from openai import AsyncOpenAI
from config import get_settings
from utils.retry import with_retry

logger = logging.getLogger(__name__)


class OpenAIClient:
    """
    Async OpenAI client wrapper for CropGuard AI.
    
    Wraps the official OpenAI Python SDK with
    retry logic, logging and consistent interface
    matching the other LLM clients.
    
    Attributes:
        model: The OpenAI model to use
        client: AsyncOpenAI instance
        
    Example:
        client = OpenAIClient(model="gpt-4o")
        response = await client.complete(
            system_prompt="...",
            user_prompt="..."
        )
    """

    # Models this client supports
    SUPPORTED_MODELS = ["gpt-4o", "gpt-4-turbo"]

    def __init__(self, model: str = "gpt-4o"):
        """
        Initialise the OpenAI client.
        
        Args:
            model: OpenAI model name to use.
                   Must be in SUPPORTED_MODELS.
                   
        Raises:
            ValueError: If model is not supported.
        """
        if model not in self.SUPPORTED_MODELS:
            raise ValueError(
                f"Model '{model}' not supported. "
                f"Choose from: {self.SUPPORTED_MODELS}"
            )

        settings = get_settings()
        self.model = model
        self.client = AsyncOpenAI(
            api_key=settings.openai_api_key
        )
        logger.info(f"OpenAIClient initialised: {model}")

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
        Send a text completion request to OpenAI.
        
        Args:
            system_prompt: Instructions for the model
            user_prompt: The user message
            max_tokens: Maximum tokens in response
            temperature: Creativity level (0-2)
            top_p: Nucleus sampling parameter
            frequency_penalty: Repetition penalty
            
        Returns:
            tuple:
                - str: The model's response text
                - int: Total tokens used
                
        Example:
            response, tokens = await client.complete(
                system_prompt="You are an expert...",
                user_prompt="What disease is this?"
            )
        """
        @with_retry(max_attempts=3)
        async def _call():
            return await self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_prompt
                    }
                ]
            )

        try:
            response = await _call()
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens

            logger.info(
                f"OpenAI completion: "
                f"{tokens} tokens used"
            )

            return content, tokens

        except Exception as e:
            logger.error(
                f"OpenAI completion failed: {e}"
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
        Send a vision completion request to OpenAI.
        
        Sends both text and image to GPT-4o for
        multimodal analysis of the leaf photo.
        
        Args:
            system_prompt: Instructions for the model
            user_prompt: Text question about the image
            image_data: Base64 encoded image string
            image_type: MIME type e.g. "image/jpeg"
            max_tokens: Maximum tokens in response
            temperature: Creativity level (0-2)
            top_p: Nucleus sampling parameter
            frequency_penalty: Repetition penalty
            
        Returns:
            tuple:
                - str: Visual analysis description
                - int: Total tokens used
                
        Example:
            response, tokens = await client.complete_with_image(
                system_prompt="Analyze this leaf...",
                user_prompt="Describe what you see",
                image_data=base64_string
            )
        """
        @with_retry(max_attempts=3)
        async def _call():
            return await self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": user_prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": (
                                        f"data:{image_type};"
                                        f"base64,{image_data}"
                                    ),
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ]
            )

        try:
            response = await _call()
            content = response.choices[0].message.content
            tokens = response.usage.total_tokens

            logger.info(
                f"OpenAI vision completion: "
                f"{tokens} tokens used"
            )

            return content, tokens

        except Exception as e:
            logger.error(
                f"OpenAI vision completion failed: {e}"
            )
            raise
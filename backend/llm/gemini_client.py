# backend/llm/gemini_client.py
"""
Google Gemini client for CropGuard AI.

Handles communication with the Google Gemini API
as a third LLM provider option.

Models supported:
    gemini-1.5-pro   — best Gemini model
    gemini-1.5-flash — faster cheaper alternative

Why include Gemini?
    Implements Medium Optional Task #9:
    'Implement multi-model support'
    
    Gemini 1.5 Pro has strong vision capabilities
    and may perform well on crop disease images.

Note:
    Requires GEMINI_API_KEY in .env file.

Usage:
    from llm.gemini_client import GeminiClient
    
    client = GeminiClient(model="gemini-1.5-pro")
    response, tokens = await client.complete(
        system_prompt="...",
        user_prompt="..."
    )
"""

import logging
from config import get_settings
from utils.retry import with_retry

logger = logging.getLogger(__name__)


class GeminiClient:
    """
    Async Google Gemini client for CropGuard AI.
    
    Wraps the Google Generative AI SDK with
    retry logic and consistent interface.
    
    Attributes:
        model: The Gemini model to use
        
    Example:
        client = GeminiClient("gemini-1.5-pro")
        response, tokens = await client.complete(
            system_prompt="...",
            user_prompt="..."
        )
    """

    SUPPORTED_MODELS = [
        "gemini-1.5-pro",
        "gemini-1.5-flash"
    ]

    def __init__(
        self,
        model: str = "gemini-1.5-pro"
    ):
        """
        Initialise the Gemini client.
        
        Args:
            model: Gemini model name to use.
            
        Raises:
            ImportError: If google-generativeai
                         package not installed.
            ValueError: If model not supported.
        """
        try:
            import google.generativeai as genai
            self._genai = genai
        except ImportError:
            raise ImportError(
                "google-generativeai not installed. "
                "Run: pip install google-generativeai"
            )

        if model not in self.SUPPORTED_MODELS:
            raise ValueError(
                f"Model '{model}' not supported. "
                f"Choose from: {self.SUPPORTED_MODELS}"
            )

        import os
        self.model_name = model
        genai.configure(
            api_key=os.getenv("GEMINI_API_KEY", "")
        )
        self.model = genai.GenerativeModel(model)

        logger.info(
            f"GeminiClient initialised: {model}"
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
        Send a text completion request to Gemini.
        
        Args:
            system_prompt: Instructions for Gemini
            user_prompt: The user message
            max_tokens: Maximum tokens in response
            temperature: Creativity level (0-1)
            top_p: Nucleus sampling parameter
            frequency_penalty: Not used by Gemini
            
        Returns:
            tuple:
                - str: Gemini's response text
                - int: Estimated tokens used
        """
        import asyncio

        full_prompt = f"{system_prompt}\n\n{user_prompt}"

        @with_retry(max_attempts=3)
        async def _call():
            # Gemini SDK is sync — run in thread
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    full_prompt,
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": temperature,
                        "top_p": top_p
                    }
                )
            )

        try:
            response = await _call()
            content = response.text

            # Gemini token counting is estimated
            tokens = len(full_prompt.split()) * 1.3

            logger.info(
                f"Gemini completion: "
                f"~{int(tokens)} tokens estimated"
            )

            return content, int(tokens)

        except Exception as e:
            logger.error(
                f"Gemini completion failed: {e}"
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
        Send a vision completion request to Gemini.
        
        Args:
            system_prompt: Instructions for Gemini
            user_prompt: Text question about image
            image_data: Base64 encoded image string
            image_type: MIME type e.g. "image/jpeg"
            max_tokens: Maximum tokens in response
            temperature: Creativity level
            top_p: Nucleus sampling
            frequency_penalty: Not used by Gemini
            
        Returns:
            tuple:
                - str: Gemini's visual description
                - int: Estimated tokens used
        """
        import asyncio
        import base64

        # Decode base64 to bytes for Gemini
        image_bytes = base64.b64decode(image_data)

        full_prompt = (
            f"{system_prompt}\n\n{user_prompt}"
        )

        @with_retry(max_attempts=3)
        async def _call():
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                None,
                lambda: self.model.generate_content(
                    [
                        full_prompt,
                        {
                            "mime_type": image_type,
                            "data": image_bytes
                        }
                    ],
                    generation_config={
                        "max_output_tokens": max_tokens,
                        "temperature": temperature,
                        "top_p": top_p
                    }
                )
            )

        try:
            response = await _call()
            content = response.text
            tokens = len(full_prompt.split()) * 1.3

            logger.info(
                f"Gemini vision completion: "
                f"~{int(tokens)} tokens estimated"
            )

            return content, int(tokens)

        except Exception as e:
            logger.error(
                f"Gemini vision completion failed: {e}"
            )
            raise
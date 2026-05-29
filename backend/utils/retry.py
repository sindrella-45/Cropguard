"""
Retry logic for API calls in CropGuard AI.

Provides a decorator that automatically retries
failed API calls with exponential backoff.

Implements Optional Task Medium #2:
    'Add retry logic for agents'

Why retry logic?
    External API calls to OpenAI, Supabase and
    weather services can fail temporarily due to:
    - Rate limiting (too many requests)
    - Network timeouts
    - Service downtime
    - Temporary server errors (500, 503)

    Without retry logic a single failed API call
    would crash the entire diagnosis request.
    
    With retry logic the agent automatically
    tries again up to 3 times before giving up.

Retry strategy:
    Attempt 1: immediate
    Attempt 2: wait 2 seconds
    Attempt 3: wait 4 seconds
    Attempt 4: wait 8 seconds (if max=4)
    
    This is exponential backoff — each wait
    is double the previous to avoid hammering
    an already struggling API.

Usage:
    from utils.retry import with_retry
    
    @with_retry(max_attempts=3)
    async def call_openai():
        return await client.chat.completions.create(...)
        
    # Or as a context
    @with_retry(max_attempts=2, base_delay=1.0)
    async def call_weather_api():
        return await httpx.get(url)
"""

import asyncio
import logging
from functools import wraps
from typing import Callable, TypeVar, Any

logger = logging.getLogger(__name__)

T = TypeVar("T")

# HTTP status codes that should trigger a retry
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def with_retry(
    max_attempts: int = 3,
    base_delay: float = 2.0,
    exponential: bool = True
):
    """
    Decorator factory that adds retry logic to
    async functions with exponential backoff.
    
    Wraps an async function and automatically
    retries it on failure up to max_attempts times.
    Uses exponential backoff between attempts to
    avoid overwhelming struggling services.
    
    Args:
        max_attempts: Maximum number of attempts
                      before raising the error.
                      Default is 3.
        base_delay: Initial wait time in seconds
                    between attempts. Default 2.0s.
        exponential: If True, doubles delay each
                     attempt. If False uses fixed
                     delay. Default True.
                     
    Returns:
        Decorator function that wraps async functions
        
    Example:
        @with_retry(max_attempts=3, base_delay=2.0)
        async def call_openai():
            return await client.chat.completions.create(...)
            
        # Will try up to 3 times:
        # Attempt 1: immediate
        # Attempt 2: wait 2 seconds
        # Attempt 3: wait 4 seconds
        # If all fail: raises the last exception
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            delay = base_delay

            for attempt in range(1, max_attempts + 1):
                try:
                    result = await func(*args, **kwargs)
                    
                    # Log success after retry
                    if attempt > 1:
                        logger.info(
                            f"{func.__name__} succeeded "
                            f"on attempt {attempt}"
                        )
                    
                    return result

                except Exception as e:
                    last_exception = e

                    # Don't retry on final attempt
                    if attempt == max_attempts:
                        logger.error(
                            f"{func.__name__} failed "
                            f"after {max_attempts} attempts: "
                            f"{e}"
                        )
                        break

                    logger.warning(
                        f"{func.__name__} attempt "
                        f"{attempt}/{max_attempts} failed: "
                        f"{e}. "
                        f"Retrying in {delay}s..."
                    )

                    # Wait before retrying
                    await asyncio.sleep(delay)

                    # Increase delay for next attempt
                    if exponential:
                        delay *= 2

            raise last_exception

        return wrapper
    return decorator

"""
Token usage and cost tracking endpoints.

Provides endpoints for tracking API token
consumption and costs per farmer.

Implements Optional Task Medium #1:
    'Calculate and display token usage and costs'

Endpoints:
    GET /tokens/usage    — get token usage stats
    GET /tokens/models   — get available LLM models

Why track tokens?
    Each GPT-4o API call costs money based on
    the number of tokens used. Farmers and admins
    can monitor usage to understand costs and
    optimise their usage patterns.

Token costs (approximate):
    GPT-4o input:    $0.005 per 1K tokens
    GPT-4o output:   $0.015 per 1K tokens

Usage:
    GET /tokens/usage
    Authorization: Bearer <token>
    → {
        "total_tokens": 4520,
        "total_cost_usd": 0.0452,
        "requests_made": 10
      }
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from models.requests import TokenUsageResponse
from auth.middleware import get_current_user
from database import get_supabase
from database.supabase_client import Tables
from llm.factory import get_available_models

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/tokens/usage",
    response_model=TokenUsageResponse,
    summary="Get token usage and cost statistics",
    tags=["Tokens"]
)
async def get_token_usage(
    current_user: dict = Depends(get_current_user)
):
    """
    Get the authenticated farmer's API token
    usage and cost statistics.
    
    Queries the token_usage table in Supabase
    and returns aggregated statistics.
    
    Args:
        current_user: Authenticated farmer from JWT
        
    Returns:
        TokenUsageResponse: Usage statistics including:
                            - total_tokens: all tokens used
                            - total_cost_usd: total cost
                            - requests_made: API call count
                            - average_tokens_per_request
                            
    Raises:
        HTTPException 401: If not authenticated
        HTTPException 500: If query fails
        
    Example:
        GET /tokens/usage
        Authorization: Bearer <token>
        → {
            "total_tokens": 4520,
            "total_cost_usd": 0.0452,
            "requests_made": 10,
            "average_tokens_per_request": 452.0
          }
    """
    supabase = get_supabase()

    try:
        result = (
            supabase
            .table(Tables.TOKEN_USAGE)
            .select("tokens_used, cost_usd")
            .eq("user_id", current_user["id"])
            .execute()
        )

        usage_list = result.data or []

        if not usage_list:
            return TokenUsageResponse(
                total_tokens=0,
                total_cost_usd=0.0,
                requests_made=0,
                average_tokens_per_request=0.0
            )

        total_tokens = sum(
            u.get("tokens_used", 0)
            for u in usage_list
        )
        total_cost = sum(
            u.get("cost_usd", 0.0)
            for u in usage_list
        )
        requests_made = len(usage_list)
        avg_tokens = (
            total_tokens / requests_made
            if requests_made > 0 else 0
        )

        logger.info(
            f"Token usage fetched: "
            f"{total_tokens} tokens, "
            f"${total_cost:.4f}"
        )

        return TokenUsageResponse(
            total_tokens=total_tokens,
            total_cost_usd=round(total_cost, 6),
            requests_made=requests_made,
            average_tokens_per_request=round(avg_tokens, 1)
        )

    except Exception as e:
        logger.error(f"Token usage fetch failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch token usage."
        )


@router.get(
    "/tokens/models",
    summary="Get available LLM models",
    tags=["Tokens"]
)
async def get_models():
    """
    Get all available LLM models based on
    configured API keys.
    
    Returns only models whose API keys exist
    in the .env file. Used by the frontend
    ModelSelector component to populate
    the model dropdown.
    
    Returns:
        dict: Available models list with details
        
    Example:
        GET /tokens/models
        → {
            "models": [
                {
                    "id": "gpt-4o",
                    "name": "GPT-4o",
                    "provider": "OpenAI",
                    "recommended": true
                }
            ]
          }
    """
    try:
        models = get_available_models()

        logger.info(
            f"Returning {len(models)} available models"
        )

        return {"models": models}

    except Exception as e:
        logger.error(f"Get models failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get available models."
        )

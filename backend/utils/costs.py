"""
Token cost calculation utilities for CropGuard AI.

Calculates the USD cost of API calls based on
token usage and the model used.

Implements Optional Task Medium #1:
    'Calculate and display token usage and costs'

Why track costs?
    Each API call to GPT-4o costs real money.
    Tracking costs helps farmers and developers:
    - Understand the cost per diagnosis
    - Monitor monthly API spending
    - Compare costs across different models
    - Identify unusually expensive requests

Token pricing (as of 2024 — check OpenAI for latest):
    gpt-4o input:          $0.005  per 1K tokens
    gpt-4o output:         $0.015  per 1K tokens
    gpt-4-turbo input:     $0.01   per 1K tokens
    gpt-4-turbo output:    $0.03   per 1K tokens
    claude-3-opus input:   $0.015  per 1K tokens
    claude-3-opus output:  $0.075  per 1K tokens
    gemini-1.5-pro input:  $0.0035 per 1K tokens
    gemini-1.5-pro output: $0.0105 per 1K tokens

Note:
    These are approximate blended rates.
    Exact costs depend on input vs output split.

Usage:
    from utils.costs import calculate_cost
    
    cost = calculate_cost(
        tokens=450,
        model="gpt-4o"
    )
    print(f"Cost: ${cost:.4f}")  # Cost: $0.0034
"""

import logging

logger = logging.getLogger(__name__)

# Approximate blended cost per 1000 tokens
# (average of input and output rates)
# Update these when OpenAI/Anthropic change pricing
COST_PER_1K_TOKENS: dict[str, float] = {
    "gpt-4o": 0.0075,
    "gpt-4-turbo": 0.02,
    "claude-3-opus-20240229": 0.03,
    "claude-3-sonnet-20240229": 0.006,
    "gemini-1.5-pro": 0.007,
    "gemini-1.5-flash": 0.00035,
    # Default fallback rate
    "default": 0.01
}


def calculate_cost(
    tokens: int,
    model: str = "gpt-4o"
) -> float:
    """
    Calculate the USD cost of an API call.
    
    Uses approximate blended token rates for
    each supported model. Returns 0.0 if the
    model is not in the pricing table.
    
    Args:
        tokens: Total number of tokens used
                (input + output combined)
        model: The LLM model used for the call
        
    Returns:
        float: Estimated cost in USD
        
    Example:
        cost = calculate_cost(tokens=450, model="gpt-4o")
        print(f"${cost:.6f}")  # $0.003375
        
        cost = calculate_cost(
            tokens=1200,
            model="claude-3-opus-20240229"
        )
        print(f"${cost:.6f}")  # $0.036000
    """
    # Get rate for model or use default
    rate = COST_PER_1K_TOKENS.get(
        model,
        COST_PER_1K_TOKENS["default"]
    )

    # Calculate cost
    cost = (tokens / 1000) * rate

    logger.debug(
        f"Cost calculated: "
        f"{tokens} tokens × "
        f"${rate}/1K = ${cost:.6f} "
        f"({model})"
    )

    return cost


def format_cost(cost: float) -> str:
    """
    Format a cost value as a human readable string.
    
    Chooses the appropriate number of decimal
    places based on the magnitude of the cost.
    
    Args:
        cost: Cost in USD
        
    Returns:
        str: Formatted cost string
        
    Example:
        print(format_cost(0.003375))  # "$0.0034"
        print(format_cost(1.234))     # "$1.23"
        print(format_cost(0.00001))   # "$0.000010"
    """
    if cost >= 1.0:
        return f"${cost:.2f}"
    elif cost >= 0.001:
        return f"${cost:.4f}"
    else:
        return f"${cost:.6f}"


def estimate_tokens(text: str) -> int:
    """
    Estimate the number of tokens in a text string.
    
    Uses a simple approximation of 1 token per
    4 characters which is close enough for cost
    estimation purposes without needing tiktoken.
    
    Args:
        text: The text to estimate tokens for
        
    Returns:
        int: Estimated token count
        
    Example:
        tokens = estimate_tokens("Hello world")
        print(tokens)  # 3
    """
    # Rough approximation: 1 token ≈ 4 characters
    return max(1, len(text) // 4)
"""
Fallback handler for CropGuard AI RAG pipeline.

Handles cases where retrieval confidence is too
low to generate a reliable diagnosis.

Why a fallback matters:
    If no chunks meet the similarity threshold,
    the agent has no verified knowledge to ground
    its diagnosis. Without a fallback, GPT-4o might
    hallucinate a confident diagnosis which could
    lead a farmer to apply the wrong treatment.

    A farmer acting on a hallucinated diagnosis
    could lose their entire harvest.

This directly addresses reviewer feedback:
    'Add a fallback response when retrieval 
    confidence is low instead of generating 
    potentially hallucinated content'

Usage:
    from rag.retrieval import handle_fallback
    
    response = handle_fallback(
        confidence_score=0.42,
        personality="friendly"
    )
"""

import logging
from prompts import render_prompt
from config import get_settings

logger = logging.getLogger(__name__)


def handle_fallback(
    confidence_score: float,
    personality: str = "friendly"
) -> dict:
    """
    Generate a safe fallback response when retrieval
    confidence is below the acceptable threshold.
    
    Instead of allowing the agent to hallucinate,
    this returns an honest response that tells the
    farmer the app could not give a reliable answer
    and advises them to seek expert help.
    
    Args:
        confidence_score: The highest similarity score
                          from retrieval (below threshold)
        personality: Communication style for the message
        
    Returns:
        dict: Fallback response containing:
              - fallback_triggered: True
              - message: explanation for the farmer
              - confidence_score: the actual score
              - recommended_actions: what to do next
              
    Example:
        response = handle_fallback(
            confidence_score=0.42,
            personality="friendly"
        )
        print(response["fallback_triggered"])  # True
    """
    settings = get_settings()

    logger.warning(
        f"Fallback triggered. "
        f"Confidence: {confidence_score} "
        f"< threshold: {settings.rag_similarity_threshold}"
    )

    # Render the fallback message using Jinja2 template
    message = render_prompt(
        "rag/fallback.j2",
        confidence_score=round(confidence_score, 3),
        threshold=settings.rag_similarity_threshold,
        personality=personality
    )

    return {
        "fallback_triggered": True,
        "message": message,
        "confidence_score": confidence_score,
        "threshold": settings.rag_similarity_threshold,
        "recommended_actions": [
            "Retake photo in good natural lighting",
            "Ensure affected leaf area is clearly visible",
            "Try a closer shot of the symptoms",
            "Contact local agricultural extension officer"
        ]
    }


def should_fallback(chunks: list[dict]) -> bool:
    """
    Determine whether a fallback should be triggered
    based on retrieved chunk quality.
    
    Args:
        chunks: List of chunks after evaluation filter
        
    Returns:
        bool: True if fallback should be used,
              False if chunks are good enough.
              
    Example:
        if should_fallback(filtered_chunks):
            return handle_fallback(0.45, "friendly")
    """
    # Trigger fallback if no chunks passed threshold
    if not chunks:
        logger.warning(
            "Fallback required: no chunks passed threshold"
        )
        return True

    # Trigger fallback if best score is very low
    best_score = max(
        c["similarity_score"] for c in chunks
    )
    settings = get_settings()

    if best_score < settings.rag_similarity_threshold:
        logger.warning(
            f"Fallback required: best score "
            f"{best_score} < {settings.rag_similarity_threshold}"
        )
        return True

    return False
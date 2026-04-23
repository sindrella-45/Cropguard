"""
Feedback loop for CropGuard AI agent.

Analyses low-rated diagnoses to identify patterns
and improve future agent performance.

This implements Hard Optional Task #4:
    'Create an agent that can learn from user feedback'

How it works:
    1. Farmer rates a diagnosis poorly (1-2 stars)
    2. Feedback is saved to Supabase feedback table
    3. This module analyses patterns in low ratings
    4. Generates improvement suggestions
    5. These are logged and can inform prompt updates

Note:
    This is a lightweight feedback loop that logs
    improvement suggestions rather than automatically
    modifying prompts. Full automated prompt tuning
    would require fine-tuning (Hard Task #3).

Usage:
    from agent.feedback_loop import analyse_feedback
    
    suggestions = await analyse_feedback(
        diagnosis_id="abc123",
        rating=2,
        comment="Wrong disease identified",
        user_id="user456"
    )
"""

import logging
from database import get_supabase
from database.supabase_client import Tables
from llm.factory import get_llm_client
from prompts import render_prompt

logger = logging.getLogger(__name__)

# Rating threshold below which feedback
# is considered negative and analysed
LOW_RATING_THRESHOLD = 3


async def analyse_feedback(
    diagnosis_id: str,
    rating: int,
    comment: str = None,
    user_id: str = None,
    model: str = "gpt-4o"
) -> dict:
    """
    Analyse a low-rated diagnosis and generate
    improvement suggestions for the agent.
    
    Only processes ratings below LOW_RATING_THRESHOLD.
    High ratings are simply saved without analysis.
    
    Args:
        diagnosis_id: The diagnosis that was rated
        rating: Farmer's star rating (1-5)
        comment: Optional farmer comment
        user_id: Farmer's user ID
        model: LLM to use for analysis
        
    Returns:
        dict: Analysis result containing:
              - analysed: bool
              - suggestions: list of improvements
              - patterns: recurring issues found
              
    Example:
        result = await analyse_feedback(
            diagnosis_id="abc123",
            rating=2,
            comment="Said my tomato was healthy but it died"
        )
        print(result["suggestions"])
    """
    # Only analyse low ratings
    if rating >= LOW_RATING_THRESHOLD:
        logger.info(
            f"Rating {rating} is above threshold "
            f"— no analysis needed"
        )
        return {
            "analysed": False,
            "reason": "Rating above threshold"
        }

    logger.info(
        f"Analysing low rating {rating} "
        f"for diagnosis: {diagnosis_id}"
    )

    try:
        supabase = get_supabase()

        # Get the original diagnosis
        diagnosis_result = (
            supabase
            .table(Tables.DIAGNOSES)
            .select("*")
            .eq("id", diagnosis_id)
            .single()
            .execute()
        )

        original_diagnosis = diagnosis_result.data
        if not original_diagnosis:
            logger.warning(
                f"Diagnosis not found: {diagnosis_id}"
            )
            return {"analysed": False}

        # Get recent low-rated patterns
        patterns = await _get_low_rating_patterns()

        # Generate improvement suggestions
        client = get_llm_client(model)

        prompt = render_prompt(
            "feedback/improvement.j2",
            original_diagnosis=(
                original_diagnosis.get("disease_name")
            ),
            rating=rating,
            comment=comment,
            low_rating_patterns=patterns
        )

        suggestions_text, _ = await client.complete(
            system_prompt=(
                "You are an AI quality analyst "
                "reviewing crop disease diagnosis quality."
            ),
            user_prompt=prompt,
            max_tokens=300,
            temperature=0.4
        )

        # Log suggestions for manual review
        logger.info(
            f"Feedback analysis complete:\n"
            f"{suggestions_text}"
        )

        return {
            "analysed": True,
            "diagnosis_id": diagnosis_id,
            "rating": rating,
            "suggestions": suggestions_text,
            "patterns_found": patterns
        }

    except Exception as e:
        logger.error(f"Feedback analysis failed: {e}")
        return {
            "analysed": False,
            "error": str(e)
        }


async def _get_low_rating_patterns() -> list[str]:
    """
    Identify recurring patterns in low-rated diagnoses.
    
    Queries recent feedback to find common issues
    that suggest systematic problems with the agent.
    
    Returns:
        list[str]: List of identified patterns.
                   Empty list if no patterns found.
    """
    try:
        supabase = get_supabase()

        # Get recent low rated feedback
        result = (
            supabase
            .table(Tables.FEEDBACK)
            .select("*, diagnoses(disease_name, plant_identified)")
            .lte("rating", LOW_RATING_THRESHOLD)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )

        feedback_list = result.data or []

        if not feedback_list:
            return []

        # Count disease-specific issues
        disease_issues: dict[str, int] = {}
        for feedback in feedback_list:
            diagnosis = feedback.get("diagnoses", {})
            disease = diagnosis.get(
                "disease_name", "Unknown"
            )
            disease_issues[disease] = (
                disease_issues.get(disease, 0) + 1
            )

        # Return diseases with multiple low ratings
        patterns = [
            f"{disease} misidentified {count} times"
            for disease, count in disease_issues.items()
            if count >= 2
        ]

        logger.info(
            f"Found {len(patterns)} recurring patterns"
        )

        return patterns

    except Exception as e:
        logger.error(
            f"Failed to get low rating patterns: {e}"
        )
        return []

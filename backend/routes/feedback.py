import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from models.feedback import (
    FeedbackRequest,
    FeedbackResponse,
    FeedbackSummary,
)

from auth.middleware import get_optional_user
from database import get_supabase
from database.supabase_client import Tables

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/feedback",
    response_model=FeedbackResponse,
    tags=["Feedback"]
)
async def submit_feedback(
    request: FeedbackRequest,
    current_user: dict = Depends(get_optional_user),
):
    supabase = get_supabase()

    # Never trust frontend user_id
    user_id = current_user["id"] if current_user else "anonymous"

    fid = str(uuid.uuid4())

    base = {
        "id": fid,
        "user_id": user_id,
        "rating": request.rating,
        "comment": request.comment,
        "was_accurate": request.was_accurate,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        # Prevent duplicate feedback
        existing = (
            supabase.table(Tables.FEEDBACK)
            .select("id")
            .eq("diagnosis_id", request.diagnosis_id)
            .eq("user_id", user_id)
            .execute()
        )

        if existing.data:
            raise HTTPException(
                status_code=400,
                detail="Feedback already submitted."
            )

        # Attempt 1: save with diagnosis_id
        try:
            supabase.table(Tables.FEEDBACK).insert(
                {
                    **base,
                    "diagnosis_id": request.diagnosis_id
                }
            ).execute()

        except Exception:
            # Fallback if diagnosis FK fails
            logger.warning(
                "FK miss on diagnosis_id — retrying with NULL"
            )

            note = (
                f"[session:{request.diagnosis_id}] "
                + (request.comment or "")
            )

            supabase.table(Tables.FEEDBACK).insert(
                {
                    **base,
                    "diagnosis_id": None,
                    "comment": note.strip(),
                }
            ).execute()

        logger.info(
            f"Feedback saved: id={fid} rating={request.rating}"
        )

        # Trigger learning loop for poor ratings
        if request.rating <= 2:
            try:
                from agent.feedback_loop import analyse_feedback

                await analyse_feedback(
                    request.diagnosis_id,
                    request.rating,
                    request.comment,
                    user_id,
                )

            except Exception as e:
                logger.warning(
                    f"Feedback loop (non-fatal): {e}"
                )

        return FeedbackResponse(
            success=True,
            message="Thank you for your feedback!",
            feedback_id=fid,
            submitted_at=datetime.utcnow(),
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Feedback failed: {e}")

        raise HTTPException(
            status_code=500,
            detail="Failed to submit feedback.",
        )


@router.get("/feedback/summary", tags=["Feedback"])
async def get_feedback_summary(
    current_user: dict = Depends(get_optional_user)
):
    if not current_user:
        return {
            "total_feedback": 0,
            "average_rating": 0,
            "accuracy_rate": 0,
        }

    try:
        rows = (
            get_supabase()
            .table(Tables.FEEDBACK)
            .select("rating, was_accurate")
            .eq("user_id", current_user["id"])
            .execute()
            .data
            or []
        )

        if not rows:
            return {
                "total_feedback": 0,
                "average_rating": 0,
                "accuracy_rate": 0,
            }

        total = len(rows)

        # Only count rows with explicit accuracy feedback
        rated = [
            r for r in rows
            if r.get("was_accurate") is not None
        ]

        accuracy = (
            sum(1 for r in rated if r["was_accurate"])
            / len(rated)
            * 100
        ) if rated else 0

        return {
            "total_feedback": total,

            "average_rating": round(
                sum(r["rating"] for r in rows) / total,
                2,
            ),

            "accuracy_rate": round(accuracy, 1),
        }

    except Exception as e:
        logger.error(
            f"Failed to get feedback summary: {e}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve feedback summary.",
        )
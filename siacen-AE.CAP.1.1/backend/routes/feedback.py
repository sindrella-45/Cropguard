import logging, uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from auth.middleware import get_optional_user
from database import get_supabase
from database.supabase_client import Tables

logger = logging.getLogger(__name__)
router  = APIRouter()

class FeedbackRequest(BaseModel):
    diagnosis_id: str
    user_id:      str = "anonymous"
    rating:       int
    comment:      Optional[str] = None
    was_accurate: Optional[bool] = None

class FeedbackResponse(BaseModel):
    success:      bool
    message:      str
    feedback_id:  str
    submitted_at: datetime

@router.post("/feedback", response_model=FeedbackResponse, tags=["Feedback"])
async def submit_feedback(
    request: FeedbackRequest,
    current_user: dict = Depends(get_optional_user),
):
    supabase = get_supabase()
    user_id  = current_user["id"] if current_user else (request.user_id or "anonymous")
    fid      = str(uuid.uuid4())

    base = {
        "id": fid, "user_id": user_id,
        "rating": request.rating, "comment": request.comment,
        "was_accurate": request.was_accurate,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        # Attempt 1: with diagnosis_id (works if diagnosis saved to DB)
        try:
            supabase.table(Tables.FEEDBACK).insert(
                {**base, "diagnosis_id": request.diagnosis_id}
            ).execute()
        except Exception:
            # Attempt 2: without diagnosis_id (anonymous / FK miss)
            logger.warning("FK miss on diagnosis_id — retrying with NULL")
            note = f"[session:{request.diagnosis_id}] " + (request.comment or "")
            supabase.table(Tables.FEEDBACK).insert(
                {**base, "diagnosis_id": None, "comment": note.strip()}
            ).execute()

        logger.info(f"Feedback saved: id={fid} rating={request.rating}")

        if request.rating <= 2:
            try:
                from agent.feedback_loop import analyse_feedback
                await analyse_feedback(request.diagnosis_id, request.rating,
                                       request.comment, user_id)
            except Exception as e:
                logger.warning(f"Feedback loop (non-fatal): {e}")

        return FeedbackResponse(success=True, message="Thank you for your feedback!",
                                feedback_id=fid, submitted_at=datetime.utcnow())
    except Exception as e:
        logger.error(f"Feedback failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback.")

@router.get("/feedback/summary", tags=["Feedback"])
async def get_feedback_summary(current_user: dict = Depends(get_optional_user)):
    if not current_user:
        return {"total_feedback": 0, "average_rating": 0, "accuracy_rate": 0}
    try:
        rows = (get_supabase().table(Tables.FEEDBACK)
                .select("rating, was_accurate")
                .eq("user_id", current_user["id"]).execute().data or [])
        if not rows:
            return {"total_feedback": 0, "average_rating": 0, "accuracy_rate": 0}
        total = len(rows)
        return {
            "total_feedback": total,
            "average_rating": round(sum(r["rating"] for r in rows) / total, 2),
            "accuracy_rate":  round(sum(1 for r in rows if r.get("was_accurate")) / total * 100, 1),
        }
    except Exception as e:
        logger.error(f"Feedback summary failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get summary.")
# Defines user feedback data shapes
# Used for the feedback loop optional task

from pydantic import BaseModel, Field
from typing import Optional
import datetime


class FeedbackRequest(BaseModel):
    """
    What the frontend sends when farmer 
    rates a diagnosis
    """
    diagnosis_id: str
    user_id: str
    rating: int = Field(
        ge=1,
        le=5,
        description="Star rating from 1 to 5"
    )
    comment: Optional[str] = None
    was_accurate: Optional[bool] = None  # was the diagnosis correct?


class FeedbackResponse(BaseModel):
    """
    What the backend sends back after 
    saving the feedback
    """
    success: bool
    message: str
    feedback_id: str
    submitted_at: datetime.datetime


class FeedbackSummary(BaseModel):
    """
    Summary of feedback for a specific disease
    Used by the agent to improve future responses
    """
    disease_name: str
    total_ratings: int
    average_rating: float
    accurate_count: int
    inaccurate_count: int
    common_complaints: list[str] = []

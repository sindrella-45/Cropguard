"""
Main disease analysis endpoint for CropGuard AI.
Rate limited to 10 requests per minute per IP.
"""

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from models.requests import AnalyzeRequest
from agent import run_agent
from auth.middleware import get_optional_user
from utils.logger import log_request

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


@router.post(
    "/analyze",
    summary="Analyze a leaf image for crop diseases",
    tags=["Analysis"]
)
@limiter.limit("10/minute")
async def analyze_leaf(
    request: Request,
    body: AnalyzeRequest,
    current_user: dict = Depends(get_optional_user)
):
    user_id    = current_user["id"] if current_user else None
    session_id = str(uuid.uuid4())

    log_request(
        endpoint="/analyze",
        user_id=user_id,
        model=body.selected_model
    )

    logger.info(
        f"Analyze request: model={body.selected_model} "
        f"personality={body.personality} "
        f"language={body.language} "          # ← NEW
        f"authenticated={user_id is not None}"
    )

    try:
        result = await run_agent(
            image_data=body.image_data,
            image_type=body.image_type,
            plant_type=body.plant_type,
            personality=body.personality,
            selected_model=body.selected_model,
            user_id=user_id,
            session_id=session_id,
            language=body.language,           # ← NEW
        )

        if result.get("error"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Analysis failed.")
            )

        result["session_id"] = session_id
        return result

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Analyze endpoint failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )

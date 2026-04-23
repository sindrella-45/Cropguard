# backend/routes/analyze.py
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

# Local limiter reference — the actual limiter
# instance lives in app.py and is attached to app.state.
# This just creates the decorator correctly.
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
    """
    Main endpoint for crop disease detection.

    Rate limited to 10 requests per minute per IP address.
    Returns 429 Too Many Requests if the limit is exceeded.
    """
    user_id = current_user["id"] if current_user else None
    session_id = str(uuid.uuid4())

    log_request(
        endpoint="/analyze",
        user_id=user_id,
        model=body.selected_model
    )

    logger.info(
        f"Analyze request received: "
        f"model={body.selected_model}, "
        f"personality={body.personality}, "
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
            session_id=session_id
        )

        if result.get("error"):
            logger.error(f"Agent returned error: {result.get('message')}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=result.get("message", "Analysis failed. Please try again.")
            )

        logger.info(
            f"Analysis complete: "
            f"tokens={result.get('tokens_used', 0)}, "
            f"cost=${result.get('cost_usd', 0):.4f}"
        )

        result["session_id"] = session_id
        # diagnosis_id is injected by graph.py from save_memory node
        result["session_id"] = session_id
        logger.info(f"diagnose_id in result: {result.get('diagnosis_id')} session_id: {session_id}")
        return result

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Analyze endpoint failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again."
        )
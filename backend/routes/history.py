"""
Diagnosis history endpoints for CropGuard AI.

Provides endpoints for farmers to view their
past diagnoses and track crop health over time.

Endpoints:
    GET  /history          — get all past diagnoses
    GET  /history/{id}     — get single diagnosis
    DELETE /history/{id}   — delete a diagnosis

Why history matters:
    Farmers can track whether diseases are
    recurring, whether treatments worked, and
    identify seasonal patterns in their crops.
    This is powered by long-term memory stored
    in Supabase.

Usage:
    GET /history
    Authorization: Bearer <token>
    → List of past diagnoses newest first
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from auth.middleware import get_current_user
from memory.long_term import LongTermMemory

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/history",
    summary="Get farmer diagnosis history",
    tags=["History"]
)
async def get_history(
    limit: int = 10,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve the authenticated farmer's diagnosis history.
    
    Returns past diagnoses ordered by date with
    the most recent first. Used by the History.tsx
    component on the dashboard page.
    
    Args:
        limit: Maximum diagnoses to return (default 10)
        current_user: Authenticated farmer from JWT
        
    Returns:
        dict: Contains:
              - diagnoses: list of past diagnoses
              - total: total count
              - summary: history summary stats
              
    Raises:
        HTTPException 401: If not authenticated
        HTTPException 500: If database query fails
        
    Example:
        GET /history?limit=5
        Authorization: Bearer <token>
    """
    try:
        memory = LongTermMemory(
            user_id=current_user["id"]
        )

        diagnoses = memory.get_recent_diagnoses(
            limit=limit
        )

        summary = memory.get_history_summary()

        logger.info(
            f"History fetched for user "
            f"{current_user['id']}: "
            f"{len(diagnoses)} diagnoses"
        )

        return {
            "diagnoses": diagnoses,
            "total": len(diagnoses),
            "summary": summary
        }

    except Exception as e:
        logger.error(f"History fetch failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch history."
        )


@router.get(
    "/history/{diagnosis_id}",
    summary="Get single diagnosis by ID",
    tags=["History"]
)
async def get_diagnosis(
    diagnosis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieve a single diagnosis by its ID.
    
    Used when a farmer clicks on a specific past
    diagnosis to see the full details.
    
    Args:
        diagnosis_id: Unique diagnosis identifier
        current_user: Authenticated farmer from JWT
        
    Returns:
        dict: Complete diagnosis record
        
    Raises:
        HTTPException 401: If not authenticated
        HTTPException 404: If diagnosis not found
        HTTPException 500: If query fails
        
    Example:
        GET /history/abc-123-def
        Authorization: Bearer <token>
    """
    try:
        memory = LongTermMemory(
            user_id=current_user["id"]
        )

        diagnosis = memory.get_diagnosis_by_id(
            diagnosis_id=diagnosis_id
        )

        if not diagnosis:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Diagnosis {diagnosis_id} not found."
            )

        return diagnosis

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Get diagnosis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch diagnosis."
        )


@router.delete(
    "/history/{diagnosis_id}",
    summary="Delete a diagnosis from history",
    tags=["History"]
)
async def delete_diagnosis(
    diagnosis_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific diagnosis from history.
    
    Allows farmers to remove incorrect or unwanted
    diagnoses from their history.
    
    Args:
        diagnosis_id: Unique diagnosis identifier
        current_user: Authenticated farmer from JWT
        
    Returns:
        dict: Success confirmation message
        
    Raises:
        HTTPException 401: If not authenticated
        HTTPException 404: If diagnosis not found
        HTTPException 500: If deletion fails
        
    Example:
        DELETE /history/abc-123-def
        Authorization: Bearer <token>
    """
    try:
        memory = LongTermMemory(
            user_id=current_user["id"]
        )

        success = memory.delete_diagnosis(
            diagnosis_id=diagnosis_id
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Diagnosis {diagnosis_id} not found."
            )

        logger.info(
            f"Diagnosis deleted: {diagnosis_id}"
        )

        return {
            "message": "Diagnosis deleted successfully",
            "diagnosis_id": diagnosis_id
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Delete diagnosis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete diagnosis."
        )
"""
Authentication middleware for CropGuard AI.

Provides FastAPI dependency functions for
protecting routes that require authentication.

How JWT authentication works:
    1. Farmer logs in and receives JWT token
    2. Frontend stores token in localStorage
    3. Every request includes the token in header:
       Authorization: Bearer <token>
    4. FastAPI dependency extracts and validates token
    5. If valid the request proceeds
    6. If invalid 401 Unauthorized is returned

Usage:
    from auth.middleware import get_current_user
    from auth.middleware import get_optional_user
    
    # Protected route — requires login
    @router.post("/analyze")
    async def analyze(
        current_user: dict = Depends(get_current_user)
    ):
        user_id = current_user["id"]
    
    # Optional auth — works with or without login
    @router.post("/analyze")
    async def analyze(
        current_user: dict = Depends(get_optional_user)
    ):
        user_id = current_user["id"] if current_user else None
"""

import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_supabase

logger = logging.getLogger(__name__)

# FastAPI security scheme
# Looks for: Authorization: Bearer <token>
security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    FastAPI dependency that validates the JWT token
    and returns the current authenticated farmer.
    
    Use this for routes that REQUIRE authentication.
    Returns 401 if no valid token is provided.
    
    Args:
        credentials: JWT token from Authorization header
        
    Returns:
        dict: Authenticated farmer's user data including:
              - id: Supabase user ID
              - email: Farmer's email
              
    Raises:
        HTTPException 401: If token is missing,
                           expired or invalid
                           
    Example:
        @router.post("/analyze")
        async def analyze(
            current_user: dict = Depends(get_current_user)
        ):
            user_id = current_user["id"]
    """
    supabase = get_supabase()

    try:
        token = credentials.credentials

        # Validate token with Supabase
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
                headers={"WWW-Authenticate": "Bearer"}
            )

        user = user_response.user

        logger.debug(
            f"Authenticated user: {user.email}"
        )

        return {
            "id": user.id,
            "email": user.email
        }

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Auth validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        optional_security
    )
) -> Optional[dict]:
    """
    FastAPI dependency that optionally validates
    the JWT token if provided.
    
    Use this for routes that WORK WITH OR WITHOUT
    authentication. If no token is provided returns
    None instead of raising an error.
    
    This allows unauthenticated farmers to still
    use the app — they just won't have history saved.
    
    Args:
        credentials: Optional JWT token
        
    Returns:
        dict: Authenticated user data if token valid
        None: If no token provided
        
    Raises:
        HTTPException 401: Only if token provided
                           but invalid
                           
    Example:
        @router.post("/analyze")
        async def analyze(
            current_user: dict = Depends(get_optional_user)
        ):
            user_id = current_user["id"] if current_user else None
    """
    if not credentials:
        return None

    try:
        supabase = get_supabase()
        token = credentials.credentials
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            return None

        user = user_response.user

        return {
            "id": user.id,
            "email": user.email
        }

    except Exception as e:
        logger.debug(
            f"Optional auth failed silently: {e}"
        )
        return None

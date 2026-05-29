"""
Authentication routes for CropGuard AI.

Provides FastAPI endpoints for farmer
signup, login, logout and profile management.

Endpoints:
    POST /auth/signup   — create new farmer account
    POST /auth/login    — login and get JWT token
    POST /auth/logout   — invalidate session
    GET  /auth/me       — get current farmer profile
    POST /auth/reset    — request password reset

Why these endpoints?
    These are the minimum required for a complete
    authentication flow. The frontend Login.tsx
    component calls these endpoints directly.
"""



import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from database import get_supabase
from database.supabase_client import Tables

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Request / Response Models ──────────────────────────────

class SignupRequest(BaseModel):
    """
    Request body for farmer signup.

    Attributes:
        email: Farmer's email address
        password: Chosen password (min 6 chars)
        full_name: Farmer's full name
    """
    email: str
    password: str
    full_name: str


class LoginRequest(BaseModel):
    """
    Request body for farmer login.

    Attributes:
        email: Registered email address
        password: Account password
    """
    email: str
    password: str


class AuthResponse(BaseModel):
    """
    Response returned after successful
    signup or login.

    Attributes:
        access_token: JWT token for API requests
        token_type: Always "bearer"
        user_id: Farmer's unique Supabase user ID
        email: Farmer's email address
        full_name: Farmer's display name
    """
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str


class MessageResponse(BaseModel):
    """Simple message response for logout/reset."""
    message: str


# ── Signup Route ───────────────────────────────────────────

@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new farmer account"
)
async def signup(request: SignupRequest):
    """
    Register a new farmer account.

    Creates a Supabase auth user and stores
    the farmer's profile in the users table.

    Note: Disable email confirmation in Supabase
    Authentication settings for immediate access.

    Args:
        request: SignupRequest with email,
                 password and full_name

    Returns:
        AuthResponse: JWT token and user details

    Raises:
        HTTPException 400: If email already exists
                           or email confirmation needed
        HTTPException 500: If signup fails
    """
    supabase = get_supabase()

    try:
        # Create auth user in Supabase
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Signup failed. "
                    "Email may already exist."
                )
            )

        user_id = auth_response.user.id

        # Handle email confirmation required
        if auth_response.session is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Please disable email confirmation "
                    "in Supabase Authentication settings. "
                    "Go to: Authentication → Providers "
                    "→ Email → Turn off Confirm email"
                )
            )

        access_token = (
            auth_response.session.access_token
        )

        # Save farmer profile to users table
        try:
            supabase.table(Tables.USERS).insert({
                "id": user_id,
                "email": request.email,
                "full_name": request.full_name
            }).execute()
            logger.info(
                f"Profile saved for: {request.email}"
            )
        except Exception as db_error:
            logger.warning(
                f"Profile save failed: {db_error}"
            )

        logger.info(
            f"New farmer registered: {request.email}"
        )

        return AuthResponse(
            access_token=access_token,
            user_id=user_id,
            email=request.email,
            full_name=request.full_name
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )


# ── Login Route ────────────────────────────────────────────

@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login to farmer account"
)
async def login(request: LoginRequest):
    """
    Authenticate a farmer and return JWT token.

    Validates credentials against Supabase Auth
    and returns a JWT token for subsequent requests.

    Args:
        request: LoginRequest with email and password

    Returns:
        AuthResponse: JWT token and user details

    Raises:
        HTTPException 401: If credentials are wrong
        HTTPException 500: If login fails
    """
    supabase = get_supabase()

    try:
        auth_response = (
            supabase.auth.sign_in_with_password({
                "email": request.email,
                "password": request.password
            })
        )

        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password."
            )

        user_id = auth_response.user.id
        access_token = (
            auth_response.session.access_token
        )

        # Get farmer profile from users table
        full_name = ""
        try:
            profile_result = (
                supabase
                .table(Tables.USERS)
                .select("full_name")
                .eq("id", user_id)
                .single()
                .execute()
            )

            if profile_result.data:
                fetched_name = profile_result.data.get(
                    "full_name", ""
                )
                # Use full_name if available
                # Otherwise fall back to email username
                full_name = (
                    fetched_name
                    if fetched_name
                    else request.email.split("@")[0]
                )
                logger.info(
                    f"Profile fetched: "
                    f"full_name='{full_name}'"
                )
            else:
                # No profile found use email username
                full_name = request.email.split("@")[0]
                logger.warning(
                    f"No profile found for user: "
                    f"{user_id}"
                )

        except Exception as e:
            # Profile fetch failed use email username
            logger.error(
                f"Profile fetch error: {e}"
            )
            full_name = request.email.split("@")[0]

        logger.info(
            f"Farmer logged in: {request.email} "
            f"name='{full_name}'"
        )

        return AuthResponse(
            access_token=access_token,
            user_id=user_id,
            email=request.email,
            full_name=full_name
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )


# ── Logout Route ───────────────────────────────────────────

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout farmer"
)
async def logout():
    """
    Logout the current farmer session.

    Invalidates the current Supabase session.
    The frontend should also clear the stored token.

    Returns:
        MessageResponse: Success confirmation
    """
    supabase = get_supabase()

    try:
        supabase.auth.sign_out()
        logger.info("Farmer logged out")
        return MessageResponse(
            message="Logged out successfully"
        )

    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed."
        )


# ── Get Current User Route ─────────────────────────────────

@router.get(
    "/me",
    summary="Get current farmer profile"
)
async def get_me():
    """
    Get the current authenticated farmer's profile.

    Returns the farmer's profile data from Supabase.

    Returns:
        dict: Farmer profile with id, email, full_name
    """
    supabase = get_supabase()

    try:
        user = supabase.auth.get_user()

        if not user or not user.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated"
            )

        user_id = user.user.id

        profile = (
            supabase
            .table(Tables.USERS)
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        return profile.data

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Get profile failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get profile."
        )


# ── Password Reset Route ───────────────────────────────────

@router.post(
    "/reset",
    response_model=MessageResponse,
    summary="Request password reset email"
)
async def reset_password(email: str):
    """
    Send a password reset email to the farmer.

    Args:
        email: Farmer's registered email address

    Returns:
        MessageResponse: Confirmation message
    """
    supabase = get_supabase()

    try:
        supabase.auth.reset_password_email(email)
        logger.info(
            f"Password reset email sent to: {email}"
        )
        return MessageResponse(
            message=(
                "Password reset email sent. "
                "Please check your inbox."
            )
        )

    except Exception as e:
        logger.error(f"Password reset failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email."
        )
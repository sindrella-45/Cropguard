"""
Authentication package for CropGuard AI.

Handles farmer authentication using Supabase Auth.

Implements Optional Task Medium #5:
    'Add user authentication and personalisation'

Why Supabase Auth?
    Supabase provides a complete authentication
    system out of the box including:
    - Email and password signup/login
    - JWT token generation and validation
    - Password reset via email
    - Session management
    
    This saves building auth from scratch and
    integrates directly with our Supabase database
    where farmer data is stored.

Flow:
    1. Farmer signs up with email and password
    2. Supabase creates user and returns JWT token
    3. Frontend stores token in localStorage
    4. Every API request includes token in header
    5. Middleware validates token before processing

Usage:
    from auth import router as auth_router
    from auth.middleware import get_current_user
"""

from .routes import router
from .middleware import get_current_user
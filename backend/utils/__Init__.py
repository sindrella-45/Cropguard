"""
Utilities package for CropGuard AI.

Provides helper functions used across
the entire backend application.

Utilities:
    image    — image validation and processing
    logger   — structured logging setup
    costs    — token cost calculation
    retry    — API call retry logic

Usage:
    from utils.image import validate_image
    from utils.logger import log_request
    from utils.costs import calculate_cost
    from utils.retry import with_retry
"""

from .image import validate_image
from .logger import log_request, setup_logging
from .costs import calculate_cost
from .retry import with_retry
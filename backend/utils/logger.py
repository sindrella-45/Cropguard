"""
Logging setup for CropGuard AI.

Configures structured logging across the entire
backend application with consistent formatting.

Why structured logging?
    Consistent log format makes it easy to:
    - Debug issues during development
    - Monitor the app in production
    - Track which endpoints are being called
    - Identify slow API calls
    - See token usage patterns

Log levels used:
    DEBUG   — detailed info for development
    INFO    — normal operation events
    WARNING — non-fatal issues to watch
    ERROR   — failures that need attention

Usage:
    from utils.logger import setup_logging, log_request
    
    # In app.py — call once at startup
    setup_logging()
    
    # In route handlers
    log_request(
        endpoint="/analyze",
        user_id="user123",
        model="gpt-4o"
    )
"""

import logging
import sys
from datetime import datetime


def setup_logging(log_level: str = "INFO") -> None:
    """
    Configure application-wide logging format.
    
    Sets up a consistent log format across all
    modules with timestamps, log level and
    module name for easy debugging.
    
    Should be called once when the FastAPI
    application starts up in app.py.
    
    Args:
        log_level: Minimum log level to capture.
                   Options: DEBUG, INFO, WARNING, ERROR
                   Defaults to INFO.
                   
    Example:
        from utils.logger import setup_logging
        setup_logging(log_level="DEBUG")
    """
    log_format = (
        "%(asctime)s | "
        "%(levelname)-8s | "
        "%(name)s | "
        "%(message)s"
    )

    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format=log_format,
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=[
            # Console output
            logging.StreamHandler(sys.stdout)
        ]
    )

    # Reduce noise from third party libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger(
        "chromadb"
    ).setLevel(logging.WARNING)
    logging.getLogger(
        "openai"
    ).setLevel(logging.WARNING)

    logger = logging.getLogger(__name__)
    logger.info(
        f"Logging configured: level={log_level}"
    )


def log_request(
    endpoint: str,
    user_id: str = None,
    model: str = None,
    extra: dict = None
) -> None:
    """
    Log an incoming API request with context.
    
    Creates a structured log entry for each
    API request showing who called what and
    with which settings.
    
    Args:
        endpoint: The API endpoint called
        user_id: Authenticated farmer's ID if any
        model: LLM model requested if any
        extra: Additional key-value pairs to log
        
    Example:
        log_request(
            endpoint="/analyze",
            user_id="user123",
            model="gpt-4o"
        )
        # Logs: "Request: /analyze | user=user123 | model=gpt-4o"
    """
    logger = logging.getLogger("requests")

    parts = [f"Request: {endpoint}"]

    if user_id:
        parts.append(f"user={user_id[:8]}...")
    else:
        parts.append("user=anonymous")

    if model:
        parts.append(f"model={model}")

    if extra:
        for key, value in extra.items():
            parts.append(f"{key}={value}")

    parts.append(
        f"time={datetime.utcnow().strftime('%H:%M:%S')}"
    )

    logger.info(" | ".join(parts))
"""
Routes package for CropGuard AI.

Contains all FastAPI route handlers that the
Next.js frontend communicates with.

Routes overview:
    /analyze    — main disease detection endpoint
    /history    — farmer diagnosis history
    /feedback   — farmer ratings and comments
    /tokens     — token usage and cost tracking

Why separate route files?
    Each file handles one concern keeping the
    codebase organised and easy to navigate.
    New endpoints can be added to the correct
    file without touching others.

Usage:
    # In app.py
    from routes import analyze, history, feedback, tokens
    
    app.include_router(analyze.router)
    app.include_router(history.router)
    app.include_router(feedback.router)
    app.include_router(tokens.router)
"""

from . import analyze, history, feedback, tokens
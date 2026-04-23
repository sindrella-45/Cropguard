"""
Prompts package for CropGuard AI.

All agent prompts are stored as Jinja2 templates
in the templates/ directory. This keeps prompts
completely separate from application logic,
making them easy to update without touching code.

Usage:
    from prompts import render_prompt
    
    prompt = render_prompt(
        "agent/system.j2",
        personality="friendly"
    )
"""

from .loader import render_prompt

"""
Jinja2 template loader for CropGuard AI prompts.

This module loads and renders all prompt templates
used by the LangGraph agent. Templates are stored
in the templates/ directory and rendered with
dynamic variables at runtime.

Why Jinja2?
- Keeps prompts separate from code
- Supports variables, conditionals and loops
- Easy to update prompts without changing logic
- Professional pattern used in production AI apps

Usage:
    from prompts.loader import render_prompt
    
    prompt = render_prompt(
        "agent/vision_analysis.j2",
        plant_type="tomato",
        personality="friendly",
        weather_data={"temperature": 28}
    )
"""

from jinja2 import (
    Environment,
    FileSystemLoader,
    TemplateNotFound,
    select_autoescape
)
import os
import logging

logger = logging.getLogger(__name__)

# ── Template Environment Setup ─────────────────────────────

# Build path to the templates directory
TEMPLATES_DIR = os.path.join(
    os.path.dirname(__file__),
    "templates"
)

# Create Jinja2 environment
env = Environment(
    loader=FileSystemLoader(TEMPLATES_DIR),
    autoescape=select_autoescape(
        disabled_extensions=("j2",),
        default_for_string=False
    ),
    trim_blocks=True,      # removes newline after block tags
    lstrip_blocks=True,    # removes leading whitespace from blocks
)


# ── Main Render Function ───────────────────────────────────

def render_prompt(template_path: str, **kwargs) -> str:
    """
    Load and render a Jinja2 prompt template.
    
    Looks for the template file inside the
    backend/prompts/templates/ directory.
    
    Args:
        template_path: Relative path to the template
                       e.g. "agent/system.j2"
        **kwargs: Variables to inject into the template
        
    Returns:
        str: The rendered prompt string ready to send
             to the LLM.
             
    Raises:
        TemplateNotFound: If the template file does
                          not exist.
                          
    Example:
        prompt = render_prompt(
            "agent/treatment.j2",
            diagnosis=diagnosis_object,
            personality="formal",
            weather_data=weather_dict
        )
    """
    try:
        template = env.get_template(template_path)
        rendered = template.render(**kwargs)
        logger.debug(f"Rendered template: {template_path}")
        return rendered

    except TemplateNotFound:
        logger.error(f"Template not found: {template_path}")
        raise TemplateNotFound(
            f"Prompt template '{template_path}' not found. "
            f"Check that it exists in {TEMPLATES_DIR}"
        )

    except Exception as e:
        logger.error(
            f"Error rendering template {template_path}: {e}"
        )
        raise
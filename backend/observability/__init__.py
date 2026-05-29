"""
Observability package for CropGuard AI.

Sets up LangSmith for monitoring and tracing
the LangGraph agent workflow in production.

Implements Hard Optional Task #2:
    'Add one of these LLM observability tools:
    Arize Phoenix, LangSmith, Lunary, or others'

Why LangSmith?
    LangSmith is built by the same team as
    LangChain and LangGraph. It integrates
    automatically with zero extra code once
    the environment variables are set.

    It provides:
    - Full trace of every agent run
    - Token usage per node
    - Latency per node
    - Input and output of every LLM call
    - Error tracking and debugging
    - Side by side comparison of runs

What gets traced automatically:
    - Every LangGraph node execution
    - Every LLM API call
    - Every ChromaDB retrieval
    - Token counts and costs
    - Full input/output at each step

Usage:
    from observability import setup_langsmith
    
    # Call once in app.py at startup
    setup_langsmith()
"""

from .langsmith import setup_langsmith
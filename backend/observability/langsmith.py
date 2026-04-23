"""
LangSmith observability setup for CropGuard AI.

Configures LangSmith tracing for the LangGraph
agent so every diagnosis run is fully observable.

How LangSmith works:
    Once environment variables are set LangChain
    and LangGraph automatically send trace data
    to LangSmith for every run. No code changes
    are needed in the agent itself.

    Every agent run creates a trace showing:
    ┌─────────────────────────────────────────┐
    │ Run: analyze_leaf                       │
    │ Duration: 8.2s | Tokens: 1240           │
    │                                         │
    │ ├── validate_input      0.01s           │
    │ ├── load_memory         0.12s           │
    │ ├── fetch_weather       0.45s           │
    │ ├── analyze_image       3.21s  450 tok  │
    │ ├── lookup_disease      0.89s           │
    │ ├── detect_disease      2.14s  380 tok  │
    │ ├── treatment_path      1.92s  410 tok  │
    │ ├── format_response     0.01s           │
    │ └── save_memory         0.18s           │
    └─────────────────────────────────────────┘

Setup steps:
    1. Go to smith.langchain.com
    2. Create a free account
    3. Create a new project called "cropguard-ai"
    4. Copy your API key
    5. Add to .env: LANGSMITH_API_KEY=your_key

Usage:
    from observability import setup_langsmith
    
    setup_langsmith()  # Call once in app.py
"""

import os
import logging

logger = logging.getLogger(__name__)


def setup_langsmith() -> bool:
    """
    Configure LangSmith tracing for the agent.
    
    Sets the required environment variables that
    LangChain and LangGraph use to automatically
    send trace data to LangSmith.
    
    Must be called before the FastAPI app starts
    accepting requests. Called in app.py startup.
    
    Returns:
        bool: True if LangSmith configured successfully,
              False if API key not found in .env
              (tracing disabled but app still works)
              
    Example:
        from observability import setup_langsmith
        
        enabled = setup_langsmith()
        if enabled:
            print("LangSmith tracing active")
        else:
            print("LangSmith disabled — no API key")
    """
    langsmith_key = os.getenv("LANGSMITH_API_KEY")
    langsmith_project = os.getenv(
        "LANGSMITH_PROJECT",
        "cropguard-ai"
    )

    # If no API key skip silently
    # App works perfectly without LangSmith
    if not langsmith_key:
        logger.info(
            "LangSmith API key not found. "
            "Tracing disabled. "
            "Add LANGSMITH_API_KEY to .env to enable."
        )
        return False

    # Set LangChain environment variables
    # These are picked up automatically by
    # LangChain, LangGraph and the OpenAI wrapper
    os.environ["LANGCHAIN_TRACING_V2"] = "true"
    os.environ["LANGCHAIN_API_KEY"] = langsmith_key
    os.environ["LANGCHAIN_PROJECT"] = langsmith_project
    os.environ["LANGCHAIN_ENDPOINT"] = (
        "https://api.smith.langchain.com"
    )

    logger.info(
        f"LangSmith tracing enabled: "
        f"project='{langsmith_project}'"
    )
    logger.info(
        "View traces at: "
        "https://smith.langchain.com"
    )

    return True


def get_run_url(run_id: str) -> str:
    """
    Generate a direct URL to a specific LangSmith
    trace run for debugging purposes.
    
    Args:
        run_id: The LangSmith run ID from a trace
        
    Returns:
        str: Direct URL to the trace in LangSmith UI
        
    Example:
        url = get_run_url("abc-123-def")
        print(url)
        # "https://smith.langchain.com/runs/abc-123-def"
    """
    project = os.getenv(
        "LANGSMITH_PROJECT",
        "cropguard-ai"
    )
    return (
        f"https://smith.langchain.com/"
        f"projects/{project}/runs/{run_id}"
    )


def log_custom_metric(
    run_id: str,
    metric_name: str,
    value: float
) -> None:
    """
    Log a custom metric to LangSmith for a run.
    
    Used to track custom performance metrics
    beyond what LangSmith captures automatically
    such as RAG retrieval quality scores.
    
    Args:
        run_id: The LangSmith run ID
        metric_name: Name of the metric to log
        value: Numeric value of the metric
        
    Example:
        log_custom_metric(
            run_id="abc123",
            metric_name="rag_confidence",
            value=0.87
        )
    """
    try:
        from langsmith import Client

        client = Client()
        client.update_run(
            run_id,
            extra={
                "metrics": {
                    metric_name: value
                }
            }
        )
        logger.debug(
            f"Custom metric logged: "
            f"{metric_name}={value}"
        )

    except ImportError:
        logger.debug(
            "langsmith package not available "
            "for custom metrics"
        )

    except Exception as e:
        logger.debug(
            f"Failed to log custom metric: {e}"
        )

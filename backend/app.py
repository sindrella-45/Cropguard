# backend/app.py
"""
FastAPI application entry point for CropGuard AI.

How to run:
    cd backend
    uvicorn app:app --reload --port 8000
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ── Rate limiting imports ──────────────────────────────────────────────────────
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
# ──────────────────────────────────────────────────────────────────────────────

from config import get_settings
from utils.logger import setup_logging
from observability import setup_langsmith
from auth.routes import router as auth_router
from routes.analyze import router as analyze_router
from routes.history import router as history_router
from routes.feedback import router as feedback_router
from routes.tokens import router as tokens_router
from routes.followup import router as followup_router
from auth.middleware import get_optional_user
from plugins.manager import PluginManager
from llm.factory import get_available_models
from models.requests import HealthCheck

setup_logging(log_level="INFO")
logger = logging.getLogger(__name__)

# ── Create limiter ─────────────────────────────────────────────────────────────
# One global limiter instance shared across the app.
# The key_func determines what to rate-limit by — here it's the client IP.
limiter = Limiter(key_func=get_remote_address)
# ──────────────────────────────────────────────────────────────────────────────


# ── Lifespan ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "\n"
        "╔══════════════════════════════════════╗\n"
        "║     CropGuard AI — Starting          ║\n"
        "╚══════════════════════════════════════╝"
    )

    settings = get_settings()

    langsmith_enabled = setup_langsmith()
    logger.info(f"LangSmith: {'enabled' if langsmith_enabled else 'disabled'}")

    available_models = get_available_models()
    model_names = [m["name"] for m in available_models]
    logger.info(f"Available models: {', '.join(model_names)}")

    logger.info(
        f"Environment: {settings.app_env}\n"
        f"Version: {settings.app_version}\n"
        f"RAG top_k: {settings.rag_top_k}\n"
        f"RAG threshold: {settings.rag_similarity_threshold}"
    )
    logger.info("CropGuard AI started successfully\nAPI docs: http://localhost:8000/docs")

    yield

    logger.info("CropGuard AI shutting down gracefully")


# ── FastAPI app ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CropGuard AI",
    description=(
        "AI-powered crop disease detection assistant. "
        "Upload a leaf photo and get instant diagnosis, "
        "treatment recommendations and prevention tips."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ── Attach limiter to app ──────────────────────────────────────────────────────
# This is REQUIRED — slowapi reads the limiter from app.state
app.state.limiter = limiter

# Register the 429 error handler so FastAPI returns a clean JSON response
# instead of crashing when the rate limit is hit
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
# ──────────────────────────────────────────────────────────────────────────────


# ── CORS ───────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://cropguard.ai",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ── Routers ────────────────────────────────────────────────────────────────────

app.include_router(auth_router,     prefix="/auth",   tags=["Authentication"])
app.include_router(analyze_router,                    tags=["Analysis"])
app.include_router(history_router,                    tags=["History"])
app.include_router(feedback_router,                   tags=["Feedback"])
app.include_router(tokens_router,                     tags=["Tokens"])
app.include_router(followup_router,                   tags=["Follow-up"])
app.include_router(followup_router,  tags=["Analysis"])



# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthCheck, tags=["Health"])
async def health_check():
    settings = get_settings()
    return HealthCheck(
        status="ok",
        version=settings.app_version,
        environment=settings.app_env
    )


# ── Plugin endpoints ───────────────────────────────────────────────────────────

@app.get("/plugins", tags=["Plugins"])
async def get_plugins(current_user: dict = Depends(get_optional_user)):
    user_id = current_user["id"] if current_user else None
    manager = PluginManager(user_id=user_id)
    plugins = manager.get_all_plugins()
    return {"plugins": plugins}


@app.post("/plugins/{plugin_id}/toggle", tags=["Plugins"])
async def toggle_plugin(
    plugin_id: str,
    current_user: dict = Depends(get_optional_user)
):
    user_id = current_user["id"] if current_user else None
    manager = PluginManager(user_id=user_id)
    new_state = manager.toggle(plugin_id)
    return {
        "plugin_id": plugin_id,
        "enabled": new_state,
        "message": f"Plugin {'enabled' if new_state else 'disabled'}"
    }


# ── Global exception handler ───────────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An unexpected error occurred. Please try again.",
            "type": type(exc).__name__
        }
    )
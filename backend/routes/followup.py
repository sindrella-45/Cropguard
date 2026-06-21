# backend/routes/followup.py
"""
Follow-up question endpoint for CropGuard AI.
Accepts diagnosis_context from frontend so it works
even when Redis is unavailable (e.g. on Render free tier).
"""

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from openai import AsyncOpenAI

from config import get_settings
from memory.short_term import ShortTermMemory

logger = logging.getLogger(__name__)
router = APIRouter()


class FollowUpRequest(BaseModel):
    session_id:        str
    question:          str
    personality:       Optional[str]            = "friendly"
    selected_model:    Optional[str]            = "gpt-4o"
    language:          Optional[str]            = "English"
    diagnosis_context: Optional[Dict[str, Any]] = None  # ← sent from frontend


class FollowUpResponse(BaseModel):
    answer:      str
    session_id:  str
    has_context: bool


@router.post(
    "/followup",
    response_model=FollowUpResponse,
    tags=["Analysis"]
)
async def ask_followup(request: FollowUpRequest):
    settings = get_settings()

    if not request.session_id or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="session_id and question are required.",
        )

    memory = ShortTermMemory(session_id=request.session_id)
    memory.extend_session()

    # Try Redis first, then fall back to request payload
    diagnosis = memory.get_diagnosis()
    if not diagnosis and request.diagnosis_context:
        diagnosis = request.diagnosis_context
        logger.info("Using diagnosis_context from request payload (Redis unavailable)")

    history = memory.get_history()
    memory.save_message(role="user", content=request.question)

    # Language instruction
    lang_instructions = {
        "English":    "Respond in clear, simple English.",
        "Swahili":    "Jibu YOTE kwa Kiswahili rahisi.",
        "French":     "Répondez ENTIÈREMENT en français simple.",
        "Luganda":    "Ddamu BYONNA mu Luganda enyangu.",
        "Runyankole": "Hangira BYONA omu Runyankole.",
    }
    lang_note = lang_instructions.get(request.language or "English", lang_instructions["English"])

    if diagnosis:
        plant         = diagnosis.get("plant_identified", "Unknown plant")
        diag_detail   = diagnosis.get("diagnosis", {})
        if isinstance(diag_detail, dict):
            disease_name  = diag_detail.get("name", "Unknown disease")
            severity      = diag_detail.get("severity", "unknown")
            description   = diag_detail.get("description", "")
        else:
            disease_name  = str(diag_detail)
            severity      = "unknown"
            description   = ""

        causes        = diagnosis.get("causes", [])
        symptoms      = diagnosis.get("symptoms", [])
        urgency       = diagnosis.get("urgency", "unknown")
        farmer_advice = diagnosis.get("farmer_advice", "")

        # Build treatment list
        treatments_raw = diagnosis.get("treatments", [])
        treatment_list = ""
        if treatments_raw:
            lines = []
            for t in treatments_raw:
                if isinstance(t, dict):
                    action  = t.get("action", "")
                    details = t.get("details", "")
                    lines.append(f"- {action}: {details}")
                else:
                    lines.append(f"- {t}")
            treatment_list = "\n".join(lines)

        system_prompt = f"""You are CropGuard AI, an expert plant pathologist specialising in African crop diseases.

LANGUAGE: {lang_note}

The farmer has just received this specific diagnosis:

PLANT:    {plant}
DISEASE:  {disease_name}
SEVERITY: {severity}
URGENCY:  {urgency}

DESCRIPTION:
{description}

CAUSES:
{chr(10).join(f'- {c}' for c in causes) if causes else 'Not specified'}

SYMPTOMS:
{chr(10).join(f'- {s}' for s in symptoms) if symptoms else 'Not specified'}

RECOMMENDED TREATMENTS:
{treatment_list if treatment_list else "See diagnosis details."}

FARMER ADVICE: {farmer_advice}

STRICT RULES:
1. Answer ONLY about this specific diagnosis — {disease_name} on {plant}.
2. Do NOT give generic agricultural advice unrelated to this disease.
3. Keep your answer to 3-5 sentences maximum.
4. Be direct and practical — the farmer needs to act today.
5. Never say "consult a specialist" as the first response — give expert advice first."""

        has_context = True

    else:
        system_prompt = f"""You are CropGuard AI, an expert plant pathologist.
LANGUAGE: {lang_note}
The farmer's diagnosis session has expired or is unavailable.
Tell them clearly that their session expired and ask them to upload a new photo for a fresh diagnosis.
Keep it to 2 sentences."""
        has_context = False
        logger.warning(f"Follow-up: no session context for {request.session_id}")

    # Build messages
    messages = [{"role": "system", "content": system_prompt}]
    for msg in (history or [])[-6:]:
        if msg.get("role") and msg.get("content"):
            messages.append({"role": msg["role"], "content": msg["content"]})

    if not history or history[-1].get("content") != request.question:
        messages.append({"role": "user", "content": request.question})

    try:
        model  = request.selected_model or "gpt-4o"
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=300,
            temperature=0.3,
        )
        answer = response.choices[0].message.content
        memory.save_message(role="assistant", content=answer)

        logger.info(f"Follow-up answered — has_context={has_context} session={request.session_id}")

        return FollowUpResponse(
            answer=answer,
            session_id=request.session_id,
            has_context=has_context,
        )

    except Exception as e:
        logger.error(f"Follow-up GPT call failed: {e}")
        return FollowUpResponse(
            answer="I'm having trouble right now. Please try again in a moment.",
            session_id=request.session_id,
            has_context=False,
        )
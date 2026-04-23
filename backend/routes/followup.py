"""
Follow-up question endpoint for CropGuard AI.

The bot should answer SPECIFICALLY about the current diagnosis —
not give generic agricultural advice. This version enforces that.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from openai import AsyncOpenAI

from config import get_settings
from memory.short_term import ShortTermMemory

logger = logging.getLogger(__name__)
router = APIRouter()


class FollowUpRequest(BaseModel):
    session_id:  str
    question:    str
    personality: Optional[str] = "friendly"


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

    diagnosis = memory.get_diagnosis()
    history   = memory.get_history()

    memory.save_message(role="user", content=request.question)

    if diagnosis:
        plant         = diagnosis.get("plant_identified", "Unknown plant")
        diag_detail   = diagnosis.get("diagnosis", {})
        disease_name  = diag_detail.get("name", "Unknown disease")
        severity      = diag_detail.get("severity", "unknown")
        description   = diag_detail.get("description", "")
        causes        = diagnosis.get("causes", [])
        symptoms      = diagnosis.get("symptoms", [])
        urgency       = diagnosis.get("urgency", "unknown")
        farmer_advice = diagnosis.get("farmer_advice", "")

        # Pull treatments from the diagnosis dict
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

The farmer has just received this specific diagnosis:

PLANT:    {plant}
DISEASE:  {disease_name}
SEVERITY: {severity}
URGENCY:  {urgency}

DESCRIPTION:
{description}

CAUSES:
{chr(10).join(f'- {c}' for c in causes)}

SYMPTOMS:
{chr(10).join(f'- {s}' for s in symptoms)}

RECOMMENDED TREATMENTS:
{treatment_list if treatment_list else "See diagnosis details."}

FARMER ADVICE: {farmer_advice}

STRICT RULES:
1. Answer ONLY about this specific diagnosis — {disease_name} on {plant}.
2. Do NOT give generic agricultural advice unrelated to this disease.
3. If the question is about fertilizer: explain whether fertilizer helps or hurts
   THIS specific disease (bacterial/fungal diseases often worsen with excess nitrogen).
4. Keep your answer to 3-5 sentences maximum.
5. Be direct and practical — the farmer needs to act on your answer today.
6. Never say "consult a specialist" as the first response — give your expert answer first."""

        has_context = True

    else:
        # Redis down or session expired — still try to be helpful
        system_prompt = """You are CropGuard AI, an expert plant pathologist.
The farmer's diagnosis session has expired. Their diagnosis context is unavailable.
Tell them clearly that their session expired and ask them to upload a new photo
to get a fresh diagnosis. Keep it to 2 sentences."""
        has_context = False
        logger.warning(f"Follow-up: no session context for {request.session_id}")

    # Build message history (last 6 turns for context)
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history[-6:]:
        messages.append({"role": msg.get("role"), "content": msg.get("content")})

    if not history or history[-1].get("content") != request.question:
        messages.append({"role": "user", "content": request.question})

    try:
        client   = AsyncOpenAI(api_key=settings.openai_api_key)
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=300,
            temperature=0.3,   # lower = more focused, less hallucination
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
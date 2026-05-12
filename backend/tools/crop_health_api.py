# backend/tools/crop_health_api.py
"""
Kindwise Crop.health API integration.

Used as a SECOND OPINION alongside the internal vision model.

Website:
https://www.kindwise.com/crop-health

Environment variable required:
CROP_HEALTH_API_KEY=your_api_key
"""

import httpx
import logging
import os

logger = logging.getLogger(__name__)

CROP_HEALTH_URL = "https://crop.kindwise.com/api/v1/identification"
CROP_HEALTH_KEY = os.getenv("CROP_HEALTH_API_KEY")


async def identify_with_crop_health(
    image_base64: str,
    image_type: str = "image/jpeg"
) -> dict | None:
    """
    Send an image to the Crop.health API and return disease prediction.

    Returns:
        {
            "disease": str,
            "confidence": float,
            "raw": full_api_response
        }

    Returns None if API fails.
    """

    if not CROP_HEALTH_KEY:
        logger.warning("CROP_HEALTH_API_KEY not set — skipping Crop.health call")
        return None

    if not image_base64:
        logger.warning("No image provided to Crop.health API")
        return None

    payload = {
        "images": [f"data:{image_type};base64,{image_base64}"],
        "similar_images": True,
        "health": "all"
    }

    headers = {
        "Api-Key": CROP_HEALTH_KEY,
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                CROP_HEALTH_URL,
                headers=headers,
                json=payload
            )

        if resp.status_code not in (200, 201):
            logger.warning(
                f"Crop.health returned status {resp.status_code}: {resp.text[:200]}"
            )
            return None

        data = resp.json()

        try:
            suggestions = data["result"]["disease"]["suggestions"]

            if not suggestions:
                return None

            best = suggestions[0]

            return {
                "disease": best.get("name"),
                "confidence": best.get("probability"),
                "raw": data
            }

        except Exception as parse_error:
            logger.warning(f"Crop.health response parsing failed: {parse_error}")
            return None

    except httpx.TimeoutException:
        logger.warning("Crop.health API request timed out")
    except Exception as e:
        logger.warning(f"Crop.health API failed (non-fatal): {e}")

    return None
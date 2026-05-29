# backend/tools/vision.py
"""
Vision tool for CropGuard AI — registered as a proper LangChain tool.



COMMERCIAL CROPS ONLY: This tool now enforces that analysis is restricted
to commercial crops relevant to Uganda and East Africa. Non-commercial
plants (ornamentals, houseplants, wild plants) are rejected.
"""

import logging
from typing import Optional
from langchain_core.tools import tool
from openai import AsyncOpenAI
from config import get_settings
from prompts import render_prompt
from utils.retry import with_retry

logger = logging.getLogger(__name__)

# Commercial crops supported by CropGuard AI
# Focused on Uganda and East Africa
SUPPORTED_COMMERCIAL_CROPS = [
    "maize", "corn",
    "tomato",
    "potato",
    "cassava",
    "banana", "matoke", "plantain",
    "coffee",
    "tea",
    "sugarcane",
    "rice",
    "sorghum",
    "beans", "common bean",
    "groundnuts", "peanuts",
    "sunflower",
    "cotton",
    "tobacco",
    "sweet potato",
    "soybean", "soybeans",
    "wheat",
    "onion",
    "cabbage",
    "kale", "sukuma wiki",
    "pepper", "capsicum",
    "eggplant", "aubergine",
    "watermelon",
    "mango",
    "avocado",
    "passion fruit",
]


@tool
async def analyze_commercial_crop_image(
    image_data: str,
    image_type: str = "image/jpeg",
    plant_type: Optional[str] = None,
    personality: str = "friendly",
    weather_data: Optional[dict] = None,
) -> str:
    """
    Analyze a commercial crop leaf image using GPT-4o vision.

    This tool examines a leaf photo from a commercial crop and
    describes visual disease symptoms in detail. It ONLY analyzes
    commercial crops grown for food or cash income — ornamental
    plants, houseplants and wild plants are not supported.

    Supported crops include: maize, tomato, potato, cassava, banana,
    coffee, tea, sugarcane, rice, sorghum, beans, groundnuts,
    sunflower, cotton, tobacco, sweet potato, soybeans, and other
    commercial food and cash crops common in Uganda and East Africa.

    Args:
        image_data: Base64 encoded leaf image string
        image_type: MIME type e.g. 'image/jpeg' or 'image/png'
        plant_type: Optional crop hint from farmer e.g. 'tomato'
        personality: Communication style — friendly/formal/concise
        weather_data: Optional dict with temperature and humidity

    Returns:
        str: Detailed visual description of the commercial crop leaf,
             noting all visible symptoms, lesions, discolorations,
             and abnormalities. Returns a rejection message if the
             plant is not a supported commercial crop.

    Example:
        description = await analyze_commercial_crop_image.ainvoke({
            "image_data": base64_string,
            "plant_type": "tomato",
            "personality": "friendly"
        })
    """
    settings = get_settings()
    client = AsyncOpenAI(api_key=settings.openai_api_key)

    # Render the commercial-crops vision prompt
    prompt = render_prompt(
        "agent/vision_analysis.j2",
        plant_type=plant_type,
        weather_data=weather_data,
        personality=personality,
        supported_crops=SUPPORTED_COMMERCIAL_CROPS,
    )

    logger.info(
        f"Analyzing commercial crop image: "
        f"plant={plant_type or 'unknown'}"
    )

    @with_retry(max_attempts=3)
    async def _call_vision_api():
        response = await client.chat.completions.create(
            model="gpt-4o",
            max_tokens=500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": (
                                    f"data:{image_type};"
                                    f"base64,{image_data}"
                                ),
                                "detail": "high"
                            }
                        }
                    ]
                }
            ]
        )
        return response.choices[0].message.content

    visual_description = await _call_vision_api()

    logger.info("Commercial crop image analysis completed")
    return visual_description


# ── Backwards-compatible alias ─────────────────────────────────
# Nodes that still import analyze_image directly will keep working
async def analyze_image(
    image_data: str,
    image_type: str = "image/jpeg",
    plant_type: Optional[str] = None,
    personality: str = "friendly",
    weather_data: Optional[dict] = None,
) -> str:
    """
    Backwards-compatible wrapper around analyze_commercial_crop_image.
    Used by agent/nodes.py which calls this function directly.
    """
    return await analyze_commercial_crop_image.ainvoke({
        "image_data": image_data,
        "image_type": image_type,
        "plant_type": plant_type,
        "personality": personality,
        "weather_data": weather_data,
    })
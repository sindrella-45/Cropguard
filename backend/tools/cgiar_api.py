# backend/tools/cgiar_api.py
"""
CGIAR Open Data Portal — free agricultural research data.
Covers maize, cassava, bean diseases in East Africa.

No API key required.

Portal:
https://data.cgiar.org/
"""

import httpx
import logging

logger = logging.getLogger(__name__)

CGIAR_BASE = "https://data.cgiar.org/api/search"
CGIAR_SITE = "https://data.cgiar.org"


async def search_cgiar(crop: str, disease: str) -> list[dict]:
    """
    Search CGIAR open data for crop disease research.
    Returns list of relevant research resources.
    """

    if not crop or not disease:
        return []

    try:
        async with httpx.AsyncClient(timeout=10) as client:

            resp = await client.get(
                CGIAR_BASE,
                params={
                    "q": f"{crop} {disease} Uganda East Africa management",
                    "type": "dataset",
                    "rows": 5,
                }
            )

        if resp.status_code != 200:
            logger.warning(f"CGIAR search failed: {resp.status_code}")
            return []

        data = resp.json()
        items = data.get("data", {}).get("items", [])

        resources = []

        for item in items:

            title = item.get("title", "")
            url = item.get("url", "")

            if not url:
                continue

            # Fix relative URLs
            if url.startswith("/"):
                url = CGIAR_SITE + url

            resources.append(
                {
                    "title": title,
                    "url": url,
                    "source": "CGIAR Open Data",
                    "type": "research",
                }
            )

        logger.info(f"CGIAR returned {len(resources)} results")

        return resources

    except httpx.TimeoutException:
        logger.warning("CGIAR API timeout")

    except Exception as e:
        logger.warning(f"CGIAR API failed (non-fatal): {e}")

    return []
# backend/tools/eppo_api.py
"""
EPPO Global Database integration.

Provides authoritative plant pest and disease information from
the European and Mediterranean Plant Protection Organization.

Website:
https://gd.eppo.int/

Used to enrich AI diagnoses with:
- scientific names
- host plants
- official EPPO fact sheets
- distribution data
"""

import httpx
import logging

logger = logging.getLogger(__name__)

EPPO_SEARCH_URL = "https://gd.eppo.int/api/rest/1.0/search"


async def get_disease_info(disease_name: str) -> list[dict]:
    """
    Search EPPO Global Database for a plant disease.

    Returns a list of resource dictionaries to attach to the response.

    Example output:
    [
        {
            "title": "Tomato mosaic virus",
            "url": "https://gd.eppo.int/taxon/TMV000",
            "source": "EPPO Global Database",
            "type": "factsheet"
        }
    ]
    """

    if not disease_name:
        return []

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                EPPO_SEARCH_URL,
                params={
                    "q": disease_name,
                    "type": "pest",
                    "limit": 5
                }
            )

        if resp.status_code != 200:
            logger.warning(
                f"EPPO search failed: {resp.status_code}"
            )
            return []

        data = resp.json()

        results = data.get("results", [])

        resources = []

        for item in results:

            code = item.get("code")
            name = item.get("preferred_name")

            if not code or not name:
                continue

            resources.append(
                {
                    "title": name,
                    "url": f"https://gd.eppo.int/taxon/{code}",
                    "source": "EPPO Global Database",
                    "type": "factsheet"
                }
            )

        logger.info(f"EPPO returned {len(resources)} results for {disease_name}")

        return resources

    except httpx.TimeoutException:
        logger.warning("EPPO API request timed out")
    except Exception as e:
        logger.warning(f"EPPO API failed (non-fatal): {e}")

    return []
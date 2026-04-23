"""
Long-term memory for CropGuard AI using Supabase.

Permanently stores all diagnosis history so farmers
can track their crop health over time across
multiple sessions and visits to the app.

What it stores:
    - All past diagnoses with full details
    - Timestamps for tracking disease progression
    - Links to feedback given by the farmer

Why Supabase for long-term memory?
    - PostgreSQL database is permanent and reliable
    - Data survives server restarts and deployments
    - Easy to query history with filters and sorting
    - Already used for auth and storage — no extra setup

Example flow:
    1. Farmer gets diagnosis → saved to Supabase
    2. Farmer comes back 2 weeks later
    3. Agent loads past diagnoses from Supabase
    4. Agent notices same disease recurring
    5. Agent gives personalised advice based on history

Usage:
    from memory import LongTermMemory
    
    memory = LongTermMemory(user_id="user456")
    memory.save_diagnosis(diagnosis_data)
    history = memory.get_recent_diagnoses(limit=5)
    summary = memory.get_history_summary()
"""

import logging
from typing import Optional
from datetime import datetime
from database import get_supabase
from database.supabase_client import Tables

logger = logging.getLogger(__name__)


class LongTermMemory:
    """
    Manages permanent diagnosis history using Supabase.
    
    All diagnosis data is stored permanently in the
    Supabase diagnoses table and can be retrieved
    at any future session.
    
    Attributes:
        user_id: The farmer's unique identifier
        supabase: Supabase client instance
        
    Example:
        memory = LongTermMemory("user-abc123")
        memory.save_diagnosis(diagnosis_dict)
        history = memory.get_recent_diagnoses(5)
    """

    def __init__(self, user_id: str):
        """
        Initialise long-term memory for a farmer.
        
        Args:
            user_id: The farmer's unique Supabase
                     user identifier.
        """
        self.user_id = user_id
        self.supabase = get_supabase()
        logger.debug(
            f"LongTermMemory initialised "
            f"for user: {user_id}"
        )

    # ── Save Diagnosis ─────────────────────────────────────

    def save_diagnosis(
        self,
        diagnosis: dict,
        image_url: Optional[str] = None,
        tokens_used: Optional[int] = None,
        cost_usd: Optional[float] = None
    ) -> Optional[str]:
        """
        Permanently save a diagnosis to Supabase.
        
        Called after every successful agent run
        to build up the farmer's history.
        
        Args:
            diagnosis: Full diagnosis dict from agent
            image_url: URL of the uploaded leaf image
                       stored in Supabase Storage
            tokens_used: Number of tokens used
            cost_usd: Cost of the API call in USD
            
        Returns:
            str: The diagnosis ID if saved successfully,
                 None if an error occurred.
                 
        Example:
            diagnosis_id = memory.save_diagnosis(
                diagnosis=diagnosis_dict,
                image_url="https://...",
                tokens_used=450,
                cost_usd=0.0045
            )
        """
        try:
            record = {
                "user_id": self.user_id,
                "image_url": image_url,
                "plant_identified": (
                    diagnosis.get("plant_identified")
                ),
                "disease_name": (
                    diagnosis.get("diagnosis", {}).get("name")
                ),
                "severity": (
                    diagnosis.get("diagnosis", {})
                    .get("severity")
                ),
                "confidence_score": (
                    diagnosis.get("confidence_score")
                ),
                "urgency": diagnosis.get("urgency"),
                "treatments": (
                    diagnosis.get("treatments", [])
                ),
                "prevention_tips": (
                    diagnosis.get("prevention_tips", [])
                ),
                "sources": diagnosis.get("sources", []),
                "farmer_advice": (
                    diagnosis.get("farmer_advice")
                ),
                "tokens_used": tokens_used,
                "cost_usd": cost_usd,
                "created_at": datetime.utcnow().isoformat()
            }

            result = (
                self.supabase
                .table(Tables.DIAGNOSES)
                .insert(record)
                .execute()
            )

            diagnosis_id = result.data[0]["id"]
            logger.info(
                f"Diagnosis saved to Supabase: "
                f"{diagnosis_id}"
            )
            return diagnosis_id

        except Exception as e:
            logger.error(
                f"Failed to save diagnosis "
                f"to Supabase: {e}"
            )
            return None

    # ── Retrieve History ───────────────────────────────────

    def get_recent_diagnoses(
        self,
        limit: int = 5
    ) -> list[dict]:
        """
        Retrieve the most recent diagnoses for this farmer.
        
        Used by the agent at the start of a session
        to give personalised context-aware responses.
        
        Args:
            limit: Maximum number of diagnoses to return.
                   Defaults to 5 most recent.
                   
        Returns:
            list[dict]: List of diagnosis records,
                        newest first. Empty list on error.
                        
        Example:
            recent = memory.get_recent_diagnoses(limit=3)
            for diagnosis in recent:
                print(diagnosis["disease_name"])
        """
        try:
            result = (
                self.supabase
                .table(Tables.DIAGNOSES)
                .select("*")
                .eq("user_id", self.user_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data or []

        except Exception as e:
            logger.error(
                f"Failed to get diagnoses "
                f"from Supabase: {e}"
            )
            return []

    def get_history_summary(self) -> dict:
        """
        Generate a summary of the farmer's diagnosis history.
        
        Used by the agent to give personalised advice
        based on recurring patterns in the farmer's crops.
        
        Returns:
            dict: Summary containing:
                  - total_diagnoses: total count
                  - most_common_disease: most frequent
                  - recent_diagnoses: last 5 records
                  - recurring_diseases: diseases seen 2+
                  
        Example:
            summary = memory.get_history_summary()
            print(summary["most_common_disease"])
        """
        try:
            all_diagnoses = self.get_recent_diagnoses(
                limit=20
            )

            if not all_diagnoses:
                return {
                    "total_diagnoses": 0,
                    "most_common_disease": None,
                    "recent_diagnoses": [],
                    "recurring_diseases": []
                }

            # Count disease frequency
            disease_counts: dict[str, int] = {}
            for d in all_diagnoses:
                disease = d.get("disease_name", "Unknown")
                disease_counts[disease] = (
                    disease_counts.get(disease, 0) + 1
                )

            # Find most common disease
            most_common = max(
                disease_counts,
                key=lambda x: disease_counts[x]
            )

            # Find recurring diseases (seen more than once)
            recurring = [
                disease
                for disease, count in disease_counts.items()
                if count > 1
            ]

            return {
                "total_diagnoses": len(all_diagnoses),
                "most_common_disease": most_common,
                "recent_diagnoses": all_diagnoses[:5],
                "recurring_diseases": recurring
            }

        except Exception as e:
            logger.error(
                f"Failed to generate history summary: {e}"
            )
            return {
                "total_diagnoses": 0,
                "most_common_disease": None,
                "recent_diagnoses": [],
                "recurring_diseases": []
            }

    def get_diagnosis_by_id(
        self,
        diagnosis_id: str
    ) -> Optional[dict]:
        """
        Retrieve a single diagnosis by its ID.
        
        Used when a farmer wants to view details
        of a specific past diagnosis.
        
        Args:
            diagnosis_id: The unique diagnosis identifier
            
        Returns:
            dict: The diagnosis record or None if
                  not found.
                  
        Example:
            diagnosis = memory.get_diagnosis_by_id(
                "abc-123-def"
            )
        """
        try:
            result = (
                self.supabase
                .table(Tables.DIAGNOSES)
                .select("*")
                .eq("id", diagnosis_id)
                .eq("user_id", self.user_id)
                .single()
                .execute()
            )
            return result.data

        except Exception as e:
            logger.error(
                f"Failed to get diagnosis by ID: {e}"
            )
            return None

    def delete_diagnosis(
        self,
        diagnosis_id: str
    ) -> bool:
        """
        Delete a specific diagnosis from history.
        
        Used if a farmer wants to remove an incorrect
        or unwanted diagnosis from their history.
        
        Args:
            diagnosis_id: The diagnosis to delete
            
        Returns:
            bool: True if deleted, False if failed.
            
        Example:
            success = memory.delete_diagnosis("abc-123")
        """
        try:
            self.supabase\
                .table(Tables.DIAGNOSES)\
                .delete()\
                .eq("id", diagnosis_id)\
                .eq("user_id", self.user_id)\
                .execute()

            logger.info(
                f"Diagnosis deleted: {diagnosis_id}"
            )
            return True

        except Exception as e:
            logger.error(
                f"Failed to delete diagnosis: {e}"
            )
            return False

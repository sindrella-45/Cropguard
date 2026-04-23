# Defines RAG source reference shapes
# Used to show farmers WHERE the diagnosis came from
# Directly addresses reviewer feedback on transparency

from pydantic import BaseModel, Field, validator
from typing import Optional


class SourceReference(BaseModel):
    """
    A reference to a specific chunk retrieved 
    from ChromaDB during RAG lookup.
    Shown in the UI so farmers can see 
    where the information came from.
    """
    document_name: str        # e.g. "cabi_crop_diseases.pdf"
    chunk_id: str             # e.g. "chunk_023"
    similarity_score: float = Field(
        ge=0.0,
        le=1.0,
        description="How relevant this chunk was (0-1)"
    )
    page_number: Optional[int] = None
    chunk_text: Optional[str] = None   # actual text retrieved

    @validator("similarity_score")
    def round_score(cls, v):
        return round(v, 3)

    @property
    def confidence_label(self) -> str:
        """Human readable confidence label"""
        if self.similarity_score >= 0.8:
            return "High"
        elif self.similarity_score >= 0.6:
            return "Medium"
        else:
            return "Low"
"""
Tests for the RAG pipeline components.

Tests retrieval, evaluation and fallback
behavior of the RAG system.

How to run:
    cd backend
    pytest tests/test_rag.py -v
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
from models.sources import SourceReference


# ── Source Reference Tests ─────────────────────────────────

class TestSourceReference:
    """Tests for the SourceReference Pydantic model."""

    def test_valid_source_reference(self):
        """
        Test creating a valid SourceReference
        with all required fields.
        """
        source = SourceReference(
            document_name="cabi_crop_diseases.pdf",
            chunk_id="cabi_crop_diseases.pdf_chunk_5",
            similarity_score=0.872
        )

        assert source.document_name == (
            "cabi_crop_diseases.pdf"
        )
        assert source.chunk_id == (
            "cabi_crop_diseases.pdf_chunk_5"
        )
        assert source.similarity_score == 0.872

    def test_similarity_score_rounded(self):
        """
        Test that similarity scores are
        rounded to 3 decimal places.
        """
        source = SourceReference(
            document_name="test.pdf",
            chunk_id="test_chunk_0",
            similarity_score=0.87654321
        )
        assert source.similarity_score == 0.877

    def test_similarity_score_validation(self):
        """
        Test that invalid similarity scores
        raise a validation error.
        """
        with pytest.raises(Exception):
            SourceReference(
                document_name="test.pdf",
                chunk_id="test_chunk_0",
                similarity_score=1.5  # > 1.0
            )

    def test_confidence_label_high(self):
        """
        Test confidence label returns High
        for scores above 0.8.
        """
        source = SourceReference(
            document_name="test.pdf",
            chunk_id="chunk_0",
            similarity_score=0.85
        )
        assert source.confidence_label == "High"

    def test_confidence_label_medium(self):
        """
        Test confidence label returns Medium
        for scores between 0.6 and 0.8.
        """
        source = SourceReference(
            document_name="test.pdf",
            chunk_id="chunk_0",
            similarity_score=0.72
        )
        assert source.confidence_label == "Medium"

    def test_confidence_label_low(self):
        """
        Test confidence label returns Low
        for scores below 0.6.
        """
        source = SourceReference(
            document_name="test.pdf",
            chunk_id="chunk_0",
            similarity_score=0.45
        )
        assert source.confidence_label == "Low"


# ── Evaluator Tests ────────────────────────────────────────

class TestEvaluator:
    """Tests for the RAG retrieval evaluator."""

    def test_evaluate_filters_low_scores(self):
        """
        Test that chunks below threshold
        are filtered out correctly.
        """
        from rag.retrieval.evaluator import (
            evaluate_retrieval
        )

        chunks = [
            {
                "text": "High quality chunk",
                "document_name": "test.pdf",
                "chunk_id": "chunk_0",
                "similarity_score": 0.85
            },
            {
                "text": "Low quality chunk",
                "document_name": "test.pdf",
                "chunk_id": "chunk_1",
                "similarity_score": 0.45
            }
        ]

        filtered = evaluate_retrieval(
            chunks=chunks,
            threshold=0.6,
            query="test query"
        )

        assert len(filtered) == 1
        assert filtered[0]["similarity_score"] == 0.85

    def test_evaluate_sorts_by_score(self):
        """
        Test that filtered chunks are sorted
        by similarity score highest first.
        """
        from rag.retrieval.evaluator import (
            evaluate_retrieval
        )

        chunks = [
            {
                "text": "Medium chunk",
                "document_name": "test.pdf",
                "chunk_id": "chunk_0",
                "similarity_score": 0.72
            },
            {
                "text": "High chunk",
                "document_name": "test.pdf",
                "chunk_id": "chunk_1",
                "similarity_score": 0.91
            },
            {
                "text": "Good chunk",
                "document_name": "test.pdf",
                "chunk_id": "chunk_2",
                "similarity_score": 0.78
            }
        ]

        filtered = evaluate_retrieval(
            chunks=chunks,
            threshold=0.6
        )

        assert filtered[0]["similarity_score"] == 0.91
        assert filtered[1]["similarity_score"] == 0.78
        assert filtered[2]["similarity_score"] == 0.72

    def test_evaluate_empty_chunks(self):
        """
        Test evaluator handles empty chunk
        list without errors.
        """
        from rag.retrieval.evaluator import (
            evaluate_retrieval
        )

        result = evaluate_retrieval(
            chunks=[],
            threshold=0.6
        )

        assert result == []


# ── Fallback Tests ─────────────────────────────────────────

class TestFallback:
    """Tests for the RAG fallback handler."""

    def test_should_fallback_empty_chunks(self):
        """
        Test fallback triggered when no chunks
        pass the threshold.
        """
        from rag.retrieval.fallback import (
            should_fallback
        )

        assert should_fallback([]) is True

    def test_should_not_fallback_good_chunks(self):
        """
        Test fallback not triggered when chunks
        have good similarity scores.
        """
        from rag.retrieval.fallback import (
            should_fallback
        )

        chunks = [
            {
                "similarity_score": 0.85,
                "text": "Good chunk",
                "document_name": "test.pdf",
                "chunk_id": "chunk_0"
            }
        ]

        assert should_fallback(chunks) is False

    def test_handle_fallback_returns_dict(self):
        """
        Test handle_fallback returns correct
        dict structure.
        """
        from rag.retrieval.fallback import (
            handle_fallback
        )

        result = handle_fallback(
            confidence_score=0.42,
            personality="friendly"
        )

        assert result["fallback_triggered"] is True
        assert "message" in result
        assert "recommended_actions" in result
        assert isinstance(
            result["recommended_actions"], list
        )
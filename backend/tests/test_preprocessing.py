"""
Tests for the RAG preprocessing pipeline.

Tests text extraction, cleaning, chunking
and normalisation functions.

How to run:
    cd backend
    pytest tests/test_preprocessing.py -v
"""

import pytest
from rag.preprocessing.cleaner import clean_text
from rag.preprocessing.normalizer import normalize_text
from rag.preprocessing.chunker import chunk_text


# ── Cleaner Tests ──────────────────────────────────────────

class TestCleaner:
    """Tests for the text cleaning function."""

    def test_removes_page_numbers(self):
        """
        Test that page numbers are removed
        from extracted text.
        """
        text = "Page 23\nDisease information here"
        cleaned = clean_text(text)
        assert "Page 23" not in cleaned
        assert "Disease information here" in cleaned

    def test_removes_excessive_whitespace(self):
        """
        Test that multiple spaces are reduced
        to single spaces.
        """
        text = "Early  Blight  symptoms"
        cleaned = clean_text(text)
        assert "  " not in cleaned

    def test_removes_duplicate_lines(self):
        """
        Test that duplicate consecutive lines
        are removed.
        """
        text = (
            "CABI Crop Guide\n"
            "CABI Crop Guide\n"
            "Disease information"
        )
        cleaned = clean_text(text)
        assert cleaned.count("CABI Crop Guide") <= 1

    def test_handles_empty_string(self):
        """
        Test clean_text handles empty string
        without raising errors.
        """
        result = clean_text("")
        assert result == ""

    def test_handles_none_like_empty(self):
        """
        Test clean_text handles whitespace-only
        string gracefully.
        """
        result = clean_text("   \n\n   ")
        assert result == ""

    def test_removes_short_lines(self):
        """
        Test that very short lines (artifacts)
        are removed from text.
        """
        text = "a\nbb\nThis is actual content here"
        cleaned = clean_text(text)
        assert "This is actual content here" in cleaned


# ── Normalizer Tests ───────────────────────────────────────

class TestNormalizer:
    """Tests for the text normalisation function."""

    def test_lowercases_text(self):
        """
        Test that text is converted to lowercase
        for consistent embeddings.
        """
        text = "Early Blight Caused By Fungus"
        normalised = normalize_text(text)
        assert normalised == normalised.lower()

    def test_standardises_whitespace(self):
        """
        Test that multiple spaces are normalised
        to single spaces.
        """
        text = "early   blight   symptoms"
        normalised = normalize_text(text)
        assert "   " not in normalised

    def test_handles_empty_string(self):
        """
        Test normalizer handles empty string.
        """
        result = normalize_text("")
        assert result == ""

    def test_standardises_british_spelling(self):
        """
        Test that British spellings are converted
        to American standard for consistency.
        """
        text = "The colour of the leaf changes"
        normalised = normalize_text(text)
        assert "color" in normalised
        assert "colour" not in normalised

    def test_removes_empty_segments(self):
        """
        Test that empty segments after splitting
        are removed from normalised text.
        """
        text = "First sentence.. . . Second sentence"
        normalised = normalize_text(text)
        assert normalised != ""


# ── Chunker Tests ──────────────────────────────────────────

class TestChunker:
    """Tests for the text chunking function."""

    def test_creates_chunks_from_pages(self):
        """
        Test that chunker creates at least one
        chunk from valid page content.
        """
        pages = [
            "Early blight is a fungal disease "
            "caused by Alternaria solani. "
            "It affects tomatoes and potatoes. "
            "Symptoms include brown spots with "
            "yellow halos on leaves."
        ]

        original_pages = [{"page_number": 1}]

        chunks = chunk_text(
            pages=pages,
            source_file="test.pdf",
            original_pages=original_pages
        )

        assert len(chunks) >= 1
        assert chunks[0]["source_file"] == "test.pdf"
        assert chunks[0]["page_number"] == 1

    def test_chunk_has_required_fields(self):
        """
        Test that each chunk contains all
        required metadata fields.
        """
        pages = ["Test content for chunking here."]
        original_pages = [{"page_number": 1}]

        chunks = chunk_text(
            pages=pages,
            source_file="test.pdf",
            original_pages=original_pages
        )

        assert len(chunks) >= 1
        chunk = chunks[0]

        assert "text" in chunk
        assert "chunk_index" in chunk
        assert "page_number" in chunk
        assert "source_file" in chunk
        assert "chunk_size" in chunk

    def test_empty_pages_produce_no_chunks(self):
        """
        Test that empty pages do not produce
        any chunks.
        """
        pages = ["", "   ", "\n\n"]
        original_pages = [
            {"page_number": 1},
            {"page_number": 2},
            {"page_number": 3}
        ]

        chunks = chunk_text(
            pages=pages,
            source_file="test.pdf",
            original_pages=original_pages
        )

        assert len(chunks) == 0

    def test_chunk_indices_are_sequential(self):
        """
        Test that chunk indices increment
        sequentially from 0.
        """
        long_text = "Word " * 300  # Long enough for multiple chunks
        pages = [long_text]
        original_pages = [{"page_number": 1}]

        chunks = chunk_text(
            pages=pages,
            source_file="test.pdf",
            original_pages=original_pages
        )

        for i, chunk in enumerate(chunks):
            assert chunk["chunk_index"] == i
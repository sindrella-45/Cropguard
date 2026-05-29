# backend/rag/preprocessing/chunker.py
"""
Text chunking for CropGuard AI RAG pipeline.

Splits cleaned page text into overlapping chunks
and attaches metadata to each chunk including the
crop name — the critical field that enables filtered
retrieval like {"crop": "coffee"}.

Why chunking matters:
    PDFs can be hundreds of pages. Sending a whole
    PDF to the LLM is impossible (token limits) and
    wasteful. Chunking splits it into small pieces
    (500 tokens each) so only the relevant pieces
    are retrieved and sent to the LLM.

Why overlap matters:
    A 50-token overlap between adjacent chunks means
    a sentence that spans two chunks still appears
    fully in at least one of them. Without overlap,
    important context at chunk boundaries gets lost.
"""

import logging
from typing import Optional

logger = logging.getLogger(__name__)


def chunk_text(
    pages: list[str],
    source_file: str,
    original_pages: list[dict],
    crop: str = "general",
    chunk_size: int = 500,
    chunk_overlap: int = 50,
) -> list[dict]:
    """
    Split page text into overlapping chunks with metadata.

    Each chunk gets the following metadata fields:
        chunk_id    — unique ID for deduplication
        text        — the chunk content
        crop        — crop name e.g. "coffee", "cotton",
                      or "general" for multi-crop PDFs
        source_file — original PDF filename
        page_number — page the chunk came from
        chunk_index — position of this chunk (0-based)
        chunk_size  — number of characters in this chunk

    Args:
        pages:          List of cleaned page text strings
        source_file:    PDF filename (stored as metadata)
        original_pages: List of dicts with page_number
        crop:           Crop name extracted from filename
        chunk_size:     Target chunk size in characters
                        (approx 500 tokens ≈ 2000 chars)
        chunk_overlap:  Overlap between adjacent chunks

    Returns:
        List of chunk dicts, each with full metadata

    Example output chunk:
        {
            "chunk_id":    "cabi_coffee_east_africa.pdf_chunk_5",
            "text":        "Coffee leaf rust is caused by...",
            "crop":        "coffee",
            "source_file": "cabi_coffee_east_africa.pdf",
            "page_number": 12,
            "chunk_index": 5,
            "chunk_size":  487,
        }
    """
    # Convert token-based sizes to character-based sizes
    # Approximation: 1 token ≈ 4 characters
    char_size    = chunk_size    * 4   # 500 tokens ≈ 2000 chars
    char_overlap = chunk_overlap * 4   # 50 tokens  ≈ 200 chars

    all_chunks: list[dict] = []
    chunk_index = 0

    for i, page_text in enumerate(pages):
        if not page_text or not page_text.strip():
            continue

        # Get page number from metadata
        page_number: Optional[int] = None
        if i < len(original_pages):
            page_number = original_pages[i].get("page_number")

        text = page_text.strip()

        # If the page is short enough, keep as one chunk
        if len(text) <= char_size:
            if len(text) >= 50:  # skip very short fragments
                chunk_id = f"{source_file}_chunk_{chunk_index}"
                all_chunks.append({
                    "chunk_id":    chunk_id,
                    "text":        text,
                    "crop":        crop,          # ← CRITICAL metadata field
                    "source_file": source_file,
                    "page_number": page_number,
                    "chunk_index": chunk_index,
                    "chunk_size":  len(text),
                })
                chunk_index += 1
            continue

        # Slide a window across long pages
        start = 0
        while start < len(text):
            end = start + char_size

            # Try to end at sentence boundary
            if end < len(text):
                # Look for sentence-ending punctuation near the boundary
                for punct in [". ", ".\n", "! ", "? "]:
                    last_punct = text.rfind(punct, start, end)
                    if last_punct != -1 and last_punct > start + (char_size // 2):
                        end = last_punct + len(punct)
                        break

            chunk_content = text[start:end].strip()

            if len(chunk_content) >= 50:  # skip very short fragments
                chunk_id = f"{source_file}_chunk_{chunk_index}"
                all_chunks.append({
                    "chunk_id":    chunk_id,
                    "text":        chunk_content,
                    "crop":        crop,          # ← CRITICAL metadata field
                    "source_file": source_file,
                    "page_number": page_number,
                    "chunk_index": chunk_index,
                    "chunk_size":  len(chunk_content),
                })
                chunk_index += 1

            # Move start forward with overlap
            start = end - char_overlap
            if start >= len(text):
                break

    logger.debug(
        f"Chunked {source_file} (crop={crop}): "
        f"{len(pages)} pages → {len(all_chunks)} chunks"
    )

    return all_chunks
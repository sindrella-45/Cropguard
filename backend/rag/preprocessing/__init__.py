"""
Preprocessing package for CropGuard AI RAG pipeline.

Handles the complete transformation of raw PDF
documents into clean, normalised text chunks
ready for embedding and storage in ChromaDB.

Pipeline:
    extractor  → extract raw text from PDF
    cleaner    → remove noise and irrelevant content
    chunker    → split text into semantic chunks
    normalizer → standardise format and encoding

Usage:
    from rag.preprocessing import preprocess_document
    
    chunks = preprocess_document("path/to/file.pdf")
"""

from .extractor import extract_text
from .cleaner import clean_text
from .chunker import chunk_text
from .normalizer import normalize_text


def preprocess_document(file_path: str) -> list[dict]:
    """
    Run the complete preprocessing pipeline on a PDF.
    
    Orchestrates all four preprocessing steps in
    the correct order to produce clean chunks
    ready for embedding.
    
    Args:
        file_path: Path to the PDF file to process
        
    Returns:
        list[dict]: List of chunk dicts containing:
                    - text: cleaned normalised text
                    - chunk_index: position in document
                    - page_number: source page
                    - source_file: original filename
                    
    Example:
        chunks = preprocess_document(
            "data/raw/cabi_crop_diseases.pdf"
        )
        print(len(chunks))   # 142
        print(chunks[0])
        # {
        #   "text": "Early blight is caused by...",
        #   "chunk_index": 0,
        #   "page_number": 1,
        #   "source_file": "cabi_crop_diseases.pdf"
        # }
    """
    import os
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"Starting preprocessing: {file_path}")

    # Step 1 — Extract raw text from PDF
    raw_pages = extract_text(file_path)
    logger.info(f"Extracted {len(raw_pages)} pages")

    # Step 2 — Clean each page
    cleaned_pages = [
        clean_text(page["text"])
        for page in raw_pages
    ]
    logger.info("Text cleaning complete")

    # Step 3 — Chunk the cleaned text
    raw_chunks = chunk_text(
        pages=cleaned_pages,
        source_file=os.path.basename(file_path),
        original_pages=raw_pages
    )
    logger.info(f"Created {len(raw_chunks)} chunks")

    # Step 4 — Normalise each chunk
    final_chunks = [
        {**chunk, "text": normalize_text(chunk["text"])}
        for chunk in raw_chunks
    ]
    logger.info("Normalisation complete")

    logger.info(
        f"Preprocessing complete: "
        f"{len(final_chunks)} chunks ready"
    )

    return final_chunks
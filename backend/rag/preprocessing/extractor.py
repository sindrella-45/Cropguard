"""
PDF text extractor for CropGuard AI RAG pipeline.

Extracts raw text from PDF documents using pdfplumber
which handles complex PDF layouts better than basic
PyPDF for agricultural documents that contain tables,
diagrams and multi-column layouts.

Why pdfplumber over PyPDF?
    Agricultural guides often contain:
    - Multi-column layouts
    - Tables with disease symptoms
    - Mixed text and image pages
    pdfplumber handles these more reliably.

Addresses reviewer feedback:
    'Extract text from the PDF using a 
    reproducible method (e.g. a dedicated parser)'

Usage:
    from rag.preprocessing import extract_text
    
    pages = extract_text("data/raw/cabi.pdf")
    for page in pages:
        print(page["page_number"])
        print(page["text"][:100])
"""

import pdfplumber
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def extract_text(file_path: str) -> list[dict]:
    """
    Extract text from all pages of a PDF document.
    
    Opens the PDF with pdfplumber and extracts
    text from each page, preserving page number
    metadata for source attribution in RAG results.
    
    Args:
        file_path: Absolute or relative path to PDF
        
    Returns:
        list[dict]: One dict per page containing:
                    - page_number: int (1-indexed)
                    - text: raw extracted text string
                    
    Raises:
        FileNotFoundError: If PDF file does not exist
        Exception: If PDF cannot be opened or read
        
    Example:
        pages = extract_text(
            "data/raw/cabi_crop_diseases.pdf"
        )
        print(pages[0]["page_number"])  # 1
        print(pages[0]["text"][:50])
        # "CABI Crop Protection Compendium..."
    """
    logger.info(f"Extracting text from: {file_path}")

    pages = []

    try:
        with pdfplumber.open(file_path) as pdf:
            total_pages = len(pdf.pages)
            logger.info(
                f"PDF opened: {total_pages} pages found"
            )

            for i, page in enumerate(pdf.pages):
                # Extract text from page
                text = page.extract_text()

                # Skip pages with no text
                # (likely image-only pages)
                if not text or len(text.strip()) < 10:
                    logger.debug(
                        f"Skipping empty page {i + 1}"
                    )
                    continue

                pages.append({
                    "page_number": i + 1,
                    "text": text
                })

        logger.info(
            f"Extraction complete: "
            f"{len(pages)} pages with text"
        )
        return pages

    except FileNotFoundError:
        logger.error(f"PDF not found: {file_path}")
        raise

    except Exception as e:
        logger.error(
            f"Failed to extract text from "
            f"{file_path}: {e}"
        )
        raise
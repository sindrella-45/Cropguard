"""
Text cleaner for CropGuard AI RAG pipeline.

Removes noise, irrelevant content and formatting
artifacts from raw PDF text before chunking.

Why cleaning matters:
    Raw PDF text often contains:
    - Page numbers (e.g. "Page 23 of 150")
    - Headers and footers repeated on every page
    - Special characters from PDF encoding
    - Excessive whitespace and blank lines
    - Copyright notices and publication metadata
    
    These add noise to embeddings and reduce
    the quality of ChromaDB similarity searches.

Addresses reviewer feedback:
    'Clean the text (remove noise, headers, 
    duplicated content, and irrelevant symbols)'

Usage:
    from rag.preprocessing import clean_text
    
    cleaned = clean_text(raw_text)
"""

import re
import logging

logger = logging.getLogger(__name__)


def clean_text(text: str) -> str:
    """
    Clean raw PDF text by removing noise and artifacts.
    
    Applies a series of regex and string operations
    to produce clean readable text suitable for
    chunking and embedding.
    
    Cleaning steps applied in order:
        1. Remove page numbers
        2. Remove common header/footer patterns
        3. Remove special PDF encoding artifacts
        4. Remove excessive whitespace
        5. Remove very short meaningless lines
        6. Remove duplicate consecutive lines
    
    Args:
        text: Raw text extracted from PDF page
        
    Returns:
        str: Cleaned text ready for chunking
        
    Example:
        raw = "Page 23\\nDisease Guide\\n\\n\\n..."
        clean = clean_text(raw)
        print(clean)
        # "Disease Guide..."
    """
    if not text:
        return ""

    # Step 1 — Remove page numbers
    # Matches: "Page 23", "23", "- 23 -", "23/150"
    text = re.sub(
        r'\bpage\s+\d+\b',
        '',
        text,
        flags=re.IGNORECASE
    )
    text = re.sub(r'\b\d+\s*/\s*\d+\b', '', text)
    text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)

    # Step 2 — Remove common headers and footers
    # These are repeated lines that add no value
    header_patterns = [
        r'CABI Crop Protection Compendium.*',
        r'FAO Plant Health.*',
        r'All rights reserved.*',
        r'Copyright.*\d{4}.*',
        r'www\.\S+\.com',
        r'Confidential.*',
        r'Draft.*version.*',
    ]
    for pattern in header_patterns:
        text = re.sub(
            pattern, '', text, flags=re.IGNORECASE
        )

    # Step 3 — Remove special characters and artifacts
    # Remove non-printable characters
    text = re.sub(r'[^\x20-\x7E\n]', ' ', text)

    # Remove excessive punctuation artifacts
    text = re.sub(r'[_\-]{3,}', '', text)

    # Remove bullet point symbols
    text = re.sub(r'^[\•\-\*\◦\▪]\s*', '', text, flags=re.MULTILINE)

    # Step 4 — Normalise whitespace
    # Replace multiple spaces with single space
    text = re.sub(r' {2,}', ' ', text)

    # Replace 3+ newlines with double newline
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Step 5 — Remove very short lines (less than 4 chars)
    # These are usually artifacts or lone characters
    lines = text.split('\n')
    lines = [
        line for line in lines
        if len(line.strip()) >= 4 or line.strip() == ''
    ]
    text = '\n'.join(lines)

    # Step 6 — Remove duplicate consecutive lines
    lines = text.split('\n')
    seen = set()
    unique_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped not in seen or stripped == '':
            unique_lines.append(line)
            if stripped:
                seen.add(stripped)
    text = '\n'.join(unique_lines)

    logger.debug(
        f"Cleaned text: {len(text)} characters remaining"
    )

    return text.strip()
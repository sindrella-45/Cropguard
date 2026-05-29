"""
Text normalizer for CropGuard AI RAG pipeline.

Standardises the format and encoding of text
chunks before they are embedded and stored
in ChromaDB.

Why normalisation matters:
    Embedding models are sensitive to formatting.
    Consistent formatting ensures:
    - Similar concepts get similar embeddings
    - Search results are more accurate
    - No encoding errors in ChromaDB

Normalisation steps:
    1. Lowercase where appropriate
    2. Standardise whitespace
    3. Fix encoding issues
    4. Remove empty segments
    5. Standardise agricultural terminology

Addresses reviewer feedback:
    'Normalise formatting (lowercasing where 
    appropriate, consistent encoding, removal 
    of empty segments)'

Usage:
    from rag.preprocessing import normalize_text
    
    normalised = normalize_text(chunk_text)
"""

import re
import logging
import unicodedata

logger = logging.getLogger(__name__)

# Standardise common agricultural terms
# so they match consistently across documents
TERM_STANDARDISATION = {
    "grey": "gray",
    "colour": "color",
    "favour": "favor",
    "blight disease": "blight",
    "fungal infection": "fungal disease",
    "leaf spot disease": "leaf spot",
}


def normalize_text(text: str) -> str:
    """
    Normalise a text chunk for consistent embedding.
    
    Applies formatting standardisation to ensure
    similar disease descriptions get similar vector
    representations in ChromaDB.
    
    Normalisation steps applied in order:
        1. Unicode normalisation (fix encoding)
        2. Lowercase conversion
        3. Whitespace standardisation
        4. Agricultural term standardisation
        5. Remove empty segments
    
    Args:
        text: Cleaned chunk text to normalise
        
    Returns:
        str: Normalised text ready for embedding
        
    Example:
        raw = "  Early  Blight  Colour Changes... "
        normalised = normalize_text(raw)
        print(normalised)
        # "early blight color changes..."
    """
    if not text or not text.strip():
        return ""

    # Step 1 — Unicode normalisation
    # Fixes encoding artifacts from PDF extraction
    text = unicodedata.normalize('NFKC', text)

    # Step 2 — Lowercase
    # Ensures "Early Blight" matches "early blight"
    # in similarity searches
    text = text.lower()

    # Step 3 — Standardise whitespace
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()

    # Step 4 — Standardise agricultural terminology
    for original, standard in TERM_STANDARDISATION.items():
        text = text.replace(original.lower(), standard)

    # Step 5 — Remove empty segments
    # Split by sentence, remove empties, rejoin
    sentences = text.split('.')
    sentences = [
        s.strip()
        for s in sentences
        if s.strip() and len(s.strip()) > 3
    ]
    text = '. '.join(sentences)

    # Add final period if missing
    if text and not text.endswith('.'):
        text += '.'

    logger.debug(
        f"Normalised text: {len(text)} characters"
    )

    return text
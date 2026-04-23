# RAG Pipeline Documentation

## Overview

The RAG (Retrieval Augmented Generation) pipeline
grounds every CropGuard AI diagnosis in verified
agricultural knowledge rather than relying solely
on GPT-4o's general training data.

## Why RAG For Crop Disease Detection

Without RAG:
- GPT-4o relies on general training data
- May produce vague or imprecise diagnoses
- No source attribution possible
- Higher hallucination risk

With RAG:
- Agent searches verified disease documents first
- Diagnosis grounded in authoritative sources
- Every result shows which document was used
- Fallback triggered when confidence is too low

## Data Sources

All source documents are placed in backend/data/raw/

| Document | Source | Content |
|----------|--------|---------|
| cabi_crop_diseases.pdf | CABI Crop Protection Compendium | Disease descriptions, symptoms, treatments |
| fao_plant_health.pdf | FAO Plant Health Guidelines | Regional disease guides |
| uganda_crop_guide.pdf | Uganda Ministry of Agriculture | Local crop disease reference |

## Preprocessing Pipeline

Raw PDF documents go through four stages before
being stored in ChromaDB:

### Stage 1 — Extract (extractor.py)
Tool used: pdfplumber
Why pdfplumber: Agricultural guides contain complex
layouts including multi-column text and tables.
pdfplumber handles these more reliably than PyPDF.

Output: List of page dicts with text and page number

### Stage 2 — Clean (cleaner.py)
Removes:
- Page numbers and headers/footers
- Copyright notices and publication metadata
- Special characters from PDF encoding
- Duplicate consecutive lines
- Lines shorter than 4 characters

Why cleaning matters: Noise in text reduces
embedding quality and makes similarity search
less accurate.

### Stage 3 — Chunk (chunker.py)
Strategy: Paragraph-based splitting with overlap

Configuration:
- Chunk size: 500 characters
- Overlap: 50 characters
- Split boundary: Paragraph breaks preferred

Why these values: Based on evaluation results
in docs/retrieval_evaluation.md. 500 characters
preserved enough context per chunk while keeping
topics focused. 50 character overlap prevented
information loss at chunk boundaries.

### Stage 4 — Normalise (normalizer.py)
Operations:
- Unicode normalisation (fix PDF encoding artifacts)
- Lowercase conversion
- Whitespace standardisation
- British to American spelling standardisation
- Empty segment removal

Why normalise: Consistent formatting ensures
similar disease descriptions receive similar
vector representations in ChromaDB.

## ChromaDB Structure
```
ChromaDB (persistent on disk)
└── Collection: "crop_diseases"
    ├── Metadata:
    │   ├── embedding_model: text-embedding-3-small
    │   ├── chunk_size: 500
    │   └── chunk_overlap: 50
    │
    └── Documents:
        ├── cabi_crop_diseases.pdf_chunk_0
        │   ├── text: "Early blight is caused by..."
        │   ├── source_file: "cabi_crop_diseases.pdf"
        │   ├── chunk_index: 0
        │   ├── page_number: 1
        │   └── chunk_size: 487
        │
        ├── cabi_crop_diseases.pdf_chunk_1
        │   └── ...
        │
        └── fao_plant_health.pdf_chunk_0
            └── ...
```

## Embedding Model

Model: OpenAI text-embedding-3-small

Why this model:
- Consistent with GPT-4o (same provider)
- 1536 dimensions for high precision search
- Cost effective for this project scale
- Strong performance on agricultural text

## Retrieval Configuration

Based on evaluation results:

| Parameter | Value | Justification |
|-----------|-------|---------------|
| top_k | 3 | Best balance of relevance vs noise |
| similarity_threshold | 0.6 | Filters low quality matches |
| embedding_model | text-embedding-3-small | Best agricultural text performance |

## Adding New Data Sources

To add a new PDF document to the knowledge base:

1. Place the PDF in backend/data/raw/
2. Ensure the PDF contains readable text
   (not scanned image-only PDFs)
3. Run the ingestion script:
```
   cd backend
   python scripts/ingest_data.py
```
4. Verify chunks were stored:
```
   python -c "
   from rag import RAGPipeline
   p = RAGPipeline()
   print(p.get_collection_stats())
   "
```

## Fallback Behaviour

When retrieval confidence is below 0.6:
1. Fallback is triggered automatically
2. Agent skips disease detection node
3. Farmer receives honest message explaining
   the app could not find a reliable match
4. Farmer is advised to retake photo or
   consult a local agricultural expert

This prevents hallucinated diagnoses that could
cause farmers to apply wrong treatments.

## Source Attribution

Every diagnosis response includes:
- Document name for each source used
- Chunk ID for precise reference
- Similarity score showing relevance
- Excerpt of the retrieved text

This directly addresses reviewer feedback on
transparency and trust in AI diagnoses.
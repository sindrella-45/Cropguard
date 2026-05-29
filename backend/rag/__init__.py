"""
RAG (Retrieval Augmented Generation) package
for CropGuard AI.

This package handles everything related to the
disease knowledge base:

1. Preprocessing — loading and cleaning PDFs
2. Vectorstore   — storing chunks in ChromaDB
3. Retrieval     — searching for relevant chunks
4. Pipeline      — orchestrating the full flow

Why RAG for crop disease detection?
    Without RAG, GPT-4o relies only on general
    training data which may be outdated or imprecise
    for specific regional crop diseases in Uganda
    and East Africa.

    With RAG, the agent grounds every diagnosis in
    verified agricultural documents such as:
    - CABI Crop Protection Compendium
    - FAO Plant Health Guidelines
    - Uganda Ministry of Agriculture crop guides

Data flow:
    PDF documents
        ↓ extractor.py    — extract raw text
        ↓ cleaner.py      — remove noise
        ↓ chunker.py      — split into chunks
        ↓ normalizer.py   — standardise format
        ↓ embeddings.py   — convert to vectors
        ↓ chromadb        — store vectors
        ↓ retriever.py    — search for matches
        ↓ evaluator.py    — filter by quality
        ↓ agent nodes     — use in diagnosis

Usage:
    from rag import RAGPipeline
    
    pipeline = RAGPipeline()
    await pipeline.ingest_document("data/raw/cabi.pdf")
    results = await pipeline.search("yellow spots tomato")
"""

from .pipeline import RAGPipeline
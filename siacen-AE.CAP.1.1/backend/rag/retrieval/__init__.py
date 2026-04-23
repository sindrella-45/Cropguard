"""
Retrieval package for CropGuard AI RAG pipeline.

Handles searching ChromaDB for relevant disease
knowledge and evaluating the quality of results.

Components:
    retriever  — performs similarity search
    evaluator  — filters results by quality
    fallback   — handles low confidence cases

Usage:
    from rag.retrieval import retrieve_chunks
    from rag.retrieval import evaluate_retrieval
    from rag.retrieval import handle_fallback
"""

from .retriever import retrieve_chunks
from .evaluator import evaluate_retrieval
from .fallback import handle_fallback
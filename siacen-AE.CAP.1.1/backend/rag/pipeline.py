"""
Main RAG pipeline orchestrator for CropGuard AI.

This is the central module that coordinates the
entire RAG workflow from document ingestion to
knowledge retrieval during agent runs.

Two main responsibilities:
    1. Ingestion — loading PDFs into ChromaDB
       Called once via scripts/ingest_data.py
       
    2. Search — retrieving relevant chunks
       Called during every agent diagnosis run

Data sources used:
    - CABI Crop Protection Compendium (PDF)
    - FAO Plant Health Guidelines (PDF)
    - Uganda Ministry of Agriculture Crop Guide (PDF)

Adding new data sources:
    1. Place PDF in backend/data/raw/
    2. Run: python scripts/ingest_data.py
    3. New chunks are automatically added to ChromaDB

Usage:
    from rag import RAGPipeline
    
    pipeline = RAGPipeline()
    
    # Ingest a document (run once)
    await pipeline.ingest_document(
        "data/raw/cabi_crop_diseases.pdf"
    )
    
    # Search during agent run
    results = await pipeline.search(
        query="yellow spots tomato",
        personality="friendly"
    )
"""

import logging
from typing import Optional
from rag.preprocessing import preprocess_document
from rag.vectorstore.collections import (
    get_collection,
    store_chunks
)
from rag.retrieval.retriever import retrieve_chunks
from rag.retrieval.evaluator import evaluate_retrieval
from rag.retrieval.fallback import (
    handle_fallback,
    should_fallback
)
from models.sources import SourceReference
from config import get_settings

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Orchestrates the complete RAG pipeline for
    CropGuard AI disease knowledge retrieval.
    
    Provides two main methods:
        ingest_document — adds a PDF to ChromaDB
        search          — retrieves relevant chunks
        
    Example:
        pipeline = RAGPipeline()
        
        # One-time ingestion
        count = await pipeline.ingest_document(
            "data/raw/cabi.pdf"
        )
        print(f"Stored {count} chunks")
        
        # Runtime search
        results = await pipeline.search(
            "yellow spots tomato leaf"
        )
    """

    def __init__(self):
        """Initialise the RAG pipeline."""
        self.settings = get_settings()
        self.collection = get_collection()
        logger.info("RAGPipeline initialised")

    # ── Document Ingestion ─────────────────────────────────

    async def ingest_document(
        self,
        file_path: str
    ) -> int:
        """
        Ingest a PDF document into ChromaDB.
        
        Runs the complete preprocessing pipeline
        on the PDF and stores all resulting chunks
        in the ChromaDB collection.
        
        Args:
            file_path: Path to PDF file to ingest
            
        Returns:
            int: Number of chunks stored
            
        Example:
            count = await pipeline.ingest_document(
                "data/raw/cabi_crop_diseases.pdf"
            )
            print(f"Stored {count} chunks")
        """
        logger.info(
            f"Starting ingestion: {file_path}"
        )

        # Step 1 — Preprocess the PDF
        chunks = preprocess_document(file_path)

        if not chunks:
            logger.warning(
                f"No chunks produced from: {file_path}"
            )
            return 0

        # Step 2 — Store chunks in ChromaDB
        stored_count = store_chunks(
            chunks=chunks,
            collection=self.collection
        )

        logger.info(
            f"Ingestion complete: "
            f"{stored_count} chunks stored "
            f"from {file_path}"
        )

        return stored_count

    # ── Knowledge Search ───────────────────────────────────

    async def search(
        self,
        query: str,
        personality: str = "friendly"
    ) -> tuple[list[SourceReference], Optional[dict]]:
        """
        Search the disease knowledge base for a query.
        
        Retrieves relevant chunks, evaluates their
        quality, and returns either the results or
        a fallback response if quality is too low.
        
        Args:
            query: Search query from the vision tool
            personality: For fallback message tone
            
        Returns:
            tuple:
                - list[SourceReference]: Retrieved chunks
                  (empty list if fallback triggered)
                - dict or None: Fallback response if
                  triggered, None if search succeeded
                  
        Example:
            sources, fallback = await pipeline.search(
                "yellow spots tomato"
            )
            if fallback:
                return fallback
            for source in sources:
                print(source.document_name)
        """
        # Retrieve raw chunks from ChromaDB
        raw_chunks = await retrieve_chunks(
            query=query,
            top_k=self.settings.rag_top_k,
            collection_name=(
                self.settings.chroma_collection_name
            )
        )

        # Evaluate chunk quality
        filtered_chunks = evaluate_retrieval(
            chunks=raw_chunks,
            threshold=self.settings.rag_similarity_threshold,
            query=query
        )

        # Check if fallback needed
        if should_fallback(filtered_chunks):
            best_score = (
                max(c["similarity_score"]
                    for c in raw_chunks)
                if raw_chunks else 0.0
            )
            fallback = handle_fallback(
                confidence_score=best_score,
                personality=personality
            )
            return [], fallback

        # Convert to SourceReference models
        sources = [
            SourceReference(
                document_name=chunk["document_name"],
                chunk_id=chunk["chunk_id"],
                similarity_score=chunk["similarity_score"],
                page_number=chunk.get("page_number"),
                chunk_text=chunk["text"]
            )
            for chunk in filtered_chunks
        ]

        return sources, None

    def get_collection_stats(self) -> dict:
        """
        Get statistics about the ChromaDB collection.
        
        Useful for monitoring how many chunks
        are stored and verifying ingestion worked.
        
        Returns:
            dict: Stats containing chunk count
                  and collection name.
                  
        Example:
            stats = pipeline.get_collection_stats()
            print(stats["total_chunks"])
        """
        return {
            "collection_name": (
                self.settings.chroma_collection_name
            ),
            "total_chunks": self.collection.count(),
            "persist_directory": (
                self.settings.chroma_persist_directory
            )
        }

import asyncio
import logging
from pathlib import Path

from rag.pipeline import RAGPipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main():
    pipeline = RAGPipeline()

    raw_data_dir = Path("data/raw")
    pdf_files = list(raw_data_dir.glob("*.pdf"))

    logger.info(f"Found {len(pdf_files)} PDFs")

    for pdf in pdf_files:
        try:
            logger.info(f"Ingesting {pdf}")
            count = await pipeline.ingest_document(str(pdf))
            logger.info(f"Stored {count} chunks from {pdf}")
        except Exception as e:
            logger.error(f"Failed to ingest {pdf}: {e}")

    logger.info("Ingestion complete.")


if __name__ == "__main__":
    asyncio.run(main())
"""
Tests package for CropGuard AI.

Contains all unit and integration tests
for the backend application.

Test files:
    test_agent.py        — LangGraph agent tests
    test_rag.py          — RAG pipeline tests
    test_preprocessing.py — data pipeline tests

Evaluation:
    evaluation/retrieval_queries.py — RAG test queries

How to run all tests:
    cd backend
    pytest tests/ -v

How to run specific test file:
    pytest tests/test_agent.py -v

How to run with coverage report:
    pytest tests/ -v --cov=. --cov-report=html
"""
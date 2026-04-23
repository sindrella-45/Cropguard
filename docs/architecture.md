# CropGuard AI — System Architecture

## Overview

CropGuard AI is a full-stack AI-powered crop disease
detection assistant. Farmers upload a photo of an
affected leaf and receive an instant diagnosis with
treatment recommendations powered by a LangGraph
agent and RAG pipeline.

## System Components
```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│              Next.js + TypeScript                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Upload   │  │ Results  │  │    Dashboard     │  │
│  │ Page     │  │ Display  │  │    History       │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP REST API
                        ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND                          │
│                FastAPI + Python                     │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │           LangGraph Agent                    │   │
│  │                                              │   │
│  │  validate → memory → weather → vision        │   │
│  │      → RAG lookup → detect disease           │   │
│  │      → [healthy | diseased]                  │   │
│  │      → format → save                         │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   RAG    │  │   LLM    │  │    Auth +        │  │
│  │ Pipeline │  │ Factory  │  │    Plugins       │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│   Supabase   │ │  Redis   │ │  ChromaDB    │
│  PostgreSQL  │ │  Cache   │ │  Vector DB   │
│  Auth        │ │  Memory  │ │  RAG Store   │
│  Storage     │ │          │ │              │
└──────────────┘ └──────────┘ └──────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │   External APIs  │
              │  OpenAI GPT-4o   │
              │  OpenWeatherMap  │
              │  LangSmith       │
              └──────────────────┘
```

## Technology Decisions

### Frontend — Next.js + TypeScript
Next.js was chosen over plain React because it
provides built-in routing for the Home, Dashboard
and Login pages without extra libraries. TypeScript
adds type safety that catches errors before runtime
and pairs naturally with Pydantic on the backend.

### Backend — FastAPI + Python
FastAPI was chosen over Flask because it integrates
natively with Pydantic models used throughout the
project. It also supports async API calls which is
critical for non-blocking OpenAI calls that take
3-10 seconds. The auto-generated /docs page provides
free API documentation.

### Agent Framework — LangGraph
LangGraph was chosen because it allows the agent
to make real decisions through conditional edges.
The main decision — routing healthy plants to
prevention tips and diseased plants to treatments
— is what makes this a true agent rather than
a simple API call chain.

### Primary LLM — GPT-4o
GPT-4o was chosen as the primary model because it
has the best multimodal performance for plant disease
image analysis. It can identify subtle colour changes,
lesion patterns and texture changes that indicate
specific diseases.

### Vector Database — ChromaDB
ChromaDB was chosen for RAG because it runs locally
with no external service needed, has persistent
storage on disk and a simple Python API. It is
perfectly sized for this project's knowledge base.

### Permanent Storage — Supabase
Supabase was chosen because it provides PostgreSQL
database, authentication and file storage in one
platform. This replaces three separate services
that would otherwise need individual setup.

### Session Memory — Redis
Redis was chosen for short-term memory because it
is an in-memory store with automatic key expiry.
Session data expires after one hour automatically
without any manual cleanup code needed.

### Prompt Management — Jinja2
Jinja2 templates were chosen to keep all prompts
completely separate from application code. This
means prompts can be updated and tuned without
touching any Python or TypeScript files.

### Data Validation — Pydantic
Pydantic was used throughout the backend because
it validates data at every boundary — API requests,
agent state, LLM responses and database records.
This prevents invalid data from propagating through
the system silently.
# LangSmith Observability

## Overview

CropGuard AI uses LangSmith to trace and monitor
every LangGraph agent run in production.

Implements Hard Optional Task #2:
'Add one of these LLM observability tools'

## What Is LangSmith

LangSmith is an observability platform built by
the LangChain team. It automatically traces every
LangGraph node execution and LLM call, providing
full visibility into what the agent is doing.

## What Gets Traced

Every agent run creates a trace showing:
```
Run: analyze_leaf                    Total: 8.2s
├── validate_input        0.01s
├── load_memory           0.12s
├── fetch_weather         0.45s
├── analyze_image         3.21s    450 tokens
├── lookup_disease        0.89s
├── detect_disease        2.14s    380 tokens
├── treatment_path        1.92s    410 tokens
├── format_response       0.01s
└── save_memory           0.18s
```

## Setup Steps

1. Go to smith.langchain.com
2. Create a free account
3. Create a project called "cropguard-ai"
4. Copy your API key
5. Add to backend/.env:
```
LANGSMITH_API_KEY=your_key_here
LANGSMITH_PROJECT=cropguard-ai
```
6. Restart the server

LangSmith is optional. The app works perfectly
without it. Tracing is simply disabled if the
API key is not configured.

## What To Monitor

Key metrics to watch in LangSmith:

| Metric | What It Tells You |
|--------|-------------------|
| Total latency | How long diagnosis takes |
| Vision node latency | GPT-4o image analysis time |
| RAG retrieval count | How many chunks retrieved |
| Token usage per node | Which nodes cost most |
| Error rate | Which nodes fail most |
| Confidence scores | RAG quality over time |

## Accessing Traces

View all traces at:
https://smith.langchain.com/projects/cropguard-ai
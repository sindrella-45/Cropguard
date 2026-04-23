# 🌿 CropGuard AI — Crop Disease Detection Assistant

![CropGuard AI](https://img.shields.io/badge/CropGuard-AI-6AAB35?style=for-the-badge&logo=leaf)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js)
![LangGraph](https://img.shields.io/badge/LangGraph-Agent-FF6B6B?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi)

---

## 🎯 Agent Purpose

### What Is CropGuard AI
CropGuard AI is an AI-powered crop disease detection
assistant that helps farmers identify plant diseases
early through photo analysis. Farmers upload a photo
of an affected leaf and receive an instant diagnosis
with treatment recommendations and prevention tips.

### Why This Agent Is Useful
Early disease detection saves harvests. In Uganda
and East Africa, crop diseases cause significant
yield losses every season. Most smallholder farmers
cannot afford to consult agronomists regularly and
often apply the wrong treatments because they cannot
identify diseases accurately.

CropGuard AI gives every farmer access to expert
agricultural knowledge instantly and for free.

### Target Users
- Smallholder farmers in Uganda and East Africa
- Home gardeners growing food crops
- Agricultural extension workers
- Agronomists and plant health professionals

---

## ✨ Features

### Core Features
- 📸 Leaf photo upload with drag and drop
- 🔬 AI disease detection using GPT-4o vision
- 💊 Treatment recommendations (immediate, organic,
  chemical, preventive)
- 🛡️ Prevention tips for healthy plants
- 📚 RAG-powered knowledge base from verified
  agricultural documents
- 🌤️ Weather data enrichment for contextual diagnosis
- 📋 Source attribution showing which documents
  were used

### Optional Features Implemented
— ChatGPT critique (see docs/chatgpt_critique.md)
— Agent personality (friendly, formal, concise)
— LLM selector (GPT-4o, Claude, Gemini)
— OpenAI settings sliders
— Interactive help chatbot
— Token usage and cost tracking
— Retry logic for API calls
— Short and long term memory
— External weather API tool
— User authentication
— Feedback loop with star ratings
— Plugin system
— Multi-model support
— Agentic RAG pipeline
— LangSmith observability
— Agent learns from feedback
— External data source integration

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js + TypeScript | Built-in routing, type safety |
| Backend | FastAPI + Python | Native Pydantic, async support |
| Agent | LangGraph | Conditional edges for decisions |
| Primary LLM | GPT-4o | Best multimodal performance |
| RAG | ChromaDB | Local persistent vector store |
| Embeddings | text-embedding-3-small | Best agricultural text match |
| Permanent DB | Supabase PostgreSQL | Users, history, feedback |
| Session Memory | Redis | Fast temporary session storage |
| Auth | Supabase Auth | JWT tokens out of the box |
| Prompts | Jinja2 templates | Separate prompts from code |
| Validation | Pydantic | Type safety throughout |
| Observability | LangSmith | Agent tracing and monitoring |
| Styling | Tailwind CSS | Utility-first styling |

---

## 📁 Project Structure
```
cropguard/
├── frontend/                    Next.js TypeScript app
│   └── src/
│       ├── app/                 Pages
│       ├── components/          UI components
│       └── services/api.ts      Backend API calls
│
├── backend/
│   ├── agent/                   LangGraph workflow
│   ├── models/                  Pydantic data models
│   ├── config/                  Settings + personality
│   ├── prompts/                 Jinja2 prompt templates
│   ├── rag/                     RAG pipeline
│   ├── llm/                     LLM clients + factory
│   ├── tools/                   Agent tools
│   ├── memory/                  Short + long term memory
│   ├── database/                Supabase + Redis clients
│   ├── auth/                    Authentication
│   ├── routes/                  API endpoints
│   ├── plugins/                 Plugin system
│   ├── observability/           LangSmith setup
│   ├── utils/                   Helper functions
│   ├── scripts/                 Data ingestion scripts
│   ├── tests/                   Test suite
│   ├── data/raw/                PDF source documents
│   └── app.py                   FastAPI entry point
│
└── docs/                        Documentation
```

---

## 🚀 How To Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- Redis server
- OpenAI API key
- Supabase account (free tier)

### Step 1 — Clone The Repository
```bash
git clone https://github.com/yourusername/cropguard.git
cd cropguard
```

### Step 2 — Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Fill in your API keys in .env
```

### Step 3 — Configure Environment Variables
Open `backend/.env` and fill in:
```
OPENAI_API_KEY=your_openai_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
REDIS_URL=redis://localhost:6379
```

Optional:
```
LANGSMITH_API_KEY=your_langsmith_key_here
WEATHER_API_KEY=your_openweathermap_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
GEMINI_API_KEY=your_gemini_key_here
```

### Step 4 — Set Up Supabase Database
1. Go to supabase.com and create a project
2. Open the SQL Editor
3. Copy and run the SQL from:
   `backend/database/supabase_client.py`
   (find the SCHEMA_SQL variable)

### Step 5 — Set Up Disease Knowledge Base
```bash
# Download PDF documents and place in:
# backend/data/raw/
#
# Recommended sources:
# CABI:  https://www.cabi.org/cpc/
# FAO:   https://www.fao.org/plant-health/en/

# Run ingestion script
python scripts/ingest_data.py
```

### Step 6 — Start Redis
```bash
# Mac/Linux
redis-server

# Windows (if Redis installed)
redis-server
```

### Step 7 — Start Backend
```bash
# Make sure you are in backend/ with venv activated
uvicorn app:app --reload --port 8000
```

Backend running at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Step 8 — Frontend Setup
```bash
# Open new terminal
cd frontend
npm install
npm run dev
```

Frontend running at: http://localhost:3000

### Step 9 — Open The App
Go to http://localhost:3000 in your browser.

---

## 📖 Example Use Cases

### Use Case 1 — Diagnosing a Diseased Tomato
```
1. Farmer notices yellow-brown spots on tomato leaves
2. Opens CropGuard AI on phone or computer
3. Takes clear photo of affected leaf
4. Uploads photo and selects "Friendly" personality
5. Clicks Analyze Leaf

Result:
  Plant: Tomato
  Disease: Early Blight (Alternaria solani)
  Severity: Moderate
  Urgency: High

  Treatments:
  ⚡ Immediate: Remove all affected leaves today
  🌿 Organic: Apply neem oil spray every 3 days
  🧪 Chemical: Copper-based fungicide weekly
  🛡️ Preventive: Improve air circulation

  Sources: CABI Crop Protection Compendium (87% match)
```

### Use Case 2 — Checking a Healthy Plant
```
1. Farmer wants to verify their maize is healthy
2. Uploads photo of green maize leaf
3. Agent analyzes and confirms healthy status

Result:
  Plant: Maize
  Status: Healthy ✅
  Confidence: 94%

  Prevention Tips:
  ✓ Monitor for Maize Streak Virus weekly
  ✓ Ensure adequate spacing for air flow
  ✓ Rotate crops next season
```

### Use Case 3 — Tracking Disease History
```
1. Farmer logs in to their account
2. Opens Dashboard → Diagnosis History
3. Sees tomato early blight diagnosed 3 times
4. Recognises recurring seasonal pattern
5. Plans preventive treatment before next season
```

### Use Case 4 — Using Formal Mode For Expert
```
1. Agricultural extension worker uploads leaf
2. Selects "Formal" personality mode
3. Receives technical diagnosis with:
   - Scientific disease name
   - Precise fungicide concentrations
   - Application intervals
   - Research-backed treatment protocols
```

---

## 🧠 LangGraph Agent Workflow
```
Farmer uploads leaf photo
          ↓
    [validate_input]
    Check image is valid
          ↓
    [load_memory]
    Load past diagnoses from Supabase
    Load session context from Redis
          ↓
    [fetch_weather]
    Get current weather conditions
          ↓
    [analyze_image]
    GPT-4o examines leaf photo
    Describes visible symptoms
          ↓
    [lookup_disease]
    Search ChromaDB knowledge base
    Retrieve relevant disease chunks
          ↓ (conditional edge)
    ┌─────┴─────┐
fallback    [detect_disease]
    ↓       Identify disease from
  END       image + RAG context
                  ↓ (conditional edge)
            ┌─────┴─────┐
        healthy      diseased
            ↓            ↓
    [healthy_path] [treatment_path]
    Prevention     Treatments
    tips           recommended
            ↓            ↓
            └─────┬─────┘
          [format_response]
          Assemble final output
          Separate context from answer
                  ↓
           [save_memory]
           Save to Supabase
           Update Redis session
                  ↓
                 END
```

---

## 🗄️ Database Schema

### Supabase Tables
```sql
users          id, email, full_name, created_at
diagnoses      id, user_id, plant, disease, severity,
               confidence, treatments, sources, cost
feedback       id, diagnosis_id, rating, comment,
               was_accurate
token_usage    id, user_id, tokens_used, cost_usd,
               model_used
```

### Redis Keys
```
session:{id}       Current diagnosis context
history:{id}       Conversation history
user_session:{id}  User to session mapping
plugins:{id}       User plugin settings
```

### ChromaDB Collection
```
crop_diseases      All disease knowledge chunks
                   from verified PDF documents
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server health check |
| POST | /auth/signup | Create farmer account |
| POST | /auth/login | Login and get JWT |
| POST | /auth/logout | Logout |
| GET | /auth/me | Get current farmer |
| POST | /analyze | Analyze leaf image |
| GET | /history | Get diagnosis history |
| GET | /history/{id} | Get single diagnosis |
| DELETE | /history/{id} | Delete diagnosis |
| POST | /feedback | Submit rating |
| GET | /feedback/summary | Get feedback stats |
| GET | /tokens/usage | Get token usage |
| GET | /tokens/models | Get available models |
| GET | /plugins | Get plugin states |
| POST | /plugins/{id}/toggle | Toggle plugin |

Full interactive documentation:
http://localhost:8000/docs

---

## 🧪 Running Tests
```bash
cd backend

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_agent.py -v

# Run with coverage report
pytest tests/ -v --cov=. --cov-report=html

# Run RAG evaluation
python scripts/evaluate_retrieval.py
```

---

## 📊 Technical Decisions Explained

### Why LangGraph Instead of Simple API Calls
LangGraph allows the agent to make real decisions
through conditional edges. The route between healthy
and diseased plants is what makes this a true agent.
A simple API call chain cannot branch based on results.

### Why RAG Instead of Just GPT-4o
GPT-4o alone may produce vague or outdated diagnoses.
RAG grounds every diagnosis in verified documents
from CABI and FAO. Source attribution builds farmer
trust and prevents hallucinated treatments.

### Why FastAPI Instead of Flask
FastAPI integrates natively with Pydantic models
used throughout the project. Async support handles
non-blocking OpenAI calls. Auto-generated /docs
provides free API documentation with zero effort.

### Why Jinja2 For Prompts
Separating prompts from code means prompts can be
tuned without touching Python files. This is a
professional pattern used in production AI systems
that makes the codebase significantly more maintainable.

### Why Two Databases For Memory
Redis handles fast temporary session data that
expires automatically. Supabase handles permanent
history that must survive server restarts. Each
database is used for exactly what it is best at.

### Why Pydantic Throughout
Every data boundary — API requests, agent state,
LLM responses and database records — is validated
by Pydantic. This prevents invalid data from
propagating silently through the system.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| docs/architecture.md | System design overview |
| docs/rag_pipeline.md | RAG preprocessing pipeline |
| docs/chromadb_schema.md | Vector store structure |
| docs/retrieval_evaluation.md | top_k testing results |
| docs/api_reference.md | All endpoints documented |
| docs/observability.md | LangSmith setup guide |
| docs/chatgpt_critique.md | External critique + responses |

---

## 🌍 Built For Uganda

CropGuard AI was designed specifically with
Ugandan and East African farmers in mind:

- Disease knowledge base includes regional crops
  such as matoke, cassava, maize and coffee
- Weather integration accounts for tropical climate
- Friendly personality mode uses accessible language
- Works on mobile devices with slow internet
- Free to use with no subscription required

---






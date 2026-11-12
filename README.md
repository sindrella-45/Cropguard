# CropGuard AI – Intelligent Crop Disease Diagnosis Assistant

CropGuard AI is an AI-powered crop disease diagnosis assistant designed to help farmers identify potential crop diseases and access relevant agricultural recommendations. It combines image analysis, Retrieval-Augmented Generation (RAG), and contextual information to provide informative responses to crop-related queries.

The application uses GPT-4o Vision to analyse uploaded crop images, while a knowledge retrieval system retrieves relevant agricultural information to support its responses.

## Key Features

- **AI-Powered Image Analysis:** Uses GPT-4o Vision to analyse uploaded crop images and identify visible signs of potential diseases.
- **Retrieval-Augmented Generation (RAG):** Retrieves relevant information from a crop disease knowledge base to support more context-aware responses.
- **Intelligent AI Workflow:** Uses LangGraph to coordinate the diagnosis and information retrieval process.
- **Agricultural Knowledge Retrieval:** Uses ChromaDB to store and retrieve relevant crop disease information through semantic search.
- **Weather Context:** Integrates weather information into the assistant's workflow to provide additional environmental context.
- **User Authentication:** Uses Supabase authentication to manage user access.
- **Diagnosis History:** Stores diagnosis records so users can refer to previous interactions.
- **Token Usage Tracking:** Tracks AI token usage through the application's backend.

## Technologies Used

| Category | Technologies |
|---|---|
| Backend | Python, FastAPI |
| Frontend | Next.js, TypeScript, Tailwind CSS |
| AI Model | OpenAI GPT-4o Vision |
| AI Orchestration | LangGraph |
| RAG Framework | LangChain |
| Vector Database | ChromaDB |
| Relational Database | PostgreSQL, Supabase |
| Embeddings | OpenAI `text-embedding-3-small` |
| Monitoring | LangSmith |

## How It Works

1. **Image Upload:** The user submits an image of a crop showing possible disease symptoms.
2. **Input Validation:** The backend validates the submitted information.
3. **Context Retrieval:** Relevant agricultural information is retrieved from the ChromaDB knowledge base.
4. **Image Analysis:** GPT-4o Vision analyses the uploaded image for visible symptoms.
5. **AI Processing:** LangGraph coordinates the diagnosis workflow and combines the relevant information.
6. **Response Generation:** The assistant generates an informative response with possible disease identification and relevant agricultural recommendations.
7. **Data Storage:** Diagnosis history and related user information are stored using Supabase.

## Knowledge Base

CropGuard AI uses agricultural reference documents covering crops including:

- Coffee
- Cocoa
- Cotton
- Sunflower
- Tea
- General crop disease information

The documents provide the knowledge used by the retrieval system to support its responses.

## Data Management

Supabase is used for authentication and relational data management. The application includes database structures for:

- User information
- Diagnosis history
- AI token usage

ChromaDB supports semantic retrieval from the agricultural knowledge base.

## Getting Started

### Prerequisites

Before running the application, ensure you have:

- Python installed
- Node.js and npm installed
- An OpenAI API key
- A Supabase project
- The required environment variables

### Installation

Clone the repository:

```bash
git clone https://github.com/sindrella-45/Cropguard.git
cd Cropguard
```

Install the backend dependencies using the package manager and instructions provided in the backend directory.

Install the frontend dependencies:

```bash
cd frontend
npm install
```

Configure the required environment variables for the backend and frontend before starting the application.

> **Note:** Refer to the respective backend and frontend directories for the exact startup commands and environment variable names.

## Project Objective

CropGuard AI explores how artificial intelligence, computer vision, and semantic information retrieval can be combined to make agricultural information more accessible.

The goal is to provide farmers with an accessible digital assistant that can help them understand visible crop symptoms and find relevant agricultural guidance.

## Disclaimer

CropGuard AI provides AI-generated suggestions for informational purposes. Its responses should not replace professional agricultural diagnosis or advice from qualified agricultural extension officers.

## Author

**Acen Sindrella**

Software & AI Engineering



---

*Built with a passion for AI, software engineering, and practical solutions for agriculture.*

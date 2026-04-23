"""
Agent package for CropGuard AI.

This package contains the complete LangGraph
agent that powers crop disease detection.

The agent is structured as a directed graph
where each node performs a specific task and
edges define the flow between nodes.

Agent workflow:
    [Start]
        ↓
    [Node 1: Validate Input]
        Checks image is valid before processing
        ↓
    [Node 2: Load Memory]
        Loads farmer's past diagnosis history
        ↓
    [Node 3: Fetch Weather]
        Gets current weather for context
        ↓
    [Node 4: Analyze Image]
        GPT-4o examines the leaf photo
        ↓
    [Node 5: Lookup Disease]
        Searches ChromaDB knowledge base
        ↓
    [Node 6: Detect Disease]
        Identifies disease from image + RAG
        ↓
    [Conditional Edge]
        ├── healthy  → [Node 7a: Healthy Path]
        └── diseased → [Node 7b: Treatment Path]
        ↓
    [Node 8: Format Response]
        Structures final output
        ↓
    [Node 9: Save Memory]
        Saves diagnosis to Supabase
        ↓
    [End]

Why LangGraph?
    LangGraph allows the agent to make decisions
    at the conditional edge — behaving differently
    for healthy vs diseased plants. This is what
    makes it a true agent rather than a simple
    API call chain.

Usage:
    from agent import run_agent
    
    result = await run_agent(
        image_data=base64_string,
        image_type="image/jpeg",
        plant_type="tomato",
        personality="friendly",
        selected_model="gpt-4o",
        user_id="user123",
        session_id="session456"
    )
"""

from .graph import run_agent

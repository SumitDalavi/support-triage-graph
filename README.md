# Customer Support Triage Graph

A stateful customer support ticket routing and escalation engine built with **TypeScript** and **LangGraph.js**.

## Overview
This system uses an LLM-based state machine to ingest customer support tickets, classify their intent (billing, tech, general), assess the user's sentiment, and route the ticket to the correct AI specialist agent.

If the classifier's confidence is low or the user is extremely angry, the ticket is conditionally routed to a human escalation queue instead of an AI agent.

## How it works
1. **Ticket In**: Raw customer message enters the graph.
2. **Classifier Node**: Analyzes intent, assigns confidence score, and determines sentiment using structured JSON output.
3. **Conditional Edge**: Routes to the appropriate specialist agent (`billing`, `tech`, `general`) or to `escalate`.
4. **Agent Nodes**: The selected agent handles the ticket based on its specific system prompt and capabilities.

## Setup & Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and add your OpenAI API key:
```bash
OPENAI_API_KEY=sk-...
```

### 3. Run the Graph
```bash
npm run dev
```

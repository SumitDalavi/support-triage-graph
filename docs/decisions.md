# Decisions

## ADR-001: LangGraph vs Standard LangChain Agents
**Date:** 2026-08-29  
**Status:** Accepted

**Context:**  
Support triage requires deterministic routing (e.g., highly angry customers MUST go to human escalation) combined with non-deterministic LLM classification.

**Decision:**  
We use LangGraph to model the workflow as a state machine.

**Consequences:**  
- ✅ We have absolute control over the graph edges and state transitions.
- ✅ We can persist state (SQLite) across human-in-the-loop steps.
- ⚠️ Adds complexity compared to a simple zero-shot ReAct agent.

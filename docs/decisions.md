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

## ADR-002: Progressive Credential Loading (PCL) Architecture
- **Context:** Production hardening required live backends (PostgreSQL, Redis, OpenAI, Anthropic), but removing mocks would break CI pipelines and create high developer onboarding friction.
- **Decision:** Implement Progressive Credential Loading. Keep in-memory and local mock heuristics as the default safe baseline, while wrapping external integrations in auto-promoting factory adapters triggered by environment variables.
- **Consequences:** 
  - *Pros:* 100% CI pass rate without requiring external secrets; zero setup friction for new contributors; progressive upgrade to production clusters.
  - *Cons:* Adds lightweight factory abstraction layers and runtime credential detection logic.

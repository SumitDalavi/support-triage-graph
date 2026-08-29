# Runbook — support-triage-graph
> Last updated: 2026-08-29

## Quick Start
```bash
npm install
npm run dev
```

## Run Tests
```bash
npm test
bash tests/e2e/test_sandbox_provider.sh
```

## Environment Variables
| Variable | Default | Purpose |
|---|---|---|
| OPENAI_API_KEY | - | For real LLM inferences |

## Common Failure Modes
| Symptom | Cause | Fix |
|---|---|---|
| `Cannot read property 'messages'` | State missing | Ensure graph initial state is populated |

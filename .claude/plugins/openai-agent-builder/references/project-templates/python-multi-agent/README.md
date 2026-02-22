# {{PROJECT_NAME}}

Multi-agent orchestrator with handoffs between specialist agents.

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python main.py`

## Structure

- `main.py` — Entry point with conversation loop
- `triage.py` — Triage agent that routes to specialists
- `specialists/` — Specialist agent definitions
  - `specialist_1.py` — First specialist
  - `specialist_2.py` — Second specialist
- `tools.py` — Shared tool definitions

## How Handoffs Work

The triage agent analyzes user requests and routes them to the most appropriate specialist.
Each specialist has a `handoff_description` that the triage agent uses for routing decisions.
Conversations maintain context across handoffs.

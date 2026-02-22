# {{PROJECT_NAME}}

Multi-agent orchestrator with handoffs between specialist agents.

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key
2. Install dependencies: `npm install`
3. Run: `npm start`

## Structure

- `src/index.ts` — Entry point with conversation loop
- `src/triage.ts` — Triage agent that routes to specialists via handoffs
- `src/specialists/` — Specialist agent definitions
  - `specialist1.ts` — First specialist
  - `specialist2.ts` — Second specialist
- `src/tools.ts` — Shared tool definitions
- `src/schemas.ts` — Reusable Zod v4 schemas

## How Handoffs Work

The triage agent analyzes user requests and routes them to the most appropriate specialist.
Each handoff has a description that the triage agent uses for routing decisions.
Conversations maintain context across handoffs.

## Requirements

- Node.js 18+
- Zod v4 (required by @openai/agents)

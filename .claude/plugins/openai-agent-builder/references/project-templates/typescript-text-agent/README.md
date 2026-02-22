# {{PROJECT_NAME}}

{{AGENT_INSTRUCTIONS}}

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key
2. Install dependencies: `npm install`
3. Run: `npm start`

## Structure

- `src/index.ts` — Entry point with conversation loop
- `src/agent.ts` — Agent definition (name, instructions, tools, model)
- `src/tools.ts` — Tool definitions with Zod v4 schemas
- `src/schemas.ts` — Reusable Zod v4 schemas for tool parameters
- `src/guardrails.ts` — Input/output guardrail definitions (optional)

## Requirements

- Node.js 18+
- Zod v4 (required by @openai/agents)

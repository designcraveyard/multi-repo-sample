# {{PROJECT_NAME}}

{{AGENT_INSTRUCTIONS}}

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key
2. Install dependencies: `npm install`
3. Run: `npm start`

## Structure

- `src/index.ts` — Entry point with session lifecycle
- `src/agent.ts` — RealtimeAgent definition
- `src/realtime.ts` — RealtimeSession setup with event handlers
- `src/tools.ts` — Tool definitions (execute in same environment as session)
- `src/schemas.ts` — Reusable Zod v4 schemas

## Voice Mode

Uses OpenAI RealtimeAgent with direct Realtime API connection via WebSocket.
Audio handling depends on your platform (Node.js server, browser, etc.).

---
name: new-chatkit-agent
description: Scaffold an agent with a branded ChatKit embedded UI (React frontend + agent backend)
---

# New ChatKit Agent

Scaffold a complete ChatKit agent project. Creates a monorepo with a React frontend (using OpenAI ChatKit) and an agent backend. Supports three tiers from simple embed to fully self-hosted.

## Instructions

Walk through these steps interactively with the user using AskUserQuestion.

### Step 1: Backend Language

Ask: **"Backend language?"**

Options:
- **Python** — FastAPI backend with `openai` SDK for session creation
- **TypeScript** — Express backend with `openai` SDK for session creation

Note: The frontend is **always React/TypeScript** (ChatKit is React-only). Python choice only affects the backend.

### Step 2: Project Name

Ask: **"Project name?"** (kebab-case, becomes the directory name)

Validate: must be kebab-case (`[a-z0-9-]+`), no spaces.

### Step 3: ChatKit Tier

Ask: **"ChatKit tier?"**

Options:
- **Basic** — React app + ChatKit embed + theming. Simplest setup, uses OpenAI-hosted backend.
- **Custom** — Basic + custom widget nodes + action handlers. For custom UI elements in chat responses.
- **Full** — Custom + self-hosted backend with auth middleware, rate limiting, and server-side action processing. For production deployments.

### Step 4: Theme

Ask: **"Theme config?"**

Sub-questions:
- **Color scheme?** — `light`, `dark`, or `system` (default: `system`)
- **Accent color?** — `iris`, `jade`, `ruby`, `amber`, `cyan`, `orange`, `pink`, `plum`, `teal` (default: `iris`)
- **Border radius?** — `none`, `small`, `medium`, `large`, `full` (default: `medium`)

### Step 5: Agent Purpose

Ask: **"What does this agent do?"** (free text)

This becomes the agent's system instructions configured on the backend.

### Step 6: Tools

Ask: **"Which tools does this agent need?"** (multi-select)

Options:
- Web search
- File search
- Custom functions
- MCP servers

Default: Custom functions only.

## Scaffolding

After collecting all answers:

1. **Read the reference docs:**
   - `${CLAUDE_PLUGIN_ROOT}/references/chatkit-patterns.md`
   - `${CLAUDE_PLUGIN_ROOT}/references/typescript-agents-sdk.md` (TS backend) or `python-agents-sdk.md` (Python backend)

2. **Query Context7** for the latest ChatKit patterns:
   - Resolve library ID for `openai/chatkit-js`
   - Query docs for "ChatKit useChatKit getClientSecret theme widgets" patterns

3. **Copy the project template** based on tier:
   - Basic: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/typescript-chatkit-basic/`
   - Custom: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/typescript-chatkit-custom/`
   - Full: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/typescript-chatkit-full/`

4. **Replace all `{{PLACEHOLDERS}}`** with user answers:
   - `{{PROJECT_NAME}}` → project name
   - `{{AGENT_INSTRUCTIONS}}` → agent purpose
   - `{{THEME_COLOR_SCHEME}}` → selected color scheme
   - `{{THEME_COLOR}}` → selected accent color
   - `{{THEME_RADIUS}}` → selected border radius
   - `{{MODEL}}` → `gpt-4.1` (default)
   - `{{CORS_ORIGIN}}` → `http://localhost:5173` (Vite dev default)

5. **Customize based on answers:**
   - If **Python backend**: replace the TypeScript `backend/` with a Python FastAPI backend:
     - `backend/main.py` — FastAPI app with CORS and `/api/chatkit/session` endpoint
     - `backend/requirements.txt` — `fastapi`, `uvicorn`, `openai`, `python-dotenv`
     - Update README with Python backend instructions
   - If **Custom or Full tier**: ensure widgets directory and action handlers are included
   - If **Full tier**: ensure middleware and chatkit-server files are included
   - Add **tool definitions** to the backend agent configuration

6. **Install dependencies** (offer to run):
   - Frontend: `cd frontend && npm install`
   - Backend (TS): `cd backend && npm install`
   - Backend (Python): `cd backend && pip install -r requirements.txt`

7. **Print summary** showing monorepo structure.

## Post-Scaffold

After scaffolding, automatically trigger the `agent-code-reviewer` subagent to review the generated code.

## ChatKit Notes

- **ChatKit is React/TypeScript only** — even with a Python backend, the frontend is always React
- The **client secret** is fetched from the backend (`/api/chatkit/session`). Never hardcode it in the frontend.
- The **Vite dev server** proxies `/api` requests to the backend (port 3001) — no CORS issues in dev
- For **production**, configure `{{CORS_ORIGIN}}` to your actual frontend domain
- **Custom widgets** receive `data` props from agent responses and `onAction` for triggering actions
- **Full tier** adds auth middleware that skips in development but enforces Bearer tokens in production

## Running the Project

```
# Terminal 1: Start backend
cd backend
npm run dev     # or: uvicorn main:app --reload (Python)

# Terminal 2: Start frontend
cd frontend
npm run dev     # Opens at http://localhost:5173
```

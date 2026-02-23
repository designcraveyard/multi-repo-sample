# OpenAI Agent Builder Plugin — Design Document

**Date:** 2026-02-22
**Status:** Approved
**Author:** Abhishek Verma + Claude

## Problem Statement

Building OpenAI agents requires repeated scaffolding of project structure, SDK wiring, tool definitions, guardrails, tracing, and UI integration. Each agent type (text, voice, multi-agent, ChatKit) has distinct patterns and dependencies. A Claude Code plugin can automate this scaffolding and enforce best practices.

## Audience

- **Primary:** Personal productivity — rapidly scaffold and iterate on OpenAI agent projects
- **Secondary:** Team/agency tooling — reusable kit for spinning up client agent projects

## Scope

- **In scope:** Project scaffolding, code generation, guard hooks, code review agents, bundled reference docs
- **Out of scope:** Deployment configs, CI/CD, OpenAI Agent Builder (hosted) integration, billing/cost management

## Architecture: Approach B — Skill-Per-Agent-Type

Separate focused skills for each agent type, with shared reference files and guard hooks.

### Plugin Structure

```
.claude/plugins/openai-agent-builder/
├── plugin.json                          # Plugin manifest
├── skills/
│   ├── new-text-agent/SKILL.md          # /new-text-agent
│   ├── new-voice-agent/SKILL.md         # /new-voice-agent
│   ├── new-multi-agent/SKILL.md         # /new-multi-agent
│   ├── new-chatkit-agent/SKILL.md       # /new-chatkit-agent
│   └── agent-help/SKILL.md             # /agent-help (discovery)
├── agents/
│   ├── agent-code-reviewer.md           # Reviews generated agent code
│   └── agent-security-checker.md        # Checks for key leaks, missing guardrails
├── hooks/
│   └── (defined in plugin.json)         # Guard hooks
└── references/
    ├── python-agents-sdk.md             # Curated Python SDK patterns
    ├── typescript-agents-sdk.md         # Curated TS SDK patterns
    ├── chatkit-patterns.md              # ChatKit embed/theme/widget patterns
    ├── voice-patterns.md                # VoicePipeline (Py) + RealtimeAgent (TS)
    ├── guardrails-patterns.md           # Input/output guardrail examples
    └── project-templates/
        ├── python-text-agent/           # Template: Python text agent
        ├── python-voice-agent/          # Template: Python voice agent
        ├── python-multi-agent/          # Template: Python multi-agent
        ├── typescript-text-agent/       # Template: TS text agent
        ├── typescript-voice-agent/      # Template: TS voice agent
        ├── typescript-multi-agent/      # Template: TS multi-agent
        ├── typescript-chatkit-basic/    # Template: ChatKit basic embed
        ├── typescript-chatkit-custom/   # Template: ChatKit custom widgets
        └── typescript-chatkit-full/     # Template: ChatKit self-hosted backend
```

## Skills Design

### `/new-text-agent` — Standard Chat Agent

**Interactive flow:**
1. **Language?** — Python or TypeScript
2. **Project name?** — kebab-case, becomes directory name
3. **What does this agent do?** — free text, becomes system instructions
4. **Tools needed?** — web search, file search, code interpreter, custom functions, MCP servers
5. **Include guardrails?** — yes/no (scaffolds input/output guardrails if yes)
6. **Include tracing?** — yes/no (wires up OpenAI tracing or custom spans)

**Scaffolded output (Python):**
```
<project-name>/
├── .env.example          # OPENAI_API_KEY=your-key-here
├── .gitignore
├── README.md
├── requirements.txt      # openai-agents>=0.9.0
├── main.py               # Entry point with Runner.run()
├── agent.py              # Agent definition (instructions, tools, guardrails)
├── tools.py              # Tool function definitions
└── guardrails.py         # Input/output guardrail classes (if selected)
```

**Scaffolded output (TypeScript):**
```
<project-name>/
├── .env.example
├── .gitignore
├── README.md
├── package.json          # @openai/agents, zod@^4
├── tsconfig.json
├── src/
│   ├── index.ts          # Entry point with run()
│   ├── agent.ts          # Agent definition
│   ├── tools.ts          # Tool definitions with Zod schemas
│   ├── schemas.ts        # Zod v4 schemas for tool params
│   └── guardrails.ts     # Guardrail definitions (if selected)
```

### `/new-voice-agent` — Voice Agent

**Interactive flow:**
1. **Language?** — Python or TypeScript
2. **Project name?**
3. **Voice mode?**
   - Python: `VoicePipeline` (mic → STT → agent → TTS) or `RealtimeAgent` (direct Realtime API)
   - TypeScript: `RealtimeAgent` client-side or server-side
4. **Voice config** — voice preset, language, interruption handling
5. **Tools?** — same options as text agent

**Additional scaffolding:** Audio handling utilities, WebSocket/WebRTC setup for RealtimeAgent, voice-specific config file.

### `/new-multi-agent` — Multi-Agent Orchestrator

**Interactive flow:**
1. **Language?** — Python or TypeScript
2. **Project name?**
3. **Specialist agents?** — count (2-5), names + descriptions for each
4. **Handoff strategy?** — triage → specialists (fan-out) or chain/pipeline (sequential)
5. **Shared session memory?** — yes/no

**Scaffolded output:** Triage/orchestrator agent file + N specialist agent files + handoff definitions + shared session context patterns.

### `/new-chatkit-agent` — ChatKit Embedded UI

**Interactive flow:**
1. **Backend language?** — Python or TypeScript (the agent backend)
2. **Project name?**
3. **ChatKit tier?**
   - **Basic:** React app + ChatKit embed + theme config
   - **Custom:** + custom widget nodes, action handlers, tool result rendering
   - **Full:** + self-hosted ChatKit backend, custom message handler, middleware
4. **Theme?** — brand colors, font, dark mode toggle
5. **Agent config** — instructions, tools (same as text agent)

**Scaffolded output:** Monorepo with `frontend/` (React + ChatKit) and `backend/` (agent), connected via API endpoint.

**ChatKit is TypeScript/React only** — Python agents use a Python backend with a TS/React ChatKit frontend.

### `/agent-help` — Discovery Skill

Non-interactive reference card listing all available skills with descriptions.

## Hooks (Guard Rails)

All hooks fire on `PreToolUse` or `PostToolUse` for `Write|Edit` operations.

### Hook 1: `api-key-guard` (PreToolUse — BLOCKS)
- **Detects:** Hardcoded API keys (`sk-...`, `OPENAI_API_KEY = "actual-key"`) in source files
- **Allows:** `.env.example` files with placeholder values, `.env` files
- **Message:** "Use .env and os.getenv() / process.env instead of hardcoding API keys"

### Hook 2: `agent-error-handling` (PreToolUse — WARNS)
- **Detects:** `Runner.run()` / `agent.run()` calls without try/catch or `.catch()`
- **Detects:** Missing `on_error` callbacks in voice pipelines
- **Message:** "Agent runs can fail — wrap in try/except or .catch() for production safety"

### Hook 3: `tracing-reminder` (PostToolUse — REMINDS)
- **Detects:** New agent files without tracing imports
- **Message:** "Consider adding tracing for debugging: `from agents import trace` (Python) or tracing config (TS)"

### Hook 4: `guardrails-reminder` (PostToolUse — REMINDS)
- **Detects:** Agent definitions without `input_guardrails` / `output_guardrails`
- **Message:** "Consider adding guardrails for production safety"

### Hook 5: `zod-v4-check` (PreToolUse — BLOCKS)
- **Detects:** TypeScript agent files importing Zod v3 patterns without v4
- **Message:** "OpenAI Agents SDK TypeScript requires Zod v4 — use `zod@^4`"

## Subagents

### `agent-code-reviewer`
- **Triggered:** After any `/new-*-agent` skill completes, or on demand
- **Reviews:** Async/await patterns, correct SDK imports, session management, tool schema correctness, deprecated patterns, missing types/docstrings
- **Returns:** Summary with issues + suggested fixes

### `agent-security-checker`
- **Triggered:** On demand or before deployment discussions
- **Scans:** Hardcoded secrets, missing `.gitignore` for `.env`, exposed endpoints, guardrail coverage, input sanitization, CORS config (ChatKit), WebSocket auth (voice)
- **Returns:** Security report with severity levels

## Reference Docs Strategy

**Bundled docs** (~200-400 lines each): Curated SDK patterns, import paths, common pitfalls, working code snippets. Updated manually when SDK versions change.

**Live docs via Context7:** Skills also query Context7 MCP at generation time for `openai-agents-python` and `openai-agents-js` to pick up latest API changes and patterns not yet in bundled docs.

**Project templates:** Actual starter files in `references/project-templates/` that get copied (not AI-generated) into the target directory — ensures consistency and correctness.

## Key Design Decisions

1. **Skill-per-type over single wizard** — each agent type has fundamentally different deps, files, and patterns. Focused skills are easier to maintain.
2. **Always-ask language** — no default language assumption. Teams vary.
3. **Local-only hosting** — deployment is out of scope. Keeps the plugin focused.
4. **ChatKit is TS-only for frontend** — even with Python backends, the embedded UI is React. This matches ChatKit's SDK.
5. **Copy-based scaffolding** — template files are copied, not generated. Skills customize them after copying (fill in agent name, instructions, tools).
6. **Hooks warn, don't block (mostly)** — only API key leaks and Zod v3 are hard blocks. Everything else is a helpful reminder.

## Success Criteria

- Scaffold any agent type in < 2 minutes
- Generated code runs without modification (just add API key to `.env`)
- Hooks catch the top 5 agent development mistakes
- Reference docs cover 90% of common patterns without needing to leave Claude Code

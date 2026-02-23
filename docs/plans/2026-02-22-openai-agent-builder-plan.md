# OpenAI Agent Builder Plugin — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Claude Code plugin that scaffolds OpenAI agent projects (text, voice, multi-agent, ChatKit) with guard hooks, code review agents, and bundled SDK reference docs.

**Architecture:** Skill-per-agent-type approach. 5 skills (`/new-text-agent`, `/new-voice-agent`, `/new-multi-agent`, `/new-chatkit-agent`, `/agent-help`), 2 subagents, 5 hooks, 5 reference docs, and 9 project templates. Plugin lives at `.claude/plugins/openai-agent-builder/`.

**Tech Stack:** Claude Code Plugin SDK (plugin.json, SKILL.md, agent .md), Python (openai-agents >=0.9.0), TypeScript (@openai/agents, zod v4), React (@openai/chatkit-react), Context7 MCP for live docs.

**Design doc:** `docs/plans/2026-02-22-openai-agent-builder-design.md`

---

## Phase 1: Plugin Foundation (Tasks 1-2)

### Task 1: Create plugin.json manifest

**Files:**
- Create: `.claude/plugins/openai-agent-builder/plugin.json`

**Step 1: Create the plugin directory structure**

```bash
mkdir -p .claude/plugins/openai-agent-builder/{skills/{new-text-agent,new-voice-agent,new-multi-agent,new-chatkit-agent,agent-help},agents,references/project-templates}
```

**Step 2: Write plugin.json**

```json
{
  "name": "openai-agent-builder",
  "version": "1.0.0",
  "description": "Scaffold OpenAI agent projects (text, voice, multi-agent, ChatKit) with guard hooks and best practices",
  "skills": "skills/",
  "agents": "agents/",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/api-key-guard.py"
          },
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/agent-error-handling.py"
          },
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/zod-v4-check.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/tracing-reminder.py"
          },
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/guardrails-reminder.py"
          }
        ]
      }
    ]
  }
}
```

**Step 3: Verify structure**

```bash
ls -R .claude/plugins/openai-agent-builder/
```

Expected: directory tree matching the plugin structure from the design doc.

**Step 4: Commit**

```bash
git add .claude/plugins/openai-agent-builder/plugin.json
git commit -m "feat(plugin): scaffold openai-agent-builder plugin manifest"
```

---

### Task 2: Create /agent-help discovery skill

**Files:**
- Create: `.claude/plugins/openai-agent-builder/skills/agent-help/SKILL.md`

**Step 1: Write the skill**

```markdown
---
name: agent-help
description: Show available OpenAI Agent Builder skills and what they do
---

# OpenAI Agent Builder — Quick Reference

Print this reference card to the user:

## Available Skills

| Skill | What it does |
|-------|-------------|
| `/new-text-agent` | Scaffold a standard chat agent with tools, guardrails, sessions, tracing |
| `/new-voice-agent` | Scaffold a voice agent — VoicePipeline (Python) or RealtimeAgent (TypeScript) |
| `/new-multi-agent` | Scaffold a multi-agent orchestrator with handoffs between specialist agents |
| `/new-chatkit-agent` | Scaffold an agent with a branded ChatKit embedded UI (React) |
| `/agent-help` | This reference card |

## Language Support

All skills ask **Python or TypeScript** per project. Both use the official OpenAI Agents SDK.

| Feature | Python (`openai-agents`) | TypeScript (`@openai/agents`) |
|---------|-------------------------|-------------------------------|
| Text agents | Runner.run() | run() |
| Voice | VoicePipeline (STT→Agent→TTS) | RealtimeAgent (Realtime API) |
| Multi-agent | Agent handoffs | Agent handoffs |
| ChatKit | Python backend + React frontend | Full-stack TypeScript |
| Guardrails | @input_guardrail / @output_guardrail | inputGuardrails / outputGuardrails |
| Tracing | Built-in + custom spans | Built-in + custom spans |

## Guard Hooks (automatic)

These fire automatically when writing agent code:

- **api-key-guard** — BLOCKS hardcoded API keys in source files
- **zod-v4-check** — BLOCKS Zod v3 imports in TS agent files
- **agent-error-handling** — WARNS about missing try/catch on agent runs
- **tracing-reminder** — Reminds to set up tracing on new agent files
- **guardrails-reminder** — Reminds to add guardrails for production safety

## Subagents (on demand)

- **agent-code-reviewer** — Reviews agent code for SDK best practices
- **agent-security-checker** — Scans for security issues (key leaks, missing auth, CORS)
```

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/skills/agent-help/SKILL.md
git commit -m "feat(plugin): add /agent-help discovery skill"
```

---

## Phase 2: Reference Docs (Tasks 3-7)

These are curated SDK pattern docs that skills read before generating code. Each is ~200-400 lines of working examples.

### Task 3: Write python-agents-sdk.md reference

**Files:**
- Create: `.claude/plugins/openai-agent-builder/references/python-agents-sdk.md`

**Content outline (write full file):**

```markdown
# Python Agents SDK Reference (openai-agents >= 0.9.0)

## Installation
pip install openai-agents

## Core Imports
from agents import Agent, Runner, function_tool, trace
from agents import InputGuardrail, OutputGuardrail, GuardrailFunctionOutput
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions

## Agent Definition Pattern
[complete working example with Agent(), instructions, tools, model]

## Tool Definition Pattern
[@function_tool decorator with type hints and docstrings]

## Guardrails Pattern
[input_guardrail and output_guardrail with Pydantic models]

## Handoffs Pattern
[Agent with handoffs=[], handoff_description]

## Session Memory Pattern
[Runner.run() with session persistence]

## Tracing Pattern
[trace context manager, custom spans]

## Common Pitfalls
- Always use asyncio.run(main()) as entry point
- function_tool must have docstrings (used as tool descriptions)
- Guardrail agents need output_type (Pydantic model)
- Python 3.10+ required
```

Use the Context7 patterns fetched earlier for all code examples. Every example must be complete and runnable.

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/python-agents-sdk.md
git commit -m "docs(plugin): add Python Agents SDK reference patterns"
```

---

### Task 4: Write typescript-agents-sdk.md reference

**Files:**
- Create: `.claude/plugins/openai-agent-builder/references/typescript-agents-sdk.md`

**Content outline:**

```markdown
# TypeScript Agents SDK Reference (@openai/agents)

## Installation
npm install @openai/agents zod@^4

## Core Imports
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';

## Agent Definition Pattern
[new Agent({ name, instructions, tools, handoffs })]

## Tool Definition Pattern
[tool({ name, description, parameters: z.object(), execute })]

## Guardrails Pattern
[inputGuardrails, outputGuardrails arrays on Agent]

## Handoffs Pattern
[Agent with handoffs array, handoffDescription]

## Tracing Pattern
[built-in tracing config]

## Zod v4 Requirements
[z.object(), z.string(), z.number() — must be zod@^4]

## Common Pitfalls
- Zod v4 is REQUIRED (not v3)
- tool() parameters must be z.object()
- execute functions are async
- Use named exports for tools
```

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/typescript-agents-sdk.md
git commit -m "docs(plugin): add TypeScript Agents SDK reference patterns"
```

---

### Task 5: Write voice-patterns.md reference

**Files:**
- Create: `.claude/plugins/openai-agent-builder/references/voice-patterns.md`

**Content outline:**

```markdown
# Voice Agent Patterns

## Python — VoicePipeline
[from agents.voice import VoicePipeline, AudioInput, SingleAgentVoiceWorkflow]
[Complete mic → STT → agent → TTS example with sounddevice]

## Python — Realtime API (direct)
[WebSocket connection to Realtime API, event handling]

## TypeScript — RealtimeAgent
[import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime']
[Client-side and server-side patterns]

## TypeScript — Voice Pipeline (chain-based)
[Text agent → STT/TTS wrapping for voice]

## Voice Config
[Voice presets, language, interruption handling, turn detection]

## Audio I/O Patterns
[Microphone capture, audio playback, streaming]
```

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/voice-patterns.md
git commit -m "docs(plugin): add voice agent reference patterns"
```

---

### Task 6: Write chatkit-patterns.md reference

**Files:**
- Create: `.claude/plugins/openai-agent-builder/references/chatkit-patterns.md`

**Content outline:**

```markdown
# ChatKit Integration Patterns

## Installation
npm install @openai/chatkit-react
pip install chatkit  (for Python backend)

## Basic Embed (React)
[useChatKit hook, ChatKit component, getClientSecret]

## Theming
[theme object: colorScheme, color, radius, density, typography]

## Custom Widgets
[widget nodes, onAction handler, sendCustomAction]

## Actions
[Action triggers, streaming responses without user message]

## Start Screen
[greeting, prompts array]

## Self-Hosted Backend (Python)
[FastAPI + chatkit-python server setup]

## Self-Hosted Backend (TypeScript)
[Express/Next.js API route + ChatKit server]
```

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/chatkit-patterns.md
git commit -m "docs(plugin): add ChatKit reference patterns"
```

---

### Task 7: Write guardrails-patterns.md reference

**Files:**
- Create: `.claude/plugins/openai-agent-builder/references/guardrails-patterns.md`

**Content outline:**

```markdown
# Guardrails Patterns

## Python Input Guardrail
[@input_guardrail decorator, Pydantic output model, GuardrailFunctionOutput]

## Python Output Guardrail
[@output_guardrail decorator, checking agent output]

## TypeScript Input Guardrail
[inputGuardrails array on Agent, guardrail function signature]

## TypeScript Output Guardrail
[outputGuardrails array on Agent]

## Common Guardrail Types
- Content moderation (block harmful input)
- Topic enforcement (stay on domain)
- PII detection (block personal data)
- Output format validation
- Cost/length limits

## Tripwire vs Transform
[Tripwire: block + error, Transform: modify and continue]
```

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/guardrails-patterns.md
git commit -m "docs(plugin): add guardrails reference patterns"
```

---

## Phase 3: Project Templates (Tasks 8-16)

Each template is a directory of actual files that get copied into the target project. Placeholders use `{{AGENT_NAME}}`, `{{AGENT_INSTRUCTIONS}}`, `{{PROJECT_NAME}}` — skills do find-and-replace after copying.

### Task 8: Python text-agent template

**Files:**
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/main.py`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/agent.py`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/tools.py`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/guardrails.py`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/requirements.txt`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/.env.example`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/.gitignore`
- Create: `.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/README.md`

**Step 1: Write main.py**

```python
"""{{PROJECT_NAME}} — Entry point."""
import asyncio
from agent import agent
from agents import Runner
from agents.exceptions import InputGuardrailTripwireTriggered


async def main():
    print(f"Starting {agent.name}...")
    try:
        result = await Runner.run(agent, input("You: "))
        print(f"Agent: {result.final_output}")
    except InputGuardrailTripwireTriggered as e:
        print(f"Guardrail blocked: {e}")


if __name__ == "__main__":
    asyncio.run(main())
```

**Step 2: Write agent.py**

```python
"""{{AGENT_NAME}} — Agent definition."""
from agents import Agent
from tools import tools

agent = Agent(
    name="{{AGENT_NAME}}",
    instructions="{{AGENT_INSTRUCTIONS}}",
    tools=tools,
    model="gpt-4.1",
)
```

**Step 3: Write tools.py**

```python
"""{{PROJECT_NAME}} — Tool definitions."""
from agents import function_tool


@function_tool
def example_tool(query: str) -> str:
    """Example tool — replace with your implementation."""
    return f"Result for: {query}"


tools = [example_tool]
```

**Step 4: Write guardrails.py**

```python
"""{{PROJECT_NAME}} — Guardrail definitions."""
from pydantic import BaseModel
from agents import Agent, GuardrailFunctionOutput, input_guardrail, RunContextWrapper, TResponseInputItem


class ContentCheckOutput(BaseModel):
    is_appropriate: bool
    reasoning: str


guardrail_agent = Agent(
    name="Content checker",
    instructions="Check if the user input is appropriate and on-topic.",
    output_type=ContentCheckOutput,
)


@input_guardrail
async def content_guardrail(
    ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    from agents import Runner
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_appropriate,
    )
```

**Step 5: Write requirements.txt, .env.example, .gitignore, README.md**

- `requirements.txt`: `openai-agents>=0.9.0`
- `.env.example`: `OPENAI_API_KEY=your-key-here`
- `.gitignore`: `.env`, `__pycache__/`, `*.pyc`, `.venv/`
- `README.md`: Project name, setup instructions, run command

**Step 6: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/
git commit -m "feat(plugin): add Python text agent project template"
```

---

### Task 9: TypeScript text-agent template

**Files:**
- Create: `.../project-templates/typescript-text-agent/src/index.ts`
- Create: `.../project-templates/typescript-text-agent/src/agent.ts`
- Create: `.../project-templates/typescript-text-agent/src/tools.ts`
- Create: `.../project-templates/typescript-text-agent/src/schemas.ts`
- Create: `.../project-templates/typescript-text-agent/src/guardrails.ts`
- Create: `.../project-templates/typescript-text-agent/package.json`
- Create: `.../project-templates/typescript-text-agent/tsconfig.json`
- Create: `.../project-templates/typescript-text-agent/.env.example`
- Create: `.../project-templates/typescript-text-agent/.gitignore`
- Create: `.../project-templates/typescript-text-agent/README.md`

**Key patterns:**

- `package.json`: `@openai/agents`, `zod@^4`, `dotenv`, `tsx` (dev)
- `agent.ts`: `new Agent({ name, instructions, tools })` pattern
- `tools.ts`: `tool({ name, description, parameters: z.object(), execute })` pattern
- `schemas.ts`: Zod v4 schemas for all tool parameters
- `guardrails.ts`: `inputGuardrails` / `outputGuardrails` definitions
- `index.ts`: `run(agent, input)` entry point with error handling

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/references/project-templates/typescript-text-agent/
git commit -m "feat(plugin): add TypeScript text agent project template"
```

---

### Task 10: Python voice-agent template

**Files:** Same as python-text-agent plus:
- Create: `.../python-voice-agent/voice.py` — VoicePipeline setup with AudioInput, sounddevice streaming
- Modify: `requirements.txt` — add `sounddevice`, `numpy`
- Modify: `main.py` — voice pipeline entry point instead of text input

**Key pattern:** `VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))` with mic capture and audio streaming playback.

**Commit message:** `feat(plugin): add Python voice agent project template`

---

### Task 11: TypeScript voice-agent template

**Files:** Same as typescript-text-agent plus:
- Create: `.../typescript-voice-agent/src/realtime.ts` — RealtimeAgent + RealtimeSession setup
- Modify: `package.json` — add `@openai/agents` (includes realtime)
- Modify: `src/index.ts` — RealtimeSession entry point

**Key pattern:** `new RealtimeAgent({ name, instructions, tools })` with `RealtimeSession` lifecycle.

**Commit message:** `feat(plugin): add TypeScript voice agent project template`

---

### Task 12: Python multi-agent template

**Files:** Same as python-text-agent plus:
- Create: `.../python-multi-agent/triage.py` — Triage agent with handoffs
- Create: `.../python-multi-agent/specialists/specialist_1.py` — Template specialist
- Modify: `main.py` — Run triage agent as entry point

**Key pattern:** `Agent(handoffs=[specialist_1, specialist_2], instructions=prompt_with_handoff_instructions(...))`.

**Commit message:** `feat(plugin): add Python multi-agent project template`

---

### Task 13: TypeScript multi-agent template

**Files:** Same as typescript-text-agent plus:
- Create: `.../typescript-multi-agent/src/triage.ts` — Triage agent with handoffs
- Create: `.../typescript-multi-agent/src/specialists/specialist1.ts`
- Modify: `src/index.ts` — Run triage agent

**Key pattern:** `new Agent({ handoffs: [specialist1, specialist2], handoffDescription })`.

**Commit message:** `feat(plugin): add TypeScript multi-agent project template`

---

### Task 14: TypeScript ChatKit basic template

**Files:**
- Create: `.../typescript-chatkit-basic/frontend/package.json` — React + `@openai/chatkit-react` + Vite
- Create: `.../typescript-chatkit-basic/frontend/src/App.tsx` — ChatKit embed with `useChatKit`
- Create: `.../typescript-chatkit-basic/frontend/src/main.tsx` — React entry point
- Create: `.../typescript-chatkit-basic/frontend/vite.config.ts`
- Create: `.../typescript-chatkit-basic/frontend/index.html`
- Create: `.../typescript-chatkit-basic/backend/` — agent backend (reuse text-agent template)
- Create: `.../typescript-chatkit-basic/backend/src/server.ts` — Express API for client secret

**Key pattern:** `useChatKit({ api: { getClientSecret }, theme: { colorScheme, color, radius } })`.

**Commit message:** `feat(plugin): add ChatKit basic embed project template`

---

### Task 15: TypeScript ChatKit custom template

**Files:** Same as basic plus:
- Create: `.../typescript-chatkit-custom/frontend/src/widgets/` — Custom widget node components
- Create: `.../typescript-chatkit-custom/frontend/src/actions.ts` — `onAction` handler
- Modify: `App.tsx` — `widgets: { onAction }` config

**Commit message:** `feat(plugin): add ChatKit custom widgets project template`

---

### Task 16: TypeScript ChatKit full template

**Files:** Same as custom plus:
- Create: `.../typescript-chatkit-full/backend/src/chatkit-server.ts` — Self-hosted ChatKit server
- Create: `.../typescript-chatkit-full/backend/src/middleware.ts` — Auth, rate limiting
- Modify: Backend to use chatkit-python or custom TS server instead of Agent Builder hosted

**Commit message:** `feat(plugin): add ChatKit full self-hosted project template`

---

## Phase 4: Skills (Tasks 17-20)

Each skill is a SKILL.md that guides Claude through the interactive scaffolding flow.

### Task 17: Write /new-text-agent skill

**Files:**
- Create: `.claude/plugins/openai-agent-builder/skills/new-text-agent/SKILL.md`

**Skill structure:**

```markdown
---
name: new-text-agent
description: Scaffold a standard OpenAI chat agent with tools, guardrails, sessions, and tracing
---

# New Text Agent

## Instructions

Walk through these steps interactively with the user using AskUserQuestion:

### Step 1: Language
Ask: "Python or TypeScript?"

### Step 2: Project Name
Ask: "Project name? (kebab-case, becomes the directory name)"

### Step 3: Agent Purpose
Ask: "What does this agent do?" (free text → becomes system instructions)

### Step 4: Tools
Ask: "Which tools does this agent need?" (multi-select: web search, file search, code interpreter, custom functions, MCP servers)

### Step 5: Guardrails
Ask: "Include input/output guardrails?" (yes/no)

### Step 6: Tracing
Ask: "Include tracing setup?" (yes/no)

## Scaffolding

After collecting answers:

1. Read the reference doc at `${CLAUDE_PLUGIN_ROOT}/references/python-agents-sdk.md` or `typescript-agents-sdk.md`
2. Also query Context7 for the latest patterns: resolve-library-id for `openai-agents-python` or `openai-agents-js`, then query-docs
3. Copy the appropriate template from `${CLAUDE_PLUGIN_ROOT}/references/project-templates/python-text-agent/` or `typescript-text-agent/`
4. Replace all `{{PLACEHOLDERS}}` with user answers
5. If guardrails=no, delete the guardrails file and remove guardrail imports
6. If tracing=yes, add tracing imports and wrap agent runs in trace context
7. For each selected tool, add a tool definition to tools file
8. Run `pip install -r requirements.txt` (Python) or `npm install` (TS) to verify deps
9. Print summary of what was created

## Post-Scaffold

After scaffolding, trigger the `agent-code-reviewer` subagent to review the generated code.
```

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/skills/new-text-agent/SKILL.md
git commit -m "feat(plugin): add /new-text-agent skill"
```

---

### Task 18: Write /new-voice-agent skill

**Files:**
- Create: `.claude/plugins/openai-agent-builder/skills/new-voice-agent/SKILL.md`

**Same structure as Task 17 but with voice-specific questions:**
- Voice mode (VoicePipeline vs RealtimeAgent)
- Voice preset selection
- Language config
- Interruption handling (on/off)
- References `voice-patterns.md` instead of base SDK ref

**Commit message:** `feat(plugin): add /new-voice-agent skill`

---

### Task 19: Write /new-multi-agent skill

**Files:**
- Create: `.claude/plugins/openai-agent-builder/skills/new-multi-agent/SKILL.md`

**Multi-agent-specific questions:**
- Number of specialist agents (2-5)
- Name + description for each specialist
- Handoff strategy (triage fan-out vs chain/pipeline)
- Shared session memory (yes/no)
- Dynamically generates N specialist agent files

**Commit message:** `feat(plugin): add /new-multi-agent skill`

---

### Task 20: Write /new-chatkit-agent skill

**Files:**
- Create: `.claude/plugins/openai-agent-builder/skills/new-chatkit-agent/SKILL.md`

**ChatKit-specific questions:**
- Backend language (Python or TypeScript)
- ChatKit tier (basic / custom / full)
- Theme config (brand colors, font, dark mode)
- Standard agent config (instructions, tools)
- References `chatkit-patterns.md`
- Scaffolds monorepo with frontend/ + backend/

**Commit message:** `feat(plugin): add /new-chatkit-agent skill`

---

## Phase 5: Hooks (Tasks 21-25)

Each hook is a standalone Python script that reads JSON from stdin (Claude's tool input) and exits 0 (pass), 1 (block), or prints warnings.

### Task 21: Write api-key-guard hook

**Files:**
- Create: `.claude/plugins/openai-agent-builder/hooks/api-key-guard.py`

**Logic:**
- Read JSON from stdin: `tool_input.file_path`, `tool_input.new_string` or `tool_input.content`
- Skip `.env` and `.env.example` files
- Regex scan for: `sk-[a-zA-Z0-9]{20,}`, `OPENAI_API_KEY\s*=\s*["'][^"']{10,}["']`, `api_key\s*=\s*["']sk-`
- If found: print BLOCKED message to stderr, `sys.exit(1)`
- If clean: `sys.exit(0)`

**Step 2: Commit**

```bash
git add .claude/plugins/openai-agent-builder/hooks/api-key-guard.py
git commit -m "feat(plugin): add api-key-guard hook"
```

---

### Task 22: Write agent-error-handling hook

**Files:**
- Create: `.claude/plugins/openai-agent-builder/hooks/agent-error-handling.py`

**Logic:**
- Only fires on `.py` and `.ts` files
- Scans for `Runner.run(`, `await run(`, `agent.run(` patterns
- Checks if they appear inside a `try` block (Python) or try/catch (TS)
- If unprotected: print WARNING to stderr (not a block — exit 0)

**Commit message:** `feat(plugin): add agent-error-handling warning hook`

---

### Task 23: Write tracing-reminder hook

**Files:**
- Create: `.claude/plugins/openai-agent-builder/hooks/tracing-reminder.py`

**Logic:**
- Only fires on new agent files (Write tool, files named `agent.py` or `agent.ts`)
- Checks if `trace` or `tracing` import exists in file content
- If missing: print reminder to stdout (informational, not a block)

**Commit message:** `feat(plugin): add tracing-reminder hook`

---

### Task 24: Write guardrails-reminder hook

**Files:**
- Create: `.claude/plugins/openai-agent-builder/hooks/guardrails-reminder.py`

**Logic:**
- Only fires on agent files
- Checks if `guardrail` / `InputGuardrail` / `inputGuardrails` appears in content
- If missing and file defines an Agent: print reminder

**Commit message:** `feat(plugin): add guardrails-reminder hook`

---

### Task 25: Write zod-v4-check hook

**Files:**
- Create: `.claude/plugins/openai-agent-builder/hooks/zod-v4-check.py`

**Logic:**
- Only fires on `.ts` / `.tsx` files that import from `@openai/agents`
- Scans for `from 'zod'` or `from "zod"` imports
- Checks `package.json` in same directory for `"zod": "^4"` or `"zod": "4.`
- If Zod v3 detected: print BLOCKED, `sys.exit(1)`

**Commit message:** `feat(plugin): add zod-v4-check hook`

---

## Phase 6: Subagents (Tasks 26-27)

### Task 26: Write agent-code-reviewer subagent

**Files:**
- Create: `.claude/plugins/openai-agent-builder/agents/agent-code-reviewer.md`

**Agent definition:**

```markdown
---
name: agent-code-reviewer
description: Reviews generated OpenAI agent code for SDK best practices, async patterns, type safety, and common pitfalls
tools: Read, Glob, Grep
---

# Agent Code Reviewer

You review OpenAI agent code for best practices. Check:

## Python Agents
- [ ] Uses `asyncio.run(main())` entry point
- [ ] `@function_tool` decorators have docstrings
- [ ] `Runner.run()` calls are in try/except blocks
- [ ] Guardrail agents have `output_type` (Pydantic BaseModel)
- [ ] No hardcoded API keys
- [ ] `.env` is in `.gitignore`
- [ ] Imports from `agents` package (not `openai` directly for agent features)

## TypeScript Agents
- [ ] Uses Zod v4 (not v3)
- [ ] `tool()` parameters are `z.object()`
- [ ] `execute` functions are async
- [ ] Error handling with try/catch on `run()` calls
- [ ] Proper TypeScript types (no `any`)
- [ ] `dotenv/config` imported before agent setup

## Voice Agents
- [ ] Audio I/O properly streamed (not buffered entirely in memory)
- [ ] Interruption handling configured
- [ ] Error callbacks on voice pipeline

## ChatKit
- [ ] Client secret fetched from backend (not hardcoded)
- [ ] CORS configured on backend
- [ ] Theme uses design tokens (not raw hex)

Return a markdown report with: issues found, severity, and suggested fixes.
```

**Commit message:** `feat(plugin): add agent-code-reviewer subagent`

---

### Task 27: Write agent-security-checker subagent

**Files:**
- Create: `.claude/plugins/openai-agent-builder/agents/agent-security-checker.md`

**Agent definition:**

```markdown
---
name: agent-security-checker
description: Security audit for OpenAI agent projects — checks for key leaks, missing auth, exposed endpoints, and guardrail coverage
tools: Read, Glob, Grep
---

# Agent Security Checker

Scan the agent project for security issues:

## Critical (must fix)
- Hardcoded API keys or secrets in source files
- `.env` file not in `.gitignore`
- API endpoints without authentication
- WebSocket connections without auth tokens (voice agents)

## High (should fix)
- No input guardrails defined
- No output guardrails defined
- Missing rate limiting on API endpoints (ChatKit backends)
- CORS set to `*` (should be specific origins)
- No input sanitization on user messages

## Medium (recommended)
- No tracing configured
- No error logging
- Missing session timeout configuration
- No content moderation guardrail

Return a security report with severity levels and specific file:line references.
```

**Commit message:** `feat(plugin): add agent-security-checker subagent`

---

## Phase 7: Integration & Validation (Tasks 28-29)

### Task 28: Update workspace CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (root workspace)

**Add section:**

```markdown
## OpenAI Agent Builder Plugin

Plugin at `.claude/plugins/openai-agent-builder/` — scaffolds OpenAI agent projects.

| Skill | Purpose |
|-------|---------|
| `/new-text-agent` | Standard chat agent (Python/TS) |
| `/new-voice-agent` | Voice agent with VoicePipeline or RealtimeAgent |
| `/new-multi-agent` | Multi-agent orchestrator with handoffs |
| `/new-chatkit-agent` | ChatKit embedded UI agent |
| `/agent-help` | Show all available agent builder skills |
```

**Commit message:** `docs: add OpenAI Agent Builder plugin to CLAUDE.md`

---

### Task 29: End-to-end validation

**Verify:**
1. Run `/agent-help` — should print the reference card
2. Run `/new-text-agent` — walk through wizard, verify Python + TS scaffolding
3. Verify hooks fire when writing agent code with hardcoded keys (should block)
4. Verify hooks fire when writing TS agent code with Zod v3 (should block)
5. Verify `agent-code-reviewer` can be triggered and produces a review
6. Verify all template files have no syntax errors

**Validation commands:**

```bash
# Check Python templates parse
python3 -c "import ast; ast.parse(open('.claude/plugins/openai-agent-builder/references/project-templates/python-text-agent/main.py').read())"

# Check TS templates have valid JSON in package.json
python3 -c "import json; json.load(open('.claude/plugins/openai-agent-builder/references/project-templates/typescript-text-agent/package.json'))"
```

**Commit message:** `test: validate openai-agent-builder plugin end-to-end`

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1. Foundation | 1-2 | plugin.json + /agent-help |
| 2. Reference Docs | 3-7 | 5 curated SDK pattern docs |
| 3. Project Templates | 8-16 | 9 template directories with actual starter files |
| 4. Skills | 17-20 | 4 interactive scaffolding skills |
| 5. Hooks | 21-25 | 5 guard rail scripts |
| 6. Subagents | 26-27 | 2 code review/security agents |
| 7. Integration | 28-29 | CLAUDE.md update + validation |

**Total: 29 tasks across 7 phases.**

**Parallelization opportunities:**
- Tasks 3-7 (reference docs) are independent — can run in parallel
- Tasks 8-16 (templates) are independent — can run in parallel
- Tasks 17-20 (skills) depend on reference docs being complete
- Tasks 21-25 (hooks) are independent — can run in parallel
- Tasks 26-27 (subagents) are independent — can run in parallel

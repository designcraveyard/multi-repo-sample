---
name: new-text-agent
description: Scaffold a standard OpenAI chat agent with tools, guardrails, sessions, and tracing
---

# New Text Agent

Scaffold a complete OpenAI text/chat agent project. Walks through configuration interactively, then copies and customizes the appropriate project template.

## Instructions

Walk through these steps interactively with the user using AskUserQuestion.

### Step 1: Language

Ask: **"Python or TypeScript?"**

Options:
- **Python** — uses `openai-agents` SDK, `Runner.run()`, `@function_tool`
- **TypeScript** — uses `@openai/agents` SDK, `run()`, `tool()`, Zod v4

### Step 2: Project Name

Ask: **"Project name?"** (kebab-case, becomes the directory name)

Validate: must be kebab-case (`[a-z0-9-]+`), no spaces.

### Step 3: Agent Purpose

Ask: **"What does this agent do?"** (free text)

This becomes the agent's system instructions. If the user gives a short answer, expand it into clear, concise instructions for the agent.

### Step 4: Tools

Ask: **"Which tools does this agent need?"** (multi-select)

Options:
- Web search
- File search
- Code interpreter
- Custom functions (scaffold example tool)
- MCP servers

Default: Custom functions only.

### Step 5: Guardrails

Ask: **"Include input/output guardrails?"**

Options:
- **Yes** — scaffold guardrail files with content moderation example
- **No** — skip guardrails (can add later)

### Step 6: Tracing

Ask: **"Include tracing setup?"**

Options:
- **Yes** — add tracing imports and wrap agent runs in trace context
- **No** — skip tracing

## Scaffolding

After collecting all answers:

1. **Read the reference doc** at `${CLAUDE_PLUGIN_ROOT}/references/python-agents-sdk.md` (Python) or `${CLAUDE_PLUGIN_ROOT}/references/typescript-agents-sdk.md` (TypeScript)

2. **Query Context7** for the latest patterns:
   - Resolve library ID for `openai-agents-python` (Python) or `openai-agents-js` (TypeScript)
   - Query docs for "Agent definition tools guardrails" patterns

3. **Copy the project template** from:
   - Python: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/python-text-agent/`
   - TypeScript: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/typescript-text-agent/`

4. **Replace all `{{PLACEHOLDERS}}`** with user answers:
   - `{{PROJECT_NAME}}` → project name
   - `{{AGENT_NAME}}` → PascalCase version of project name
   - `{{AGENT_INSTRUCTIONS}}` → agent purpose text
   - `{{MODEL}}` → `gpt-4.1` (default)

5. **Customize based on answers:**
   - If **guardrails = no**: delete the guardrails file, remove guardrail imports from agent file
   - If **tracing = yes**: add tracing imports and wrap agent runs in trace context:
     - Python: `from agents import trace` + `with trace("agent-name"):`
     - TypeScript: `import { withTrace } from '@openai/agents'` + wrap run call
   - For each selected **tool**, add a tool definition to the tools file
   - For **web search**: add `WebSearchTool()` (Python) or built-in web search tool (TS)
   - For **file search**: add `FileSearchTool()` (Python) or file search tool (TS)
   - For **MCP servers**: add MCP server connection pattern from reference docs

6. **Install dependencies** (offer to run):
   - Python: `pip install -r requirements.txt`
   - TypeScript: `npm install`

7. **Print summary** of what was created — list all files with one-line descriptions.

## Post-Scaffold

After scaffolding, automatically trigger the `agent-code-reviewer` subagent to review the generated code for SDK best practices.

## Example Output

```
Created my-support-agent/:

  main.py          — Entry point with conversation loop
  agent.py         — Agent: "You are a customer support agent..."
  tools.py         — 2 tool definitions (lookup_order, check_status)
  guardrails.py    — Content moderation guardrail
  requirements.txt — openai-agents>=0.9.0, python-dotenv
  .env.example     — OPENAI_API_KEY placeholder
  .gitignore       — .env, __pycache__, .venv
  README.md        — Setup and run instructions

Next: copy .env.example to .env, add your API key, run `python main.py`
```

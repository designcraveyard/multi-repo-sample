---
name: new-multi-agent
description: Scaffold a multi-agent orchestrator with handoffs between specialist agents
---

# New Multi-Agent

Scaffold a complete multi-agent orchestrator project. Creates a triage agent that routes conversations to specialist agents via handoffs.

## Instructions

Walk through these steps interactively with the user using AskUserQuestion.

### Step 1: Language

Ask: **"Python or TypeScript?"**

Options:
- **Python** — uses `openai-agents` SDK with `handoff()` and `prompt_with_handoff_instructions()`
- **TypeScript** — uses `@openai/agents` SDK with `handoff()` and `handoffDescription`

### Step 2: Project Name

Ask: **"Project name?"** (kebab-case, becomes the directory name)

Validate: must be kebab-case (`[a-z0-9-]+`), no spaces.

### Step 3: Specialist Agents

Ask: **"How many specialist agents?"** (2-5)

Then for each specialist, ask:
- **"Name for specialist N?"** (e.g., "billing-agent", "tech-support")
- **"What does specialist N handle?"** (e.g., "Handles billing inquiries, refunds, and payment issues")

### Step 4: Handoff Strategy

Ask: **"Handoff strategy?"**

Options:
- **Triage fan-out** (recommended) — a triage agent routes to the best specialist based on user intent. Each specialist can hand back to triage.
- **Chain/pipeline** — agents pass conversation sequentially (agent 1 → agent 2 → agent 3). Good for multi-step workflows.

### Step 5: Shared Session Memory

Ask: **"Enable shared session memory?"**

Options:
- **Yes** — all agents share a context object for session state (user info, conversation history summary)
- **No** — each agent only sees messages from its own conversation turn

### Step 6: Guardrails

Ask: **"Include guardrails?"**

Options:
- **Yes** — add input guardrails on the triage agent (filters all incoming messages)
- **No** — skip guardrails

## Scaffolding

After collecting all answers:

1. **Read the reference docs:**
   - `${CLAUDE_PLUGIN_ROOT}/references/python-agents-sdk.md` or `typescript-agents-sdk.md`

2. **Query Context7** for the latest handoff patterns:
   - Resolve library ID for `openai-agents-python` or `openai-agents-js`
   - Query docs for "handoff multi-agent triage" patterns

3. **Copy the project template** from:
   - Python: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/python-multi-agent/`
   - TypeScript: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/typescript-multi-agent/`

4. **Replace all `{{PLACEHOLDERS}}`** with user answers:
   - `{{PROJECT_NAME}}` → project name
   - `{{AGENT_NAME}}` → PascalCase version of project name
   - `{{SPECIALIST_N_NAME}}` → each specialist's name
   - `{{SPECIALIST_N_INSTRUCTIONS}}` → each specialist's description/instructions
   - `{{MODEL}}` → `gpt-4.1` (default)

5. **Generate specialist agent files dynamically:**
   - For each specialist beyond the 2 template files, create additional specialist files following the same pattern
   - Python: `specialists/specialist_N.py` with Agent definition + handoff back to triage
   - TypeScript: `src/specialists/specialistN.ts` with Agent definition + handoff

6. **Customize based on answers:**
   - **Triage fan-out**: wire all specialists as handoffs on the triage agent, add `prompt_with_handoff_instructions()` (Python) or `handoffDescription` (TS)
   - **Chain/pipeline**: wire agents sequentially — agent 1 hands off to agent 2, agent 2 to agent 3, etc.
   - **Shared memory = yes**: add a context/session object that's passed via `context` parameter
   - **Guardrails = yes**: add input guardrails on the triage agent

7. **Update imports** in triage and main files to reference all generated specialists.

8. **Install dependencies** (offer to run):
   - Python: `pip install -r requirements.txt`
   - TypeScript: `npm install`

9. **Print summary** of what was created — list triage + all specialist agents.

## Post-Scaffold

After scaffolding, automatically trigger the `agent-code-reviewer` subagent to review the generated code.

## Multi-Agent Notes

- The **triage agent** should have clear instructions about when to route to each specialist
- Each specialist should have a **handoff back to triage** for cases outside its scope
- With **shared session memory**, use the `context` parameter to pass state between agents
- For **chain/pipeline** mode, the last agent in the chain should NOT have a handoff (it's the final step)
- Keep specialist count at **2-5** — more than 5 makes triage routing unreliable

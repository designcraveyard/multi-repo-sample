---
name: new-voice-agent
description: Scaffold an OpenAI voice agent — VoicePipeline (Python) or RealtimeAgent (TypeScript)
---

# New Voice Agent

Scaffold a complete OpenAI voice agent project. Supports both VoicePipeline (Python, mic→STT→agent→TTS) and RealtimeAgent (TypeScript, direct Realtime API).

## Instructions

Walk through these steps interactively with the user using AskUserQuestion.

### Step 1: Language

Ask: **"Python or TypeScript?"**

Options:
- **Python** — uses `VoicePipeline` with STT → Agent → TTS flow, or `RealtimeAgent`
- **TypeScript** — uses `RealtimeAgent` with direct Realtime API access

### Step 2: Project Name

Ask: **"Project name?"** (kebab-case, becomes the directory name)

Validate: must be kebab-case (`[a-z0-9-]+`), no spaces.

### Step 3: Voice Mode

**Python only** — ask: **"Voice mode?"**

Options:
- **VoicePipeline** — mic → STT → text agent → TTS → speaker (recommended for most use cases)
- **RealtimeAgent** — direct Realtime API with streaming audio (lower latency, more complex)

**TypeScript** — always uses `RealtimeAgent` (only option in TS SDK).

### Step 4: Agent Purpose

Ask: **"What does this voice agent do?"** (free text)

This becomes the agent's instructions. Remind the user that voice agent instructions should be conversational and concise — the agent speaks its responses aloud.

### Step 5: Voice Config

Ask: **"Voice preset?"**

Options: `alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, `shimmer`, `verse`

Default: `alloy`

### Step 6: Tools

Ask: **"Which tools does this agent need?"** (multi-select)

Options:
- Web search
- Custom functions (scaffold example tool)
- MCP servers

Default: Custom functions only.

### Step 7: Interruption Handling

Ask: **"Enable interruption handling?"** (user can interrupt the agent mid-speech)

Options:
- **Yes** — configure interruption detection (recommended for conversational agents)
- **No** — agent speaks to completion before accepting input

## Scaffolding

After collecting all answers:

1. **Read the reference docs:**
   - `${CLAUDE_PLUGIN_ROOT}/references/voice-patterns.md`
   - `${CLAUDE_PLUGIN_ROOT}/references/python-agents-sdk.md` or `typescript-agents-sdk.md`

2. **Query Context7** for the latest voice patterns:
   - Resolve library ID for `openai-agents-python` or `openai-agents-js`
   - Query docs for "VoicePipeline RealtimeAgent voice" patterns

3. **Copy the project template** from:
   - Python: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/python-voice-agent/`
   - TypeScript: `${CLAUDE_PLUGIN_ROOT}/references/project-templates/typescript-voice-agent/`

4. **Replace all `{{PLACEHOLDERS}}`** with user answers:
   - `{{PROJECT_NAME}}` → project name
   - `{{AGENT_NAME}}` → PascalCase version of project name
   - `{{AGENT_INSTRUCTIONS}}` → voice-optimized agent instructions
   - `{{VOICE_PRESET}}` → selected voice
   - `{{MODEL}}` → `gpt-4.1-mini` (voice default, lower latency)

5. **Customize based on answers:**
   - If **VoicePipeline** mode: ensure `voice.py` uses `SingleAgentVoiceWorkflow`
   - If **RealtimeAgent** mode (Python): replace VoicePipeline with RealtimeAgent pattern
   - If **interruption = yes**: add interruption handling config
   - For each selected **tool**, add tool definitions
   - Configure voice preset in pipeline/session config

6. **Install dependencies** (offer to run):
   - Python: `pip install -r requirements.txt` (includes `sounddevice`, `numpy`)
   - TypeScript: `npm install`

7. **Print summary** of what was created.

## Post-Scaffold

After scaffolding, automatically trigger the `agent-code-reviewer` subagent to review the generated code.

## Voice-Specific Notes

- **Python VoicePipeline** requires a working microphone — `sounddevice` captures PCM16 audio at 24kHz
- **TypeScript RealtimeAgent** connects via WebSocket to the Realtime API — audio I/O depends on client environment (browser, Node.js with audio libraries)
- Voice agent instructions should be **short and conversational** — no markdown, no long lists
- Set `{{MODEL}}` to `gpt-4.1-mini` by default for voice (lower latency matters more than capability for spoken responses)

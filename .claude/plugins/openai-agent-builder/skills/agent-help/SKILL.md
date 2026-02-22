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

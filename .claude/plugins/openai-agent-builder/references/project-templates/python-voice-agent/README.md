# {{PROJECT_NAME}}

{{AGENT_INSTRUCTIONS}}

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key
2. Install dependencies: `pip install -r requirements.txt`
3. Ensure you have a working microphone and speakers
4. Run: `python main.py`

## Structure

- `main.py` — Entry point
- `agent.py` — Agent definition
- `voice.py` — VoicePipeline setup with microphone recording and audio playback
- `tools.py` — Tool function definitions
- `guardrails.py` — Input/output guardrail definitions (optional)

## Voice Mode

Uses OpenAI VoicePipeline: Microphone → Speech-to-Text → Agent → Text-to-Speech → Speaker.
Records 5 seconds of audio per turn. Speak clearly during the "Listening..." prompt.

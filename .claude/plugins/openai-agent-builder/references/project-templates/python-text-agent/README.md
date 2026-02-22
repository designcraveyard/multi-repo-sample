# {{PROJECT_NAME}}

{{AGENT_INSTRUCTIONS}}

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key
2. Install dependencies: `pip install -r requirements.txt`
3. Run: `python main.py`

## Structure

- `main.py` — Entry point with conversation loop
- `agent.py` — Agent definition (name, instructions, tools, model)
- `tools.py` — Tool function definitions
- `guardrails.py` — Input/output guardrail definitions (optional)

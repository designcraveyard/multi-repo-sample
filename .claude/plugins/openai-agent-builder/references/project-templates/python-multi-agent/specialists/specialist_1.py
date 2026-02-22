"""{{PROJECT_NAME}} — Specialist agent 1."""
from agents import Agent
from tools import tools

specialist_1 = Agent(
    name="{{SPECIALIST_1_NAME}}",
    instructions="{{SPECIALIST_1_INSTRUCTIONS}}",
    handoff_description="{{SPECIALIST_1_HANDOFF_DESCRIPTION}}",
    tools=tools,
    model="gpt-4.1",
)

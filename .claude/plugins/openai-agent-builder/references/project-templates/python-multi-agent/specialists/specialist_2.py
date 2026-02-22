"""{{PROJECT_NAME}} — Specialist agent 2."""
from agents import Agent
from tools import tools

specialist_2 = Agent(
    name="{{SPECIALIST_2_NAME}}",
    instructions="{{SPECIALIST_2_INSTRUCTIONS}}",
    handoff_description="{{SPECIALIST_2_HANDOFF_DESCRIPTION}}",
    tools=tools,
    model="gpt-4.1",
)

"""{{AGENT_NAME}} — Agent definition."""
from agents import Agent
from tools import tools

agent = Agent(
    name="{{AGENT_NAME}}",
    instructions="{{AGENT_INSTRUCTIONS}} Keep responses brief and natural for voice.",
    tools=tools,
    model="gpt-4.1-mini",
)

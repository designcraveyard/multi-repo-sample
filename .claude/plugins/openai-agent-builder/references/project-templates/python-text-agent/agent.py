"""{{AGENT_NAME}} — Agent definition."""
from agents import Agent
from tools import tools

agent = Agent(
    name="{{AGENT_NAME}}",
    instructions="{{AGENT_INSTRUCTIONS}}",
    tools=tools,
    model="gpt-4.1",
)

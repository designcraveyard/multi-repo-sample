"""{{PROJECT_NAME}} — Triage agent with handoffs to specialists."""
from agents import Agent
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions
from specialists.specialist_1 import specialist_1
from specialists.specialist_2 import specialist_2

specialists = [specialist_1, specialist_2]

triage_agent = Agent(
    name="{{AGENT_NAME}}",
    instructions=prompt_with_handoff_instructions(
        "You are a triage agent. Analyze the user's request and route them to the most appropriate specialist. "
        "If the request doesn't match any specialist, answer it yourself.",
        specialists,
    ),
    handoffs=specialists,
    model="gpt-4.1",
)

"""{{PROJECT_NAME}} — Entry point."""
import asyncio
from agent import agent
from agents import Runner
from agents.exceptions import InputGuardrailTripwireTriggered


async def main():
    print(f"Starting {agent.name}...")
    print("Type 'quit' to exit.\n")
    input_items = []
    while True:
        user_msg = input("You: ")
        if user_msg.lower() == "quit":
            break
        input_items.append({"role": "user", "content": user_msg})
        try:
            result = await Runner.run(agent, input_items)
            print(f"Agent: {result.final_output}\n")
            input_items = result.to_input_list()
        except InputGuardrailTripwireTriggered as e:
            print(f"Guardrail blocked: {e}\n")


if __name__ == "__main__":
    asyncio.run(main())

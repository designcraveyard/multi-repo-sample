"""{{PROJECT_NAME}} — Voice agent entry point."""
import asyncio
from agent import agent
from voice import run_voice_loop


async def main():
    print(f"Starting {agent.name} (voice mode)...")
    print("Press Ctrl+C to stop.\n")
    await run_voice_loop(agent)


if __name__ == "__main__":
    asyncio.run(main())

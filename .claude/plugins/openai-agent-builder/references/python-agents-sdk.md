# Python Agents SDK Reference (openai-agents >= 0.9.0)

> Skills read this file before generating Python agent code. All examples are complete and runnable.

## Installation

```bash
pip install openai-agents
```

Requires Python 3.10+. Set `OPENAI_API_KEY` in `.env`.

## Core Imports

```python
from agents import Agent, Runner, function_tool, trace
from agents import InputGuardrail, OutputGuardrail, GuardrailFunctionOutput
from agents import RunContextWrapper, TResponseInputItem
from agents.exceptions import InputGuardrailTripwireTriggered
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions
```

## Agent Definition

```python
from agents import Agent

agent = Agent(
    name="My Agent",
    instructions="You are a helpful assistant that answers questions concisely.",
    model="gpt-4.1",
    tools=[],           # list of @function_tool decorated functions
    handoffs=[],        # list of Agent objects for handoff
    input_guardrails=[], # list of InputGuardrail objects
    output_guardrails=[], # list of OutputGuardrail objects
)
```

### With Structured Output

```python
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    confidence: float
    tags: list[str]

agent = Agent(
    name="Analyzer",
    instructions="Analyze the given text and return structured results.",
    output_type=AnalysisResult,
    model="gpt-4.1",
)
```

## Running an Agent

```python
import asyncio
from agents import Agent, Runner

async def main():
    agent = Agent(name="Assistant", instructions="Be helpful.")
    result = await Runner.run(agent, "Hello, what can you do?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

### Streaming

```python
from agents import Runner

async def main():
    result = Runner.run_streamed(agent, "Tell me a story.")
    async for event in result.stream_events():
        if event.type == "raw_response_event":
            print(event.data, end="", flush=True)
```

### Conversation Loop

```python
async def chat_loop():
    input_items = []
    while True:
        user_msg = input("You: ")
        if user_msg.lower() == "quit":
            break
        input_items.append({"role": "user", "content": user_msg})
        result = await Runner.run(agent, input_items)
        print(f"Agent: {result.final_output}")
        input_items = result.to_input_list()
```

## Tool Definitions

```python
from agents import function_tool

@function_tool
def search_web(query: str) -> str:
    """Search the web for information about the given query."""
    # Implementation here
    return f"Search results for: {query}"

@function_tool
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression and return the result."""
    try:
        result = eval(expression)  # In production, use a safe math parser
        return str(result)
    except Exception as e:
        return f"Error: {e}"
```

**Important:** The docstring is REQUIRED — it becomes the tool's description for the LLM.

### Tool with Complex Parameters

```python
from agents import function_tool
from typing import Literal

@function_tool
def create_event(
    title: str,
    date: str,
    duration_minutes: int = 60,
    priority: Literal["low", "medium", "high"] = "medium",
) -> str:
    """Create a calendar event with the given details."""
    return f"Created event: {title} on {date} ({duration_minutes}min, {priority})"
```

## Input Guardrails

```python
from pydantic import BaseModel
from agents import (
    Agent, GuardrailFunctionOutput, InputGuardrailTripwireTriggered,
    RunContextWrapper, Runner, TResponseInputItem, input_guardrail,
)

class ContentCheckOutput(BaseModel):
    is_appropriate: bool
    reasoning: str

guardrail_agent = Agent(
    name="Content checker",
    instructions="Check if the user input is appropriate and on-topic. Return is_appropriate=False if it contains harmful content.",
    output_type=ContentCheckOutput,
)

@input_guardrail
async def content_guardrail(
    ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_appropriate,
    )

# Attach to agent
agent = Agent(
    name="My Agent",
    instructions="...",
    input_guardrails=[content_guardrail],
)

# Handle in runner
async def main():
    try:
        result = await Runner.run(agent, "user input here")
        print(result.final_output)
    except InputGuardrailTripwireTriggered:
        print("Input was blocked by guardrail.")
```

## Output Guardrails

```python
from agents import output_guardrail, Agent, GuardrailFunctionOutput, RunContextWrapper

class SensitivityCheck(BaseModel):
    contains_pii: bool
    reasoning: str

output_check_agent = Agent(
    name="PII checker",
    instructions="Check if the output contains personal identifiable information.",
    output_type=SensitivityCheck,
)

@output_guardrail
async def pii_guardrail(
    ctx: RunContextWrapper[None], agent: Agent, output: str
) -> GuardrailFunctionOutput:
    result = await Runner.run(output_check_agent, output, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.contains_pii,
    )

agent = Agent(
    name="My Agent",
    instructions="...",
    output_guardrails=[pii_guardrail],
)
```

## Handoffs (Multi-Agent)

```python
from agents import Agent
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions

billing_agent = Agent(
    name="Billing specialist",
    instructions="You handle billing and payment questions.",
    handoff_description="Transfer to this agent for billing questions.",
)

tech_agent = Agent(
    name="Tech support",
    instructions="You handle technical issues and troubleshooting.",
    handoff_description="Transfer to this agent for technical problems.",
)

triage_agent = Agent(
    name="Triage",
    instructions=prompt_with_handoff_instructions(
        "You are a triage agent. Route the user to the appropriate specialist.",
        [billing_agent, tech_agent],
    ),
    handoffs=[billing_agent, tech_agent],
)
```

## Tracing

```python
from agents import trace, Runner

async def main():
    with trace("Customer support session"):
        result = await Runner.run(agent, "Help me with my order")
        print(result.final_output)

# Custom spans
async def process_request(user_input: str):
    with trace("process_request"):
        with trace("validation"):
            # validate input
            pass
        with trace("agent_run"):
            result = await Runner.run(agent, user_input)
        return result.final_output
```

## Voice Pipeline

```python
import numpy as np
import sounddevice as sd
from agents import Agent
from agents.voice import VoicePipeline, AudioInput, SingleAgentVoiceWorkflow

agent = Agent(
    name="Voice assistant",
    instructions="You are a helpful voice assistant. Keep responses brief.",
    model="gpt-4.1-mini",
)

pipeline = VoicePipeline(workflow=SingleAgentVoiceWorkflow(agent))

# Record audio from microphone
SAMPLE_RATE = 24000
DURATION = 5  # seconds

print("Recording... speak now!")
audio_data = sd.rec(
    int(SAMPLE_RATE * DURATION),
    samplerate=SAMPLE_RATE,
    channels=1,
    dtype=np.int16,
)
sd.wait()
print("Processing...")

audio_input = AudioInput(buffer=audio_data.tobytes())
result = await pipeline.run(audio_input)

# Play response audio
async for event in result.stream():
    if event.type == "voice_stream_event_audio":
        # event.data is PCM audio bytes
        audio_array = np.frombuffer(event.data, dtype=np.int16)
        sd.play(audio_array, samplerate=SAMPLE_RATE)
        sd.wait()
```

### Voice Dependencies

```
openai-agents[voice]>=0.9.0
sounddevice>=0.5.0
numpy>=1.26.0
```

## Context (Dependency Injection)

```python
from dataclasses import dataclass
from agents import Agent, RunContextWrapper, function_tool

@dataclass
class AppContext:
    user_id: str
    db_connection: any

@function_tool
def get_user_orders(ctx: RunContextWrapper[AppContext]) -> str:
    """Get the current user's recent orders."""
    user_id = ctx.context.user_id
    # Use ctx.context.db_connection to query
    return f"Orders for user {user_id}: ..."

agent = Agent[AppContext](
    name="Order agent",
    instructions="Help users with their orders.",
    tools=[get_user_orders],
)

# Pass context when running
context = AppContext(user_id="user_123", db_connection=db)
result = await Runner.run(agent, "Show my orders", context=context)
```

## Common Pitfalls

1. **Always use `asyncio.run(main())`** as entry point — agents are async
2. **`@function_tool` must have docstrings** — they become the tool description
3. **Guardrail agents need `output_type`** — must be a Pydantic BaseModel
4. **Python 3.10+ required** — uses `X | Y` union syntax
5. **Don't import from `openai` directly** for agent features — use `from agents import ...`
6. **Runner.run() is async** — always await it
7. **Handoff descriptions matter** — the triage agent uses them to decide routing
8. **`.env` files** — always use `python-dotenv` or `os.getenv()`, never hardcode keys

# Guardrails Patterns

> Skills read this file before generating guardrail code for agents.

## Overview

Guardrails are checks that run on agent input or output. They can:
- **Tripwire (block):** Stop execution and raise an error
- **Transform:** Modify input/output and continue (less common)

## Python Input Guardrail

```python
from pydantic import BaseModel
from agents import (
    Agent, GuardrailFunctionOutput, InputGuardrailTripwireTriggered,
    RunContextWrapper, Runner, TResponseInputItem, input_guardrail,
)


class ModerationOutput(BaseModel):
    is_appropriate: bool
    reasoning: str


guardrail_agent = Agent(
    name="Content moderator",
    instructions="Check if the user input is appropriate. Return is_appropriate=False for harmful, offensive, or off-topic content.",
    output_type=ModerationOutput,
)


@input_guardrail
async def content_moderation(
    ctx: RunContextWrapper[None], agent: Agent, input: str | list[TResponseInputItem]
) -> GuardrailFunctionOutput:
    result = await Runner.run(guardrail_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_appropriate,
    )
```

### Attaching to an Agent

```python
agent = Agent(
    name="My Agent",
    instructions="...",
    input_guardrails=[content_moderation],
)
```

### Handling Tripwires

```python
from agents.exceptions import InputGuardrailTripwireTriggered

try:
    result = await Runner.run(agent, user_input)
except InputGuardrailTripwireTriggered as e:
    print(f"Input blocked: {e}")
```

## Python Output Guardrail

```python
from agents import output_guardrail, Agent, GuardrailFunctionOutput, RunContextWrapper


class PIICheckOutput(BaseModel):
    contains_pii: bool
    pii_types: list[str]
    reasoning: str


pii_checker = Agent(
    name="PII detector",
    instructions="Check if the text contains personal identifiable information (names, emails, phone numbers, SSNs, addresses). List any PII types found.",
    output_type=PIICheckOutput,
)


@output_guardrail
async def pii_guardrail(
    ctx: RunContextWrapper[None], agent: Agent, output: str
) -> GuardrailFunctionOutput:
    result = await Runner.run(pii_checker, output, context=ctx.context)
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

## TypeScript Input Guardrail

```typescript
import { Agent, run } from '@openai/agents';
import { z } from 'zod';

const ModerationOutput = z.object({
  isAppropriate: z.boolean(),
  reasoning: z.string(),
});

const guardrailAgent = new Agent({
  name: 'Content moderator',
  instructions: 'Check if user input is appropriate. Return isAppropriate=false for harmful content.',
  outputType: ModerationOutput,
});

const agent = new Agent({
  name: 'My Agent',
  instructions: '...',
  inputGuardrails: [
    {
      name: 'content_moderation',
      async execute({ input }) {
        const result = await run(guardrailAgent, input);
        return {
          outputInfo: result.finalOutput,
          tripwireTriggered: !result.finalOutput.isAppropriate,
        };
      },
    },
  ],
});
```

## TypeScript Output Guardrail

```typescript
const agent = new Agent({
  name: 'My Agent',
  instructions: '...',
  outputGuardrails: [
    {
      name: 'pii_check',
      async execute({ output }) {
        // Simple regex-based PII check (use LLM for production)
        const patterns = [
          /\b\d{3}-\d{2}-\d{4}\b/,    // SSN
          /\b[\w.-]+@[\w.-]+\.\w+\b/,   // Email
          /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone
        ];
        const hasPII = patterns.some((p) => p.test(output));
        return {
          outputInfo: { hasPII },
          tripwireTriggered: hasPII,
        };
      },
    },
  ],
});
```

## Common Guardrail Types

### 1. Content Moderation (block harmful input)

```python
@input_guardrail
async def moderation(ctx, agent, input):
    # Use an LLM to classify content
    result = await Runner.run(moderation_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=result.final_output.is_harmful,
    )
```

### 2. Topic Enforcement (stay on domain)

```python
class TopicCheck(BaseModel):
    is_on_topic: bool
    detected_topic: str

topic_agent = Agent(
    name="Topic checker",
    instructions="Check if the input is related to customer support. Return is_on_topic=False for unrelated questions.",
    output_type=TopicCheck,
)

@input_guardrail
async def topic_guardrail(ctx, agent, input):
    result = await Runner.run(topic_agent, input, context=ctx.context)
    return GuardrailFunctionOutput(
        output_info=result.final_output,
        tripwire_triggered=not result.final_output.is_on_topic,
    )
```

### 3. PII Detection (block personal data in output)

See the Output Guardrail examples above.

### 4. Output Format Validation

```python
import json

@output_guardrail
async def json_format_guardrail(ctx, agent, output):
    try:
        json.loads(output)
        return GuardrailFunctionOutput(output_info={"valid": True}, tripwire_triggered=False)
    except json.JSONDecodeError:
        return GuardrailFunctionOutput(output_info={"valid": False}, tripwire_triggered=True)
```

### 5. Length Limit

```typescript
{
  name: 'length_limit',
  async execute({ output }) {
    const tooLong = output.length > 2000;
    return {
      outputInfo: { length: output.length, limit: 2000 },
      tripwireTriggered: tooLong,
    };
  },
}
```

## Parallel vs Sequential Guardrails

By default, input guardrails run **in parallel** with the agent (for speed). To run them **before** the agent starts:

```python
@input_guardrail(run_in_parallel=False)
async def blocking_check(ctx, agent, input):
    # This completes BEFORE the agent starts
    ...
```

## Multiple Guardrails

```python
agent = Agent(
    name="Secure Agent",
    instructions="...",
    input_guardrails=[content_moderation, topic_guardrail],
    output_guardrails=[pii_guardrail, length_check],
)
```

All input guardrails run in parallel. If ANY tripwires, the run is blocked.

## RealtimeAgent Guardrails

Voice/realtime agents also support guardrails:

```python
from agents.guardrail import GuardrailFunctionOutput, OutputGuardrail
from agents.realtime import RealtimeAgent

def sensitive_data_check(context, agent, output):
    return GuardrailFunctionOutput(
        tripwire_triggered="password" in output.lower(),
        output_info=None,
    )

agent = RealtimeAgent(
    name="Voice assistant",
    instructions="...",
    output_guardrails=[OutputGuardrail(guardrail_function=sensitive_data_check)],
)
```

Note: Realtime guardrails are **debounced** -- they run periodically, not on every token.

## Common Pitfalls

1. **Guardrail agents MUST have `output_type`** (Python) or `outputType` (TS) -- they need structured output
2. **`tripwire_triggered=True` blocks the run** -- use sparingly for critical checks
3. **Guardrails add latency** -- each guardrail agent is an extra LLM call
4. **Parallel guardrails** (default) are faster but don't block the main agent from starting
5. **Use regex for simple checks** -- don't use an LLM guardrail for pattern matching
6. **Test guardrails independently** -- run the guardrail agent alone to verify classification
7. **Output guardrails only fire on final output** -- not on intermediate tool calls

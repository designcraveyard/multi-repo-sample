# TypeScript Agents SDK Reference (@openai/agents)

> Skills read this file before generating TypeScript agent code. All examples are complete and runnable.

## Installation

```bash
npm install @openai/agents zod@^4
```

**CRITICAL: Zod v4 is REQUIRED.** The SDK uses Zod v4 for tool parameter schemas. Using Zod v3 will cause runtime errors.

Set `OPENAI_API_KEY` in `.env`.

## Core Imports

```typescript
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
```

### Additional Imports

```typescript
import { handoff } from '@openai/agents';
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import 'dotenv/config'; // Load .env before anything else
```

## Agent Definition

```typescript
import { Agent } from '@openai/agents';

const agent = new Agent({
  name: 'My Agent',
  instructions: 'You are a helpful assistant that answers questions concisely.',
  model: 'gpt-4.1',
  tools: [],            // tool() definitions
  handoffs: [],         // Agent objects for handoff
  inputGuardrails: [],  // input guardrail functions
  outputGuardrails: [], // output guardrail functions
});
```

### With Structured Output

```typescript
import { Agent } from '@openai/agents';
import { z } from 'zod';

const AnalysisResult = z.object({
  summary: z.string(),
  confidence: z.number(),
  tags: z.array(z.string()),
});

const agent = new Agent({
  name: 'Analyzer',
  instructions: 'Analyze the given text and return structured results.',
  outputType: AnalysisResult,
  model: 'gpt-4.1',
});
```

## Running an Agent

```typescript
import 'dotenv/config';
import { Agent, run } from '@openai/agents';

const agent = new Agent({
  name: 'Assistant',
  instructions: 'Be helpful.',
});

async function main() {
  try {
    const result = await run(agent, 'Hello, what can you do?');
    console.log(result.finalOutput);
  } catch (error) {
    console.error('Agent run failed:', error);
  }
}

main();
```

### Streaming

```typescript
import { run } from '@openai/agents';

async function main() {
  const result = run(agent, 'Tell me a story.');
  for await (const event of result) {
    if (event.type === 'raw_response_event') {
      process.stdout.write(event.data);
    }
  }
}
```

### Conversation Loop

```typescript
import * as readline from 'readline';

async function chatLoop() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let inputItems: any[] = [];

  const ask = () => new Promise<string>((resolve) => rl.question('You: ', resolve));

  while (true) {
    const userMsg = await ask();
    if (userMsg.toLowerCase() === 'quit') break;
    inputItems.push({ role: 'user', content: userMsg });
    const result = await run(agent, inputItems);
    console.log(`Agent: ${result.finalOutput}`);
    inputItems = result.toInputList();
  }
  rl.close();
}
```

## Tool Definitions

```typescript
import { tool } from '@openai/agents';
import { z } from 'zod';

const searchWeb = tool({
  name: 'search_web',
  description: 'Search the web for information about the given query.',
  parameters: z.object({
    query: z.string().describe('The search query'),
  }),
  async execute({ query }) {
    // Implementation here
    return `Search results for: ${query}`;
  },
});

const calculate = tool({
  name: 'calculate',
  description: 'Evaluate a mathematical expression and return the result.',
  parameters: z.object({
    expression: z.string().describe('The math expression to evaluate'),
  }),
  async execute({ expression }) {
    try {
      const result = Function(`"use strict"; return (${expression})`)();
      return String(result);
    } catch (e) {
      return `Error: ${e}`;
    }
  },
});
```

**Important:** Parameters MUST be `z.object()` -- other Zod types are not supported at the top level.

### Tool with Complex Parameters

```typescript
const createEvent = tool({
  name: 'create_event',
  description: 'Create a calendar event with the given details.',
  parameters: z.object({
    title: z.string(),
    date: z.string().describe('ISO date string'),
    durationMinutes: z.number().default(60),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
  }),
  async execute({ title, date, durationMinutes, priority }) {
    return `Created event: ${title} on ${date} (${durationMinutes}min, ${priority})`;
  },
});
```

## Input Guardrails

```typescript
import { Agent, run } from '@openai/agents';
import { z } from 'zod';

const ContentCheck = z.object({
  isAppropriate: z.boolean(),
  reasoning: z.string(),
});

const guardrailAgent = new Agent({
  name: 'Content checker',
  instructions: 'Check if the user input is appropriate. Return isAppropriate=false for harmful content.',
  outputType: ContentCheck,
});

const agent = new Agent({
  name: 'My Agent',
  instructions: '...',
  inputGuardrails: [
    {
      name: 'content_check',
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

## Output Guardrails

```typescript
const agent = new Agent({
  name: 'My Agent',
  instructions: '...',
  outputGuardrails: [
    {
      name: 'pii_check',
      async execute({ output }) {
        const hasPII = /\b\d{3}-\d{2}-\d{4}\b/.test(output); // SSN pattern
        return {
          outputInfo: { hasPII },
          tripwireTriggered: hasPII,
        };
      },
    },
  ],
});
```

## Handoffs (Multi-Agent)

```typescript
import { Agent, handoff } from '@openai/agents';

const billingAgent = new Agent({
  name: 'Billing specialist',
  instructions: 'You handle billing and payment questions.',
});

const techAgent = new Agent({
  name: 'Tech support',
  instructions: 'You handle technical issues and troubleshooting.',
});

const triageAgent = new Agent({
  name: 'Triage',
  instructions: 'You are a triage agent. Route the user to the appropriate specialist.',
  handoffs: [
    handoff(billingAgent, { description: 'Transfer for billing questions' }),
    handoff(techAgent, { description: 'Transfer for technical problems' }),
  ],
});
```

### Handoff with Input Schema

```typescript
import { z } from 'zod';

const EscalationData = z.object({ reason: z.string() });

const escalationAgent = new Agent({
  name: 'Escalation',
  instructions: 'Handle escalated issues.',
});

const escalationHandoff = handoff(escalationAgent, {
  inputType: EscalationData,
  async onHandoff(ctx, input) {
    console.log(`Escalated: ${input?.reason}`);
  },
});
```

## Tracing

```typescript
import { trace, run } from '@openai/agents';

async function main() {
  // Traces are automatic -- every run() call creates a trace
  // For custom grouping:
  const result = await trace('Customer support session', async () => {
    return await run(agent, 'Help me with my order');
  });
  console.log(result.finalOutput);
}
```

## RealtimeAgent (Voice)

```typescript
import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';
import { tool } from '@openai/agents/realtime';
import { z } from 'zod';

const getWeather = tool({
  name: 'get_weather',
  description: 'Get weather for a city.',
  parameters: z.object({ city: z.string() }),
  async execute({ city }) {
    return `The weather in ${city} is sunny.`;
  },
});

const agent = new RealtimeAgent({
  name: 'Voice assistant',
  instructions: 'You are a helpful voice assistant. Keep responses brief.',
  tools: [getWeather],
});

// Create session
const session = new RealtimeSession(agent, {
  model: 'gpt-4o-realtime-preview',
});

// Connect and handle events
await session.connect();
session.on('audio', (audio) => {
  // Play audio buffer
});
session.on('text', (text) => {
  console.log('Transcript:', text);
});

// Send audio
session.sendAudio(audioBuffer);

// Cleanup
session.close();
```

## Context (Dependency Injection)

```typescript
import { Agent, run, tool, RunContext } from '@openai/agents';
import { z } from 'zod';

interface AppContext {
  userId: string;
  apiKey: string;
}

const getUserOrders = tool({
  name: 'get_user_orders',
  description: 'Get recent orders for the current user.',
  parameters: z.object({}),
  async execute(_, ctx: RunContext<AppContext>) {
    const userId = ctx.context.userId;
    return `Orders for user ${userId}: ...`;
  },
});

const agent = new Agent<AppContext>({
  name: 'Order agent',
  instructions: 'Help users with their orders.',
  tools: [getUserOrders],
});

// Pass context when running
const result = await run(agent, 'Show my orders', {
  context: { userId: 'user_123', apiKey: 'key' },
});
```

## Zod v4 Requirements

**MUST use Zod v4 (`zod@^4`).** Key differences from v3:

```typescript
// v4 (CORRECT)
import { z } from 'zod';
z.object({ name: z.string() })

// v3 patterns that still work in v4:
z.string(), z.number(), z.boolean(), z.array(), z.enum()
z.object().describe(), z.string().describe()
```

If you see `zod@^3` in package.json, upgrade to `zod@^4`.

## Common Pitfalls

1. **Zod v4 is REQUIRED** -- v3 causes "schema validation" errors at runtime
2. **`tool()` parameters must be `z.object()`** -- no primitives at top level
3. **`execute` functions must be async** -- always return a Promise
4. **Import `dotenv/config` first** -- before any agent imports
5. **Error handling** -- always wrap `run()` in try/catch
6. **Named exports for tools** -- helps with tree-shaking and debugging
7. **Use `@openai/agents`** -- not the base `openai` package for agent features
8. **RealtimeAgent imports from `@openai/agents/realtime`** -- separate subpath

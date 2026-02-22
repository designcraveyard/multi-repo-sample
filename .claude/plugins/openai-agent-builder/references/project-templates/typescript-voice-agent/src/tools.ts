import { tool } from '@openai/agents/realtime';
import { z } from 'zod';

const exampleTool = tool({
  name: 'example_tool',
  description: 'Example tool — replace with your implementation.',
  parameters: z.object({
    query: z.string().describe('The search query'),
  }),
  async execute({ query }) {
    return `Result for: ${query}`;
  },
});

export const tools = [exampleTool];

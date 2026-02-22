import { Agent } from '@openai/agents';
import { tools } from './tools';

export const agent = new Agent({
  name: '{{AGENT_NAME}}',
  instructions: '{{AGENT_INSTRUCTIONS}}',
  tools,
  model: 'gpt-4.1',
});

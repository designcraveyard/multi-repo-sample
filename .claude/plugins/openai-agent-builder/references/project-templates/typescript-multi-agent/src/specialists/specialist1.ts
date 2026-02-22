import { Agent } from '@openai/agents';
import { tools } from '../tools';

export const specialist1 = new Agent({
  name: '{{SPECIALIST_1_NAME}}',
  instructions: '{{SPECIALIST_1_INSTRUCTIONS}}',
  tools,
  model: 'gpt-4.1',
});

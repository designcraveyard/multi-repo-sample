import { Agent } from '@openai/agents';
import { tools } from '../tools';

export const specialist2 = new Agent({
  name: '{{SPECIALIST_2_NAME}}',
  instructions: '{{SPECIALIST_2_INSTRUCTIONS}}',
  tools,
  model: 'gpt-4.1',
});

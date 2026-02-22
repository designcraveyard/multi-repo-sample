import { RealtimeAgent } from '@openai/agents/realtime';
import { tools } from './tools';

export const agent = new RealtimeAgent({
  name: '{{AGENT_NAME}}',
  instructions: '{{AGENT_INSTRUCTIONS}} Keep responses brief and natural for voice.',
  tools,
});

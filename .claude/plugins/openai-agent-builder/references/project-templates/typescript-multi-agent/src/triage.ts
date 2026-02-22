import { Agent, handoff } from '@openai/agents';
import { specialist1 } from './specialists/specialist1';
import { specialist2 } from './specialists/specialist2';

export const triageAgent = new Agent({
  name: '{{AGENT_NAME}}',
  instructions:
    'You are a triage agent. Analyze the user\'s request and route them to the most appropriate specialist. If the request doesn\'t match any specialist, answer it yourself.',
  handoffs: [
    handoff(specialist1, { description: '{{SPECIALIST_1_HANDOFF_DESCRIPTION}}' }),
    handoff(specialist2, { description: '{{SPECIALIST_2_HANDOFF_DESCRIPTION}}' }),
  ],
  model: 'gpt-4.1',
});

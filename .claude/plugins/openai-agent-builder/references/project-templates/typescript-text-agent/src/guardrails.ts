import { Agent, run } from '@openai/agents';
import { z } from 'zod';

const ModerationOutput = z.object({
  isAppropriate: z.boolean(),
  reasoning: z.string(),
});

const guardrailAgent = new Agent({
  name: 'Content checker',
  instructions:
    'Check if the user input is appropriate and on-topic. Return isAppropriate=false for harmful content.',
  outputType: ModerationOutput,
});

export const contentGuardrail = {
  name: 'content_moderation',
  async execute({ input }: { input: string }) {
    const result = await run(guardrailAgent, input);
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: !result.finalOutput.isAppropriate,
    };
  },
};

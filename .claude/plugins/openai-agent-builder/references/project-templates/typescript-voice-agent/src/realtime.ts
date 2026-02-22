import { RealtimeSession } from '@openai/agents/realtime';
import { agent } from './agent';

export const session = new RealtimeSession(agent, {
  model: 'gpt-4o-realtime-preview',
});

// Handle incoming audio from the agent
session.on('audio', (audio: Buffer) => {
  // Play audio — implementation depends on your audio stack
  // For Node.js, you can pipe to a speaker library
  console.log(`[Audio] Received ${audio.length} bytes`);
});

// Handle transcripts
session.on('text', (text: string) => {
  console.log(`Agent: ${text}`);
});

// Handle errors
session.on('error', (error: Error) => {
  console.error('Session error:', error);
});

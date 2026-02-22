import 'dotenv/config';
import * as readline from 'readline';
import { run } from '@openai/agents';
import { triageAgent } from './triage';

async function main() {
  console.log(`Starting ${triageAgent.name}...`);
  console.log('Type "quit" to exit.\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = () => new Promise<string>((resolve) => rl.question('You: ', resolve));

  let inputItems: any[] = [];

  while (true) {
    const userMsg = await ask();
    if (userMsg.toLowerCase() === 'quit') break;

    inputItems.push({ role: 'user', content: userMsg });
    try {
      const result = await run(triageAgent, inputItems);
      console.log(`Agent: ${result.finalOutput}\n`);
      inputItems = result.toInputList();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  rl.close();
}

main();

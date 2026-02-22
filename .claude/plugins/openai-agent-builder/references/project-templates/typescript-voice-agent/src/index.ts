import 'dotenv/config';
import { session } from './realtime';

async function main() {
  console.log('Starting voice agent...');
  console.log('Press Ctrl+C to stop.\n');

  try {
    await session.connect();
    console.log('Connected to Realtime API. Listening...\n');

    // Keep alive until interrupted
    await new Promise<void>((resolve) => {
      process.on('SIGINT', () => {
        console.log('\nDisconnecting...');
        session.close();
        resolve();
      });
    });
  } catch (error) {
    console.error('Failed to connect:', error);
    process.exit(1);
  }
}

main();

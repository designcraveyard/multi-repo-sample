import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerProfilePrompts(server: McpServer) {
  server.prompt(
    'profile_summary',
    'Instructs the LLM to retrieve and summarize the current user\'s profile',
    { include_metadata: z.enum(['yes', 'no']).default('no').describe('Include created_at and updated_at timestamps') },
    ({ include_metadata }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Please call the get_profile tool to retrieve my profile, then provide a friendly summary.',
              include_metadata === 'yes'
                ? 'Include the account creation date and last update time in your summary.'
                : 'You can omit timestamp metadata from the summary.',
            ].join(' '),
          },
        },
      ],
    })
  );
}

import { z } from 'zod';

// Define reusable Zod v4 schemas for tool parameters here.
// Import and use in tools.ts.

export const QuerySchema = z.object({
  query: z.string().describe('The search query'),
});

export type QueryInput = z.infer<typeof QuerySchema>;

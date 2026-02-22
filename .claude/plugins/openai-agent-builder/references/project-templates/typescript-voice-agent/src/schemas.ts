import { z } from 'zod';

// Reusable Zod v4 schemas for tool parameters.
export const QuerySchema = z.object({
  query: z.string().describe('The search query'),
});

export type QueryInput = z.infer<typeof QuerySchema>;

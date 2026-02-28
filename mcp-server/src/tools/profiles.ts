import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { supabase, findUserByEmail } from '../supabase.js';

export function registerProfileTools(server: McpServer, userEmail: string) {
  // get_profile — current user's profile
  server.tool('get_profile', 'Get the current authenticated user\'s profile', {}, async () => {
    const user = await findUserByEmail(userEmail);
    if (!user) {
      return { isError: true, content: [{ type: 'text', text: 'User not found for email: ' + userEmail }] };
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) {
      return { isError: true, content: [{ type: 'text', text: 'Error fetching profile: ' + error.message }] };
    }
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // update_profile — update current user's display_name and/or avatar_url
  server.tool(
    'update_profile',
    'Update the current user\'s display name or avatar URL',
    {
      display_name: z.string().optional().describe('New display name'),
      avatar_url: z.string().url().optional().describe('New avatar URL'),
    },
    async ({ display_name, avatar_url }) => {
      const user = await findUserByEmail(userEmail);
      if (!user) {
        return { isError: true, content: [{ type: 'text', text: 'User not found' }] };
      }
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (display_name !== undefined) updates.display_name = display_name;
      if (avatar_url !== undefined) updates.avatar_url = avatar_url;

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      if (error) {
        return { isError: true, content: [{ type: 'text', text: 'Update failed: ' + error.message }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // list_profiles — paginated list
  server.tool(
    'list_profiles',
    'List all profiles with pagination',
    {
      limit: z.number().int().min(1).max(100).default(20).describe('Number of profiles to return'),
      offset: z.number().int().min(0).default(0).describe('Offset for pagination'),
    },
    async ({ limit, offset }) => {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) {
        return { isError: true, content: [{ type: 'text', text: 'Error listing profiles: ' + error.message }] };
      }
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ profiles: data, total: count, limit, offset }, null, 2),
        }],
      };
    }
  );

  // search_profiles — case-insensitive name search
  server.tool(
    'search_profiles',
    'Search profiles by display name (case-insensitive)',
    {
      query: z.string().min(1).describe('Search term to match against display_name'),
    },
    async ({ query }) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .order('display_name')
        .limit(50);
      if (error) {
        return { isError: true, content: [{ type: 'text', text: 'Search failed: ' + error.message }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );
}

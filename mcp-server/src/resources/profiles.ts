import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { supabase, findUserByEmail } from '../supabase.js';

export function registerProfileResources(server: McpServer, userEmail: string) {
  // profile://me — current user's profile
  server.resource('profile-me', 'profile://me', async () => {
    const user = await findUserByEmail(userEmail);
    if (!user) {
      return { contents: [{ uri: 'profile://me', text: 'User not found', mimeType: 'text/plain' }] };
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) {
      return { contents: [{ uri: 'profile://me', text: 'Error: ' + error.message, mimeType: 'text/plain' }] };
    }
    return {
      contents: [{
        uri: 'profile://me',
        text: JSON.stringify(data, null, 2),
        mimeType: 'application/json',
      }],
    };
  });

  // profile://{userId} — any user's profile
  server.resource(
    'profile-by-id',
    new ResourceTemplate('profile://{userId}', {
      list: async () => {
        const { data } = await supabase.from('profiles').select('id, display_name');
        return {
          resources: (data ?? []).map((p) => ({
            uri: `profile://${p.id}`,
            name: p.display_name ?? p.id,
            mimeType: 'application/json',
          })),
        };
      },
    }),
    async (_uri: URL, variables: Record<string, string | string[]>) => {
      const userId = Array.isArray(variables.userId) ? variables.userId[0] : variables.userId;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        return { contents: [{ uri: `profile://${userId ?? 'unknown'}`, text: 'Not found', mimeType: 'text/plain' }] };
      }
      return {
        contents: [{
          uri: `profile://${userId ?? 'unknown'}`,
          text: JSON.stringify(data, null, 2),
          mimeType: 'application/json',
        }],
      };
    }
  );

  // schema://profiles — DDL + RLS policies
  server.resource('schema-profiles', 'schema://profiles', async () => {
    const schema = `
-- Table: public.profiles
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  avatar_url   text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);
`.trim();
    return {
      contents: [{ uri: 'schema://profiles', text: schema, mimeType: 'text/plain' }],
    };
  });
}

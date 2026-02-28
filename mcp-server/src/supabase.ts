import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) return null;
  const user = data.users.find((u) => u.email === email);
  return user ? { id: user.id, email: user.email! } : null;
}

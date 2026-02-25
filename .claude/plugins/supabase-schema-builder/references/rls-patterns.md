# RLS Policy Patterns

Reference for Row Level Security patterns. Used by `/schema-design` Phase 5.

## 1. User-Owned (most common)

Table has a `user_id` column referencing `auth.users(id)`.

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_select_own" ON public.<table>
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "<table>_insert_own" ON public.<table>
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "<table>_update_own" ON public.<table>
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "<table>_delete_own" ON public.<table>
    FOR DELETE USING (auth.uid() = user_id);
```

## 2. Self-Owned (profiles pattern)

Table PK `id` IS the user's auth ID (1:1 with auth.users).

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_select_own" ON public.<table>
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "<table>_update_own" ON public.<table>
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "<table>_insert_own" ON public.<table>
    FOR INSERT WITH CHECK (auth.uid() = id);
```

## 3. Public Read, Owner Write

Anyone authenticated can read; only the owner can modify.

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_select_all" ON public.<table>
    FOR SELECT USING (true);

CREATE POLICY "<table>_insert_own" ON public.<table>
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "<table>_update_own" ON public.<table>
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "<table>_delete_own" ON public.<table>
    FOR DELETE USING (auth.uid() = user_id);
```

## 4. Team/Organization Shared

Users can access rows belonging to their team via a junction table.

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_select_team" ON public.<table>
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "<table>_insert_team" ON public.<table>
    FOR INSERT WITH CHECK (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "<table>_update_team" ON public.<table>
    FOR UPDATE USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "<table>_delete_team" ON public.<table>
    FOR DELETE USING (
        team_id IN (
            SELECT team_id FROM public.team_members
            WHERE user_id = auth.uid()
        )
    );
```

## 5. Admin Only (service role)

No RLS policies. Access only via service role key (server-side).

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;
-- No policies = no access via anon/authenticated keys
-- Access via service_role key only
```

## 6. Authenticated Read (any logged-in user)

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_select_authenticated" ON public.<table>
    FOR SELECT TO authenticated USING (true);
```

## Policy Naming Convention

Pattern: `<table>_<action>_<scope>`

| Action | Scope Examples |
|--------|---------------|
| `select` | `own`, `all`, `team`, `authenticated` |
| `insert` | `own`, `team` |
| `update` | `own`, `team` |
| `delete` | `own`, `team` |

## Important Rules

- Always enable RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- INSERT policies use `WITH CHECK`, not `USING`
- SELECT/UPDATE/DELETE policies use `USING`
- Avoid `USING (true)` without justification (allows all access)
- Service-role access bypasses RLS automatically

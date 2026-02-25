---
name: supabase-onboard
description: Onboard a new team member to this Supabase project. Links the project, fills environment files, verifies the MCP server connection works, and confirms existing tables are accessible. Use when someone clones the repo for the first time or says "set up Supabase", "I just cloned this", or "connect to the database".
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, ToolSearch
metadata:
  mcp-server: supabase-bubbleskit
---

# Supabase Onboard

Onboard a new team member to the Supabase project. Verifies MCP connection, fills environment files, and confirms schema state.

## Prerequisites

This skill assumes:
- The repo has already been cloned
- `supabase/config.toml` exists (supabase CLI was already initialized)
- `.mcp.json` exists with the `supabase-bubbleskit` entry

## Workflow

### Phase 1: Environment Detection

Read these files silently and build a status table:

1. Read `supabase/config.toml` — extract `project_id`
2. Read `.mcp.json` — extract the project ref from the supabase URL
3. Read `supabase/.env` — check if values are real or placeholders
4. Read `supabase/.env.example` — compare against actual `.env`
5. Check if `multi-repo-nextjs/.env.local` exists and has `NEXT_PUBLIC_SUPABASE_URL`
6. Check if `multi-repo-android/local.properties` has `SUPABASE_URL`

Present a status table to the user:

```
| File                              | Status           |
|-----------------------------------|------------------|
| supabase/config.toml              | ✓ Found          |
| .mcp.json (supabase entry)        | ✓ / ✗            |
| supabase/.env                     | ✓ Populated / ⚠ Placeholder values |
| multi-repo-nextjs/.env.local      | ✓ / ✗ Missing    |
| multi-repo-android/local.properties | ✓ / ✗ Missing  |
| iOS Xcode env vars                | ⚠ Cannot verify (manual) |
```

### Phase 2: MCP Connection Verification

Use ToolSearch to find the Supabase-BubblesKit MCP tools, then call `mcp__claude_ai_Supabase-BubblesKit__list_tables` to verify the connection.

**If MCP works:** Display the list of existing tables. Proceed to Phase 3.

**If MCP fails:** Guide the user:
1. "The Supabase MCP connection failed. You need a personal access token."
2. "Go to https://supabase.com/dashboard/account/tokens and create a new token."
3. "Set it as an environment variable: `export SUPABASE_MCP_TOKEN=your-token-here`"
4. "Add it to your shell profile (~/.zshrc or ~/.bashrc) so it persists."
5. "Restart Claude Code after setting the token."
6. Stop here — the user needs to fix this before continuing.

### Phase 3: Credential Collection

Call MCP tools to auto-fill what we can:

1. Call `mcp__claude_ai_Supabase-BubblesKit__get_project_url` to get the Supabase API URL.
2. Call `mcp__claude_ai_Supabase-BubblesKit__get_publishable_keys` to get the anon key.

Use AskUserQuestion to ask:
- "Do you have Google OAuth credentials from Google Cloud Console? (Needed for Google sign-in)"
  - Yes, I'll provide them now
  - Not yet, skip for now
  - Already configured in supabase/.env

If they have credentials, ask for:
- Google Client ID
- Google Client Secret

Similarly ask about Apple Sign-In credentials.

### Phase 4: Write Environment Files

Based on collected credentials:

1. **`supabase/.env`** — Write/update with auth provider secrets. Reference `${CLAUDE_PLUGIN_ROOT}/references/env-example.template` for the full template. Preserve any existing values that are already populated.

2. **`multi-repo-nextjs/.env.local`** — Create or update with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<from MCP get_project_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<from MCP get_publishable_keys>
   ```

3. **`multi-repo-android/local.properties`** — Append Supabase credentials if not present:
   ```
   SUPABASE_URL=<from MCP get_project_url>
   SUPABASE_ANON_KEY=<from MCP get_publishable_keys>
   ```

4. **iOS reminder** — Print instructions:
   ```
   iOS credentials must be set manually in Xcode:
   Edit Scheme > Run > Arguments > Environment Variables:
     SUPABASE_URL = <url>
     SUPABASE_ANON_KEY = <key>
   ```

### Phase 5: Schema Verification

Call MCP to verify the live schema matches local migrations:

1. Call `mcp__claude_ai_Supabase-BubblesKit__execute_sql` with:
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' ORDER BY table_name;
   ```

2. Read migration files from `supabase/migrations/` to build a list of expected tables.

3. Call `mcp__claude_ai_Supabase-BubblesKit__list_migrations` to check which migrations are applied.

4. Compare and flag:
   - Tables in live DB but not in local migrations
   - Tables in local migrations but not in live DB
   - Migrations not yet applied

### Phase 6: Generate TypeScript Types

Call `mcp__claude_ai_Supabase-BubblesKit__generate_typescript_types` and write the output to `multi-repo-nextjs/lib/database.types.ts`.

### Phase 7: Summary

Print a checklist:

```
## Supabase Onboarding Complete

| Step                          | Status |
|-------------------------------|--------|
| MCP connection                | ✓      |
| supabase/.env                 | ✓ Updated / ⚠ Skipped auth secrets |
| multi-repo-nextjs/.env.local  | ✓      |
| multi-repo-android/local.properties | ✓ |
| iOS Xcode env vars            | ⚠ Manual step required |
| Schema verification           | ✓ N tables match / ⚠ Discrepancies found |
| TypeScript types generated    | ✓      |

Remaining manual steps:
  1. Set iOS Xcode scheme environment variables (see above)
  2. [Any other pending items]

Next: Run /schema-design to create new tables, or /add-migration for quick changes.
```

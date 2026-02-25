---
name: add-migration
description: Quick single-table or ALTER migration. Lighter weight than /schema-design — for adding a column, creating a simple table, or modifying an existing one. Applies via MCP and regenerates cross-platform models. Use when the user says "add a column", "alter table", "add a field to X", "quick migration", or "modify the schema".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, ToolSearch
metadata:
  mcp-server: supabase-bubbleskit
---

# Add Migration

Quick single-table or ALTER migration with cross-platform model generation.

## Arguments

`$ARGUMENTS` — Optional: description of the change (e.g., "add status column to posts", "create tags table").

## Workflow

### Phase 1: Understand the Change

If `$ARGUMENTS` is provided, infer the change type. Otherwise, ask using AskUserQuestion:

"What database change do you need?"

Options:
- **Add a new table** — creates a full table with standard columns, RLS, triggers, indexes
- **Add column(s) to an existing table** — ALTER TABLE ADD COLUMN
- **Modify a column** — rename, change type, add/drop NOT NULL, add default
- **Add an index** — create index on existing column(s)
- **Add/modify RLS policies** — add or update row level security
- **Add a trigger** — add a database trigger
- **Custom SQL** — freeform migration

### Phase 2: Gather Details

**For new table:**
1. Ask for the table name (suggest snake_case plural).
2. Ask: "Is this table user-owned (has a user_id column)?" — Yes / No
3. Ask for columns beyond the standard ones (id, created_at, updated_at, optionally user_id). Suggest types from `${CLAUDE_PLUGIN_ROOT}/references/type-mapping.md`.
4. Ask about RLS pattern — reference `${CLAUDE_PLUGIN_ROOT}/references/rls-patterns.md`. Default to "user-owned" if user_id is present.

**For add column(s):**
1. Call `mcp__claude_ai_Supabase-BubblesKit__list_tables` to show available tables.
2. Ask which table (or infer from `$ARGUMENTS`).
3. Call `mcp__claude_ai_Supabase-BubblesKit__execute_sql` to show current columns:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = '<table>'
   ORDER BY ordinal_position;
   ```
4. Ask for the new column(s): name, type, nullable, default value.

**For modify column:**
1. Same table/column discovery as above.
2. Ask what to change: rename, change type, add/drop NOT NULL, add/change default.

**For add index:**
1. Show tables and their columns.
2. Ask which column(s) to index and whether it should be unique, partial, GIN, etc.
3. Reference `${CLAUDE_PLUGIN_ROOT}/references/index-patterns.md`.

**For RLS policies:**
1. Show tables and their current policies via `execute_sql`:
   ```sql
   SELECT tablename, policyname, cmd, qual, with_check
   FROM pg_policies WHERE schemaname = 'public';
   ```
2. Ask what to add/change. Reference `${CLAUDE_PLUGIN_ROOT}/references/rls-patterns.md`.

**For trigger:**
1. Ask which table and what event (INSERT, UPDATE, DELETE).
2. Suggest patterns from `${CLAUDE_PLUGIN_ROOT}/references/trigger-patterns.md`.

**For custom SQL:**
1. Ask the user to describe what they need.
2. Generate the SQL and present for review.

### Phase 3: Generate and Review SQL

Generate the migration SQL. Present it in a code block for review.

For new tables, ensure the SQL includes:
- `CREATE TABLE` with standard columns
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- RLS policies
- `updated_at` trigger (check if `set_updated_at()` function already exists)
- FK indexes

Ask: "Here's the migration SQL. Ready to apply, or want to make changes?"

### Phase 4: Apply Migration

1. Generate a timestamp for the migration filename: `YYYYMMDDHHMMSS`
2. Derive a descriptive name from the change (e.g., `add_status_to_posts`, `create_tags`).
3. Write the SQL to `supabase/migrations/<timestamp>_<name>.sql`.
4. Call `mcp__claude_ai_Supabase-BubblesKit__apply_migration` with the migration name and SQL.
5. Verify by calling `mcp__claude_ai_Supabase-BubblesKit__list_tables` or `execute_sql` to confirm the change applied.

### Phase 5: Update Cross-Platform Models

**TypeScript types:**
- Call `mcp__claude_ai_Supabase-BubblesKit__generate_typescript_types` and write to `multi-repo-nextjs/lib/database.types.ts`.

**For new tables — create model files:**
- Read `${CLAUDE_PLUGIN_ROOT}/references/model-templates/swift-model.template` and generate `multi-repo-ios/multi-repo-ios/Models/<PascalName>Model.swift`. Follow the exact pattern from `multi-repo-ios/multi-repo-ios/Models/ProfileModel.swift`.
- Read `${CLAUDE_PLUGIN_ROOT}/references/model-templates/kotlin-model.template` and generate `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/model/<PascalName>Model.kt`. Follow the exact pattern from `multi-repo-android/.../data/model/ProfileModel.kt`.
- Create a TypeScript interface file in the appropriate `lib/` subdirectory following the pattern from `multi-repo-nextjs/lib/auth/profile.ts`.

**For altered tables — edit existing model files:**
- Find the existing model files for the affected table.
- Add/modify the property, CodingKey, or @SerialName annotation as needed.
- Ensure the type mapping follows `${CLAUDE_PLUGIN_ROOT}/references/type-mapping.md`.

**Update documentation:**
- For new tables: append a new section to `docs/api-contracts.md` following the existing `profiles` entry format (column table, RLS policies, type mappings, model file paths).
- For altered tables: update the existing section in `docs/api-contracts.md`.

### Phase 6: Summary

```
## Migration Applied

Migration: <timestamp>_<name>.sql
Change: <description>

Files created/modified:
  ✓ supabase/migrations/<file>.sql
  ✓ multi-repo-nextjs/lib/database.types.ts (regenerated)
  ✓ multi-repo-ios/multi-repo-ios/Models/<Model>.swift
  ✓ multi-repo-android/.../data/model/<Model>.kt
  ✓ docs/api-contracts.md

Run supabase-schema-validator to verify all platforms are in sync.
```

---
name: schema-design
description: Interactive schema design wizard. Walks through domain understanding, entity design, attributes, relationships, RLS policies, triggers, and indexes. Creates migrations via Supabase MCP and generates cross-platform models (TypeScript, Swift, Kotlin). Use when building new features that need database tables, or when the user says "design the schema", "add tables", "I need a database for X", or "model the data".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, ToolSearch
metadata:
  mcp-server: supabase-bubbleskit
---

# Schema Design Wizard

Interactive, multi-phase schema design that goes from domain understanding to applied migrations with cross-platform model generation.

## Arguments

`$ARGUMENTS` — Optional: domain or feature description (e.g., "todo list app with projects", "social feed with posts and comments").

## Important

- Ask ONE question per message. Do not batch questions.
- Suggest sensible defaults at every step. The user should be able to approve defaults quickly.
- Reference the plugin's reference files for patterns and conventions.
- Every table gets: `id uuid PK`, `created_at timestamptz`, `updated_at timestamptz`, RLS enabled, `updated_at` trigger.

## Workflow

### Phase 1: Domain Understanding

If `$ARGUMENTS` is provided, use it as the starting point. Otherwise ask:

"What feature or domain are you building? Describe it in a few sentences."

Then:
1. Read existing tables via `mcp__claude_ai_Supabase-BubblesKit__list_tables` to know what already exists.
2. Read `docs/api-contracts.md` to understand the current schema.
3. Analyze the description and suggest entity candidates.
4. Present: "Based on your description, I suggest these entities (each becomes a Supabase table):"

```
| # | Table Name (snake_case) | Description | User-Owned? |
|---|------------------------|-------------|-------------|
| 1 | posts                  | User blog posts | Yes |
| 2 | comments               | Post comments   | Yes |
| ...
```

### Phase 2: Entity Confirmation

Ask: "Would you like to add, remove, or rename any entities?"

Options:
- Looks good, proceed
- Add an entity
- Remove an entity
- Rename an entity

Loop until the user confirms the entity list.

### Phase 3: Per-Entity Attribute Design

For EACH confirmed entity, one at a time:

1. Suggest columns based on the domain context. Always include the standard columns:
   - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
   - `created_at timestamptz DEFAULT now() NOT NULL`
   - `updated_at timestamptz DEFAULT now() NOT NULL`
   - `user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` (if user-owned)

2. Suggest domain-specific columns with types. Reference `${CLAUDE_PLUGIN_ROOT}/references/type-mapping.md` for available types.

3. Present in table format:

```
| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | No | gen_random_uuid() | PK |
| user_id | uuid | No | — | FK → auth.users |
| title | text | No | — | Post title |
| body | text | Yes | — | Post content |
| status | text | No | 'draft' | CHECK: draft/published/archived |
| created_at | timestamptz | No | now() | — |
| updated_at | timestamptz | No | now() | — |
```

4. Ask: "For `<table_name>`, here are the suggested columns. Would you like to add, remove, or modify any?"

5. Loop until confirmed for this entity, then move to the next.

### Phase 4: Relationships

After all entities are confirmed:

1. Infer foreign key relationships from column names (e.g., `post_id` → FK to `posts`).
2. Check for many-to-many patterns. If entity A references entity B AND entity B references entity A, suggest a junction table.
3. Present the relationship map:

```
| Source Table | Column | References | On Delete | Type |
|-------------|--------|------------|-----------|------|
| comments | post_id | posts(id) | CASCADE | Many-to-One |
| posts_tags | post_id | posts(id) | CASCADE | Junction (M:N) |
| posts_tags | tag_id | tags(id) | CASCADE | Junction (M:N) |
```

4. Ask: "Here are the inferred relationships. Any additions or corrections?"

If a junction table is needed, add it to the entity list with its columns (composite PK or separate PK + unique constraint).

### Phase 5: RLS Policies

For each table, suggest RLS policies based on ownership patterns. Reference `${CLAUDE_PLUGIN_ROOT}/references/rls-patterns.md`.

Present per table:

```
### posts (user-owned)
- posts_select_own: SELECT WHERE auth.uid() = user_id
- posts_insert_own: INSERT WITH CHECK auth.uid() = user_id
- posts_update_own: UPDATE WHERE auth.uid() = user_id
- posts_delete_own: DELETE WHERE auth.uid() = user_id

### comments (public read, owner write)
- comments_select_all: SELECT (true) — anyone can read
- comments_insert_own: INSERT WITH CHECK auth.uid() = user_id
- comments_update_own: UPDATE WHERE auth.uid() = user_id
- comments_delete_own: DELETE WHERE auth.uid() = user_id
```

Ask: "Here are the suggested RLS policies for each table. Any changes?"

Suggest the most appropriate pattern for each table based on:
- Has `user_id`? → user-owned or public-read-owner-write
- Is a junction table? → policies based on parent table ownership
- Is reference data? → public read, admin write (no write policies)

### Phase 6: Triggers

Suggest triggers for each table. Reference `${CLAUDE_PLUGIN_ROOT}/references/trigger-patterns.md`.

Default suggestions:
- **Every table with `updated_at`**: `set_<table>_updated_at` trigger using `set_updated_at()` function
- **Tables with counters**: counter cache triggers
- **Tables needing audit trail**: audit triggers (only if user requested)

First check if the `set_updated_at()` function already exists:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'set_updated_at';
```

Present:

```
| Table | Trigger | Event | Function |
|-------|---------|-------|----------|
| posts | set_posts_updated_at | BEFORE UPDATE | set_updated_at() |
| comments | set_comments_updated_at | BEFORE UPDATE | set_updated_at() |
```

Ask: "Here are the suggested triggers. Any additions (audit log, counter caches, auto-populate)?"

### Phase 7: Indexes

Suggest indexes based on FK columns and likely query patterns. Reference `${CLAUDE_PLUGIN_ROOT}/references/index-patterns.md`.

Rules:
- Every FK column gets an index (PostgreSQL does NOT auto-index FKs)
- Columns with names like `status`, `email`, `slug`, `type` likely appear in WHERE clauses
- Unique constraints create implicit indexes — skip those

Present:

```
| Table | Index Name | Column(s) | Type | Rationale |
|-------|-----------|-----------|------|-----------|
| posts | idx_posts_user_id | user_id | B-tree | FK to auth.users |
| comments | idx_comments_post_id | post_id | B-tree | FK to posts |
| comments | idx_comments_user_id | user_id | B-tree | FK to auth.users |
```

Ask: "Here are the suggested indexes. Any additions or removals?"

### Phase 8: Review

Generate the complete SQL migration combining ALL tables, RLS, triggers, and indexes into a single migration file.

Structure the SQL in this order:
1. `CREATE TABLE` statements (respecting FK dependency order)
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for each table
3. `CREATE POLICY` statements
4. `CREATE OR REPLACE FUNCTION` for triggers (if `set_updated_at()` doesn't exist yet)
5. `CREATE TRIGGER` statements
6. `CREATE INDEX` statements

Present the full SQL in a code block.

Then invoke the `schema-reviewer` agent from this plugin's `agents/` directory. Provide the full SQL as context. Present the reviewer's findings to the user.

Ask: "Here is the full migration SQL and the reviewer's analysis. Ready to apply, or do you want to make changes?"

If changes are needed, identify which phase to loop back to (e.g., "Let's go back to the columns for `posts`") and resume from there.

### Phase 9: Apply Migration

1. Generate a timestamp: current UTC time as `YYYYMMDDHHMMSS`.
2. Derive a feature name from the domain (e.g., `create_blog_schema`, `create_todo_schema`).
3. Write the SQL to `supabase/migrations/<timestamp>_<feature_name>.sql`.
4. Call `mcp__claude_ai_Supabase-BubblesKit__apply_migration` with:
   - `name`: the migration filename (without path)
   - `query`: the full SQL content
5. Verify by calling `mcp__claude_ai_Supabase-BubblesKit__list_tables` to confirm all tables exist.
6. Optionally call `mcp__claude_ai_Supabase-BubblesKit__get_advisors` for security/performance recommendations on the new schema.

### Phase 10: Generate Cross-Platform Models

For each new table, generate model files on all three platforms.

**TypeScript:**
1. Call `mcp__claude_ai_Supabase-BubblesKit__generate_typescript_types` and write to `multi-repo-nextjs/lib/database.types.ts`.
2. For each table, create a per-table interface file. Determine the appropriate subdirectory based on the feature (e.g., `lib/blog/post.ts` for a `posts` table). Follow the pattern from `multi-repo-nextjs/lib/auth/profile.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export interface <PascalName> {
  id: string;
  // ... columns with mapped types from type-mapping.md
  created_at: string;
  updated_at: string;
}
```

**Swift:**
For each table, create `multi-repo-ios/multi-repo-ios/Models/<PascalName>Model.swift`. Follow the exact pattern from `multi-repo-ios/multi-repo-ios/Models/ProfileModel.swift`:

```swift
import Foundation

struct <PascalName>Model: Codable, Identifiable, Sendable {
    let id: UUID
    // var for mutable fields, let for immutable (id, created_at, updated_at, user_id)
    // Use CodingKeys for snake_case -> camelCase mapping
}
```

Reference `${CLAUDE_PLUGIN_ROOT}/references/model-templates/swift-model.template` and `${CLAUDE_PLUGIN_ROOT}/references/type-mapping.md`.

**Kotlin:**
For each table, create `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/model/<PascalName>Model.kt`. Follow the exact pattern from `multi-repo-android/.../data/model/ProfileModel.kt`:

```kotlin
@Serializable
data class <PascalName>Model(
    val id: String,
    // Use @SerialName("snake_case") for column mapping
)
```

Reference `${CLAUDE_PLUGIN_ROOT}/references/model-templates/kotlin-model.template` and `${CLAUDE_PLUGIN_ROOT}/references/type-mapping.md`.

**Documentation:**
Append a section for EACH new table to `docs/api-contracts.md`, following the format of the existing `profiles` entry. Include:
- Column table (Column, Type, Nullable, Default, Notes)
- RLS Policies list
- Trigger documentation
- Type mappings table (Column, TypeScript, Swift, Kotlin)
- Model file paths per platform

### Phase 11: Summary

```
## Schema Design Complete

### Tables Created
| Table | Columns | RLS | Triggers | Indexes |
|-------|---------|-----|----------|---------|
| posts | 7 | 4 policies | updated_at | 1 (user_id) |
| comments | 6 | 4 policies | updated_at | 2 (post_id, user_id) |

### Migration
  ✓ supabase/migrations/<timestamp>_<name>.sql

### Models Generated
| Table | TypeScript | Swift | Kotlin |
|-------|-----------|-------|--------|
| posts | lib/blog/post.ts | Models/PostModel.swift | data/model/PostModel.kt |
| comments | lib/blog/comment.ts | Models/CommentModel.swift | data/model/CommentModel.kt |

### Also Updated
  ✓ multi-repo-nextjs/lib/database.types.ts (regenerated)
  ✓ docs/api-contracts.md (new table sections added)

### Next Steps
- Run supabase-schema-validator to verify sync
- Use /cross-platform-feature to scaffold screens for these entities
- Use /add-migration for future schema changes
```

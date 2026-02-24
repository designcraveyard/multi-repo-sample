# API Contracts & Data Models

Shared data model definitions for Supabase tables and cross-platform type contracts.
Updated by `/prd-update` and `/supabase-schema-validator` after schema changes.

---

## Supabase Tables

### `profiles`

Auto-created for each `auth.users` row via a database trigger.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | `uuid` | No | — | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `display_name` | `text` | Yes | `''` | Populated from OAuth `full_name` / `name` metadata |
| `avatar_url` | `text` | Yes | `''` | Populated from OAuth `avatar_url` / `picture` metadata |
| `created_at` | `timestamptz` | No | `now()` | |
| `updated_at` | `timestamptz` | No | `now()` | |

**RLS Policies:**
- `profiles_select_own` — `SELECT` where `auth.uid() = id`
- `profiles_update_own` — `UPDATE` where `auth.uid() = id`
- `profiles_insert_own` — `INSERT` with check `auth.uid() = id`

**Trigger:** `on_auth_user_created` — calls `handle_new_user()` to auto-insert a profile row on `auth.users` INSERT.

**Type mappings:**

| Column | TypeScript | Swift | Kotlin |
|--------|-----------|-------|--------|
| `id` | `string` | `String` | `String` |
| `display_name` | `string \| null` | `String?` | `String?` |
| `avatar_url` | `string \| null` | `String?` | `String?` |
| `created_at` | `string` | `Date` | `String` |
| `updated_at` | `string` | `Date` | `String` |

**Model files:**
- Web: `lib/auth/profile.ts` (`Profile` interface)
- iOS: `Models/ProfileModel.swift` (`ProfileModel` struct)
- Android: `data/model/ProfileModel.kt` (`ProfileModel` data class)

---

## Type Mapping Reference

When adding a new Supabase table, apply these mappings across all three layers:


| PostgreSQL Type            | TypeScript Type | Swift Type           |
| -------------------------- | --------------- | -------------------- |
| `uuid`                     | `string`        | `String` (or `UUID`) |
| `text`                     | `string`        | `String`             |
| `varchar`                  | `string`        | `String`             |
| `integer` / `int4`         | `number`        | `Int`                |
| `bigint` / `int8`          | `number`        | `Int`                |
| `numeric` / `decimal`      | `number`        | `Double`             |
| `boolean`                  | `boolean`       | `Bool`               |
| `timestamp with time zone` | `string`        | `Date`               |
| `jsonb`                    | `Json`          | `Codable` struct     |
| `text[]`                   | `string[]`      | `[String]`           |


Nullable columns → TypeScript `| null`, Swift `Optional` (e.g. `String?`).

---

## Sync Checklist (per table)

When adding a migration:

1. `supabase/migrations/<timestamp>_create_<table>.sql` — migration file
2. `supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts`
3. `multi-repo-ios/multi-repo-ios/Models/<Table>Model.swift` — matching Swift struct
4. Run `/supabase-schema-validator` to confirm all three are in sync
5. Update the **Supabase Tables** section above

---

## RLS Policy Conventions

- RLS enabled by default on all tables
- User-owned rows: filter by `auth.uid() = user_id`
- Public read tables are explicitly noted per-table above


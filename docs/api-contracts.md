# API Contracts & Data Models

Shared data model definitions for Supabase tables and cross-platform type contracts.
Updated by `/prd-update` and `/supabase-schema-validator` after schema changes.

---

## Supabase Tables

*Tables will be documented here as migrations are added.*

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


# PostgreSQL <-> Cross-Platform Type Mapping

## Core Types

| PostgreSQL Type | TypeScript | Swift | Kotlin | Notes |
|----------------|-----------|-------|--------|-------|
| `uuid` | `string` | `UUID` | `String` | PK default: `gen_random_uuid()` |
| `text` | `string` | `String` | `String` | Prefer over `varchar` |
| `varchar` | `string` | `String` | `String` | Use `text` instead |
| `integer` / `int4` | `number` | `Int` | `Int` | |
| `bigint` / `int8` | `number` | `Int` | `Long` | |
| `smallint` / `int2` | `number` | `Int16` | `Short` | |
| `numeric` / `decimal` | `number` | `Double` | `Double` | |
| `real` / `float4` | `number` | `Float` | `Float` | |
| `double precision` | `number` | `Double` | `Double` | |
| `boolean` | `boolean` | `Bool` | `Boolean` | |
| `timestamptz` | `string` | `Date` | `String` | Always use `timestamptz`, never `timestamp` |
| `date` | `string` | `Date` | `String` | |
| `time` | `string` | `String` | `String` | |
| `jsonb` | `Json` | Typed `Codable` struct | Typed `@Serializable` data class | Avoid for relational data |
| `text[]` | `string[]` | `[String]` | `List<String>` | Consider separate table |
| `uuid[]` | `string[]` | `[String]` | `List<String>` | |
| `int4[]` | `number[]` | `[Int]` | `List<Int>` | |

## Nullability

| PostgreSQL | TypeScript | Swift | Kotlin |
|-----------|-----------|-------|--------|
| `NOT NULL` | `T` | `T` (non-optional) | `T` |
| Nullable | `T \| null` | `T?` | `T? = null` |

## Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| PostgreSQL column | `snake_case` | `display_name` |
| TypeScript property | `snake_case` (matches DB) | `display_name` |
| Swift property | `camelCase` + `CodingKeys` | `displayName` via `case displayName = "display_name"` |
| Kotlin property | `camelCase` + `@SerialName` | `displayName` via `@SerialName("display_name")` |

## Standard Columns (include in every table)

```sql
id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
created_at   timestamptz DEFAULT now() NOT NULL,
updated_at   timestamptz DEFAULT now() NOT NULL
```

For user-owned tables, add:
```sql
user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
```

## Mutability Rules

| Column | Swift | Kotlin | Reason |
|--------|-------|--------|--------|
| `id` | `let` | `val` | Immutable PK |
| `created_at` | `let` | `val` | Server-managed |
| `updated_at` | `let` | `val` | Server-managed |
| `user_id` | `let` | `val` | Immutable after creation |
| Other columns | `var` | `val` (copy via `copy()`) | User-editable |

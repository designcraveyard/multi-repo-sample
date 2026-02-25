# Index Patterns

Reference for database indexes. Used by `/schema-design` Phase 7.

## Rules

1. **Always index foreign key columns** — PostgreSQL does NOT auto-create indexes on FK columns
2. **Index columns in WHERE and ORDER BY** for common queries
3. **Unique constraints create implicit indexes** — no separate index needed
4. **Composite indexes**: put the most selective column first
5. **Partial indexes** for filtered queries (e.g., active records only)

## Common Patterns

### Foreign Key Index (required for every FK)

```sql
CREATE INDEX idx_<table>_<fk_column> ON public.<table> (<fk_column>);
```

### Composite Index

```sql
CREATE INDEX idx_<table>_<col1>_<col2> ON public.<table> (<col1>, <col2>);
```

### Partial Index (soft delete / status filter)

```sql
CREATE INDEX idx_<table>_active ON public.<table> (user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_<table>_status ON public.<table> (status)
    WHERE status != 'archived';
```

### GIN Index (JSONB queries)

```sql
CREATE INDEX idx_<table>_<jsonb_col> ON public.<table>
    USING GIN (<jsonb_col>);
```

### Full-Text Search Index

```sql
CREATE INDEX idx_<table>_<text_col>_search ON public.<table>
    USING GIN (to_tsvector('english', <text_col>));
```

### Unique Index

```sql
CREATE UNIQUE INDEX idx_<table>_<col>_unique ON public.<table> (<col>);
```

## Naming Convention

Pattern: `idx_<table>_<column(s)>[_suffix]`

| Suffix | Meaning |
|--------|---------|
| (none) | Standard B-tree index |
| `_unique` | Unique constraint index |
| `_active` | Partial index for active records |
| `_search` | Full-text search GIN index |
| `_gin` | GIN index for JSONB |

## When NOT to Index

- Columns only used in INSERT (no queries filter on them)
- Boolean columns with low selectivity (most rows are `true` or `false`)
- Tables with < 1000 rows (seq scan is faster)
- Columns already covered by a composite index as the leftmost prefix

# Common Trigger Patterns

Reference for database triggers. Used by `/schema-design` Phase 6.

## 1. Auto-Update `updated_at` (apply to every table)

```sql
-- Create the reusable function ONCE (check if it already exists)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Per-table trigger
CREATE TRIGGER set_<table>_updated_at
    BEFORE UPDATE ON public.<table>
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

## 2. Auto-Populate on Insert

Create a related row when a new record is inserted (like profile creation on signup).

```sql
CREATE OR REPLACE FUNCTION public.handle_new_<entity>()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.<target_table> (id, <columns>)
    VALUES (NEW.id, <values>);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_<source_table>_created
    AFTER INSERT ON <source_schema>.<source_table>
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_<entity>();
```

**Note:** Use `SECURITY DEFINER` only when accessing tables the trigger caller can't (e.g., `auth.users`).

## 3. Audit Log

Track all changes to a table.

```sql
-- Audit log table (create once)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name text        NOT NULL,
    record_id  uuid        NOT NULL,
    action     text        NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data   jsonb,
    new_data   jsonb,
    changed_by uuid        REFERENCES auth.users(id),
    changed_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Reusable audit function
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) END,
        auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to a table
CREATE TRIGGER audit_<table>
    AFTER INSERT OR UPDATE OR DELETE ON public.<table>
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();
```

## 4. Soft Delete

Instead of actually deleting rows, mark them with a timestamp.

```sql
-- Add column
ALTER TABLE public.<table> ADD COLUMN deleted_at timestamptz;

-- Update RLS to exclude soft-deleted rows
DROP POLICY IF EXISTS "<table>_select_own" ON public.<table>;
CREATE POLICY "<table>_select_own" ON public.<table>
    FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Optional: index for performance
CREATE INDEX idx_<table>_active ON public.<table> (user_id)
    WHERE deleted_at IS NULL;
```

## 5. Counter Cache

Maintain a count column on a parent table.

```sql
-- Add counter column to parent
ALTER TABLE public.<parent> ADD COLUMN <child>_count integer DEFAULT 0 NOT NULL;

-- Trigger function
CREATE OR REPLACE FUNCTION public.update_<parent>_<child>_count()
RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.<parent> SET <child>_count = <child>_count + 1
        WHERE id = NEW.<parent>_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.<parent> SET <child>_count = <child>_count - 1
        WHERE id = OLD.<parent>_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_<parent>_<child>_count
    AFTER INSERT OR DELETE ON public.<child>
    FOR EACH ROW EXECUTE FUNCTION public.update_<parent>_<child>_count();
```

## Trigger Naming Convention

| Pattern | Example |
|---------|---------|
| `set_<table>_updated_at` | `set_posts_updated_at` |
| `on_<source>_created` | `on_auth_user_created` |
| `audit_<table>` | `audit_posts` |
| `update_<parent>_<child>_count` | `update_posts_comments_count` |

## Important Rules

- Use `SECURITY DEFINER` only when the trigger needs to access tables the caller can't
- Avoid trigger chains that could cause infinite loops
- `BEFORE UPDATE` for data modification (like `updated_at`)
- `AFTER INSERT/UPDATE/DELETE` for side effects (audit, counters)
- Always use `CREATE OR REPLACE FUNCTION` so migrations are idempotent

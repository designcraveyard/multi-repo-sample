#!/usr/bin/env python3
"""PreToolUse hook: Reminds to generate cross-platform models when writing migration files."""

import json
import sys


def main():
    try:
        tool_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    content = tool_input.get("content", "") or tool_input.get("new_string", "")

    if not file_path or not content:
        sys.exit(0)

    # Only fire for migration SQL files
    if "supabase/migrations/" not in file_path or not file_path.endswith(".sql"):
        sys.exit(0)

    # Check if this contains DDL statements
    content_upper = content.upper()
    has_ddl = any(
        kw in content_upper
        for kw in ("CREATE TABLE", "ALTER TABLE", "DROP TABLE")
    )

    if has_ddl:
        print(
            "\n[schema-builder] Migration with DDL detected.\n"
            "[schema-builder] After applying, remember to:\n"
            "[schema-builder]   1. Generate TS types (MCP generate_typescript_types or supabase gen types)\n"
            "[schema-builder]   2. Create/update Swift model in multi-repo-ios/multi-repo-ios/Models/\n"
            "[schema-builder]   3. Create/update Kotlin model in multi-repo-android/.../data/model/\n"
            "[schema-builder]   4. Update docs/api-contracts.md\n"
            "[schema-builder] Or use /schema-design or /add-migration to do this automatically.\n",
            file=sys.stderr,
        )

    # Non-blocking reminder
    sys.exit(0)


if __name__ == "__main__":
    main()

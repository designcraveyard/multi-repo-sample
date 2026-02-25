#!/usr/bin/env python3
"""PostToolUse hook: Reminds to check schema sync when model files are edited."""

import json
import os
import sys


def main():
    try:
        tool_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)

    basename = os.path.basename(file_path)

    # Detect model file edits across all three platforms
    is_swift_model = (
        file_path.endswith(".swift")
        and "multi-repo-ios" in file_path
        and "/Models/" in file_path
        and "Model" in basename
    )
    is_kotlin_model = (
        file_path.endswith(".kt")
        and "multi-repo-android" in file_path
        and "/data/model/" in file_path
        and "Model" in basename
    )
    is_ts_type = (
        file_path.endswith(".ts")
        and "multi-repo-nextjs" in file_path
        and "database.types" in basename
    )

    if not (is_swift_model or is_kotlin_model or is_ts_type):
        sys.exit(0)

    if is_swift_model:
        platform = "Swift"
    elif is_kotlin_model:
        platform = "Kotlin"
    else:
        platform = "TypeScript"

    counterparts = []
    if not is_swift_model:
        counterparts.append("Swift model (multi-repo-ios/multi-repo-ios/Models/)")
    if not is_kotlin_model:
        counterparts.append("Kotlin model (multi-repo-android/.../data/model/)")
    if not is_ts_type:
        counterparts.append("TypeScript types (multi-repo-nextjs/lib/database.types.ts)")

    print(
        f"\n[schema-sync] {platform} model file edited: {basename}\n"
        f"[schema-sync] Ensure these counterparts match:\n"
        + "".join(f"[schema-sync]   - {c}\n" for c in counterparts)
        + "[schema-sync]   - Supabase schema (supabase/migrations/)\n"
        "[schema-sync]   - docs/api-contracts.md\n"
        "[schema-sync] Run supabase-schema-validator agent to verify sync.\n",
        file=sys.stderr,
    )

    sys.exit(0)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""PreToolUse hook: BLOCKS TypeScript agent files using Zod v3 instead of v4."""

import json
import os
import re
import sys


def main():
    try:
        tool_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    content = tool_input.get("content", "") or tool_input.get("new_string", "")

    if not content:
        sys.exit(0)

    # Only check TypeScript files
    if not (file_path.endswith(".ts") or file_path.endswith(".tsx")):
        sys.exit(0)

    # Only check files that import from @openai/agents
    if "@openai/agents" not in content:
        sys.exit(0)

    # Check if file imports zod
    has_zod_import = re.search(r"""from\s+['"]zod['"]""", content)
    if not has_zod_import:
        sys.exit(0)

    # Try to check package.json in the same directory for zod version
    dir_path = os.path.dirname(file_path)
    pkg_path = os.path.join(dir_path, "package.json")

    # Also check parent directory (common in src/ layouts)
    parent_pkg_path = os.path.join(os.path.dirname(dir_path), "package.json")

    zod_version = None
    for check_path in [pkg_path, parent_pkg_path]:
        if os.path.exists(check_path):
            try:
                with open(check_path) as f:
                    pkg = json.load(f)
                deps = pkg.get("dependencies", {})
                zod_version = deps.get("zod", "")
                break
            except (json.JSONDecodeError, OSError):
                pass

    # If we found a zod version, check if it's v4
    if zod_version:
        is_v4 = zod_version.startswith("^4") or zod_version.startswith("4") or zod_version.startswith("~4")
        if not is_v4:
            print(
                f"BLOCKED: Zod version '{zod_version}' detected. "
                "OpenAI Agents SDK for TypeScript requires Zod v4. "
                "Update package.json to use `\"zod\": \"^4\"` and run `npm install`.",
                file=sys.stderr,
            )
            sys.exit(1)

    # If we couldn't find package.json, check for v3-specific patterns in the code
    v3_patterns = [
        r'z\.nativeEnum\(',    # Removed in v4
        r'z\.promise\(',       # Changed in v4
        r'\.refine\(',         # Still exists but check context
    ]

    # Only flag if there's a clear v3-only pattern
    if re.search(r'z\.nativeEnum\(', content):
        print(
            "BLOCKED: z.nativeEnum() is a Zod v3 pattern. "
            "OpenAI Agents SDK TypeScript requires Zod v4. "
            "Use z.enum() or z.literal() instead.",
            file=sys.stderr,
        )
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()

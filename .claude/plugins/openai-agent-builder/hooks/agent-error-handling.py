#!/usr/bin/env python3
"""PreToolUse hook: WARNS when agent run calls lack error handling."""

import json
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

    # Only check Python and TypeScript agent files
    is_python = file_path.endswith(".py")
    is_typescript = file_path.endswith(".ts") or file_path.endswith(".tsx")

    if not (is_python or is_typescript):
        sys.exit(0)

    # Patterns for agent run calls
    run_patterns = [
        r'Runner\.run\(',
        r'await\s+run\(',
        r'agent\.run\(',
        r'Runner\.run_streamed\(',
    ]

    has_run_call = any(re.search(p, content) for p in run_patterns)
    if not has_run_call:
        sys.exit(0)

    # Check if there's error handling around the run calls
    if is_python:
        has_error_handling = "try:" in content and "except" in content
    else:
        has_error_handling = "try" in content and "catch" in content

    if not has_error_handling:
        print(
            "WARNING: Agent run calls (Runner.run / run()) can fail with network errors, "
            "rate limits, or guardrail trips. Wrap in try/except (Python) or try/catch "
            "(TypeScript) for production safety.",
            file=sys.stderr,
        )

    # Always exit 0 — this is a warning, not a block
    sys.exit(0)


if __name__ == "__main__":
    main()

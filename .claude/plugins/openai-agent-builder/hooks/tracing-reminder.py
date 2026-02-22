#!/usr/bin/env python3
"""PostToolUse hook: Reminds to add tracing when creating new agent files."""

import json
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

    # Only check files that look like agent definitions
    is_agent_file = any(
        name in file_path
        for name in ["agent.py", "agent.ts", "triage.py", "triage.ts"]
    )

    if not is_agent_file:
        sys.exit(0)

    # Check if tracing is already imported
    has_tracing = any(
        keyword in content
        for keyword in ["from agents import trace", "import trace", "withTrace", "tracing"]
    )

    if not has_tracing:
        print(
            "REMINDER: Consider adding tracing for debugging and monitoring. "
            "Python: `from agents import trace` + `with trace('name'):`. "
            "TypeScript: configure tracing in agent options.",
            file=sys.stderr,
        )

    sys.exit(0)


if __name__ == "__main__":
    main()

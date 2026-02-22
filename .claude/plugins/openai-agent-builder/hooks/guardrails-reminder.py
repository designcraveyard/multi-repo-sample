#!/usr/bin/env python3
"""PostToolUse hook: Reminds to add guardrails when creating agent files."""

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

    # Only check files that define agents
    is_agent_file = any(
        name in file_path
        for name in ["agent.py", "agent.ts", "triage.py", "triage.ts"]
    )

    if not is_agent_file:
        sys.exit(0)

    # Check if the file defines an Agent
    defines_agent = "Agent(" in content or "new Agent(" in content

    if not defines_agent:
        sys.exit(0)

    # Check if guardrails are referenced
    has_guardrails = any(
        keyword in content
        for keyword in [
            "guardrail",
            "input_guardrails",
            "output_guardrails",
            "inputGuardrails",
            "outputGuardrails",
            "InputGuardrail",
            "OutputGuardrail",
        ]
    )

    if not has_guardrails:
        print(
            "REMINDER: Consider adding guardrails for production safety. "
            "Python: `input_guardrails=[...]` on Agent. "
            "TypeScript: `inputGuardrails: [...]` in Agent config.",
            file=sys.stderr,
        )

    sys.exit(0)


if __name__ == "__main__":
    main()

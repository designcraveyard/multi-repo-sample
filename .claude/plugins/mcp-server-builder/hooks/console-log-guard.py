#!/usr/bin/env python3
"""Advisory hook: warns when console.log is used in mcp-server* TypeScript files.
stdout is reserved for JSON-RPC in MCP servers — use console.error instead."""

import json
import sys
import re

def main():
    try:
        hook_input = json.load(sys.stdin)
    except Exception:
        sys.exit(0)

    tool_name = hook_input.get("tool_name", "")
    tool_input = hook_input.get("tool_input", {})

    if tool_name not in ("Write", "Edit"):
        sys.exit(0)

    file_path = tool_input.get("file_path", "")

    # Only check TypeScript files in mcp-server directories
    if not re.search(r"mcp-server[^/]*/.*\.ts$", file_path):
        sys.exit(0)

    content = tool_input.get("content", "") or tool_input.get("new_string", "")
    if not content:
        sys.exit(0)

    if re.search(r"\bconsole\.log\b", content):
        print(
            f"[mcp-server-builder] WARNING: console.log detected in {file_path}\n"
            "MCP servers must not write to stdout (reserved for JSON-RPC).\n"
            "Use console.error() for all logging.",
            file=sys.stderr
        )

if __name__ == "__main__":
    main()

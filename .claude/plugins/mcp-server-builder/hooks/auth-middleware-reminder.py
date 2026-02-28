#!/usr/bin/env python3
"""Advisory hook: warns when an MCP server entry point (index.ts / server.ts)
in a mcp-server* directory is written without importing an auth middleware."""

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

    # Only check index.ts or server.ts inside mcp-server* directories
    if not re.search(r"mcp-server[^/]*/src/(index|server)\.ts$", file_path):
        sys.exit(0)

    content = tool_input.get("content", "") or tool_input.get("new_string", "")
    if not content:
        sys.exit(0)

    has_auth_import = re.search(r"import.*auth", content, re.IGNORECASE)
    has_auth_usage = re.search(r"authMiddleware|apiKeyMiddleware|auth\(", content)

    if not (has_auth_import and has_auth_usage):
        print(
            f"[mcp-server-builder] REMINDER: {file_path} appears to be an MCP server entry point.\n"
            "Ensure you import and apply an auth middleware (authMiddleware / apiKeyMiddleware)\n"
            "to all /mcp routes before connecting the transport.",
            file=sys.stderr
        )

if __name__ == "__main__":
    main()

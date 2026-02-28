#!/usr/bin/env python3
"""Advisory hook: reminds to update .mcp.json when a new MCP server
entry point (index.ts) or package.json is created inside a mcp-server* directory."""

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

    if tool_name != "Write":
        sys.exit(0)

    file_path = tool_input.get("file_path", "")

    # Trigger on index.ts or package.json in any mcp-server* directory
    if not re.search(r"mcp-server[^/]+/(src/index\.ts|package\.json)$", file_path):
        sys.exit(0)

    print(
        f"[mcp-server-builder] REMINDER: New MCP server file created at {file_path}\n"
        "Don't forget to add an entry to .mcp.json:\n"
        '  "your-server-name": {\n'
        '    "type": "http",\n'
        '    "url": "http://localhost:<PORT>/mcp",\n'
        '    "headers": { "Authorization": "Bearer ${YOUR_TOKEN}" }\n'
        "  }",
        file=sys.stderr
    )

if __name__ == "__main__":
    main()

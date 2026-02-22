#!/usr/bin/env python3
"""PreToolUse hook: BLOCKS writes that contain hardcoded API keys."""

import json
import re
import sys


def main():
    try:
        tool_input = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    # Get file path and content from tool input
    file_path = tool_input.get("file_path", "")
    content = tool_input.get("content", "") or tool_input.get("new_string", "")

    if not content:
        sys.exit(0)

    # Allow .env and .env.example files
    if file_path.endswith(".env") or file_path.endswith(".env.example"):
        sys.exit(0)

    # Patterns that indicate hardcoded API keys
    patterns = [
        r'sk-[a-zA-Z0-9]{20,}',                         # OpenAI API key format
        r'OPENAI_API_KEY\s*=\s*["\'][^"\']{10,}["\']',   # Assigned key string
        r'api_key\s*=\s*["\']sk-',                        # api_key param with key
        r'apiKey\s*[:=]\s*["\']sk-',                      # JS/TS apiKey with key
        r'Authorization.*Bearer\s+sk-',                   # Auth header with key
    ]

    for pattern in patterns:
        if re.search(pattern, content):
            print(
                "BLOCKED: Hardcoded API key detected. "
                "Use .env and os.getenv() (Python) or process.env (TypeScript) "
                "instead of hardcoding API keys in source files.",
                file=sys.stderr,
            )
            sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()

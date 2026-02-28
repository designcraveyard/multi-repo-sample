#!/usr/bin/env bash
# config-writer.sh — Generate config files from templates with placeholder substitution
# Usage: ./scripts/config-writer.sh <target-dir> <templates-dir> <values-json> <app-slug> <platforms>

set -euo pipefail

TARGET_DIR="${1:?Usage: config-writer.sh <target-dir> <templates-dir> <values-json> <app-slug> <platforms>}"
TEMPLATES_DIR="${2:?Missing templates directory}"
VALUES_JSON="${3:?Missing values JSON}"
APP_SLUG="${4:?Missing app slug}"
PLATFORMS="${5:-all}"

if [ ! -d "$TEMPLATES_DIR" ]; then
  echo "ERROR: Templates directory does not exist: $TEMPLATES_DIR" >&2
  exit 1
fi

echo "Generating config files from templates..."

# Function to substitute {{PLACEHOLDER}} tokens in a template
substitute_template() {
  local template_file="$1"
  local output_file="$2"

  if [ ! -f "$template_file" ]; then
    echo "  SKIP: Template not found: $template_file"
    return
  fi

  echo "  Writing: $output_file"
  cp "$template_file" "$output_file"

  # Extract all {{PLACEHOLDER}} tokens from the file
  PLACEHOLDERS=$(grep -oE '\{\{[A-Z_]+\}\}' "$output_file" | sort -u || true)

  for TOKEN in $PLACEHOLDERS; do
    # Strip {{ and }}
    KEY="${TOKEN#\{\{}"
    KEY="${KEY%\}\}}"
    VALUE=$(echo "$VALUES_JSON" | jq -r ".${KEY} // empty")

    if [ -n "$VALUE" ]; then
      LC_ALL=C perl -pi -e "s/\Q${TOKEN}\E/${VALUE}/g" "$output_file"
    fi
  done
}

# Web: .env.local
WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
if [ -d "$WEB_DIR" ]; then
  substitute_template "$TEMPLATES_DIR/env-local.template" "$WEB_DIR/.env.local"
fi

# iOS: Secrets.swift (if template exists)
IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
if [ -d "$IOS_DIR" ]; then
  # Find the nested app directory (e.g., AppName-ios/AppName-ios/ or App/)
  IOS_APP_DIR=$(find "$IOS_DIR" -maxdepth 1 -type d ! -name '.*' ! -name "$IOS_DIR" | head -1)
  if [ -n "$IOS_APP_DIR" ] && [ -f "$TEMPLATES_DIR/secrets-swift.template" ]; then
    substitute_template "$TEMPLATES_DIR/secrets-swift.template" "$IOS_APP_DIR/Secrets.swift"
  fi
fi

# Android: local.properties
ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"
if [ -d "$ANDROID_DIR" ]; then
  substitute_template "$TEMPLATES_DIR/local-properties.template" "$ANDROID_DIR/local.properties"
fi

# Root: .mcp.json
if [ -f "$TEMPLATES_DIR/mcp-json.template" ]; then
  substitute_template "$TEMPLATES_DIR/mcp-json.template" "$TARGET_DIR/.mcp.json"
fi

# Root: .claude/settings.json
CLAUDE_DIR="$TARGET_DIR/.claude"
if [ -d "$CLAUDE_DIR" ] && [ -f "$TEMPLATES_DIR/settings-json.template" ]; then
  substitute_template "$TEMPLATES_DIR/settings-json.template" "$CLAUDE_DIR/settings.json"
fi

# Supabase: supabase/config.toml
SUPABASE_DIR="$TARGET_DIR/supabase"
if [ -d "$SUPABASE_DIR" ] && [ -f "$TEMPLATES_DIR/supabase-config.template" ]; then
  substitute_template "$TEMPLATES_DIR/supabase-config.template" "$SUPABASE_DIR/config.toml"
fi

echo "Config file generation complete."

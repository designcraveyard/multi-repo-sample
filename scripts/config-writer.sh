#!/usr/bin/env bash
# config-writer.sh — Generate config files from templates with placeholder substitution
# Usage: ./scripts/config-writer.sh <target-dir> <templates-dir> <values-json> <app-slug> <platforms>

set -euo pipefail

TARGET_DIR="${1:?Usage: config-writer.sh <target-dir> <templates-dir> <values-json> <app-slug> <platforms> [supabase-ref]}"
TEMPLATES_DIR="${2:?Missing templates directory}"
VALUES_JSON="${3:?Missing values JSON}"
APP_SLUG="${4:?Missing app slug}"
PLATFORMS="${5:-all}"
SUPABASE_REF="${6:-}"

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
      LC_ALL=C REPLACE_TOKEN="$TOKEN" REPLACE_VAL="$VALUE" \
        perl -pi -e 's/\Q$ENV{REPLACE_TOKEN}\E/$ENV{REPLACE_VAL}/g' "$output_file"
    fi
  done
}

# Web: .env.local
WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
if [ -d "$WEB_DIR" ]; then
  substitute_template "$TEMPLATES_DIR/env-local.template" "$WEB_DIR/.env.local"
fi

# iOS: Secrets.swift (only when Supabase is configured — local-first mode doesn't need it)
IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
if [ -d "$IOS_DIR" ] && [ -n "$SUPABASE_REF" ] && [ -f "$TEMPLATES_DIR/secrets-swift.template" ]; then
  substitute_template "$TEMPLATES_DIR/secrets-swift.template" "$IOS_DIR/Secrets.swift"
fi

# iOS: OpenAISecrets.swift (always generate with empty placeholders — user fills in their own key)
IOS_OPENAI_DIR="$IOS_DIR/${APP_SLUG}-ios/OpenAI"
if [ -d "$IOS_OPENAI_DIR" ] && [ -f "$TEMPLATES_DIR/openai-secrets-swift.template" ]; then
  substitute_template "$TEMPLATES_DIR/openai-secrets-swift.template" "$IOS_OPENAI_DIR/OpenAISecrets.swift"
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

# Root: pipeline.json (pipeline orchestrator state)
if [ -f "$TEMPLATES_DIR/pipeline-json.template" ]; then
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  HAS_SUPABASE="false"
  if [ -n "$SUPABASE_REF" ]; then
    HAS_SUPABASE="true"
  fi

  # Build platforms JSON array from PLATFORMS string (e.g., "web,ios,android" → ["web","ios","android"])
  PLATFORMS_JSON=$(echo "$PLATFORMS" | tr ',' '\n' | sed 's/^/"/;s/$/"/' | paste -sd',' - | sed 's/^/[/;s/$/]/')

  echo "  Writing: $TARGET_DIR/pipeline.json"
  cp "$TEMPLATES_DIR/pipeline-json.template" "$TARGET_DIR/pipeline.json"
  LC_ALL=C perl -pi -e "s/\\{\\{TIMESTAMP\\}\\}/$TIMESTAMP/g" "$TARGET_DIR/pipeline.json"
  LC_ALL=C perl -pi -e "s/\\{\\{HAS_SUPABASE\\}\\}/$HAS_SUPABASE/g" "$TARGET_DIR/pipeline.json"
  LC_ALL=C perl -pi -e "s/\\{\\{PLATFORMS_JSON\\}\\}/$PLATFORMS_JSON/g" "$TARGET_DIR/pipeline.json"

  # APP_NAME substitution is handled by the main VALUES_JSON loop via replace-params.sh
  APP_NAME_VAL=$(echo "$VALUES_JSON" | jq -r '.APP_NAME // empty')
  if [ -n "$APP_NAME_VAL" ]; then
    LC_ALL=C REPLACE_TOKEN="{{APP_NAME}}" REPLACE_VAL="$APP_NAME_VAL" \
      perl -pi -e 's/\Q$ENV{REPLACE_TOKEN}\E/$ENV{REPLACE_VAL}/g' "$TARGET_DIR/pipeline.json"
  fi
fi

echo "Config file generation complete."

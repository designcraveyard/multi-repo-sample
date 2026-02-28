#!/usr/bin/env bash
# platform-select.sh — Remove excluded platform directories and CLAUDE.md sections
# Usage: ./scripts/platform-select.sh <target-dir> <include-web> <include-ios> <include-android> <app-slug>

set -euo pipefail

TARGET_DIR="${1:?Usage: platform-select.sh <target-dir> <include-web> <include-ios> <include-android> <app-slug>}"
INCLUDE_WEB="${2:-true}"
INCLUDE_IOS="${3:-true}"
INCLUDE_ANDROID="${4:-true}"
APP_SLUG="${5:?Missing app-slug}"

echo "Platform selection: web=$INCLUDE_WEB, ios=$INCLUDE_IOS, android=$INCLUDE_ANDROID"

# Remove excluded platform directories
if [ "$INCLUDE_WEB" != "true" ]; then
  WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
  if [ -d "$WEB_DIR" ]; then
    echo "  Removing web platform: $WEB_DIR"
    rm -rf "$WEB_DIR"
  fi
fi

if [ "$INCLUDE_IOS" != "true" ]; then
  IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
  if [ -d "$IOS_DIR" ]; then
    echo "  Removing iOS platform: $IOS_DIR"
    rm -rf "$IOS_DIR"
  fi
fi

if [ "$INCLUDE_ANDROID" != "true" ]; then
  ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"
  if [ -d "$ANDROID_DIR" ]; then
    echo "  Removing Android platform: $ANDROID_DIR"
    rm -rf "$ANDROID_DIR"
  fi
fi

# Strip platform-specific sections from CLAUDE.md using marker comments
CLAUDE_MD="$TARGET_DIR/CLAUDE.md"
if [ -f "$CLAUDE_MD" ]; then
  echo "  Updating CLAUDE.md..."

  if [ "$INCLUDE_WEB" != "true" ]; then
    perl -0777 -pi -e 's/<!-- PLATFORM:WEB:START -->.*?<!-- PLATFORM:WEB:END -->\n?//s' "$CLAUDE_MD"
  fi

  if [ "$INCLUDE_IOS" != "true" ]; then
    perl -0777 -pi -e 's/<!-- PLATFORM:IOS:START -->.*?<!-- PLATFORM:IOS:END -->\n?//s' "$CLAUDE_MD"
  fi

  if [ "$INCLUDE_ANDROID" != "true" ]; then
    perl -0777 -pi -e 's/<!-- PLATFORM:ANDROID:START -->.*?<!-- PLATFORM:ANDROID:END -->\n?//s' "$CLAUDE_MD"
  fi

  # Clean up any remaining marker comments for included platforms
  perl -pi -e 's/<!-- PLATFORM:(WEB|IOS|ANDROID):(START|END) -->\n?//g' "$CLAUDE_MD"
fi

# Update .claude/settings.json if it exists — remove platform-specific hooks
SETTINGS="$TARGET_DIR/.claude/settings.json"
if [ -f "$SETTINGS" ]; then
  echo "  Updating .claude/settings.json..."

  if [ "$INCLUDE_WEB" != "true" ]; then
    # Remove hooks that reference web-specific paths
    jq 'walk(if type == "array" then [.[] | select(
      (type == "string" and (contains("-web/") or contains("-nextjs/"))) | not
    )] else . end)' "$SETTINGS" > "${SETTINGS}.tmp" && mv "${SETTINGS}.tmp" "$SETTINGS"
  fi

  if [ "$INCLUDE_IOS" != "true" ]; then
    jq 'walk(if type == "array" then [.[] | select(
      (type == "string" and (contains("-ios/") or contains(".swift"))) | not
    )] else . end)' "$SETTINGS" > "${SETTINGS}.tmp" && mv "${SETTINGS}.tmp" "$SETTINGS"
  fi

  if [ "$INCLUDE_ANDROID" != "true" ]; then
    jq 'walk(if type == "array" then [.[] | select(
      (type == "string" and (contains("-android/") or contains(".kt"))) | not
    )] else . end)' "$SETTINGS" > "${SETTINGS}.tmp" && mv "${SETTINGS}.tmp" "$SETTINGS"
  fi
fi

echo "Platform selection complete."

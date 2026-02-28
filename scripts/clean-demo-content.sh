#!/usr/bin/env bash
# clean-demo-content.sh — Strip showcase/demo content from scaffolded project
# Usage: ./scripts/clean-demo-content.sh <target-dir> <config-file> <app-slug>

set -euo pipefail

TARGET_DIR="${1:?Usage: clean-demo-content.sh <target-dir> <config-file> <app-slug>}"
CONFIG_FILE="${2:?Missing config file path}"
APP_SLUG="${3:?Missing app-slug}"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: Config file does not exist: $CONFIG_FILE" >&2
  exit 1
fi

echo "Cleaning demo content..."

# Read demo_content_to_remove array
DEMO_COUNT=$(jq -r '.demo_content_to_remove | length' "$CONFIG_FILE")

for ((i = 0; i < DEMO_COUNT; i++)); do
  DEMO_PATH=$(jq -r ".demo_content_to_remove[$i]" "$CONFIG_FILE")

  # Check in each platform sub-repo
  for PLATFORM_DIR in "$TARGET_DIR/${APP_SLUG}-web" "$TARGET_DIR/${APP_SLUG}-ios" "$TARGET_DIR/${APP_SLUG}-android"; do
    if [ ! -d "$PLATFORM_DIR" ]; then
      continue
    fi

    # Try both direct path and nested path (iOS has double-nested structure)
    for CANDIDATE in "$PLATFORM_DIR/$DEMO_PATH" "$PLATFORM_DIR"/*/"$DEMO_PATH"; do
      if [ -e "$CANDIDATE" ]; then
        echo "  Removing: $CANDIDATE"
        rm -rf "$CANDIDATE"
      fi
    done
  done
done

# Remove demo route imports from navigation files
echo "  Cleaning navigation references..."

# Web: AdaptiveNavShell — remove showcase/demo tabs
WEB_NAV="$TARGET_DIR/${APP_SLUG}-web/app/components/Adaptive/AdaptiveNavShell.tsx"
if [ -f "$WEB_NAV" ]; then
  # Remove lines referencing showcase, demo, editor-demo, input-demo
  perl -ni -e 'print unless /components-showcase|editor-demo|input-demo|showcase|ComponentsShowcase|EditorDemo|InputDemo/i' "$WEB_NAV"
fi

# iOS: ContentView or AdaptiveNavShell — remove showcase/demo tabs
for IOS_NAV in "$TARGET_DIR/${APP_SLUG}-ios"/**/AdaptiveNavShell.swift "$TARGET_DIR/${APP_SLUG}-ios"/**/ContentView.swift; do
  if [ -f "$IOS_NAV" ]; then
    perl -ni -e 'print unless /ComponentsShowcase|AIDemoView|ShowcaseView|EditorDemo/i' "$IOS_NAV"
  fi
done

# Android: MainActivity or AdaptiveNavShell — remove showcase/demo references
for ANDROID_NAV in "$TARGET_DIR/${APP_SLUG}-android"/**/AdaptiveNavShell.kt "$TARGET_DIR/${APP_SLUG}-android"/**/MainActivity.kt; do
  if [ -f "$ANDROID_NAV" ]; then
    perl -ni -e 'print unless /ShowcaseScreen|EditorScreen|showcase|editor.*demo/i' "$ANDROID_NAV"
  fi
done

echo "Demo content cleanup complete."

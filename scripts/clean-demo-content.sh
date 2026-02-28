#!/usr/bin/env bash
# clean-demo-content.sh — Strip showcase/demo content from scaffolded project
# Usage: ./scripts/clean-demo-content.sh <target-dir> <config-file> <app-slug> [app-description]

set -euo pipefail

TARGET_DIR="${1:?Usage: clean-demo-content.sh <target-dir> <config-file> <app-slug> [app-description]}"
CONFIG_FILE="${2:?Missing config file path}"
APP_SLUG="${3:?Missing app-slug}"
APP_DESCRIPTION="${4:-A cross-platform app}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

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

# ── Strip demo UI views (keep service layers like OpenAI, Audio) ───────────
# The OpenAI service layer and Audio recorder are infrastructure used by
# components like MarkdownEditor — they stay. Only demo VIEWS go.

echo "  Stripping demo UI views..."

for PLATFORM_DIR in "$TARGET_DIR/${APP_SLUG}-ios" "$TARGET_DIR/${APP_SLUG}-web" "$TARGET_DIR/${APP_SLUG}-android"; do
  if [ ! -d "$PLATFORM_DIR" ]; then
    continue
  fi

  # Remove demo views only (NOT the OpenAI service layer or Audio recorder)
  find "$PLATFORM_DIR" -name "AssistantView.swift" -delete 2>/dev/null || true
  rm -rf "$PLATFORM_DIR/app/assistant" 2>/dev/null || true
  rm -rf "$PLATFORM_DIR/app/assistant-embed" 2>/dev/null || true
  rm -rf "$PLATFORM_DIR/app/api/chatkit" 2>/dev/null || true
done

# ── Replace ContentView.swift with clean starter ───────────────────────────
# The template's ContentView.swift is a 93K component showcase — replace it.

IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
if [ -d "$IOS_DIR" ]; then
  CONTENT_VIEW=$(find "$IOS_DIR" -name "ContentView.swift" -type f 2>/dev/null | head -1)
  TEMPLATE_CV="$SCRIPT_DIR/templates/ContentView.swift.template"

  if [ -n "$CONTENT_VIEW" ] && [ -f "$TEMPLATE_CV" ]; then
    echo "  Replacing ContentView.swift with clean starter..."
    cp "$TEMPLATE_CV" "$CONTENT_VIEW"
    # Template placeholders will be resolved by replace-params.sh if it runs after,
    # or we do it inline here since this runs after replace-params
    # Resolve {{APP_NAME}} — convert slug to PascalCase
    perl -pi -e "s/\\{\\{APP_NAME\\}\\}/$(echo "$APP_SLUG" | perl -pe 's/(^|-)(\w)/uc($2)/ge')/g" "$CONTENT_VIEW"
    # Resolve {{APP_DESCRIPTION}}
    ESCAPED_DESC=$(echo "$APP_DESCRIPTION" | sed 's/[&/\\]/\\&/g')
    perl -pi -e "s/\\{\\{APP_DESCRIPTION\\}\\}/${ESCAPED_DESC}/g" "$CONTENT_VIEW"
  fi
fi

# ── Remove demo route imports from navigation files ────────────────────────

echo "  Cleaning navigation references..."

# Web: AdaptiveNavShell — remove showcase/demo tabs
WEB_NAV="$TARGET_DIR/${APP_SLUG}-web/app/components/Adaptive/AdaptiveNavShell.tsx"
if [ -f "$WEB_NAV" ]; then
  perl -ni -e 'print unless /components-showcase|editor-demo|input-demo|showcase|ComponentsShowcase|EditorDemo|InputDemo|assistant/i' "$WEB_NAV"
fi

# iOS: ContentView or AdaptiveNavShell — remove showcase/demo tabs
for IOS_NAV in "$TARGET_DIR/${APP_SLUG}-ios"/**/AdaptiveNavShell.swift; do
  if [ -f "$IOS_NAV" ]; then
    perl -ni -e 'print unless /ComponentsShowcase|AIDemoView|ShowcaseView|EditorDemo|AssistantView/i' "$IOS_NAV"
  fi
done

# Android: MainActivity or AdaptiveNavShell — remove showcase/demo references
for ANDROID_NAV in "$TARGET_DIR/${APP_SLUG}-android"/**/AdaptiveNavShell.kt "$TARGET_DIR/${APP_SLUG}-android"/**/MainActivity.kt; do
  if [ -f "$ANDROID_NAV" ]; then
    perl -ni -e 'print unless /ShowcaseScreen|EditorScreen|showcase|editor.*demo|AssistantScreen/i' "$ANDROID_NAV"
  fi
done

echo "Demo content cleanup complete."

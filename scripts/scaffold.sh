#!/usr/bin/env bash
# scaffold.sh — Main orchestrator for scaffolding a new project from the template
#
# Usage:
#   ./scripts/scaffold.sh --name "CoolApp" --platforms all --developer "john"
#
# Options:
#   --name          App name in PascalCase (required)
#   --description   One-line app description (default: "A cross-platform app")
#   --developer     Developer name (required)
#   --platforms     Comma-separated: web,ios,android or "all" (default: all)
#   --github-org    GitHub org/user (default: designcraveyard)
#   --team-id       Apple Development Team ID (default: XXXXXXXXXX)
#   --supabase-ref  Supabase project reference (optional)
#   --supabase-key  Supabase anon key (optional)
#   --brand         Brand palette name (default: zinc)
#   --neutral       Neutral palette name (default: neutral)
#   --radius        Corner radius preset (default: md)
#   --selection     Selection style: brand|neutral (default: brand)
#   --skip-git      Skip git init + GitHub repo creation (default: false)
#   --output-dir    Output parent directory (default: ~/Documents/GitHub)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$TEMPLATE_DIR/scaffold.config.json"

# ── Parse arguments ────────────────────────────────────────────────────────

APP_NAME=""
APP_DESCRIPTION="A cross-platform app"
DEVELOPER=""
PLATFORMS="all"
GITHUB_ORG="designcraveyard"
TEAM_ID="XXXXXXXXXX"
SUPABASE_REF=""
SUPABASE_KEY=""
BRAND="zinc"
NEUTRAL="neutral"
RADIUS="md"
SELECTION="brand"
SKIP_GIT="false"
OUTPUT_DIR="$HOME/Documents/GitHub"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) APP_NAME="$2"; shift 2 ;;
    --description) APP_DESCRIPTION="$2"; shift 2 ;;
    --developer) DEVELOPER="$2"; shift 2 ;;
    --platforms) PLATFORMS="$2"; shift 2 ;;
    --github-org) GITHUB_ORG="$2"; shift 2 ;;
    --team-id) TEAM_ID="$2"; shift 2 ;;
    --supabase-ref) SUPABASE_REF="$2"; shift 2 ;;
    --supabase-key) SUPABASE_KEY="$2"; shift 2 ;;
    --brand) BRAND="$2"; shift 2 ;;
    --neutral) NEUTRAL="$2"; shift 2 ;;
    --radius) RADIUS="$2"; shift 2 ;;
    --selection) SELECTION="$2"; shift 2 ;;
    --skip-git) SKIP_GIT="true"; shift ;;
    --output-dir) OUTPUT_DIR="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [ -z "$APP_NAME" ]; then
  echo "ERROR: --name is required" >&2
  exit 1
fi

if [ -z "$DEVELOPER" ]; then
  echo "ERROR: --developer is required" >&2
  exit 1
fi

# ── Derive values ──────────────────────────────────────────────────────────

# APP_SLUG: PascalCase → kebab-case (perl for macOS compatibility — BSD sed lacks \L)
APP_SLUG=$(echo "$APP_NAME" | perl -pe 's/([A-Z])/-\L$1/g' | sed 's/^-//')
APP_SLUG_UNDERSCORE="${APP_SLUG//-/_}"
APP_SLUG_NO_DASH="${APP_SLUG//-/}"

# Platform flags
INCLUDE_WEB="false"
INCLUDE_IOS="false"
INCLUDE_ANDROID="false"

if [ "$PLATFORMS" = "all" ]; then
  INCLUDE_WEB="true"
  INCLUDE_IOS="true"
  INCLUDE_ANDROID="true"
else
  IFS=',' read -ra PLATFORM_LIST <<< "$PLATFORMS"
  for p in "${PLATFORM_LIST[@]}"; do
    case "$(echo "$p" | tr '[:upper:]' '[:lower:]' | xargs)" in
      web) INCLUDE_WEB="true" ;;
      ios) INCLUDE_IOS="true" ;;
      android) INCLUDE_ANDROID="true" ;;
      *) echo "WARNING: Unknown platform '$p'" >&2 ;;
    esac
  done
fi

# Derived identifiers
BUNDLE_ID="com.${DEVELOPER}.${APP_SLUG}"
PACKAGE_NAME="com.${DEVELOPER}.${APP_SLUG_NO_DASH}"

# Supabase
SUPABASE_URL=""
if [ -n "$SUPABASE_REF" ]; then
  SUPABASE_URL="https://${SUPABASE_REF}.supabase.co"
fi

# Target directory
TARGET_DIR="$OUTPUT_DIR/$APP_SLUG"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  App Template Factory — Scaffold                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  App Name:    $APP_NAME"
echo "  App Slug:    $APP_SLUG"
echo "  Developer:   $DEVELOPER"
echo "  Platforms:   web=$INCLUDE_WEB, ios=$INCLUDE_IOS, android=$INCLUDE_ANDROID"
echo "  Brand:       $BRAND"
echo "  Neutral:     $NEUTRAL"
echo "  Radius:      $RADIUS"
echo "  Output:      $TARGET_DIR"
echo ""

# ── Pre-flight checks ─────────────────────────────────────────────────────

if [ -d "$TARGET_DIR" ]; then
  echo "ERROR: Target directory already exists: $TARGET_DIR" >&2
  echo "Remove it first or choose a different name." >&2
  exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: Config file not found: $CONFIG_FILE" >&2
  exit 1
fi

for cmd in jq rsync perl; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: Required command '$cmd' not found" >&2
    exit 1
  fi
done

# ── Build values JSON ─────────────────────────────────────────────────────

VALUES_JSON=$(jq -n \
  --arg APP_NAME "$APP_NAME" \
  --arg APP_SLUG "$APP_SLUG" \
  --arg APP_SLUG_UNDERSCORE "$APP_SLUG_UNDERSCORE" \
  --arg APP_SLUG_NO_DASH "$APP_SLUG_NO_DASH" \
  --arg APP_DESCRIPTION "$APP_DESCRIPTION" \
  --arg DEVELOPER_NAME "$DEVELOPER" \
  --arg GITHUB_ORG "$GITHUB_ORG" \
  --arg BUNDLE_ID "$BUNDLE_ID" \
  --arg TEAM_ID "$TEAM_ID" \
  --arg PACKAGE_NAME "$PACKAGE_NAME" \
  --arg SUPABASE_PROJECT_REF "$SUPABASE_REF" \
  --arg SUPABASE_URL "$SUPABASE_URL" \
  --arg SUPABASE_ANON_KEY "$SUPABASE_KEY" \
  --arg VERCEL_URL "${APP_SLUG}.vercel.app" \
  --arg CHATKIT_WORKFLOW_ID "" \
  --arg FIGMA_FILE_KEY "" \
  --arg GOOGLE_IOS_CLIENT_ID "" \
  '{
    APP_NAME: $APP_NAME,
    APP_SLUG: $APP_SLUG,
    APP_SLUG_UNDERSCORE: $APP_SLUG_UNDERSCORE,
    APP_SLUG_NO_DASH: $APP_SLUG_NO_DASH,
    APP_DESCRIPTION: $APP_DESCRIPTION,
    DEVELOPER_NAME: $DEVELOPER_NAME,
    GITHUB_ORG: $GITHUB_ORG,
    BUNDLE_ID: $BUNDLE_ID,
    TEAM_ID: $TEAM_ID,
    PACKAGE_NAME: $PACKAGE_NAME,
    SUPABASE_PROJECT_REF: $SUPABASE_PROJECT_REF,
    SUPABASE_URL: $SUPABASE_URL,
    SUPABASE_ANON_KEY: $SUPABASE_ANON_KEY,
    VERCEL_URL: $VERCEL_URL,
    CHATKIT_WORKFLOW_ID: $CHATKIT_WORKFLOW_ID,
    FIGMA_FILE_KEY: $FIGMA_FILE_KEY,
    GOOGLE_IOS_CLIENT_ID: $GOOGLE_IOS_CLIENT_ID
  }')

# ── Step 1: Copy template to target ───────────────────────────────────────

echo "Step 1/9: Copying template..."

# Build rsync exclude list from config
EXCLUDES=()
EXCLUDE_COUNT=$(jq -r '.rsync_excludes | length' "$CONFIG_FILE")
for ((i = 0; i < EXCLUDE_COUNT; i++)); do
  EXCLUDE=$(jq -r ".rsync_excludes[$i]" "$CONFIG_FILE")
  EXCLUDES+=(--exclude "$EXCLUDE")
done

mkdir -p "$TARGET_DIR"
rsync -a "${EXCLUDES[@]}" "$TEMPLATE_DIR/" "$TARGET_DIR/"

echo "  Copied to $TARGET_DIR"

# ── Step 2: Bulk text replacement (ordered) ────────────────────────────────

echo ""
echo "Step 2/9: Replacing template parameters..."
"$SCRIPT_DIR/replace-params.sh" "$TARGET_DIR" "$CONFIG_FILE" "$VALUES_JSON"

# Rename top-level sub-repo directories (replace-params only does in-file text)
echo "  Renaming sub-repo directories..."
for OLD_DIR in "$TARGET_DIR"/multi-repo-*; do
  if [ -d "$OLD_DIR" ]; then
    OLD_NAME=$(basename "$OLD_DIR")
    # Apply the same replacement logic: multi-repo-nextjs → <slug>-web, etc.
    case "$OLD_NAME" in
      multi-repo-nextjs)  NEW_NAME="${APP_SLUG}-web" ;;
      multi-repo-ios)     NEW_NAME="${APP_SLUG}-ios" ;;
      multi-repo-android) NEW_NAME="${APP_SLUG}-android" ;;
      *)                  NEW_NAME="$OLD_NAME" ;;
    esac
    if [ "$OLD_NAME" != "$NEW_NAME" ]; then
      echo "    $OLD_NAME → $NEW_NAME"
      mv "$OLD_DIR" "$TARGET_DIR/$NEW_NAME"
    fi
  fi
done

# ── Step 2b: Rename iOS Xcode project internals ──────────────────────────

if [ "$INCLUDE_IOS" = "true" ]; then
  IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
  if [ -d "$IOS_DIR" ]; then
    echo "  Renaming iOS Xcode project internals..."
    # Rename source directory: multi-repo-ios/ → <slug>-ios/
    if [ -d "$IOS_DIR/multi-repo-ios" ]; then
      mv "$IOS_DIR/multi-repo-ios" "$IOS_DIR/${APP_SLUG}-ios"
      echo "    multi-repo-ios/ → ${APP_SLUG}-ios/"
    fi
    # Rename .xcodeproj: multi-repo-ios.xcodeproj → <slug>-ios.xcodeproj
    if [ -d "$IOS_DIR/multi-repo-ios.xcodeproj" ]; then
      mv "$IOS_DIR/multi-repo-ios.xcodeproj" "$IOS_DIR/${APP_SLUG}-ios.xcodeproj"
      echo "    multi-repo-ios.xcodeproj → ${APP_SLUG}-ios.xcodeproj"
    fi
    # Rename app entry point: multi_repo_iosApp.swift → <slug_underscore>_iosApp.swift
    OLD_APP_SWIFT="$IOS_DIR/${APP_SLUG}-ios/multi_repo_iosApp.swift"
    NEW_APP_SWIFT="$IOS_DIR/${APP_SLUG}-ios/${APP_SLUG_UNDERSCORE}_iosApp.swift"
    if [ -f "$OLD_APP_SWIFT" ]; then
      mv "$OLD_APP_SWIFT" "$NEW_APP_SWIFT"
      echo "    multi_repo_iosApp.swift → ${APP_SLUG_UNDERSCORE}_iosApp.swift"
    fi
  fi
fi

# ── Step 3: Rename Android package (if Android included) ──────────────────

if [ "$INCLUDE_ANDROID" = "true" ]; then
  echo ""
  echo "Step 3/9: Renaming Android package..."
  ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"
  if [ -d "$ANDROID_DIR" ]; then
    # replace-params.sh already changed file contents (com.abhishekverma.multirepo → new package)
    # but the DIRECTORY STRUCTURE is still com/abhishekverma/multirepo/ — rename it
    OLD_JAVA_PATH="$ANDROID_DIR/app/src/main/java/com/abhishekverma/multirepo"
    NEW_JAVA_PATH="$ANDROID_DIR/app/src/main/java/$(echo "$PACKAGE_NAME" | tr '.' '/')"
    if [ -d "$OLD_JAVA_PATH" ]; then
      echo "  Moving $OLD_JAVA_PATH → $NEW_JAVA_PATH"
      mkdir -p "$NEW_JAVA_PATH"
      cp -R "$OLD_JAVA_PATH"/* "$NEW_JAVA_PATH"/ 2>/dev/null || true
      rm -rf "$ANDROID_DIR/app/src/main/java/com/abhishekverma"
    else
      echo "  WARN: Old Android package dir not found, may already be renamed"
    fi
  fi
else
  echo ""
  echo "Step 3/9: Skipping Android package rename (not included)"
fi

# ── Step 4: Platform selection (remove excluded platforms) ────────────────

echo ""
echo "Step 4/9: Selecting platforms..."
"$SCRIPT_DIR/platform-select.sh" "$TARGET_DIR" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID" "$APP_SLUG"

# ── Step 4b: Strip auth & Supabase (if no Supabase ref provided) ─────────

if [ -z "$SUPABASE_REF" ]; then
  echo ""
  echo "Step 4b: Stripping auth & Supabase (local-first mode)..."
  "$SCRIPT_DIR/strip-auth.sh" "$TARGET_DIR" "$APP_SLUG" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID"
fi

# ── Step 5: Clean demo content ────────────────────────────────────────────

echo ""
echo "Step 5/9: Cleaning demo content..."
"$SCRIPT_DIR/clean-demo-content.sh" "$TARGET_DIR" "$CONFIG_FILE" "$APP_SLUG" "$APP_DESCRIPTION"

# ── Step 6: Generate config files ─────────────────────────────────────────

echo ""
echo "Step 6/9: Generating config files..."
"$SCRIPT_DIR/config-writer.sh" "$TARGET_DIR" "$SCRIPT_DIR/templates" "$VALUES_JSON" "$APP_SLUG" "$PLATFORMS" "$SUPABASE_REF"

# ── Step 7: Theme generation ──────────────────────────────────────────────

if [ "$BRAND" != "zinc" ] || [ "$NEUTRAL" != "neutral" ]; then
  echo ""
  echo "Step 7/9: Generating theme..."

  THEME_ARGS=("--brand" "$BRAND" "--neutral" "$NEUTRAL" "--radius" "$RADIUS" "--selection" "$SELECTION")

  if [ "$INCLUDE_WEB" = "true" ]; then
    WEB_CSS="$TARGET_DIR/${APP_SLUG}-web/app/globals.css"
    if [ -f "$WEB_CSS" ]; then
      THEME_ARGS+=("--web" "$WEB_CSS")
    fi
  fi

  if [ "$INCLUDE_IOS" = "true" ]; then
    # Find DesignTokens.swift (could be in nested dir)
    IOS_TOKENS=$(find "$TARGET_DIR/${APP_SLUG}-ios" -name "DesignTokens.swift" -type f 2>/dev/null | head -1)
    if [ -n "$IOS_TOKENS" ]; then
      THEME_ARGS+=("--ios" "$IOS_TOKENS")
    fi
  fi

  if [ "$INCLUDE_ANDROID" = "true" ]; then
    ANDROID_TOKENS=$(find "$TARGET_DIR/${APP_SLUG}-android" -name "DesignTokens.kt" -type f 2>/dev/null | head -1)
    if [ -n "$ANDROID_TOKENS" ]; then
      THEME_ARGS+=("--android" "$ANDROID_TOKENS")
    fi
  fi

  node "$SCRIPT_DIR/theme-generator.js" "${THEME_ARGS[@]}"
else
  echo ""
  echo "Step 7/9: Skipping theme generation (using defaults)"
fi

# ── Step 8: Install web dependencies ──────────────────────────────────────

if [ "$INCLUDE_WEB" = "true" ]; then
  WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
  if [ -d "$WEB_DIR" ] && [ -f "$WEB_DIR/package.json" ]; then
    echo ""
    echo "Step 8/9: Installing web dependencies..."
    cd "$WEB_DIR"
    npm install --loglevel=error 2>&1 | tail -3
    cd "$TARGET_DIR"
  fi
else
  echo ""
  echo "Step 8/9: Skipping web dependency install (not included)"
fi

# ── Step 9: Git setup (repos, submodules, upstream) ──────────────────────

if [ "$SKIP_GIT" = "false" ]; then
  echo ""
  echo "Step 9/9: Setting up git repos, GitHub remotes, and submodules..."
  "$SCRIPT_DIR/git-setup.sh" "$TARGET_DIR" "$APP_SLUG" "$GITHUB_ORG" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID" || {
    echo ""
    echo "  WARN: Git setup failed or was skipped. You can run it manually later:"
    echo "    ./scripts/git-setup.sh $TARGET_DIR $APP_SLUG $GITHUB_ORG $INCLUDE_WEB $INCLUDE_IOS $INCLUDE_ANDROID"
  }
else
  echo ""
  echo "Step 9/9: Skipping git setup (--skip-git)"
fi

# ── Validation ─────────────────────────────────────────────────────────────

echo ""
echo "Running validation..."
"$SCRIPT_DIR/validate-scaffold.sh" "$TARGET_DIR" "$APP_SLUG" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID" "$DEVELOPER" "$TEAM_ID" || true

# ── Done ───────────────────────────────────────────────────────────────────

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Scaffold Complete!                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  Project: $TARGET_DIR"
echo ""
echo "  Next steps:"
echo "    1. cd $TARGET_DIR"
echo "    2. Open in Claude Code to run discovery skills:"
echo "       /product-discovery   — Define what you're building"
echo "       /design-discovery    — Design the app"
echo "       /schema-discovery    — Set up the database"
echo ""

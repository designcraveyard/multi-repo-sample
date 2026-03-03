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
#   --ios-icons     iOS icon library: phosphor|sf-symbols (default: phosphor)
#   --skip-git      Skip git init + GitHub repo creation (default: false)
#   --output-dir    Output parent directory (default: ~/Documents/GitHub)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$TEMPLATE_DIR/scaffold.config.json"

# ── Colors & formatting ──────────────────────────────────────────────────────

if [ -t 1 ]; then
  BOLD='\033[1m'; GREEN='\033[0;32m'; RED='\033[0;31m'
  YELLOW='\033[0;33m'; CYAN='\033[0;36m'; DIM='\033[2m'; RESET='\033[0m'
else
  BOLD=''; GREEN=''; RED=''; YELLOW=''; CYAN=''; DIM=''; RESET=''
fi

# ── Progress helpers ─────────────────────────────────────────────────────────

SCAFFOLD_START=$SECONDS
STEP_RESULTS=()
STEP_LABELS=()
CURRENT_STEP_INDEX=-1
SPINNER_PID=""
STEP_START_TIME=0

step_start() {
  local label="$1"
  STEP_START_TIME=$SECONDS
  CURRENT_STEP_INDEX=${#STEP_LABELS[@]}
  STEP_LABELS+=("$label")
  STEP_RESULTS+=("pending")
  printf "\n${BOLD}${CYAN}%s${RESET}\n" "$label"
}

step_info() {
  printf "  ${DIM}↳ %s${RESET}\n" "$1"
}

step_done() {
  local elapsed=$((SECONDS - STEP_START_TIME))
  STEP_RESULTS[$CURRENT_STEP_INDEX]="ok"
  printf "  ${GREEN}✓${RESET}  Done  ${DIM}(${elapsed}s)${RESET}\n"
}

step_skip() {
  STEP_RESULTS[$CURRENT_STEP_INDEX]="skip"
  printf "  ${DIM}—  Skipped  %s${RESET}\n" "${1:-}"
}

step_warn() {
  printf "  ${YELLOW}⚠${RESET}   %s\n" "$1"
}

step_fail() {
  STEP_RESULTS[$CURRENT_STEP_INDEX]="fail"
  printf "  ${RED}✗${RESET}  Failed  %s\n" "${1:-}"
}

spinner_start() {
  [ ! -t 1 ] && return  # No spinner when not a TTY
  local msg="${1:-Working}"
  (while true; do
    for c in '⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏'; do
      printf "\r  ${DIM}%s  %s...${RESET}   " "$c" "$msg"
      sleep 0.1
    done
  done) &
  SPINNER_PID=$!
  disown "$SPINNER_PID" 2>/dev/null || true
}

spinner_stop() {
  if [ -n "${SPINNER_PID:-}" ]; then
    kill "$SPINNER_PID" 2>/dev/null || true
    SPINNER_PID=""
    printf "\r%-80s\r" " "
  fi
}

print_summary() {
  local total=$((SECONDS - SCAFFOLD_START))
  local fails=0
  printf "\n${DIM}─────────────────────────────────────────────────────────────────${RESET}\n"
  printf "\n  ${BOLD}Step results:${RESET}\n\n"
  for i in "${!STEP_RESULTS[@]}"; do
    local result="${STEP_RESULTS[$i]}"
    local label="${STEP_LABELS[$i]:-step $((i+1))}"
    case "$result" in
      ok)      printf "  ${GREEN}✓${RESET}  %s\n" "$label" ;;
      skip)    printf "  ${DIM}—  %s${RESET}\n" "$label" ;;
      fail)    printf "  ${RED}✗${RESET}  %s\n" "$label"; fails=$((fails + 1)) ;;
      pending) printf "  ${RED}✗${RESET}  %s  ${DIM}(interrupted)${RESET}\n" "$label"; fails=$((fails + 1)) ;;
    esac
  done
  printf "\n"
  if [ "$fails" -eq 0 ]; then
    printf "╔════════════════════════════════════════════════════════════╗\n"
    printf "║  ✓  Scaffold complete!                        %6ss total  ║\n" "$total"
    printf "╚════════════════════════════════════════════════════════════╝\n"
  else
    printf "╔════════════════════════════════════════════════════════════╗\n"
    printf "║  ⚠  Scaffold done with issues                %6ss total  ║\n" "$total"
    printf "╚════════════════════════════════════════════════════════════╝\n"
    printf "  ${YELLOW}%d step(s) had issues — check output above for details.${RESET}\n" "$fails"
  fi
}

# On unexpected exit (set -e triggers), clean up the spinner and show partial results
on_exit() {
  spinner_stop
  if [ ${#STEP_LABELS[@]} -gt 0 ]; then
    print_summary
  fi
}
trap on_exit EXIT

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
IOS_ICONS="phosphor"
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
    --ios-icons) IOS_ICONS="$2"; shift 2 ;;
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

# ── Header ─────────────────────────────────────────────────────────────────

PLATFORM_DISPLAY=""
[ "$INCLUDE_WEB" = "true" ]     && PLATFORM_DISPLAY="${PLATFORM_DISPLAY} Web"
[ "$INCLUDE_IOS" = "true" ]     && PLATFORM_DISPLAY="${PLATFORM_DISPLAY} iOS"
[ "$INCLUDE_ANDROID" = "true" ] && PLATFORM_DISPLAY="${PLATFORM_DISPLAY} Android"

printf "\n"
printf "╔════════════════════════════════════════════════════════════╗\n"
printf "║  App Template Factory — Scaffold                          ║\n"
printf "╚════════════════════════════════════════════════════════════╝\n"
printf "\n"
printf "  ${BOLD}App:${RESET}        %s  ${DIM}(%s)${RESET}\n" "$APP_NAME" "$APP_SLUG"
printf "  ${BOLD}Developer:${RESET}  %s\n" "$DEVELOPER"
printf "  ${BOLD}Platforms:${RESET} %s\n" "$PLATFORM_DISPLAY"
printf "  ${BOLD}Brand:${RESET}      %s / %s  radius=%s\n" "$BRAND" "$NEUTRAL" "$RADIUS"
if [ -n "$SUPABASE_REF" ]; then
  printf "  ${BOLD}Supabase:${RESET}   %s\n" "$SUPABASE_REF"
else
  printf "  ${BOLD}Mode:${RESET}       local-first  ${DIM}(no auth/Supabase)${RESET}\n"
fi
printf "  ${BOLD}Output:${RESET}     %s\n" "$TARGET_DIR"
printf "\n"
printf "${DIM}─────────────────────────────────────────────────────────────────${RESET}\n"

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

step_start "[1/9] Copying template files"
step_info "Source: $TEMPLATE_DIR"
step_info "Target: $TARGET_DIR"

# Build rsync exclude list from config
EXCLUDES=()
EXCLUDE_COUNT=$(jq -r '.rsync_excludes | length' "$CONFIG_FILE")
for ((i = 0; i < EXCLUDE_COUNT; i++)); do
  EXCLUDE=$(jq -r ".rsync_excludes[$i]" "$CONFIG_FILE")
  EXCLUDES+=(--exclude "$EXCLUDE")
done

mkdir -p "$TARGET_DIR"
spinner_start "Copying"
rsync -a "${EXCLUDES[@]}" "$TEMPLATE_DIR/" "$TARGET_DIR/"
spinner_stop
step_done

# ── Step 2: Bulk text replacement (ordered) ────────────────────────────────

step_start "[2/9] Replacing template parameters"
spinner_start "Scanning files"
"$SCRIPT_DIR/replace-params.sh" "$TARGET_DIR" "$CONFIG_FILE" "$VALUES_JSON"
spinner_stop

# Rename top-level sub-repo directories (replace-params only does in-file text)
step_info "Renaming sub-repo directories"
for OLD_DIR in "$TARGET_DIR"/multi-repo-*; do
  if [ -d "$OLD_DIR" ]; then
    OLD_NAME=$(basename "$OLD_DIR")
    case "$OLD_NAME" in
      multi-repo-nextjs)  NEW_NAME="${APP_SLUG}-web" ;;
      multi-repo-ios)     NEW_NAME="${APP_SLUG}-ios" ;;
      multi-repo-android) NEW_NAME="${APP_SLUG}-android" ;;
      *)                  NEW_NAME="$OLD_NAME" ;;
    esac
    if [ "$OLD_NAME" != "$NEW_NAME" ]; then
      step_info "  $OLD_NAME → $NEW_NAME"
      mv "$OLD_DIR" "$TARGET_DIR/$NEW_NAME"
    fi
  fi
done
step_done

# ── Step 2b: Rename iOS Xcode project internals ──────────────────────────

if [ "$INCLUDE_IOS" = "true" ]; then
  IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
  if [ -d "$IOS_DIR" ]; then
    step_info "iOS: Renaming Xcode project internals"
    # Rename source directory: multi-repo-ios/ → <slug>-ios/
    if [ -d "$IOS_DIR/multi-repo-ios" ]; then
      mv "$IOS_DIR/multi-repo-ios" "$IOS_DIR/${APP_SLUG}-ios"
      step_info "  Source dir: multi-repo-ios/ → ${APP_SLUG}-ios/"
    fi
    # Rename .xcodeproj: multi-repo-ios.xcodeproj → <slug>-ios.xcodeproj
    if [ -d "$IOS_DIR/multi-repo-ios.xcodeproj" ]; then
      mv "$IOS_DIR/multi-repo-ios.xcodeproj" "$IOS_DIR/${APP_SLUG}-ios.xcodeproj"
      step_info "  Xcode proj: multi-repo-ios.xcodeproj → ${APP_SLUG}-ios.xcodeproj"
    fi
    # Rename app entry point: multi_repo_iosApp.swift → <slug_underscore>_iosApp.swift
    OLD_APP_SWIFT="$IOS_DIR/${APP_SLUG}-ios/multi_repo_iosApp.swift"
    NEW_APP_SWIFT="$IOS_DIR/${APP_SLUG}-ios/${APP_SLUG_UNDERSCORE}_iosApp.swift"
    if [ -f "$OLD_APP_SWIFT" ]; then
      mv "$OLD_APP_SWIFT" "$NEW_APP_SWIFT"
      step_info "  App entry:  multi_repo_iosApp.swift → ${APP_SLUG_UNDERSCORE}_iosApp.swift"
    fi
  fi
fi

# ── Step 3: Rename Android package (if Android included) ──────────────────

if [ "$INCLUDE_ANDROID" = "true" ]; then
  step_start "[3/9] Renaming Android package"
  ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"
  if [ -d "$ANDROID_DIR" ]; then
    # replace-params.sh already changed file contents (com.abhishekverma.multirepo → new package)
    # but the DIRECTORY STRUCTURE is still com/abhishekverma/multirepo/ — rename it
    OLD_JAVA_PATH="$ANDROID_DIR/app/src/main/java/com/abhishekverma/multirepo"
    NEW_JAVA_PATH="$ANDROID_DIR/app/src/main/java/$(echo "$PACKAGE_NAME" | tr '.' '/')"
    step_info "com.abhishekverma.multirepo → $PACKAGE_NAME"
    if [ -d "$OLD_JAVA_PATH" ]; then
      mkdir -p "$NEW_JAVA_PATH"
      cp -R "$OLD_JAVA_PATH"/* "$NEW_JAVA_PATH"/ 2>/dev/null || true
      rm -rf "$ANDROID_DIR/app/src/main/java/com/abhishekverma"
    else
      step_warn "Old Android package dir not found — may already be renamed"
    fi
  fi
  step_done
else
  step_start "[3/9] Android package rename"
  step_skip "Android not included"
fi

# ── Step 4: Platform selection (remove excluded platforms) ────────────────

step_start "[4/9] Selecting platforms"
step_info "Web=$INCLUDE_WEB  iOS=$INCLUDE_IOS  Android=$INCLUDE_ANDROID"
"$SCRIPT_DIR/platform-select.sh" "$TARGET_DIR" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID" "$APP_SLUG"
step_done

# ── Step 4b: Strip auth & Supabase (if no Supabase ref provided) ─────────

if [ -z "$SUPABASE_REF" ]; then
  step_start "[4b] Stripping auth & Supabase (local-first mode)"
  step_info "Removing: auth routes, Supabase packages, login screens, SPM packages"
  "$SCRIPT_DIR/strip-auth.sh" "$TARGET_DIR" "$APP_SLUG" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID"
  step_done
fi

# ── Step 5: Clean demo content ────────────────────────────────────────────

step_start "[5/9] Cleaning demo content"
step_info "Removing: ComponentsShowcaseView, AIDemoView, editor-demo/, input-demo/"
step_info "Replacing: ContentView.swift with clean starter (~30 lines)"
"$SCRIPT_DIR/clean-demo-content.sh" "$TARGET_DIR" "$CONFIG_FILE" "$APP_SLUG" "$APP_DESCRIPTION"
step_done

# ── Step 5b: Convert to SF Symbols (if chosen) ───────────────────────

if [ "$IOS_ICONS" = "sf-symbols" ] && [ "$INCLUDE_IOS" = "true" ]; then
  step_start "[5b] Converting iOS icons to SF Symbols"
  step_info "Replacing PhosphorSwift calls with SF Symbols equivalents"
  step_info "Removing PhosphorSwift SPM dependency"
  "$SCRIPT_DIR/strip-phosphor.sh" "$TARGET_DIR" "$APP_SLUG"
  step_done
fi

# ── Step 6: Generate config files ─────────────────────────────────────────

step_start "[6/9] Generating config files"
step_info ".env.local, Secrets.swift, local.properties, .mcp.json, supabase/config.toml"
step_info "tracker.md, pipeline.json, .claude/settings.json"
"$SCRIPT_DIR/config-writer.sh" "$TARGET_DIR" "$SCRIPT_DIR/templates" "$VALUES_JSON" "$APP_SLUG" "$PLATFORMS" "$SUPABASE_REF"
step_done

# ── Step 7: Theme generation ──────────────────────────────────────────────

if [ "$BRAND" != "zinc" ] || [ "$NEUTRAL" != "neutral" ]; then
  step_start "[7/9] Generating theme"
  step_info "Brand: $BRAND  Neutral: $NEUTRAL  Radius: $RADIUS  Selection: $SELECTION"

  THEME_ARGS=("--brand" "$BRAND" "--neutral" "$NEUTRAL" "--radius" "$RADIUS" "--selection" "$SELECTION")

  if [ "$INCLUDE_WEB" = "true" ]; then
    WEB_CSS="$TARGET_DIR/${APP_SLUG}-web/app/globals.css"
    if [ -f "$WEB_CSS" ]; then
      THEME_ARGS+=("--web" "$WEB_CSS")
      step_info "Web: globals.css"
    fi
  fi

  if [ "$INCLUDE_IOS" = "true" ]; then
    # Find DesignTokens.swift (could be in nested dir)
    IOS_TOKENS=$(find "$TARGET_DIR/${APP_SLUG}-ios" -name "DesignTokens.swift" -type f 2>/dev/null | head -1)
    if [ -n "$IOS_TOKENS" ]; then
      THEME_ARGS+=("--ios" "$IOS_TOKENS")
      step_info "iOS: DesignTokens.swift"
    fi
  fi

  if [ "$INCLUDE_ANDROID" = "true" ]; then
    ANDROID_TOKENS=$(find "$TARGET_DIR/${APP_SLUG}-android" -name "DesignTokens.kt" -type f 2>/dev/null | head -1)
    if [ -n "$ANDROID_TOKENS" ]; then
      THEME_ARGS+=("--android" "$ANDROID_TOKENS")
      step_info "Android: DesignTokens.kt"
    fi
  fi

  node "$SCRIPT_DIR/theme-generator.js" "${THEME_ARGS[@]}"
  step_done
else
  step_start "[7/9] Theme generation"
  step_skip "Using default palette (zinc/neutral) — run /generate-theme later to change"
fi

# ── Step 8: Install web dependencies ──────────────────────────────────────

if [ "$INCLUDE_WEB" = "true" ]; then
  WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
  if [ -d "$WEB_DIR" ] && [ -f "$WEB_DIR/package.json" ]; then
    step_start "[8/9] Installing web dependencies"
    step_info "Directory: $WEB_DIR"
    step_info "This may take a minute..."
    cd "$WEB_DIR"
    spinner_start "Running npm install"
    npm install --loglevel=error > /tmp/scaffold-npm.log 2>&1 &
    NPM_PID=$!
    wait "$NPM_PID" && NPM_EXIT=0 || NPM_EXIT=$?
    spinner_stop
    if [ "$NPM_EXIT" -ne 0 ]; then
      printf "\n  ${RED}npm install output:${RESET}\n"
      tail -10 /tmp/scaffold-npm.log | sed 's/^/    /'
      step_fail "npm install exited with code $NPM_EXIT"
      exit 1
    fi
    # Show the "added N packages" summary line if present
    NPM_SUMMARY=$(grep -E "added [0-9]+ package" /tmp/scaffold-npm.log 2>/dev/null | tail -1 || true)
    [ -n "$NPM_SUMMARY" ] && step_info "$NPM_SUMMARY"
    cd "$TARGET_DIR"
    step_done
  fi
else
  step_start "[8/9] Web dependency install"
  step_skip "Web not included"
fi

# ── Step 9: Git setup (repos, submodules, upstream) ──────────────────────

if [ "$SKIP_GIT" = "false" ]; then
  step_start "[9/9] Setting up git repos & GitHub remotes"
  step_info "Org: $GITHUB_ORG"
  [ "$INCLUDE_WEB" = "true" ]     && step_info "Will create: $GITHUB_ORG/${APP_SLUG}-web (private)"
  [ "$INCLUDE_IOS" = "true" ]     && step_info "Will create: $GITHUB_ORG/${APP_SLUG}-ios (private)"
  [ "$INCLUDE_ANDROID" = "true" ] && step_info "Will create: $GITHUB_ORG/${APP_SLUG}-android (private)"
  spinner_start "Running git setup"
  "$SCRIPT_DIR/git-setup.sh" "$TARGET_DIR" "$APP_SLUG" "$GITHUB_ORG" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID" && GIT_EXIT=0 || GIT_EXIT=$?
  spinner_stop
  if [ "$GIT_EXIT" -ne 0 ]; then
    step_fail "Git setup failed — run manually later"
    step_warn "Manual command: ./scripts/git-setup.sh $TARGET_DIR $APP_SLUG $GITHUB_ORG $INCLUDE_WEB $INCLUDE_IOS $INCLUDE_ANDROID"
  else
    step_done
  fi
else
  step_start "[9/9] Git setup"
  step_skip "Skipped via --skip-git"
  step_info "Run manually later: ./scripts/git-setup.sh $TARGET_DIR $APP_SLUG $GITHUB_ORG $INCLUDE_WEB $INCLUDE_IOS $INCLUDE_ANDROID"
fi

# ── Validation ─────────────────────────────────────────────────────────────

printf "\n${DIM}─────────────────────────────────────────────────────────────────${RESET}\n"
printf "\n  ${BOLD}Running validation checks...${RESET}\n\n"
"$SCRIPT_DIR/validate-scaffold.sh" "$TARGET_DIR" "$APP_SLUG" "$INCLUDE_WEB" "$INCLUDE_IOS" "$INCLUDE_ANDROID" "$DEVELOPER" "$TEAM_ID" || true

# ── Done ───────────────────────────────────────────────────────────────────

# Disable EXIT trap — we're completing normally and will print summary below
trap - EXIT
spinner_stop

print_summary

printf "\n"
printf "  ${BOLD}Project:${RESET}    %s\n" "$TARGET_DIR"
printf "\n"
printf "  ${BOLD}Next steps:${RESET}\n"
printf "    1. cd %s\n" "$TARGET_DIR"
printf "    2. Open in Claude Code and run:\n"
printf "       ${BOLD}/pipeline${RESET}   — Guided discovery: product → design → schema → build\n"
if [ -n "$SUPABASE_REF" ]; then
  printf "\n"
  printf "  ${YELLOW}Supabase credentials are in place.${RESET}\n"
  printf "  Run ${BOLD}/supabase-auth-setup${RESET} to configure Google, Apple & Email auth providers.\n"
fi
printf "\n"

#!/usr/bin/env bash
# validate-scaffold.sh — Post-scaffold verification
# Usage: ./scripts/validate-scaffold.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>

set -euo pipefail

TARGET_DIR="${1:?Usage: validate-scaffold.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android> [developer] [team-id]}"
APP_SLUG="${2:?Missing app-slug}"
INCLUDE_WEB="${3:-true}"
INCLUDE_IOS="${4:-true}"
INCLUDE_ANDROID="${5:-true}"
DEVELOPER="${6:-}"
TEAM_ID="${7:-}"

PASS=0
FAIL=0
WARN=0

pass() { echo "  ✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠ $1"; WARN=$((WARN + 1)); }

echo "Validating scaffold at: $TARGET_DIR"
echo "=================================="

# 1. Check for leftover template-specific strings
echo ""
echo "Checking for leftover template strings..."

TEMPLATE_STRINGS=(
  "multi-repo-sample"
  "multi-repo-nextjs"
  "multi-repo-ios"
  "multi-repo-android"
  "multi_repo_ios"
  "abhishekverma"
  "kqxiugkmkvymoegzxoye"
  "L6KKWH5M53"
  "MultiRepo"
)

# Build skip list: template strings that match the user's actual values
# (these are correct replacements, not leftovers)
SKIP_STRINGS=()
if [ -n "$DEVELOPER" ]; then
  SKIP_STRINGS+=("$DEVELOPER")
fi
if [ -n "$TEAM_ID" ]; then
  SKIP_STRINGS+=("$TEAM_ID")
fi

for TERM in "${TEMPLATE_STRINGS[@]}"; do
  # Skip if this template string matches one of the user's actual values
  SHOULD_SKIP="false"
  for SKIP in "${SKIP_STRINGS[@]}"; do
    if [ "$TERM" = "$SKIP" ]; then
      SHOULD_SKIP="true"
      break
    fi
  done
  if [ "$SHOULD_SKIP" = "true" ]; then
    pass "Skipping '$TERM' (matches user's value — not a leftover)"
    continue
  fi

  MATCHES=$(grep -rl "$TERM" "$TARGET_DIR" \
    --include='*.ts' --include='*.tsx' --include='*.swift' --include='*.kt' \
    --include='*.kts' --include='*.json' --include='*.md' --include='*.xml' \
    --include='*.css' --include='*.plist' --include='*.toml' --include='*.yml' \
    --exclude-dir='.git' --exclude-dir='node_modules' --exclude-dir='.next' \
    --exclude-dir='build' --exclude-dir='.gradle' 2>/dev/null || true)

  if [ -n "$MATCHES" ]; then
    COUNT=$(echo "$MATCHES" | wc -l | tr -d ' ')
    fail "'$TERM' found in $COUNT file(s)"
    echo "$MATCHES" | head -5 | sed 's/^/      /'
    if [ "$COUNT" -gt 5 ]; then
      echo "      ... and $((COUNT - 5)) more"
    fi
  else
    pass "No leftover '$TERM'"
  fi
done

# 2. Check key files exist
echo ""
echo "Checking key files..."

check_file() {
  if [ -f "$1" ]; then
    pass "Exists: $1"
  else
    fail "Missing: $1"
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    pass "Exists: $1/"
  else
    fail "Missing: $1/"
  fi
}

check_file "$TARGET_DIR/CLAUDE.md"

if [ "$INCLUDE_WEB" = "true" ]; then
  WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
  check_dir "$WEB_DIR"
  check_file "$WEB_DIR/package.json"
  check_file "$WEB_DIR/.env.local"
  check_file "$WEB_DIR/app/globals.css"
fi

if [ "$INCLUDE_IOS" = "true" ]; then
  IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
  check_dir "$IOS_DIR"
  check_dir "$IOS_DIR/${APP_SLUG}-ios"
  # Verify Xcode project was renamed (no leftover multi-repo-ios.xcodeproj)
  if [ -d "$IOS_DIR/multi-repo-ios.xcodeproj" ]; then
    fail "Xcode project not renamed: multi-repo-ios.xcodeproj still exists"
  else
    check_dir "$IOS_DIR/${APP_SLUG}-ios.xcodeproj"
  fi
  # Verify ContentView.swift isn't the 93K showcase
  CONTENT_VIEW=$(find "$IOS_DIR" -name "ContentView.swift" -type f 2>/dev/null | head -1)
  if [ -n "$CONTENT_VIEW" ]; then
    CV_LINES=$(wc -l < "$CONTENT_VIEW" | tr -d ' ')
    if [ "$CV_LINES" -gt 100 ]; then
      fail "ContentView.swift is $CV_LINES lines — likely still the component showcase"
    else
      pass "ContentView.swift is clean ($CV_LINES lines)"
    fi
  fi
fi

if [ "$INCLUDE_ANDROID" = "true" ]; then
  ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"
  check_dir "$ANDROID_DIR"
  check_file "$ANDROID_DIR/app/build.gradle.kts"
fi

# 3. Check demo content was removed
echo ""
echo "Checking demo content removal..."

DEMO_LEFTOVERS=(
  "ComponentsShowcaseView.swift"
  "AIDemoView.swift"
  "components-showcase"
  "editor-demo"
  "input-demo"
)
for DEMO in "${DEMO_LEFTOVERS[@]}"; do
  FOUND=$(find "$TARGET_DIR" -name "$DEMO" -not -path '*/.git/*' 2>/dev/null | head -1)
  if [ -n "$FOUND" ]; then
    fail "Demo leftover found: $FOUND"
  else
    pass "No leftover '$DEMO'"
  fi
done

# 4. Check auth stripping (if no Supabase)
# Detect if Supabase was stripped by checking for supabase/ dir absence
if [ ! -d "$TARGET_DIR/supabase" ]; then
  echo ""
  echo "Checking auth stripping (local-first mode)..."
  # Should NOT have Auth/ or Supabase/ directories in any platform
  for PLATFORM_DIR in "$TARGET_DIR/${APP_SLUG}-ios" "$TARGET_DIR/${APP_SLUG}-web" "$TARGET_DIR/${APP_SLUG}-android"; do
    if [ ! -d "$PLATFORM_DIR" ]; then continue; fi
    PNAME=$(basename "$PLATFORM_DIR")
    AUTH_DIR=$(find "$PLATFORM_DIR" -type d -name "Auth" -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -1)
    if [ -n "$AUTH_DIR" ]; then
      fail "Auth directory not stripped: $AUTH_DIR"
    else
      pass "$PNAME: no Auth/ directory"
    fi
    SUPA_DIR=$(find "$PLATFORM_DIR" -type d -name "Supabase" -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -1)
    if [ -n "$SUPA_DIR" ]; then
      fail "Supabase directory not stripped: $SUPA_DIR"
    else
      pass "$PNAME: no Supabase/ directory"
    fi
  done
fi

# 5. Check infrastructure preserved (OpenAI/Audio should exist for iOS)
if [ "$INCLUDE_IOS" = "true" ]; then
  IOS_DIR="$TARGET_DIR/${APP_SLUG}-ios"
  OPENAI_DIR=$(find "$IOS_DIR" -type d -name "OpenAI" 2>/dev/null | head -1)
  AUDIO_DIR=$(find "$IOS_DIR" -type d -name "Audio" 2>/dev/null | head -1)
  if [ -n "$OPENAI_DIR" ]; then
    pass "iOS: OpenAI infrastructure preserved"
  else
    warn "iOS: OpenAI directory missing — MarkdownEditor may not build"
  fi
  if [ -n "$AUDIO_DIR" ]; then
    pass "iOS: Audio infrastructure preserved"
  else
    warn "iOS: Audio directory missing — MarkdownEditor may not build"
  fi
fi

# 6. Try web build (if web included and npm available)
if [ "$INCLUDE_WEB" = "true" ] && [ -d "$TARGET_DIR/${APP_SLUG}-web" ]; then
  echo ""
  echo "Attempting web build..."
  WEB_DIR="$TARGET_DIR/${APP_SLUG}-web"
  if command -v npm &>/dev/null; then
    if [ ! -d "$WEB_DIR/node_modules" ]; then
      warn "node_modules not installed — skipping build test"
    else
      cd "$WEB_DIR"
      if npx next build 2>&1 | tail -5; then
        pass "Web build succeeded"
      else
        fail "Web build failed"
      fi
      cd "$TARGET_DIR"
    fi
  else
    warn "npm not found — skipping web build test"
  fi
fi

# 7. Summary
echo ""
echo "=================================="
echo "Validation Summary"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Warnings: $WARN"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "RESULT: FAIL — $FAIL issue(s) need attention"
  exit 1
else
  echo ""
  echo "RESULT: PASS"
  exit 0
fi

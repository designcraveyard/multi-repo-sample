#!/usr/bin/env bash
# validate-scaffold.sh — Post-scaffold verification
# Usage: ./scripts/validate-scaffold.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>

set -euo pipefail

TARGET_DIR="${1:?Usage: validate-scaffold.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>}"
APP_SLUG="${2:?Missing app-slug}"
INCLUDE_WEB="${3:-true}"
INCLUDE_IOS="${4:-true}"
INCLUDE_ANDROID="${5:-true}"

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

for TERM in "${TEMPLATE_STRINGS[@]}"; do
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
fi

if [ "$INCLUDE_ANDROID" = "true" ]; then
  ANDROID_DIR="$TARGET_DIR/${APP_SLUG}-android"
  check_dir "$ANDROID_DIR"
  check_file "$ANDROID_DIR/app/build.gradle.kts"
fi

# 3. Try web build (if web included and npm available)
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

# 4. Summary
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

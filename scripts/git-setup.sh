#!/usr/bin/env bash
# git-setup.sh — Initialize git repos, create GitHub repos, set up submodules + upstream
#
# Usage:
#   ./scripts/git-setup.sh <target-dir> <app-slug> <github-org> \
#     <include-web> <include-ios> <include-android> [template-org]
#
# Requires: git, gh (GitHub CLI, authenticated)

set -euo pipefail

TARGET_DIR="${1:?Usage: git-setup.sh <target-dir> <app-slug> <github-org> <include-web> <include-ios> <include-android> [template-org]}"
APP_SLUG="${2:?Missing app-slug}"
GITHUB_ORG="${3:?Missing github-org}"
INCLUDE_WEB="${4:-true}"
INCLUDE_IOS="${5:-true}"
INCLUDE_ANDROID="${6:-true}"
TEMPLATE_ORG="${7:-designcraveyard}"

# Template repo mapping: new project dir suffix → template repo name
declare -A TEMPLATE_MAP=(
  ["web"]="multi-repo-nextjs"
  ["ios"]="multi-repo-ios"
  ["android"]="multi-repo-android"
)
TEMPLATE_ROOT_REPO="multi-repo-sample"

# ── Pre-flight checks ─────────────────────────────────────────────────────

if ! command -v gh &>/dev/null; then
  echo "ERROR: gh (GitHub CLI) not found. Install it: https://cli.github.com"
  echo "  Skipping git setup — you can run this script manually later."
  exit 1
fi

if ! gh auth status &>/dev/null 2>&1; then
  echo "ERROR: gh is not authenticated. Run: gh auth login"
  echo "  Skipping git setup — you can run this script manually later."
  exit 1
fi

if ! command -v git &>/dev/null; then
  echo "ERROR: git not found"
  exit 1
fi

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Git Setup — Repos, Submodules, Upstream                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "  GitHub Org:    $GITHUB_ORG"
echo "  Template Org:  $TEMPLATE_ORG"
echo "  Platforms:     web=$INCLUDE_WEB, ios=$INCLUDE_IOS, android=$INCLUDE_ANDROID"
echo ""

# Track created repos for summary
declare -a CREATED_REPOS=()
declare -a PLATFORM_DIRS=()

# ── Helper: init, create, push a platform repo ─────────────────────────────

setup_platform_repo() {
  local dir="$1"
  local repo_name="$2"
  local platform_key="$3"  # web, ios, or android

  if [ ! -d "$dir" ]; then
    echo "  WARN: Directory not found: $dir — skipping"
    return
  fi

  local template_repo="${TEMPLATE_MAP[$platform_key]}"
  local upstream_url="https://github.com/${TEMPLATE_ORG}/${template_repo}.git"
  local repo_url="https://github.com/${GITHUB_ORG}/${repo_name}"

  echo "  Setting up $repo_name..."

  cd "$dir"

  # Init git repo
  git init -q
  git add -A
  git commit -q -m "Initial scaffold from app-template

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

  # Create GitHub repo and push
  if gh repo view "${GITHUB_ORG}/${repo_name}" &>/dev/null 2>&1; then
    echo "    GitHub repo already exists: ${GITHUB_ORG}/${repo_name}"
    git remote add origin "${repo_url}.git" 2>/dev/null || true
  else
    gh repo create "${GITHUB_ORG}/${repo_name}" --private --source . --push 2>/dev/null
    echo "    Created: $repo_url"
  fi

  # Push if not already pushed by gh repo create
  git push -u origin main 2>/dev/null || true

  # Add upstream remote
  git remote add upstream "$upstream_url" 2>/dev/null || true
  echo "    Upstream: $upstream_url"

  CREATED_REPOS+=("$repo_name|$repo_url|$upstream_url")
  PLATFORM_DIRS+=("$repo_name")

  cd "$TARGET_DIR"
}

# ── Step 1: Initialize platform repos ─────────────────────────────────────

echo "Step 1: Initializing platform repos..."
echo ""

if [ "$INCLUDE_WEB" = "true" ]; then
  setup_platform_repo "$TARGET_DIR/${APP_SLUG}-web" "${APP_SLUG}-web" "web"
fi

if [ "$INCLUDE_IOS" = "true" ]; then
  setup_platform_repo "$TARGET_DIR/${APP_SLUG}-ios" "${APP_SLUG}-ios" "ios"
fi

if [ "$INCLUDE_ANDROID" = "true" ]; then
  setup_platform_repo "$TARGET_DIR/${APP_SLUG}-android" "${APP_SLUG}-android" "android"
fi

# ── Step 2: Initialize root repo with submodules ─────────────────────────

echo ""
echo "Step 2: Initializing root repo with submodules..."

cd "$TARGET_DIR"
git init -q

# Register each platform repo as a submodule
# First, temporarily move .git dirs out of platform repos so they don't conflict
# with git submodule add (which expects to clone fresh)
for platform_dir in "${PLATFORM_DIRS[@]}"; do
  if [ -d "$TARGET_DIR/$platform_dir/.git" ]; then
    # Remove the independent git repo — submodule add will re-clone
    mv "$TARGET_DIR/$platform_dir/.git" "$TARGET_DIR/$platform_dir/.git-backup"
  fi
done

# Add submodules
for platform_dir in "${PLATFORM_DIRS[@]}"; do
  local_url="https://github.com/${GITHUB_ORG}/${platform_dir}.git"
  echo "  Adding submodule: $platform_dir"
  git submodule add "$local_url" "$platform_dir" 2>/dev/null || {
    echo "    WARN: submodule add failed for $platform_dir — restoring standalone repo"
    if [ -d "$TARGET_DIR/$platform_dir/.git-backup" ]; then
      mv "$TARGET_DIR/$platform_dir/.git-backup" "$TARGET_DIR/$platform_dir/.git"
    fi
    continue
  }
  # Clean up backup
  rm -rf "$TARGET_DIR/$platform_dir/.git-backup" 2>/dev/null || true
done

# Add upstream remotes to submodules
git submodule foreach --quiet '
  platform_key=""
  case "$name" in
    *-web) platform_key="web" ;;
    *-ios) platform_key="ios" ;;
    *-android) platform_key="android" ;;
  esac
  if [ -n "$platform_key" ]; then
    case "$platform_key" in
      web) template_repo="multi-repo-nextjs" ;;
      ios) template_repo="multi-repo-ios" ;;
      android) template_repo="multi-repo-android" ;;
    esac
    upstream_url="https://github.com/'"$TEMPLATE_ORG"'/${template_repo}.git"
    git remote add upstream "$upstream_url" 2>/dev/null || true
  fi
'

# Stage everything and commit
git add -A
git commit -q -m "Initial scaffold from app-template

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

# Create root GitHub repo
ROOT_REPO_NAME="$APP_SLUG"
ROOT_REPO_URL="https://github.com/${GITHUB_ORG}/${ROOT_REPO_NAME}"
ROOT_UPSTREAM_URL="https://github.com/${TEMPLATE_ORG}/${TEMPLATE_ROOT_REPO}.git"

if gh repo view "${GITHUB_ORG}/${ROOT_REPO_NAME}" &>/dev/null 2>&1; then
  echo "  GitHub repo already exists: ${GITHUB_ORG}/${ROOT_REPO_NAME}"
  git remote add origin "${ROOT_REPO_URL}.git" 2>/dev/null || true
else
  gh repo create "${GITHUB_ORG}/${ROOT_REPO_NAME}" --private --source . --push 2>/dev/null
  echo "  Created: $ROOT_REPO_URL"
fi

# Push if not already pushed
git push -u origin main 2>/dev/null || true

# Add upstream
git remote add upstream "$ROOT_UPSTREAM_URL" 2>/dev/null || true
echo "  Upstream: $ROOT_UPSTREAM_URL"

# ── Summary ─────────────────────────────────────────────────────────────

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Git Setup Complete                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
printf "  %-25s %-45s %s\n" "Repo" "GitHub URL" "Upstream"
printf "  %-25s %-45s %s\n" "----" "----------" "--------"

for entry in "${CREATED_REPOS[@]}"; do
  IFS='|' read -r name url upstream <<< "$entry"
  printf "  %-25s %-45s %s\n" "$name" "$url" "$upstream"
done

printf "  %-25s %-45s %s\n" "$ROOT_REPO_NAME (root)" "$ROOT_REPO_URL" "$ROOT_UPSTREAM_URL"

echo ""
echo "  All repos are private. Use 'gh repo edit --visibility public' to change."
echo "  Run /git-push to commit and push future changes."
echo ""

#!/usr/bin/env bash
# git-init.sh — Initialize git repos for scaffolded project
# Usage: ./scripts/git-init.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>

set -euo pipefail

TARGET_DIR="${1:?Usage: git-init.sh <target-dir> <app-slug> <include-web> <include-ios> <include-android>}"
APP_SLUG="${2:?Missing app-slug}"
INCLUDE_WEB="${3:-true}"
INCLUDE_IOS="${4:-true}"
INCLUDE_ANDROID="${5:-true}"

echo "Initializing git repositories..."

# Initialize root repo
echo "  Initializing root repo: $TARGET_DIR"
cd "$TARGET_DIR"
git init -q

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
  cat > ".gitignore" << 'GITIGNORE'
# Dependencies
node_modules/

# Build outputs
.next/
build/
.gradle/
DerivedData/

# Environment files
.env.local
.env*.local
local.properties
Secrets.swift

# IDE
.idea/
*.xcuserdata/
.vscode/

# OS
.DS_Store
Thumbs.db
GITIGNORE
fi

# Initialize each platform sub-repo
init_subrepo() {
  local dir="$1"
  local name="$2"

  if [ -d "$dir" ]; then
    echo "  Initializing sub-repo: $name"
    cd "$dir"
    git init -q
    git add -A
    git commit -q -m "Initial scaffold from app-template"
    cd "$TARGET_DIR"
  fi
}

if [ "$INCLUDE_WEB" = "true" ]; then
  init_subrepo "$TARGET_DIR/${APP_SLUG}-web" "${APP_SLUG}-web"
fi

if [ "$INCLUDE_IOS" = "true" ]; then
  init_subrepo "$TARGET_DIR/${APP_SLUG}-ios" "${APP_SLUG}-ios"
fi

if [ "$INCLUDE_ANDROID" = "true" ]; then
  init_subrepo "$TARGET_DIR/${APP_SLUG}-android" "${APP_SLUG}-android"
fi

# Root repo: add everything and commit
git add -A
git commit -q -m "Initial scaffold from app-template"

echo ""
echo "Git repositories initialized. Next steps:"
echo "  1. Create GitHub repos for the project"
echo "  2. Add remotes:"
echo "     cd $TARGET_DIR && git remote add origin <root-repo-url>"
if [ "$INCLUDE_WEB" = "true" ]; then
  echo "     cd $TARGET_DIR/${APP_SLUG}-web && git remote add origin <web-repo-url>"
fi
if [ "$INCLUDE_IOS" = "true" ]; then
  echo "     cd $TARGET_DIR/${APP_SLUG}-ios && git remote add origin <ios-repo-url>"
fi
if [ "$INCLUDE_ANDROID" = "true" ]; then
  echo "     cd $TARGET_DIR/${APP_SLUG}-android && git remote add origin <android-repo-url>"
fi
echo "  3. Push all repos"

echo "Git init complete."

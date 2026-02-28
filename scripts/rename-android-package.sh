#!/usr/bin/env bash
# rename-android-package.sh — Rename Android package (directory structure + all references)
# Usage: ./scripts/rename-android-package.sh <android-dir> <old-package> <new-package>
# Example: ./scripts/rename-android-package.sh ./testapp-android com.abhishekverma.multirepo com.john.coolapp

set -euo pipefail

ANDROID_DIR="${1:?Usage: rename-android-package.sh <android-dir> <old-package> <new-package>}"
OLD_PKG="${2:?Missing old package name}"
NEW_PKG="${3:?Missing new package name}"

if [ ! -d "$ANDROID_DIR" ]; then
  echo "ERROR: Android directory does not exist: $ANDROID_DIR" >&2
  exit 1
fi

echo "Renaming Android package: $OLD_PKG → $NEW_PKG"

# Convert dot-separated package to path segments
OLD_PATH="${OLD_PKG//\./\/}"
NEW_PATH="${NEW_PKG//\./\/}"

JAVA_BASE="$ANDROID_DIR/app/src/main/java"
OLD_FULL="$JAVA_BASE/$OLD_PATH"
NEW_FULL="$JAVA_BASE/$NEW_PATH"

if [ ! -d "$OLD_FULL" ]; then
  echo "ERROR: Old package directory not found: $OLD_FULL" >&2
  exit 1
fi

# 1. Create new directory tree
echo "  Creating new package directory: $NEW_FULL"
mkdir -p "$NEW_FULL"

# 2. Copy subdirectory structure (preserving nested packages)
echo "  Moving source files..."
# Use rsync to move everything, preserving structure
if [ -d "$OLD_FULL" ]; then
  # Copy all contents (including subdirs like data/, feature/, ui/, etc.)
  cp -R "$OLD_FULL"/* "$NEW_FULL"/ 2>/dev/null || true
  cp -R "$OLD_FULL"/.* "$NEW_FULL"/ 2>/dev/null || true
fi

# 3. Rewrite package declarations and imports in all .kt files
echo "  Rewriting package declarations and imports..."
find "$NEW_FULL" -name '*.kt' -type f -print0 | while IFS= read -r -d '' file; do
  # Replace package declaration
  LC_ALL=C perl -pi -e "s/^package ${OLD_PKG//./\\.}/package ${NEW_PKG}/g" "$file"
  # Replace imports
  LC_ALL=C perl -pi -e "s/import ${OLD_PKG//./\\.}/import ${NEW_PKG}/g" "$file"
done

# 4. Also fix any .kt files outside the main package dir (e.g., test directories)
for src_dir in "$ANDROID_DIR/app/src/test/java" "$ANDROID_DIR/app/src/androidTest/java"; do
  if [ -d "$src_dir" ]; then
    find "$src_dir" -name '*.kt' -type f -print0 | while IFS= read -r -d '' file; do
      LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$file"
    done
  fi
done

# 5. Update build.gradle.kts
BUILD_GRADLE="$ANDROID_DIR/app/build.gradle.kts"
if [ -f "$BUILD_GRADLE" ]; then
  echo "  Updating build.gradle.kts..."
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$BUILD_GRADLE"
fi

# Also check root build.gradle.kts
ROOT_BUILD_GRADLE="$ANDROID_DIR/build.gradle.kts"
if [ -f "$ROOT_BUILD_GRADLE" ]; then
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$ROOT_BUILD_GRADLE"
fi

# 6. Update AndroidManifest.xml
MANIFEST="$ANDROID_DIR/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
  echo "  Updating AndroidManifest.xml..."
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$MANIFEST"
fi

# 7. Update res/values/strings.xml
STRINGS="$ANDROID_DIR/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS" ]; then
  echo "  Updating strings.xml..."
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$STRINGS"
fi

# 8. Update res/values/themes.xml
THEMES="$ANDROID_DIR/app/src/main/res/values/themes.xml"
if [ -f "$THEMES" ]; then
  echo "  Updating themes.xml..."
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$THEMES"
fi

# 9. Update settings.gradle.kts
SETTINGS_GRADLE="$ANDROID_DIR/settings.gradle.kts"
if [ -f "$SETTINGS_GRADLE" ]; then
  echo "  Updating settings.gradle.kts..."
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$SETTINGS_GRADLE"
fi

# 10. Update gradle.properties if it references the package
GRADLE_PROPS="$ANDROID_DIR/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
  LC_ALL=C perl -pi -e "s/${OLD_PKG//./\\.}/${NEW_PKG}/g" "$GRADLE_PROPS"
fi

# 11. Remove old directory tree (only if different from new)
if [ "$OLD_FULL" != "$NEW_FULL" ]; then
  echo "  Removing old package directory..."
  rm -rf "$OLD_FULL"

  # Clean up empty parent directories
  OLD_PARTS=(${OLD_PKG//./ })
  CLEANUP_DIR="$JAVA_BASE"
  for part in "${OLD_PARTS[@]}"; do
    CLEANUP_DIR="$CLEANUP_DIR/$part"
  done
  # Walk up and remove empty dirs
  while [ "$CLEANUP_DIR" != "$JAVA_BASE" ]; do
    if [ -d "$CLEANUP_DIR" ] && [ -z "$(ls -A "$CLEANUP_DIR" 2>/dev/null)" ]; then
      rmdir "$CLEANUP_DIR"
    else
      break
    fi
    CLEANUP_DIR="$(dirname "$CLEANUP_DIR")"
  done
fi

# 12. Verify no old package references remain
echo "  Verifying..."
REMAINING=$(grep -r "$OLD_PKG" "$ANDROID_DIR" --include='*.kt' --include='*.xml' --include='*.kts' --include='*.properties' -l 2>/dev/null || true)
if [ -n "$REMAINING" ]; then
  echo "  WARNING: Old package references still found in:"
  echo "$REMAINING" | sed 's/^/    /'
  echo "  These may need manual review."
else
  echo "  OK: No remaining references to '$OLD_PKG'"
fi

echo "Android package rename complete."

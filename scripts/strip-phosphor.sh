#!/usr/bin/env bash
# strip-phosphor.sh — Convert iOS icon system from PhosphorSwift to SF Symbols
# Called during scaffold when --ios-icons sf-symbols is specified.
#
# Usage: ./scripts/strip-phosphor.sh <target-dir> <app-slug>

set -euo pipefail

TARGET_DIR="${1:?Usage: strip-phosphor.sh <target-dir> <app-slug>}"
APP_SLUG="${2:?Missing app-slug}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates"
IOS_SRC="$TARGET_DIR/${APP_SLUG}-ios/${APP_SLUG}-ios"
PBXPROJ="$TARGET_DIR/${APP_SLUG}-ios/${APP_SLUG}-ios.xcodeproj/project.pbxproj"

if [ ! -d "$IOS_SRC" ]; then
  echo "  WARN: iOS source directory not found, skipping SF Symbols conversion"
  exit 0
fi

echo "Converting iOS icon system to SF Symbols..."

# ── Step 1: Remove PhosphorSwift SPM package from pbxproj ────────────────

if [ -f "$PBXPROJ" ]; then
  echo "  Removing PhosphorSwift SPM package from pbxproj..."

  # Remove XCSwiftPackageProductDependency block for PhosphorSwift
  perl -0777 -pi -e 's/\t\t\w+\s*\/\*\s*PhosphorSwift\s*\*\/\s*=\s*\{\n(?:\t\t\t[^\n]*\n)*?\t\t\};\n//gs' "$PBXPROJ"

  # Remove XCRemoteSwiftPackageReference block (the repo is named "swift")
  perl -0777 -pi -e 's/\t\t\w+\s*\/\*\s*XCRemoteSwiftPackageReference "swift"\s*\*\/\s*=\s*\{\n(?:\t\t\t[^\n]*\n)*?\t\t\};\n//gs' "$PBXPROJ"

  # Remove PBXBuildFile single-line entry
  perl -ni -e 'print unless /PhosphorSwift in Frameworks/' "$PBXPROJ"

  # Remove packageProductDependencies array entry
  perl -ni -e 'print unless /^\t{3,}\w+\s+\/\*\s*PhosphorSwift\s*\*\/\s*,/' "$PBXPROJ"

  # Remove packageReferences array entry for phosphor-icons/swift
  perl -ni -e 'print unless /phosphor-icons\/swift/' "$PBXPROJ"

  # Clean stale Package.resolved
  rm -f "$TARGET_DIR/${APP_SLUG}-ios/${APP_SLUG}-ios.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved" 2>/dev/null || true
fi

# ── Step 2: Swap icon helper file ────────────────────────────────────────

echo "  Replacing PhosphorIconHelper.swift with SFSymbolIconHelper.swift..."
rm -f "$IOS_SRC/PhosphorIconHelper.swift"
cp "$TEMPLATES_DIR/SFSymbolIconHelper.swift.template" "$IOS_SRC/SFSymbolIconHelper.swift"

# ── Step 3: Rename PhosphorIconSize → IconSize across all Swift files ────

echo "  Renaming PhosphorIconSize → IconSize..."
find "$IOS_SRC" -name "*.swift" -exec perl -pi -e 's/PhosphorIconSize/IconSize/g' {} \;

# ── Step 4: Remove 'import PhosphorSwift' from all Swift files ───────────

echo "  Removing 'import PhosphorSwift' statements..."
find "$IOS_SRC" -name "*.swift" -exec perl -ni -e 'print unless /^\s*import\s+PhosphorSwift\s*$/' {} \;

# ── Step 5: Convert Ph.<name>.<weight> → Image(systemName: "<sfName>") ───

echo "  Converting Phosphor icon calls to SF Symbols..."

# Icon name mapping: Phosphor camelCase → SF Symbol name
# Format: "phosphorName:sfSymbolName"
ICON_MAP=(
  "house:house"
  "heart:heart"
  "star:star"
  "bell:bell"
  "folder:folder"
  "bookmark:bookmark"
  "circle:circle"
  "phone:phone"
  "stop:stop"
  "plus:plus"
  "eye:eye"
  "clock:clock"
  "trash:trash"
  "envelope:envelope"
  "check:checkmark"
  "checkCircle:checkmark.circle"
  "magnifyingGlass:magnifyingglass"
  "gear:gearshape"
  "user:person"
  "x:xmark"
  "xCircle:xmark.circle"
  "pencilSimple:pencil"
  "copy:doc.on.doc"
  "share:square.and.arrow.up"
  "warning:exclamationmark.triangle"
  "warningCircle:exclamationmark.circle"
  "caretDown:chevron.down"
  "caretLeft:chevron.left"
  "caretRight:chevron.right"
  "arrowRight:arrow.right"
  "arrowCounterClockwise:arrow.counterclockwise"
  "envelopeSimple:envelope"
  "microphone:mic"
  "paperPlaneRight:paperplane"
  "dotsThree:ellipsis"
  "dotsThreeCircle:ellipsis.circle"
  "image:photo"
  "musicNote:music.note"
  "filmStrip:film"
  "code:chevron.left.forwardslash.chevron.right"
  "bookOpen:book"
  "funnel:line.3.horizontal.decrease.circle"
  "info:info.circle"
  "shareNetwork:network"
)

# Process each Swift file that still contains Ph. references
find "$IOS_SRC" -name "*.swift" -print0 | while IFS= read -r -d '' SWIFT_FILE; do
  # Skip if file doesn't contain Ph. references
  if ! grep -q 'Ph\.' "$SWIFT_FILE" 2>/dev/null; then
    continue
  fi

  # ── Handle .fill weight: Ph.<name>.fill → Image(systemName: "<sfName>.fill")
  for entry in "${ICON_MAP[@]}"; do
    PH_NAME="${entry%%:*}"
    SF_NAME="${entry##*:}"
    perl -pi -e "s/Ph\\.${PH_NAME}\\.fill/Image(systemName: \"${SF_NAME}.fill\")/g" "$SWIFT_FILE"
  done

  # ── Handle .bold weight: Ph.<name>.bold → Image(systemName: "<sfName>").fontWeight(.bold)
  for entry in "${ICON_MAP[@]}"; do
    PH_NAME="${entry%%:*}"
    SF_NAME="${entry##*:}"
    perl -pi -e "s/Ph\\.${PH_NAME}\\.bold/Image(systemName: \"${SF_NAME}\").fontWeight(.bold)/g" "$SWIFT_FILE"
  done

  # ── Handle .thin weight: Ph.<name>.thin → Image(systemName: "<sfName>").fontWeight(.thin)
  for entry in "${ICON_MAP[@]}"; do
    PH_NAME="${entry%%:*}"
    SF_NAME="${entry##*:}"
    perl -pi -e "s/Ph\\.${PH_NAME}\\.thin/Image(systemName: \"${SF_NAME}\").fontWeight(.thin)/g" "$SWIFT_FILE"
  done

  # ── Handle .light weight: Ph.<name>.light → Image(systemName: "<sfName>").fontWeight(.light)
  for entry in "${ICON_MAP[@]}"; do
    PH_NAME="${entry%%:*}"
    SF_NAME="${entry##*:}"
    perl -pi -e "s/Ph\\.${PH_NAME}\\.light/Image(systemName: \"${SF_NAME}\").fontWeight(.light)/g" "$SWIFT_FILE"
  done

  # ── Handle .duotone weight: Ph.<name>.duotone → Image(systemName: "<sfName>").symbolRenderingMode(.hierarchical)
  for entry in "${ICON_MAP[@]}"; do
    PH_NAME="${entry%%:*}"
    SF_NAME="${entry##*:}"
    perl -pi -e "s/Ph\\.${PH_NAME}\\.duotone/Image(systemName: \"${SF_NAME}\").symbolRenderingMode(.hierarchical)/g" "$SWIFT_FILE"
  done

  # ── Handle .regular weight (default — most common): Ph.<name>.regular → Image(systemName: "<sfName>")
  for entry in "${ICON_MAP[@]}"; do
    PH_NAME="${entry%%:*}"
    SF_NAME="${entry##*:}"
    perl -pi -e "s/Ph\\.${PH_NAME}\\.regular/Image(systemName: \"${SF_NAME}\")/g" "$SWIFT_FILE"
  done
done

# ── Step 6: Handle googleLogo → brand asset ──────────────────────────────

echo "  Converting Google logo to brand asset..."

# Replace any remaining Ph.googleLogo references
find "$IOS_SRC" -name "*.swift" -print0 | while IFS= read -r -d '' SWIFT_FILE; do
  perl -pi -e 's/Ph\.googleLogo\.\w+/Image("google-logo")/g' "$SWIFT_FILE"
done

# Create brand icon asset catalog entry
BRAND_DIR="$IOS_SRC/Assets.xcassets/BrandIcons"
mkdir -p "$BRAND_DIR/google-logo.imageset"

cat > "$BRAND_DIR/Contents.json" << 'JSON'
{
  "info" : { "author" : "xcode", "version" : 1 }
}
JSON

cat > "$BRAND_DIR/google-logo.imageset/Contents.json" << 'JSON'
{
  "images" : [
    { "filename" : "google-logo.png", "idiom" : "universal", "scale" : "1x" },
    { "filename" : "google-logo@2x.png", "idiom" : "universal", "scale" : "2x" },
    { "filename" : "google-logo@3x.png", "idiom" : "universal", "scale" : "3x" }
  ],
  "info" : { "author" : "xcode", "version" : 1 }
}
JSON

# Copy Google logo PNGs from templates
if [ -d "$TEMPLATES_DIR/brand-icons" ]; then
  cp "$TEMPLATES_DIR/brand-icons/google-logo.png" "$BRAND_DIR/google-logo.imageset/"
  cp "$TEMPLATES_DIR/brand-icons/google-logo@2x.png" "$BRAND_DIR/google-logo.imageset/"
  cp "$TEMPLATES_DIR/brand-icons/google-logo@3x.png" "$BRAND_DIR/google-logo.imageset/"
fi

# ── Step 7: Update iOS CLAUDE.md ─────────────────────────────────────────

IOS_CLAUDE="$TARGET_DIR/${APP_SLUG}-ios/CLAUDE.md"
if [ -f "$IOS_CLAUDE" ]; then
  echo "  Updating iOS CLAUDE.md for SF Symbols..."
  perl -pi -e 's/PhosphorSwift/SF Symbols/g' "$IOS_CLAUDE"
  perl -pi -e 's/Phosphor Icons/SF Symbols/g' "$IOS_CLAUDE"
  perl -pi -e 's/Ph\.\w+\.\w+/Image(systemName: "icon-name")/g' "$IOS_CLAUDE"
  perl -pi -e 's/PhosphorIconHelper\.swift/SFSymbolIconHelper.swift/g' "$IOS_CLAUDE"
  perl -pi -e 's/PhosphorIconSize/IconSize/g' "$IOS_CLAUDE"
fi

# ── Step 8: Final cleanup — catch any remaining Ph. references ───────────

REMAINING=$(grep -rl 'Ph\.' "$IOS_SRC" --include='*.swift' 2>/dev/null || true)
if [ -n "$REMAINING" ]; then
  echo "  WARN: Residual Ph. references found in:"
  echo "$REMAINING" | while read -r f; do
    echo "    $(basename "$f"): $(grep -c 'Ph\.' "$f") occurrences"
  done
  echo "  These may need manual review."
fi

echo "SF Symbols conversion complete."

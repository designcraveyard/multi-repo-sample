#!/usr/bin/env bash
# replace-params.sh — Ordered bulk text replacement using scaffold.config.json
# Usage: ./scripts/replace-params.sh <target-dir> <config-file> <values-json>
#   values-json: JSON object with resolved parameter values, e.g.:
#   '{"BUNDLE_ID":"com.john.coolapp","PACKAGE_NAME":"com.john.coolapp",...}'

set -euo pipefail

TARGET_DIR="${1:?Usage: replace-params.sh <target-dir> <config-file> <values-json>}"
CONFIG_FILE="${2:?Missing config file path}"
VALUES_JSON="${3:?Missing values JSON}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "ERROR: Target directory does not exist: $TARGET_DIR" >&2
  exit 1
fi

if [ ! -f "$CONFIG_FILE" ]; then
  echo "ERROR: Config file does not exist: $CONFIG_FILE" >&2
  exit 1
fi

# Read replacement_priority array (ordered longest-first to avoid partial matches)
PRIORITY_COUNT=$(jq -r '.replacement_priority | length' "$CONFIG_FILE")
echo "Performing $PRIORITY_COUNT ordered replacements..."

for ((i = 0; i < PRIORITY_COUNT; i++)); do
  SEARCH=$(jq -r ".replacement_priority[$i]" "$CONFIG_FILE")
  TEMPLATE=$(jq -r ".replacement_map[\"$SEARCH\"]" "$CONFIG_FILE")

  if [ "$TEMPLATE" = "null" ] || [ -z "$TEMPLATE" ]; then
    echo "  SKIP: No mapping for '$SEARCH'"
    continue
  fi

  # Resolve {{PLACEHOLDER}} to actual value from VALUES_JSON
  # Extract the placeholder name (strip {{ and }})
  # Handle compound replacements like "{{APP_SLUG}}-web"
  REPLACE="$TEMPLATE"
  RESOLVED=true
  while [[ "$REPLACE" =~ \{\{([A-Z_]+)\}\} ]]; do
    PLACEHOLDER="${BASH_REMATCH[1]}"
    # Use jq to get value; treat null as empty string (optional params)
    VALUE=$(echo "$VALUES_JSON" | jq -r ".${PLACEHOLDER} // \"\"")
    REPLACE="${REPLACE//\{\{${PLACEHOLDER}\}\}/${VALUE}}"
  done

  echo "  [$((i + 1))/$PRIORITY_COUNT] '$SEARCH' → '$REPLACE'"

  # Find all text files, skip binary and excluded directories
  find "$TARGET_DIR" \
    -type f \
    ! -path '*/.git/*' \
    ! -path '*/node_modules/*' \
    ! -path '*/.next/*' \
    ! -path '*/build/*' \
    ! -path '*/.gradle/*' \
    ! -path '*/Pods/*' \
    ! -path '*/.build/*' \
    ! -path '*/DerivedData/*' \
    ! -name '*.png' ! -name '*.jpg' ! -name '*.jpeg' ! -name '*.gif' \
    ! -name '*.ico' ! -name '*.svg' ! -name '*.webp' \
    ! -name '*.woff' ! -name '*.woff2' ! -name '*.ttf' ! -name '*.otf' \
    ! -name '*.zip' ! -name '*.tar' ! -name '*.gz' \
    ! -name '*.pdf' ! -name '*.mp3' ! -name '*.mp4' \
    -print0 | while IFS= read -r -d '' file; do
    # Check if file is text (not binary)
    if file --mime-encoding "$file" | grep -qv 'binary'; then
      # Use perl for reliable cross-platform in-place replacement
      LC_ALL=C perl -pi -e "s/\Q${SEARCH}\E/${REPLACE}/g" "$file" 2>/dev/null || true
    fi
  done
done

echo "Replacement complete."

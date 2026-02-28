---
name: generate-theme
description: >
  Interactive theme generator. Swaps the brand and neutral color palettes across all
  three platforms using the Tailwind palette lookup table. Optionally pushes the new
  theme to Figma Desktop via figma-cli.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# /generate-theme — Swap the design system color palette

## Instructions

### Step 1: Ask for theme preferences

Use `AskUserQuestion` to ask:

1. **Brand palette:** Show popular options first:
   - zinc (current default)
   - indigo, rose, emerald, sky, violet, amber
   - Other → show full list of 22 Tailwind palettes

2. **Neutral palette:** (for backgrounds, text, borders)
   - neutral (default)
   - slate, gray, zinc, stone

3. **Corner radius:**
   - none / sm / md / lg / xl / full

4. **Selection style:**
   - brand (colored checkboxes/switches)
   - neutral (gray controls)

### Step 2: Run theme generator

Determine file paths based on project structure:

```bash
node scripts/theme-generator.js \
  --brand <palette> \
  --neutral <neutral> \
  --radius <preset> \
  --selection <style> \
  --web <path-to-globals.css> \
  --ios <path-to-DesignTokens.swift> \
  --android <path-to-DesignTokens.kt>
```

If running in a scaffolded child project (not the template), find the files:
- Web: `<app-slug>-web/app/globals.css`
- iOS: find `DesignTokens.swift` recursively
- Android: find `DesignTokens.kt` recursively

### Step 3: Push to Figma

If `figma-cli/` exists at the workspace root, push the new theme to Figma Desktop.
All commands run from the workspace root:

```bash
node figma-cli/src/index.js connect
node figma-cli/src/index.js var delete-all           # Clear old variables
node figma-cli/src/index.js tokens preset shadcn      # Push new primitives + semantic tokens
node figma-cli/src/index.js var visualize             # Create color swatches on canvas
```

If Figma Desktop is not open, note it in the report and suggest running the push later.

### Step 4: Report

Tell the user which files were updated, what changed, and whether Figma was synced.

```
## Theme Update Report

### Files Updated
- Web: multi-repo-nextjs/app/globals.css
- iOS: multi-repo-ios/.../DesignTokens.swift
- Android: multi-repo-android/.../DesignTokens.kt

### Theme
- Brand: <palette>
- Neutral: <neutral>
- Radius: <preset>
- Selection: <style>

### Figma
- Tokens pushed: [yes | Figma Desktop not available — run manually]
- Variables visualized: [yes | skipped]
```

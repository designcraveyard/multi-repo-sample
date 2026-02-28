# /new-project — Scaffold a new app from the template

## Description

Interactive wizard that creates a new cross-platform app project from this template. Two-phase flow: quick scaffold (immediate) → deep discovery (optional follow-up).

## Trigger

User says "/new-project" or "create a new project" or "scaffold a new app"

## Instructions

### Phase 1: Quick Start — Interactive Q&A

Ask the user these questions using `AskUserQuestion` (batch 2-3 related questions per call):

**Batch 1 — Identity:**
1. What's the app name? (PascalCase, e.g. "CoolApp")
2. One-line description of the app?
3. Your developer name? (for package IDs, e.g. "john")

**Batch 2 — Platforms & Infrastructure:**
4. Which platforms? (Web / iOS / Android / All)
5. Apple Development Team ID? (if iOS selected, otherwise skip)
6. Do you have a Supabase project? (yes → ask for project ref + anon key, no → skip)
   - If no Supabase: app will be scaffolded in **local-first mode** — all auth, Supabase client libraries, and login screens are stripped automatically
   - Users often paste the full `.env` block — extract from it: project ref = slug in `NEXT_PUBLIC_SUPABASE_URL` (e.g. `https://<ref>.supabase.co`), anon key = `NEXT_PUBLIC_SUPABASE_ANON_KEY` value
7. GitHub org/username? (default: designcraveyard)
8. Create GitHub repos now? (requires `gh` CLI — creates private repos, sets up submodules + upstream tracking to this template)
   - YES → scaffold.sh will call git-setup.sh automatically
   - NO → pass `--skip-git` to scaffold.sh; user handles git setup manually later

**Batch 3 — Design:**
9. Brand palette? Show these options:
   - zinc (default, neutral gray)
   - indigo (blue-purple)
   - rose (pink-red)
   - emerald (green)
   - sky (light blue)
   - violet (purple)
   - amber (warm yellow)
   - Other (show full list: slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose)
10. Corner radius style?
   - none (sharp corners)
   - sm (subtle rounding)
   - md (default, moderate)
   - lg (rounded)
   - xl (very rounded)
   - full (pill/circle)
11. Selection component style?
   - brand (colored checkboxes, switches, radio buttons)
   - neutral (gray selection controls)

### Phase 2: Execute Scaffold

After collecting all answers, run the scaffold script. Only pass `--supabase-ref` and `--supabase-key` if the user provided them:

```bash
cd <template-root>
./scripts/scaffold.sh \
  --name "<AppName>" \
  --description "<description>" \
  --developer "<developer>" \
  --platforms "<platforms>" \
  --github-org "<org>" \
  --team-id "<teamId>" \
  --supabase-ref "<ref>" \
  --supabase-key "<key>" \
  --brand "<palette>" \
  --neutral "<neutral>" \
  --radius "<radius>" \
  --selection "<selection>" \
  --skip-git  # Only if user chose NOT to create GitHub repos
```

**Do NOT pass** `--supabase-ref ""` or `--supabase-key ""` with empty strings — omit them entirely when the user chose no Supabase. The script detects empty `SUPABASE_REF` to trigger local-first mode.

**Omit `--skip-git`** when the user wants GitHub repos created. The script will auto-detect `gh` CLI availability and skip gracefully if not installed.

### Phase 3: Post-Scaffold

1. Report the results to the user (pass/fail from validate-scaffold.sh)
2. If git setup ran: report the GitHub repos created, submodule structure, and upstream remotes. If skipped: tell the user they can run `scripts/git-setup.sh` manually later.
3. The validator now auto-skips developer name and team-id checks when they match the user's values (no more false positives for same-value reuse). If other failures appear, investigate manually with `plutil -lint` and `grep`.
4. For iOS local-first scaffolds, always verify the critical files:
   - `plutil -lint` on both `project.pbxproj` and `Info.plist`
   - `grep -c "isa = XCSwiftPackageProductDependency"` should return 1 (PhosphorSwift only)
5. Initialize `tracker.md` in the new project using the tracker template
6. Ask: "Project scaffolded! Ready for product discovery? This defines what you're building."
   - If yes → tell them to run `/product-discovery` in a Claude session opened at the new project directory
   - If no → print next steps and close

### Pre-filling from Command Arguments

When the user invokes `/new-project <description>`, use the description text to pre-fill answers and reduce Q&A rounds. For example, "A iOS voice notes app" tells you the description and that iOS is a platform. You can still ask to confirm, but batch efficiently — don't ask questions whose answers are obvious from the argument text.

### Important Notes

- The scaffold script lives at `scripts/scaffold.sh` in this template repo
- Output goes to `~/Documents/GitHub/<app-slug>/` by default
- The template repo itself is NOT modified — only the copy is transformed
- All scripts require `jq`, `rsync`, and `perl` (standard on macOS)
- To expose Supabase data to Claude Code via MCP, use `/new-mcp-server` after schema setup

## What the Scaffold Pipeline Does

The pipeline runs 8 steps (see `scripts/scaffold.sh`):

| Step | Script | What it does |
|------|--------|-------------|
| 1 | rsync | Copy template to target (excludes .git, node_modules, build artifacts) |
| 2 | replace-params.sh | Bulk text replacement using `scaffold.config.json` replacement map |
| 2b | scaffold.sh inline | Rename iOS Xcode internals (.xcodeproj, source dir, app entry point) |
| 3 | scaffold.sh inline | Rename Android package directory structure |
| 4 | platform-select.sh | Remove excluded platform directories |
| 4b | strip-auth.sh | **If no Supabase:** strip auth, Supabase, GoogleSignIn from all platforms |
| 5 | clean-demo-content.sh | Remove demo views; replace ContentView.swift with clean starter |
| 6 | config-writer.sh | Generate .env.local, tracker.md, etc. |
| 7 | theme-generator.js | Swap brand/neutral palettes with accessibility-aware semantic remapping |
| 8 | npm install | Install web dependencies (if web included) |
| 9 | git-setup.sh | **If not --skip-git:** init repos, create GitHub repos (private), register submodules, add upstream remotes to template |
| ✓ | validate-scaffold.sh | Verify no leftover template strings, demo content, or auth remnants |

## Key Design Decisions

### Infrastructure vs Demo Content

The template contains **infrastructure** layers (keep) and **demo content** (remove):

| Category | Examples | Action |
|----------|----------|--------|
| **Infrastructure** | OpenAI/, Audio/, Components/, DesignTokens.swift | KEEP — used by MarkdownEditor and other components |
| **Demo views** | ComponentsShowcaseView, AIDemoView, AssistantView, editor-demo/ | REMOVE — showcase UI for template development only |
| **Demo tabs** | Tabs for Components, Editor, AI Demo in AdaptiveNavShell | REMOVE — navigation references stripped |
| **ContentView.swift** | 93K-character component showcase | REPLACE with clean starter from `templates/ContentView.swift.template` |

The `demo_content_to_remove` array in `scaffold.config.json` lists paths to strip. OpenAI/ and Audio/ are NOT in this list — they are infrastructure.

### No-Supabase Mode (Local-First)

When `--supabase-ref` is empty, `strip-auth.sh` runs:

**iOS:** Removes Auth/, Supabase/, Views/Auth/, ProfileModel.swift, Secrets files. Strips SPM packages (Supabase, GoogleSignIn) from pbxproj. Simplifies app entry point (no auth gate). Cleans Info.plist (removes Google OAuth URL schemes, GIDClientID, NSAppTransportSecurity). `config-writer.sh` skips regenerating Secrets.swift when no Supabase ref is present.

**Web:** Removes lib/auth/, lib/supabase/, (auth)/ routes, middleware.ts, database.types.ts. Strips @supabase npm packages.

**Android:** Removes auth directories, ProfileModel.kt. Strips Supabase gradle dependencies.

**Root:** Removes supabase/ migrations directory. Strips Authentication section from CLAUDE.md.

#### iOS pbxproj stripping order (important)

The pbxproj stripping must remove **full multi-line blocks first**, then single-line references:
1. Remove `XCSwiftPackageProductDependency` blocks by matching the comment name (`/* Auth */`, `/* Supabase */`, etc.) in the key line — using multi-line perl regex
2. Remove `XCRemoteSwiftPackageReference` blocks for supabase-swift and GoogleSignIn-iOS — same approach
3. Only then remove single-line array references (packageProductDependencies, packageReferences, PBXBuildFile entries)

**Why:** The comment tokens like `/* Auth */` appear on both the ID key lines (`91XXXX /* Auth */ = {`) AND inside the package reference arrays. Stripping array references first (old approach) would accidentally strip the block key lines too, leaving orphaned `isa = XCSwiftPackageProductDependency;` blocks that corrupt the file.

#### Info.plist CFBundleURLTypes stripping

`CFBundleURLTypes` contains a **nested** `<array>` inside (`CFBundleURLSchemes`). The regex must use **greedy** `.*` (not non-greedy `.*?`) to reach the outermost `</array>`:
```perl
's/\s*<key>CFBundleURLTypes<\/key>\s*<array>.*<\/array>//gs'
```
Using `.*?` would stop at the inner `</array>` (closing `CFBundleURLSchemes`), leaving orphaned `</dict></array>` tags that produce a `PropertyListConversionError` in Xcode.

### Bright Brand Palette Handling

The theme generator (`scripts/theme-generator.js`) classifies palettes:

- **Dark palettes** (zinc, slate, gray, neutral, stone): Brand primary uses shade 950/50 — high contrast by default
- **Bright palettes** (all saturated colors): Brand primary uses shade **600/400** for accessible, vibrant color

For bright palettes, the generator:
1. Does the 1:1 primitive shade swap (zinc-50→amber-50, zinc-100→amber-100, etc.)
2. Then applies **semantic fixups** — remaps brand-related semantic tokens to use the accessible shade ramp:
   - Primary: 600 (light) / 400 (dark)
   - Hover: 700 (light) / 300 (dark)
   - Pressed: 800 (light) / 200 (dark)
   - OnBrandPrimary stays white/black for maximum contrast

This ensures buttons, links, and brand surfaces are vibrant and accessible rather than dark/muddy.

### iOS Xcode Project Renaming

Step 2b renames three things inside the iOS directory:
1. Source directory: `multi-repo-ios/` → `<slug>-ios/`
2. Xcode project: `multi-repo-ios.xcodeproj` → `<slug>-ios.xcodeproj`
3. App entry point: `multi_repo_iosApp.swift` → `<slug_underscore>_iosApp.swift`

The text replacement in Step 2 handles file *contents* (references to `multi-repo-ios` inside files), but directory/file names require explicit `mv` commands.

## Post-Scaffold Expectations

A correctly scaffolded project should have:
- Clean ContentView.swift (~30 lines) with app name and description
- No demo tabs (no Components, Editor, AI Demo in navigation)
- OpenAI/ and Audio/ infrastructure present (for MarkdownEditor)
- If no Supabase: zero auth/login screens, no Supabase packages, direct ContentView launch
- Correct theme with accessible contrast for bright brand palettes
- `--radius` in `globals.css` updated to match the chosen radius preset (e.g. `9999px` for `full`)
- Properly renamed Xcode project (matches app slug)
- Zero build errors on all included platforms

### iOS Local-First — Valid File State

After `strip-auth.sh`, the iOS project should have:

**`project.pbxproj`:** Only PhosphorSwift package remains — one `XCRemoteSwiftPackageReference`, one `XCSwiftPackageProductDependency`. Validate with `plutil -lint`.

**`Info.plist`:** Only `NSCameraUsageDescription` and `NSMicrophoneUsageDescription` keys. No `CFBundleURLTypes`, `GIDClientID`, or `NSAppTransportSecurity`. Validate with `plutil -lint`.

**`<slug>_iosApp.swift`:** No `import Supabase`, no auth gate, just `ContentView()` in `WindowGroup`.

**No `Secrets.swift`:** In local-first mode, `strip-auth.sh` deletes it and `config-writer.sh` skips regeneration.

### Validate Scaffold Outputs Manually

If `validate-scaffold.sh` reports failures, run these checks before raising an alarm:

```bash
# pbxproj must parse cleanly
plutil -lint <app>-ios/<app>-ios.xcodeproj/project.pbxproj

# Info.plist must parse cleanly
plutil -lint <app>-ios/<app>-ios/Info.plist

# No orphaned Supabase/Google blocks in pbxproj
grep -c "isa = XCSwiftPackageProductDependency" <app>-ios/<app>-ios.xcodeproj/project.pbxproj
# → should be 1 (PhosphorSwift only)
```

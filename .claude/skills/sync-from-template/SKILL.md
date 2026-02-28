---
name: sync-from-template
description: >
  Pull improvements from the app template into a scaffolded child project.
  Compares skills, agents, plugins, hooks, and docs from the template,
  applies the project's text replacement map, shows diffs, and lets the
  user selectively sync. Works without git — pure file-based comparison.
  Use when the user says "sync from template", "pull template updates",
  "update skills from template", or "get latest from template".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# /sync-from-template — Pull template improvements into this project

## Trigger

User says "/sync-from-template" or "sync from template" or "pull template updates"
or "update skills from template" or "get latest from template"

## Prerequisites

This skill must be run from a **scaffolded child project** (not the template itself).

## Phase 1: Detect Context

### Step 1.1: Verify Child Project

```bash
CURRENT_DIR=$(basename "$(pwd)")
```

If `$CURRENT_DIR` is `multi-repo-sample`, STOP:
> "You are inside the template repo. Run this from a scaffolded child project
> (e.g., note-buddy). Use `/upstream-to-template` for the reverse direction."

### Step 1.2: Derive Project Identity

Extract the project slug and platform directories:

```bash
SLUG=$(basename "$(pwd)")

# From directory listing
WEB_DIR=$(ls -d *-web 2>/dev/null | head -1)
IOS_DIR=$(ls -d *-ios 2>/dev/null | head -1)
ANDROID_DIR=$(ls -d *-android 2>/dev/null | head -1)
```

Derive variants:
- **PascalCase:** `note-buddy` → `NoteBuddy` (remove hyphens, capitalize each word)
- **Underscore:** `note-buddy` → `note_buddy` (replace hyphens with underscores)

Build the **replacement map** (template string → child string):

| Template | Child | Only if |
|----------|-------|---------|
| `multi-repo-nextjs` | `$WEB_DIR` | `*-web` dir exists |
| `multi-repo-android` | `$ANDROID_DIR` | `*-android` dir exists |
| `multi-repo-ios` | `$IOS_DIR` | `*-ios` dir exists |
| `multi-repo-sample` | `$SLUG` | always |
| `multi_repo_ios` | `${SLUG_UNDERSCORE}_ios` | `*-ios` dir exists |
| `MultiRepo` | `$PASCAL_NAME` | always |

**Important:** Only include a replacement pair if the child directory exists.
Apply replacements in this exact order (longest first to avoid partial matches).

### Step 1.3: Locate the Template

Search in order:
1. `../multi-repo-sample/`
2. `~/Documents/GitHub/multi-repo-sample/`
3. Check `upstream` remote: `git remote get-url upstream 2>/dev/null`

Verify: `test -f "$TEMPLATE_DIR/scaffold.config.json"` → if missing, ask the user for the path.

Store as `TEMPLATE_DIR`.

## Phase 2: Discover Changes

For each category below, compare template files against child files.
**Always apply the replacement map to template content before diffing.**

### Category A: Skills (Low Risk)

For each `$TEMPLATE_DIR/.claude/skills/*/SKILL.md`:
1. Read template file → apply replacement map → store as `transformed`
2. Read corresponding child file (if exists)
3. Classify: **NEW** / **CHANGED** / **IDENTICAL**

```bash
# List all template skills
ls "$TEMPLATE_DIR/.claude/skills/"
# List all child skills
ls .claude/skills/
```

### Category B: Agents (Low Risk)

Same approach for `$TEMPLATE_DIR/.claude/agents/*.md`.

### Category C: Plugins (Low Risk)

For each plugin directory in `$TEMPLATE_DIR/.claude/plugins/`:
1. Compare file count and names
2. For each file, apply replacement map and diff
3. Classify entire plugin as **NEW** / **CHANGED** / **IDENTICAL**

### Category D: Hooks & Settings (Medium Risk)

Compare `$TEMPLATE_DIR/.claude/settings.json` vs `.claude/settings.json`.

This requires **hook-level comparison**, not file-level:

1. Parse both JSON files
2. For each hook in template, find its fingerprint — the unique label in stderr output
   (e.g., `[credential-guard]`, `[design-token-guard]`, `[screen-structure-guard]`)
3. Classify each hook:
   - **MISSING** — template has it, child doesn't
   - **OUTDATED** — both have it, template version differs
   - **MATCH** — identical after replacement
   - **CHILD-CUSTOM** — child has hooks not in template (always preserve)

### Category E: Shared Docs (Medium Risk)

Only compare these template-generic docs (NOT project-specific ones):
- `docs/SCAFFOLDING.md`
- `docs/components.md` (structure only — component status is project-specific)
- `docs/design-tokens.md` (format updates only)

**Never sync:** `CLAUDE.md`, `tracker.md`, `chatkit.config.json`, `.mcp.json`,
`docs/PRDs/`, `docs/personas/`, `docs/design/`, credentials files.

## Phase 3: Present Changes

Show a categorized summary:

```
## Template Sync Report

Template: $TEMPLATE_DIR
Child:    $(pwd)
Replacements: multi-repo-nextjs → $WEB_DIR, multi-repo-ios → $IOS_DIR, ...

### Skills (Low Risk)
| # | Skill | Status | Delta |
|---|-------|--------|-------|
| 1 | git-push | IDENTICAL | — |
| 2 | design-token-sync | CHANGED | +12 -3 |
| 3 | sync-from-template | NEW | +150 |

### Agents (Low Risk)
| # | Agent | Status | Delta |
...

### Hooks (Medium Risk)
| # | Hook | Status | Type |
|---|------|--------|------|
| 1 | credential-guard | MISSING | PreToolUse |
| 2 | design-token-guard | MATCH | PreToolUse |
| 3 | auto-lint | MISSING | PostToolUse |

### Docs
| # | Doc | Status |
...

### Summary
- X items to sync (Y new, Z updated)
- W hooks missing from settings.json
```

## Phase 4: User Selects What to Sync

Ask the user using AskUserQuestion:

**Options:**
1. **Sync All Safe** (recommended) — all skills + agents + plugins + missing hooks.
   Skips docs and doesn't modify existing hooks.
2. **Sync Everything** — all categories including docs and outdated hook updates.
3. **Pick Individually** — iterate through each change, ask yes/no.
4. **Review Diffs First** — show full diffs for all CHANGED files, then ask.

For hooks specifically, always preview what will be added before applying.

## Phase 5: Apply Changes

### Step 5.1: Backup

Before modifying any file, create a backup:

```bash
cp .claude/settings.json .claude/settings.json.backup-$(date +%Y%m%d) 2>/dev/null
```

### Step 5.2: Skills, Agents, Plugins

For each selected file:
1. Read template file
2. Apply the replacement map (all substitutions from Step 1.2)
3. Write to child at the corresponding path
4. For NEW skills, create the directory: `mkdir -p .claude/skills/<name>/`

### Step 5.3: Settings.json Hook Merge (Additive Only)

**Never remove existing hooks.** Only add or replace.

1. Read child's `.claude/settings.json`
2. Read template's `.claude/settings.json`
3. Apply replacement map to each template hook command
4. For MISSING hooks → append to the child's hook array
5. For OUTDATED hooks → replace the matching hook entry
6. For CHILD-CUSTOM hooks → leave untouched
7. Write merged JSON back, validate with:
   ```bash
   python3 -c "import json; json.load(open('.claude/settings.json'))"
   ```
8. If validation fails, restore backup and report error

### Step 5.4: Docs (if selected)

- `SCAFFOLDING.md`: full replacement (template-generic content)
- `components.md`: merge new component entries only, preserve project status
- `design-tokens.md`: merge new token sections only, preserve project values

## Phase 6: Verify

### Step 6.1: Check for Leftover Template Strings

```bash
grep -rn "multi-repo-nextjs\|multi-repo-ios\|multi-repo-android\|multi-repo-sample\|multi_repo_ios\|MultiRepo" \
  .claude/skills/ .claude/agents/ .claude/plugins/ .claude/settings.json 2>/dev/null
```

If found, fix them by applying the replacement map to those specific lines.

### Step 6.2: Summary Report

```
## Sync Complete

Applied:
- N skills updated (list names)
- N new skills added (list names)
- N hooks added to settings.json (list names)
- N docs updated (list names)

Skipped:
- N skills (already identical)
- N items (user declined)

Backup: .claude/settings.json.backup-YYYYMMDD
```

### Step 6.3: Suggest Follow-ups

- If hooks were added: "Try editing a component file to confirm the new hooks fire."
- If new skills were added: "New skills available: /skill-name. See CLAUDE.md."
- Always: "CLAUDE.md was not synced (project-specific). Manually port any new
  conventions you need from the template's CLAUDE.md."

## Rules

1. **Never overwrite without diff preview** — all changes must be shown first
2. **Never sync platform code** — submodule directories are out of scope
3. **Never sync credentials** — `.env.local`, `Secrets.swift`, `local.properties`, `.mcp.json`
4. **Never sync `settings.local.json`** — user-specific permissions
5. **Never sync `CLAUDE.md`** — project-specific documentation
6. **Never sync `tracker.md`** — project-specific progress
7. **Never sync `scaffold.config.json`** — template-only file
8. **Always backup** `settings.json` before modifying
9. **Always apply replacement map** before writing template content to child
10. **Always validate JSON** after modifying `settings.json`
11. **Additive only for hooks** — never remove hooks the child added
12. **Apply replacements longest-first** — prevents partial matches

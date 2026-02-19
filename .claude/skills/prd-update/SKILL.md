---
name: prd-update
description: Update PRD documents and CLAUDE.md files across the entire workspace when features change or are added. Use when user says "update the PRD", "document this feature", "update CLAUDE.md", or at the end of a major development session. Also use after /cross-platform-feature or /new-screen to keep docs current.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# PRD + CLAUDE.md Updater

Keep workspace documentation in sync with the actual codebase.

## Workspace Documentation Locations

- Root: `CLAUDE.md`
- Next.js: `multi-repo-nextjs/CLAUDE.md`
- iOS: `multi-repo-ios/CLAUDE.md`
- PRDs: `docs/PRDs/`
- API contracts: `docs/api-contracts.md`
- Design tokens: `docs/design-tokens.md`

## Arguments

`$ARGUMENTS` — Feature name (e.g. `user-profile`) or `all` to scan everything.

## Workflow

### Phase 1: Discover Current State

```bash
# Web routes
find multi-repo-nextjs/app -name "page.tsx" 2>/dev/null | sort | sed 's|multi-repo-nextjs/app/||' | sed 's|/page.tsx||'

# iOS screens
find multi-repo-ios/multi-repo-ios -name "*View.swift" 2>/dev/null | sort | sed 's|.*multi-repo-ios/||' | sed 's|View.swift||'

# Existing PRDs
ls docs/PRDs/ 2>/dev/null

# Supabase migrations
ls supabase/migrations/ 2>/dev/null | grep -v .gitkeep
```

### Phase 2: Audit CLAUDE.md Files

Read each CLAUDE.md file and compare against actual file structure. Flag:
- Referenced files/routes that no longer exist → suggest removal
- New routes/views not in docs → suggest addition
- Out-of-date commands

Apply targeted edits only — do not rewrite entire files.

### Phase 3: Create or Update PRD

If `$ARGUMENTS` is a feature name:
- Check if `docs/PRDs/<feature>.md` exists
- If not: create it from [references/prd-template.md](references/prd-template.md), fill in feature name, date, route/view paths
- If yes: update **Status**, **Last Updated**, and **Cross-Platform Scope** table

If `$ARGUMENTS` is `all`:
- For each web route: check if a PRD exists; create a stub if missing
- For each iOS view: cross-reference with PRDs; flag any view without a matching PRD
- Update `docs/PRDs/README.md` (create if missing) with a table of all PRDs and their status

### Phase 4: Update API Contracts

If any migration files were added since the last update, append their table description to `docs/api-contracts.md` under **Supabase Tables**.

### Phase 5: Summary

```
## Documentation Update Summary

CLAUDE.md updates:
  multi-repo-nextjs/CLAUDE.md — [changes made or "up to date"]
  multi-repo-ios/CLAUDE.md    — [changes made or "up to date"]
  CLAUDE.md (root)            — [changes made or "up to date"]

PRDs:
  Created: [list]
  Updated: [list]
  Missing (no PRD): [list of features without a PRD]

Still needs documentation:
  [list any stale/missing items]
```

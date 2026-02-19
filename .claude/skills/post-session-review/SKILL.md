---
name: post-session-review
description: >
  Evaluate whether docs, Claude skills, agents, or CLAUDE.md files need
  updating based on what was changed in this session. Run at the end of
  every successful development session.
user-invocable: false
---

# Post-Session Review

After each successful session, evaluate whether any of the following need
updating based on what was built or changed:

## Checklist

### 1. `docs/design-tokens.md`
- Were new design tokens added (color, radius, spacing, typography, icons)?
- Were token names changed or deprecated?
- → **Action:** Add/update the relevant section in `docs/design-tokens.md`

### 2. `docs/api-contracts.md`
- Were new Supabase tables, columns, or RLS policies added?
- Were TypeScript types or Swift models changed?
- → **Action:** Update `docs/api-contracts.md` with the new schema

### 3. `docs/PRDs/`
- Was a new feature built or an existing feature meaningfully changed?
- → **Action:** Run `/prd-update` to sync PRDs with current state

### 4. Root `CLAUDE.md` (workspace-wide conventions)
- Were new cross-platform conventions established?
- Were new packages or dependencies added?
- Were new icon, token, or styling rules established?
- Was a new cross-platform pattern introduced?
- → **Action:** Update the relevant section in `/CLAUDE.md`

### 5. `multi-repo-nextjs/CLAUDE.md`
- Was the web stack changed (new packages, new patterns, new commands)?
- Were new component patterns, folder structures, or import conventions added?
- → **Action:** Update `multi-repo-nextjs/CLAUDE.md`

### 6. `multi-repo-ios/CLAUDE.md`
- Was the iOS stack changed (new SPM packages, new patterns)?
- Were new view helpers, extensions, or SwiftUI patterns introduced?
- → **Action:** Update `multi-repo-ios/CLAUDE.md`

### 7. `.claude/skills/`
- Was a new repeatable workflow used that should become a skill?
- Were new skill parameters or steps discovered?
- → **Action:** Create or update the relevant SKILL.md

### 8. `.claude/agents/`
- Was a new type of cross-platform review or validation needed?
- → **Action:** Create or update the agent markdown file

### 9. `.claude/settings.json` hooks
- Were new file patterns or triggers discovered that should auto-remind?
- Were new blocked operations needed (e.g. don't edit X directly)?
- → **Action:** Add/update the hook in `.claude/settings.json`

## How to Use

Claude evaluates this checklist automatically at the end of each session.
Users can also invoke explicitly:

```
/post-session-review
```

## Output Format

Produce a brief report:

```
## Post-Session Review

### Changed in this session
- [list key things built/changed]

### Docs to update
- [ ] docs/design-tokens.md — [reason]

### CLAUDE.md files to update
- [ ] Root CLAUDE.md — [reason]
- [ ] multi-repo-nextjs/CLAUDE.md — [reason]

### Skills/Agents to create or update
- [ ] .claude/skills/X — [reason]

### Nothing to update
- [list items that are already current]
```

Then make the updates automatically unless they are complex enough to need user input.

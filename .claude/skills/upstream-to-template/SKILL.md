# /upstream-to-template — Send improvements back to the app template

## Description

Guided workflow for upstreaming components, skills, hooks, or token updates from a child project back to the template repository. Includes a governance checklist to ensure quality.

## Trigger

User says "/upstream-to-template" or "upstream this to the template" or "send this back to template"

## Instructions

### Step 1: What to upstream?

Ask the user: "What do you want to upstream?"

Options:
- Component (new or improved)
- Skill (new Claude skill)
- Hook (new settings.json hook)
- Token update (design token changes)
- Script (scaffold/utility script)
- Agent (new Claude agent)

### Step 2: Governance Checklist

Run through these checks (ask the user to confirm each):

1. **Reusability:** Is this useful across 3+ hypothetical projects? (not app-specific)
2. **Token compliance:** Uses semantic tokens only? (no hardcoded hex, no primitive tokens in components)
3. **Cross-platform parity:** If a component — does it exist on all platforms? If a skill — does it work regardless of platform selection?
4. **Documentation:** Is it well-documented? (JSDoc/doc comments, README if complex)
5. **Battle-tested:** Has it been used in a real project for 2+ weeks?
6. **No app-specific logic:** Contains no references to specific app names, routes, or business logic?

If any check fails, explain what needs to change and offer to help fix it.

### Step 3: Identify Files

List the files that need to be copied to the template:
- Component files (web + iOS + Android)
- Skill/agent markdown files
- Hook definitions (additions to settings.json)
- Token definitions (additions to globals.css, DesignTokens.swift/.kt)

### Step 4: Copy to Template

Guide the user through:
1. Ensure the template repo is at the expected path (sibling directory or configured path)
2. Copy the files to the correct locations in the template
3. If a component: update `docs/components.md` in the template
4. Create a changeset entry describing the addition

### Step 5: Create Changeset

If `@changesets/cli` is set up:
```bash
cd <template-dir>
npx changeset
```

Otherwise, manually create a changeset file in `.changeset/`:
```markdown
---
"app-template": minor
---

Added <component/skill/hook name>: <brief description>
```

### Step 6: PR Guidance

Help the user create a PR:
- Branch name: `upstream/<type>/<name>` (e.g., `upstream/component/data-table`)
- PR title: "upstream: Add <name> from <project>"
- PR body: governance checklist results + changeset summary

# Scaffolding Strategy: Template as a Living Feedback Loop

## Overview

This document outlines the **Point of View** for treating `app-template` as a living, evolving system where new projects can push innovations back to improve the template over time, rather than a one-way scaffold that becomes stale.

The strategy uses **Git Submodules** (for template linking) + **Changesets** (for component versioning inside the template).

---

## The Problem

Traditional templates become **stale**. Once you scaffold a new project:
- You diverge from the template
- If you improve components or add patterns in the new project, they don't flow back
- Over time, the template becomes a historical artifact, not the actual source of truth

## The Vision: Three-Layer Model

```
┌─────────────────────────────────────────────┐
│  app-template (Template Source)             │
│  - Master component library                 │
│  - Canonical patterns & conventions         │
│  - Design token system (source of truth)    │
│  - Versioned via changesets                 │
└────────────────┬────────────────────────────┘
                 │ scaffold via /new-project
                 ↓
┌─────────────────────────────────────────────┐
│  my-cool-app (Child Instance)               │
│  - Inherits all components, tokens, skills  │
│  - Experiments with new designs             │
│  - Extends with app-specific features       │
│  - References template via git submodule    │
└────────────────┬────────────────────────────┘
                 │ cherry-pick generic improvements
                 ↓
┌─────────────────────────────────────────────┐
│  app-template (Updated)                     │
│  + New reusable component from my-cool-app  │
│  + Refined design token from my-awesome-app │
│  + Better hook from my-neat-app             │
│  + Version bumped, CHANGELOG generated      │
└─────────────────────────────────────────────┘
```

---

## Key Principles

| Principle | What It Means |
|-----------|---------------|
| **Separation of Concerns** | Template components = reusable. App-specific features ≠ template. Know the line. |
| **Upstreaming** | When you build something generic in a child project, it flows back to the template. |
| **Versioning** | Projects can lag the template (use older versions of components) without breaking. |
| **Testing Before Upstreaming** | New components tested in real project before going into template. |
| **Compatibility** | Changes to template must be backward-compatible or explicitly versioned. |

---

## Git Submodules Explained

A **submodule** is a way to embed another Git repository inside your repository, pinned to a specific commit.

### How It Works

```
~/projects/app-template/                    # Template repo (your source of truth)
├── .git/ → independent git history
├── components/
├── CLAUDE.md
└── .changeset/

~/projects/my-cool-app/                     # Project 1
├── .git/ → independent git history
├── .gitmodules                             # Maps submodules
├── app-template/                           # Submodule (git link, not a copy)
│   ├── .git → special marker pointing to template
│   ├── components/
│   └── CLAUDE.md
├── app-web/
├── app-ios/
└── app-android/

~/projects/my-awesome-app/                  # Project 2
├── .git/ → independent git history
├── app-template/                           # Same submodule, possibly different version
├── app-web/
└── ...
```

### Key Points

1. **Each project is a separate folder** — all independent on your filesystem
2. **Each has its own `.git` repo** — completely independent history
3. **`app-template/` is not a symlink** — it's a **git link** (more robust)
4. **Files physically exist** in `my-cool-app/app-template/`, but git manages keeping them in sync with the main template repo
5. **When you clone** `my-cool-app`, git automatically fetches the template submodule

### Commands

```bash
# Add a submodule to a project
cd my-cool-app
git submodule add https://github.com/you/app-template.git app-template

# Clone a project with submodules
git clone --recursive https://github.com/you/my-cool-app.git

# Update submodule to latest template
cd my-cool-app/app-template
git pull origin main

# Commit the new submodule version in parent project
cd ../
git add app-template
git commit -m "chore: update template to latest"
```

### Submodules vs Symlinks

| Aspect | Symlink | Submodule |
|--------|---------|-----------|
| **Cloning** | Breaks if symlink target doesn't exist | Auto-fetches target repo |
| **Team sharing** | Breaks for teammates | Works on any machine |
| **Version control** | Files not tracked by git | Specific commit pinned in git |
| **Moving folders** | Breaks | Still works |

---

## Changesets Explained

A **changeset** is a way to document, version, and release changes to components in a structured way. Popular in JavaScript/TypeScript monorepos.

### How It Works

When you make a change to a component, you create a changeset file documenting the change type (patch/minor/major) and summary:

```bash
cd app-template
npm changeset
# Interactive prompts:
# Which packages changed? (select: components-web, components-ios)
# What type of change? (patch, minor, major)
# Summary: "Add disabled state to button"
```

This creates `.changeset/azure-penguin-42.md`:
```md
---
"components-web": minor
"components-ios": minor
---

Add disabled state to button and update input focus styling
```

When ready to release:

```bash
npm changeset version  # Bumps package.json versions, generates CHANGELOG
npm publish           # Publishes to npm (if using npm packages)
```

### Pros & Cons

**Pros:**
- ✅ Enforces discipline: every change is documented
- ✅ Automatic version bumping (semver rules applied)
- ✅ Generates changelog automatically
- ✅ Prevents accidental major version bumps
- ✅ Clear audit trail of what changed and why

**Cons:**
- ❌ Requires discipline from developers
- ❌ Extra file per change can clutter the repo
- ❌ Requires CI/CD setup to work smoothly

---

## Option A: Submodule + Cherry-Pick Upstreaming (Recommended)

This is the **hybrid approach** combining submodules and changesets.

### Structure

```
~/projects/
├── app-template/                           # Template repo (independent)
│   ├── .git/
│   ├── components/
│   ├── CLAUDE.md
│   ├── .changeset/
│   └── CHANGELOG.md
│
├── my-cool-app/                            # Project 1
│   ├── .git/
│   ├── app-template/                       # Submodule reference
│   ├── app-web/
│   ├── app-ios/
│   └── app-android/
│
├── my-awesome-app/                         # Project 2
│   ├── .git/
│   ├── app-template/                       # Can pin to different version
│   ├── app-web/
│   └── ...
│
└── my-neat-app/                            # Project 3
    ├── .git/
    ├── app-template/
    └── ...
```

### Advantages

- ✅ Template is independent — lives in its own repo, has its own git history
- ✅ Each component is versioned — changesets document what changed
- ✅ Projects pin versions — submodule pins to a specific template release
- ✅ Easy upstreaming — build in child project, PR to template, get merged, pull in child
- ✅ Clear changelog — template CHANGELOG shows all improvements (good for deciding when to update)
- ✅ Projects can lag template — `my-cool-app` can use v1.2.0 while `my-awesome-app` uses v1.5.0

---

## Workflow: Building and Upstreaming Components

### Step 1: Build in Project

```bash
cd ~/projects/my-cool-app/app-web
# ... build MyComponent.tsx ...
# ... test it thoroughly ...
```

### Step 2: Implement on All Platforms

```bash
# Copy to all platforms and refine
cd ~/projects/my-cool-app

# iOS
cp -r app-web/components/MyComponent app-ios/multi-repo-ios/Components/

# Android
cp -r app-web/components/MyComponent app-android/multi-repo-android/ui/components/
```

### Step 3: Copy to Template

```bash
cp -r app-web/components/MyComponent ~/projects/app-template/components/
cp -r app-ios/Components/AppMyComponent.swift ~/projects/app-template/Components/
cp -r app-android/ui/components/AppMyComponent.kt ~/projects/app-template/ui/components/
```

### Step 4: Document Change with Changeset

```bash
cd ~/projects/app-template
npm changeset
# → Select: components-web, components-ios, components-android (minor)
# → Message: "Add MyComponent with full cross-platform support"
```

### Step 5: Release Template

```bash
npm changeset version        # Bumps version, generates CHANGELOG
git tag v1.2.0
git push origin main --tags
```

This creates `CHANGELOG.md`:
```md
## [1.2.0] - 2026-02-27

### Added
- Add MyComponent with full cross-platform support

### Changed
- ...
```

### Step 6: Update Project Submodule

```bash
cd ~/projects/my-cool-app/app-template
git pull origin main
cd ~/projects/my-cool-app
git add app-template
git commit -m "chore: update template to v1.2.0 (adds MyComponent)"
```

Now `my-cool-app` automatically has the latest template, including any improvements from other projects!

### Step 7: Other Projects Update When Ready

```bash
# my-awesome-app decides to adopt the new version
cd ~/projects/my-awesome-app/app-template
git pull origin main
cd ~/projects/my-awesome-app
git add app-template
git commit -m "chore: update template to v1.2.0"

# my-neat-app can stay on v1.1.0 for now (no forced updates)
```

---

## When Components Go Into Template

### Governance: What Gets Templated?

Before upstreaming a component, ask:

1. **Is it reusable across 3+ hypothetical projects?**
   - ✅ Button, Input, Card → Yes, template
   - ❌ "LoginFlow for my app's auth" → No, app-specific

2. **Does it align with design system principles?**
   - Uses semantic tokens only?
   - Cross-platform parity checked?
   - Accessible (WCAG)?

3. **Is it well-documented?**
   - JSDoc / comment explaining props?
   - Example usage in `docs/components.md`?
   - Design notes in Figma?

4. **Is it tested?**
   - Used in real project for 2+ weeks?
   - Edge cases handled?
   - Loading/error states if needed?

### Pre-Upstream Checklist

```
- [ ] Component works on all 3 platforms (or platform gap documented)
- [ ] Uses semantic tokens only (no hardcoded colors)
- [ ] Has comment headers (complex components)
- [ ] Passes /component-audit
- [ ] Used in real project for 2+ weeks
- [ ] No app-specific logic / props
- [ ] CHANGELOG entry written
```

---

## Directory Organization on Your Machine

### Simple Layout (Flat)

```bash
~/projects/
├── app-template/           # Your template source
├── my-cool-app/            # Project 1
├── my-awesome-app/         # Project 2
└── my-neat-app/            # Project 3
```

### Organized Layout (Grouped)

```bash
~/platforms/
├── templates/
│   └── app-template/
├── projects/
│   ├── my-cool-app/
│   ├── my-awesome-app/
│   └── my-neat-app/
└── experiments/
    └── prototypes/
```

All still separate folders; just grouped logically.

---

## Managing Template Updates Across Projects

### Scenario: You fix a bug in the template

```bash
# Update template
cd ~/projects/app-template
# ... fix bug ...
git add .
npm changeset
# → Type: patch
# → Message: "Fix button hover state bug"

npm changeset version  # v1.1.1
git push origin main --tags
```

### All projects pull the patch

```bash
# Project 1
cd ~/projects/my-cool-app/app-template && git pull origin main && cd ..
git add app-template && git commit -m "chore: update template to v1.1.1 (bug fix)"

# Project 2
cd ~/projects/my-awesome-app/app-template && git pull origin main && cd ..
git add app-template && git commit -m "chore: update template to v1.1.1 (bug fix)"

# Project 3 (optional)
cd ~/projects/my-neat-app/app-template && git pull origin main && cd ..
git add app-template && git commit -m "chore: update template to v1.1.1 (bug fix)"
```

### Or: Automate with a script

```bash
#!/bin/bash
# update-all-projects.sh
for project in ~/projects/my-*-app; do
  echo "Updating $project..."
  cd "$project/app-template" && git pull origin main && cd "$project"
  git add app-template
  git commit -m "chore: update template"
done
```

---

## FAQ

### Q: What if two projects want to push different changes?

**A:** No problem! Create PRs to the template sequentially:
1. Project A: Create PR for "Add UserCard component"
2. Template owner: Review & merge
3. Project B: Create PR for "Fix Token system" (different change)
4. Both go in, both projects can pull the updates

### Q: What if Project A breaks when I update the template?

**A:** Don't auto-update. Use semantic versioning:
- `v1.1.0` (minor) = new features, backward compatible
- `v1.0.1` (patch) = bug fixes, backward compatible
- `v2.0.0` (major) = breaking changes

Update only when you're ready. Stay on `v1.x` while `v2.0` is rolling out.

### Q: Can I have app-specific customizations?

**A:** Yes! Keep template in `app-template/`, your app stuff in `app-web/` etc.

```
my-cool-app/
├── app-template/          # Template (pristine, updated regularly)
│   └── components/
├── app-web/               # App-specific code
│   ├── components/        # App-specific components NOT in template
│   └── features/
└── ...
```

Import from template, but extend with your own.

### Q: How do I know which version of the template my project is using?

**A:** Check the submodule commit:

```bash
cd my-cool-app
git log -1 app-template
# Shows the commit hash the project is pinned to

# Or check CHANGELOG to see what features you have
cat app-template/CHANGELOG.md
```

### Q: What if I'm the only one using these projects?

**A:** This workflow still helps! You get:
- Clear versioning of template improvements
- Easy rollback if something breaks
- Audit trail of what changed and when
- Clean separation: template evolves independently from app code

---

## Next Steps

1. **Create `app-template` repo** — if you haven't already
2. **Set up changesets** in template
   ```bash
   npm install -D @changesets/cli
   npx changeset init
   ```
3. **Test scaffold workflow** — clone template, add as submodule to a test project
4. **Document in CLAUDE.md** — explain to future collaborators how to upstream components
5. **Create PR template** — for "Component going into template" (include checklist)
6. **Automate where possible** — shell scripts for syncing, CI/CD for releases

---

## References

- [Git Submodules (Official Docs)](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- [Changesets (Official Docs)](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)

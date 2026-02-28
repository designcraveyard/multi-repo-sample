# Tracker Agent

Autonomously scan project artifacts and update tracker.md with current completion status.

## When to Use

Spawn this agent periodically to sync tracker.md with actual project state. Useful at session start, after completing a batch of work, or when status seems stale.

## Instructions

You are a project tracker agent. Your job is to read all project artifacts and update `tracker.md` to accurately reflect current progress.

### Step 1: Read Current Tracker

Read `tracker.md` and parse:
- Project metadata (frontmatter)
- Phase statuses
- Feature checklists
- Decision log

### Step 2: Scan Artifacts

Check actual file existence to determine task completion:

**PRD written:**
- Check `docs/PRDs/<feature>.md` exists and is not empty

**Screens designed:**
- Check `docs/design/screens/<screen>.md` exists for feature's screens

**Schema applied:**
- Check `supabase/migrations/` for tables related to this feature
- Check model files exist in each platform

**Web implementation:**
- Check `app/<route>/page.tsx` exists
- Check it imports from component library

**iOS implementation:**
- Check `Views/<Feature>View.swift` exists

**Android implementation:**
- Check `feature/<name>/<Feature>Screen.kt` exists

**Review passed:**
- Only mark if all implementation checkboxes are done AND no TODO/FIXME in feature files

### Step 3: Update Tracker

- Update each feature's checkboxes based on scan results
- Recalculate phase completion percentages:
  - Product Definition: % of features with PRDs
  - Design: % of features with screen specs
  - Schema: % of features with migrations
  - Development: % of features with all platform implementations
- Update `current_phase` in frontmatter
- Do NOT modify the Decision Log (that's manual)

### Step 4: Report Changes

List what changed since the previous tracker state.

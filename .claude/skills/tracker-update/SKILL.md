# /tracker-update — Update a task in the project tracker

## Description

Quick command to mark a specific task as complete in tracker.md.

## Trigger

User says "/tracker-update <feature> <task> <status>" or "mark <feature> <task> as done"

## Arguments

- `feature`: Feature name (e.g., "auth", "feed", "profile")
- `task`: Task name (e.g., "prd", "design", "schema", "web", "ios", "android", "review")
- `status`: "done" or "pending" (default: done)

## Instructions

1. Read `tracker.md`
2. Find the feature section by fuzzy matching the feature name
3. Find the task checkbox by matching the task name:
   - "prd" → "PRD written"
   - "design" → "Screens designed"
   - "schema" → "Schema applied"
   - "web" → "Web implementation"
   - "ios" → "iOS implementation"
   - "android" → "Android implementation"
   - "review" → "Review passed"
4. Toggle the checkbox: `- [ ]` → `- [x]` (or reverse for "pending")
5. Recalculate phase completion percentages
6. Update `current_phase` in frontmatter if a phase is now complete
7. Write the updated file
8. Print confirmation: "Updated: <feature> / <task> → <status>"

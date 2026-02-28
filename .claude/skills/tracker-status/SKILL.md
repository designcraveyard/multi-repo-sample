# /tracker-status — Show current project progress

## Description

Reads tracker.md and displays a formatted summary of project phases, feature completion, and recent decisions.

## Trigger

User says "/tracker-status" or "show project status" or "where are we?"

## Instructions

1. Read `tracker.md` from the project root
2. Parse the frontmatter (project name, current phase, platforms)
3. Display a formatted summary:

```
Project: <name>
Current Phase: <phase>
Platforms: <platforms>

Phase Progress:
  Product Definition  ████████████████████  100%  Done
  Design              ████████░░░░░░░░░░░░   40%  In Progress
  Schema Design       ░░░░░░░░░░░░░░░░░░░░    0%  Pending
  Automation Setup    ░░░░░░░░░░░░░░░░░░░░    0%  Pending
  Development         ░░░░░░░░░░░░░░░░░░░░    0%  Pending

Features (Must Have):
  ☑ User Authentication  [PRD ✓] [Design ✓] [Schema ○] [Web ○] [iOS ○] [Android ○]
  ☐ Feed                 [PRD ○] [Design ○] [Schema ○] [Web ○] [iOS ○] [Android ○]

Recent Decisions:
  2026-02-27: Use bottom tabs for primary nav (design-discovery)
```

4. If the tracker file doesn't exist, tell the user to run `/new-project` first.

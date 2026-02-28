# /deep-dive — Expand a feature PRD into a full behavioral spec

## Description

Takes a brief PRD and expands it into a detailed behavioral specification with screen flows, data requirements, error handling, and edge cases. Run after /product-discovery when you need full specs before building.

## Trigger

User says "/deep-dive <feature-name>" or "expand the PRD for <feature>"

## Arguments

- `feature-name`: The feature slug (matches filename in `docs/PRDs/`)

## Instructions

### Step 1: Read the Brief PRD

Read `docs/PRDs/<feature-name>.md` for the brief spec. Also read:
- `docs/app-brief.md` for app context
- `docs/personas/` for user context
- `docs/mvp-matrix.md` for priority and platform scope

### Step 2: Expand the Spec

Work with the user to flesh out:

**User Flows:**
- Map each user story to a screen-by-screen flow
- Identify entry points (how users reach this feature)
- Identify exit points (where users go after)

**Screen Inventory:**
- List every screen this feature needs
- For each screen: purpose, key elements, user actions

**Data Requirements:**
- What data is read? What's created/updated/deleted?
- What entities are needed in the database?
- What API calls are made?

**States & Edge Cases:**
- Loading states
- Empty states (first use)
- Error states (network, validation, permissions)
- Edge cases (max limits, concurrent edits, offline)

**Platform Considerations:**
- Any platform-specific behavior?
- Native capabilities used (camera, location, notifications)?

### Step 3: Update PRD File

Overwrite `docs/PRDs/<feature-name>.md` with the expanded spec. Keep the original brief at the top, add the expanded sections below.

### Step 4: Update Tracker

Update `tracker.md` — mark the feature's "PRD written" checkbox as complete with "(expanded)" note.

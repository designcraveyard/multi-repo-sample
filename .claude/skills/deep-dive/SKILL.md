# /deep-dive — Collaboratively expand a feature into a full behavioral spec

## Description

A collaborative session that turns a brief PRD into a detailed behavioral specification. Works together with the user at each stage — auto-suggests user flows, screens, data models, and edge cases based on the brief, then refines through interactive questions. The final spec reflects both AI analysis and the user's domain knowledge.

## Trigger

User says "/deep-dive <feature-name>" or "expand the PRD for <feature>"

## Arguments

- `feature-name`: The feature slug (matches filename in `docs/PRDs/`)
- `--batch`: Expand ALL Must-Have features from `docs/mvp-matrix.md` in sequence
- `--batch <feat1> <feat2> ...`: Expand specific features only

## Instructions

### Step 1: Read & Frame

Read these files in parallel:
- `docs/PRDs/<feature-name>.md` — the brief spec
- `docs/app-brief.md` — app context
- `docs/personas/*.md` — user personas (all files)
- `docs/mvp-matrix.md` — priority and platform scope

Summarize what you found in 2–3 sentences, including: what the feature does, who uses it, and its MVP priority. Then say:

> "Let's flesh this out together. I'll suggest options at each step — pick one, combine ideas, or describe your own."

---

### Step 2: User Flows (Interactive)

**Auto-suggest:** Based on the brief PRD and app context, generate **2–3 distinct user flow variations**. Each flow is a short sequence of steps showing the screen-by-screen path a user takes.

Format each option as a labeled arrow sequence:

```
Flow A — [Descriptive name]
  [Entry point] → [Screen 1] → [Screen 2] → [Action] → [Outcome]
  Entry: [how user gets here]

Flow B — [Descriptive name]
  [Entry point] → [Screen 1] → [Action] → [Quick outcome]
  Entry: [alternate entry]

Flow C — [Descriptive name] (exploratory/power-user variant)
  [Entry] → [Browse/Filter] → [Screen] → [Action] → [Outcome]
```

**Use AskUserQuestion** with these options:
- One option per flow (label + one-sentence description)
- "Combine A + B" option if they're compatible
- "None of these — I'll describe my own" option

After the user chooses, ask **one follow-up**: "Any additional entry points or paths? (e.g., deep links from notifications, onboarding gate, guest mode, sharing flows)"

Incorporate their answer into the confirmed flow narrative.

---

### Step 3: Screen Inventory (Interactive)

**Auto-generate:** Based on the confirmed user flow, list every screen this feature needs. For each screen provide a structured entry:

```
[N]. [Screen Name]
     Purpose: [one sentence]
     Key elements: [3–5 bullet points of UI elements]
     Primary action: [main CTA or gesture]
```

Include screens for: main flow, empty states, error handling, settings/config if needed.

**Use AskUserQuestion** — multiSelect — showing the screen names as a checklist. Pre-select all screens. The user can deselect screens they consider out of scope for v1.

Then ask: "Any screens I missed? Describe any you'd add (or say 'none')."

If the user adds screens, incorporate them into the list and confirm the final inventory.

---

### Step 4: Data Model (Interactive)

**Auto-suggest:** Based on the feature description and confirmed screen list, propose the entities needed in the database. Present as a table:

```
Entity          Key Fields                                   Operations  Notes
──────────────  ───────────────────────────────────────────  ──────────  ──────────────────
[EntityName]    id, user_id, [field1], [field2], created_at  CRUD        [any notes]
[EntityName2]   id, [entity1]_id, [fields], updated_at       Read/Create [notes]
```

Then list the API operations per screen (what each screen reads or writes).

**Use AskUserQuestion** (multiSelect or open-ended follow-up) asking:
1. "Are there fields or entities missing from the model?"
2. "Any data from external APIs beyond the database?" (e.g., maps, payments, push notifications)
3. "Real-time requirements?" (live updates, presence, websockets)

Accept their answers as free-form text (offer "No changes" as an option). Update the model based on their input before moving on.

---

### Step 5: States & Edge Cases (Interactive)

**Auto-generate:** For each screen in the confirmed inventory, list the four required states:
- **Loading** — what shows while data is fetching
- **Empty** — first-use or no-results message (with an action to get started)
- **Error** — network failure, permission denied, or validation failure
- **Populated** — normal content

Then generate a list of **feature-specific edge cases** based on the domain. Examples:
- List features: pagination / infinite scroll, pull-to-refresh, sort/filter persistence
- Form features: draft saving, mid-form abandonment, duplicate detection
- Real-time features: connection drop handling, conflict resolution, optimistic updates
- Auth-gated features: anonymous user handling, session expiry mid-action
- Upload features: large file handling, network interruption, retry logic

**Use AskUserQuestion** — multiSelect — showing the edge cases. Ask: "Which of these do you want to handle in v1?"

Include a "Defer all to v2" option. Whatever they select gets included in the spec; deferred items go in an "Out of Scope (v2)" section.

---

### Step 6: Platform Considerations (Interactive)

Only ask this step if `docs/mvp-matrix.md` shows the feature is on multiple platforms.

**Use AskUserQuestion** with these questions:

**Q1:** "Any platform-specific behavior differences?"
- Options: Same on all platforms / iOS has swipe gestures Android uses long-press / Web has keyboard shortcuts others don't / Describe your own

**Q2 (multiSelect):** "Which native capabilities does this feature use?"
- Camera / Photo Library
- Location
- Push Notifications
- Biometric authentication
- Share Sheet / Activity Controller
- Background processing
- Widgets / App Extensions
- None of the above

**Q3:** "Offline support requirements?"
- Options: Fully online only / Cache last-fetched data (read-only offline) / Full offline with sync / Describe your own

**Q4:** "Deep link / universal link URL for this feature?"
- Options: Yes (ask them to describe the URL pattern) / No

Capture all answers for inclusion in the spec.

---

### Step 7: Confirmation & Write

Before writing, show a compact summary of everything that was confirmed:

```
Summary — <FeatureName>

  Flow:     [confirmed flow name + brief description]
  Screens:  [list of confirmed screen names]
  Entities: [list of entity names]
  Edge cases in scope: [count]
  Platforms: [list] / Offline: [yes/no] / Native capabilities: [list or none]
  Open questions: [any items marked TBD]
```

Ask: "Does this look right? Anything to change before I write the spec?"

If they say yes, make adjustments (ask what to change). If no, proceed.

**Write the spec** to `docs/PRDs/<feature-name>.md`:

```markdown
# <FeatureName>

> **Status:** Expanded
> **Priority:** [from mvp-matrix]
> **Platforms:** [from mvp-matrix]

## Brief

[Preserve original brief PRD content verbatim here]

## User Flows

[Confirmed flow with full step-by-step narrative]

### Entry Points
[List all confirmed entry points]

## Screen Inventory

### [Screen 1 Name]
- **Purpose:** ...
- **Key elements:** ...
- **Primary action:** ...
- **States:** Loading → [description] | Empty → [description] | Error → [description] | Populated → [description]

[Repeat for each screen]

## Data Model

### Entities

| Entity | Fields | Operations |
|--------|--------|------------|
...

### API Operations by Screen

| Screen | Reads | Writes |
|--------|-------|--------|
...

[External APIs if any]
[Real-time requirements if any]

## Edge Cases (v1 Scope)

[Bullet list of confirmed edge cases]

## Platform Considerations

[Platform-specific behavior, native capabilities, offline requirements, deep links]

## Out of Scope (v2)

[Deferred edge cases and features]

## Open Questions

[Any items marked TBD during the session]
```

---

### Step 8: Update Tracker

Update `tracker.md` — mark the feature's "PRD written" checkbox as complete with `(expanded)` appended to the entry.

Tell the user: "✓ **<FeatureName>** spec is written. Run `/wireframe <feature>` next to generate layout variations, or continue with the next feature."

---

## Batch Mode (`--batch`)

### Setup
1. Read `docs/mvp-matrix.md` and extract all Must-Have feature slugs (or use the specific features listed after `--batch`)
2. Read shared context once: `docs/app-brief.md`, `docs/personas/`, `docs/mvp-matrix.md`
3. Tell the user: "Found [N] Must-Have features to expand: [list]. We'll work through them together."

### Per-feature loop
For each feature:

a. **Brief intro:** Print: "Now expanding: **<feature-name>** — [one-line description from mvp-matrix]"

b. **Compressed flow** (Steps 2–6): Batch the interactive questions more efficiently to reduce round-trips:
   - Combine Steps 2 + 3 (flows + screens) into a single `AskUserQuestion` call using separate questions
   - Combine Steps 4 + 5 (data model + edge cases) into one pass — present both and ask for feedback together
   - Step 6 (platform) only if the feature has platform-specific markers in the mvp-matrix

c. **Write** the spec (Step 7, skip the summary confirmation in batch mode — just write)

d. **Continue prompt:** "✓ **<feature>** expanded. Continue to **<next-feature>**, skip it, or stop here?"

### Finish
Show summary: "Expanded **N of M** features. Run `/wireframe --all` to generate wireframes for all expanded features."

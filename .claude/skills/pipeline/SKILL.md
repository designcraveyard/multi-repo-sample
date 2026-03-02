---
name: pipeline
description: >
  Guided orchestrator that chains all discovery phases from product definition
  through design, schema, and feature implementation. Tracks state in pipeline.json,
  validates checkpoints between phases, auto-updates tracker.md, and supports
  --skip-figma mode for code-first workflows. Resumable across sessions.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, Agent
---

# /pipeline — Guided Discovery & Build Orchestrator

## Purpose

Chain the entire app creation flow into a single guided experience. The user runs
`/pipeline` once and is walked through every phase with checkpoint validation,
progress tracking, and clear transition prompts. Individual skills still work
standalone; this skill simply orchestrates them.

## Arguments

`$ARGUMENTS` — optional:
- `resume` — Continue from the last incomplete phase (reads pipeline.json)
- `--skip-figma` — Code-first mode; skip all Figma Desktop integration
- `--from <phase>` — Start from a specific phase (e.g., `--from design_theme`)
- `--skip <phase>` — Skip a specific phase (marks it `skipped` in pipeline.json)

---

## Phase Sequence

```
 1. scaffold            → Detect or run /new-project
 2. product_discovery   → /product-discovery
 3. deep_dive           → /deep-dive --batch
 4. design_ia           → Information Architecture (inlined)
 5. design_theme        → /define-theme
 6. design_theme_apply  → /generate-theme [--skip-figma]
 7. design_components   → Component Audit (inlined)
 8. design_wireframes   → /wireframe --all [--html]
 9. design_assets       → /asset-gen (optional)
10. design_figma        → /send-to-figma + /figma-design (skip if --skip-figma)
11. schema              → /schema-discovery
12. build               → /build-feature (per Must-Have feature)
```

---

## CRITICAL EXECUTION RULES

1. **Always read `pipeline.json` first.** If it exists, use it to determine the current phase. If it doesn't exist, check for `tracker.md` (scaffold already ran) or start fresh.

2. **Always validate the checkpoint** before starting any phase. If validation fails, report what's missing and suggest the fix. Do NOT proceed past a failed checkpoint.

3. **Always write to BOTH `pipeline.json` AND `tracker.md`** after completing each phase. pipeline.json is the machine state; tracker.md is the human-readable progress.

4. **Always show the transition prompt** between phases. Never auto-advance without giving the user the choice to continue, skip, or stop.

5. **Individual skills remain standalone.** When invoking a child skill (e.g., `/define-theme`), invoke it directly by its name. Do not duplicate its instructions here. After the child skill completes, return control to the pipeline.

6. **Session boundaries.** If the user says "stop" or the session ends, save state to pipeline.json. The next `/pipeline resume` picks up exactly where they left off.

---

## State Management: pipeline.json

### Location

`pipeline.json` at the project root (same level as `tracker.md`).

### Schema

```json
{
  "version": 1,
  "project": "<AppName>",
  "started": "<ISO timestamp>",
  "flags": {
    "skip_figma": false,
    "platforms": ["web", "ios", "android"],
    "has_supabase": true
  },
  "phases": {
    "scaffold":           { "status": "done", "completed_at": "..." },
    "product_discovery":  { "status": "done", "completed_at": "...", "features": ["notes", "settings"] },
    "deep_dive":          { "status": "done", "completed_at": "...", "expanded": ["notes", "settings"] },
    "design_ia":          { "status": "in_progress" },
    "design_theme":       { "status": "pending" },
    "design_theme_apply": { "status": "pending" },
    "design_components":  { "status": "pending" },
    "design_wireframes":  { "status": "pending" },
    "design_assets":      { "status": "pending" },
    "design_figma":       { "status": "pending" },
    "schema":             { "status": "pending" },
    "build":              { "status": "pending", "features_completed": [], "features_remaining": [] }
  }
}
```

### Status Values

- `pending` — not started
- `in_progress` — currently active
- `done` — completed successfully
- `skipped` — intentionally skipped (with `reason` field)

---

## Phase 0: Initialization

### On First Run (`/pipeline` with no pipeline.json)

1. Check if `tracker.md` exists (scaffold already ran):
   - YES → Read tracker.md frontmatter for project name, platforms
   - NO → Tell user: "No project found. Run `/new-project` first to scaffold, then come back."

2. Ask the user:
   ```
   Using AskUserQuestion:
   - "Do you have Figma Desktop set up for this project?"
     Options: Yes / No (code-first mode)
   ```
   Set `flags.skip_figma` based on the answer.

3. Detect `has_supabase` by checking for `.env.local` with `SUPABASE_URL` or `supabase/` directory.

4. Create `pipeline.json` with scaffold phase marked `done` and all others `pending`.

5. Determine which Must-Have features exist by reading `docs/mvp-matrix.md` (if it exists) or `docs/PRDs/` filenames.

6. Show the pipeline overview and ask to begin.

### On Resume (`/pipeline resume`)

1. Read `pipeline.json`.
2. Find the first phase that is NOT `done` or `skipped`.
3. Show progress summary:
   ```
   Pipeline: <ProjectName>
   ─────────────────────────────────
     [done]     Scaffold
     [done]     Product Discovery (4 features)
     [done]     Deep Dive (4 PRDs expanded)
     [current]  Information Architecture
     [pending]  Theme Definition
     [pending]  Theme Application
     [pending]  Component Audit
     [pending]  Wireframes
     [pending]  Assets (optional)
     [pending]  Schema Design
     [pending]  Build Features

   Resume from Information Architecture?
   ```
4. Run checkpoint validation for the current phase.
5. Proceed if valid, report issues if not.

---

## Transition Prompt Template

Show this between EVERY phase transition:

```
Phase complete: <Phase Name>
─────────────────────────────────
Summary: <what was created/done>

Pipeline progress:
  [done]     <completed phases with brief note>
  [done]     <Phase Name>  <-- you are here
  [next]     <Next Phase Name>
  [pending]  <remaining phases>

Continue to <Next Phase>? (yes / skip / stop)
```

**User responses:**
- **yes** or **continue** → proceed to next phase
- **skip** → mark next phase as `skipped` with reason, advance to the one after
- **stop** → save state, print: "Saved to pipeline.json. Run `/pipeline resume` to continue."
- **back** → re-run the current phase (useful for iteration)

---

## Checkpoint Validators

Before starting each phase, run these checks. Use `Glob` and `Grep` tools.

### Before `product_discovery`
- `tracker.md` exists
- tracker.md frontmatter has `project:` key
- **Fix:** "Run `/new-project` first."

### Before `deep_dive`
- `docs/PRDs/*.md` matches >= 1 file
- `docs/mvp-matrix.md` exists
- Each PRD file size > 100 bytes
- **Fix:** "Run `/product-discovery` to create PRDs and MVP matrix."

### Before `design_ia`
- `docs/PRDs/*.md` matches >= 1 file
- `docs/personas/*.md` matches >= 1 file
- `docs/app-brief.md` exists
- **Fix:** "Run `/product-discovery` to create PRDs, personas, and app brief."

### Before `design_theme`
- `docs/design/information-architecture.md` exists
- Grep for "Screen Inventory" or "screen inventory" in the IA file
- **Fix:** "The IA phase needs to run first (creates the screen inventory)."

### Before `design_theme_apply`
- `docs/design/theme.md` exists
- Grep for "Brand palette" or "brand palette" in theme.md
- **Fix:** "Run `/define-theme` to create the theme document."

### Before `design_components`
- `docs/design/theme.md` exists
- `docs/design/information-architecture.md` exists
- **Fix:** "Complete the theme and IA phases first."

### Before `design_wireframes`
- `docs/design/component-map.md` exists
- Grep for "|" (table rows) in component-map.md
- `docs/design/information-architecture.md` exists
- **Fix:** "Run the component audit phase to create the component map."

### Before `design_assets`
- `docs/design/theme.md` exists
- Grep for "Style Descriptors" or "style descriptors" in theme.md
- Check `.env.local` exists with `OPENAI_API_KEY` — **warn** if missing but don't block
- **Fix:** "Run `/define-theme` first. For assets, add OPENAI_API_KEY to .env.local."

### Before `design_figma`
- If `flags.skip_figma` is true → auto-skip with reason "--skip-figma mode"
- `docs/wireframes/*.html` matches >= 1 file
- Each HTML file > 500 bytes
- **Fix:** "Run `/wireframe` to generate HTML prototypes first."

### Before `schema`
- If `flags.has_supabase` is false → auto-skip with reason "no Supabase configured"
- `docs/PRDs/*.md` matches >= 1 file
- Grep for "Data Requirements" or "data requirements" in at least one PRD
- **Warn** (not block): if no PRDs have data sections → "PRDs lack data requirements. Consider running `/deep-dive` on them first."

### Before `build` (per feature)
- `docs/PRDs/<feature>.md` exists and > 200 bytes (expanded, not just brief)
- If `flags.has_supabase`: check `supabase/migrations/` has files
- **Fix:** "Run `/deep-dive <feature>` and `/schema-discovery` first."

---

## Phase Instructions

### Phase 1: scaffold

**Check:** Already handled in initialization. If pipeline.json exists, this phase is already `done`.

If no tracker.md exists, tell the user to run `/new-project` and return.

### Phase 2: product_discovery

**Invoke:** `/product-discovery`

After it completes:
1. Read `docs/mvp-matrix.md` and extract all Must-Have feature slugs
2. Store feature list in `pipeline.json` under `phases.product_discovery.features`
3. Update tracker.md
4. Show transition prompt

### Phase 3: deep_dive

**Invoke:** `/deep-dive --batch`

This expands all Must-Have feature PRDs from brief → full behavioral spec. The batch mode processes each feature sequentially with user confirmation between features.

After it completes:
1. Store expanded features in `pipeline.json` under `phases.deep_dive.expanded`
2. Update tracker.md — mark each feature's "PRD written" as "(expanded)"
3. Show transition prompt

### Phase 4: design_ia (Inlined)

This phase is inlined — it does NOT invoke a separate skill. Execute these steps directly:

**Step 1: Read Context**
- Read `docs/PRDs/` — all feature specs
- Read `docs/personas/` — user types
- Read `docs/mvp-matrix.md` — feature priorities
- Read `docs/app-brief.md` — app context

**Step 2: Propose Navigation Structure**
- Propose tab bar items (bottom nav on mobile, sidebar on desktop)
- Propose screen hierarchy under each tab
- Propose modal flows (settings, overlays)
- Present to user via `AskUserQuestion` for approval

**Step 3: Generate Screen Inventory**
- List every screen: name, parent tab, purpose, navigation path
- Mark which screens are in MVP scope

**Step 4: Write Output**
- Write `docs/design/information-architecture.md` with:
  - Navigation structure (tab hierarchy)
  - Screen inventory table
  - Modal/overlay flows
  - MVP scope markers

**Step 5: Checkpoint**
- Ask user to review the IA before proceeding
- Update pipeline.json and tracker.md

### Phase 5: design_theme

**Invoke:** `/define-theme`

This is a complex standalone skill (550 lines, 7 interactive phases). The pipeline invokes it inline and waits for it to complete. After `/define-theme` writes `docs/design/theme.md`:

1. Verify theme.md was created
2. Update pipeline.json
3. Show transition prompt — next is Theme Application

### Phase 6: design_theme_apply

**Check `flags.skip_figma`:**
- If true → **invoke:** `/generate-theme --skip-figma`
- If false → **invoke:** `/generate-theme`

After it completes:
1. Verify token files were updated (check globals.css modification time or content)
2. Update pipeline.json
3. Show transition prompt

### Phase 7: design_components (Inlined)

This phase is inlined. Execute these steps directly:

**Step 1: Read Context**
- Read screen inventory from `docs/design/information-architecture.md`
- Read `docs/components.md` for existing template components

**Step 2: Map Screens to Components**
- For each screen in the inventory, list which components it needs (with variants)
- Use the component registry to identify what already exists

**Step 3: Identify Gaps**
- **Simple gaps:** New variant of existing component → note for implementation
- **New components needed:** Not in registry → add to component backlog
- Present gaps to user

**Step 4: Write Output**
- Write `docs/design/component-map.md` with:
  - Table: Screen | Components Used | Gaps / Notes

**Step 5: Update state**
- Update pipeline.json and tracker.md
- Show transition prompt

### Phase 8: design_wireframes

**Check `flags.skip_figma`:**
- If true → **invoke:** `/wireframe --all --html`
- If false → **invoke:** `/wireframe --all`

After it completes:
1. Verify wireframe HTML files were created in `docs/wireframes/`
2. Update pipeline.json
3. Show transition prompt

### Phase 9: design_assets (Optional)

Before invoking, ask the user:
```
Using AskUserQuestion:
- "Generate visual assets (app icon, illustrations, empty states) now?"
  Options:
  - Yes — run /asset-gen with OpenAI gpt-image-1
  - Skip — generate assets later (or never)
```

- If **yes** → **invoke:** `/asset-gen`
  - If `flags.skip_figma` is true, `/asset-gen` should skip the "Push to Figma" option in Step 6
- If **skip** → mark phase as `skipped` with reason "user chose to skip"

Update pipeline.json and show transition prompt.

### Phase 10: design_figma

**Auto-skip check:** If `flags.skip_figma` is true:
- Mark phase as `skipped` with reason "--skip-figma mode"
- Show: "Skipping Figma design rendering (code-first mode). HTML wireframes in docs/wireframes/ serve as visual reference."
- Proceed to next phase

**If not skipped:**
1. **invoke:** `/send-to-figma docs/wireframes/`
   - Captures wireframe HTML as editable Figma layers
2. **invoke:** `/figma-design --all`
   - Renders full-fidelity screen frames in Figma
3. Update pipeline.json and show transition prompt

### Phase 11: schema

**Auto-skip check:** If `flags.has_supabase` is false:
- Mark phase as `skipped` with reason "no Supabase configured (local-first mode)"
- Show: "Skipping schema design (no Supabase). You can add a database later."
- Proceed to build phase

**If not skipped:**
- **invoke:** `/schema-discovery`
- After it completes, update pipeline.json and tracker.md
- Show transition prompt

### Phase 12: build

This phase loops over each Must-Have feature.

1. Read the feature list from `pipeline.json` `phases.product_discovery.features`
2. For each feature that hasn't been built yet:
   a. Show: "Building feature: <FeatureName> (<N> of <total>)"
   b. Run checkpoint validation for this feature
   c. **invoke:** `/build-feature <feature-slug>`
   d. After completion, auto-update tracker.md:
      - Check file existence: `app/<route>/page.tsx` → mark Web done
      - Check file existence: `Views/<Feature>View.swift` → mark iOS done
      - Check file existence: `feature/<name>/<Feature>Screen.kt` → mark Android done
   e. Store feature in `pipeline.json` `phases.build.features_completed`
   f. Ask: "Continue to next feature (<NextName>), or stop here?"

3. After all features built:
   - Mark build phase as `done`
   - Show final summary:
     ```
     Pipeline Complete!
     ─────────────────────────────────
     Project: <AppName>
     Features built: <N>
     Platforms: web, iOS, Android

     All phases:
       [done] Scaffold
       [done] Product Discovery (N features)
       [done] Deep Dive (N PRDs expanded)
       [done] Information Architecture
       [done] Theme Definition
       [done] Theme Application
       [done] Component Audit
       [done] Wireframes
       [done/skipped] Assets
       [done/skipped] Figma Design
       [done/skipped] Schema
       [done] Build (N features)

     Next steps:
       - /component-audit <name> — audit components for quality
       - /post-session-review — check docs and skills are up to date
       - /git-push — commit and push all repos
     ```

---

## Auto-Tracker Update Logic

After EVERY phase completion, execute this:

1. Read `tracker.md`
2. Based on the completed phase, update the relevant sections:
   - **product_discovery done** → set "Product Definition" phase to Done/100%; add features to checklist
   - **deep_dive done** → mark each feature's "PRD written" as checked with "(expanded)"
   - **design_ia done** → start "Design" phase percentage tracking
   - **design_theme + design_theme_apply + design_components + design_wireframes done** → set "Design" = Done/100%
   - **schema done** → set "Schema Design" = Done/100%; mark each feature's "Schema applied"
   - **build (per feature)** → mark platform checkboxes; when all platforms done, mark feature complete
3. Recalculate overall completion:
   - Product Definition: `(features_with_PRDs / total_features) * 100`
   - Design: `(features_with_screen_specs / total_features) * 100`
   - Schema Design: `(features_with_migrations / total_features) * 100`
   - Development: `(features_with_all_platforms / total_features) * 100`
4. Write updated tracker.md
5. Write updated pipeline.json (with status, timestamps, artifacts)

---

## Error Recovery

### Child Skill Fails Mid-Execution

If a child skill (e.g., `/generate-theme`) encounters an error:
1. Keep the phase status as `in_progress` in pipeline.json
2. Report the error to the user
3. Suggest: "Fix the issue and run `/pipeline resume` to retry this phase."

### Missing Prerequisites Discovered Mid-Phase

If a checkpoint passes but the child skill finds issues:
1. The child skill reports the problem
2. Pipeline marks the phase as `in_progress` (not done)
3. Suggest running the prerequisite skill directly, then `/pipeline resume`

### Session Timeout

If the session ends before a phase completes:
1. pipeline.json preserves the `in_progress` phase
2. Next `/pipeline resume` re-runs the checkpoint and retries the phase

---

## Examples

### Fresh Start
```
User: /pipeline
Claude: [Creates pipeline.json, asks about Figma, shows overview, begins with Phase 2]
```

### Resume After Break
```
User: /pipeline resume
Claude: [Reads pipeline.json, shows progress, resumes from design_wireframes]
```

### Code-First Mode
```
User: /pipeline --skip-figma
Claude: [Sets flag, auto-skips phases 10, adapts phases 6/8 to skip Figma CLI]
```

### Skip to Specific Phase
```
User: /pipeline --from schema
Claude: [Validates all prerequisites for schema phase, proceeds if valid]
```

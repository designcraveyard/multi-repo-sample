# /new-project — Scaffold a new app from the template

## Description

Interactive wizard that creates a new cross-platform app project from this template. Two-phase flow: quick scaffold (immediate) → deep discovery (optional follow-up).

## Trigger

User says "/new-project" or "create a new project" or "scaffold a new app"

## Instructions

### Phase 1: Quick Start — Interactive Q&A

Ask the user these questions using `AskUserQuestion` (batch 2-3 related questions per call):

**Batch 1 — Identity:**
1. What's the app name? (PascalCase, e.g. "CoolApp")
2. One-line description of the app?
3. Your developer name? (for package IDs, e.g. "john")

**Batch 2 — Platforms & Infrastructure:**
4. Which platforms? (Web / iOS / Android / All)
5. Apple Development Team ID? (if iOS selected, otherwise skip)
6. Do you have a Supabase project? (yes → ask for project ref + anon key, no → skip)
7. GitHub org/username? (default: designcraveyard)

**Batch 3 — Design:**
8. Brand palette? Show these options:
   - zinc (default, neutral gray)
   - indigo (blue-purple)
   - rose (pink-red)
   - emerald (green)
   - sky (light blue)
   - violet (purple)
   - amber (warm yellow)
   - Other (show full list: slate, gray, zinc, neutral, stone, red, orange, amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose)
9. Corner radius style?
   - none (sharp corners)
   - sm (subtle rounding)
   - md (default, moderate)
   - lg (rounded)
   - xl (very rounded)
   - full (pill/circle)
10. Selection component style?
   - brand (colored checkboxes, switches, radio buttons)
   - neutral (gray selection controls)

### Phase 2: Execute Scaffold

After collecting all answers, run the scaffold script:

```bash
cd <template-root>
./scripts/scaffold.sh \
  --name "<AppName>" \
  --description "<description>" \
  --developer "<developer>" \
  --platforms "<platforms>" \
  --github-org "<org>" \
  --team-id "<teamId>" \
  --supabase-ref "<ref>" \
  --supabase-key "<key>" \
  --brand "<palette>" \
  --neutral "<neutral>" \
  --radius "<radius>" \
  --selection "<selection>"
```

### Phase 3: Post-Scaffold

1. Report the results to the user (pass/fail from validate-scaffold.sh)
2. Initialize `tracker.md` in the new project using the tracker template
3. Ask: "Project scaffolded! Ready for product discovery? This defines what you're building."
   - If yes → tell them to run `/product-discovery` in a Claude session opened at the new project directory
   - If no → print next steps and close

### Important Notes

- The scaffold script lives at `scripts/scaffold.sh` in this template repo
- Output goes to `~/Documents/GitHub/<app-slug>/` by default
- The template repo itself is NOT modified — only the copy is transformed
- All scripts require `jq`, `rsync`, and `perl` (standard on macOS)
- To expose Supabase data to Claude Code via MCP, use `/new-mcp-server` after schema setup

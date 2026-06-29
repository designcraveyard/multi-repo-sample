# Docs & PRDs Audit

**Date:** 2026-06-08
**Scope:** root markdown + `docs/*` (all subdirs), `multi-repo-*/CLAUDE.md`, `scaffold.config.json`, `chatkit.config.json`, README files
**Method:** static analysis + one live read of the shared BubblesKit Supabase project (for `api-contracts.md` drift)
**Supersedes:** prior revision dated 2026-04-19

## Summary
- **Docs are fragmented and sprawling — unchanged since April.** Three parallel plan/PRD systems still coexist; the duplicate "automation guide" was already removed but the rest of the April debt is intact.
- **`docs/PRDs/` is still empty** — one template, zero actual PRDs. The advertised per-feature PRD home remains a ghost town 15 weeks after the template was dropped in.
- **Three parallel doc systems persist:** `docs/plans/` (frozen Feb 23–28, 21 files), `docs/superpowers/plans/`+`specs/` (active Apr, 2 plans / 2 specs), and the empty `docs/PRDs/`. No convergence.
- **`api-contracts.md` documents only `profiles` (86 lines, Feb 26) while the live shared Supabase has 26 tables / 19 migrations / 2 edge functions.** This is the single largest accuracy gap in the doc tree, and it widened materially since April (was "6 new migrations behind"; now ~24 tables undocumented).
- **`docs/components.md` registry is inaccurate:** it marks `AdaptiveSplitView` as **Done on all 3 platforms**, but fresh per-platform audits found it **missing on iOS and web** (Kotlin only). Registry has not been touched since Feb 28.
- **A large slice of the doc tree is untracked in git** — this whole audit (`docs/audit/`), `docs/competitive/`, the April-11 html-design-system plan+spec, and both `template-extension-*` docs are all `??` in git and would be **lost on a fresh clone**.
- **CLAUDE.md is healthier than April reported.** The `/competitor-research` row is **not** duplicated (single row, line 129) and `CLAUDE_AUTOMATION_GUIDE.md` is **gone**. Remaining gaps: no mention of `multi-repo-html/`, superpowers workflow, or `template-extension-*`.

## What changed since 2026-04-19

| Item | April 2026 state | June 2026 state | Delta |
|---|---|---|---|
| [`docs/CLAUDE_AUTOMATION_GUIDE.md`](../CLAUDE_AUTOMATION_GUIDE.md) | Present, 1,190 lines, dup of CLAUDE.md | **Deleted** (no longer on disk) | ✅ Resolved |
| `/competitor-research` row in [`CLAUDE.md`](../../CLAUDE.md) | Claimed duplicate | **Single row** (line 129), no dup | ✅ Was not / no longer an issue |
| [`docs/api-contracts.md`](../api-contracts.md) | 1 table; "6 migrations behind" | Still 1 table; live = **26 tables / 19 migrations / 2 edge fns** | 🔴 Gap widened |
| Superpowers checkbox count | 203 open / 0 checked | **201 open / 0 checked** (55 + 146) | 🟡 Recounted; still 0 ticked |
| Live Supabase | 6 new chatbot migrations | 19 migrations, 26 tables, 5 with RLS disabled | 🔴 Doc never caught up |
| Untracked docs | `template-extension-*` flagged | Now also `docs/audit/`, `docs/competitive/`, Apr-11 html plan+spec untracked | 🔴 More untracked surface |
| Competitive brief scope | Reported "Todoist + Habitify" | Actually **5 competitors** (Todoist, Habitify, 3 Things, Notion, ChatGPT) | 🟡 Correction; still incomplete capture |
| `docs/components.md` `AdaptiveSplitView` | "Done" (unverified) | "Done" — but **missing on iOS + web** per fresh audits | 🔴 Now confirmed inaccurate |

## Root markdown inventory

| File | Size | Modified | Purpose | Status |
|---|---|---|---|---|
| [`CLAUDE.md`](../../CLAUDE.md) | 23KB / 388 lines | Mar 13 | Project instructions | Coherent; 3 known omissions (see health check) |
| [`PLAN.md`](../../PLAN.md) | 7KB / 167 lines | Feb 23 (15 wks old) | Label/InputField rebuild — ONE feature | **Stale + misplaced**; belongs in `docs/plans/` |
| `README.md` | — | — | — | **Still missing at root** (exists only in `multi-repo-nextjs/`, `mcp-server/`, `figma-cli/`) |
| [`scaffold.config.json`](../../scaffold.config.json) | 110 lines | — | Scaffold parameter registry | Present |
| [`chatkit.config.json`](../../chatkit.config.json) | 13 lines | — | ChatKit config | Present |
| [`docs/template-extension-plan.md`](../template-extension-plan.md) | 33KB / 869 lines | Apr 16 | 6-phase port of FitChat/99-neo patterns | Active plan, **untracked in git** |
| [`docs/template-extension-report.md`](../template-extension-report.md) | 31KB / 532 lines | Apr 16 | Audit/inventory feeding the plan | Active, **untracked in git** |

Root "decor": `theme-builder-{initial,dark,final}.png` (Feb 26) — orphan screenshots, still present, not referenced by any doc.

## docs/ top-level inventory

| Path | Size / Count | Modified | Purpose | Status |
|---|---|---|---|---|
| [`SCAFFOLDING.md`](../SCAFFOLDING.md) | 15KB / 375 lines | Mar 2 | Scaffolder user guide | Referenced by CLAUDE.md |
| [`ScaffoldingStrategy.md`](../ScaffoldingStrategy.md) | 16KB / 507 lines | Feb 27 | Submodule/changeset strategy PoV | **Overlaps SCAFFOLDING.md**; inconsistent casing (PascalCase vs UPPER) |
| [`api-contracts.md`](../api-contracts.md) | 3KB / 86 lines | Feb 26 | Supabase `profiles` table ONLY | 🔴 **104 days stale; 25 of 26 live tables undocumented** |
| [`components.md`](../components.md) | 32KB / 445 lines | Feb 28 | Component registry | Core reference; **registry now contains a confirmed inaccuracy** (AdaptiveSplitView) |
| [`design-tokens.md`](../design-tokens.md) | 25KB / 398 lines | Mar 8 | Token reference | Fresh |
| `PRDs/` | 1 file (`prd-template.md`, Feb 26) | Feb 26 | Template only | 🔴 **EMPTY — no actual PRDs** |
| `components/` | 37 .md files | Feb 28 – Mar 8 | Per-component specs | Solid; aging (no new component spec since Mar 8) |
| [`design/design-guidelines.md`](../design/design-guidelines.md) | 17KB | Mar 2 | Universal design standards | Fresh, auto-loaded by many skills |
| `design/.DS_Store` | 6KB | Mar 2 | macOS detritus | Delete |
| `design/theme.md` | — | — | Referenced by CLAUDE.md L137, L144 | **MISSING** |
| `design/stylescapes/` | — | — | Referenced by `/stylescape` skill | **MISSING** (never generated) |
| `plans/` | 21 .md files | Feb 23 – Feb 28 | Historical plans | **Frozen Feb 23–28** — no plan added in ~15 weeks |
| `superpowers/plans/` | 2 files | Apr 11, Apr 16 | Active implementation plans | Fresh; **201 checkboxes total, 0 checked** |
| `superpowers/specs/` | 2 files | Apr 11, Apr 16 | Specs paired with plans | Fresh |
| `competitive/` | brief + index.html + 5 reviews + screenshots (mostly empty) | Mar 13 | One-off session output | **Untracked**; incomplete (see below) |
| `audit/` | 11 .md files | Apr 19 / Jun 8 | This audit | **Untracked in git** |
| `wireframes/` | only `_wireframe.css` | Mar 3 | Wireframe stylesheet | No actual wireframes — directory is a stub |
| `docs/.DS_Store` | 14KB | Apr 7 | macOS detritus | Delete |

## PRDs state — the big gap (unchanged)

`docs/PRDs/` still has **one file**: `prd-template.md` (Feb 26, untouched). Zero actual PRDs. This contradicts:
- [`CLAUDE.md`](../../CLAUDE.md) L186: `docs/PRDs/ — Per-feature product requirement documents`
- `/prd-update`, `/product-discovery`, `/cross-platform-feature` skills (all claim to write here)

**The superpowers plans under `docs/superpowers/plans/` are effectively filling the PRD role**, but they use a different format, a different directory, and a checkbox convention. Three conventions, zero convergence:
- `docs/plans/` (old, Feb, `YYYY-MM-DD`-prefixed, `-plan.md` / `-design.md` naming) — frozen
- `docs/superpowers/plans/` + `docs/superpowers/specs/` (new, superpowers plugin, checkbox-driven) — active
- `docs/PRDs/` (advertised, empty)

## api-contracts.md — the biggest accuracy gap (worsened)

[`docs/api-contracts.md`](../api-contracts.md) (86 lines, Feb 26) documents exactly **one table: `profiles`**, plus a type-mapping reference and a per-table sync checklist. Meanwhile a live read of the shared **BubblesKit** Supabase project today (2026-06-08) returns:

- **26 tables** in `public`: `profiles`, `conversations`, `messages`, `job_preferences`, `food_items`, `recipes`, `food_serving_units`, `recipe_ingredients`, `exercises`, `routines`, `workout_logs`, `user_goals`, `reflections`, `body_logs`, `chat_sessions`, `chat_messages`, `user_memories`, `agent_configs`, `tool_definitions`, `agent_tools`, `agent_handoffs`, `agent_versions`, `admin_roles`, `debug_traces`, `insight_reports`, `intelligence_embeddings`
- **19 migrations** (live), vs **8** in the local [`supabase/migrations/`](../../supabase/migrations/) dir (profiles ×2 + chat-core ×6, Apr 16) — the food/exercise/agent/knowledge migrations exist live but are **not in the repo's migration folder either**
- **2 edge functions**: `ai-transcribe`, `ai-transform` (both ACTIVE, `verify_jwt: true`) — undocumented in api-contracts.md
- **5 tables with RLS disabled** (`food_items`, `recipes`, `food_serving_units`, `recipe_ingredients`, `intelligence_embeddings`) — a security note that api-contracts.md's "RLS enabled by default on all tables" convention actively contradicts

(The task brief cited 25 tables / 3 buckets; live `list_tables` returned **26** tables and bucket count was not re-verifiable in this pass — flagged below.) Net: the doc is **~96% incomplete** against the live schema and its stated RLS convention is now false for 5 tables.

## Competitive research state (untracked, incomplete)

[`docs/competitive/`](../competitive/) — output of a single `/competitor-research` run on Mar 13, **untracked in git**:
- `brief.md` (7KB) — a usable brief covering **5 competitors**: Todoist, Habitify, 3 Things, Notion, ChatGPT (US). *(April audit said "Todoist + Habitify" — corrected.)*
- `index.html` (36KB) — gallery output
- `research-state.json` — `phases_complete: []` — **abandoned mid-run**
- `reviews/` — 5 .json files
- `screenshots/` — incomplete capture across all 5 competitors:
  - `*/ios/` — **all 5 empty**
  - `*/mobbin/` — only `todoist/` has 1 file; other 4 empty
  - `*/pageflows/` — **all 5 empty**
  - `*/android/` — 1 file each (listing screenshot only)
  - `*/web/` — has actual content (2–4 files each)

**Verdict:** one-off session exhaust, incomplete, untracked. Brief is usable reference material but pollutes the generic-template tree. Either `.gitignore` it or label it explicitly as "example output of `/competitor-research`".

## Superpowers plans/specs state

| File | Tracked? | Checkboxes | Status |
|---|---|---|---|
| [`specs/2026-04-11-html-design-system-design.md`](../superpowers/specs/2026-04-11-html-design-system-design.md) | **Untracked** | n/a | Spec → implemented (`multi-repo-html/` exists) |
| [`plans/2026-04-11-html-design-system.md`](../superpowers/plans/2026-04-11-html-design-system.md) | **Untracked** | **55, 0 checked** | Shipped but checklist never updated |
| [`specs/2026-04-16-multi-agent-chatbot-template-design.md`](../superpowers/specs/2026-04-16-multi-agent-chatbot-template-design.md) | Tracked | n/a | Fresh spec |
| [`plans/2026-04-16-multi-agent-chatbot-template.md`](../superpowers/plans/2026-04-16-multi-agent-chatbot-template.md) | Tracked | **146, 0 checked** | Active |

Two problems: (1) the html-design-system plan **shipped** (`multi-repo-html/` exists with 17 component dirs) yet **0/55 checkboxes** are ticked — no `/tracker-update`-equivalent discipline in the superpowers workflow; (2) the Apr-11 plan+spec are **untracked**, so the only record of the html design system's intent is unversioned.

## Duplicate / overlapping docs

| Pair | Overlap | Recommendation |
|---|---|---|
| [`SCAFFOLDING.md`](../SCAFFOLDING.md) vs [`ScaffoldingStrategy.md`](../ScaffoldingStrategy.md) | Both 15–16KB, same topic, inconsistent casing | Merge: SCAFFOLDING = user guide, Strategy = appendix |
| [`template-extension-plan.md`](../template-extension-plan.md) vs [`template-extension-report.md`](../template-extension-report.md) | 869 + 532 lines, paired | Keep pair (report is prereq); move to `docs/superpowers/` and **commit them** |
| [`docs/plans/`](../plans/) vs [`docs/superpowers/plans/`](../superpowers/plans/) | Two plan archives, different conventions | Pick one; archive the other under `docs/plans/archive/` |
| [`PLAN.md`](../../PLAN.md) (root) vs `docs/plans/*` | Misplaced single-feature plan | Move to `docs/plans/2026-02-23-label-inputfield-rebuild.md` |
| [`components.md`](../components.md) vs `docs/components/*.md` | Registry + per-component detail | Working pattern — keep (but fix the registry inaccuracy) |

*(Resolved since April: `CLAUDE.md` vs `CLAUDE_AUTOMATION_GUIDE.md` — the guide was deleted.)*

## Stale docs (>30–100 days)

- [`api-contracts.md`](../api-contracts.md) (Feb 26, ~102 days — 1 of 26 live tables)
- [`ScaffoldingStrategy.md`](../ScaffoldingStrategy.md) (Feb 27)
- [`components.md`](../components.md) (Feb 28 — registry contains a confirmed-wrong "Done")
- [`docs/plans/*`](../plans/) — all 21 files dated Feb 23–28
- [`docs/PRDs/prd-template.md`](../PRDs/prd-template.md) (Feb 26, never copied)
- `docs/wireframes/_wireframe.css` (Mar 3) — only file in dir
- [`PLAN.md`](../../PLAN.md) (Feb 23) + root `theme-builder-*.png` (Feb 26)

## Missing docs (referenced but not present)

| Reference | Target | Missing |
|---|---|---|
| [`CLAUDE.md`](../../CLAUDE.md) L137, L144 | `docs/design/theme.md` | Yes |
| `/stylescape` skill | `docs/design/stylescapes/` | Yes (never generated) |
| [`CLAUDE.md`](../../CLAUDE.md) L165 | `tracker.md` at workspace root | Yes (no tracker exists) |
| `/pipeline` skill | `pipeline.json` at project root | Yes |
| — | Root `README.md` | Yes |
| [`api-contracts.md`](../api-contracts.md) | 25 live tables + 2 edge fns | Yes |

## CLAUDE.md health check

**Good:** well-sectioned, platform markers (`<!-- PLATFORM:WEB:START -->`) intact, accurate skills table / hooks table / design tokens / adaptive layout. `/competitor-research` is a **single row** (not duplicated — April's claim was wrong or already fixed). The duplicate `CLAUDE_AUTOMATION_GUIDE.md` it overlapped with is **gone**.

**Problems (verified this pass):**
1. **No mention of `multi-repo-html/`** — a fourth top-level sub-repo (committed Apr 11, has its own `CLAUDE.md` and 17 component dirs). The Repository Structure section still says "three independent projects."
2. **No mention of the superpowers workflow** — yet the two most recent plans (`docs/superpowers/`) use it.
3. **No mention of `docs/template-extension-*`** work-in-progress.
4. **Dead references:** `docs/design/theme.md` (L137/L144) and `docs/PRDs/` (L186) both advertised but missing/empty; `tracker.md` (L165) referenced but absent.
5. **Three sub-repo CLAUDE.md files predate `multi-repo-html`:** nextjs (188 lines, Feb 27), ios (224 lines, Mar 8), android (169 lines, Feb 26) — none cross-reference the html sibling.

Length (388 lines / 23KB) is acceptable.

## Untracked-in-git inventory (lost on fresh clone)

| Path | Tracked? |
|---|---|
| `docs/audit/` (this entire audit, 11 files) | **Untracked** |
| `docs/competitive/` | **Untracked** |
| `docs/superpowers/plans/2026-04-11-html-design-system.md` | **Untracked** |
| `docs/superpowers/specs/2026-04-11-html-design-system-design.md` | **Untracked** |
| `docs/template-extension-plan.md` | **Untracked** |
| `docs/template-extension-report.md` | **Untracked** |
| `docs/superpowers/{plans,specs}/2026-04-16-*` | Tracked ✅ |

## Top 10 doc-organisation issues

1. **`api-contracts.md` covers 1 of 26 live tables** and its "RLS enabled by default" convention is false for 5 tables — the single largest, and now-worsened, accuracy gap.
2. **`docs/PRDs/` is empty** despite being advertised as the per-feature PRD home (unchanged in 15 weeks).
3. **Two parallel plan systems** (`docs/plans/` frozen Feb; `docs/superpowers/plans/` active Apr) plus the empty PRDs dir = three conventions.
4. **`docs/components.md` registry is wrong:** `AdaptiveSplitView` marked Done on all 3 platforms but missing on iOS + web.
5. **Six doc paths are untracked in git** and would vanish on a clean clone (audit, competitive, Apr-11 html plan+spec, both template-extension docs).
6. **Checkbox plans never updated** — 201 open checkboxes across 2 plans, 0 ticked, even though `multi-repo-html/` shipped.
7. **`multi-repo-html/` is undocumented in root CLAUDE.md** though it's a first-class sub-repo with its own CLAUDE.md.
8. **`SCAFFOLDING.md` + `ScaffoldingStrategy.md`** overlap and use inconsistent casing.
9. **`PLAN.md` lives at repo root** instead of `docs/plans/`; three orphan `theme-builder-*.png` at root.
10. **Referenced-but-missing:** `docs/design/theme.md`, `docs/design/stylescapes/`, root `tracker.md`, `pipeline.json`, root `README.md`; plus two `.DS_Store` files.

## Top 5 strengths

1. **`docs/components.md` + `docs/components/*.md`** — registry-plus-detail pattern is well-organised and referenced everywhere (despite one stale "Done").
2. **`docs/design-tokens.md`** (25KB, Mar 8) — canonical and fresh.
3. **`docs/design/design-guidelines.md`** (17KB, Mar 2) — single-source, explicitly auto-loaded by multiple skills.
4. **Date-prefixed plan filenames** (`2026-02-27-*`, `2026-04-11-*`) give clean chronology across both plan systems.
5. **`CLAUDE_AUTOMATION_GUIDE.md` retired** since April + CLAUDE.md retains platform-delimiter markers for programmatic scaffold trimming — a real, durable improvement.

## Unverifiable / flagged

- **Storage buckets:** task brief cited 3 buckets; not re-verified this pass (no bucket-list call). Flagged as unconfirmed.
- **Live table count:** brief said 25, live `list_tables` returned **26** — used the live number.
- **AdaptiveSplitView missing on iOS/web:** taken from the parallel per-platform audits (`01-nextjs.md`, `02-ios.md`), not independently re-checked in source here; the registry "Done" claim is what this doc audit can confirm as contradicted.

# Child Repos Audit — fit-chat, 99-neo, lifegraph

**Date:** 2026-06-08
**Scope:** drift from parent template, custom skills, upstream candidates, shared-Supabase coupling
**Methodology:** static analysis (git history, file inspection) + one live `list_tables` read of the shared BubblesKit project
**Prior report:** 2026-04-19 — deltas below are measured against it

> **Parent baseline note:** the template (`multi-repo-sample`) has **not advanced since 2026-04-16** (HEAD `d112b88`, 95 commits, no commits since the April audit was written). So every "commits behind" number below is driven almost entirely by *children moving on their own*, not by new parent work. The sync loop has had nothing new to pull for ~7 weeks, yet children also never pulled the backlog that already existed.

---

## Repo 1: fit-chat

- **Path:** `/Users/abhishekverma/Documents/GitHub/fit-chat`
- **Project type:** AI-powered fitness and nutrition coach ("Nourie"). Nutrition tracking (food library with pgvector embeddings, recipes, serving units), workout logging, Apple Health integration, multi-agent AI chat (chat_sessions / user_memories / debug_traces). PRDs: `AppleHealthIntegration`, `workout-logging`, `food-logging`, `insights-streaks`, `monetisation`.
- **Active platforms:** web (`fit-chat-web`) + iOS (`fit-chat-ios`, with `NouriWorkoutWidget` extension) + Android submodule. iOS most built-out.
- **Commit activity:** **44 root commits (+7 since 2026-04-19)**. Last root push **2026-06-04**; submodules also fresh (`fit-chat-ios` 2026-06-04, `fit-chat-web` 2026-06-04). **Still the most actively developed child — the only one with June activity.** Recent root commits are submodule-pointer bumps (food-log/camera/Nourie-nav, summary-card peek-paging, SSE chat), so root undercounts real submodule work.
- **CLAUDE.md drift:** 341 lines (parent 388). `## Local-First DB Architecture` section **still present** (lines 41–48: SwiftData/IndexedDB/Room with `updated_at` delta sync over ingredients/dishes/meals/serving-units/exercises). Still a clean upstream candidate. Otherwise template-shaped.
- **Custom skills:** `figma-to-ios`, `figma-to-ui` — **re-verified still child-only; neither exists in parent `.claude/skills/`.**
- **Custom plugins:** `blinkit-scraper` (Python nutrition scraper + Supabase upsert), `screenshot-analyzer`.
- **Custom agents:** none beyond parent set.
- **Docs state:** rich — 10 PRDs, `app-brief.md`, `app-philosophy.md`, `food-logging-stress-test.md`, `mvp-matrix.md`, `competitive/`, `personas/`, `plans/`, `qa-reports/`, `superpowers/`, `wireframes/`, `screens.md`.
- **Supabase:** own project `supabase-fitchat` (`bzuozrukiwibxqemksdh`) in `.mcp.json`, BUT still carries the inherited BubblesKit references in `CLAUDE.md` / `.claude/settings.local.json`. **fit-chat owns the fitness/nutrition schema now living in the shared BubblesKit project** (see Shared-Supabase section).
- **Template parity:** scaffolded 2026-03-14. **Still ~60 commits behind** parent (parent static; gap unchanged plus fit-chat's own 7 new commits widen relative drift). Missing: html-ds, DateGrid, multi-agent chatbot template spec + 6 parent migrations.

## Repo 2: 99-neo

- **Path:** `/Users/abhishekverma/Documents/GitHub/99-neo`
- **Project type:** AI real-estate advisor for NCR ("Neeva"). Multi-agent OpenAI Agents SDK system (triage + area-advisor + project-advisor + site-visit-planner). Scrapes builder/project/locality intel from 99acres + RERA, runs brochure PDFs through theme/media/data extraction, stores in Supabase with pgvector.
- **Active platforms:** web (heavily built) + iOS (sparse cards) + Android declared. Web dominates.
- **Commit activity:** **71 root commits (`rev-list HEAD`; +3 since 2026-04-19)**. Last root push **2026-04-24**; recent commits are docs/playground (system-prompt editor, agent playground, design brief). Submodules **stalled earlier than root**: `99-neo-web` last 2026-04-08, `99-neo-ios` last 2026-04-01. **Cooling down** — was "most active" in April, now no code activity in ~6 weeks (root) / ~8–9 weeks (submodules). *(The April report's "145 commits" appears to have counted all branches; `rev-list HEAD` is 71. Flagging the discrepancy; 71 is the trunk count.)*
- **CLAUDE.md drift:** **440 lines (vs 388 parent) — still the largest drift.** Full "Neeva" multi-agent section (agent graph, 248-query buyer taxonomy, engagement_signals + qualification flow), plus scripts/, RealtyData/intelligence/, supabase/migrations/, reports/ sections.
- **Custom skills (9):** `agent-doctor`, `agent-rag-designer`, `extract-brochure-data`, `extract-brochure-media`, `extract-brochure-theme`, `process-brochure`, `batch-process-brochures`, `backfill-project-from-brochure-and-report`, `supabase-postgres-best-practices`. **Re-verified: all still child-only.** The three high-value generic ones (`agent-doctor`, `agent-rag-designer`, `supabase-postgres-best-practices`) remain stranded — none in parent.
- **Custom plugins:** none. Has `skills-lock.json` (unique skill-pinning mechanism).
- **Custom agents:** none beyond parent.
- **Docs state:** 14 PRDs; `neeva-agent-flowchart.html`, `neeva-agent-system.md`, `neeva-debug-tracing.md`, `neeva-testing-plan.md`, `research/`, `Tests/`, `ProductDiscovery/`. Most thorough docs of the three.
- **Supabase:** **carries TWO Supabase MCP servers in `.mcp.json`** — `supabase-bubbleskit` (the inherited shared parent project) AND `supabase` → its own `frrrdcdqfmcejdpouiem`. **99-neo's real-estate intel schema (`intelligence_embeddings`, `insight_reports`) is also live in the shared BubblesKit project** (see Shared-Supabase section).
- **Template parity:** scaffolded 2026-03-08. **Still ~65 commits behind.** Missing `/competitor-research`, html-ds, DateGrid, multi-agent chatbot template spec.

## Repo 3: lifegraph

- **Path:** `/Users/abhishekverma/Documents/GitHub/lifegraph`
- **Project type:** Personal knowledge-graph / "second brain" app. PRDs: `ai-assistant`, `calendar-events`, `documents`, `habits-routines`, `logs-reviews`, `people-tags`, `projects`, `tasks`. Theme: "Warm Emerald" with stone-tinted primitives.
- **Active platforms:** web + iOS + Android declared as submodules.
- **Commit activity:** **5 root commits, 0 since 2026-04-19.** Last activity anywhere = **2026-03-04** (root `f43eec7`; `lifegraph-web` 2026-03-04, `lifegraph-ios` 2026-03-04). **Now ~13 weeks / ~3 months dormant** (was "6 weeks stale" in April — dormancy has roughly doubled). **Confirmed design-only abandonment:** last real commit `9fea8ca "complete design phase — final screens, assets, Figma export"` plus a theme finalization and a Phosphor-hooks sync, then nothing. No build commits ever followed.
- **CLAUDE.md drift:** 356 lines (close to parent 388). Minimal project-specific drift; mostly template with name swaps.
- **Custom skills (2):** `build-app-component` (Phase-B component builder with plan-mode workflow — generic, upstreamable pattern); `design-discovery` (deprecated in parent, points to `/pipeline`). Both still child-only.
- **Custom plugins:** none. **Custom agents:** none beyond parent.
- **Docs state:** 9 PRDs, `component-inventory.md`, `entity-architecture.md`, `personas/`, `wireframes/`. Finished design phase, stopped.
- **Supabase:** **only `supabase-bubbleskit` in `.mcp.json` — no own project.** Compiled `lifegraph-web/.next` bundles reference the shared BubblesKit ref `kqxiugkmkvymoegzxoye`, i.e. lifegraph was wired directly to the parent's shared project (never given its own). It has no live app-specific schema there (design-only; never shipped tables).
- **Template parity:** scaffolded 2026-03-02 (earliest). **Still ~75 commits behind** — the deepest drift. Missing `/competitor-research`, html-ds, DateGrid, multi-agent chatbot template, `/pipeline` polish, post-session-review improvements, phosphor-slim updates.

---

## SHARED-SUPABASE COUPLING (new this cycle — cross-domain finding)

A live `list_tables` read of the **shared BubblesKit project** (`kqxiugkmkvymoegzxoye`, the `Supabase-BubblesKit` MCP server, the template's own project) shows it is **not a clean template project** — it has accumulated app-specific schema pushed in by children. The template's own `supabase/migrations/` only define `profiles`, the profile trigger, and the 6 multi-agent chatbot tables (`20260416100000`–`5`). Everything below is **foreign to the parent's migrations**:

**Fitness / nutrition schema (owned by fit-chat) — NOT in parent migrations:**
`food_items`, `recipes`, `food_serving_units`, `recipe_ingredients`, `exercises`, `routines`, `workout_logs`, `user_goals`, `reflections`, `body_logs` (10 tables). Source confirmed: fit-chat's own migrations create exactly these (`20260316000000_exercise_library_schema.sql`, `20260329100000_create_routines_table.sql`, `20260329100001_create_workout_logs_table.sql`, `20260329200000_food_logs_user_goals.sql`, `20260330100000_create_reflections_table.sql`, `20260401100001_create_body_logs_table.sql`, etc.). Storage buckets `body-log-photos` / `reflection-photos` and `match_food_items` / `match_recipes` RPCs belong to this same app. **This proves children push schema into the template's shared Supabase project.**

**Real-estate intel schema (owned by 99-neo) — also NOT in parent migrations:**
`intelligence_embeddings`, `insight_reports` are live in BubblesKit and are created by 99-neo's migrations (`20260311100000_create_insight_reports.sql`, `20260325000000_embed_insight_report_trigger.sql`, real-estate-intelligence/engagement-signals set). So **at least two different children have written schema into the one shared project** — and 99-neo explicitly keeps `supabase-bubbleskit` in its `.mcp.json` alongside its own project.

**A third app's tables are also present:** `conversations`, `messages`, `job_preferences` — not from any of these three children (likely another scaffold/experiment), reinforcing that BubblesKit is being used as a multi-tenant dumping ground.

**Security fallout (live advisor):** RLS is **disabled** on 5 tables in BubblesKit — `food_items`, `recipes`, `food_serving_units`, `recipe_ingredients`, `intelligence_embeddings` — i.e. fully exposed to anon/authenticated roles. These are exactly the child-pushed catalog/embedding tables. Cross-tenant schema pollution has produced a real security hole in the template's own project.

**Why this matters:** children carry the inherited `supabase-bubbleskit` MCP server and (in fit-chat/lifegraph's case) inherited credential references, so a child running `apply_migration` against the default server mutates the *template's* DB rather than its own. fit-chat and 99-neo each have their *own* project (`bzuozrukiwibxqemksdh`, `frrrdcdqfmcejdpouiem`) yet schema still leaked into the shared one; lifegraph never got its own project at all. The scaffold does not currently re-point or remove the shared `supabase-bubbleskit` server, so every child stays one default-server call away from polluting the parent.

---

## Sync-loop analysis

### Re-verified: the sync loop has never run

Grepping all branches in each child for sync/upstream activity returns only **two commits, and they are inherited parent history, not child invocations:**
- `48c0192 feat: add /sync-from-template skill`
- `4bea203 feat: upstream design workflow skills from note-buddy`

Both appear with **identical short SHAs across all three children** — they were baked in at scaffold time (the parent's own commits), not produced by a child running `/sync-from-template` or `/upstream-to-template`. **There is still zero evidence either skill was ever invoked in any child.** Both skills exist in every child's `.claude/skills/` (`sync-from-template`, `upstream-to-template`) — present but unused.

### Current drift

| Repo | Scaffolded | Behind parent | Last activity | Delta vs April |
|---|---|---|---|---|
| fit-chat | 2026-03-14 | ~60 commits | **2026-06-04** | +7 own commits; still very active |
| 99-neo | 2026-03-08 | ~65 commits | 2026-04-24 (root) / 2026-04-08 (web) | +3 commits; **cooled off** |
| lifegraph | 2026-03-02 | ~75 commits | 2026-03-04 | unchanged; **dormancy doubled (6wk → ~13wk)** |

Parent is frozen at 95 commits since 2026-04-16, so the backlog children would pull is identical to April. None pulled it.

### Skills worth upstreaming (re-verified still stranded in children)

| Skill | From | Status | Upstream value |
|---|---|---|---|
| `figma-to-ui` | fit-chat | child-only | Screenshot-driven SwiftUI build, strict "see → UI-only → verify". Biggest UX-quality win. |
| `figma-to-ios` | fit-chat | child-only | Complementary node-inspection route. Pair with figma-to-ui. |
| `agent-doctor` | 99-neo | child-only | Debug/tune runbook for OpenAI Agents SDK graph. Generalizes to any multi-agent app. |
| `agent-rag-designer` | 99-neo | child-only | RAG + pgvector architecture designer. Parent has `/new-ai-agent` but nothing on vector search + RPC design. |
| `supabase-postgres-best-practices` | 99-neo | child-only | MIT, upstream-maintained. Pure win. |
| `build-app-component` | lifegraph | child-only | Plan-mode → approval → build → tracker harness; cherry-pick into `/complex-component`. |
| `process-brochure` / `extract-brochure-*` | 99-neo | child-only | Domain-specific (real estate), NOT upstreamable. Keep in 99-neo. |
| `screenshot-analyzer` plugin | fit-chat | child-only | Possibly generic — worth inspecting. |

### CLAUDE.md fragments worth absorbing into the template

- **fit-chat `## Local-First DB Architecture`** (still present, lines 41–48) — SwiftData + IndexedDB + Room with `updated_at` delta sync. Should become a scaffold checkbox fragment.
- **99-neo's `RealtyData/` + `scripts/` + `reports/` ETL trio** + 52-line Neeva expansion — the "AI-app-with-ETL" archetype; belongs in SCAFFOLDING.md as an option.
- **99-neo's `neeva-agent-*.md` doc quartet** — multi-agent docs template; add as `docs/AI_AGENT_DOCS_TEMPLATE.md`.
- **99-neo's `skills-lock.json`** — child-level skill version pinning; pattern the template lacks.

---

## Top risks

1. **Shared Supabase project is polluted and partly insecure (NEW, highest).** The template's own BubblesKit project holds fitness (fit-chat) + real-estate-intel (99-neo) + a third app's schema, with **RLS disabled on 5 child-pushed tables**. The scaffold leaves an inherited `supabase-bubbleskit` MCP server (and credential refs) in children, so any child's default `apply_migration` mutates the parent DB. **Fix:** scaffold must remove/re-point `supabase-bubbleskit` per child; add a guard that blocks `apply_migration` against the template ref; enable RLS on the leaked tables.
2. **The sync loop is dead.** `/sync-from-template` and `/upstream-to-template` ship in every child and have never run. 60–75 commits of backlog sit unpulled (lifegraph the worst at ~75). **Fix:** staleness check in `/pipeline` or a weekly advisory hook.
3. **Valuable skills stranded for ~3 months.** `figma-to-ui`, `agent-doctor`, `agent-rag-designer`, `supabase-postgres-best-practices`, `build-app-component` still child-only. `post-session-review` should audit `.claude/skills/` diff vs parent and prompt `/upstream-to-template`.
4. **Design-only abandonment is real and worsening.** lifegraph finished design 2026-03-04 and never built — dormancy went 6wk → ~13wk this cycle. `/pipeline` should warn on stalled phases ("design_figma completed 2026-03-04, no build commits since").
5. **Root-vs-submodule activity skew.** All three are submodule-based; root commits are mostly pointer bumps. 99-neo looks "+3 active" at root but its web/iOS submodules stalled in early April. `/tracker-status` should recursively scan submodule commits to avoid over/under-counting.

## Top strengths

1. **fit-chat remains a healthy, shipping child** — only one with June activity, clean local-first CLAUDE.md fragment, two genuinely reusable Figma skills.
2. **99-neo is the richest reference implementation** — multi-agent system, exhaustive PRDs, the agent-docs quartet, and three upstreamable generic skills.
3. **Template structure held up across all three** — CLAUDE.md stays template-shaped (341/440/356 vs 388), skill sets are parent-superset + app-specific additions, naming conventions intact. Drift is additive, not corruptive.
4. **Children prove the ETL / multi-agent / local-first archetypes** the template should formally support as scaffold options.

---

## Unverifiable / caveats

- "Commits behind" are estimates (parent is a different repo lineage, not a shared-history fork; children were scaffolded by copy, so there is no merge-base). Numbers carry forward the April methodology against a frozen parent.
- April's "99-neo 145 commits" vs this cycle's `rev-list HEAD` = 71: the discrepancy is almost certainly all-branches vs trunk counting. Trunk (71) is used here.
- Only BubblesKit was read live; fit-chat's (`bzuozrukiwibxqemksdh`) and 99-neo's (`frrrdcdqfmcejdpouiem`) own projects were not queried — schema-ownership is inferred from each child's local migration SQL, which matches the BubblesKit tables exactly.
- DietLogs and Foodbase (sibling iOS dirs, Jan–Feb 2025) are **pre-template standalone apps, not children** — they predate the factory and are out of scope despite fitness-adjacent names.

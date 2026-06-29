# Workspace Audit — Executive Summary

**Date:** 2026-06-08 (refreshed; supersedes the 2026-04-19 run)
**Scope:** multi-repo-sample workspace + 3 child repos (fit-chat, 99-neo, lifegraph)
**Methodology:** Supabase domain re-run **live** against the production database via MCP (`list_tables`, `get_advisors`, `list_migrations`, `list_edge_functions`, direct SQL); the other 8 domains re-verified by parallel static-analysis agents against the current working tree. Deep reports in [01–09](.) and parity in [10-parity-matrix.md](10-parity-matrix.md).

---

## What this refresh changed

- The **Supabase report is now a live-database audit**, not a reading of migration files — and it overturns the old picture. The shared BubblesKit project has **26 tables / 19 migrations / 2 edge functions / 3 public buckets**, not "14 tables / 8 migrations / no functions."
- **The parent repo has had no new commits since April** (`d112b88`). iOS advanced (Chat-first nav, secret un-tracking); web and Android are unchanged on disk. So most deltas below are either (a) live-DB discoveries, (b) closer re-reads, or (c) the iOS movement.
- Two April P0s improved (iOS secrets partially remediated; some doc cruft removed); several findings got **worse** once the live DB was examined.

---

## One-line verdict

A **world-class design-system foundation** still sits on a **fragmenting feature + infrastructure layer** — Android remains hollow, iOS has orphan screens, the web "baseline" is still a Pokémon demo, the template↔child sync loop is still dead, and the live audit exposed a **new top risk: the shared Supabase project is a multi-app dumping ground with 5 RLS-disabled tables that the repo can't even reproduce.**

---

## P0 — fix this week

| # | Finding | Status since Apr | Where | Action |
|---|---|---|---|---|
| 1 | **iOS live secrets** — Supabase anon JWT, OpenAI `sk-*`, USDA key on disk. | ⬇ **Partially fixed.** Commit `93ddd89` un-tracked the files + added `.gitignore`. BUT the **anon JWT is still in git history** (reachable from HEAD via deleted scheme blob `44e4923`) and on disk. OpenAI/USDA were *never* committed (disk-only). | `Secrets.swift`, `OpenAISecrets.swift` | **Rotate the anon key** + scrub history (`git filter-repo`). Rotate OpenAI/USDA too (they ship in the binary). Move to `.xcconfig` + Keychain. |
| 2 | **RLS disabled on PostgREST-exposed tables** — now **5 tables**, not 1: `food_items`, `food_serving_units`, `recipes`, `recipe_ingredients`, `intelligence_embeddings`. | ⬇ **Worse** (live audit found 4 more, all child-pushed). | `public` schema | `ALTER TABLE … ENABLE ROW LEVEL SECURITY` + read policies on all 5. |
| 3 | **Anonymous INSERT / wide-open policies** — `chat_messages`, `debug_traces` (`WITH CHECK (true)`), plus `job_preferences` demo (`true` on insert+update). | → Unchanged (live advisor confirms). | DB policies | Restrict to `service_role` / session-ownership; lock or drop the demo table. |
| 4 | **The repo cannot reproduce the live database.** 11 of 19 applied migrations have no SQL file; 8 more are version-drifted; 2 edge functions have no source; 3 buckets created out-of-band. | 🆕 **New** (only visible via live audit). | `supabase/` | `supabase db pull` to reconcile; commit `supabase/functions/` source; document bucket creation. |
| 5 | **Stop hook path still broken** — hardcodes `/Documents/multi-repo-sample` (missing `/GitHub/`); every unpushed-changes check fails silently. | → Unchanged (P0 carryover). | `.claude/settings.json` | One-line fix. |
| 6 | **`chatkit.config.json` points at LAN IP** `http://192.168.1.6:3000`. | → Unchanged. | `chatkit.config.json` | Replace with localhost/deployed URL. |

---

## P1 — fix this month

| # | Finding | Status | Action |
|---|---|---|---|
| 7 | **Shared Supabase project is multi-tenant pollution** — fit-chat's fitness schema (10 tables, 2 buckets, 2 RPCs) and 99-neo's intel schema (`intelligence_embeddings`, `insight_reports`) are live in the template's own BubblesKit project. This *caused* the RLS hole in P0 #2. | 🆕 New | Split children onto their own projects (fit-chat/99-neo already have refs but still leaked; **lifegraph has none**). Scaffold must re-point/remove the inherited `supabase-bubbleskit` MCP server; guard `apply_migration` against the template ref. |
| 8 | **Android missing 3 core screens** (Chat, Assistant, AI Demo); CLAUDE.md still falsely claims "all 3 platforms expose an AI tab." `NavHost` declared but unused (`when(tab)`), so no deep links. No Apple Sign-In, no sign-out UI. | → Unchanged (zero Android commits since Feb) | Scaffold `AppWebView` + Assistant first (fastest); port Chat; wire real `NavHost`; add Apple. |
| 9 | **iOS orphans** — `AIDemoView` unmounted; `AssistantView` still hardcodes `lifegraph-agent.vercel.app`. (Chat is now wired as the lead tab — improved.) | ⬇/⬆ mixed | Mount or delete AIDemo; fix/remove Assistant URL. |
| 10 | **`AdaptiveSplitView` missing on iOS AND web** yet registry marks it Done on all 3 (Kotlin-only). | → Unchanged | Implement both or fix the registry + MEMORY. |
| 11 | **Web home is a 660-line Pokémon chat**; `/assistant-embed` is a *different app* (job-search, writes `job_preferences` with no server auth); `app/layout.tsx` still says "Create Next App". | → Unchanged | Extract demos to routes; restore a generic baseline home. |
| 12 | **`database.types.ts` models only `profiles`** — now **25 tables behind**; web reads ~12 tables with `any`-typed clients. | ⬇ Worse | `supabase gen types typescript` after RLS fixes. |
| 13 | **`docs/api-contracts.md` documents only `profiles`** — ~25 of 26 live tables + 4 RPCs + 3 buckets + 2 edge fns undocumented; its "RLS on by default" rule is now false. | ⬇ Worse | Full rewrite after types regenerated. |
| 14 | **`mcp-server-profiles` silently broken** — sends `Bearer ${GOOGLE_ID_TOKEN}` (never injected); server not running. `.mcp.json` was also edited to rename `supabase-bubbleskit`→`supabase` and **dropped its auth header**. | → / 🆕 | Remove the dead server entry; restore/verify the supabase MCP auth header. |
| 15 | **Service-role key sprawl (web)** — `SUPABASE_SERVICE_ROLE_KEY` in 7 files via RLS-bypassing clients; admin gate is one API-route `admin_roles` check (layout "Access Denied" is client-side only). | 🆕 (closer read) | Centralize service-role access; verify every admin route checks `admin_roles` server-side. |

---

## P2 — hygiene & polish

16. **`.playwright-mcp/` sprawl** — 27 files (23 logs + 4 PNGs); **4 are committed**, 23 untracked; still **not gitignored**. Needs gitignore + `git rm` of the 4 tracked.
17. **4 undocumented hooks** still active (`auto-demo-updater`, `component-doc-reminder`, `type-check`, `markdown-editor-guard`); `type-check` runs full-project `tsc` on every `.ts(x)` edit (latency). 20 hooks total, all inline Python.
18. **Duplicate `schema-reviewer` agent** (top-level + supabase-schema-builder plugin) — still duplicated.
19. **`asset-gen/` is still a fake plugin** (no `plugin.json`/`skills/`).
20. **Template sync loop still dead** — 0 real `/sync-from-template` or `/upstream-to-template` in any child. lifegraph now **~13 weeks dormant** (design-only abandonment); fit-chat is the only child with June activity.
21. **Stranded child skills** (still child-only): `figma-to-ui`/`figma-to-ios` (fit-chat), `agent-doctor`/`agent-rag-designer`/`supabase-postgres-best-practices` (99-neo), `build-app-component` (lifegraph).
22. **Six doc paths are UNTRACKED in git** — `docs/audit/`, `docs/competitive/`, the HTML-DS plan+spec, both `template-extension-*.md`. Lost on a fresh clone.
23. **`multi-repo-html/` is committed as plain files, not a submodule**, and is **absent from root CLAUDE.md** (a 4th sub-repo the workspace memory doesn't acknowledge).
24. **HTML design system still 100% orphaned** — 15 atoms + 4 patterns + manifest, byte-identical since Apr 11; spec Phases 2–6 never started; plan 0/55 checked. Biggest latent asset.
25. **`docs/PRDs/` still empty** (15 weeks); three parallel plan systems (`docs/plans/` frozen Feb, `docs/superpowers/` active Apr, empty PRDs).
26. **Abandoned dirs persist** (now 14–15 weeks): `theme-builder/` + 3 root PNGs, `figma-plugin-html-import/` (33MB node_modules), `.changeset/` (never used), `mcp-server/node_modules/` (70MB).
27. **figma-cli submodule bumped v1.1.1 → v2.0.0** (73 commits past tag); healthiest tooling, used by 13 skills + 3 agents.

### ✅ Resolved since April
- `CLAUDE_AUTOMATION_GUIDE.md` (1,190-line duplicate) **deleted**.
- `/competitor-research` **duplicate row removed** from CLAUDE.md (single entry now).
- iOS secret files **un-tracked + gitignored** (history scrub still pending — see P0 #1).
- iOS **Chat screen wired** (was a D-grade gap).

---

## Parity matrix — high-level

Full matrix in [10-parity-matrix.md](10-parity-matrix.md).

| Domain | Web | iOS | Android | HTML DS | Δ |
|---|---|---|---|---|---|
| **Auth** | 3/3 | 3/3 | **2/3** (no Apple) | N/A | → |
| **Chat screen** | ✅ | ✅ **(now lead tab)** | ❌ | N/A | ⬆ iOS |
| **Assistant (ChatKit)** | ✅ | ⚠️ orphan + lifegraph URL | ❌ | N/A | → |
| **AI Demo** | ✅ | ⚠️ orphan | ❌ | N/A | → |
| **Components — atomic (15)** | 15 | 15 | 15 | 14 | → |
| **Components — patterns (4)** | 4 | 4 | 4 | 4 | → |
| **Native wrappers** | 11 | 14 | 13 | N/A | → |
| **Adaptive (3)** | 2/3 | 2/3 | 3/3 | N/A | → (registry still claims 3/3) |
| **Design tokens** | 99 prim/~495 sem | 201 | 179 | plural semantic.css | → (counts corrected) |
| **Database consumption** | ~12 tables | 1 | 1 | N/A | ⬇ shared 26-table multi-app DB |

The **component library is at full parity**; the gap is entirely in the *feature/screen* and *infrastructure* layers. **Overall parity grade: B–.**

---

## Cross-cutting strategic themes

### 1. 🆕 The shared Supabase project is the new center of gravity
The live audit's biggest reveal: BubblesKit (`kqxiugkmkvymoegzxoye`) is **one database serving the template + at least 3 child apps**. fit-chat's fitness schema and 99-neo's intel schema were pushed straight into it; a first-gen chat schema (`conversations`/`messages`) is dead inside it; a demo table is wide-open. This multi-tenancy directly produced the **5 RLS-disabled tables** and means the repo's migration files are a strict, drifted subset of reality. **Infrastructure-as-code is broken here.** Fix the project topology before anything else compounds.

### 2. Template drift loop is still broken
Children are 60–75 commits behind; **zero** `/sync-from-template` or `/upstream-to-template` invocations ever. lifegraph is ~13 weeks dormant. High-value child skills remain stranded. The parent froze in April, so the gap is children drifting alone — and now polluting the shared DB.

### 3. Documentation has three parallel systems + an untracked layer
`docs/plans/` (frozen Feb), `docs/superpowers/` (active Apr, 0/201 checkboxes ticked despite HTML DS shipping), empty `docs/PRDs/`. Six doc paths are untracked. `api-contracts.md` is now ~96% behind the live schema. CLAUDE.md doesn't mention `multi-repo-html/`.

### 4. The HTML design system is complete but orphaned
Byte-identical since Apr 11; nothing consumes it; spec Phases 2–6 never started; its roadmap is untracked. Still the single biggest underused asset.

### 5. AI story remains divergent
Web: two parallel stacks (custom Agents SDK + ChatKit), only ChatKit documented. iOS: now leads with the Agents SDK (Chat tab) but calls OpenAI/USDA directly with client-side keys, bypassing the edge functions. Android: nothing. Pokémon theme still leaks because the baseline drifted.

### 6. Hooks work but are undocumented and one is broken
20 inline-Python hooks; 4 undocumented; Stop hook path broken; `credential-guard` is a write-time guard, not a repo scanner — it never would have caught Xcode-created secret files (only `.gitignore` did). Recommend a real repo-wide secret scan.

---

## The strengths worth protecting

1. **Component library parity is complete** — 15 atoms + 4 patterns + App-prefixed native wrappers + MarkdownEditor, real implementations on all 3 platforms.
2. **Design token architecture is genuinely clean** — two-layer Primitive→Semantic, hook-enforced, **zero primitive leakage** verified on web.
3. **iOS MarkdownEditor** — 17 files, 1,637-LOC core, custom UITextView stack. Standout asset.
4. **Auth core is solid on web + iOS** — all 3 providers, middleware uses `getUser()`, dual cookie+Bearer API auth.
5. **iOS SSE agent streaming** — 11 event types, 4 inline card types, JWT-authed, haptics. Production-grade; now the lead tab.
6. **Edge functions enforce `verify_jwt`** — both AI functions require a valid token.
7. **Pipeline orchestrator + scripts/** — 14-phase checkpointed scaffold, 13 scripts + 14 templates, zero orphans.
8. **figma-cli** — v2, actively developed, integrated by 13 skills + 3 agents. Clean submodule boundary.
9. **RLS is enabled on 21 of 26 live tables** with correct own-row predicates — the gaps are a finite, fixable list.

---

## Proposed action tracks (for planning)

**Track A — Security & infra P0s (this week):** rotate + scrub iOS anon key; enable RLS on the 5 tables; fix anon-INSERT policies; fix Stop hook + chatkit LAN IP; `supabase db pull` to start reconciling migration drift.

**Track B — Supabase topology (this week→month):** decide per-app projects vs shared; re-point child MCP servers; commit edge-function source + bucket definitions; regenerate `database.types.ts`; rewrite `api-contracts.md`.

**Track C — Android catch-up (1–2 weeks):** `AppWebView` → Assistant → Chat → real `NavHost` → Apple Sign-In.

**Track D — Strip Pokémon/demo from baseline (~1 day):** move home + assistant-embed to demo routes; restore generic home; fix layout metadata.

**Track E — Doc consolidation (~0.5 day):** commit the untracked docs; register `multi-repo-html/` (submodule or document); pick one plan system; populate or remove `docs/PRDs/`; update CLAUDE.md once.

**Track F — HTML DS activation (1–2 weeks):** execute spec Phases 2–4; wire wireframe/stylescape/ios-design skills to consume `multi-repo-html/`.

**Track G — Tooling cleanup (~0.5 day):** gitignore `.playwright-mcp/` + `git rm` the 4 tracked; delete `theme-builder/`, `figma-plugin-html-import/`, `.changeset/`; decide mcp-server fate.

**Track H — Sync discipline:** `/sync-from-template` on all 3 children; upstream stranded skills; add a staleness warning to the pipeline.

---

## Where to go next

- [01-nextjs.md](01-nextjs.md) · [02-ios.md](02-ios.md) · [03-android.md](03-android.md) · [04-html-design.md](04-html-design.md) · [05-supabase.md](05-supabase.md) (live) · [06-skills-plugins.md](06-skills-plugins.md) · [07-docs.md](07-docs.md) · [08-tooling.md](08-tooling.md) · [09-child-repos.md](09-child-repos.md) · [10-parity-matrix.md](10-parity-matrix.md)

Each deep report preserves verbatim findings with clickable file paths and line numbers.

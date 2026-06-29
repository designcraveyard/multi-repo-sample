# Workspace Tooling Audit

**Date:** 2026-06-08
**Scope:** [figma-cli/](../../figma-cli), [mcp-server/](../../mcp-server), [scripts/](../../scripts), [supabase/](../../supabase) (local migrations + config), [theme-builder/](../../theme-builder), [figma-plugin-html-import/](../../figma-plugin-html-import), [.changeset/](../../.changeset), [.playwright-mcp/](../../.playwright-mcp), [.mcp.json](../../.mcp.json), root build/config files, [.gitignore](../../.gitignore), [scaffold.config.json](../../scaffold.config.json), [scripts/templates/](../../scripts/templates)
**Method:** Static analysis + live Supabase cross-reference (read-only).

## Summary
- **figma-cli** remains the healthiest custom tooling — external submodule (`silships/figma-cli`), now bumped from **v1.1.1 → v2.0.0-73-ge9a6267** (a major-version jump; parent pointer last updated 2026-03-08). Still deeply wired (13 skills + 3 agents).
- **mcp-server** demo is unchanged since 2026-02-28, **not running** (nothing on :3001), and its `.mcp.json` entry `Bearer ${GOOGLE_ID_TOKEN}` is never injected → **silent broken connection on every session**. 70 MB of `node_modules/` on disk for an unused server.
- **Local `supabase/` cannot reproduce the live database.** Repo has **7 migration SQL files**; live DB has **19 applied migrations** (11 with no repo file, and even the "matching" ones have *different version timestamps*). **No `supabase/functions/` dir** despite **2 deployed, ACTIVE edge functions** (`ai-transcribe`, `ai-transform`). **3 storage buckets** created out-of-band. `seed.sql` is comment-only (empty).
- **theme-builder/**, **figma-plugin-html-import/**, **`.changeset/`** are still abandoned (no changes in 8–15 weeks).
- **`.playwright-mcp/`** still NOT gitignored and now has a **mixed tracked/untracked state**: 4 files committed, **23 untracked** debug artifacts. Pure sprawl.
- **scripts/** remains the healthiest custom surface — 13 scripts + 14 templates, no orphans, all referenced by the scaffold system.
- **NEW since April:** `multi-repo-html/` directory (HTML design-system, last touched 2026-04-11) — present but **not registered as a submodule** in `.gitmodules`; tracked as plain files.

## Tooling inventory

| Tool | Purpose | Last activity | Health |
|---|---|---|---|
| [`figma-cli/`](../../figma-cli) | Writes to Figma Desktop (submodule) | 2026-03-08 (pointer bump); submodule HEAD 2026-03-06 | Active — **v2.0.0-73** |
| [`mcp-server/`](../../mcp-server) | Demo MCP server (profiles + Google OAuth) | 2026-02-28 | Stale, not running, broken in `.mcp.json` |
| [`scripts/`](../../scripts) | Scaffold + templates | 2026-03-03 | Active, referenced by pipeline |
| [`supabase/`](../../supabase) (local) | Migrations + config.toml | 2026-04-16 | **Drifted** — cannot reproduce live DB |
| [`multi-repo-html/`](../../multi-repo-html) | HTML design-system reference | 2026-04-11 | New; not a submodule |
| [`theme-builder/`](../../theme-builder) | One-off HTML theme explorer | 2026-02-25 (15 weeks) | Abandoned |
| [`figma-plugin-html-import/`](../../figma-plugin-html-import) | Figma plugin: HTML→editable layers | 2026-03-02 (14 weeks) | Stalled; overlaps with figma-cli |
| [`.changeset/`](../../.changeset) | Changesets CLI config | 2026-02-27 (15 weeks) | Orphaned — no changesets ever created |
| [`.playwright-mcp/`](../../.playwright-mcp) | Playwright MCP debug logs | 2026-03-13 | Sprawl, partly committed |
| [`.superpowers/`](../../.superpowers) | Superpowers plugin state | 2026-04-11 | Plugin-managed, untracked |
| [`.claude/`](../../.claude) hooks + skills | Workflow automation | 2026-04-07 | Active |
| [`scaffold.config.json`](../../scaffold.config.json) | `/new-project` parameter registry | 2026-03-02 | Current |
| [`chatkit.config.json`](../../chatkit.config.json) | ChatKit workflow config | 2026-02-28 | Current but LAN-specific URL |

## figma-cli state

- **Health: Good.** External submodule `https://github.com/silships/figma-cli.git`.
- **Version delta:** April report listed **v1.1.1**; `git submodule status` now reports **`figma-cli (v2.0.0-73-ge9a6267)`** — a major-version line bump (73 commits past the v2.0.0 tag). Submodule HEAD `e9a6267` (2026-03-06, "Add --save option to verify command").
- **Caveat / mark:** the submodule's own `package.json` still reads `"version": "1.1.1"` — the git **tag** advanced to v2.0.0 but the manifest version was not synced upstream. Cosmetic, but worth noting.
- Parent pointer last bumped **2026-03-08** (`6f279c9 chore: update figma-cli submodule pointer`) — note the April report incorrectly dated this Mar 13.
- Integration unchanged/grown: referenced by **13 files under `.claude/skills/`** and **3 agents under `.claude/agents/`**.

## mcp-server state

- **Health: Stalled & broken.** Last (and only) commit touching the directory remains `850b695 feat: add MCP server demo + MCP Server Builder plugin` (2026-02-28). No change since April.
- Structure complete: `src/{index.ts, supabase.ts, auth.ts, tools/profiles.ts, resources/profiles.ts, prompts/profiles.ts}` + `scripts/get-token.mjs`. Deps: `@modelcontextprotocol/sdk ^1.12.1`, `express ^4.21`, `@supabase/supabase-js`, `google-auth-library`, `zod`, `tsx`.
- **`node_modules/` = 70 MB** on disk for a server that is not running. (It *is* gitignored — see Git hygiene.)
- Wired into `.mcp.json` at `http://localhost:3001/mcp` with header `Authorization: Bearer ${GOOGLE_ID_TOKEN}`. **`GOOGLE_ID_TOKEN` is not sourced by any automated path** → header resolves to literal/empty → **this MCP connection fails silently on every session**.
- **Not running:** `lsof -i :3001` returned nothing; no `tsx`/`mcp-server` process. Confirmed identical to April.

## supabase/ (local) — repo vs live divergence

The single most material finding this cycle. The local `supabase/` directory **cannot reproduce the deployed database**.

| Dimension | Repo (`supabase/`) | Live project `kqxiugkmkvymoegzxoye` | Gap |
|---|---|---|---|
| Migration SQL files | 7 (+ `.gitkeep`) | **19 applied migrations** | **11 live migrations have no repo file** |
| Migration version stamps | `20260224072300_create_profiles`, `20260416100000_chat_core`, … | `20260224080516_create_profiles`, `20260417072644_chat_core`, … | **Even "matching" names have different timestamps** — applied via MCP `apply_migration`, not `db push` |
| Edge functions | **No `supabase/functions/` dir** | 2 ACTIVE: `ai-transcribe` (v4), `ai-transform` (v4) | **2 deployed functions with zero source in repo** |
| Storage buckets | None defined in migrations | 3: `chat-uploads`, `reflection-photos`, `body-log-photos` | **All created out-of-band** (MCP/dashboard) |
| `seed.sql` | Comment-only (6 lines, no data) | — | Empty seed |

- Live migrations include an entire **fitness-app schema** (`food_library_schema`, `exercise_library_schema`, `create_routines_table`, `create_workout_logs_table`, `create_body_logs_table`, `create_reflections_table`, `food_logs_user_goals`, `add_calorie_burn_goal`, …) that **does not exist in this repo at all**.
- `supabase/config.toml` is a stock local-dev config (ports 54321–54329, Postgres major v17); fine but irrelevant given the drift.
- **Implication:** a fresh `supabase db reset` / `db push` from this repo would produce a DB **substantially different** from production — missing tables, functions, and buckets. The repo is not a source of truth for the backend.

## scripts/ inventory

13 shell/JS scripts + `palettes.json` + `templates/` — **no orphans**, all referenced by the scaffold pipeline.

| Script | Role |
|---|---|
| `scaffold.sh` (23 KB) | Main scaffold orchestrator |
| `config-writer.sh` | Generates `pipeline.json` during scaffold |
| `validate-scaffold.sh` | Post-scaffold validation |
| `git-setup.sh` | Initializes git in scaffolded repos |
| `platform-select.sh` | Picks included platforms |
| `rename-android-package.sh` | Android package renaming |
| `replace-params.sh` | Token replacement engine |
| `strip-auth.sh` | Remove auth scaffold if not requested |
| `strip-phosphor.sh` | Swap Phosphor → SF Symbols on iOS |
| `clean-demo-content.sh` | Remove demo routes/files from template |
| `theme-generator.js` (18 KB) | Palette/token generation |
| `palettes.json` | Tailwind palette reference |
| `templates/` | 14 template files (see below) |

**`scripts/templates/`** (14 entries): `ContentView.swift.template`, `SFSymbolIconHelper.swift.template`, `brand-icons/`, `claude-md.template`, `env-local.template`, `local-properties.template`, `mcp-json.template`, `openai-secrets-swift.template`, `pipeline-json.template`, `secrets-swift.template`, `settings-json.template`, `supabase-config.template`, `tracker.md.template`.

**Hook targets:** `.claude/settings.json` hooks are all inline command hooks — **no `scripts/` references** (scripts are scaffold-only).

## Abandoned / stale artifacts

| Path | What | Age | Disposition |
|---|---|---|---|
| [`theme-builder/index.html`](../../theme-builder) + 3 root PNGs | One-off HTML explorer | 15 wks | Move to `docs/experiments/` or delete (~344 KB total) |
| [`figma-plugin-html-import/`](../../figma-plugin-html-import) | Overlaps with figma-cli; 33 MB `node_modules/` | 14 wks | Delete or archive |
| [`.changeset/config.json`](../../.changeset) | Changesets config, never used | 15 wks | Delete — not a publishable package |
| [`.superpowers/`](../../.superpowers) | Plugin scratchpad (untracked) | Apr 11 | Gitignore `.superpowers/` |
| [`.playwright-mcp/`](../../.playwright-mcp) (27 files; 4 tracked, 23 untracked) | Debug spam | Feb–Mar | Gitignore + `rm -rf` (incl. removing the 4 committed) |
| `mcp-server/node_modules/` | 70 MB, server not running | — | Delete until needed (already gitignored) |
| `PLAN.md` (root) | Feb 23 plan | 15 wks | Move to `docs/plans/` |
| Untracked `docs/` files (`template-extension-plan.md`, `-report.md`, `superpowers/plans/…html-design-system.md`, `superpowers/specs/…design.md`) | Loose planning docs | Apr 11–16 | Commit or delete |

## .mcp.json servers

| Server | Endpoint | Status |
|---|---|---|
| `playwright` | `npx @playwright/mcp@latest` (stdio) | Active — generating `.playwright-mcp/` sprawl |
| `context7` | `npx -y @upstash/context7-mcp@latest` (stdio) | Active |
| `mcp-server-profiles` | `http://localhost:3001/mcp` + `Bearer ${GOOGLE_ID_TOKEN}` | **Broken** — server not running, env var not injected |
| `figma` | `https://mcp.figma.com/mcp` (http) | Official remote, active |
| `supabase` | `https://mcp.supabase.com/mcp?project_ref=kqxiugkmkvymoegzxoye` (http) | Active — points at the live project that the repo can't reproduce |

- **Secrets/env note:** the only embedded secret is `${GOOGLE_ID_TOKEN}` (unresolved placeholder → broken, not a leak). No raw keys committed in `.mcp.json`. The `project_ref` is a non-secret identifier.
- `.mcp.json` is in modified state (`M .mcp.json` in git status).

## Config files health

- **`chatkit.config.json`** — `deployment.localUrl` still `http://192.168.1.6:3000` (**LAN IP**, won't work off-network). `workflowId` `wf_69a2bcef0bc88190…` hardcoded; model `gpt-4.1`. *Note: schema differs from the April report's description — keys are `workflowId`, `agent`, `theme`, `deployment` (no top-level `apiUrl`/`baseUrl`).*
- **`scaffold.config.json`** — well-maintained (16-token `replacement_map`, `demo_content_to_remove`, `rsync_excludes`). **Workflow-ID drift persists:** scaffold hardcodes `wf_69157991bfd081909cc…` (both as a `replacement_priority` entry and a `replacement_map` key), while `chatkit.config.json` uses `wf_69a2bcef0bc88190…`. Unchanged since April — **still drifted**.

## `.playwright-mcp/` log sprawl

- **27 files total:** 23 `console-*.log` + 4 `page-*.png`. Date spread **2026-02-23 → 2026-03-13**.
- **Mixed VCS state (new detail):** **4 files are committed/tracked** (`console-2026-02-25T17-45-44-573Z.log` + three `page-2026-02-23*.png`); the remaining **23 are untracked** — including a 16-file burst from a single ~10-min debug session on 2026-03-13 02:23–02:29 UTC.
- **`.gitignore` has NO `.playwright-mcp/` entry** (confirmed). Cleanup requires both gitignoring *and* `git rm` the 4 already-tracked files.

## Git hygiene

- **Submodules** (`.gitmodules`): `multi-repo-nextjs`, `multi-repo-ios`, `multi-repo-android`, `figma-cli`. **4 submodules.** *Change since April:* the three app submodule URLs are now `https://github.com/designcraveyard/*` (April report showed `designcraveyard/*` already; `figma-cli` is `silships/figma-cli`).
- **`multi-repo-html/` is NOT a submodule** — present on disk (last commit `b1f15e2`, 2026-04-11) but absent from `.gitmodules`; its files are committed to the parent repo directly. Inconsistent with the other four platform dirs.
- **`.gitignore`** ignores OS cruft, `.env*`, `supabase/.temp/`, editor dirs, and **`mcp-server/node_modules/`** — but **not** `.playwright-mcp/`, `.superpowers/`, `figma-plugin-html-import/node_modules/`, or `theme-builder` PNGs.
- **Dirty state:** `M .mcp.json`, `M CLAUDE.md`, `M multi-repo-ios`, `M multi-repo-nextjs` + **31 untracked entries** (23 of them `.playwright-mcp/` logs; plus `docs/audit/`, `docs/competitive/`, `.superpowers/`, loose docs, `.claude/skills/competitor-research/`).
- Recent parent commits are all `feat(html-ds)` / chatbot / migration work — **no tooling/infra commits in the last 20.**

## .claude hooks

- `.claude/settings.json`: **5 PreToolUse** command hooks (all `Write|Edit`) + **11 PostToolUse** command hooks (`Write` / `Edit|Write`) + 1 `Stop` + 1 `Notification`. Self-contained command hooks — portable, auditable. (CLAUDE.md describes these as 6 blocking + 11 advisory; the settings.json count is 5 PreToolUse matchers — minor doc/impl drift, *unverified which is authoritative*.)

## Top risks

1. **Repo ≠ live backend.** Local `supabase/` (7 migrations, no functions dir, empty seed) cannot reproduce the live DB (19 migrations, 2 ACTIVE edge functions, 3 buckets). Disaster-recovery and onboarding both break. **Highest-severity finding.**
2. **`mcp-server-profiles` is a permanently-broken MCP entry** — `Bearer ${GOOGLE_ID_TOKEN}` never injected; fails silently every session. Either auto-launch + inject the token or remove the entry.
3. **figma-cli version drift** — submodule jumped to v2.0.0-73 but its `package.json` still says 1.1.1; consumers can't trust the manifest version.
4. **`.playwright-mcp/` is half-committed sprawl** — 4 debug artifacts are in git history, 23 more untracked, and the dir is not gitignored.
5. **ChatKit config is non-portable & drifted** — LAN IP `192.168.1.6` and a workflow ID that disagrees with `scaffold.config.json`.
6. **Dead weight on disk** — `mcp-server/node_modules` (70 MB) + `figma-plugin-html-import/node_modules` (33 MB) for two unused tools.

## Top strengths

1. **figma-cli submodule strategy** — external repo versions independently while staying deeply integrated (13 skills + 3 agents); now on a v2.0 line.
2. **scripts/ is fully utilized** — 13 scripts + 14 templates, zero orphans, drives the entire template factory.
3. **`scaffold.config.json` replacement map** — 16-token rename system underpins `/new-project`.
4. **Hooks are self-contained** — 5 blocking + 11 advisory command hooks in `settings.json`; portable and easy to audit.
5. **mcp-server demo as reference** — even unrun, `mcp-server/src/` is a working Streamable-HTTP + Google-OAuth + Supabase example for `/new-mcp-server`.

## Deltas since 2026-04-19

- figma-cli submodule **v1.1.1 → v2.0.0-73-ge9a6267**; corrected pointer-bump date to 2026-03-08 (was misdated Mar 13). Manifest still 1.1.1 (drift).
- **NEW major finding:** live-Supabase cross-reference proves the repo **cannot reproduce the live DB** (migrations, edge functions, buckets all diverge).
- **NEW:** `multi-repo-html/` directory exists but is **not a submodule**.
- `.playwright-mcp/` clarified as **mixed tracked (4) + untracked (23)**, not purely untracked.
- Staleness of `theme-builder/` / `figma-plugin-html-import/` / `.changeset/` extended to **14–15 weeks**.
- mcp-server, ChatKit LAN-IP issue, workflow-ID drift, and `.gitignore` gaps **all unchanged** since April.

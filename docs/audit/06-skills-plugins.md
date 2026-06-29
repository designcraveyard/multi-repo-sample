# Claude Skills & Plugins Audit

**Date:** 2026-06-08
**Methodology:** Static analysis only (no skills executed, no hooks fired).
**Scope:** [`.claude/skills/`](../../.claude/skills/), [`.claude/plugins/`](../../.claude/plugins/), [`.claude/agents/`](../../.claude/agents/), [`.claude/settings.json`](../../.claude/settings.json) (hooks), [`.claude/settings.local.json`](../../.claude/settings.local.json), [`.mcp.json`](../../.mcp.json), the skill table in root [`CLAUDE.md`](../../CLAUDE.md), and `scripts/`.
**Prior report:** 2026-04-19. Deltas since are called out inline as **[Δ since Apr]**.

## Summary

- **40 local skills** on disk in `.claude/skills/` + **3 true plugins** bundling **9 skills** + **1 plugin shell** (`asset-gen`, no `plugin.json`) = **49 skill surfaces**. Unchanged vs April — no skills added or removed.
- **9 agents** under `.claude/agents/` + **4 plugin-bundled agents** = **13 agents**. Unchanged.
- **20 hook entries** in `settings.json` across 5 event groups (6 PreToolUse, 12 PostToolUse, 1 Stop, 1 Notification). All inline Python embedded directly in `settings.json` — there are still **no dedicated hook script files** under `scripts/` for the documented hooks. Plugin hooks (the only `.py` files) live under each plugin's `hooks/`.
- **Overall health: stable, mildly drifting.** Nothing is outright broken from a "skill won't run" standpoint, but two long-standing defects persist: (1) the **Stop hook still hardcodes a wrong workspace path** (P0 carryover), and (2) **`asset-gen` is still a fake plugin** (no `plugin.json`). The April-flagged `competitor-research` CLAUDE.md duplicate is **resolved** — there is now exactly one row.
- **Biggest risk (carryover):** the Stop hook silently no-ops because it points at `/Users/abhishekverma/Documents/multi-repo-sample` (missing `/GitHub/`). The unpushed-changes warning has never fired in this checkout. Still broken.
- **New since April:** `.superpowers/` and `docs/superpowers/` appeared at repo root. **Neither introduces any skills or plugins** — they are brainstorm-session HTML artifacts and plan/spec markdown. `.mcp.json` was edited (uncommitted): the `supabase-bubbleskit` server was renamed to `supabase` and **lost its `Authorization` header**. CLAUDE.md gained the `competitor-research` row (uncommitted).

## Skills inventory (40 skills, sorted by mtime)

Identical roster to April — same 40 skill directories, same mtimes (no skill has been touched since `competitor-research` on 2026-03-13). Each directory has a real `SKILL.md`.

| # | Skill | SKILL.md mtime | In CLAUDE.md table | Status |
|---|---|---|---|---|
| 1 | ios-native-components | 2026-02-23 | Implicit (rules) | Reference; 105d old |
| 2 | android-native-components | 2026-02-26 | Implicit | Reference |
| 3 | chatkit-setup | 2026-02-26 | Yes (ChatKit section) | Active |
| 4 | new-ai-agent | 2026-02-26 | Yes | Active |
| 5 | post-session-review | 2026-02-26 | Yes | Active |
| 6 | prd-update | 2026-02-26 | Yes | Active |
| 7 | supabase-auth-setup | 2026-02-26 | Yes | Active |
| 8 | supabase-setup | 2026-02-26 | Yes | Active |
| 9 | adaptive-split-view | 2026-02-27 | **No** | Reference-only (orphaned from table) |
| 10 | schema-discovery | 2026-02-27 | Yes | Active (overlaps plugin `schema-design`) |
| 11 | tracker-status | 2026-02-27 | Yes | Active |
| 12 | tracker-update | 2026-02-27 | Yes | Active |
| 13 | upstream-to-template | 2026-02-27 | Yes | Active |
| 14 | design-token-sync | 2026-02-28 | Yes | Active |
| 15 | figma-cli | 2026-02-28 | Yes (Figma CLI section) | Reference (background knowledge) |
| 16 | figma-component-sync | 2026-02-28 | Yes | Active |
| 17 | git-push | 2026-02-28 | Yes | Active |
| 18 | sync-from-template | 2026-02-28 | Yes | Active |
| 19 | validate-tokens | 2026-02-28 | Yes | Active |
| 20 | asset-iterate | 2026-03-01 | Yes | Active |
| 21 | figma-design | 2026-03-01 | Yes | Active |
| 22 | generate-theme | 2026-03-01 | Yes | Active |
| 23 | asset-gen | 2026-03-02 | Yes | Active (wraps plugin JS) |
| 24 | complex-component | 2026-03-02 | Yes | Active |
| 25 | component-audit | 2026-03-02 | Yes | Active |
| 26 | cross-platform-feature | 2026-03-02 | Yes | Active |
| 27 | define-theme | 2026-03-02 | Yes | Active |
| 28 | design-guideline | 2026-03-02 | Yes | Active (auto-loaded) |
| 29 | ios-design | 2026-03-02 | Yes | Active |
| 30 | send-to-figma | 2026-03-02 | Yes | Active (overlaps figma-design) |
| 31 | deep-dive | 2026-03-03 | Yes | Active |
| 32 | add-phosphor-icon | 2026-03-08 | Yes | Active |
| 33 | build-feature | 2026-03-08 | Yes | Active |
| 34 | new-project | 2026-03-08 | Yes | Active |
| 35 | new-screen | 2026-03-08 | Yes | Active |
| 36 | pipeline | 2026-03-08 | Yes | Active |
| 37 | product-discovery | 2026-03-08 | Yes | Active |
| 38 | stylescape | 2026-03-08 | Yes | Active |
| 39 | wireframe | 2026-03-08 | Yes | Active |
| 40 | competitor-research | 2026-03-13 | **Yes (now exactly once)** | Active. **Untracked by git** (`?? .claude/skills/competitor-research/`) |

**`competitor-research` git state:** the whole directory is still **untracked** (`git ls-files` returns 0 entries). It has a real 15.9 KB `SKILL.md`. It works locally but has never been committed, so `sync-from-template` cannot propagate it to child repos and it is not under version control. **[Δ since Apr]** April flagged it as duplicated in CLAUDE.md; that duplicate is now gone (see Broken references). Its untracked status is unchanged.

> **Note on the runtime skill list:** the Claude session's available-skills registry lists `competitor-research` twice (once as a bare skill, once with a longer description). This is a registry-level artifact, **not** a CLAUDE.md table duplicate. The CLAUDE.md table itself contains a single row.

## Plugins inventory

| Plugin | `plugin.json`? | Skills inside | Agents inside | Hook scripts (`hooks/*.py`) | Status |
|---|---|---|---|---|---|
| [`asset-gen`](../../.claude/plugins/asset-gen/) | **No** | 0 | 0 | 0 | **Plugin shell only** — contains `CLAUDE.md`, `generate.js`, `iterate.js`, `package.json`. It is a Node CLI invoked by the top-level `/asset-gen` + `/asset-iterate` skills, not a Claude plugin. **Unchanged since April.** |
| [`mcp-server-builder`](../../.claude/plugins/mcp-server-builder/) | Yes | 1 (`new-mcp-server`) | 1 (`mcp-server-reviewer`) | 3 (`auth-middleware-reminder`, `console-log-guard`, `mcp-json-reminder`) | Active |
| [`openai-agent-builder`](../../.claude/plugins/openai-agent-builder/) | Yes | 5 (`agent-help`, `new-text-agent`, `new-voice-agent`, `new-multi-agent`, `new-chatkit-agent`) | 2 (`agent-code-reviewer`, `agent-security-checker`) | 5 (`agent-error-handling`, `api-key-guard`, `guardrails-reminder`, `tracing-reminder`, `zod-v4-check`) | Active |
| [`supabase-schema-builder`](../../.claude/plugins/supabase-schema-builder/) | Yes | 3 (`supabase-onboard`, `schema-design`, `add-migration`) | 1 (`schema-reviewer` — **duplicate**) | 2 (`migration-model-sync-reminder`, `model-schema-sync-reminder`) | Active |

`asset-gen` remains inconsistent with the other three (no `plugin.json`, no `skills/`, no `agents/`, no `hooks/`). It should either be promoted to a real plugin or moved to `scripts/asset-gen/`. **No change since April.**

## Agents inventory

| Agent | Purpose | Referenced by |
|---|---|---|
| [`screen-reviewer.md`](../../.claude/agents/screen-reviewer.md) | Reviews screens: state, navigation, a11y, parity | `/new-screen`, `/build-feature` |
| [`tracker-agent.md`](../../.claude/agents/tracker-agent.md) | Updates `tracker.md` | `/pipeline`, `/tracker-update` |
| [`automation-architect.md`](../../.claude/agents/automation-architect.md) | Generates CLAUDE.md, hooks, skills, agents | `/new-project` |
| [`complex-component-reviewer.md`](../../.claude/agents/complex-component-reviewer.md) | Reviews complex components | `/complex-component`, `/component-audit` |
| [`design-consistency-checker.md`](../../.claude/agents/design-consistency-checker.md) | Token mismatches, hardcoded values | `/validate-tokens`, PostToolUse |
| [`design-system-sync.md`](../../.claude/agents/design-system-sync.md) | Figma ↔ code round-trip | `/figma-component-sync` |
| [`schema-reviewer.md`](../../.claude/agents/schema-reviewer.md) | Schema review | **DUPLICATE** — also at `.claude/plugins/supabase-schema-builder/agents/schema-reviewer.md` |
| [`supabase-schema-validator.md`](../../.claude/agents/supabase-schema-validator.md) | Validates models match live schema | `/schema-discovery`, migration hooks |
| [`cross-platform-reviewer.md`](../../.claude/agents/cross-platform-reviewer.md) | Side-by-side parity report | `/cross-platform-feature`, `/post-session-review` |

**Plugin-bundled agents:** `mcp-server-reviewer`, `agent-code-reviewer`, `agent-security-checker`, `schema-reviewer` (the duplicate).

**`schema-reviewer` is STILL duplicated** — it exists both at `.claude/agents/schema-reviewer.md` and inside the `supabase-schema-builder` plugin. **No change since April.** Pick one (recommend keeping the plugin copy and deleting the top-level one).

## Hooks inventory (20 entries, all inline Python in `settings.json`)

**CLAUDE.md vs reality:** CLAUDE.md's hook list names each hook as if it were a discrete file (`credential-guard`, `design-token-guard`, etc.). In reality every workspace hook is **inline Python embedded in `settings.json`** — the names exist only as `[hook-name]` print prefixes in the inline code, not as files. This is accurate documentation of *behavior* but misleading about *structure*. **Unchanged since April.**

| Hook (print prefix) | Event / matcher | Blocking? | In CLAUDE.md? |
|---|---|---|---|
| credential-guard | PreToolUse `Write\|Edit` | **Blocking** | Yes |
| package-lock-guard | PreToolUse `Write\|Edit` | **Blocking** | Yes |
| design-token-guard | PreToolUse `Write\|Edit` | **Blocking** | Yes |
| design-token-semantics-guard | PreToolUse `Write\|Edit` | **Blocking** | Yes |
| complex-component-clarifier | PreToolUse `Write\|Edit` | Advisory (prints only) | Yes |
| phosphor-import-guard | PreToolUse `Write\|Edit` | **Blocking** | Yes |
| auto-demo-updater | PostToolUse `Write` | Advisory | **No (undocumented)** |
| screen-structure-guard | PostToolUse `Write` | Advisory | Yes |
| native-wrapper-guard | PostToolUse `Edit\|Write` | Advisory | Yes |
| cross-platform | PostToolUse `Edit\|Write` | Advisory | Yes |
| design-token-sync (reminder) | PostToolUse `Edit\|Write` | Advisory | Yes |
| comment-enforcer | PostToolUse `Edit\|Write` | Advisory | Yes |
| component-doc-reminder | PostToolUse `Edit\|Write` | Advisory | **No (undocumented)** |
| auto-lint (eslint --fix) | PostToolUse `Edit\|Write` | Advisory | Yes |
| type-check (`tsc --noEmit`) | PostToolUse `Edit\|Write` | Advisory | **No (undocumented — runs full project typecheck on every .tsx/.ts edit)** |
| markdown-editor-guard | PostToolUse `Edit\|Write` | Advisory | **No (undocumented)** |
| adaptive-layout-guard | PostToolUse `Edit\|Write` | Advisory | Yes |
| phosphor-slim-guard | PostToolUse `Edit\|Write` | Advisory | Yes |
| Stop hook (unpushed-changes + post-session checklist) | Stop | Advisory | **No (undocumented; broken path)** |
| Notification ping (osascript) | Notification `idle_prompt` | n/a | No (undocumented) |

**Still 4 undocumented advisory hooks confirmed:** `auto-demo-updater`, `component-doc-reminder`, `type-check`, `markdown-editor-guard` — exactly as April found. Plus the Stop and Notification hooks remain undocumented. **No change since April.**

### Stop-hook path bug — STILL BROKEN (P0 carryover)

The Stop hook hardcodes the workspace path as:

```python
'workspace (multi-repo-sample)': '/Users/abhishekverma/Documents/multi-repo-sample',
'multi-repo-nextjs':            '/Users/abhishekverma/Documents/multi-repo-sample/multi-repo-nextjs',
'multi-repo-ios':              '/Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios',
'multi-repo-android':          '/Users/abhishekverma/Documents/multi-repo-sample/multi-repo-android',
```

The real path is `/Users/abhishekverma/Documents/**GitHub/**multi-repo-sample`. The `/GitHub/` segment is missing from all four entries. Every `git status` / `git log @{u}..HEAD` in the hook runs against non-existent directories, fails silently (caught by `except`), and the `dirty` list is always empty — so the "Unpushed changes detected" banner **never fires**. The post-session checklist banner (which uses no paths) still prints. **Confirmed still broken on 2026-06-08.** This is the single highest-value one-line fix in this domain.

### credential-guard — why it "missed" iOS secrets (clarification)

The April note that credential-guard "failed to catch iOS secrets" needs nuance:

- The hook's `skip_patterns` are `['.env', '.example', 'CLAUDE.md', 'SKILL.md', 'local.properties']`. It does **not** skip `Secrets.swift` or `OpenAISecrets.swift` (verified: skip-check returns `False` for `Secrets.swift`). So the hook *would* fire on writes to those files.
- However, credential-guard runs **PreToolUse on Write/Edit only** — it inspects content Claude is about to write. It cannot retroactively scan files that already exist on disk or were committed outside Claude's tool flow.
- Current state (verified): `multi-repo-ios/multi-repo-ios/Supabase/Secrets.swift` and `OpenAI/OpenAISecrets.swift` **exist on disk with real credentials but are `.gitignore`d** (`**/Secrets.swift`, `**/OpenAISecrets.swift`) and **were never tracked** (`git log --all -- '**/Secrets.swift'` is empty). Only `Secrets.example.swift` (a template) is tracked.
- **Conclusion:** the leak the iOS audit referenced was prevented/cleaned by `.gitignore`, not by credential-guard. credential-guard is a write-time guard, not a repo scanner; relying on it as the sole secret defense is the gap. The pattern set (Supabase URL, JWT `eyJhbGciOi…`, OpenAI `sk-…`) is reasonable but would miss e.g. Google client secrets or raw service-role keys not matching those shapes. **Recommendation unchanged:** add a repo-wide secret scan (pre-commit or CI), don't lean on the inline PreToolUse hook alone.

### Scripts directory (none wired to workspace hooks)

`scripts/` exists and is used exclusively by `/new-project` scaffolding, not by hooks: `clean-demo-content.sh`, `config-writer.sh`, `git-setup.sh`, `platform-select.sh`, `rename-android-package.sh`, `replace-params.sh`, `scaffold.sh`, `strip-auth.sh`, `strip-phosphor.sh`, `theme-generator.js`, `validate-scaffold.sh`, `palettes.json`, `templates/`. **Unchanged since April.**

## MCP servers (`.mcp.json`)

`.mcp.json` was edited (**uncommitted**, `git status` shows ` M .mcp.json`, mtime 2026-04-17). Current server list (5):

| Server | Transport | Auth header | Status / notes |
|---|---|---|---|
| `playwright` | `npx @playwright/mcp@latest` stdio | — | Active. 22+ console logs in `.playwright-mcp/` (now dated into Mar 2026). |
| `context7` | `npx @upstash/context7-mcp@latest` stdio | — | Active; live docs. |
| `mcp-server-profiles` | http `http://localhost:3001/mcp` | `Authorization: Bearer ${GOOGLE_ID_TOKEN}` | **Broken / non-functional.** The local demo server is not running by default, and **`${GOOGLE_ID_TOKEN}` is never injected** (no env var, no `.env` reference) — every request would send literal `Bearer ` with no token. **Unchanged since April.** |
| `figma` | http `https://mcp.figma.com/mcp` | — | Active (official). |
| `supabase` | http `https://mcp.supabase.com/mcp?project_ref=kqxiugkmkvymoegzxoye` | **— (none)** | Active. **[Δ since Apr]** Renamed from `supabase-bubbleskit`; the project_ref is unchanged but the prior `Authorization: Bearer ${SUPABASE_MCP_TOKEN}` header was **removed**. The hosted Supabase MCP now relies on OAuth handled by the client rather than an injected token, but the removal means there is no token-failure fallback documented. |

**`.mcp.json` deltas since April (uncommitted):**
- `supabase-bubbleskit` → renamed to `supabase`; lost its `Authorization` header.
- Whitespace reformatting of `playwright`/`context7` args (cosmetic).
- File **lost its trailing newline** (`\ No newline at end of file`) — minor lint nit.

**CLAUDE.md memory still says "4 MCP servers" — actual is 5** (playwright, context7, mcp-server-profiles, figma, supabase). Drift persists. **`settings.local.json` `enabledMcpjsonServers` lists only `["playwright", "context7"]`** — figma/supabase/mcp-server-profiles are not in the project-local enable list (they may be enabled at user scope, but this local file under-declares them; unverifiable from static analysis whether they're actually enabled at runtime).

## New directories since April (no skill/plugin impact)

- **`.superpowers/`** (root) — contains only `brainstorm/36911-1775877780/{content,state}/` with HTML artifacts (`approaches.html`, `design-architecture.html`, `plugin-consumption.html`, `waiting.html`) and a dead server (`server-stopped`, `server.pid`, `server.log`) from a one-off `superpowers:brainstorming` session on 2026-04-11. **No `SKILL.md`, no `plugin.json`, no skills or plugins introduced.** It is session scratch output and should be gitignored or deleted. Untracked.
- **`docs/superpowers/`** — `plans/` and `specs/` markdown for an HTML design system (2026-04-11) and a multi-agent chatbot template (2026-04-16). Design docs only; **no automation surfaces.** Partially untracked (the 2026-04-11 files), partially committed (the 2026-04-16 files were committed per recent log).

The `superpowers:*` skills themselves (brainstorming, writing-plans, etc.) come from an **externally-installed plugin namespace**, not from this repo's `.claude/skills/`. They are not part of the workspace's own skill set and are out of scope for the on-disk inventory.

## Redundant / overlapping skills (unchanged from April)

1. **Theme trio** `define-theme` → `stylescape` → `generate-theme` — three-step gate; consider merging `define-theme` + `stylescape`.
2. **`asset-gen` skill vs `.claude/plugins/asset-gen/` JS vs `asset-iterate`** — three surfaces, one concern.
3. **4 Figma skills** `figma-cli` + `figma-component-sync` + `figma-design` + `send-to-figma` — overlapping "push to Figma" verbs.
4. **`schema-discovery` (top-level) vs `schema-design` (plugin)** — both do guided schema authoring; plugin version is more complete.
5. **`schema-reviewer.md`** in both `.claude/agents/` and the plugin.
6. **`new-ai-agent` (top-level) vs plugin `new-{text,voice,multi,chatkit}-agent`** — top-level should delegate.
7. **`build-feature` vs `cross-platform-feature`** — distinction collapses in practice.
8. **`new-screen` vs `build-feature`** — both scaffold UI-only screens.

## Broken / stale references

- **[RESOLVED Δ since Apr]** `competitor-research` is **no longer duplicated** in the CLAUDE.md table — `git diff CLAUDE.md` shows the row was *added once* (currently uncommitted). The April finding of a duplicate row is fixed.
- **[STILL BROKEN]** Stop-hook path bug (`/Documents/multi-repo-sample` missing `/GitHub/`).
- **[STILL TRUE]** CLAUDE.md describes inline hooks (`credential-guard`, `comment-enforcer`, etc.) as if discrete script files.
- **[STILL TRUE]** CLAUDE.md references plugin `.claude/plugins/asset-gen/` but it has no `plugin.json`.
- **[STILL TRUE]** 4 active hooks undocumented in CLAUDE.md: `auto-demo-updater`, `component-doc-reminder`, `type-check`, `markdown-editor-guard` (+ Stop + Notification).
- **[STILL TRUE]** MEMORY/CLAUDE.md says "4 MCP servers"; there are 5.
- **[NEW]** `.mcp.json` is uncommitted with a server rename + header removal; the working tree and last commit diverge.
- **[NEW]** `.mcp.json` lost its trailing newline.

## Orphaned skills

- **`adaptive-split-view`** — not listed in the CLAUDE.md skills table (reference-only, like `ios-native-components`). Unchanged.
- **`competitor-research`** — listed in CLAUDE.md but its directory is git-untracked (can't be synced to children).
- **`figma-cli`** — pure reference, correctly excluded from the slash-command list.

## Top risks (prioritized)

1. **Fix the Stop-hook path bug** (one-line, P0 carryover). Replace all four `/Documents/multi-repo-sample` with `/Documents/GitHub/multi-repo-sample`, or better, derive the repo root dynamically. Until fixed, the unpushed-changes guard is dead.
2. **Commit `.claude/skills/competitor-research/`** — it is referenced in CLAUDE.md and listed as a skill but untracked, so it is invisible to version control and to `sync-from-template`.
3. **Resolve the `.mcp.json` auth gap** — `mcp-server-profiles` sends `Bearer ${GOOGLE_ID_TOKEN}` with no token ever injected (server is non-functional); `supabase` had its auth header removed. Decide the intended auth model and document it (or remove the dead `mcp-server-profiles` entry).
4. **Don't treat credential-guard as a secret scanner** — it is a PreToolUse write-time guard only. The iOS secret protection actually comes from `.gitignore`. Add a repo-wide secret scan (pre-commit/CI) and broaden patterns (Google client secrets, service-role keys).
5. **Promote or relocate `asset-gen`** — add a `plugin.json` (+ `skills/`/`agents/`) or move to `scripts/asset-gen/`. It currently masquerades as a plugin.
6. **De-duplicate `schema-reviewer`** — delete `.claude/agents/schema-reviewer.md`, keep the plugin copy.
7. **Document the 4 invisible hooks** (`auto-demo-updater`, `component-doc-reminder`, `type-check`, `markdown-editor-guard`) + Stop hook in CLAUDE.md, and update the "4 MCP servers" line to 5.
8. **Watch `type-check` cost** — it runs a full-project `tsc --noEmit --skipLibCheck` (35s timeout) on *every* `.tsx`/`.ts` edit. On a large Next.js tree this adds latency to every web edit. Consider scoping or debouncing.

## Top strengths

1. **Rich, cohesive `/pipeline` orchestrator** — chains 14 phases with checkpoint validation, `pipeline.json` state, `--skip-figma`. Best-in-class workflow surface.
2. **Guard-rail-enforced two-layer token architecture** — three blocking PreToolUse hooks (`design-token-guard`, `design-token-semantics-guard`, plus `phosphor-import-guard`) prevent primitive leakage and semantic misuse at write time.
3. **Clean plugin boundary for 3 of 4 plugins** — `mcp-server-builder`, `openai-agent-builder`, `supabase-schema-builder` each ship `plugin.json` + `skills/` + `agents/` + real `hooks/*.py`. Consistent, idiomatic structure.
4. **Component-first discipline enforced end-to-end** — builder skills read `docs/components.md`, wireframes annotate `data-component`, `screen-structure-guard`/`native-wrapper-guard` warn on raw APIs.
5. **Stable surface** — zero skills added/removed/regressed since April; the system is mature, not churning. The remaining issues are documentation drift and two stale defects, not architectural rot.

## Unverifiable from static analysis

- Whether `figma` / `supabase` / `mcp-server-profiles` MCP servers are actually *enabled at runtime* (`settings.local.json` enables only `playwright`, `context7`; others may be enabled at user scope — not visible here).
- Whether the hosted `supabase` MCP works without the removed `Authorization` header (depends on client-side OAuth state, not inspectable statically).
- Whether the local `mcp-server-profiles` server at `:3001` is running (it must be started manually; assumed down).
- Child-repo skill drift (`fit-chat`, `99-neo`, `lifegraph`) — those repos are outside this checkout's working tree and were not re-scanned this pass; April's child-repo comparison is carried forward unverified.
</content>
</invoke>

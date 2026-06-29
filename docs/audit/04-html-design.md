# HTML Platform & Design System Audit

**Date:** 2026-06-08
**Scope:** [`multi-repo-html/`](../../multi-repo-html), [`docs/design/`](../design), [`docs/wireframes/`](../wireframes), [`docs/superpowers/{plans,specs}/`](../superpowers), plus relationship to the design-token / component registry ([`docs/components.md`](../components.md), [`docs/design-tokens.md`](../design-tokens.md))
**Method:** Static analysis only. Refreshes the 2026-04-19 report.

## Summary
- **`multi-repo-html/` is a standalone HTML/CSS design-system mirror** — tokens + **15 atomic components + 4 patterns + 4 design-tool categories + 3 reference pages + a 16KB manifest** mapping every component to its web/iOS/Android source file. It is explicitly NOT a runtime app; it's a toolkit meant to be consumed by wireframe / stylescape / mockup skills.
- **It is still well-built but completely ORPHANED.** Re-verified: **zero skills, scripts, plugins, hooks, agents, or figma-cli files reference `multi-repo-html/`.** The only files that mention it are its own [`CLAUDE.md`](../../multi-repo-html/CLAUDE.md), the plan/spec, and the audit reports themselves. **No consumption has started since April.**
- **No change to the DS since the audit window.** Last commit touching it is `b1f15e2` (2026-04-11, "DateGrid items fill equal width"). The two commits since (`c4e2b19`, `d112b88`) are the unrelated multi-agent-chatbot template. **Phase 2+ of the spec has not begun.**
- **Plan tracking still broken.** The 55-task plan still shows **0/55 checkboxes checked** despite all work being committed. Across both plans in `superpowers/plans/`, that's **203 open checkboxes, 0 checked** (this is the figure cited in [00-executive](00-executive.md) and [07-docs](07-docs.md)).
- **Plan and spec are still UNTRACKED in git** — they live only in the working tree. So is this audit. Tracking/handoff risk persists.
- **Design docs remain stale.** [`docs/design/`](../design) still contains only `design-guidelines.md` (Mar 2) + a `.DS_Store`. No `stylescapes/`, no `theme.md`. [`docs/wireframes/`](../wireframes) still holds a single orphan `_wireframe.css`.
- **Token naming drift confirmed and quantified.** [`docs/design-tokens.md`](../design-tokens.md) uses **singular** `--surface-*` (24 occurrences, 0 plural); `multi-repo-html/tokens/semantic.css` uses **plural** `--surfaces-*` (172 occurrences, 0 singular). The HTML DS matches the *new* Figma-aligned web names; the doc lags.
- **`multi-repo-html/` still absent from root [`CLAUDE.md`](../../CLAUDE.md)** (0 mentions) — the workspace's own project memory doesn't acknowledge the directory exists.

## multi-repo-html/ contents (re-verified 2026-06-08)

```
multi-repo-html/
├── CLAUDE.md (2.7KB)
├── design-system.css (barrel import, 5.7KB)
├── manifest.json (16.5KB — Figma→platform map: 15 components + 4 patterns + 4 design-tools)
├── tokens/ — primitives.css, semantic.css (435 lines / 31KB), typography.css, spacing.css, radius.css, design-tools.css
├── components/ — 15 atoms: button, icon-button, badge, label, chip, tabs, segment-control-bar,
│                 thumbnail, input-field, toast, date-grid, divider, checkbox, switch, radio-button
├── patterns/ — 4: text-block, step-indicator, stepper, list-item
├── design-tools/ — device-frames, annotations, slide-layouts, wireframe
└── reference/ — index.html (37KB component sheet), tokens.html, design-tools.html
```

Every component folder is a `.css` + `.html` pair (15 pairs verified on disk). Components carry `data-component` / `data-variant` / `data-size` (and `data-state` where relevant) attributes for round-tripping. The manifest's `Button` entry, for example, maps to `app/components/Button/Button.tsx` (web), `Components/Button/AppButton.swift` (iOS), `ui/components/AppButton.kt` (Android), with `ds-button` class prefix and full variant matrices. Semantic tokens are 1:1 with Figma's `bubbles-kit` › Semantic collection.

**Inventory matches the April report and the manifest exactly.** (The earlier report's "14 atomic components" wording came from commit `4b66089`'s message; the manifest and on-disk folders both total **15** — Button was added in a separate commit `ec49f5c`.)

## Consumption check — still zero (the orphan finding holds)

A repo-wide grep for `multi-repo-html` (excluding the directory itself, `node_modules`, `.git`) returns **only**:

| File | Relationship |
|---|---|
| [`multi-repo-html/CLAUDE.md`](../../multi-repo-html/CLAUDE.md) | self |
| [`docs/superpowers/plans/2026-04-11-html-design-system.md`](../superpowers/plans/2026-04-11-html-design-system.md) | the build plan |
| [`docs/superpowers/specs/2026-04-11-html-design-system-design.md`](../superpowers/specs/2026-04-11-html-design-system-design.md) | the spec |
| `docs/audit/{00,04,07,10}-*.md` | audit reports (this set) |

Explicit negative results (all confirmed empty):
- `.claude/` (skills, plugins, hooks, agents) — **0 references**
- `figma-cli/` — **0 references**
- `scripts/` — **0 references**

The `/wireframe` skill still uses its own bundled `.claude/skills/wireframe/wireframe.css`, not the HTML DS. `/stylescape`, `/ios-design`, and `/design-token-sync` are all unmodified to consume it. **The DS's own `CLAUDE.md` claims components "are consumed by plugins (wireframe, UI design, stylescape, presentations)" — this is aspirational; that wiring has never existed.**

## Plan / spec status

- **Spec** ([`2026-04-11-html-design-system-design.md`](../superpowers/specs/2026-04-11-html-design-system-design.md), 18KB, Apr 11): well-structured, scoped to **Phase 1 only**. Explicitly defers, as Future Phases (§506–515):
  - **Phase 2:** extend `/design-token-sync` to auto-update `multi-repo-html/tokens/`
  - **Phase 3:** migrate `/wireframe` to consume the DS instead of bundled CSS
  - **Phase 4:** migrate `/stylescape`, `/ios-design` to consume the DS
  - **Phase 5:** new plugins (UI Design, Presentations, Style Guide)
  - **Phase 6:** validation script for `manifest.json` drift vs `docs/components.md`
  - **None of Phases 2–6 have started.**
- **Plan** ([`2026-04-11-html-design-system.md`](../superpowers/plans/2026-04-11-html-design-system.md), 61KB, Apr 11): detailed task list. **55 checkboxes, 0 checked** — re-verified `grep` counts unchanged from April. All 16 `feat/fix(html-ds):` commits (`a51c2cb` → `b1f15e2`) cover the listed work, but the file was never ticked.
- **Both plan and spec are UNTRACKED in git** (`git ls-files` → not found). They exist only in the working tree. Same for the audit files. This is a real handoff/resume risk: a fresh clone would not have the plan, the spec, or the audit.

## Design-system docs state

| File | Last modified | State |
|---|---|---|
| [`docs/design-tokens.md`](../design-tokens.md) | Mar 8 | Still uses **singular** `--surface-*` (24×, 0 plural). HTML DS + new web code use **plural** `--surfaces-*`. Doc lags the code. |
| [`docs/components.md`](../components.md) | Feb 28 | ~14 weeks stale. No `multi-repo-html` column; doesn't acknowledge the DS exists. |
| [`docs/components/`](../components) | Feb 28 / Mar 8 | 40 per-component `.md` files; only `IconButton.md` touched since Feb 28. |
| [`docs/design/design-guidelines.md`](../design/design-guidelines.md) | Mar 2 | Usable; predates the HTML DS build. |
| Root [`CLAUDE.md`](../../CLAUDE.md) | (working tree) | **0 mentions of `multi-repo-html/`.** Repository-Structure section still lists only nextjs/ios/android. |

### Token naming drift (quantified)
| Source | `--surfaces-*` (plural, Figma-aligned) | `--surface-*` (singular, legacy) |
|---|---|---|
| `multi-repo-html/tokens/semantic.css` | **172** | 0 |
| `multi-repo-nextjs/app/globals.css` | 146 | 25 (legacy aliases, still compile) |
| `docs/design-tokens.md` | **0** | **24** |

The HTML DS is on the *correct* (new) naming. The canonical token doc is the laggard. Anyone reading `design-tokens.md` to author HTML-DS markup will reach for variables that don't exist in `semantic.css`.

## Wireframes & stylescapes state — unchanged from April
- [`docs/wireframes/`](../wireframes) still contains exactly **one file**: `_wireframe.css` (37KB, Mar 3). No actual wireframes. Superseded by the bundled skill CSS; directory effectively abandoned.
- **`docs/design/stylescapes/` still does not exist.** No `theme.md`, no stylescape HTML, no PNG output, no index gallery. The `/stylescape` skill (added Mar 2) has produced **zero artifacts** in this repo to date. A complaint that "stylescape quality is bad" most likely means *there is no stylescape at all*.

## Orphan artifacts — all still present (none cleaned since April)

| Path | What | Status |
|---|---|---|
| `.playwright-mcp/` (27 files) | Console logs Feb 25 – Mar 13 + 4 debug PNGs | Still present; **still not gitignored** |
| `theme-builder/index.html` | Single-file experiment | Still present, untouched since Feb 26 |
| `theme-builder-{initial,dark,final}.png` (repo root) | Screenshots at root | Still present, Feb 26 |
| `figma-plugin-html-import/` | Figma plugin to import HTML → Figma | Still present; built Mar 1, untouched |
| `docs/wireframes/_wireframe.css` | Lone orphan CSS file | Still present, superseded |
| `.changeset/` | Empty changeset scaffold | Still present, never used |
| [`docs/template-extension-{plan,report}.md`](../template-extension-plan.md) | Apr 16 docs | Untracked |
| `.superpowers/` | Plugin metadata | Untracked |

Root [`.gitignore`](../../.gitignore) (211 bytes, Feb 28) covers `.DS_Store`, `.env*`, editor dirs, and `mcp-server/node_modules/` — but **still has no `.playwright-mcp/` entry**, so the 27 logs + PNGs continue to show as untracked clutter.

## What changed since 2026-04-19
- **Nothing in `multi-repo-html/` itself** — byte-for-byte the same; no new commits, no Phase 2 work, no new consumers. The orphan status is *more* entrenched (another ~7 weeks with no activity).
- The audit-doc set (`00`–`10`) now exists and references the DS — but those are *reports about* the DS, not *consumers of* it.
- [`05-supabase.md`](05-supabase.md) was refreshed today (Jun 8); the rest of the audit set (including the prior version of this file) was Apr 19.
- The "203 open checkboxes" figure (cited in [00-executive](00-executive.md) §101 and [07-docs](07-docs.md) §42/§144) is confirmed: 55 from this plan + 148 from the Apr-16 multi-agent-chatbot plan, all 0-checked.

## Top 5 problems
1. **HTML DS is still 100% orphaned.** 8 weeks after it shipped, no skill / hook / script / plugin / agent / figma-cli file references it. Phase 2 of the spec never started. It delivers zero value until a consumer is wired.
2. **Plan tracking is broken and uncommitted.** 0/55 checkboxes ticked despite all work done; the plan *and* spec aren't even in git. A fresh clone loses the entire roadmap.
3. **Stylescapes directory still doesn't exist.** `/stylescape` has produced no artifacts in ~14 weeks. Any quality complaint is moot — there's nothing there.
4. **Token-naming drift between the canonical doc and the code.** `design-tokens.md` (singular `--surface-*`) contradicts `semantic.css` and new web code (plural `--surfaces-*`). One-pass doc cleanup needed.
5. **Repo-root clutter persists.** 27 playwright logs + 3 root PNGs + `theme-builder/` + `figma-plugin-html-import/` + empty `.changeset/`, and `.gitignore` still doesn't filter `.playwright-mcp/`.

## Top 5 what's working
1. **The HTML DS is high quality and complete for Phase 1.** 15 atoms + 4 patterns + 4 design-tool categories, consistent `data-*` attributes, well-commented 435-line `semantic.css`, and a 16.5KB manifest mapping every component to web/iOS/Android source files.
2. **Reference pages are real visual contracts.** `reference/index.html` (37KB, Apr 11) is a full component showcase with dark-mode toggle.
3. **Token architecture mirrors Figma 1:1** and is on the *correct* new naming (`--surfaces-*`) — ahead of `design-tokens.md`.
4. **Spec and plan are written and detailed** — the Phase 2 ingredients (token-sync, wireframe/stylescape/ios-design migration, drift-validation script) are all specified and ready to execute; they just need to be committed and started.
5. **Git history for the build is disciplined** — 16 scoped `feat/fix(html-ds):` commits walk scaffold → tokens → components → patterns → tools → reference → fixes.

## The biggest latent asset (framing still holds)
`multi-repo-html/` remains the **single largest unrealized asset in the workspace.** It is a finished, Figma-aligned, manifest-backed cross-platform design-system mirror that **nothing uses.** Executing spec Phases 2–4 (wire `/design-token-sync`, `/wireframe`, `/stylescape`, `/ios-design` to consume it) is the highest-leverage move available — it would turn a dormant directory into the backbone of every design-generation skill. The work is fully spec'd; the blocker is purely that **no one has started Phase 2, and the plan/spec aren't even committed.** (See [00-executive](00-executive.md) "Track E — HTML DS activation".)

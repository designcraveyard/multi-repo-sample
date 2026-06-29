# Next.js Platform Audit — Parity Baseline Check

**Date:** 2026-06-08
**Scope:** `multi-repo-nextjs/` (submodule HEAD `b6dd051`)
**Method:** Static analysis only (no builds/tests). Cross-referenced against a fresh live Supabase audit of the shared BubblesKit project.

## Summary
- **The "parity baseline" is now two unrelated AI demo apps stitched together.** The `/` home route ([app/(authenticated)/page.tsx](multi-repo-nextjs/app/(authenticated)/page.tsx), 660 lines) is a monolithic Pokémon "PokéChat" UI, while [app/assistant-embed/page.tsx](multi-repo-nextjs/app/assistant-embed/page.tsx) (468 lines) is a **job-search assistant** reading/writing a `job_preferences` table. Neither is a generic starter; they don't even share a domain.
- **Two parallel AI stacks coexist**: a full custom OpenAI Agents SDK pipeline (`/api/chat`, `lib/agents/`, 5 Pokémon tools, admin graph editor) AND a ChatKit integration (`/assistant`, `/assistant-embed`). The CLAUDE.md starter docs advertise only ChatKit.
- **ChatKit config remains a dead-letter.** [app/api/chatkit/session/route.ts#L6](multi-repo-nextjs/app/api/chatkit/session/route.ts#L6) still hardcodes `WORKFLOW_ID` identical to [chatkit.config.json](chatkit.config.json) — the config file is not read. The `(openai as any).beta.chatkit` cast persists ([L10](multi-repo-nextjs/app/api/chatkit/session/route.ts#L10)).
- **`database.types.ts` is severely stale and getting worse.** Its `public` schema models **only `profiles`** ([lib/database.types.ts](multi-repo-nextjs/lib/database.types.ts)), but the web app now reads/writes **12 tables**. The live shared Supabase project has **25 tables** — regenerating types would pull all 25. Most data-access code sidesteps the typed client with `SupabaseClient<any>`.
- **`AdaptiveNavShell` is still built-but-unused**; no root nav shell, no tabs. [app/layout.tsx#L16](multi-repo-nextjs/app/layout.tsx#L16) **still has default `"Create Next App"` metadata**. `AdaptiveSplitView.tsx` is **still missing** on web despite the registry marking all platforms Done.
- **Token system is healthy and improved**: ~495 semantic var refs across `app/`, 99 distinct `--color-*` primitives in `globals.css`, **zero primitive leakage** into screen/component files. Hardcoded-hex violations remain concentrated in the embed + debug + demo files.

## What changed since 2026-04-19
- **No new commits** — submodule HEAD is unchanged (`b6dd051`). All structural findings persist. Differences below are corrections/refinements from a closer re-read plus the live-Supabase cross-reference.
- **NEW (clarified): the embed page is a different app.** `assistant-embed` is a job-search ChatKit client (`job_preferences`, "find jobs, update your preferences" composer) — it shares the codebase but not the Pokémon domain of `/`. Prior audit treated it only as a token-violation hotspot.
- **CORRECTED: stale-types impact is bigger.** Web touches 12 tables (`agent_configs`, `tool_definitions`, `agent_handoffs`, `agent_versions`, `agent_tools`, `chat_sessions`, `chat_messages`, `debug_traces`, `user_memories`, `admin_roles`, `profiles`, `job_preferences`); `database.types.ts` still models 1. Live project = 25 tables / 19 migrations / 2 edge functions / 3 public buckets vs the repo's **8** migration files.
- **CORRECTED token counts**: prior "279 primitives / 435 semantic" → actual **99 distinct `--color-*`** primitives and **~495 semantic refs**. Leakage still 0.
- **NEW: service-role key sprawl.** `SUPABASE_SERVICE_ROLE_KEY` is used in **7 files** via raw `@supabase/supabase-js` clients that bypass RLS (admin API, chat sessions, agent trace/memory/intel tools).
- **NEW: admin access gate is client-side only** ([admin/layout.tsx](multi-repo-nextjs/app/(authenticated)/admin/layout.tsx) fetches `/api/admin/me`); real enforcement lives in the API route checking `admin_roles`.
- **REGRESSED slightly**: `any`/`@ts-ignore`/`eslint-disable` count rose from 18 → **21**.
- **MINOR**: `assistant-embed/page.tsx` line count 469 → 468.

## Routes inventory

| Route | Status | Notes |
|---|---|---|
| `/login` ([app/(auth)/login/page.tsx](multi-repo-nextjs/app/(auth)/login/page.tsx)) | Live | Clean; Google/Apple/Email wired via server actions |
| `/` ([app/(authenticated)/page.tsx](multi-repo-nextjs/app/(authenticated)/page.tsx)) | Live, off-template | 660-line PokéChat monolith; `"use client"`, inline SSE `<style>`, inline SVGs |
| `/assistant` ([page.tsx](multi-repo-nextjs/app/(authenticated)/assistant/page.tsx)) | Live | ChatKit wrapper, 51 lines, clean |
| `/chat` ([page.tsx](multi-repo-nextjs/app/(authenticated)/chat/page.tsx)) | Live | 7-line wrapper around `ChatPage` (multi-agent) |
| `/ai-demo` ([page.tsx](multi-repo-nextjs/app/(authenticated)/ai-demo/page.tsx)) | Demo | 175 lines — transform + audio recorder demo |
| `/admin` + `/admin/agents[/id]` + `/admin/tools[/id]` + `/admin/versions` + `/admin/test` | Live tool | Agent/tool/version CRUD + graph viz; access-gated by `admin_roles` |
| `/assistant-embed` ([page.tsx](multi-repo-nextjs/app/assistant-embed/page.tsx)) | Live | WebView target; **job-search** ChatKit; 468 lines; heavy inline hex |
| `/auth/callback` ([route.ts](multi-repo-nextjs/app/auth/callback/route.ts)) | Live | Standard OAuth exchange; honors `x-forwarded-host` |
| `/components-showcase` (217 LoC) | Dead demo | Unlinked |
| `/editor-demo` (74 LoC) | Dead demo | Unlinked |
| `/input-demo` (794 LoC) | Dead demo | Unlinked; contains hardcoded `#3B82F6` |
| `/api/chat` + `/sessions[/id][/messages]` + `/debug` | Live | OpenAI Agents SSE pipeline + session persistence |
| `/api/chatkit/session` | Live | Hardcoded workflow ID; `(openai as any)` cast |
| `/api/ai/transcribe`, `/api/ai/transform` | Live | Whisper + transform services |
| `/api/admin/{agents,tools,versions,handoffs,me}` | Live | Admin CRUD; service-role client, untyped (`SupabaseClient<any>`) |

## Components
All 19 registry atoms + 4 patterns present under `app/components/`. `patterns/` has `TextBlock`, `StepIndicator`, `Stepper`, `ListItem`. `Adaptive/` has **only** `AdaptiveNavShell` + `AdaptiveSheet` + `useMediaQuery` — **`AdaptiveSplitView.tsx` is missing** (registry says Done on all three platforms; web file does not exist). `Native/` has 11 web wrappers matching the registry.

Undocumented in `docs/components.md` (Pokémon-specific, not design-system):
- **[app/components/Chat/](multi-repo-nextjs/app/components/Chat/)** — `ChatHeader`, `ChatInput`, `ChatMessage`, `ChatMessageList`, `ChatPage`, `ChatHistorySheet`, `StreamEventPill`.
- **`Chat/cards/`** — `PokemonCard`, `EvolutionCard`, `TypeMatchupCard`, `TeamCard`, `Lightbox`.
- **`Chat/debug/`** — `DebugPanel`, `DebugEventRow` (ships to prod, gated only by a button click).

`components/ui/` (raw shadcn) is consumed only by `Native/*` and `Adaptive/AdaptiveSheet.tsx` — no screen-level raw shadcn leakage.

## Auth state
- Middleware ([middleware.ts#L29-31](multi-repo-nextjs/middleware.ts#L29)) correctly uses `getUser()` (not `getSession()`), refreshes cookies, redirects unauthed to `/login`.
- **Inconsistency:** the authenticated layout ([app/(authenticated)/layout.tsx#L11](multi-repo-nextjs/app/(authenticated)/layout.tsx#L11)) uses `getSession()` to seed `AuthProvider`. Functionally fine for hydration, but mixes the patterns; security gate is the middleware, so low risk.
- **Bypass paths remain broad** ([middleware.ts#L34-43](multi-repo-nextjs/middleware.ts#L34)): `/auth`, `/assistant-embed`, `/api/chatkit`, `/api/chat`, `/api/admin`, `/api/ai` all skip the auth gate. `/api/chat` and `/api/admin` re-verify via `authenticateRequest`; `/api/ai` and `/assistant-embed` do **not** — the embed page writes `job_preferences` keyed only by a client-held session id with no server auth.
- Providers wired in [lib/auth/actions.ts](multi-repo-nextjs/lib/auth/actions.ts): Google, Apple, Email/Password. `NEXT_PUBLIC_SITE_URL` preferred over origin header.
- [lib/auth/profile.ts](multi-repo-nextjs/lib/auth/profile.ts) exposes `getProfile()` only — reads, does not create (relies on DB trigger; documented pattern).
- [lib/auth/api-auth.ts](multi-repo-nextjs/lib/auth/api-auth.ts) supports dual cookie + Bearer JWT auth (real enhancement for mobile clients; not documented in CLAUDE.md).

## Supabase coupling (cross-domain)
- **The web app targets a SHARED multi-app Supabase project (BubblesKit).** Live audit: **25 tables / 19 migrations / 2 edge functions / 3 public buckets**. The repo carries only **8** migration files under [supabase/migrations/](supabase/migrations/) (profiles + chat_core + memories + agent_config + debug_traces + knowledge_base + rpc), so the repo migrations are a strict subset of live state.
- **`database.types.ts` regeneration would now pull all 25 tables**; today it models only `profiles`. Every admin/chat/agent data path therefore runs untyped: `SupabaseClient<any>` in [api/admin/_lib.ts#L12](multi-repo-nextjs/app/api/admin/_lib.ts#L12) and [api/admin/me/route.ts#L14](multi-repo-nextjs/app/api/admin/me/route.ts#L14), and raw `createClient` (no generic) in `lib/chat/sessions.ts`, `lib/agents/*`.
- **Cross-app table leak:** `assistant-embed` reads/writes `job_preferences` ([page.tsx#L170,L183](multi-repo-nextjs/app/assistant-embed/page.tsx#L170)) — a table belonging to a *different* app on the shared project, confirming the multi-app coupling.
- **Service-role key in 7 files** (`SUPABASE_SERVICE_ROLE_KEY`): `api/chat/debug/route.ts`, `api/admin/_lib.ts`, `api/admin/me/route.ts`, `lib/chat/sessions.ts`, `lib/agents/trace.ts`, `lib/agents/tools/search-pokemon-intel.ts`, `lib/agents/tools/save-memory.ts`. These bypass RLS; correctness depends entirely on app-level filtering. The `admin_roles` check ([api/admin/me/route.ts#L20](multi-repo-nextjs/app/api/admin/me/route.ts#L20)) is the only server gate on admin CRUD; the admin layout's "Access Denied" screen is **client-side UI only**.

## ChatKit / AI integration state
- [api/chatkit/session/route.ts#L6](multi-repo-nextjs/app/api/chatkit/session/route.ts#L6) **hardcodes** `WORKFLOW_ID` identical to [chatkit.config.json](chatkit.config.json); the config file is dead. Session user is the constant `"demo-user"` ([L12](multi-repo-nextjs/app/api/chatkit/session/route.ts#L12)) — no per-user binding. `(openai as any).beta.chatkit` cast at [L10](multi-repo-nextjs/app/api/chatkit/session/route.ts#L10).
- `/assistant` (51 lines) is thin and clean.
- `/assistant-embed` (468 lines) duplicates theme-detection, defines client-tool handlers (`get/save_job_preferences`, `show_preference_form`, `show_job_cards`, `set_loading_status`), and uses inline hex throughout — the design-token violation hotspot.
- OpenAI Agents SDK ([lib/agents/](multi-repo-nextjs/lib/agents/)): triage + 4 specialists (`battle-strategist`, `memory-agent`, `pokedex-expert`, `team-builder`), **7 tools** under `tools/`, plus `config-cache`, `context`, `trace`. Fully functional parallel AI stack absent from the starter docs.

## Design token compliance
- [globals.css](multi-repo-nextjs/app/globals.css) (682 lines): **99 distinct `--color-*` primitives**; **~495 semantic var refs** across `app/**/*.tsx`; **0 primitive leakage** into component/screen files (clean two-layer separation).
- **Violation hotspots** (hardcoded hex / rgba counts):
  - [app/assistant-embed/page.tsx](multi-repo-nextjs/app/assistant-embed/page.tsx) — 16 hardcoded color literals (light/dark theming + native-bridge shims).
  - [app/components/Chat/debug/DebugPanel.tsx](multi-repo-nextjs/app/components/Chat/debug/DebugPanel.tsx) (15) + [DebugEventRow.tsx](multi-repo-nextjs/app/components/Chat/debug/DebugEventRow.tsx) (14) — event-type color maps.
  - [app/(authenticated)/page.tsx](multi-repo-nextjs/app/(authenticated)/page.tsx) (3) — scrollbar rgba / inline SSE styles.
  - [app/input-demo/page.tsx](multi-repo-nextjs/app/input-demo/page.tsx) — `#3B82F6`.

## Package.json findings
- Next.js `16.1.6`, React `19.2.3`, `eslint-config-next 16.1.6` — on baseline, no outdated majors.
- AI stack: `@openai/agents ^0.5.4`, `@openai/chatkit-react ^1.5.0`, `openai ^6.25.0`, `zod ^4.3.6` (Zod 4, current).
- **Likely unused / project-specific**: `lucide-react ^0.575.0` (Phosphor is the icon system), `radix-ui` monolithic, `embla-carousel-react`.
- `date-fns`, `vaul`, `react-day-picker`, `tiptap-markdown`, 10 × `@tiptap/*` — back MarkdownEditor + Native wrappers.
- `shadcn` (devDep ^3.8.5) is the CLI, OK.

## Dead/demo code candidates
- [app/components-showcase/page.tsx](multi-repo-nextjs/app/components-showcase/page.tsx) (217 LoC) — unlinked.
- [app/editor-demo/page.tsx](multi-repo-nextjs/app/editor-demo/page.tsx) (74 LoC) — unlinked.
- [app/input-demo/page.tsx](multi-repo-nextjs/app/input-demo/page.tsx) (794 LoC) — unlinked mega-showcase with hardcoded hex.
- `app/(authenticated)/admin/test/page.tsx` — name suggests dev scratch.
- `Chat/debug/` — ships to prod, gated only by a button.
- Pokémon cards/agents + job-search embed: not dead, but entirely project-specific — should be extracted from the template baseline.

## TypeScript / code-quality issues
- **21** `any` / `@ts-ignore` / `eslint-disable` occurrences (was 18), concentrated in:
  - `app/assistant-embed/page.tsx` — `window as any` native-bridge shims (legitimate for WebView).
  - `app/api/admin/_lib.ts`, `app/api/admin/me/route.ts`, `app/api/admin/agents/[id]/route.ts` — `SupabaseClient<any>` (bypasses `database.types.ts`).
  - `app/api/chatkit/session/route.ts#L10` — `(openai as any).beta.chatkit` (SDK typing gap).
- No `TODO`/`FIXME`/`HACK` keywords found.
- [app/layout.tsx#L16-18](multi-repo-nextjs/app/layout.tsx#L16) — **still default `"Create Next App"` metadata**.

## Top risks / things left behind
1. **Home page is Pokémon-specific; embed page is a different (job-search) app.** Neither is a template baseline — the two demos don't even share a domain. ([page.tsx](multi-repo-nextjs/app/(authenticated)/page.tsx), [assistant-embed](multi-repo-nextjs/app/assistant-embed/page.tsx))
2. **`database.types.ts` models 1 of 25 live tables; web code uses 12.** Untyped `SupabaseClient<any>` everywhere data is touched. Regenerating types is overdue and would now pull the full shared multi-app schema.
3. **ChatKit config dead-letter + no per-user session.** Workflow ID hardcoded, config ignored, session user is constant `"demo-user"`. ([route.ts#L6](multi-repo-nextjs/app/api/chatkit/session/route.ts#L6))
4. **Service-role key in 7 files + RLS-bypassing raw clients; `/assistant-embed` writes `job_preferences` with no server auth.** Correctness rests on app-level filtering and a client-held session id.
5. **Template hygiene gaps:** `AdaptiveNavShell` unused, no root nav, `AdaptiveSplitView.tsx` missing, root metadata still `"Create Next App"`, and hardcoded hex on the WebView-facing embed surface.

## Top strengths
1. **Auth core is tight.** Middleware uses `getUser()`; dual cookie+Bearer in `lib/auth/api-auth.ts`; OAuth callback honors `x-forwarded-host` for Vercel.
2. **Token system well-layered.** 99 primitives, ~495 semantic usages, **zero primitive leakage** into component/screen files.
3. **Near-complete component parity.** All 19 atoms + 4 patterns + 11 native wrappers present; only `AdaptiveSplitView` missing on web.
4. **Stack is current.** Next 16 / React 19 / Tailwind v4 / Zod 4 — no outdated majors.
5. **OpenAI Agents SDK stack is production-grade.** Triage → specialist handoffs, trace layer, session persistence, admin CRUD — well beyond what the starter docs describe.

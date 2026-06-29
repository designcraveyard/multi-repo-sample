# iOS Platform Audit

**Date:** 2026-06-08
**Scope:** `multi-repo-ios/multi-repo-ios/`
**Method:** Static analysis only (no builds). Submodule HEAD `04b6865` + uncommitted working-tree changes to 3 files.

## Summary
- **The #1 P0 from April (live secrets in tracked files) is now PARTIALLY REMEDIATED.** Commit `93ddd89` ("fix: remove secrets from tracked files, add .gitignore") un-tracked the credentials and added `.gitignore` rules. `Secrets.swift` and `OpenAISecrets.swift` are now gitignored ([.gitignore:9-10](multi-repo-ios/.gitignore)) and absent from the git index. **However, the Supabase anon JWT remains reachable in git history** (it was committed inside the Xcode shared scheme at [44e4923], not a separate file) and the **same live key is still on disk and compiled into the binary.** Rotation + history scrub still required. The OpenAI `sk-` and USDA keys were apparently **never committed** — no history blob contains them — so the April claim that they were "committed" overstated that part.
- **🟠 New architecture/security smell**: the iOS app embeds the OpenAI + USDA keys **client-side** and calls `api.openai.com` and `api.nal.usda.gov` **directly**, bypassing the JWT-protected `ai-transcribe` / `ai-transform` Supabase edge functions that exist for exactly this purpose (verified live, ACTIVE, `verify_jwt: true`). Any shipped build leaks these keys via binary extraction.
- **Major navigation change**: `ContentView` now leads with a real **`ChatView()`** as tab 0 (multi-agent Pokémon SSE chat). Tabs are now **Chat / Components / Editor / Settings** (4 tabs) — the showcase content moved into the Components tab. The April "showcase-first" layout is gone.
- **Two orphan screens persist**: `AIDemoView` and `AssistantView` are still implemented but **not wired into `AdaptiveNavShell`**. `AssistantView` STILL hardcodes `https://lifegraph-agent.vercel.app/` (URL drift from a child project).
- **`AdaptiveSplitView.swift` still does not exist** on iOS, despite `docs/components.md` marking it Done.

## What changed since 2026-04-19

| Area | April 2026 | June 2026 (now) | File |
|---|---|---|---|
| Secrets tracking | `Secrets.swift` + `OpenAISecrets.swift` **tracked** with live keys | Both **un-tracked + gitignored**; live values remain on disk (untracked) | [.gitignore:8-10](multi-repo-ios/.gitignore), [Secrets.swift](multi-repo-ios/multi-repo-ios/Supabase/Secrets.swift) |
| Supabase key in history | (not assessed) | **Still in history** via deleted scheme blob `44e4923`; reachable from HEAD | — |
| OpenAI/USDA keys in history | claimed "committed" | **Never committed** (no history blob matches) | [OpenAISecrets.swift](multi-repo-ios/multi-repo-ios/OpenAI/OpenAISecrets.swift) |
| Config wiring | inline key in `Config.swift` | `Config.swift` + `SupabaseManager` read from `Secrets.swift` w/ env override | [Config.swift:8-17](multi-repo-ios/multi-repo-ios/Supabase/Config.swift) |
| Tab 0 | showcase | **`ChatView()`** (live multi-agent chat) | [ContentView.swift:164-174](multi-repo-ios/multi-repo-ios/ContentView.swift) |
| Tab count / labels | 4 (showcase-derived) | 4: Chat / Components / Editor / Settings | [ContentView.swift:163-168](multi-repo-ios/multi-repo-ios/ContentView.swift) |
| AgentService fallback URL | `your-app.vercel.app` (placeholder) | `multi-repo-nextjs.vercel.app` (uncommitted edit) | [AgentService.swift:36-39](multi-repo-ios/multi-repo-ios/Services/AgentService.swift) |
| PhosphorSlim cases | 45 | **57** (icons added) | [PhosphorSlim.swift](multi-repo-ios/multi-repo-ios/PhosphorSlim.swift) |
| Chat components | `Components/Chat/` undocumented | now 3 views + 4 card views | [Components/Chat/](multi-repo-ios/multi-repo-ios/Components/Chat/) |

**Uncommitted working-tree changes** (3 files): `Services/AgentService.swift` (+prod URL fix), `Supabase/Config.swift` (+env override fallbacks), `Views/Chat/ChatView.swift` (+225/−135, large rewrite of the chat surface).

## Secrets — detailed current state (🔴 P0 still open)

| Secret | On disk now? | Tracked now? | In git history? | Notes |
|---|---|---|---|---|
| Supabase anon JWT (`eyJhbGci…4B0tMg`) | Yes — [Secrets.swift:8](multi-repo-ios/multi-repo-ios/Supabase/Secrets.swift) | **No** (gitignored) | **Yes** — in deleted scheme blob at `44e4923` (reachable from HEAD); same value as on disk | Compiled into binary via `SupabaseManager` fallback. Rotate + scrub history. |
| Supabase project URL (`…kqxiugkmkvymoegzxoye…`) | Yes — [Secrets.swift:7](multi-repo-ios/multi-repo-ios/Supabase/Secrets.swift) | No | Yes (same blob) | Matches live BubblesKit project ref. |
| OpenAI key (`sk-FPU1Jz9…ADPxz`) | Yes — [OpenAISecrets.swift:7](multi-repo-ios/multi-repo-ios/OpenAI/OpenAISecrets.swift) | No | **No** (never committed) | Still rotate — it ships in the binary and is reachable on any dev machine. |
| USDA key (`Rwndd89…DTSn`) | Yes — [OpenAISecrets.swift:8](multi-repo-ios/multi-repo-ios/OpenAI/OpenAISecrets.swift) | No | No | Ships in binary. |

- **Template:** only `Secrets.example.swift` is tracked (Supabase only). There is **no** `OpenAISecrets.example.swift` template, so a fresh checkout won't compile the OpenAI path without manual file creation — minor onboarding gap.
- **Override pattern:** both `SupabaseConfig`/`SupabaseManager` and `OpenAIConfig` read env var → compiled-in fallback ([OpenAIConfig.swift:33-43](multi-repo-ios/multi-repo-ios/OpenAI/OpenAIConfig.swift)), so production builds can inject keys via scheme env vars, but the **committed-history JWT and on-disk keys are the live ones**.

## Screens inventory

| Screen | Web counterpart | Notes |
|---|---|---|
| `Views/Auth/LoginView.swift` | `app/(auth)/login` | Fully wired via `AuthManager` |
| `ContentView.swift` (4-tab shell) | `/` + `/components-showcase` | Tabs: **Chat, Components, Editor, Settings** ([ContentView.swift:160-175](multi-repo-ios/multi-repo-ios/ContentView.swift)). ~1,794 L. |
| `Views/Chat/ChatView.swift` (+`ChatViewModel`) | `/chat` | **Now mounted as tab 0.** SSE multi-agent chat, custom blur header, Pokémon/Evolution/TypeMatchup/Team cards. 376 L. |
| `Views/AssistantView.swift` | `/assistant` | **Orphaned** — not in any tab. Hardcoded `https://lifegraph-agent.vercel.app/` ([AssistantView.swift:25](multi-repo-ios/multi-repo-ios/Views/AssistantView.swift)) — URL drift. |
| `Views/AIDemoView.swift` | `/ai-demo` | **Orphaned** — not mounted. Calls `TransformService`/`TranscribeService` → OpenAI/USDA direct. |
| `Views/ComponentsShowcaseView.swift` | `/components-showcase` | Used by the Components tab. Raw `NavigationStack` at line 241. |

## Components inventory
- **Atomic + Patterns:** all registry-Done components present in `Components/`. Patterns folder: `AppListItem`, `AppStepIndicator`, `AppStepper`, `AppTextBlock` (4).
- **Native wrappers (`Components/Native/`):** 14 files (incl. `AppWebView`). Styled via `NativeComponentStyling.swift`.
- **Chat (`Components/Chat/`):** `ChatHistoryView`, `ChatInputBar`, `SSEStreamEventView` + `Cards/` (Pokemon, Evolution, TypeMatchup, Team). Still **not in `docs/components.md`** registry.
- **Adaptive (`Components/Adaptive/`):** `AdaptiveNavShell.swift` + `AdaptiveSheet.swift` only. **`AdaptiveSplitView.swift` MISSING** (registry still claims Done) and `AdaptiveSplitView` is referenced nowhere.
- **MarkdownEditor:** **17 files**; `AppMarkdownEditor.swift` = **1,637 lines** (custom `UITextView` stack, table editing, image crop).

**Raw SwiftUI in screens (native-wrapper-guard bypasses):**
- [ComponentsShowcaseView.swift:241](multi-repo-ios/multi-repo-ios/Views/ComponentsShowcaseView.swift) — raw `NavigationStack`
- [ChatView.swift:39](multi-repo-ios/multi-repo-ios/Views/Chat/ChatView.swift) — raw `.sheet(` (now live, since ChatView is mounted)
- [AIDemoView.swift:33](multi-repo-ios/multi-repo-ios/Views/AIDemoView.swift) — raw `TextField` instead of `AppInputField` (orphaned, so not in shipping path)

## Auth state
Fully wired and unchanged in substance. `AuthManager.swift` (180 L) is `@Observable @MainActor`, listens to `authStateChanges` ([AuthManager.swift:41-63](multi-repo-ios/multi-repo-ios/Auth/AuthManager.swift)):
- Google via `GIDSignIn.sharedInstance.signIn(withPresenting:)` (67-92)
- Apple via `ASAuthorization` + `signInWithIdToken` (96-125)
- Email/password sign-in + sign-up (129-151)

`multi_repo_iosApp.swift:40-47` handles both `GIDSignIn.handle(url)` and Supabase OAuth callback. Auth gate at lines 23-31. Profile fetch swallows errors silently ([AuthManager.swift:175-178](multi-repo-ios/multi-repo-ios/Auth/AuthManager.swift)). `SupabaseManager` uses `fatalError` on invalid URL (line 26).

## Supabase coupling (cross-domain, verified live 2026-06-08)
- **Profiles parity:** `ProfileModel` (`id` UUID, `display_name`, `avatar_url`, `created_at`, `updated_at`) **exactly matches** the live `public.profiles` table (RLS on, PK `id` FK→`auth.users`). Confirmed via live BubblesKit schema.
- **Edge functions NOT used by iOS:** `ai-transcribe` (v4) and `ai-transform` (v4) are **ACTIVE with `verify_jwt: true`** on BubblesKit, but iOS calls OpenAI/USDA **directly** ([OpenAIConfig.swift:49](multi-repo-ios/multi-repo-ios/OpenAI/OpenAIConfig.swift), [FoodLoggerConfig.swift:98](multi-repo-ios/multi-repo-ios/OpenAI/Configs/FoodLoggerConfig.swift)). Grep for `functions/v1` / `functions.invoke` returns nothing. This duplicates the AI plumbing and is the source of the client-side key-leak risk above.
- **Chat backend:** `AgentService` + `ChatSessionService` hit the Next.js `/api/chat*` routes (not Supabase directly) with `Bearer <JWT>`. Project ref in scheme/URL matches the live `chat_sessions` table (currently 2 rows).

## AI / chat state
- **SSE chat:** `AgentService.swift` (165 L) streams from `<base>/api/chat`, parsing **11 event types** (`session`, `agent_thinking`, `tool_call`, `text_delta`, `pokemon_card`, `evolution_card`, `type_matchup_card`, `team_card`, `message_done`, `done`, `error`). JWT-authed, 120 s timeout, `Accept-Encoding: identity`.
- **`ChatViewModel`** (199 L): `@Observable @MainActor`, haptic every 5th token ([ChatViewModel.swift:105-108](multi-repo-ios/multi-repo-ios/Views/Chat/ChatViewModel.swift)), card animations, history load/load-session/delete. Three `print()` error leftovers (lines 156, 177, 187).
- **`ChatSessionService`** (87 L): list/load/delete session endpoints, shares `AgentService.baseURL_internal`.
- **OpenAI direct path** (orphaned AIDemoView only): `TransformService` (streaming Responses API), `TranscribeService` (multipart Whisper), `OpenAIManager` (`@MainActor` URLSession), `FoodLoggerConfig` (USDA search).

## Design tokens
`DesignTokens.swift` — 492 lines, 201 `static let`, auto-gen header intact, two-layer architecture preserved. No manual edits detected. (Unchanged since April.)

## Adaptive / responsive
- `AdaptiveNavShell` wired in `ContentView` with 4 tabs.
- `AdaptiveSheet` defined but **still unused in any `Views/`** — `ChatView` uses raw `.sheet(`.
- `AdaptiveSplitView` — file does not exist.
- `Info.plist` enables `NSAllowsLocalNetworking` (local dev servers over `http://`).

## Dead / stub code
- **No TODO/FIXME/XXX/HACK** anywhere.
- `fatalError` (4): `SupabaseManager.swift:26` (intentional) + 3 NSCoder `init?(coder:)` patterns in MarkdownEditor — standard.
- `print()` (19 total): mostly MarkdownEditor table-debug, plus error paths in `ChatView`/`ChatViewModel` — debug leftovers (2 are commented out).
- **Orphaned files:** `AIDemoView.swift`, `AssistantView.swift`, `AdaptiveSheet.swift`.
- Force unwrap: `AssistantView.swift:31` `URL(string:…)!`; `OpenAIManager.swift:65,80` `URL(string:…)!`.

## Swift concurrency
- `AuthManager` correctly `@Observable @MainActor` with `nonisolated(unsafe) var authStateTask` for deinit cancel.
- `AgentService` / `ChatSessionService` are `final … Sendable` with no mutable shared state.
- `ChatViewModel` `@Observable @MainActor`. `OpenAIConfig` keys are `nonisolated(unsafe) static let`.
- No `DispatchQueue.main.sync`, `Thread.sleep`, or `.wait()`. Minor smell: `ContentView` uses `DispatchQueue.main.asyncAfter` (lines 184, 261) instead of `Task.sleep`.

## Top 5 risks
1. **🔴 Live Supabase anon JWT still exposed** — same key on disk ([Secrets.swift:8](multi-repo-ios/multi-repo-ios/Supabase/Secrets.swift)) *and* in git history (deleted scheme blob `44e4923`, reachable from HEAD). Un-tracking it does not undo the leak. **Rotate the key and scrub history** (filter-repo/BFG).
2. **🟠 OpenAI + USDA keys embedded client-side** ([OpenAISecrets.swift](multi-repo-ios/multi-repo-ios/OpenAI/OpenAISecrets.swift)) and called directly, bypassing the ACTIVE JWT-protected `ai-transform`/`ai-transcribe` edge functions. Extractable from any shipped binary. Route through the edge functions instead.
3. **`AdaptiveSplitView` missing on iOS** despite `docs/components.md` claiming Done — registry + MEMORY still inaccurate.
4. **Two orphan screens** (`AIDemoView`, `AssistantView`) still unmounted; `AssistantView` still points at the wrong Vercel host (`lifegraph-agent.vercel.app`) — copy/paste residue.
5. **Docs drift:** `multi-repo-ios/CLAUDE.md` still advertises "5 tabs: Components, Editor, AI Demo, Settings, Assistant"; actual shell is **Chat / Components / Editor / Settings**. Chat components remain absent from the component registry. *(Unverifiable: whether the production scheme injects override keys at archive time — no archive/CI config available for static review.)*

## Top 5 strengths
1. **Secrets remediation is genuinely improved** — credentials are un-tracked, gitignored, and read via env-var-override, with a tracked `Secrets.example.swift` template. The leak surface is much smaller than April (history + on-disk only, not the working index).
2. **Real multi-agent SSE chat shipped as tab 0** — `AgentService` parses 11 event types, renders 4 inline card types with `withAnimation` + haptics, full JWT auth, session history persisted to `chat_sessions`.
3. **Auth stack fully functional** — Google + Apple + Email on a single `authStateChanges` listener; correct concurrency annotations.
4. **MarkdownEditor remains best-in-class** — 17 files, 1,637-line core, custom TextStorage/LayoutManager, table + image editing.
5. **Clean concurrency + token hygiene** — `@MainActor`/`Sendable` where it matters, 201 generated tokens with intact two-layer architecture, no TODOs, no sync-over-async, `ProfileModel` matches live schema exactly.

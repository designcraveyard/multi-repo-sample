# Cross-Platform Parity Matrix

**Date:** 2026-06-08 (refreshed; supersedes 2026-04-19)
**Baseline:** Next.js (per user instruction). Gaps measured against web.
**Note:** Parent repo has no new commits since the April audit (`d112b88`). The iOS submodule advanced (Chat-first nav, secret un-tracking); web and Android are effectively unchanged on disk. Supabase numbers are from a **live** database read (26 tables), not the repo's migration files.

---

## Screens / routes

| Feature | Web route | iOS screen | Android screen | Gap |
|---|---|---|---|---|
| Login | `app/(auth)/login/page.tsx` | `Views/Auth/LoginView.swift` | `feature/auth/LoginScreen.kt` | ✅ all 3 — Android still missing Apple Sign-In |
| Home / dashboard | `app/(authenticated)/page.tsx` (660 LoC Pokémon demo) | implicit in ContentView tabs | `feature/home/HomeScreen.kt` (real 4-state VM) | ⚠️ web is a demo, not a generic home |
| Components Showcase | `/components-showcase` | folded into **Components** tab | `feature/showcase/ShowcaseScreen.kt` (1298 LOC) | ✅ all 3 |
| Editor / Markdown demo | `/editor-demo` | **Editor** tab | `feature/editor/EditorScreen.kt` | ✅ all 3 |
| Input demo | `/input-demo` (794 LoC!) | — | — | Web-only; probably dead |
| Assistant (ChatKit WebView) | `/assistant` + `/assistant-embed` (job-search app) | `Views/AssistantView.swift` (orphan, **lifegraph URL**) | ❌ missing | 🔴 2/3 broken |
| Chat (custom SSE agent) | `/chat` | ✅ **`ChatView` now tab 0** (mounted) | ❌ missing | 🟠 Android missing (iOS fixed since Apr) |
| AI Demo (transform/transcribe) | `/ai-demo` | `Views/AIDemoView.swift` (orphan) | ❌ missing | 🔴 Android missing, iOS unmounted |
| Admin (dashboard/tools/agents/versions/test) | `/admin/*` (5 routes) | ❌ | ❌ | Web-only by intent ✅ |
| OAuth callback | `/auth/callback` | Supabase OAuth deep link | Supabase OAuth | ✅ parity (different mechanisms) |

**Headline:** iOS closed the Chat gap (now the lead tab); Android still missing 3 AI/chat surfaces; iOS still has 2 orphans (AIDemo unmounted, Assistant orphan+wrong URL); web still ships 3 dead demo pages. **Delta since April:** iOS shell reordered to Chat / Components / Editor / Settings (4 tabs).

---

## Authentication

| Provider | Web | iOS | Android |
|---|---|---|---|
| Google OAuth | ✅ `@supabase/ssr` | ✅ native GIDSignIn | ✅ Credential Manager (ComposeAuth) |
| Apple Sign-In | ✅ OAuth | ✅ native ASAuthorization | ❌ **missing** |
| Email/Password | ✅ | ✅ | ✅ (inline sign-up/sign-in toggle) |
| Password reset / magic link | ❌ | ❌ | ❌ |
| Profile trigger (`handle_new_user`) | ✅ DB trigger | ✅ | ✅ |
| Profile / sign-out UI | ✅ | ✅ (Settings tab) | ❌ — method exists, no UI |
| Dual cookie + Bearer JWT API auth | ✅ `lib/auth/api-auth.ts` | consumer | consumer |

**Headline:** Unchanged. Android auth is weakest: no Apple, no sign-out UI, blank-frame on `SessionStatus.Initializing` ([MainActivity.kt:50](multi-repo-android/app/src/main/java/com/example/multirepoandroid/MainActivity.kt#L50)). Middleware uses `getUser()` (secure); profile-fetch errors swallowed silently on iOS.

---

## AI / ChatKit stack

| Capability | Web | iOS | Android |
|---|---|---|---|
| ChatKit session mint | ✅ `/api/chatkit/session` (hardcoded workflow ID, user=`"demo-user"`) | via WebView | ❌ |
| ChatKit UI | ✅ `/assistant` | ⚠️ `AssistantView` — orphan + `lifegraph-agent.vercel.app` | ❌ |
| Custom agent (OpenAI Agents SDK) | ✅ `/api/chat` + `lib/agents/` (triage → 4 specialists, 7 tools, SSE) | ✅ `AgentService` streams SSE (11 event types) | ❌ |
| Agent admin editor | ✅ `/admin/agents` CRUD | N/A | N/A |
| Transcription / Transform | ✅ `/api/ai/*` + 2 live edge functions | ✅ direct OpenAI/USDA calls (keys client-side) | ❌ |
| Inline cards (Pokémon/Evolution/TypeMatchup/Team) | ✅ `app/components/Chat/cards/` | ✅ 4 card types (undocumented) | ❌ |
| User memories / debug traces | ✅ `user_memories`, `debug_traces` | ❌ | ❌ |

**Headline:** Web has two parallel AI stacks (Agents SDK + ChatKit). iOS consumes the Agents SDK via SSE and now leads with it. Android has nothing. **New smell:** iOS calls OpenAI/USDA directly with embedded keys, bypassing the JWT-protected `ai-transcribe`/`ai-transform` edge functions.

---

## Components — atomic (15 in registry + 2 unbuilt)

15/15 built on Web + iOS + Android + HTML DS (Button, IconButton, Badge, Label, Chip, Tabs, SegmentControlBar, Thumbnail, InputField, Toast, DateGrid, Divider, Checkbox, Switch, RadioButton). **MarkdownEditor**: Web (TipTap) · iOS (17 files, 1637 LOC) · Android (richeditor-compose RC, 419 LOC) · ❌ HTML DS (by intent). **StreakChecks** + **Waveform** still unbuilt everywhere.

**Headline:** Full atomic parity holds. (iOS PhosphorSlim icon set grew **45 → 57** since April.)

---

## Components — patterns (4) & native wrappers

- **Patterns (4/4 everywhere):** TextBlock, ListItem, Stepper, StepIndicator.
- **Native wrappers:** iOS **14** (incl. `AppWebView`), Android **13**, Web **11**. Web missing `AppActionSheet`, `AppColorPicker`, `AppWebView`. Android missing `AppWebView` — **the root cause of the Assistant gap**.

**Headline:** Unchanged. iOS most complete on native wrappers.

---

## Adaptive wrappers (3 in registry)

| Wrapper | Web | iOS | Android | Registry says |
|---|---|---|---|---|
| AdaptiveNavShell | ✅ exists but **unused** (no root layout consumes it) | ✅ wired in ContentView (4 tabs) | ✅ wired in MainActivity (`when(tab)`, not NavHost) | Done ✅ |
| AdaptiveSheet | ✅ | ✅ (not used by any screen) | ✅ | Done ✅ |
| AdaptiveSplitView | ❌ **file missing** | ❌ **file missing** | ✅ `AdaptiveSplitView.kt` (161 LOC, 0 consumers) | Registry claims Done on all 3 — **false** |

**Headline:** `AdaptiveSplitView` remains the single biggest registry→reality mismatch (Kotlin-only, marked Done everywhere). NavShell unused on web; no screen on any platform actually uses an adaptive split.

---

## Design tokens

| Platform | Definition file | Entries (corrected) | Layers |
|---|---|---|---|
| Web | `app/globals.css` | **99 `--color-*` primitives + ~495 semantic refs**, 0 primitive leakage | ✅ two-layer |
| iOS | `DesignTokens.swift` | 201 tokens (492 LOC) | ✅ two-layer |
| Android | `ui/theme/DesignTokens.kt` | 179 vals (76 semantic accessors) | ✅ two-layer |
| HTML DS | `tokens/*.css` | semantic.css (172× plural `--surfaces-*`) | ✅ two-layer |
| Docs | `docs/design-tokens.md` | 24× singular `--surface-*` (legacy) | — |

**Drift (quantified):** `globals.css` carries **both** plural (146) and legacy singular (25); HTML DS is on the correct plural naming; `docs/design-tokens.md` still documents the old singular names. April's web counts ("279 primitives / 435 semantic") were inaccurate — actual is 99/~495 with clean two-layer separation.

**Headline:** Structurally aligned, zero primitive leakage. Naming drift is in the canonical doc, not the code.

---

## Database / Supabase (LIVE — 26 tables, shared multi-app project)

The live BubblesKit project is shared across the template + child apps. Mobile consumes only `profiles`; web consumes ~12 chatbot/demo tables via WebView/API; the fitness + first-gen-chat tables belong to children.

| Domain | Tables | Web | iOS | Android | RLS status |
|---|---|---|---|---|---|
| Core | `profiles` | ✅ types | ✅ `ProfileModel` | ✅ `ProfileModel` | ✅ 3 policies |
| Multi-agent chatbot | `chat_sessions`, `chat_messages`, `user_memories`, `agent_configs`, `tool_definitions`, `agent_tools`, `agent_handoffs`, `agent_versions`, `admin_roles`, `debug_traces`, `insight_reports`, `intelligence_embeddings` (12) | ✅ web-only | ❌ (WebView) | ❌ | mixed: 5 no-policy, 2 anon-INSERT, `intelligence_embeddings` 🔴 RLS OFF |
| Fitness (fit-chat child) | `food_items`, `food_serving_units`, `recipes`, `recipe_ingredients`, `exercises`, `routines`, `workout_logs`, `user_goals`, `reflections`, `body_logs` (10) | ❌ | ❌ | ❌ | 🔴 4 tables RLS OFF (`food_items`, `food_serving_units`, `recipes`, `recipe_ingredients`) |
| First-gen chat (orphaned) | `conversations`, `messages` (2) | ❌ | ❌ | ❌ | ✅ but dead weight |
| Demo | `job_preferences` (1) | ✅ `/assistant-embed` (no server auth) | ❌ | ❌ | ⚠️ wide-open `true` policies |

Plus: **2 active edge functions** (`ai-transcribe`, `ai-transform`), **3 public storage buckets** (`chat-uploads`, `body-log-photos`, `reflection-photos`), 4 RPCs (`search_intel`, `match_food_items`, `match_recipes`, `handle_new_user`).

**Headline:** The "13 web-only tables" of April is really **25 non-profile tables from 3+ apps** sharing one project. **5 tables have RLS disabled.** `database.types.ts` still models only `profiles` (now 25 tables behind). The repo's 8 migration files cannot reproduce the live DB (19 applied, 11 with no SQL file). See [05-supabase.md](05-supabase.md).

---

## Feature parity scorecard

| Area | Apr | Jun | Notes |
|---|---|---|---|
| Components — atomic | A | **A (15/15)** | Full parity, 3 runtimes + HTML DS |
| Components — patterns | A | **A (4/4)** | Full parity |
| Components — native wrappers | A– | **A–** | iOS 14, Android 13, web 11 |
| Adaptive wrappers | C | **C** | Registry claims 3/3; reality 2/3 on iOS + web |
| Design tokens | A– | **A–** | Aligned, zero leakage; naming drift in docs |
| Auth | B | **B** | Android missing Apple + sign-out UI |
| Chat screen | D | **C** | ⬆ iOS now wired (lead tab); Android still missing |
| Assistant (ChatKit) | D | **D** | Android missing; iOS orphan + lifegraph URL |
| AI Demo | D | **D** | Android missing; iOS orphan |
| Home / dashboard | C | **C** | Web is a Pokémon demo |
| Database schema | B | **C–** | ⬇ shared multi-app project, 5 RLS-disabled tables, types 25 behind |
| Secrets hygiene (iOS) | F | **C** | ⬆ un-tracked + gitignored; anon JWT still on disk + in history |

**Overall parity grade: B–** — strong primitives, weak features. Net since April: iOS Chat + secrets improved; the database/infra story got worse once examined live.

# Android Platform Audit

**Date:** 2026-06-08
**Scope:** `multi-repo-android/`
**Method:** Static analysis only (no builds). Submodule pinned at `3922c8c` ("fix: improve LoginScreen layout", committed 2026-02-28).

> **Delta vs. prior audit (2026-04-19):** **No Android source changed.** The submodule HEAD, the parent repo's recorded pointer, and the working tree are all identical to the April audit (`git status` is clean; HEAD = `3922c8c` = recorded pointer). Every prior finding re-verified true. The only material change this cycle is **cross-domain**: the live BubblesKit Supabase DB has grown to **26 tables**, and Android still consumes exactly **one** of them (`profiles`). The "M multi-repo-android" in the parent `git status` is a pointer/whitespace artifact, not a code change.

## Summary
- **Android remains materially behind Next.js and iOS** — ships **3 in-app screens** (Home, Editor, Showcase) + Login, vs. web's 15+ routes and iOS's 5 top-level Views. Unchanged since April.
- **Zero AI surface on Android.** No ChatKit WebView, no `/assistant` equivalent, no `AIDemoView` counterpart, no `ChatView`. Grep for `chatkit|webview|assistant|aidemo` across all Android source returns **zero** matches. CLAUDE.md still claims "All three platforms expose an AI assistant tab" — **false for Android**.
- **Auth is the weakest of the three platforms** — Email + Google only. **No Apple Sign-In.** No password reset / magic-link path. (Correction to April audit: there *is* an inline sign-up flow — a `Sign Up`/`Sign In` toggle via `viewModel.isSignUp` — but no dedicated sign-up *screen* and no profile screen.)
- **Component library is at full parity** — 16 atomic + 4 patterns + 14 native wrappers + 3 adaptive wrappers, all `App*`-prefixed, no stubs. Strongest part of Android. (April's "19 atomic" was the registry count; the on-disk `ui/components/` dir holds 16 files — same components, different bucketing.)
- **Design tokens synced and healthy** (500 LOC, 179 vals, 76 semantic `get()` accessors), but the feature layer that should consume them barely exists.
- **Cross-domain gap:** Live DB now has 26 tables (chat, fitness/nutrition, multi-agent, admin). Android's only typed model is `ProfileModel.kt`; the only Postgrest call is `from("profiles")`. **Android references 0 of the 25 non-profile tables.**

## Screens inventory

| Screen | Web | iOS | Android | Notes |
|---|---|---|---|---|
| Login | `(auth)/login/page.tsx` | `Views/Auth/LoginView.swift` | `feature/auth/LoginScreen.kt` | Android missing Apple Sign-In |
| Home | `(authenticated)/page.tsx` | (root) | `feature/home/HomeScreen.kt` | Full 4-state ViewModel on Android ✓ |
| Components Showcase | `/components-showcase` | `Views/ComponentsShowcaseView.swift` | `feature/showcase/ShowcaseScreen.kt` (1298 LOC) | Parity ✓ |
| Editor / Markdown demo | `/editor-demo` | (via ComponentsShowcase) | `feature/editor/EditorScreen.kt` | Parity ✓ |
| Input demo | `/input-demo` | — | — | Web-only |
| Assistant (ChatKit) | `(authenticated)/assistant` + `/assistant-embed` | `Views/AssistantView.swift` | **MISSING** | Critical gap |
| Chat | `(authenticated)/chat` (+ full `/api/chat`) | `Views/Chat/ChatView.swift` + chat cards | **MISSING** | Critical gap |
| AI Demo | `(authenticated)/ai-demo` | `Views/AIDemoView.swift` | **MISSING** | Critical gap |
| Admin (multi-screen) | `admin/*` | — | — | Web-only by intent |

**Android in-app screen count: 4** (Login, Home, Editor, Showcase). **Parity gap vs iOS: 3 missing screens (Chat, Assistant, AI Demo). Parity gap vs web: 11+.** No screens added since April.

## Components inventory

**16 atomic files** in `ui/components/`: AppBadge, AppButton, AppCheckbox, AppChip, AppDateGrid, AppDivider, AppIconButton, AppInputField, AppLabel, AppMarkdownEditor (**419 LOC — real impl** via `com.mohamedrejeb.richeditor:richeditor-compose 1.0.0-rc13`), AppRadioButton, AppSegmentControlBar, AppSwitch, AppTabs, AppThumbnail, AppToast.

**Patterns (4)** in `ui/patterns/`: AppListItem, AppStepIndicator, AppStepper, AppTextBlock ✓.

**Native wrappers (14)** in `ui/native/`: AppActionSheet, AppAlertPopup, AppBottomNavBar, AppBottomSheet, AppCarousel, AppColorPicker, AppContextMenu, AppDateTimePicker, AppNativePicker, AppPageHeader, AppProgressLoader, AppRangeSlider, AppTooltip + `NativeComponentStyling.kt` (the styling file is the 14th entry; 13 are true wrappers).

**Adaptive (3)** in `ui/adaptive/`: [AdaptiveNavShell.kt](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveNavShell.kt) (341 LOC), AdaptiveSheet, [AdaptiveSplitView.kt](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/adaptive/AdaptiveSplitView.kt) (161 LOC — **still has zero consumers**, only referenced inside its own file).

**All follow `App*` / `Adaptive*` convention. None are stubs.** Registry items still missing everywhere: StreakChecks, Waveform. No component changes since April.

## Auth state
[`data/auth/AuthRepository.kt`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/auth/AuthRepository.kt) exposes: `sessionStatus` Flow, `isAuthenticated` Flow, `signInWithEmail`, `signUpWithEmail`, `signOut`, `getProfile`. Providers: **Email + Google only** (Google via Credential Manager / ComposeAuth `rememberSignInWithGoogle`).

- [`LoginScreen.kt:143-146`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/auth/LoginScreen.kt) wires the Google button; [lines 153-167](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/auth/LoginScreen.kt) provide an inline `Sign Up`/`Sign In` toggle.
- **No Apple Sign-In button** anywhere (grep for `apple` returns nothing). iOS has native Apple; web has Apple OAuth. Android does not.
- **No "Forgot Password" / reset / magic-link** path. No profile screen.

Auth gate in [`MainActivity.kt:48-77`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt) is structurally correct (`sessionStatus` → `AdaptiveNavShell` else `LoginScreen`), but the `SessionStatus.Initializing` branch ([line 49-51](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt)) is **empty with a `TODO`** — a flash of blank screen on cold start during session restore. **Unchanged.**

## AI state
**Completely absent — unchanged.** No `WebView`, no `ChatKit`, no Assistant/Chat/AIDemo screen, no AI feature file. Grep for `chatkit|webview|assistant|aidemo` across `app/src/main/java/` returns **zero** matches. By contrast iOS ships `AssistantView.swift`, `ChatView.swift`, `AIDemoView.swift` + 4 chat card views + SSE stream view; web ships `/assistant`, `/chat`, `/ai-demo` plus a full `/api/chat` + `/api/chatkit` backend. Android is the lone holdout.

## Design tokens
[`ui/theme/DesignTokens.kt`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/theme/DesignTokens.kt) — **500 LOC, 179 `val`s, 76 semantic `get()` accessors**. Structure matches `docs/design-tokens.md`:
- **PrimitiveColors** — Slate/Zinc/Neutral/Red/Amber/Green/Indigo scales, `internal` visibility
- **SemanticColors** — ~76 vals via `@Composable @ReadOnlyComposable get()` keyed on `isSystemInDarkTheme()`
- `Spacing` (4dp grid), `Radius` (none→full), `IconSize` (xs→xl) companions present

Rough cross-platform parity: web 484 CSS vars, iOS 201 entries, Android 179. Android is leanest but structurally aligned. **Unchanged since April.**

## DI + Nav health
**DI:** Hilt installed. [`di/AppModule.kt`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/di/AppModule.kt) provides only `SupabaseClient` and `AuthRepository` (both `@Singleton`). Only **2 `@HiltViewModel`s** exist: `HomeViewModel`, `LoginViewModel`. Showcase and Editor are state-holding composables with no VM.

**ViewModel quality:** `HomeViewModel` implements the full 4-state sealed interface (`Loading`/`Empty`/`Error`/`Populated`). `LoginViewModel` uses a `LoginScreenState` sealed interface. Both exemplary.

**Navigation — declared but not wired (unchanged):** [`navigation/Screen.kt`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/navigation/Screen.kt) defines a `@Serializable sealed interface Screen` with 3 routes (`Home`, `Showcase`, `Editor`). But **`navigation-compose 2.8.5` is imported and never used** — there is no `NavHost`, no `rememberNavController`, no `composable(...)` anywhere in source (the only `navController` reference is a comment in `AppPageHeader.kt:17`). [`MainActivity.kt:53,67-71`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt) uses `var selectedTab by rememberSaveable { mutableIntStateOf(0) }` and a `when (tab) { 0 -> HomeScreen(); 1 -> EditorScreen(); 2 -> ShowcaseScreen() }` switch. **Type-safe nav is dead code; deep links are impossible.**

## Gradle / deps
[`gradle/libs.versions.toml`](multi-repo-android/gradle/libs.versions.toml) — unchanged since April:
- AGP 8.13.2, Kotlin 2.1.0, KSP 2.1.0-1.0.29
- Compose BOM 2025.01.01 — now ~5 months old (newer stable BOMs available)
- Hilt 2.53.1 (stable)
- Navigation 2.8.5 (imported, unused)
- supabase-kt 3.2.5
- Ktor 3.0.3
- lifecycle 2.8.7
- material3-adaptive 1.3.1
- richeditor-compose 1.0.0-rc13 — **still an RC, not GA** (supply-chain / stability risk; the only dep powering AppMarkdownEditor)

## Adaptive adoption
`WindowWidthSizeClass` / `widthSizeClass` referenced in **4 files only**: the 3 adaptive wrappers + `MainActivity.kt`. **No feature screen opts into an adaptive layout itself.** `AdaptiveSplitView` exists (161 LOC) but **is consumed by zero screens** (only self-referenced). Unchanged.

## Dead / stub code
- One `TODO`: [`MainActivity.kt:50`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt) — "Replace with AppProgressLoader once wired" in the `SessionStatus.Initializing` branch → blank frame during session restore.
- The entire `navigation/Screen.kt` + `navigation-compose` dependency are effectively dead (declared, never wired).
- Zero `FIXME`, zero `XXX`, zero "stub" tokens.

## Tests
**None.** No `src/test/`, no `src/androidTest/`. Matches iOS (also zero). Web is the only platform with any test surface.

## Cross-domain: Supabase table consumption
Verified against the **live BubblesKit project** via MCP `list_tables` (2026-06-08): the `public` schema now holds **26 tables**:

`profiles`, `conversations`, `messages`, `job_preferences`, `food_items`, `recipes`, `food_serving_units`, `recipe_ingredients`, `exercises`, `routines`, `workout_logs`, `user_goals`, `reflections`, `body_logs`, `chat_sessions`, `chat_messages`, `user_memories`, `agent_configs`, `tool_definitions`, `agent_tools`, `agent_handoffs`, `agent_versions`, `admin_roles`, `debug_traces`, `insight_reports`, `intelligence_embeddings`.

**Android consumes exactly one:** `profiles`. The only typed model is [`ProfileModel.kt`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/model/ProfileModel.kt) (id, display_name, avatar_url, created_at, updated_at), and the only Postgrest query is [`AuthRepository.kt:49`](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/data/auth/AuthRepository.kt) `from("profiles")`. **Android references 0 of the 25 non-profile tables** — including all chat (`chat_sessions`, `chat_messages`, `conversations`, `messages`), multi-agent (`agent_configs`, `tool_definitions`, `agent_*`), and fitness/nutrition (`food_items`, `recipes`, `exercises`, `routines`, `workout_logs`, `body_logs`, `user_goals`, `reflections`) tables. **Confirmed.**

> *(Side note, infra not Android: the MCP advisor flags RLS **disabled** on 5 tables — `food_items`, `recipes`, `food_serving_units`, `recipe_ingredients`, `intelligence_embeddings`. Out of Android's scope but worth surfacing to whoever owns the schema.)*

## Top risks (Android missing vs web/iOS)
1. **AI / ChatKit integration absent** — no Assistant screen, no `WebView` wrapper, no AIDemo, no Chat. Largest single gap; CLAUDE.md's "all three platforms have an AI tab" is false here.
2. **Chat feature absent** — iOS has `ChatView` + `ChatViewModel` + 4 chat cards + SSE view; web has `/chat` + full `/api/chat`. Android has nothing, and consumes none of the `chat_*`/`conversations`/`messages` tables.
3. **Apple Sign-In missing** — Email + Google only; no Apple, no password reset, no magic link.
4. **Navigation declared but not wired** — `Screen.kt` + `navigation-compose` are dead code; `MainActivity` uses an int `when(tab)`. **Deep links are impossible.**
5. **`AdaptiveSplitView` has zero consumers** — wrapper built, no screen uses it; no feature screen adopts any adaptive layout.
6. **Stale/RC dependencies** — Compose BOM ~5 months old; `richeditor-compose` still an RC (sole markdown engine).
7. **`MainActivity.kt:50` TODO** — blank frame during session restore (cold-start UX glitch).
8. **Zero tests.**

## Top strengths
1. **Component library parity is complete** — 16 atoms + 4 patterns + 13 native (+styling) + 3 adaptive, all `App*`-prefixed, no stubs.
2. **Design token architecture is clean** — two-layer (Primitive `internal` → Semantic `public`), dark-mode via `@Composable @ReadOnlyComposable get()`.
3. **4-state ScreenState pattern is genuinely enforced** — sealed interfaces with exhaustive `when`; arguably stricter than iOS's `@Observable`-without-sealed approach.
4. **Hilt DI wired correctly** — `@AndroidEntryPoint`, `@HiltViewModel` on both VMs, `hiltViewModel()` injection, `@Singleton` Supabase client.
5. **`AppMarkdownEditor` is a real 419-LOC implementation** backed by `richeditor-compose`, with a working Editor demo screen — mirrors iOS's multi-file MarkdownEditor effort in spirit.

**Bottom line:** Identical to April — strong component foundation and clean architectural patterns sitting on a hollow feature layer. Three real in-app screens, no AI, no chat, weakest auth (no Apple), unwired navigation, and a single consumed table out of 26 in a DB that has since tripled in size. Component + token work is solid; screen/feature work stalled before the April audit and has not resumed.

# Design: Android (Jetpack Compose) Project — multi-repo-android

**Date:** 2026-02-23
**Status:** Approved
**Scope:** Full parity scaffold — project structure, all components, tokens, wrappers, skills, agents, hooks

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Framework | Jetpack Compose | Closest parallel to SwiftUI; declarative, reactive, Material 3 built-in |
| DI | Hilt | Google's official; annotation-driven, integrates with Compose Navigation + ViewModels |
| Icons | Phosphor Icons (Compose) | Same icon set as web (`@phosphor-icons/react`) and iOS (`PhosphorSwift`) |
| Networking | supabase-kt | Official Kotlin SDK; Ktor + kotlinx.serialization; parallel to supabase-swift |
| Architecture | Hybrid | Components mirror iOS structure (easy cross-platform tooling); screens follow Android feature-based packaging |
| Min SDK | 26 (Android 8.0) | 95%+ device coverage, modern APIs |
| Target SDK | 35 (Android 15) | Latest stable |

---

## 1. Project Structure

```
multi-repo-android/                          # Independent git repo
├── .git/
├── CLAUDE.md                                # Platform-specific instructions
├── app/
│   ├── build.gradle.kts                     # App module
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/abhishekverma/multirepo/
│       │   ├── MultiRepoApp.kt              # @HiltAndroidApp
│       │   ├── MainActivity.kt              # Single-activity Compose host
│       │   ├── ui/
│       │   │   ├── theme/
│       │   │   │   ├── DesignTokens.kt      # Primitive + Semantic tokens
│       │   │   │   ├── Type.kt              # 28 typography styles
│       │   │   │   └── Theme.kt             # Material 3 theme wrapper
│       │   │   ├── components/              # 14 atomic components
│       │   │   ├── native/                  # 13 native wrappers + NativeComponentStyling.kt
│       │   │   ├── adaptive/                # AdaptiveNavShell, AdaptiveSheet, AdaptiveSplitView
│       │   │   ├── patterns/                # 4 pattern components
│       │   │   └── icons/                   # PhosphorIconHelper.kt
│       │   ├── feature/
│       │   │   └── home/                    # HomeScreen.kt + HomeViewModel.kt
│       │   ├── data/
│       │   │   ├── supabase/                # SupabaseClient.kt
│       │   │   └── model/                   # Data classes matching Supabase schema
│       │   └── di/
│       │       └── AppModule.kt             # Hilt module
│       └── res/
│           ├── values/
│           │   ├── strings.xml
│           │   └── themes.xml
│           └── values-night/
│               └── themes.xml
├── build.gradle.kts                         # Root build file
├── settings.gradle.kts
└── gradle/
    └── libs.versions.toml                   # Version catalog
```

**Key points:**
- Single `app` module (no multi-module yet — modularize when needed).
- Package: `com.abhishekverma.multirepo`.
- Version catalog for all dependency versions.
- `ui/` subtree mirrors iOS `Components/` for cross-platform tooling parity.
- `feature/` subtree follows Android convention (screen + viewmodel per feature).

---

## 2. Design Token System

Two-layer architecture matching web (CSS custom properties) and iOS (Swift Color/CGFloat/Font extensions).

### Layer 1: Primitives (internal only)

```kotlin
// DesignTokens.kt
internal object PrimitiveColors {
    val colorZinc50 = Color(0xFFFAFAFA)
    val colorZinc100 = Color(0xFFF4F4F5)
    // ... full Tailwind palette (Slate, Zinc, Neutral, Red, Amber, Green, etc.)
    val colorZinc950 = Color(0xFF09090B)
}
```

Marked `internal` — enforced by `design-token-guard` hook. Never referenced in component files.

### Layer 2: Semantic (used everywhere)

```kotlin
object SemanticColors {
    // Surfaces
    val surfacesBasePrimary: Color
        @Composable @ReadOnlyComposable
        get() = if (isSystemInDarkTheme()) Color(0xFF09090B) else Color(0xFFFFFFFF)

    val surfacesBrandInteractive: Color
        @Composable @ReadOnlyComposable
        get() = if (isSystemInDarkTheme()) Color(0xFF...) else Color(0xFF...)

    // Typography
    val typographyPrimary: Color @Composable @ReadOnlyComposable get() = ...
    val typographyMuted: Color @Composable @ReadOnlyComposable get() = ...

    // Borders
    val borderDefault: Color @Composable @ReadOnlyComposable get() = ...
    val borderMuted: Color @Composable @ReadOnlyComposable get() = ...

    // Icons
    val iconsPrimary: Color @Composable @ReadOnlyComposable get() = ...
    val iconsBrand: Color @Composable @ReadOnlyComposable get() = ...
}
```

### Spacing & Radius

```kotlin
object Spacing {
    val space1 = 4.dp      // 4px grid
    val space2 = 8.dp
    val space3 = 12.dp
    val space4 = 16.dp
    // ... through space24 = 96.dp
}

object Radius {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 20.dp
    val xxl = 32.dp
    val full = 9999.dp
}
```

### Typography

```kotlin
object AppTypography {
    val displayLarge = TextStyle(fontSize = 96.sp, lineHeight = 104.sp, fontWeight = FontWeight.Bold)
    val bodyMedium = TextStyle(fontSize = 14.sp, lineHeight = 20.sp, fontWeight = FontWeight.Normal)
    val ctaSmall = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, fontWeight = FontWeight.SemiBold)
    // ... all 28 styles
}
```

### Theme Wrapper

```kotlin
@Composable
fun MultiRepoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) darkColorScheme(
        primary = SemanticColors.surfacesBrandInteractive,
        surface = SemanticColors.surfacesBasePrimary,
        // ... map semantic tokens to Material 3 color roles
    ) else lightColorScheme(...)

    MaterialTheme(
        colorScheme = colorScheme,
        typography = materialTypography,
        content = content
    )
}
```

### Token Sync

`/design-token-sync` extended to parse `globals.css` and generate `DesignTokens.kt` alongside `DesignTokens.swift`.

**Naming convention:** Figma `Surfaces/BrandInteractive` -> CSS `--surfaces-brand-interactive` -> Swift `Color.surfacesBrandInteractive` -> Kotlin `SemanticColors.surfacesBrandInteractive`

---

## 3. Components

### 3.1 Atomic Components (14)

One `@Composable` function per file in `ui/components/`. All prefixed `App`.

| Component | File | Key Props |
|-----------|------|-----------|
| Button | `AppButton.kt` | `label`, `onClick`, `variant` (Primary/Secondary/Tertiary/Success/Danger), `size` (S/M/L), `enabled`, `leadingIcon` |
| IconButton | `AppIconButton.kt` | `icon`, `onClick`, `variant`, `size`, `enabled` |
| Badge | `AppBadge.kt` | `text`, `variant` (Success/Warning/Error/Info/Neutral), `size` |
| Label | `AppLabel.kt` | `text`, `icon`, `variant` |
| Chip | `AppChip.kt` | `label`, `selected`, `onToggle`, `variant` (Tab/Filter) |
| Tabs | `AppTabs.kt` | `tabs`, `selectedIndex`, `onSelect` |
| SegmentControlBar | `AppSegmentControlBar.kt` | `segments`, `selectedIndex`, `onSelect` |
| Thumbnail | `AppThumbnail.kt` | `imageUrl`, `size`, `shape` |
| InputField | `AppInputField.kt` | `value`, `onValueChange`, `label`, `placeholder`, `state` (Default/Success/Warning/Error), `leadingIcon`, `trailingIcon` |
| Toast | `AppToast.kt` | `message`, `variant`, `action`, `onDismiss` |
| Divider | `AppDivider.kt` | `orientation`, `color` |
| Checkbox | `AppCheckbox.kt` | `checked`, `onCheckedChange`, `label`, `enabled` |
| RadioButton | `AppRadioButton.kt` | `selected`, `onClick`, `label`, `enabled` |
| Switch | `AppSwitch.kt` | `checked`, `onCheckedChange`, `label`, `enabled` |

**Disabled state:** 0.5 opacity on container (matching web/iOS convention).

### 3.2 Pattern Components (4)

In `ui/patterns/`. Compose 2+ atomic components.

| Pattern | File | Composes |
|---------|------|----------|
| TextBlock | `AppTextBlock.kt` | Typography tokens, optional icon |
| StepIndicator | `AppStepIndicator.kt` | Badge + Divider + Label |
| Stepper | `AppStepper.kt` | IconButton + Label |
| ListItem | `AppListItem.kt` | Thumbnail + Label + Icon + optional trailing controls |

### 3.3 Native Wrappers (13)

In `ui/native/`. Thin wrappers around Material 3 / Compose Foundation APIs with centralized styling.

| Wrapper | Backing API | Notes |
|---------|-------------|-------|
| `AppNativePicker` | `ExposedDropdownMenuBox` + `DropdownMenuItem` | Menu-style select; error border support |
| `AppDateTimePicker` | `DatePickerDialog` / `TimePickerDialog` (M3) | Dialog-based; modes: date/time/dateAndTime |
| `AppProgressLoader` | `CircularProgressIndicator` / `LinearProgressIndicator` | Variants: indefinite/definite |
| `AppColorPicker` | Custom Compose (HSV wheel) | No M3 equivalent; custom implementation |
| `AppBottomSheet` | `ModalBottomSheet` (M3) | Detents via `SheetState` |
| `AppActionSheet` | `AlertDialog` with vertical action buttons | Confirmation/destructive action pattern |
| `AppAlertPopup` | `AlertDialog` (M3) | Standard alert with configurable buttons |
| `AppPageHeader` | `TopAppBar` / `CenterAlignedTopAppBar` (M3) | Title + navigation icon + trailing actions |
| `AppContextMenu` | `DropdownMenu` | Long-press or overflow menu |
| `AppBottomNavBar` | `NavigationBar` (M3) | Bottom tabs with icon + label |
| `AppCarousel` | `HorizontalPager` (Foundation) | Paged/snap modes; optional dot indicators |
| `AppTooltip` | `PlainTooltip` / `RichTooltip` (M3) | Long-press or anchor-based |
| `AppRangeSlider` | `RangeSlider` (M3) | Dual-thumb with labels; haptic feedback |

**Centralized styling:** `NativeComponentStyling.kt` with per-wrapper `object` blocks:

```kotlin
object NativePickerStyling {
    object Colors {
        val tint @Composable get() = SemanticColors.surfacesBrandInteractive
        val label @Composable get() = SemanticColors.typographyPrimary
        val errorBorder @Composable get() = SemanticColors.borderError
    }
    object Layout {
        val cornerRadius = Radius.md
        val paddingVertical = Spacing.space2
        val paddingHorizontal = Spacing.space4
    }
    object Typography {
        val label = AppTypography.bodyMedium
        val helper = AppTypography.captionMedium
    }
}
// ... one object per wrapper
```

### 3.4 Adaptive Wrappers (3)

In `ui/adaptive/`. Responsive based on `WindowSizeClass`.

| Wrapper | Compact (phone) | Medium/Expanded (tablet/desktop) |
|---------|-----------------|----------------------------------|
| `AdaptiveNavShell` | `NavigationBar` (bottom tabs) | `NavigationRail` (collapsible icon rail, 60dp collapsed / 240dp expanded) |
| `AdaptiveSheet` | `ModalBottomSheet` | `Dialog` (centered modal, max 480dp wide) |
| `AdaptiveSplitView` | Single-pane push navigation | `ListDetailPaneScaffold` (side-by-side) |

**WindowSizeClass** provided via `calculateWindowSizeClass(activity)` in `MainActivity`, passed down through `CompositionLocalProvider`.

---

## 4. Navigation & Screen Pattern

### Type-Safe Navigation

```kotlin
@Serializable
sealed interface Screen {
    @Serializable data object Home : Screen
    @Serializable data class UserProfile(val userId: String) : Screen
    // ... one per screen
}
```

Wired in `MainActivity`:

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            val windowSizeClass = calculateWindowSizeClass(this)
            CompositionLocalProvider(LocalWindowSizeClass provides windowSizeClass) {
                MultiRepoTheme {
                    val navController = rememberNavController()
                    AdaptiveNavShell(navController = navController) {
                        NavHost(navController, startDestination = Screen.Home) {
                            composable<Screen.Home> { HomeScreen(hiltViewModel()) }
                            // ...
                        }
                    }
                }
            }
        }
    }
}
```

### Screen File Pattern

Each feature directory:

```
feature/<name>/
├── <Name>Screen.kt          # @Composable, observes ViewModel state
├── <Name>ViewModel.kt       # @HiltViewModel, StateFlow<ScreenState>
└── <Name>ScreenState.kt     # Sealed interface (Loading/Empty/Error/Populated)
```

**Required four states** (matching web/iOS):

```kotlin
sealed interface HomeScreenState {
    data object Loading : HomeScreenState
    data object Empty : HomeScreenState
    data class Error(val message: String) : HomeScreenState
    data class Populated(val items: List<Item>) : HomeScreenState
}

@Composable
fun HomeScreen(viewModel: HomeViewModel) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    when (state) {
        is HomeScreenState.Loading -> AppProgressLoader(variant = ProgressVariant.Indefinite)
        is HomeScreenState.Empty -> { /* empty state */ }
        is HomeScreenState.Error -> { /* error + retry */ }
        is HomeScreenState.Populated -> { /* content */ }
    }
}
```

---

## 5. Icon System

Phosphor Icons for Compose — same set as web and iOS.

```kotlin
// Usage
PhosphorIcon(
    icon = Ph.House,
    weight = IconWeight.Regular,
    size = IconSize.Md,       // xs=12, sm=16, md=20, lg=24, xl=32
    tint = SemanticColors.iconsPrimary
)
```

**PhosphorIconHelper.kt** provides:
- `IconSize` enum with `.dp` values matching web/iOS tokens
- `PhosphorIcon` composable with size/color/accessibility defaults
- Content description parameter for TalkBack

---

## 6. Dependencies

### gradle/libs.versions.toml

```toml
[versions]
agp = "8.7.3"
kotlin = "2.1.0"
compose-bom = "2025.01.01"
compose-compiler = "1.5.15"
hilt = "2.53.1"
navigation = "2.8.5"
supabase = "3.1.1"
ktor = "3.0.3"
lifecycle = "2.8.7"
material3-adaptive = "1.1.0"
ksp = "2.1.0-1.0.29"

[libraries]
# Compose
compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "compose-bom" }
compose-material3 = { group = "androidx.compose.material3", name = "material3" }
compose-material3-adaptive = { group = "androidx.compose.material3.adaptive", name = "adaptive-navigation-suite", version.ref = "material3-adaptive" }
compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
compose-foundation = { group = "androidx.compose.foundation", name = "foundation" }

# Lifecycle
lifecycle-runtime = { group = "androidx.lifecycle", name = "lifecycle-runtime-compose", version.ref = "lifecycle" }
lifecycle-viewmodel = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycle" }

# Navigation
navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigation" }

# Hilt
hilt-android = { group = "com.google.dagger", name = "hilt-android", version.ref = "hilt" }
hilt-compiler = { group = "com.google.dagger", name = "hilt-android-compiler", version.ref = "hilt" }
hilt-navigation = { group = "androidx.hilt", name = "hilt-navigation-compose", version = "1.2.0" }

# Supabase
supabase-postgrest = { group = "io.github.jan-tennert.supabase", name = "postgrest-kt", version.ref = "supabase" }
supabase-realtime = { group = "io.github.jan-tennert.supabase", name = "realtime-kt", version.ref = "supabase" }
supabase-gotrue = { group = "io.github.jan-tennert.supabase", name = "gotrue-kt", version.ref = "supabase" }
supabase-compose-auth = { group = "io.github.jan-tennert.supabase", name = "compose-auth", version.ref = "supabase" }
ktor-client = { group = "io.ktor", name = "ktor-client-android", version.ref = "ktor" }

# Icons (Phosphor)
phosphor-icons = { group = "com.phosphoricons", name = "phosphor-android", version = "2.1.0" }

# Activity
activity-compose = { group = "androidx.activity", name = "activity-compose", version = "1.9.3" }
core-ktx = { group = "androidx.core", name = "core-ktx", version = "1.15.0" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
kotlin-serialization = { id = "org.jetbrains.kotlin.plugin.serialization", version.ref = "kotlin" }
hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
ksp = { id = "com.google.devtools.ksp", version.ref = "ksp" }
```

---

## 7. Tooling Extensions

### Skills

| Skill | Change |
|-------|--------|
| `/cross-platform-feature` | **Extend:** add Phase 3.5 — scaffold Android screen + viewmodel + model |
| `/new-screen` | **Extend:** add Android screen scaffold |
| `/design-token-sync` | **Extend:** generate `DesignTokens.kt` from `globals.css` |
| `/component-audit` | **Extend:** audit Android implementation alongside web + iOS |
| `/validate-tokens` | **Extend:** check `.kt` files for primitive token usage |
| `/android-native-components` | **New:** reference skill for Android native wrappers (auto-invoked for screen files) |

### Agents

| Agent | Change |
|-------|--------|
| `cross-platform-reviewer` | **Extend:** 3-way parity (web vs iOS vs Android) |
| `design-consistency-checker` | **Extend:** validate Android Compose token usage |
| `complex-component-reviewer` | **Extend:** validate Kotlin/Compose composition |
| `screen-reviewer` | **Extend:** audit Android screens (WindowSizeClass, state handling, TalkBack) |
| `supabase-schema-validator` | **Extend:** validate Kotlin data classes against schema |

### Hooks

| Hook | Change |
|------|--------|
| `design-token-guard` | **Extend:** block `PrimitiveColors.*` in `.kt` component files |
| `design-token-semantics-guard` | **Extend:** check Android files for token misuse |
| `native-wrapper-guard` | **Extend:** warn on raw `TextField(`, `Button(`, `Surface(` etc. in Android screen files |
| `adaptive-layout-guard` | **Extend:** check for `WindowSizeClass` or `LocalWindowSizeClass` in Android screen files |
| `screen-structure-guard` | **Extend:** check Android screen files for component library imports |
| `comment-enforcer` | **Extend:** check `.kt` files > 80 lines |
| `cross-platform-reminder` | **Extend:** remind of 2 counterparts (web + iOS or web + Android) |
| `auto-lint` | **New rule:** run `ktlint` on `.kt` file edits |

### Documentation Updates

| File | Change |
|------|--------|
| Root `CLAUDE.md` | Add `multi-repo-android` section with build commands, architecture, conventions |
| `multi-repo-android/CLAUDE.md` | New platform-specific file |
| `docs/components.md` | Add Android Implementation column to all tables |
| `docs/design-tokens.md` | Add Kotlin token name column |
| `docs/PRDs/prd-template.md` | Add Android (Compose) row to Cross-Platform Scope table |

---

## 8. Cross-Platform Naming Conventions

| Concept | Web (Next.js) | iOS (SwiftUI) | Android (Compose) |
|---------|---------------|---------------|-------------------|
| Route/screen name | kebab-case (`/user-profile`) | PascalCase (`UserProfileView.swift`) | PascalCase feature dir (`feature/userprofile/UserProfileScreen.kt`) |
| Component prefix | none (`Button.tsx`) | `App` (`AppButton.swift`) | `App` (`AppButton.kt`) |
| Token file | `globals.css` | `DesignTokens.swift` | `DesignTokens.kt` |
| Styling file | `const styling = {}` per wrapper | `NativeComponentStyling.swift` | `NativeComponentStyling.kt` |
| Icon usage | `<Icon name="House" />` | `Ph.house.regular.iconSize(.md)` | `PhosphorIcon(Ph.House, size = IconSize.Md)` |
| Entry point | `app/layout.tsx` | `multi_repo_iosApp.swift` | `MainActivity.kt` |
| State management | Server Components + `use client` | `@Observable` ViewModel | `@HiltViewModel` + `StateFlow` |
| Responsive detection | `md:` Tailwind prefix | `horizontalSizeClass` | `WindowSizeClass` |
| Navigation shell | `AdaptiveNavShell.tsx` | `AdaptiveNavShell.swift` | `AdaptiveNavShell.kt` |
| Dark mode | `prefers-color-scheme` CSS | `colorScheme` environment | `isSystemInDarkTheme()` |
| Supabase client | `@supabase/supabase-js` | `supabase-swift` | `supabase-kt` |

---

## 9. Git Setup

- Independent repo at `multi-repo-android/` (same pattern as `multi-repo-ios/` and `multi-repo-nextjs/`)
- No shared git history with other repos
- Workspace root `.claude/` hooks and skills reference all 3 repos by path
- `/git-push` skill extended to push 3 repos
- Post-session review checks 3 repos for unpushed commits

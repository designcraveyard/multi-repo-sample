---
name: cross-platform-feature
description: Scaffold a complete feature across BOTH the Next.js web app and SwiftUI iOS app simultaneously. Use when adding any new user-facing feature, when the user says "add feature X", "build feature X", or "implement X on both platforms". Creates matching page/view pairs, a Supabase migration stub, and a PRD entry.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Cross-Platform Feature Scaffolder

Scaffold a feature across BOTH platforms in one coordinated workflow.

## Workspace Paths
- Next.js app: `multi-repo-nextjs/`
- iOS app: `multi-repo-ios/multi-repo-ios/`
- Android app: `multi-repo-android/app/src/main/java/`
- Shared docs: `docs/`
- Supabase migrations: `supabase/migrations/`
- Design token spec: `docs/design-tokens.md`

## Arguments

`$ARGUMENTS` — Feature description (e.g. "user profile screen" or "feed with posts list")

## Workflow

### Phase 1: Derive Names & Read State

From `$ARGUMENTS`, derive:
- **PascalCase**: e.g. `UserProfile`
- **kebab-case**: e.g. `user-profile`
- **snake_case**: e.g. `user_profile`

```bash
cat docs/design-tokens.md 2>/dev/null || echo "No token spec yet"
ls multi-repo-nextjs/app/ 2>/dev/null
ls multi-repo-ios/multi-repo-ios/ 2>/dev/null
ls multi-repo-android/app/src/main/java/ 2>/dev/null
ls supabase/migrations/ 2>/dev/null
```

Avoid creating duplicates. Check if the route/view already exists.

### Phase 2: Scaffold Next.js (Web)

Create `multi-repo-nextjs/app/<kebab>/page.tsx` using the template at
[templates/nextjs-page.tsx.template](templates/nextjs-page.tsx.template).

Create `multi-repo-nextjs/app/<kebab>/components/<Pascal>View.tsx`:

```tsx
// <Pascal>View.tsx — presentational component
'use client'

interface <Pascal>ViewProps {
  // TODO: add props
}

export function <Pascal>View({}: <Pascal>ViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* TODO: implement <Pascal> UI */}
    </div>
  )
}
```

**Web rules:**
- Use `var(--background)`, `var(--foreground)` etc. — never hardcode hex
- Tailwind v4 utility classes only
- `@/` path alias for all internal imports
- TypeScript strict — no `any`

### Phase 3: Scaffold iOS (SwiftUI)

Create `multi-repo-ios/multi-repo-ios/<Pascal>View.swift` using
[templates/swift-view.swift.template](templates/swift-view.swift.template).

Create `multi-repo-ios/multi-repo-ios/<Pascal>ViewModel.swift`:

```swift
// <Pascal>ViewModel.swift
import Foundation

@MainActor
final class <Pascal>ViewModel: ObservableObject {
    @Published var isLoading = false
    @Published var errorMessage: String?

    func load() async {
        isLoading = true
        defer { isLoading = false }
        // TODO: wire Supabase — load data here
    }
}
```

**iOS rules:**
- `@MainActor` on all ViewModels (project has SWIFT_APPROACHABLE_CONCURRENCY enabled)
- Use `Color.app*` from `DesignTokens.swift` if it exists, otherwise use `.primary`/`.secondary` and add `// TODO: use design tokens`
- Use `CGFloat.space*` for padding/spacing
- iOS 26.2 — modern SwiftUI APIs are available

### Phase 4: Scaffold Android (Jetpack Compose)

Determine the base package by reading:
```bash
find multi-repo-android/app/src/main/java -name "*.kt" | head -5 2>/dev/null || echo "Android not found"
```

If the Android project exists, create the following files under
`multi-repo-android/app/src/main/java/<base-package>/feature/<kebab>/`:

**`<Pascal>ScreenState.kt`** — sealed state interface:
```kotlin
// <Pascal>ScreenState.kt
package <base.package>.feature.<kebab>

sealed interface <Pascal>ScreenState {
    data object Loading : <Pascal>ScreenState
    data object Empty : <Pascal>ScreenState
    data class Error(val message: String) : <Pascal>ScreenState
    data class Populated(
        // TODO: add feature-specific data fields
    ) : <Pascal>ScreenState
}
```

**`<Pascal>ViewModel.kt`** — HiltViewModel:
```kotlin
// <Pascal>ViewModel.kt
package <base.package>.feature.<kebab>

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class <Pascal>ViewModel @Inject constructor(
    // TODO: inject repositories
) : ViewModel() {

    private val _state = MutableStateFlow<<Pascal>ScreenState>(<Pascal>ScreenState.Loading)
    val state: StateFlow<<Pascal>ScreenState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _state.value = <Pascal>ScreenState.Loading
            try {
                // TODO: fetch data from repository
                _state.value = <Pascal>ScreenState.Empty
            } catch (e: Exception) {
                _state.value = <Pascal>ScreenState.Error(e.message ?: "Unknown error")
            }
        }
    }
}
```

**`<Pascal>Screen.kt`** — screen composable:
```kotlin
// <Pascal>Screen.kt
package <base.package>.feature.<kebab>

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import <base.package>.ui.components.AppProgressLoader
import <base.package>.ui.theme.SemanticColors
import <base.package>.ui.theme.Spacing
import <base.package>.ui.theme.AppTypography

// --- Screen

@Composable
fun <Pascal>Screen(
    modifier: Modifier = Modifier,
    viewModel: <Pascal>ViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsState()

    <Pascal>Content(
        state = state,
        onRetry = viewModel::load,
        modifier = modifier,
    )
}

// --- Content

@Composable
private fun <Pascal>Content(
    state: <Pascal>ScreenState,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
) {
    when (state) {
        is <Pascal>ScreenState.Loading -> {
            Box(
                modifier = modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                AppProgressLoader()
            }
        }
        is <Pascal>ScreenState.Empty -> {
            Box(
                modifier = modifier.fillMaxSize(),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "No data available yet.",
                    style = AppTypography.bodyMedium,
                    color = SemanticColors.typographySecondary,
                )
            }
        }
        is <Pascal>ScreenState.Error -> {
            Column(
                modifier = modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    text = state.message,
                    style = AppTypography.bodyMedium,
                    color = SemanticColors.typographyError,
                )
                Spacer(modifier = Modifier.height(Spacing.MD))
                // TODO: Add retry using AppButton
            }
        }
        is <Pascal>ScreenState.Populated -> {
            Column(
                modifier = modifier
                    .fillMaxSize()
                    .padding(Spacing.MD),
            ) {
                // TODO: implement <Pascal> UI with data
            }
        }
    }
}
```

Wire the new screen into the navigation graph at
`multi-repo-android/app/src/main/java/<base-package>/navigation/Screen.kt`:

```kotlin
// Add to the Screen sealed class / NavGraph:
// composable(Screen.<Pascal>.route) { <Pascal>Screen() }
// TODO: add Screen.<Pascal> object with route = "<kebab>"
```

**Android rules:**
- All colors via `SemanticColors.*` — never hardcode hex
- All spacing via `Spacing.*` (XS=4, SM=8, MD=16, LG=24, XL=32) — never hardcode dp values
- All typography via `AppTypography.*` — never hardcode font sizes
- HiltViewModel required for all data screens — inject via `hiltViewModel()`
- StateFlow for all UI state — `MutableStateFlow` in ViewModel, `collectAsState()` in composable
- WindowSizeClass for adaptive layouts: `LocalWindowSizeClass.current` for compact/medium/expanded breakpoints

If the Android project does not exist yet, skip this phase and note:
> Android project not found at `multi-repo-android/` — skipping Android phase.

### Phase 5: Supabase Migration Stub — also create Android model stub

If the feature needs data persistence, create:
`supabase/migrations/<timestamp>_create_<snake>.sql`

```sql
-- Migration: create_<snake>
-- Created: <date>
-- Feature: <Pascal>

-- UP
CREATE TABLE IF NOT EXISTS public.<snake> (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
    -- TODO: add feature-specific columns
);

ALTER TABLE public.<snake> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<snake>_owner_all" ON public.<snake>
    FOR ALL USING (auth.uid() = user_id);

-- DOWN (for reference — run manually to revert)
-- DROP TABLE IF EXISTS public.<snake>;
```

Also create the TypeScript type placeholder in `multi-repo-nextjs/lib/database.types.ts` if it doesn't exist (full type generation requires `supabase gen types typescript --linked`).

Create the Swift model at `multi-repo-ios/multi-repo-ios/Models/<Pascal>Model.swift`:

```swift
// <Pascal>Model.swift — matches Supabase public.<snake> table
import Foundation

struct <Pascal>Model: Codable, Identifiable {
    let id: String
    let userId: String
    let createdAt: Date
    let updatedAt: Date
    // TODO: add feature-specific fields

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
```

If the Android project exists and the feature needs data, also create the Kotlin model at
`multi-repo-android/app/src/main/java/<base-package>/data/model/<Pascal>Model.kt`:

```kotlin
// <Pascal>Model.kt — matches Supabase public.<snake> table
package <base.package>.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class <Pascal>Model(
    val id: String,
    @SerialName("user_id") val userId: String,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String,
    // TODO: add feature-specific fields
)
```

If no data is needed, skip this phase and note it in the summary.

### Phase 6: PRD Entry

Create `docs/PRDs/<kebab>.md` from the template at `docs/PRDs/prd-template.md`.
Fill in the feature name, today's date, the route/view paths, and the table name.

### Phase 7: Update CLAUDE.md Files

Add the new route to `multi-repo-nextjs/CLAUDE.md` under **Screens / Routes**.
Add the new view to `multi-repo-ios/CLAUDE.md` under **Screens / Views**.
Add the new screen to `multi-repo-android/CLAUDE.md` under **Screens** if the Android project exists.

### Phase 8: Summary

```
## Feature Scaffolded: <Pascal>

| Platform | Files Created |
|----------|--------------|
| Next.js  | app/<kebab>/page.tsx, app/<kebab>/components/<Pascal>View.tsx |
| iOS      | <Pascal>View.swift, <Pascal>ViewModel.swift, Models/<Pascal>Model.swift |
| Android  | feature/<kebab>/<Pascal>Screen.kt, <Pascal>ViewModel.kt, <Pascal>ScreenState.kt |
| Supabase | migrations/<timestamp>_create_<snake>.sql |
| Docs     | docs/PRDs/<kebab>.md |

TODOs remaining:
- [ ] Web: implement <Pascal>View.tsx UI
- [ ] iOS: implement <Pascal>View body
- [ ] Android: implement <Pascal>Screen populated state UI
- [ ] Android: wire Screen.<Pascal> into NavGraph in Screen.kt
- [ ] All: wire Supabase/repository client (run /supabase-setup if not done)
- [ ] Run: supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts
```

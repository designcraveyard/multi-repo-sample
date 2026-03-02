---
name: new-screen
description: Create a new screen or page on all platforms (Next.js + SwiftUI + Android Compose) from a plain-English description. UI scaffold only — no data layer. Use when user says "add a screen for X", "create a page for X", or "I need a new view for X". For full features with data, use /cross-platform-feature instead.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# New Screen Creator

Create a matching screen on both platforms from one description.

## Arguments

`$ARGUMENTS` — Screen description (e.g. "settings screen with notification toggles" or "onboarding welcome")

Supports flags:
- `--with-data` — Wire up data-fetching scaffolds (loading/error states, ViewModel on iOS, async on web)
- `--split-view` — Opt-in split-view layout (list → detail panels on desktop/iPad, push nav on mobile)
- A Figma URL — Use Figma MCP to get design context before generating code

## Workflow

### Step 1: Derive Names

From `$ARGUMENTS` (strip flags before parsing):
- **PascalCase**: e.g. `Settings`, `OnboardingWelcome`
- **kebab-case**: e.g. `settings`, `onboarding-welcome`
- **Human title**: e.g. "Settings", "Welcome"

Determine mode:
- `--with-data` flag present → **data mode** (includes loading/error/empty states)
- `--split-view` flag present → **split-view mode** (list+detail layout, adaptive per platform)
- No flag → **UI-only mode** (static scaffold)

### Step 2: Check for Duplicates

```bash
ls multi-repo-nextjs/app/
ls multi-repo-ios/multi-repo-ios/
```

If the screen already exists, report it and stop.

### Step 3: Figma Context (if URL in arguments)

If a Figma URL is present in `$ARGUMENTS`, extract the node ID and use the Figma MCP
(`get_design_context`) to get the design spec before generating code. Apply design-first.

### Step 3b: Read Design Guidelines

Read `docs/design/design-guidelines.md` for layout, spacing, typography, and component usage standards. Apply them to the scaffold — particularly page padding, section spacing, typography pairings, and button hierarchy rules.

### Step 3c: Component Selection

Read `docs/components.md` to get the full registry of available components (atomic, patterns, native wrappers).

Based on the screen description from `$ARGUMENTS`, auto-select which components the screen will need. Use this mapping as a starting guide:

| Screen Pattern | Likely Components |
|----------------|-------------------|
| List / feed screen | ListItem, Chip (filters), InputField (search), Badge, Divider |
| Detail / profile screen | Thumbnail, Label, Badge, TextBlock, Button, Divider |
| Form / settings screen | InputField, Switch, RadioButton, Checkbox, Button, Divider, ListItem |
| Dashboard / overview | Badge, Label, Tabs, DateGrid, Button |
| Editor screen | MarkdownEditor, InputField, Button, IconButton |
| Empty / onboarding | Button, Label, StepIndicator |

Also check if any wireframes exist at `docs/wireframes/<kebab>-v*.html`. If found, parse the `<!-- COMPONENT-MANIFEST ... -->` comment block or scan for `data-component` attributes to extract the exact component list the wireframe uses.

Present the selected components to the user:

> "Based on the screen description, I'll scaffold with these components:
> - **AppButton** (primary CTA + secondary actions)
> - **AppInputField** (form fields)
> - **AppListItem** (content rows)
> - ...
>
> Adjust? (yes / looks good)"

Wait for confirmation. The confirmed list becomes the **Component Import List** used in Steps 4–6 below.

**Rule:** Every UI element in the scaffold MUST use a component from the registry. If a component doesn't exist, flag it as a gap and note it for `/complex-component` creation.

### Step 4: Create Next.js Page

Create `multi-repo-nextjs/app/<kebab>/page.tsx`:

**UI-only mode:**
```tsx
// <Pascal> page — Next.js App Router
'use client'

import type { Metadata } from 'next'
// --- Component imports (from Step 3c Component Import List)
// Add imports for each confirmed component, e.g.:
// import { Button } from '@/app/components/Button'
// import { InputField } from '@/app/components/InputField'
// import { ListItem } from '@/app/components/patterns/ListItem'
// import { Divider } from '@/app/components/Divider'

export default function <Pascal>Page() {
  return (
    <main
      className="min-h-screen px-6 md:px-10 py-8 md:py-10 font-sans"
      style={{ background: 'var(--surfaces-base-default)', color: 'var(--typography-primary)' }}
    >
      <div className="mx-auto max-w-[1400px]">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 md:mb-10"><Title></h1>

        {/* --- Screen Content (using confirmed components) */}
        {/* Generate initial layout using the Component Import List.
            For each confirmed component, add a representative usage.
            Example for a settings screen:
              <div className="flex flex-col gap-6">
                <InputField label="Display Name" placeholder="Enter name..." />
                <ListItem title="Notifications" trailing={<Switch />} />
                <Divider />
                <Button variant="primary" size="lg" className="w-full">Save Changes</Button>
              </div>
        */}
      </div>
    </main>
  )
}
```

> **Important:** Replace the comment-only component examples above with **actual component instances** based on the confirmed Component Import List from Step 3c. Every visible UI element should use a registered component — no raw `<button>`, `<input>`, or `<div>` substitutes.

**Data mode** — also create:

`multi-repo-nextjs/app/<kebab>/loading.tsx`:
```tsx
import { AppProgressLoader } from '@/app/components/Native'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AppProgressLoader variant="indefinite" label="Loading..." />
    </div>
  )
}
```

`multi-repo-nextjs/app/<kebab>/error.tsx`:
```tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--typography-primary)' }}>
        Something went wrong
      </h2>
      <p style={{ color: 'var(--typography-secondary)' }}>{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg px-4 py-2"
        style={{
          background: 'var(--surfaces-brand-interactive)',
          color: 'var(--typography-on-brand)',
        }}
      >
        Try again
      </button>
    </div>
  )
}
```

And update `page.tsx` to use async data fetching pattern:
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '<Title>',
}

// TODO: Replace with actual data fetching
async function get<Pascal>Data() {
  return null
}

export default async function <Pascal>Page() {
  const data = await get<Pascal>Data()

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p style={{ color: 'var(--typography-secondary)' }}>No data available yet.</p>
      </main>
    )
  }

  return (
    <main
      className="min-h-screen px-6 md:px-10 py-8 md:py-10 font-sans"
      style={{ background: 'var(--surfaces-base-default)', color: 'var(--typography-primary)' }}
    >
      <div className="mx-auto max-w-[1400px]">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-8 md:mb-10"><Title></h1>
        {/* TODO: implement <Pascal> UI with data */}
      </div>
    </main>
  )
}
```

### Step 5: Create SwiftUI View

**UI-only mode** — Create `multi-repo-ios/multi-repo-ios/Views/<Pascal>View.swift`:

```swift
//  <Pascal>View.swift
import SwiftUI
// --- Component imports (from Step 3c Component Import List)
// Add imports are automatic in Swift (same module), but add usage of confirmed components below

struct <Pascal>View: View {
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: CGFloat.spaceLG) {
                // --- Screen Content (using confirmed components)
                // Generate initial layout using the Component Import List.
                // For each confirmed component, add a representative usage.
                // Example for a settings screen:
                //   AppListItem(title: "Notifications", trailing: { AppSwitch(isOn: .constant(true)) })
                //   AppDivider()
                //   AppButton("Save Changes", variant: .primary, size: .lg) { }
            }
            .padding(.horizontal, CGFloat.spaceLG)
            .padding(.vertical, CGFloat.spaceXL)
            .frame(maxWidth: sizeClass == .regular ? 1400 : .infinity)
        }
        .appPageHeader(title: "<Title>")
    }
}

#Preview {
    <Pascal>View()
}
```

> **Important:** Replace the comment-only component examples above with **actual component instances** based on the confirmed Component Import List from Step 3c. iOS components are in the same module — no import needed, just use `AppButton`, `AppListItem`, etc. directly.

> **Note:** Do NOT wrap in `NavigationStack` — the parent `AdaptiveNavShell` provides navigation context. Use `sizeClass == .regular` for wider layouts on iPad landscape / macOS.

**Data mode** — also create `multi-repo-ios/multi-repo-ios/ViewModels/<Pascal>ViewModel.swift`:

```swift
//  <Pascal>ViewModel.swift
import SwiftUI

@Observable
final class <Pascal>ViewModel {
    // MARK: - State
    var isLoading = false
    var error: Error?
    // TODO: Add data properties

    // MARK: - Loading
    func load() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // TODO: Fetch data from Supabase
        } catch {
            self.error = error
        }
    }
}
```

And update the View to use the ViewModel:
```swift
//  <Pascal>View.swift
import SwiftUI

struct <Pascal>View: View {
    @State private var viewModel = <Pascal>ViewModel()
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        Group {
            if viewModel.isLoading {
                AppProgressLoader(variant: .indefinite, label: "Loading...")
            } else if let error = viewModel.error {
                VStack(spacing: CGFloat.spaceMD) {
                    Text("Something went wrong")
                        .font(.headline)
                    Text(error.localizedDescription)
                        .foregroundStyle(Color.typographySecondary)
                    // TODO: Add retry button using AppButton
                }
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: CGFloat.spaceMD) {
                        // TODO: implement <Pascal> UI with data
                        // Use `sizeClass == .regular` for wider layouts on iPad/desktop
                        Text("No data available yet.")
                            .foregroundStyle(Color.typographySecondary)
                    }
                    .padding(CGFloat.spaceMD)
                    .frame(maxWidth: sizeClass == .regular ? 720 : .infinity)
                }
            }
        }
        .appPageHeader(title: "<Title>")
        .task {
            await viewModel.load()
        }
    }
}

#Preview {
    <Pascal>View()
}
```

> **Note:** Do NOT wrap in `NavigationStack` — the parent `AdaptiveNavShell` provides navigation context.

### Step 6: Create Android Compose Screen

Check if the Android project exists:
```bash
find multi-repo-android/app/src/main/java -name "*.kt" | head -3 2>/dev/null || echo "Android not found"
```

If the Android project exists, create
`multi-repo-android/app/src/main/java/<base-package>/feature/<kebab>/<Pascal>Screen.kt`:

**UI-only mode:**
```kotlin
// <Pascal>Screen.kt
package <base.package>.feature.<kebab>

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import <base.package>.ui.components.adaptive.AdaptiveNavShell
import <base.package>.ui.theme.SemanticColors
import <base.package>.ui.theme.Spacing
import <base.package>.ui.theme.AppTypography
// --- Component imports (from Step 3c Component Import List)
// Add imports for each confirmed component, e.g.:
// import <base.package>.ui.components.AppButton
// import <base.package>.ui.components.AppInputField
// import <base.package>.ui.patterns.AppListItem

// responsive: WindowSizeClass via LocalWindowSizeClass.current
// Compact = phone portrait; Medium/Expanded = tablet/foldable landscape

// --- Screen

@Composable
fun <Pascal>Screen(
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(Spacing.MD),
    ) {
        Text(
            text = "<Title>",
            style = AppTypography.titleLarge,
            color = SemanticColors.typographyPrimary,
        )
        Spacer(modifier = Modifier.height(Spacing.MD))

        // --- Screen Content (using confirmed components)
        // Generate initial layout using the Component Import List.
        // For each confirmed component, add a representative usage.
        // Example for a settings screen:
        //   AppListItem(title = "Notifications", trailing = { AppSwitch(...) })
        //   AppDivider()
        //   AppButton(text = "Save Changes", variant = ButtonVariant.Primary, size = ButtonSize.Lg)
    }
}
```

> **Important:** Replace the comment-only component examples above with **actual component instances** based on the confirmed Component Import List from Step 3c.

**Data mode** — add a `<Pascal>ViewModel.kt` and wire the four states (see `/cross-platform-feature` for the full HiltViewModel + ScreenState template).

Wire the new screen into the navigation graph at
`multi-repo-android/app/src/main/java/<base-package>/navigation/Screen.kt`:
- Add `Screen.<Pascal>` object with route = `"<kebab>"`
- Add `composable(Screen.<Pascal>.route) { <Pascal>Screen() }` in the NavGraph builder
- Add a tab/rail entry in `AdaptiveNavShell` if the screen is a top-level destination

**Android rules:**
- All colors via `SemanticColors.*` — never hardcode hex
- All spacing via `Spacing.*` (XS=4dp, SM=8dp, MD=16dp, LG=24dp, XL=32dp)
- All typography via `AppTypography.*` — never hardcode font sizes
- Use `AdaptiveNavShell` / `AdaptiveSheet` wrappers — never raw `Scaffold`, `BottomNavigation`, or `ModalBottomSheet` in screen files
- Use `LocalWindowSizeClass.current` for compact/expanded layout branching

If the Android project does not exist, skip and note it in the report.

### Step 7: Update Navigation

**iOS:** Read `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveNavShell.swift` (or `ContentView.swift` if AdaptiveNavShell doesn't exist yet).
Add a tab or navigation entry for the new screen. If using AdaptiveNavShell, add a `NavDestination` entry.
If not wired yet, add: `// TODO: add navigation entry for <Pascal>View`

**Web:** Ensure the route is linked from the sidebar/bottom navigation in `AdaptiveNavShell` (or `layout.tsx` if the shell doesn't exist yet).

**Android:** Wire into the NavGraph and `AdaptiveNavShell` as described in Step 6.

### Step 8: Update CLAUDE.md Files

Add the new route to `multi-repo-nextjs/CLAUDE.md` under **Screens / Routes**.
Add the new view to `multi-repo-ios/CLAUDE.md` under **Screens / Views**.
Add the new screen to `multi-repo-android/CLAUDE.md` under **Screens** if the Android project exists.

### Step 9: Report

```
## Screen Created: <Pascal>

| Platform | File | Mode |
|----------|------|------|
| Next.js  | app/<kebab>/page.tsx | [UI-only / Data] |
| Next.js  | app/<kebab>/loading.tsx | [created / N/A] |
| Next.js  | app/<kebab>/error.tsx | [created / N/A] |
| iOS      | Views/<Pascal>View.swift | [UI-only / Data] |
| iOS      | ViewModels/<Pascal>ViewModel.swift | [created / N/A] |
| Android  | feature/<kebab>/<Pascal>Screen.kt | [UI-only / Data] |

Navigation: [updated AdaptiveNavShell on all platforms / TODO noted]
Responsive: [horizontalSizeClass on iOS / md: classes on web / WindowSizeClass on Android]

### Components Used
[List the Component Import List from Step 3c — e.g. AppButton, AppListItem, AppSwitch, AppDivider]

### Next Steps
- [If data mode] Wire data fetching to Supabase/repository layer
- [If split-view] Wrap in `AdaptiveSplitView` for list→detail layout
- Flesh out component instances with real props and data bindings
- Test both compact and regular size classes on all platforms
- Run `screen-reviewer` agent before marking complete
- Run `/prd-update` to keep docs current
```

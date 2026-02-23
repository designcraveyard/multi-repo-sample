---
name: new-screen
description: Create a new screen or page on both platforms (Next.js + SwiftUI) from a plain-English description. UI scaffold only — no data layer. Use when user says "add a screen for X", "create a page for X", or "I need a new view for X". For full features with data, use /cross-platform-feature instead.
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

### Step 4: Create Next.js Page

Create `multi-repo-nextjs/app/<kebab>/page.tsx`:

**UI-only mode:**
```tsx
// <Pascal> page — Next.js App Router
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '<Title>',
}

export default function <Pascal>Page() {
  return (
    <main
      className="min-h-screen p-4 md:p-8 font-sans"
      style={{ background: 'var(--surfaces-base-default)', color: 'var(--typography-primary)' }}
    >
      <div className="mx-auto max-w-4xl md:max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 md:mb-6"><Title></h1>
        {/* TODO: implement <Pascal> UI */}
      </div>
    </main>
  )
}
```

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
      className="min-h-screen p-4 md:p-8 font-sans"
      style={{ background: 'var(--surfaces-base-default)', color: 'var(--typography-primary)' }}
    >
      <div className="mx-auto max-w-4xl md:max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 md:mb-6"><Title></h1>
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

struct <Pascal>View: View {
    @Environment(\.horizontalSizeClass) private var sizeClass

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: CGFloat.spaceMD) {
                // TODO: implement <Pascal> UI
                // Use `sizeClass == .regular` to show wider layouts on iPad/desktop
                Text("Content goes here")
                    .foregroundStyle(.secondary)
            }
            .padding(CGFloat.spaceMD)
            .frame(maxWidth: sizeClass == .regular ? 720 : .infinity)
        }
        .appPageHeader(title: "<Title>")
    }
}

#Preview {
    <Pascal>View()
}
```

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

### Step 6: Update Navigation

**iOS:** Read `multi-repo-ios/multi-repo-ios/Components/Adaptive/AdaptiveNavShell.swift` (or `ContentView.swift` if AdaptiveNavShell doesn't exist yet).
Add a tab or navigation entry for the new screen. If using AdaptiveNavShell, add a `NavDestination` entry.
If not wired yet, add: `// TODO: add navigation entry for <Pascal>View`

**Web:** Ensure the route is linked from the sidebar/bottom navigation in `AdaptiveNavShell` (or `layout.tsx` if the shell doesn't exist yet).

### Step 7: Update CLAUDE.md Files

Add the new route to `multi-repo-nextjs/CLAUDE.md` under **Screens / Routes**.
Add the new view to `multi-repo-ios/CLAUDE.md` under **Screens / Views**.

### Step 8: Report

```
## Screen Created: <Pascal>

| Platform | File | Mode |
|----------|------|------|
| Next.js  | app/<kebab>/page.tsx | [UI-only / Data] |
| Next.js  | app/<kebab>/loading.tsx | [created / N/A] |
| Next.js  | app/<kebab>/error.tsx | [created / N/A] |
| iOS      | Views/<Pascal>View.swift | [UI-only / Data] |
| iOS      | ViewModels/<Pascal>ViewModel.swift | [created / N/A] |

Navigation: [updated AdaptiveNavShell / TODO noted]
Responsive: [horizontalSizeClass on iOS / md: classes on web]

### Next Steps
- Implement UI using components from `docs/components.md`
- [If data mode] Wire data fetching to Supabase
- [If split-view] Wrap in `AdaptiveSplitView` for list→detail layout
- Test both compact and regular size classes
- Run `screen-reviewer` agent before marking complete
- Run `/prd-update` to keep docs current
```

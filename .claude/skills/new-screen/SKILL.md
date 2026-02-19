---
name: new-screen
description: Create a new screen or page on both platforms (Next.js + SwiftUI) from a plain-English description. UI scaffold only — no data layer. Use when user says "add a screen for X", "create a page for X", or "I need a new view for X". For full features with data, use /cross-platform-feature instead.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# New Screen Creator

Create a matching screen on both platforms from one description.

## Arguments

`$ARGUMENTS` — Screen description (e.g. "settings screen with notification toggles" or "onboarding welcome")

## Workflow

### Step 1: Derive Names

From `$ARGUMENTS`:
- **PascalCase**: e.g. `Settings`, `OnboardingWelcome`
- **kebab-case**: e.g. `settings`, `onboarding-welcome`
- **Human title**: e.g. "Settings", "Welcome"

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

```tsx
// <Pascal> page — Next.js App Router
export const metadata = { title: '<Title>' }

export default function <Pascal>Page() {
  return (
    <main
      className="min-h-screen p-8 font-sans"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight mb-6"><Title></h1>
        {/* TODO: implement <Pascal> UI */}
      </div>
    </main>
  )
}
```

### Step 5: Create SwiftUI View

Create `multi-repo-ios/multi-repo-ios/<Pascal>View.swift`:

```swift
//  <Pascal>View.swift
import SwiftUI

struct <Pascal>View: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: CGFloat.spaceMD) {
                    // TODO: implement <Pascal> UI
                    Text("Content goes here")
                        .foregroundStyle(.secondary)
                }
                .padding(CGFloat.spaceMD)
            }
            .navigationTitle("<Title>")
        }
    }
}

#Preview {
    <Pascal>View()
}
```

### Step 6: Update iOS Navigation

Read `multi-repo-ios/multi-repo-ios/ContentView.swift`.
If it has a `NavigationStack` or `TabView`, add a `NavigationLink` entry for the new screen.
If not, add a comment noting where to add navigation:
`// TODO: add NavigationLink to <Pascal>View`

### Step 7: Update CLAUDE.md Files

Add the new route to `multi-repo-nextjs/CLAUDE.md` under **Screens / Routes**.
Add the new view to `multi-repo-ios/CLAUDE.md` under **Screens / Views**.

### Step 8: Report

```
## Screen Created: <Pascal>

| Platform | File |
|----------|------|
| Next.js  | app/<kebab>/page.tsx |
| iOS      | <Pascal>View.swift |

Navigation: [updated ContentView / TODO noted]
```

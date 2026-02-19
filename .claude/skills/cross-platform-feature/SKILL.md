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

### Phase 4: Supabase Migration Stub

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

If no data is needed, skip this phase and note it in the summary.

### Phase 5: PRD Entry

Create `docs/PRDs/<kebab>.md` from the template at `docs/PRDs/prd-template.md`.
Fill in the feature name, today's date, the route/view paths, and the table name.

### Phase 6: Update CLAUDE.md Files

Add the new route to `multi-repo-nextjs/CLAUDE.md` under **Screens / Routes**.
Add the new view to `multi-repo-ios/CLAUDE.md` under **Screens / Views**.

### Phase 7: Summary

```
## Feature Scaffolded: <Pascal>

| Platform | Files Created |
|----------|--------------|
| Next.js  | app/<kebab>/page.tsx, app/<kebab>/components/<Pascal>View.tsx |
| iOS      | <Pascal>View.swift, <Pascal>ViewModel.swift, Models/<Pascal>Model.swift |
| Supabase | migrations/<timestamp>_create_<snake>.sql |
| Docs     | docs/PRDs/<kebab>.md |

TODOs remaining:
- [ ] Web: implement <Pascal>View.tsx UI
- [ ] iOS: implement <Pascal>View body
- [ ] Both: wire Supabase client (run /supabase-setup if not done)
- [ ] Run: supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts
```

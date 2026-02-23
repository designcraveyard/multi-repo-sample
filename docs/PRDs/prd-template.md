# PRD: [Feature Name]

## Status

- [ ] Planned
- [ ] In Progress
- [ ] Done

**Created:** [date]
**Last Updated:** [date]

---

## Summary

One paragraph describing what this feature does and why it exists.

---

## User Stories

- As a [user type], I want to [action] so that [outcome].

---

## Cross-Platform Scope

| Platform | File(s) | Status |
|----------|---------|--------|
| Next.js (Web) | `app/[route]/page.tsx` | [ ] |
| iOS (SwiftUI) | `[FeatureName]View.swift` | [ ] |
| Android (Compose) | `[FeatureName]Screen.kt` | [ ] |

_Mark as single-platform if intentional (e.g. web-only, iOS-only, Android-only)._

---

## Data Model

Supabase table(s) involved:

```sql
-- table name, columns, RLS policies
```

TypeScript type: `multi-repo-nextjs/lib/database.types.ts` → `Database['public']['Tables']['table_name']`
Swift model: `multi-repo-ios/multi-repo-ios/Models/[FeatureName]Model.swift`
Kotlin model: `multi-repo-android/app/src/main/java/.../data/model/[FeatureName]Model.kt`

---

## Design Tokens Used

_List which tokens from `docs/design-tokens.md` this feature uses._

---

## Open Questions

- [ ] Question 1

---

## Notes

_Implementation decisions, constraints, or tradeoffs._

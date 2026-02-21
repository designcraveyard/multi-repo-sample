---
name: complex-component
description: >
  Build a complex UI component or pattern that composes multiple atomic components.
  Unlike atomic components, Figma is used for visual reference only — the implementation
  structure, state ownership, and interaction model must be designed and confirmed with the
  user before any code is written. Always runs an interactive clarification phase first.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Complex Component Builder: $ARGUMENTS

You are building **$ARGUMENTS**, a complex component that composes multiple atomic components
from the design system.

> **Rule:** Do not write any code until the user approves the proposed design in Phase 2.
> Figma is visual reference only — do not derive component tree or state ownership from Figma layers.

## Workspace Paths

- Atomic components (web): `multi-repo-nextjs/app/components/`
- Atomic components (iOS): `multi-repo-ios/multi-repo-ios/Components/`
- Complex components (web): `multi-repo-nextjs/app/components/$ARGUMENTS/$ARGUMENTS.tsx`
- Complex components (iOS): `multi-repo-ios/multi-repo-ios/Components/$ARGUMENTS/App$ARGUMENTS.swift`
- Component registry: `docs/components.md`

---

## Phase 1: Clarification (ALWAYS run — never skip)

Before writing any code, read `docs/components.md` to understand what atomic components are available.
Then ask the user **all** of the following questions in a **single message**, grouped clearly:

---

### Questions to ask

**Composition & Structure**
1. Which atomic components does `$ARGUMENTS` compose? (e.g. Button, InputField, Badge, Thumbnail, Tabs — check `docs/components.md` for the full list)
2. Is there a Figma node to reference visually? If yes, which node ID or frame name?
3. What are the **top-level props** this component exposes to consumers? (What does a caller configure?)
4. Are there any **slot/children** patterns — content passed in by the parent?

**State & Interactions**
5. Who **owns state** — does `$ARGUMENTS` manage its own internal state, or is it fully controlled (props-in, events-out)?
6. What **interactive states** exist? (loading, empty, error, disabled, selected, expanded, etc.)
7. Are there **animations or transitions**? Describe what triggers them and what they look like.
8. What **keyboard interactions** are required? (Tab order, Enter/Space to activate, Escape to close, arrow keys, etc.)

**Cross-Platform**
9. Does this component behave **differently on iOS vs web**? If yes, describe the differences.
10. Are there **iOS-specific gestures** needed? (swipe to dismiss, long-press, drag, etc.)

**Accessibility**
11. What is the **accessible role** of this component? (button, dialog, list, listitem, etc.)
12. Are there **focus management** requirements? (focus trap, return focus on close, live regions, etc.)

---

## Phase 2: Design Proposal

After receiving the user's answers, produce a design proposal. Do NOT write code yet.

Output in this format:

```
## Design Proposal: $ARGUMENTS

### Props Interface
\`\`\`typescript
interface $ARGUMENTSProps {
  // document each prop with a comment explaining its purpose
}
\`\`\`

### State (if internally stateful)
- What state variables exist and who owns them
- What triggers state changes

### Component Tree
$ARGUMENTS
├── [AtomicComponent] — role/purpose here
│   └── [NestedAtom] — role/purpose here
└── [AtomicComponent] — role/purpose here

### Figma Reference
- Node: [nodeId if provided]
- What matches: [list visual properties from Figma that are used]
- What diverges: [list where implementation structure differs from Figma layers]

### Interaction Model
- [trigger] → [effect]
- [trigger] → [effect]

### Platform Differences
- Web: [any web-specific behavior]
- iOS: [any iOS-specific behavior]
```

Then ask: **"Does this design look right before I write the code?"**

Wait for explicit approval before proceeding to Phase 3.

---

## Phase 3: Implementation

Only after the user approves the design in Phase 2.

### Web (Next.js)

Create `multi-repo-nextjs/app/components/$ARGUMENTS/$ARGUMENTS.tsx`:

```tsx
/**
 * $ARGUMENTS — [one-line description from the approved design].
 *
 * [Key props and their purpose — reference the approved Props Interface]
 * [State ownership note if applicable]
 */

// --- Props

// --- State (omit section if fully controlled)

// --- Helpers / Derived values (omit if none)

// --- Render
```

Rules:
- Import atomic components from `@/app/components/[AtomName]`
- All colors via semantic tokens only (`var(--surfaces-*)`, `var(--typography-*)`, `var(--icons-*)`, `var(--border-*)`)
- The `design-token-guard` hook will block primitive tokens (`var(--color-*)`) at write time
- Disabled state: `opacity-50` on the container, never separate disabled tokens

Create `multi-repo-nextjs/app/components/$ARGUMENTS/index.ts`:
```ts
export { $ARGUMENTS } from './$ARGUMENTS';
export type { $ARGUMENTSProps } from './$ARGUMENTS';  // if types are exported
```

### iOS (SwiftUI)

Create `multi-repo-ios/multi-repo-ios/Components/$ARGUMENTS/App$ARGUMENTS.swift`:

```swift
// MARK: - App$ARGUMENTS
// [One-line description from the approved design]
// Key props: [list main props]
// State ownership: [who owns what]

// MARK: - Properties

// MARK: - Body

// MARK: - Subviews (if needed)

// MARK: - Helpers (if needed)
```

Rules:
- Prefix with `App` to avoid SwiftUI naming conflicts
- All colors via `Color.surfaces*`, `Color.typography*`, `Color.icons*`, `Color.border*`
- Disabled: `.opacity(isDisabled ? 0.5 : 1.0)` + `.allowsHitTesting(!isDisabled)`
- Add `// MARK: -` section headers for all major sections

---

## Phase 4: Registry & Documentation

After writing both platform implementations:

1. **Update `docs/components.md`** — add a row in the Complex Components table:
   ```
   | N | $ARGUMENTS | [figma node if any] | [atoms used] | `app/components/$ARGUMENTS/$ARGUMENTS.tsx` | `Components/$ARGUMENTS/App$ARGUMENTS.swift` | In Progress |
   ```

2. **Check for new patterns** — if this component introduced a new interaction pattern (e.g. a new dismiss mechanism, a new focus management approach), add a note to CLAUDE.md under "Component System".

3. **Run `/component-audit $ARGUMENTS`** to validate token compliance, comment quality, and parity before marking Done.

4. **Update registry status to Done** only after the audit passes.

---
name: complex-component
description: >
  Build a complex UI component or pattern that composes multiple atomic components.
  Unlike atomic components, Figma is used for visual reference only — the implementation
  structure, state ownership, and interaction model must be designed and confirmed with the
  user before any code is written. Always runs an interactive clarification phase first.
  Use --pattern flag for simpler display-only patterns with a shorter clarification flow.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Complex Component Builder: $ARGUMENTS

You are building **$ARGUMENTS**, a complex component that composes multiple atomic components
from the design system.

> **Rule:** Do not write any code until the user approves the proposed design in Phase 2.
> Figma is visual reference only — do not derive component tree or state ownership from Figma layers.

## Mode Detection

Check if `$ARGUMENTS` contains the `--pattern` flag:
- **`--pattern`** → Pattern mode: shorter clarification, for display-only or minimally-interactive patterns (e.g. DateComponent, StreakChecks, Waveform). Strip the flag from the component name.
- **No flag** → Full mode: complete 12-question clarification for interactive complex components.

Also check if `docs/components/<name>.md` exists — if so, pre-populate answers from it and only ask what's missing.

## Workspace Paths

- Atomic components (web): `multi-repo-nextjs/app/components/`
- Atomic components (iOS): `multi-repo-ios/multi-repo-ios/Components/`
- Atomic components (Android): `multi-repo-android/app/src/main/java/.../ui/components/`
- Pattern components (web): `multi-repo-nextjs/app/components/patterns/$ARGUMENTS/$ARGUMENTS.tsx`
- Pattern components (iOS): `multi-repo-ios/multi-repo-ios/Components/Patterns/App$ARGUMENTS.swift`
- Pattern components (Android): `multi-repo-android/app/src/main/java/.../ui/patterns/App$ARGUMENTS.kt`
- Complex components (web): `multi-repo-nextjs/app/components/$ARGUMENTS/$ARGUMENTS.tsx`
- Complex components (iOS): `multi-repo-ios/multi-repo-ios/Components/$ARGUMENTS/App$ARGUMENTS.swift`
- Complex components (Android): `multi-repo-android/app/src/main/java/.../ui/components/App$ARGUMENTS.kt`
- Component registry: `docs/components.md`
- Per-component briefs: `docs/components/<name>.md`

---

## Phase 1: Clarification

Before writing any code, read `docs/components.md` and `docs/components/<name>.md` (if exists)
to understand context and pre-fill answers.

### Pattern Mode (`--pattern`)

Ask only these 5 questions (skip if already answered in the component brief):

**Composition**
1. Which atomic components does it compose? (or is it standalone with custom rendering?)
2. Figma node ID for visual reference?
3. What props does it expose?

**Behavior**
4. Is it display-only or does it have interaction? If interactive, what triggers what?
5. Any platform differences between web, iOS, and Android?

### Full Mode (default)

Ask the user **all** of the following questions in a **single message**, grouped clearly:

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
9. Does this component behave **differently on iOS, Android, or web**? If yes, describe the differences.
10. Are there **platform-specific gestures** needed? (iOS: swipe to dismiss, long-press; Android: predictive back, ripple effects, etc.)

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
- Android: [any Android-specific behavior — ripple effects, predictive back, etc.]
```

Then ask: **"Does this design look right before I write the code?"**

Wait for explicit approval before proceeding to Phase 3.

---

## Phase 3: Implementation

Only after the user approves the design in Phase 2.

### File paths

- **Pattern mode**: web → `app/components/patterns/$ARGUMENTS/$ARGUMENTS.tsx`, iOS → `Components/Patterns/App$ARGUMENTS.swift`, Android → `ui/patterns/App$ARGUMENTS.kt`
- **Full mode**: web → `app/components/$ARGUMENTS/$ARGUMENTS.tsx`, iOS → `Components/$ARGUMENTS/App$ARGUMENTS.swift`, Android → `ui/components/App$ARGUMENTS.kt`

### Web (Next.js)

Create the web file at the appropriate path (pattern or full mode):

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

### Android (Jetpack Compose)

Determine the base package by reading existing `.kt` files:
```bash
find multi-repo-android/app/src/main/java -name "App*.kt" -path "*/ui/components/*" | head -3 2>/dev/null
```

Create the Android file at the appropriate path (pattern or full mode):

```kotlin
/**
 * App$ARGUMENTS — [one-line description from the approved design].
 *
 * [Key parameters and their purpose]
 * [State ownership note if applicable]
 */
package <base.package>.ui.components  // or ui.patterns for pattern mode

// --- Props (parameters)

// --- State (omit if fully controlled)

// --- Helpers / Derived values (omit if none)

// --- Render

@Composable
fun App$ARGUMENTS(
    // parameters matching the approved Props Interface
    modifier: Modifier = Modifier,
) {
    // implementation
}
```

Rules:
- Prefix with `App` to avoid Compose naming conflicts
- Import atomic components from `<base.package>.ui.components.*`
- All colors via `SemanticColors.*` — never hardcode hex or use `PrimitiveColors.*`
- All spacing via `Spacing.*` (XS=4dp, SM=8dp, MD=16dp, LG=24dp, XL=32dp) — never hardcode `N.dp`
- All typography via `AppTypography.*` — never hardcode font sizes
- Disabled: `Modifier.alpha(0.5f)` + `enabled = false` / `clickable(enabled = false)`
- Add `// --- Section` headers for all major sections
- The `design-token-guard` hook will block `PrimitiveColors.*` at write time

---

## Phase 4: Registry & Documentation

After writing all three platform implementations:

1. **Update `docs/components.md`** — add a row in the Complex Components table:
   ```
   | N | $ARGUMENTS | [figma node if any] | [atoms used] | `app/components/$ARGUMENTS/$ARGUMENTS.tsx` | `Components/$ARGUMENTS/App$ARGUMENTS.swift` | `ui/components/App$ARGUMENTS.kt` | In Progress |
   ```

2. **Check for new patterns** — if this component introduced a new interaction pattern (e.g. a new dismiss mechanism, a new focus management approach), add a note to CLAUDE.md under "Component System".

3. **Run `/component-audit $ARGUMENTS`** to validate token compliance, comment quality, and parity before marking Done.

4. **Update registry status to Done** only after the audit passes.

---

## Phase 5: Push to Figma (optional)

If `figma-cli/` exists at the workspace root and Figma Desktop is open, offer to create the component in Figma:

### 5a. Render the component frame

Build a visual representation matching the approved design from Phase 2:

```bash
node figma-cli/src/index.js connect
node figma-cli/src/index.js render '<Frame name="$ARGUMENTS" w={320} h={auto} bg="#18181b" rounded={12} flex="col" p={24} gap={12}>
  <!-- Render each variant state as a labeled section -->
  <Text size={14} weight="bold" color="#a1a1aa">Default</Text>
  <!-- ... child atoms rendered as approximate visual frames ... -->
</Frame>'
```

For multiple variants, use `render-batch` to create all states side by side.

### 5b. Convert to Figma component

```bash
node figma-cli/src/index.js node to-component "<returned-node-id>"
```

### 5c. Bind design tokens

If the component uses semantic token colors, bind them to Figma variables:

```bash
node figma-cli/src/index.js bind fill "surfaces/brand-interactive" -n "<node-id>"
```

### 5d. Update registry

Add the new Figma node ID to `docs/components.md` for the component row.

> Skip this phase if Figma Desktop is not running or the user declines. Note the skip in the output.

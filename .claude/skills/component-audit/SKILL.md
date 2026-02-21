---
name: component-audit
description: >
  Audit a single component for design token compliance, comment quality, cross-platform
  parity, and accessibility completeness. Run before marking any component as "Done"
  in docs/components.md. Works for both atomic and complex components. Fixes issues
  found, then reports final status.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Component Audit: $ARGUMENTS

Audit the component `$ARGUMENTS` across both platforms. Read all relevant files first,
run every check, fix issues found, then produce a final report.

## Files to Read

```
multi-repo-nextjs/app/components/$ARGUMENTS/$ARGUMENTS.tsx
multi-repo-nextjs/app/components/$ARGUMENTS/index.ts
multi-repo-ios/multi-repo-ios/Components/$ARGUMENTS/App$ARGUMENTS.swift
docs/components.md  (check the registry entry)
```

If any file does not exist, flag it as a critical issue immediately.

---

## Checklist

### 1. Token Compliance

**Web:**
- [ ] No `var(--color-*)` primitive tokens in `.tsx` — only semantic `var(--surfaces-*)`, `var(--typography-*)`, `var(--icons-*)`, `var(--border-*)` etc.
- [ ] No hardcoded hex values (e.g. `#1a2b3c`, `rgb(...)`)
- [ ] No raw Tailwind color classes like `bg-zinc-950`, `text-slate-100` (must use `bg-[var(--surfaces-*)]` form)

**iOS:**
- [ ] No `Color.color*` primitive tokens — only `Color.surfaces*`, `Color.typography*`, `Color.icons*`, `Color.border*`
- [ ] No hardcoded hex values in `.swift` files
- [ ] No raw SwiftUI color names like `.black`, `.white`, `.gray` (use semantic tokens)

> If violations found: fix them before continuing the audit.

### 2. Comment Quality

Determine component type: **atomic** (<80 lines, no child component imports) or **complex** (2+ atom imports, or >80 lines).

**Atomic — minimum required:**
- [ ] Web: Exported component has a JSDoc comment (at least one line describing purpose)
- [ ] iOS: Component has a header comment (`// MARK: - ComponentName` + purpose line)

**Complex — full section headers required:**
- [ ] Web: Has `// --- Props` section header
- [ ] Web: Has `// --- Render` section header (and `// --- State`, `// --- Helpers` if applicable)
- [ ] Web: Exported component has JSDoc comment explaining purpose, key props, and state ownership
- [ ] iOS: Has `// MARK: - Properties` section header
- [ ] iOS: Has `// MARK: - Body` section header
- [ ] iOS: Has `// MARK: - Subviews` if subview helpers exist
- [ ] Complex logic (non-obvious conditionals, transforms, calculations) has inline explanation comments

> If comment gaps found: add the missing comments before continuing.

### 3. Cross-Platform Parity

- [ ] Both platforms expose **equivalent props** (same names where feasible, same semantics)
- [ ] All **interactive states** (loading, error, empty, disabled, selected) present on both platforms
- [ ] Disabled state implementation is consistent: `opacity-50` web / `.opacity(0.5)` iOS — never separate disabled tokens
- [ ] If component has an `onAction`/callback — both platforms emit equivalent events
- [ ] Platform-specific differences (gestures, navigation patterns) are intentional and documented in a comment

### 4. Accessibility

**Web:**
- [ ] Correct ARIA role applied (or semantic HTML element used)
- [ ] `aria-disabled` used for disabled state (not just HTML `disabled` attribute)
- [ ] Interactive elements have accessible labels (`aria-label` or visible text)
- [ ] Focus ring visible on keyboard focus (`focus-visible:ring-*` or equivalent)
- [ ] If modal/overlay: focus trap implemented, Escape closes it

**iOS:**
- [ ] VoiceOver label set (`.accessibilityLabel(...)`)
- [ ] Correct `.accessibilityRole(...)` applied
- [ ] `.accessibilityElement(children: .combine)` used where appropriate to avoid reading inner elements separately
- [ ] If interactive: `.accessibilityAddTraits(.isButton)` or equivalent

### 5. Registry Entry in docs/components.md

- [ ] Row exists for `$ARGUMENTS` in the correct table (Atomic or Complex)
- [ ] Figma node ID is listed (or noted as "no Figma node" for complex patterns)
- [ ] Both web and iOS file paths are listed and accurate
- [ ] Status reflects current reality (not "Done" if issues remain)

---

## Output Format

After running all checks and fixing any issues found, produce this report:

```
## Audit Report: $ARGUMENTS

### Type
[Atomic | Complex] — [line count] lines (web), [line count] lines (iOS)

### ✅ Checks Passed
- [list every passing check concisely]

### 🔧 Issues Fixed
- [issue]: [what was fixed and where]

### ❌ Remaining Issues (require user input or design decision)
- [issue]: [why it can't be auto-fixed, what decision is needed]

### Registry Status
- docs/components.md entry: [correct | updated | missing]
- Recommended status: [Not started | In Progress | Needs Audit | Done]

### Summary
[One sentence: "All checks passed — ready to mark Done." or "N issues fixed, M require attention."]
```

Set the registry Status to **Done** only if all checks pass and no remaining issues exist.

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

Audit the component `$ARGUMENTS` across all three platforms. Read all relevant files first,
run every check, fix issues found, then produce a final report.

## Files to Read

```
multi-repo-nextjs/app/components/$ARGUMENTS/$ARGUMENTS.tsx
multi-repo-nextjs/app/components/$ARGUMENTS/index.ts
multi-repo-ios/multi-repo-ios/Components/$ARGUMENTS/App$ARGUMENTS.swift
multi-repo-android/app/src/main/java/.../ui/components/App$ARGUMENTS.kt
docs/components.md  (check the registry entry)
```

For patterns, also check:
```
multi-repo-nextjs/app/components/patterns/$ARGUMENTS/$ARGUMENTS.tsx
multi-repo-ios/multi-repo-ios/Components/Patterns/App$ARGUMENTS.swift
multi-repo-android/app/src/main/java/.../ui/patterns/App$ARGUMENTS.kt
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

**Android:**
- [ ] No `PrimitiveColors.*` in component `.kt` files — only `SemanticColors.*`
- [ ] No hardcoded `Color(0xFF...)` literals
- [ ] No raw hardcoded `N.dp` or `N.sp` values — use `Spacing.*` and `AppTypography.*`
- [ ] No raw Material color names like `Color.Black`, `Color.White`, `Color.Red`

> If violations found: fix them before continuing the audit.

### 2. Comment Quality

Determine component type: **atomic** (<80 lines, no child component imports) or **complex** (2+ atom imports, or >80 lines).

**Atomic — minimum required:**
- [ ] Web: Exported component has a JSDoc comment (at least one line describing purpose)
- [ ] iOS: Component has a header comment (`// MARK: - ComponentName` + purpose line)
- [ ] Android: Exported composable has a KDoc comment (`/** ... */`) describing purpose

**Complex — full section headers required:**
- [ ] Web: Has `// --- Props` section header
- [ ] Web: Has `// --- Render` section header (and `// --- State`, `// --- Helpers` if applicable)
- [ ] Web: Exported component has JSDoc comment explaining purpose, key props, and state ownership
- [ ] iOS: Has `// MARK: - Properties` section header
- [ ] iOS: Has `// MARK: - Body` section header
- [ ] iOS: Has `// MARK: - Subviews` if subview helpers exist
- [ ] Android: Has `// --- Props` (or `// --- Parameters`) section header
- [ ] Android: Has `// --- Render` (or `// --- Content`) section header
- [ ] Android: Has `// --- State` if stateful, `// --- Helpers` if helper functions exist
- [ ] Complex logic (non-obvious conditionals, transforms, calculations) has inline explanation comments on all platforms

> If comment gaps found: add the missing comments before continuing.

### 3. Cross-Platform Parity

- [ ] All three platforms expose **equivalent props** (same names where feasible, same semantics)
- [ ] All **interactive states** (loading, error, empty, disabled, selected) present on all three platforms
- [ ] Disabled state implementation is consistent: `opacity-50` web / `.opacity(0.5)` iOS / `alpha(0.5f)` Android — never separate disabled tokens
- [ ] If component has an `onAction`/callback — all three platforms emit equivalent events
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

**Android:**
- [ ] `Modifier.semantics { contentDescription = ... }` set on icon-only or image elements
- [ ] `Modifier.semantics { role = Role.Button }` (or appropriate role) on custom interactive elements
- [ ] `Modifier.semantics { disabled() }` on disabled composables
- [ ] `Modifier.clearAndSetSemantics { }` used where internal structure would be noisy to TalkBack

### 5. Component Documentation (`docs/components/$ARGUMENTS.md`)

- [ ] File exists at `docs/components/$ARGUMENTS.md`
- [ ] Has `### Web` props table with all current props
- [ ] Has `### iOS` props table with all current props
- [ ] Has `### Android` props table with all current props
- [ ] Has `### Web` usage example in Usage Examples section
- [ ] Has `### iOS` usage example in Usage Examples section
- [ ] Has `### Android` usage example in Usage Examples section
- [ ] Has non-empty `## Accessibility` section
- [ ] Props tables match the actual source code (no stale/missing params)

> If doc file missing: create it using the template from `docs/components/Button.md` as reference.
> If props are stale: update the tables to match current source code.

### 6. Registry Entry in docs/components.md

- [ ] Row exists for `$ARGUMENTS` in the correct table (Atomic or Complex)
- [ ] Figma node ID is listed (or noted as "no Figma node" for complex patterns)
- [ ] All three platform file paths (web, iOS, Android) are listed and accurate
- [ ] Status reflects current reality (not "Done" if issues remain)
- [ ] Docs column links to `docs/components/$ARGUMENTS.md`

### 7. Figma Design Parity (if Figma node exists)

Use the Figma MCP server to read the design, and optionally figma-cli to export/update:

**Read from Figma:**
- [ ] Fetch component screenshot via Figma MCP `get_screenshot(nodeId, fileKey)` for visual reference
- [ ] Fetch component spec via Figma MCP `get_design_context(nodeId, fileKey)` for layout/token details
- [ ] Verify variant axes in code match Figma variant properties

**Write to Figma (optional, if figma-cli/ exists):**
- [ ] If component was updated in code but Figma is stale, offer to re-render:
  ```bash
  node figma-cli/src/index.js connect
  node figma-cli/src/index.js render '<Frame name="$ARGUMENTS - Updated" ...>'
  node figma-cli/src/index.js node to-component "<node-id>"
  ```
- [ ] Export current Figma component for comparison:
  ```bash
  node figma-cli/src/index.js export png
  ```

> If no Figma node ID exists for this component, skip this section and note "No Figma reference" in the report.

---

## Output Format

After running all checks and fixing any issues found, produce this report:

```
## Audit Report: $ARGUMENTS

### Type
[Atomic | Complex] — [line count] lines (web), [line count] lines (iOS), [line count] lines (Android)

### Checks Passed
- [list every passing check concisely]

### Issues Fixed
- [issue]: [what was fixed and where]

### Remaining Issues (require user input or design decision)
- [issue]: [why it can't be auto-fixed, what decision is needed]

### Figma Parity
- Figma node: [nodeId | no Figma reference]
- Visual match: [verified via screenshot | not checked]
- Figma updated via figma-cli: [yes | skipped | N/A]

### Registry Status
- docs/components.md entry: [correct | updated | missing]
- Recommended status: [Not started | In Progress | Needs Audit | Done]

### Summary
[One sentence: "All checks passed — ready to mark Done." or "N issues fixed, M require attention."]
```

Set the registry Status to **Done** only if all checks pass and no remaining issues exist.

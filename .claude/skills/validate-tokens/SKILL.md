---
name: validate-tokens
description: >
  Audit one or all components for design token semantic compliance.
  Flags misused surface tokens (BaseHighContrast, BaseLowContrastPressed) used in
  wrong contexts, hardcoded values, and primitive token leakage into component files.
  Run before committing component changes or marking a component Done in docs/components.md.
  Usage: /validate-tokens [ComponentName|--all]
---

# Validate Tokens

Audit component files for design token semantic correctness across web (TSX) and iOS (Swift).

## Arguments

- `<ComponentName>` — Audit a single component, e.g. `/validate-tokens InputField`
- `--all` — Audit every component registered in `docs/components.md`
- _(no argument)_ — Audit any component files modified in the current session

## What This Checks

### 1. Semantic Token Misuse (most important)

These two tokens are **not interchangeable**, even though they may share the same hex value:

| Token | Allowed In | NOT Allowed For |
|-------|-----------|-----------------|
| `BaseLowContrastPressed` | Chip (active/ON state), Button (pressed feedback) | Borders, dividers, connector lines |
| `BaseHighContrast` | Higher-prominence surfaces only | Borders, dividers, separators — use `Border/*` instead |

**Web patterns to flag:**
- `var(--surfaces-base-high-contrast)` in component files → suggest `var(--border-default)`
- `var(--surfaces-base-low-contrast-pressed)` outside of Chip/Button → suggest `var(--border-muted)` if used for lines

**iOS patterns to flag:**
- `.surfacesBaseHighContrast` in component files → suggest `.appBorderDefault`
- `.surfacesBaseLowContrastPressed` outside of Chip/Button active state → explain constraint

### 2. Primitive Token Leakage (blocked by hook, but verify)

- Web: `var(--color-*)` used in component TSX (not `globals.css`)
- iOS: `Color.colorZinc*`, `Color.colorNeutral*`, etc. in non-DesignTokens files
- Hardcoded hex values like `#E5E5E5` anywhere in component files

### 3. Border/Divider Token Usage

Any element described as a "divider", "separator", "border", "line", or "connector" must use:
- Web: `var(--border-default)` or `var(--border-muted)` or `var(--border-active)`
- iOS: `.appBorderDefault`, `.appBorderMuted`, or `.appBorderActive`

### 4. Legacy Token Usage

Flag any legacy alias tokens (`--surface-*` vs `--surfaces-*`) in new code — these should only appear in older files, not new components.

## How to Run

### Single Component

```
/validate-tokens Divider
```

Steps:
1. Read `docs/components.md` to find the web and iOS file paths for the named component
2. Read both files in full
3. Scan for each violation category above
4. Report findings as a compliance table

### All Components

```
/validate-tokens --all
```

Steps:
1. Parse `docs/components.md` for all registered components with file paths
2. Scan each web + iOS pair in parallel
3. Output a summary table with a pass/warn/fail status per component
4. List all violations with file:line references

## Output Format

```
Token Compliance Audit — <ComponentName>
─────────────────────────────────────────────────────────
Web:  app/components/<Name>/<Name>.tsx
iOS:  Components/<Name>/App<Name>.swift

✅ Semantic tokens used correctly
✅ No primitive token leakage
✅ No hardcoded hex values
⚠️  [line 48] .surfacesBaseLowContrastPressed — verify this is an interactive pressed state, not a structural line
❌ [line 83] Color.surfacesBaseHighContrast for a connector line → use .appBorderDefault

Overall: 1 error, 1 warning — fix before marking Done
─────────────────────────────────────────────────────────
```

For `--all`, output a summary table:

```
Component Compliance Summary
─────────────────────────────────────────────────────────
Component         Web     iOS     Issues
─────────────────────────────────────────────────────────
Button            ✅       ✅      —
Divider           ✅       ✅      —
InputField        ✅       ✅      —
Toast             ✅       ✅      —
Chip              ✅       ✅      —
Stepper           ✅       ✅      —
─────────────────────────────────────────────────────────
Total: 6 components, 0 errors, 0 warnings
```

## Reference

See `docs/design-tokens.md` — "Important: Semantic Token Guidelines" section for the full rules and decision tree.

**Quick decision rule:**
- Is this a border, line, or separator? → `Border/Default` or `Border/Muted`
- Is this a pressed/active interactive state? → `BaseLowContrastPressed`
- Is this a surface background? → `Surfaces/Base*`

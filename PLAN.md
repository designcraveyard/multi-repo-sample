# Plan: Label Component + Input Field Rebuild + Demo Page

## Context gathered

**Figma source** — `bubbles-kit` (ZtcCQT96M2dJZjU35X8uMQ)

| Component | Node | What it is |
|-----------|------|-----------|
| Label | 82:1401 | Standalone badge-like label with leading icon + text + trailing icon. 3 sizes × 4 types = 12 variants |
| Input Field (states) | 90:3753 | Full state matrix: 7 states × 2 types = 11 combinations |
| _InputField (primitive) | 90:3525 | Private base with 6 boolean slot props (leadingLabel, leadingSeparator, leadingCursor, trailingCursor, trailingSeparator, trailingLabel) |

**Existing InputField** — `app/components/InputField/InputField.tsx` exists but is **incomplete**:
- Missing: `Label` slots (leading/trailing), separator lines, cursor indicator
- Missing: `Success` / `Warning` / `Error` state icons (uses only border color)
- Missing: the `Label` sub-component entirely (no file exists)
- The existing implementation is a reasonable starting point but does not match Figma's _InputField primitive structure

---

## 1. Label Component (NEW — `app/components/Label/`)

### Figma spec
- **Axes**: `Size` (Small / Medium / Large) × `Type` (SecondaryAction / PrimaryAction / BrandInteractive / Information)
- **Shape**: horizontal flex, pill (`border-radius: full`), `items-center`, `justify-center`
- **Slots**: `leadingIcon` (ReactNode) + text label + `trailingIcon` (ReactNode)
- **Gaps**:
  - Small → `gap-0.5` (2px, `--space-1/2`)
  - Medium → `gap-2` (8px, `--space-2`)
  - Large → `gap-3` (12px, `--space-3`)
- **Typography** (all medium weight / emphasized):
  - Small → 12px/16px, weight 500 → `--typography-body-sm-em-*`
  - Medium → 14px/20px, weight 500 → `--typography-body-md-em-*`
  - Large → 16px/24px, weight 500 → `--typography-body-lg-em-*`
- **Colors** (text only — icons inherit):
  - `secondaryAction` → `--typography-secondary`
  - `primaryAction` → `--typography-primary`
  - `brandInteractive` → `--typography-brand`
  - `information` → `--typography-muted`
- **Icon sizes**: 24px at Large/Medium, 16px at Small (Phosphor icons, `regular` weight)

### Files to create
```
app/components/Label/Label.tsx
app/components/Label/index.ts
```

### Props interface
```typescript
export type LabelSize = "sm" | "md" | "lg";
export type LabelType = "secondaryAction" | "primaryAction" | "brandInteractive" | "information";

export interface LabelProps {
  size?: LabelSize;               // default "md"
  type?: LabelType;               // default "secondaryAction"
  label?: string;                 // the text — default "Label"
  leadingIcon?: ReactNode;        // pass a Phosphor icon
  trailingIcon?: ReactNode;       // pass a Phosphor icon
  showLeadingIcon?: boolean;      // default true
  showTrailingIcon?: boolean;     // default true
  className?: string;
}
```

---

## 2. InputField Rebuild (MODIFY — `app/components/InputField/InputField.tsx`)

The current file will be **replaced** with a faithful Figma implementation. Key changes:

### What's changing
| Feature | Current | New |
|---------|---------|-----|
| Leading/trailing Label slots | ❌ | ✅ (uses `<Label>` component) |
| Separator lines | ❌ | ✅ (1px divider, `--surfaces-base-high-contrast`) |
| Cursor indicator | ❌ | ✅ (1px `--surfaces-brand-interactive`, shown at `focus` state) |
| State icons (Success/Warning/Error) | ❌ | ✅ Phosphor: CheckCircle / Warning / WarningCircle |
| Disabled state | opacity on wrapper | Figma: `opacity-50` |
| TextField type | separate export | Keep as `TextField` named export |

### Updated props interface
```typescript
// InputField (single line)
export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;                 // floating label above input
  hint?: string;                  // helper text below
  state?: InputFieldState;        // "default" | "success" | "warning" | "error"
  leadingLabel?: ReactNode;       // left Label slot (Label component)
  trailingLabel?: ReactNode;      // right Label slot (Label component)
  leadingIcon?: ReactNode;        // leading Phosphor icon (simple icon, no label)
  trailingIcon?: ReactNode;       // trailing Phosphor icon
  showLeadingSeparator?: boolean; // 1px divider between leadingLabel and text area
  showTrailingSeparator?: boolean;// 1px divider between text area and trailingLabel
  className?: string;
}
```

### State→visual mapping
| State | Border | Trailing icon | Hint color |
|-------|--------|---------------|------------|
| default | `--border-default`, focus→`--border-active` | — | `--typography-muted` |
| success | `--border-success` | `<CheckCircle />` (icons-success) | `--typography-success` |
| warning | `--border-warning` | `<Warning />` (icons-warning) | `--typography-warning` |
| error | `--border-error` | `<WarningCircle />` (icons-error) | `--typography-error` |

---

## 3. iOS counterparts (NEW)

### `AppLabel.swift`
```
Components/Label/AppLabel.swift
```
Mirror of web Label: `LabelSize` enum (sm/md/lg), `LabelType` enum, `leadingIcon`, `trailingIcon`, `showLeadingIcon`, `showTrailingIcon` params. Uses Phosphor icons via `Ph.<name>.regular.iconSize(.<token>)`.

### `AppInputField.swift` (UPDATE)
Update existing `Components/InputField/AppInputField.swift` to add:
- `leadingLabel` / `trailingLabel` `AnyView?` slots
- `leadingSeparator` / `trailingSeparator` Bool params
- State icons (checkmark.circle / exclamationmark.triangle / exclamationmark.circle) via Phosphor

---

## 4. Demo Page (NEW — `app/input-demo/page.tsx`)

A comprehensive showcase page at `/input-demo` demonstrating every variant:

### Sections
1. **Label variants** — 3 sizes × 4 types grid (12 cells)
2. **InputField states** — Default / Focus / Filled / Disabled / Success / Warning / Error
3. **InputField with slots**:
   - Leading icon only
   - Trailing icon only
   - Leading Label slot (with Label component)
   - Trailing Label slot
   - Leading + Trailing separators
   - Leading + Trailing Label slots (full)
   - All combinations together
4. **TextField (multiline)** — all states

The demo page will be interactive (React state) so users can type in the inputs and see live focus/filled transitions.

---

## File change summary

| File | Action |
|------|--------|
| `app/components/Label/Label.tsx` | CREATE |
| `app/components/Label/index.ts` | CREATE |
| `app/components/InputField/InputField.tsx` | REWRITE |
| `app/components/InputField/index.ts` | UPDATE (add Label types) |
| `app/input-demo/page.tsx` | CREATE |
| `multi-repo-ios/multi-repo-ios/Components/Label/AppLabel.swift` | CREATE |
| `multi-repo-ios/multi-repo-ios/Components/InputField/AppInputField.swift` | UPDATE |
| `docs/components.md` | UPDATE (add Label entry) |

---

## Implementation order

1. `Label` web component
2. `Label` iOS component
3. Rebuild `InputField` web (depends on Label)
4. Update `AppInputField` iOS (depends on AppLabel)
5. Demo page
6. Update `docs/components.md`

# Design: Next.js Native Component Wrappers

**Date:** 2026-02-23
**Status:** Approved
**Scope:** Port all 13 iOS `App*` native wrappers to Next.js equivalents

---

## Goal

Create a `Native/` component layer in the Next.js app that mirrors `Components/Native/` on iOS:
thin, styled wrappers around browser/library primitives, with all styling config at the **top of each file** using semantic design tokens from `globals.css`.

---

## Skipped (deferred)

- **AppPageHeader** — no direct web equivalent (nav patterns differ)
- **AppBottomNavBar** — bottom nav is mobile-only; defer until mobile layout strategy is decided

---

## Component Map (11 + 1)

| iOS Wrapper | Web Wrapper | Primitive |
|---|---|---|
| `AppNativePicker` | `AppNativePicker.tsx` | shadcn `Select` (Radix Select) |
| `AppDateTimePicker` | `AppDateTimePicker.tsx` | shadcn `Calendar` + `Popover` (react-day-picker) |
| `AppBottomSheet` | `AppBottomSheet.tsx` | shadcn `Drawer` (vaul) |
| `AppProgressLoader` | `AppProgressLoader.tsx` | shadcn `Progress` + CSS spinner |
| `AppCarousel` | `AppCarousel.tsx` | shadcn `Carousel` (Embla) |
| `AppContextMenu` | `AppContextMenu.tsx` | shadcn `ContextMenu` + `DropdownMenu` |
| `AppActionSheet` | `AppActionSheet.tsx` | shadcn `AlertDialog` |
| `AppAlertPopup` | `AppAlertPopup.tsx` | shadcn `AlertDialog` |
| `AppTooltip` | `AppTooltip.tsx` | shadcn `Tooltip` |
| `AppRangeSlider` | `AppRangeSlider.tsx` | shadcn `Slider` (dual-thumb custom) |
| `AppColorPicker` | `AppColorPicker.tsx` | Native `<input type="color">` |

---

## File Structure

```
multi-repo-nextjs/
  app/components/Native/
    AppNativePicker.tsx
    AppDateTimePicker.tsx
    AppBottomSheet.tsx
    AppProgressLoader.tsx
    AppCarousel.tsx
    AppContextMenu.tsx
    AppActionSheet.tsx
    AppAlertPopup.tsx
    AppTooltip.tsx
    AppRangeSlider.tsx
    AppColorPicker.tsx
    index.ts                 ← barrel export

  components/ui/             ← shadcn-generated primitives (owned source files)
```

---

## Per-File Structure (pattern)

Each wrapper file follows this layout — matching the iOS `NativeComponentStyling.swift` pattern but inline:

```tsx
"use client";

// ─── Styling Config ───────────────────────────────────────────────────────────
// All tokens reference the semantic CSS custom property layer from globals.css.
// Change values here to restyle the component everywhere it is used.

const styling = {
  colors: {
    trigger:     "var(--surfaces-base-primary)",
    text:        "var(--typography-primary)",
    // ...
  },
  layout: {
    radius:      "var(--radius-md)",
    // ...
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Component ────────────────────────────────────────────────────────────────
```

---

## shadcn Setup

- Run `npx shadcn@latest init` with Tailwind v4 config
- Components directory: `components/ui/` (shadcn default — separate from `app/components/`)
- Add shadcn components individually: `select`, `calendar`, `drawer`, `progress`, `carousel`, `context-menu`, `alert-dialog`, `tooltip`, `slider`
- Install supporting packages: `vaul` (drawer), `react-day-picker`, `date-fns`, `embla-carousel-react`

---

## Design Token Rules

- **All colors** → `var(--surfaces-*)`, `var(--typography-*)`, `var(--border-*)`, `var(--icons-*)`
- **All spacing** → `var(--space-*)` or Tailwind utilities that map to `--spacing-*`
- **All radii** → `var(--radius-*)`
- **No hardcoded hex values**
- **No primitive tokens** (`var(--color-*)`) in component files — semantic layer only
- Dark mode handled automatically via CSS variable overrides in `globals.css`

---

## Prop Parity with iOS

Each wrapper exposes the same props as its iOS counterpart where semantically equivalent:

| iOS prop | Web prop | Notes |
|---|---|---|
| `isDisabled` | `disabled` | HTML standard |
| `showError` / `errorMessage` | `showError` / `errorMessage` | identical |
| `selection: Binding<T>` | `value` + `onChange` | React controlled pattern |
| `detents: [.medium, .large]` | `snapPoints` | vaul equivalent |
| `variant: .indefinite/.definite` | `variant: "indefinite" \| "definite"` | direct mapping |

---

## Automation Updates (post-implementation)

After all components are built:
1. Update `docs/components.md` — add Native section
2. Update `CLAUDE.md` — add native wrapper table, update hook rules for web
3. Add `native-wrapper-guard` hook for web — warn when raw Radix/HTML primitives used in screen files instead of `App*` wrappers
4. Update `cross-platform-reviewer` agent to include Native component parity checks

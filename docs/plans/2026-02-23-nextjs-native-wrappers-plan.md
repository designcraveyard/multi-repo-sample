# Next.js Native Component Wrappers — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 11 styled wrapper components in `multi-repo-nextjs/app/components/Native/` backed by shadcn/ui primitives, each with an inline styling config block using only semantic design tokens from `globals.css`.

**Architecture:** shadcn/ui (Radix-based) provides accessible, keyboard-navigable primitives. Each `App*.tsx` wrapper owns a `const styling = { colors, layout }` block at the top — the only place to change visual tokens. Props mirror the iOS `App*` counterparts where semantically equivalent.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui (Radix UI), vaul (drawer), react-day-picker + date-fns (calendar), embla-carousel-react (carousel).

**Design doc:** `docs/plans/2026-02-23-nextjs-native-wrappers-design.md`

**No test infra exists** in this project. Verification = `npm run dev` + visual inspection + `npm run build` (type-check + lint).

---

## Task 0: shadcn Init

**Files:**
- Create: `multi-repo-nextjs/components.json`
- Create: `multi-repo-nextjs/lib/utils.ts`
- Create: `multi-repo-nextjs/components/ui/` (populated by shadcn add commands)

**Step 1: Initialize shadcn in the Next.js project**

```bash
cd multi-repo-nextjs
npx shadcn@latest init --defaults
```

When prompted (if not --defaults):
- Style: `Default`
- Base color: `Zinc`  (matches our `--color-zinc-*` primitives)
- CSS variables: `Yes`
- Tailwind config: auto-detected (v4)
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

**Step 2: Verify `lib/utils.ts` was created**

It should contain:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

If it's missing, create it manually with the above content.

**Step 3: Add all shadcn components needed**

```bash
cd multi-repo-nextjs
npx shadcn@latest add select
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add drawer
npx shadcn@latest add progress
npx shadcn@latest add carousel
npx shadcn@latest add context-menu
npx shadcn@latest add dropdown-menu
npx shadcn@latest add alert-dialog
npx shadcn@latest add tooltip
npx shadcn@latest add slider
```

Each command copies a `components/ui/<name>.tsx` into the project (owned source).

**Step 4: Verify build still passes**

```bash
cd multi-repo-nextjs
npm run build
```

Expected: Clean build, no TypeScript errors. Fix any peer-dep issues before proceeding.

**Step 5: Create Native components directory**

```bash
mkdir -p multi-repo-nextjs/app/components/Native
```

**Step 6: Commit**

```bash
cd multi-repo-nextjs
git add components.json lib/utils.ts components/ui/ app/components/Native/
git commit -m "chore: init shadcn/ui with Radix primitives for Native wrapper layer"
```

---

## Task 1: AppNativePicker

**Maps to iOS:** `AppNativePicker.swift` (Picker `.menu` style)
**Primitive:** shadcn `Select` (Radix Select)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppNativePicker.tsx`

**Step 1: Write the component**

Create `app/components/Native/AppNativePicker.tsx`:

```tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppNativePicker everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Trigger button background
    triggerBg:      "var(--surfaces-base-primary)",
    // Trigger button text + chevron icon
    triggerText:    "var(--typography-primary)",
    // Default border around trigger
    border:         "var(--border-default)",
    // Border when focused / open
    borderFocus:    "var(--border-brand)",
    // Border in error state
    borderError:    "var(--border-error)",
    // Dropdown menu panel background
    menuBg:         "var(--surfaces-base-low-contrast)",
    // Unselected option text
    optionText:     "var(--typography-primary)",
    // Selected option text (highlighted)
    selectedText:   "var(--typography-brand)",
    // Error message text below trigger
    errorText:      "var(--typography-error)",
    // Placeholder text when nothing is selected
    placeholder:    "var(--typography-muted)",
  },
  layout: {
    // Corner radius of trigger and dropdown panel
    radius:         "var(--radius-md)",
    // Vertical padding inside the trigger
    paddingY:       "var(--space-2)",
    // Horizontal padding inside the trigger
    paddingX:       "var(--space-4)",
    // Error border width
    errorBorderWidth: "1.5px",
    // Default border width
    defaultBorderWidth: "1px",
  },
  typography: {
    // Trigger label + option row font size
    label:    "var(--typography-body-md-size)",
    leading:  "var(--typography-body-md-leading)",
    weight:   "var(--typography-body-md-weight)",
    // Helper / error text below trigger
    helper:   "var(--typography-caption-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerOption<T extends string = string> {
  label: string;
  value: T;
}

export interface AppNativePickerProps<T extends string = string> {
  /** Label shown on the closed trigger button */
  label: string;
  /** Currently selected value */
  value: T;
  /** Called when the user selects a new option */
  onChange: (value: T) => void;
  /** The list of options to display */
  options: PickerOption<T>[];
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Renders at 0.5 opacity and blocks interaction */
  disabled?: boolean;
  /** When true, draws an error border and shows errorMessage below */
  showError?: boolean;
  /** Validation message shown below trigger when showError is true */
  errorMessage?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppNativePicker<T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  showError = false,
  errorMessage = "",
  className = "",
}: AppNativePickerProps<T>) {
  const borderColor = showError
    ? styling.colors.borderError
    : styling.colors.border;
  const borderWidth = showError
    ? styling.layout.errorBorderWidth
    : styling.layout.defaultBorderWidth;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Accessible label above the trigger */}
      <span
        style={{
          fontSize:   styling.typography.label,
          lineHeight: styling.typography.leading,
          fontWeight: styling.typography.weight,
          color:      styling.colors.triggerText,
        }}
      >
        {label}
      </span>

      <Select
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        <SelectTrigger
          style={{
            backgroundColor: styling.colors.triggerBg,
            color:           styling.colors.triggerText,
            borderColor,
            borderWidth,
            borderStyle:     "solid",
            borderRadius:    styling.layout.radius,
            paddingTop:      styling.layout.paddingY,
            paddingBottom:   styling.layout.paddingY,
            paddingLeft:     styling.layout.paddingX,
            paddingRight:    styling.layout.paddingX,
            fontSize:        styling.typography.label,
            lineHeight:      styling.typography.leading,
            // Disabled: 0.5 opacity — design system convention
            opacity:         disabled ? 0.5 : 1,
          }}
          // Override shadcn's focus ring with our brand token
          className="focus:ring-2 focus:ring-[var(--border-brand)] focus:ring-offset-2"
        >
          <SelectValue
            placeholder={
              <span style={{ color: styling.colors.placeholder }}>
                {placeholder}
              </span>
            }
          />
        </SelectTrigger>

        <SelectContent
          style={{
            backgroundColor: styling.colors.menuBg,
            borderRadius:    styling.layout.radius,
          }}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              style={{
                // Highlight selected option with brand text color
                color:
                  opt.value === value
                    ? styling.colors.selectedText
                    : styling.colors.optionText,
                fontSize:   styling.typography.label,
                lineHeight: styling.typography.leading,
              }}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Validation error message */}
      {showError && errorMessage && (
        <span
          style={{
            color:    styling.colors.errorText,
            fontSize: styling.typography.helper,
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
```

**Step 2: Verify type-check**

```bash
cd multi-repo-nextjs && npm run build
```

Expected: No TypeScript errors in `AppNativePicker.tsx`.

**Step 3: Commit**

```bash
git add app/components/Native/AppNativePicker.tsx
git commit -m "feat(native): add AppNativePicker wrapper (shadcn Select)"
```

---

## Task 2: AppProgressLoader

**Maps to iOS:** `AppProgressLoader.swift` (ProgressView indefinite + definite)
**Primitive:** shadcn `Progress` (linear) + CSS `animate-spin` (circular)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppProgressLoader.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { Progress } from "@/components/ui/progress";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Filled portion of the linear bar + spinner ring
    tint:         "var(--surfaces-brand-interactive)",
    // Unfilled track behind the linear bar
    track:        "var(--surfaces-base-low-contrast)",
    // Optional label text below the loader
    label:        "var(--typography-secondary)",
  },
  layout: {
    // Height of the linear progress bar track
    linearTrackHeight: "6px",
    // Corner radius of the linear bar (pill ends)
    linearTrackRadius: "var(--radius-full)",
    // Diameter of the circular spinner
    spinnerSize:       "24px",
    // Border width of the spinner ring
    spinnerBorderWidth: "3px",
    // Gap between loader and label text
    labelSpacing:      "var(--space-2)",
  },
  typography: {
    label: "var(--typography-body-md-size)",
    leading: "var(--typography-body-md-leading)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressVariant =
  | { variant: "indefinite" }
  | { variant: "definite"; value: number; total?: number };

export type AppProgressLoaderProps = {
  /** Optional descriptive label shown below the loader */
  label?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
} & ProgressVariant;

// ─── Component ────────────────────────────────────────────────────────────────

export function AppProgressLoader(props: AppProgressLoaderProps) {
  const { label, className = "" } = props;

  // Compute 0–100 percentage for definite variant
  const percentage =
    props.variant === "definite"
      ? Math.min(100, Math.max(0, (props.value / (props.total ?? 100)) * 100))
      : null;

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={{ gap: styling.layout.labelSpacing }}
    >
      {props.variant === "indefinite" ? (
        // Circular spinner — pure CSS, no extra dependency
        <span
          role="status"
          aria-label={label ?? "Loading"}
          className="animate-spin rounded-full"
          style={{
            width:       styling.layout.spinnerSize,
            height:      styling.layout.spinnerSize,
            borderWidth: styling.layout.spinnerBorderWidth,
            borderStyle: "solid",
            // Top segment = filled (brand color), rest = track
            borderColor: `${styling.colors.tint} ${styling.colors.track} ${styling.colors.track} ${styling.colors.track}`,
          }}
        />
      ) : (
        // Linear determinate bar via shadcn Progress
        <div
          style={{
            width:        "100%",
            height:       styling.layout.linearTrackHeight,
            borderRadius: styling.layout.linearTrackRadius,
            backgroundColor: styling.colors.track,
            overflow:     "hidden",
          }}
          role="progressbar"
          aria-valuenow={percentage ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? "Progress"}
        >
          <Progress
            value={percentage ?? 0}
            className="h-full rounded-full"
            // Override shadcn's default indicator color with our brand token
            style={
              {
                "--progress-foreground": styling.colors.tint,
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {label && (
        <span
          style={{
            color:      styling.colors.label,
            fontSize:   styling.typography.label,
            lineHeight: styling.typography.leading,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppProgressLoader.tsx
git commit -m "feat(native): add AppProgressLoader wrapper (shadcn Progress + CSS spinner)"
```

---

## Task 3: AppTooltip

**Maps to iOS:** `AppTooltip.swift` (`.popover` with `presentationCompactAdaptation`)
**Primitive:** shadcn `Tooltip` (Radix Tooltip)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppTooltip.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Tooltip bubble background — high contrast so it reads over content
    background: "var(--surfaces-inverse-primary)",
    // Text inside the bubble — must contrast with background
    text:       "var(--typography-inverse-primary)",
  },
  layout: {
    radius:    "var(--radius-sm)",
    paddingX:  "var(--space-3)",
    paddingY:  "var(--space-2)",
    maxWidth:  "240px",
    // Delay before tooltip appears (ms) — 0 for instant, 400 for deliberate hover
    delayMs:   400,
  },
  typography: {
    size:    "var(--typography-body-sm-size)",
    leading: "var(--typography-body-sm-leading)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppTooltipProps {
  /** The element that triggers the tooltip on hover/focus */
  children: ReactNode;
  /** Plain text shown inside the tooltip bubble */
  tipText?: string;
  /** Custom content for the tooltip bubble (overrides tipText) */
  tipContent?: ReactNode;
  /** Which side the bubble appears relative to the trigger */
  side?: "top" | "bottom" | "left" | "right";
  /** Controlled open state — omit for uncontrolled */
  open?: boolean;
  /** Called when open state changes (controlled mode) */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS class for the trigger wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppTooltip({
  children,
  tipText,
  tipContent,
  side = "top",
  open,
  onOpenChange,
  className = "",
}: AppTooltipProps) {
  return (
    // TooltipProvider must wrap any Tooltip usage — place once at app root
    // or keep here for self-contained usage. The provider is idempotent.
    <TooltipProvider delayDuration={styling.layout.delayMs}>
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>

        <TooltipContent
          side={side}
          style={{
            backgroundColor: styling.colors.background,
            color:           styling.colors.text,
            borderRadius:    styling.layout.radius,
            paddingLeft:     styling.layout.paddingX,
            paddingRight:    styling.layout.paddingX,
            paddingTop:      styling.layout.paddingY,
            paddingBottom:   styling.layout.paddingY,
            maxWidth:        styling.layout.maxWidth,
            fontSize:        styling.typography.size,
            lineHeight:      styling.typography.leading,
            // Remove shadcn default border so only our bg shows
            border:          "none",
          }}
        >
          {tipContent ?? tipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppTooltip.tsx
git commit -m "feat(native): add AppTooltip wrapper (shadcn Tooltip)"
```

---

## Task 4: AppColorPicker

**Maps to iOS:** `AppColorPicker.swift` (SwiftUI `ColorPicker`)
**Primitive:** Native `<input type="color">` (no shadcn equivalent)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppColorPicker.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { useId } from "react";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Label text next to the color swatch
    label: "var(--typography-primary)",
  },
  layout: {
    // Width and height of the color swatch input
    swatchSize: "32px",
    // Corner radius of the swatch
    radius:     "var(--radius-sm)",
    // Gap between label text and swatch
    gap:        "var(--space-3)",
  },
  typography: {
    size:    "var(--typography-body-md-size)",
    leading: "var(--typography-body-md-leading)",
    weight:  "var(--typography-body-md-weight)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppColorPickerProps {
  /** Hex color string (e.g., "#FF0000") */
  value: string;
  /** Called when the user picks a new color */
  onChange: (value: string) => void;
  /** Label shown next to the color swatch */
  label?: string;
  /** Renders at 0.5 opacity and blocks interaction */
  disabled?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppColorPicker({
  value,
  onChange,
  label,
  disabled = false,
  className = "",
}: AppColorPickerProps) {
  // Generate a stable id to link <label> and <input>
  const id = useId();

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: styling.layout.gap, opacity: disabled ? 0.5 : 1 }}
    >
      {/* Native color input — the browser renders the swatch + color picker UI */}
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width:        styling.layout.swatchSize,
          height:       styling.layout.swatchSize,
          borderRadius: styling.layout.radius,
          // Remove default browser padding/border around the swatch
          padding:      0,
          border:       "none",
          cursor:       disabled ? "not-allowed" : "pointer",
          // Let the swatch fill the entire element
          appearance:   "none",
          backgroundColor: "transparent",
        }}
        // Accessibility: announce the selected color value to screen readers
        aria-label={label ?? "Color picker"}
      />

      {label && (
        <label
          htmlFor={id}
          style={{
            color:      styling.colors.label,
            fontSize:   styling.typography.size,
            lineHeight: styling.typography.leading,
            fontWeight: styling.typography.weight,
            cursor:     disabled ? "not-allowed" : "pointer",
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppColorPicker.tsx
git commit -m "feat(native): add AppColorPicker wrapper (native input[type=color])"
```

---

## Task 5: AppAlertPopup

**Maps to iOS:** `AppAlertPopup.swift` (`.alert`)
**Primitive:** shadcn `AlertDialog`

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppAlertPopup.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Dialog background surface
    background:       "var(--surfaces-base-primary)",
    // Title text
    titleText:        "var(--typography-primary)",
    // Message body text
    messageText:      "var(--typography-secondary)",
    // Standard action button background
    actionBg:         "var(--surfaces-brand-interactive)",
    actionText:       "var(--typography-on-brand-primary)",
    actionHoverBg:    "var(--surfaces-brand-interactive-hover)",
    // Destructive action — red
    destructiveBg:    "var(--surfaces-error-solid)",
    destructiveText:  "var(--typography-on-brand-primary)",
    destructiveHoverBg: "var(--surfaces-error-solid-hover)",
    // Cancel action — low contrast
    cancelBg:         "var(--surfaces-base-low-contrast)",
    cancelText:       "var(--typography-primary)",
    cancelHoverBg:    "var(--surfaces-base-low-contrast-hover)",
    // Overlay scrim
    overlay:          "rgba(0,0,0,0.5)",
  },
  layout: {
    radius:  "var(--radius-lg)",
    padding: "var(--space-6)",
    gap:     "var(--space-3)",
    buttonRadius: "var(--radius-md)",
    buttonPaddingX: "var(--space-4)",
    buttonPaddingY: "var(--space-2)",
  },
  typography: {
    title:   "var(--typography-title-sm-size)",
    message: "var(--typography-body-md-size)",
    button:  "var(--typography-cta-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertButtonRole = "default" | "destructive" | "cancel";

export interface AlertButton {
  label: string;
  role?: AlertButtonRole;
  onPress?: () => void;
}

export interface AppAlertPopupProps {
  /** Controls dialog visibility */
  isPresented: boolean;
  /** Called when the dialog requests to close */
  onClose: () => void;
  /** Bold title at the top of the alert */
  title: string;
  /** Descriptive message below the title */
  message?: string;
  /** Up to two buttons — one primary, one cancel */
  buttons?: AlertButton[];
  /** Additional CSS class for the dialog content panel */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

// Returns the inline style for a button based on its role
function buttonStyle(role: AlertButtonRole = "default") {
  const map: Record<AlertButtonRole, { bg: string; text: string; hoverBg: string }> = {
    default:     { bg: styling.colors.actionBg, text: styling.colors.actionText, hoverBg: styling.colors.actionHoverBg },
    destructive: { bg: styling.colors.destructiveBg, text: styling.colors.destructiveText, hoverBg: styling.colors.destructiveHoverBg },
    cancel:      { bg: styling.colors.cancelBg, text: styling.colors.cancelText, hoverBg: styling.colors.cancelHoverBg },
  };
  return map[role];
}

export function AppAlertPopup({
  isPresented,
  onClose,
  title,
  message,
  buttons = [{ label: "OK", role: "default" }],
  className = "",
}: AppAlertPopupProps) {
  return (
    <AlertDialog open={isPresented} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className={className}
        style={{
          backgroundColor: styling.colors.background,
          borderRadius:    styling.layout.radius,
          padding:         styling.layout.padding,
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            style={{
              color:    styling.colors.titleText,
              fontSize: styling.typography.title,
            }}
          >
            {title}
          </AlertDialogTitle>

          {message && (
            <AlertDialogDescription
              style={{
                color:    styling.colors.messageText,
                fontSize: styling.typography.message,
              }}
            >
              {message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter style={{ gap: styling.layout.gap }}>
          {buttons.map((btn, i) => {
            const s = buttonStyle(btn.role);
            const isCancel = btn.role === "cancel";

            // Use AlertDialogCancel for cancel role (closes without action),
            // AlertDialogAction for all others (closes + triggers onPress)
            const sharedStyle: React.CSSProperties = {
              backgroundColor: s.bg,
              color:           s.text,
              borderRadius:    styling.layout.buttonRadius,
              paddingLeft:     styling.layout.buttonPaddingX,
              paddingRight:    styling.layout.buttonPaddingX,
              paddingTop:      styling.layout.buttonPaddingY,
              paddingBottom:   styling.layout.buttonPaddingY,
              fontSize:        styling.typography.button,
              border:          "none",
            };

            return isCancel ? (
              <AlertDialogCancel
                key={i}
                style={sharedStyle}
                onClick={btn.onPress}
              >
                {btn.label}
              </AlertDialogCancel>
            ) : (
              <AlertDialogAction
                key={i}
                style={sharedStyle}
                onClick={btn.onPress}
              >
                {btn.label}
              </AlertDialogAction>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppAlertPopup.tsx
git commit -m "feat(native): add AppAlertPopup wrapper (shadcn AlertDialog)"
```

---

## Task 6: AppActionSheet

**Maps to iOS:** `AppActionSheet.swift` (`.confirmationDialog`)
**Primitive:** shadcn `AlertDialog` (styled as bottom-anchored action list)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppActionSheet.tsx`

**Step 1: Write the component**

```tsx
"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Sheet background panel
    background:       "var(--surfaces-base-primary)",
    // Title text at the top of the sheet
    titleText:        "var(--typography-secondary)",
    // Optional message text below the title
    messageText:      "var(--typography-muted)",
    // Standard action label color
    actionText:       "var(--typography-brand)",
    actionHoverBg:    "var(--surfaces-base-low-contrast)",
    // Destructive action label — red
    destructiveText:  "var(--typography-error)",
    // Cancel button (separated at bottom)
    cancelText:       "var(--typography-brand)",
    cancelBg:         "var(--surfaces-base-primary)",
    cancelHoverBg:    "var(--surfaces-base-low-contrast)",
    // Thin divider between rows
    divider:          "var(--border-default)",
  },
  layout: {
    // Corner radius of the action group panel (top two corners)
    panelRadius:      "var(--radius-xl)",
    // Corner radius of the cancel button (separate pill at bottom)
    cancelRadius:     "var(--radius-xl)",
    itemPaddingX:     "var(--space-4)",
    itemPaddingY:     "var(--space-4)",
    // Gap between the action group and the cancel button
    cancelGap:        "var(--space-2)",
  },
  typography: {
    title:       "var(--typography-caption-md-size)",
    message:     "var(--typography-caption-md-size)",
    action:      "var(--typography-body-lg-size)",
    actionWeight:"400",
    cancel:      "var(--typography-body-lg-size)",
    cancelWeight:"600",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionRole = "default" | "destructive" | "cancel";

export interface AppActionSheetAction {
  label: string;
  role?: ActionRole;
  onPress?: () => void;
}

export interface AppActionSheetProps {
  /** Controls sheet visibility */
  isPresented: boolean;
  /** Called when the sheet requests to close */
  onClose: () => void;
  /** Bold title at the top of the sheet (iOS uses caption style) */
  title?: string;
  /** Optional descriptive message below the title */
  message?: string;
  /** List of actions — cancel role is separated at the bottom */
  actions: AppActionSheetAction[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppActionSheet({
  isPresented,
  onClose,
  title,
  message,
  actions,
}: AppActionSheetProps) {
  // Split cancel action from the rest — iOS always renders cancel separately
  const cancelAction = actions.find((a) => a.role === "cancel");
  const mainActions  = actions.filter((a) => a.role !== "cancel");

  function handleAction(action: AppActionSheetAction) {
    action.onPress?.();
    onClose();
  }

  return (
    <AlertDialog open={isPresented} onOpenChange={(open) => !open && onClose()}>
      {/* Render as a bottom sheet: position fixed to bottom, full-width on mobile */}
      <AlertDialogContent
        className="fixed bottom-4 left-4 right-4 w-auto max-w-sm mx-auto p-0 border-none shadow-lg"
        style={{ borderRadius: styling.layout.panelRadius }}
      >
        {/* Main actions group */}
        <div
          style={{
            backgroundColor: styling.colors.background,
            borderRadius:    styling.layout.panelRadius,
            overflow:        "hidden",
          }}
        >
          {/* Optional title + message header */}
          {(title || message) && (
            <AlertDialogHeader
              className="text-center border-b"
              style={{
                borderColor: styling.colors.divider,
                paddingLeft:  styling.layout.itemPaddingX,
                paddingRight: styling.layout.itemPaddingX,
                paddingTop:   styling.layout.itemPaddingY,
                paddingBottom: styling.layout.itemPaddingY,
              }}
            >
              {title && (
                <AlertDialogTitle
                  style={{
                    color:      styling.colors.titleText,
                    fontSize:   styling.typography.title,
                    fontWeight: "400",
                  }}
                >
                  {title}
                </AlertDialogTitle>
              )}
              {message && (
                <AlertDialogDescription
                  style={{
                    color:    styling.colors.messageText,
                    fontSize: styling.typography.message,
                  }}
                >
                  {message}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
          )}

          {/* Action rows with dividers between them */}
          {mainActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action)}
              className="w-full text-center transition-colors"
              style={{
                color:       action.role === "destructive"
                               ? styling.colors.destructiveText
                               : styling.colors.actionText,
                fontSize:    styling.typography.action,
                fontWeight:  styling.typography.actionWeight,
                paddingLeft:  styling.layout.itemPaddingX,
                paddingRight: styling.layout.itemPaddingX,
                paddingTop:   styling.layout.itemPaddingY,
                paddingBottom: styling.layout.itemPaddingY,
                borderTop:   i === 0 && !title && !message ? "none"
                               : `1px solid ${styling.colors.divider}`,
                background:  "transparent",
                cursor:      "pointer",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel button — separate panel below, matches iOS layout */}
        {cancelAction && (
          <button
            onClick={() => handleAction(cancelAction)}
            className="w-full text-center transition-colors"
            style={{
              marginTop:    styling.layout.cancelGap,
              backgroundColor: styling.colors.cancelBg,
              color:           styling.colors.cancelText,
              fontSize:        styling.typography.cancel,
              fontWeight:      styling.typography.cancelWeight,
              borderRadius:    styling.layout.cancelRadius,
              paddingTop:      styling.layout.itemPaddingY,
              paddingBottom:   styling.layout.itemPaddingY,
              cursor:          "pointer",
              border:          "none",
            }}
          >
            {cancelAction.label}
          </button>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppActionSheet.tsx
git commit -m "feat(native): add AppActionSheet wrapper (shadcn AlertDialog, iOS layout)"
```

---

## Task 7: AppBottomSheet

**Maps to iOS:** `AppBottomSheet.swift` (`.sheet` + `presentationDetents`)
**Primitive:** shadcn `Drawer` (vaul — built for this pattern)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppBottomSheet.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Sheet background surface
    background:    "var(--surfaces-base-primary)",
    // Drag indicator pill color
    dragIndicator: "var(--border-default)",
    // Optional title text
    titleText:     "var(--typography-primary)",
    // Optional description text
    descText:      "var(--typography-secondary)",
  },
  layout: {
    // Corner radius of the sheet's top corners
    cornerRadius:  "var(--radius-xl)",
    // Inner horizontal padding around sheet content
    paddingX:      "var(--space-4)",
    // Top padding below the drag indicator
    paddingTop:    "var(--space-3)",
    // Bottom safe-area padding
    paddingBottom: "var(--space-6)",
    // Width and height of the drag indicator pill
    indicatorW:    "32px",
    indicatorH:    "4px",
    indicatorRadius: "var(--radius-full)",
  },
  typography: {
    title:   "var(--typography-title-sm-size)",
    desc:    "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppBottomSheetProps {
  /** Controls sheet visibility */
  isPresented: boolean;
  /** Called when the sheet requests to close (swipe down or backdrop tap) */
  onClose: () => void;
  /** Sheet content */
  children: ReactNode;
  /** Optional title displayed in the sheet header */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /**
   * Snap points as fractions of screen height (e.g. [0.5, 1] = medium + full).
   * Equivalent to iOS `presentationDetents`.
   */
  snapPoints?: number[];
  /** Additional CSS class for the content panel */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppBottomSheet({
  isPresented,
  onClose,
  children,
  title,
  description,
  snapPoints,
  className = "",
}: AppBottomSheetProps) {
  return (
    <Drawer
      open={isPresented}
      onOpenChange={(open) => !open && onClose()}
      // vaul snap points: array of fractions (0-1) or pixel heights
      snapPoints={snapPoints}
    >
      <DrawerContent
        className={className}
        style={{
          backgroundColor: styling.colors.background,
          borderTopLeftRadius:  styling.layout.cornerRadius,
          borderTopRightRadius: styling.layout.cornerRadius,
          paddingLeft:   styling.layout.paddingX,
          paddingRight:  styling.layout.paddingX,
          paddingTop:    styling.layout.paddingTop,
          paddingBottom: styling.layout.paddingBottom,
        }}
      >
        {/* Drag indicator pill — always visible, matches iOS grabber */}
        <div
          aria-hidden="true"
          className="mx-auto"
          style={{
            width:        styling.layout.indicatorW,
            height:       styling.layout.indicatorH,
            backgroundColor: styling.colors.dragIndicator,
            borderRadius: styling.layout.indicatorRadius,
            marginBottom: styling.layout.paddingTop,
          }}
        />

        {/* Optional header */}
        {(title || description) && (
          <DrawerHeader className="px-0">
            {title && (
              <DrawerTitle
                style={{
                  color:    styling.colors.titleText,
                  fontSize: styling.typography.title,
                }}
              >
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription
                style={{
                  color:    styling.colors.descText,
                  fontSize: styling.typography.desc,
                }}
              >
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {children}
      </DrawerContent>
    </Drawer>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppBottomSheet.tsx
git commit -m "feat(native): add AppBottomSheet wrapper (vaul Drawer)"
```

---

## Task 8: AppContextMenu

**Maps to iOS:** `AppContextMenu.swift` (`.contextMenu` long-press + AppPopoverMenu tap)
**Primitive:** shadcn `ContextMenu` (right-click) + `DropdownMenu` (click)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppContextMenu.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Menu panel background
    background:       "var(--surfaces-base-primary)",
    // Standard menu item text
    itemText:         "var(--typography-primary)",
    // Destructive item text — red
    destructiveText:  "var(--typography-error)",
    // Item background on hover
    itemHoverBg:      "var(--surfaces-base-low-contrast)",
    // Thin divider between rows
    rowDivider:       "var(--border-muted)",
  },
  layout: {
    // Corner radius of the menu panel
    radius:           "var(--radius-md)",
    // Minimum width of the menu panel
    minWidth:         "180px",
    // Horizontal padding inside each row
    itemPaddingX:     "var(--space-4)",
    // Vertical padding inside each row
    itemPaddingY:     "var(--space-3)",
    // Gap between icon and label text
    iconSpacing:      "var(--space-2)",
  },
  typography: {
    item: "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ContextMenuItem {
  label: string;
  /** Optional Phosphor icon node rendered to the left of the label */
  icon?: ReactNode;
  /** Red text + iOS destructive semantic */
  destructive?: boolean;
  /** Visual separator above this item */
  separatorAbove?: boolean;
  onPress?: () => void;
}

export interface AppContextMenuProps {
  /**
   * "context"  → right-click / long-press menu (Radix ContextMenu)
   * "dropdown" → click-triggered popover menu (Radix DropdownMenu)
   */
  mode?: "context" | "dropdown";
  /** The element that triggers the menu */
  children: ReactNode;
  /** Menu items to display */
  items: ContextMenuItem[];
  /** Additional CSS class for the trigger wrapper */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Shared inline style for a menu item row
function itemStyle(destructive?: boolean): React.CSSProperties {
  return {
    color:       destructive ? styling.colors.destructiveText : styling.colors.itemText,
    fontSize:    styling.typography.item,
    paddingLeft:  styling.layout.itemPaddingX,
    paddingRight: styling.layout.itemPaddingX,
    paddingTop:   styling.layout.itemPaddingY,
    paddingBottom: styling.layout.itemPaddingY,
    gap:          styling.layout.iconSpacing,
    cursor:       "pointer",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppContextMenu({
  mode = "context",
  children,
  items,
  className = "",
}: AppContextMenuProps) {
  const contentStyle: React.CSSProperties = {
    backgroundColor: styling.colors.background,
    borderRadius:    styling.layout.radius,
    minWidth:        styling.layout.minWidth,
    padding:         0,
    overflow:        "hidden",
  };

  // ── Context menu (right-click) ──
  if (mode === "context") {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild className={className}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent style={contentStyle}>
          {items.map((item, i) => (
            <>
              {item.separatorAbove && (
                <ContextMenuSeparator
                  key={`sep-${i}`}
                  style={{ backgroundColor: styling.colors.rowDivider }}
                />
              )}
              <ContextMenuItem
                key={i}
                onSelect={item.onPress}
                style={itemStyle(item.destructive)}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </ContextMenuItem>
            </>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // ── Dropdown menu (click-triggered) ──
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent style={contentStyle}>
        {items.map((item, i) => (
          <>
            {item.separatorAbove && (
              <DropdownMenuSeparator
                key={`sep-${i}`}
                style={{ backgroundColor: styling.colors.rowDivider }}
              />
            )}
            <DropdownMenuItem
              key={i}
              onSelect={item.onPress}
              style={itemStyle(item.destructive)}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </DropdownMenuItem>
          </>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppContextMenu.tsx
git commit -m "feat(native): add AppContextMenu wrapper (shadcn ContextMenu + DropdownMenu)"
```

---

## Task 9: AppRangeSlider

**Maps to iOS:** `AppRangeSlider.swift` (dual `Slider` + custom track)
**Primitive:** shadcn `Slider` (Radix Slider — natively supports multiple thumbs)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppRangeSlider.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { Slider } from "@/components/ui/slider";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Filled track segment between the two thumbs
    trackActive:     "var(--surfaces-brand-interactive)",
    // Unfilled track (outside the thumb range)
    trackBackground: "var(--surfaces-base-low-contrast)",
    // Thumb circle fill
    thumb:           "var(--surfaces-base-primary)",
    // Thumb border / shadow ring
    thumbBorder:     "var(--border-brand)",
    // Optional min/max label text
    label:           "var(--typography-muted)",
  },
  layout: {
    // Height of the slider track bar
    trackHeight:  "4px",
    // Corner radius of track ends (pill)
    trackRadius:  "var(--radius-full)",
    // Total height of the slider component (≥44px for accessibility)
    totalHeight:  "44px",
    // Thumb circle diameter
    thumbSize:    "20px",
    // Gap between track and min/max labels
    labelSpacing: "var(--space-1)",
  },
  typography: {
    label: "var(--typography-caption-sm-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppRangeSliderProps {
  /** Lower bound of the selected range */
  lowerValue: number;
  /** Upper bound of the selected range */
  upperValue: number;
  /** Called when either thumb moves — receives [lower, upper] */
  onChange: (values: [number, number]) => void;
  /** Absolute min and max of the track [min, max] */
  range?: [number, number];
  /** Step increment */
  step?: number;
  /** When true, renders min/max labels below the track */
  showLabels?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppRangeSlider({
  lowerValue,
  upperValue,
  onChange,
  range = [0, 100],
  step = 1,
  showLabels = false,
  className = "",
}: AppRangeSliderProps) {
  const [min, max] = range;

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: styling.layout.labelSpacing }}>
      {/*
        Radix Slider supports multiple thumbs natively via defaultValue/value arrays.
        value={[lower, upper]} + onValueChange gives us the dual-thumb range behavior.
      */}
      <div style={{ height: styling.layout.totalHeight, display: "flex", alignItems: "center" }}>
        <Slider
          value={[lowerValue, upperValue]}
          onValueChange={([lower, upper]) => onChange([lower, upper])}
          min={min}
          max={max}
          step={step}
          // Apply our design tokens by overriding shadcn's CSS custom properties
          style={
            {
              // Track colors
              "--slider-track-color":  styling.colors.trackBackground,
              "--slider-range-color":  styling.colors.trackActive,
              // Thumb colors
              "--slider-thumb-color":  styling.colors.thumb,
              "--slider-thumb-border": styling.colors.thumbBorder,
            } as React.CSSProperties
          }
          className="w-full"
        />
      </div>

      {showLabels && (
        <div
          className="flex justify-between"
          style={{
            color:    styling.colors.label,
            fontSize: styling.typography.label,
          }}
        >
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
```

> **Note on shadcn Slider styling:** shadcn's Slider renders `[data-orientation]` elements. If the CSS variable overrides don't apply cleanly in Tailwind v4, add these overrides to `globals.css`:
> ```css
> .native-range-slider [data-slot="slider-track"] { background: var(--slider-track-color); }
> .native-range-slider [data-slot="slider-range"] { background: var(--slider-range-color); }
> .native-range-slider [data-slot="slider-thumb"] { background: var(--slider-thumb-color); border: 2px solid var(--slider-thumb-border); }
> ```
> And add `className="native-range-slider"` to the outer div.

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppRangeSlider.tsx
git commit -m "feat(native): add AppRangeSlider wrapper (shadcn Slider dual-thumb)"
```

---

## Task 10: AppCarousel

**Maps to iOS:** `AppCarousel.swift` (`TabView(.page)` / `ScrollView`)
**Primitive:** shadcn `Carousel` (Embla Carousel)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppCarousel.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { ReactNode } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { type EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Active page dot
    dotActive:   "var(--surfaces-brand-interactive)",
    // Inactive page dots
    dotInactive: "var(--surfaces-base-low-contrast)",
  },
  layout: {
    // Horizontal gap between cards in scroll-snap style
    cardSpacing:     "var(--space-3)",
    // Inactive dot diameter
    dotInactiveSize: "6px",
    // Dot height (both active and inactive)
    dotHeight:       "6px",
    // Active dot width (wider capsule marks current page)
    dotActiveWidth:  "18px",
    // Corner radius on dots (makes active dot a capsule)
    dotRadius:       "var(--radius-full)",
    // Gap between adjacent dots
    dotGap:          "var(--space-1)",
    // Gap between carousel content and dots row
    dotsSpacing:     "var(--space-3)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppCarouselProps {
  /** Array of ReactNodes to render as carousel slides */
  items: ReactNode[];
  /**
   * "paged"      → full-width slides, one visible at a time (iOS .page style)
   * "scrollSnap" → partial peek of adjacent cards
   */
  style?: "paged" | "scrollSnap";
  /** When true, renders dot indicators below the carousel */
  showDots?: boolean;
  /** Additional CSS class for the outer wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppCarousel({
  items,
  style: carouselStyle = "paged",
  showDots = true,
  className = "",
}: AppCarouselProps) {
  const opts: EmblaOptionsType =
    carouselStyle === "scrollSnap"
      ? { align: "start", containScroll: "trimSnaps" }
      : { align: "center", loop: false };

  // useEmblaCarousel gives us selectedIndex for dot indicators
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: styling.layout.dotsSpacing }}>
      <Carousel opts={opts}>
        <CarouselContent
          style={{ gap: carouselStyle === "scrollSnap" ? styling.layout.cardSpacing : undefined }}
        >
          {items.map((item, i) => (
            <CarouselItem
              key={i}
              // scrollSnap shows a peek of adjacent cards; paged fills full width
              className={carouselStyle === "scrollSnap" ? "basis-[85%]" : "basis-full"}
            >
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators */}
      {showDots && items.length > 1 && (
        <div
          className="flex items-center justify-center"
          style={{ gap: styling.layout.dotGap }}
          aria-label={`Slide ${selectedIndex + 1} of ${items.length}`}
          role="tablist"
        >
          {items.map((_, i) => {
            const isActive = i === selectedIndex;
            return (
              <span
                key={i}
                role="tab"
                aria-selected={isActive}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width:        isActive ? styling.layout.dotActiveWidth : styling.layout.dotInactiveSize,
                  height:       styling.layout.dotHeight,
                  borderRadius: styling.layout.dotRadius,
                  backgroundColor: isActive
                    ? styling.colors.dotActive
                    : styling.colors.dotInactive,
                  // Smooth width transition when active dot changes
                  transition: "width 200ms ease",
                  display:    "inline-block",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
```

> **Note:** Add `import React from "react"` or ensure the file uses the React 19 JSX transform (already configured via `tsconfig.json` in this project).

**Step 2: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 3: Commit**

```bash
git add app/components/Native/AppCarousel.tsx
git commit -m "feat(native): add AppCarousel wrapper (shadcn Carousel + Embla, dot indicators)"
```

---

## Task 11: AppDateTimePicker

**Maps to iOS:** `AppDateTimePicker.swift` (DatePicker `.compact` / `.graphical`)
**Primitive:** shadcn `Calendar` + `Popover` (react-day-picker + date-fns)

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/AppDateTimePicker.tsx`

**Step 1: Install date-fns (required by react-day-picker)**

```bash
cd multi-repo-nextjs && npm install date-fns
```

**Step 2: Write the component**

```tsx
"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Ph } from "@phosphor-icons/react";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    // Trigger button background
    triggerBg:       "var(--surfaces-base-primary)",
    // Trigger button text
    triggerText:     "var(--typography-primary)",
    // Trigger button border
    triggerBorder:   "var(--border-default)",
    // Calendar popup background
    calendarBg:      "var(--surfaces-base-low-contrast)",
    // Selected day circle fill
    selectedDayBg:   "var(--surfaces-brand-interactive)",
    // Text on selected day (must contrast with selectedDayBg)
    selectedDayText: "var(--typography-on-brand-primary)",
    // Today's date ring (unselected)
    todayRing:       "var(--border-brand)",
    // Regular day numerals
    dayText:         "var(--typography-primary)",
    // Days outside the allowed range
    disabledDayText: "var(--typography-muted)",
    // Weekday header labels (Mo, Tu, …)
    weekdayHeader:   "var(--typography-secondary)",
    // Label text above the trigger
    label:           "var(--typography-primary)",
    // Calendar icon inside the trigger
    icon:            "var(--icons-secondary)",
    // Time input text
    timeText:        "var(--typography-primary)",
    timeBorder:      "var(--border-default)",
    timeBg:          "var(--surfaces-base-primary)",
  },
  layout: {
    triggerRadius:  "var(--radius-md)",
    calendarRadius: "var(--radius-lg)",
    triggerPaddingX: "var(--space-4)",
    triggerPaddingY: "var(--space-2)",
    labelSpacing:   "var(--space-1)",
  },
  typography: {
    label:   "var(--typography-body-md-size)",
    trigger: "var(--typography-body-md-size)",
    time:    "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateTimeMode = "date" | "time" | "dateAndTime";
export type DateTimeDisplayStyle = "compact" | "inline";

export interface AppDateTimePickerProps {
  /** The currently selected Date value */
  value?: Date;
  /** Called when the user selects a date/time */
  onChange: (date: Date) => void;
  /** Text label shown above the trigger */
  label?: string;
  /** date = calendar only | time = time only | dateAndTime = both */
  mode?: DateTimeMode;
  /** compact = trigger button + popover | inline = embedded calendar */
  displayStyle?: DateTimeDisplayStyle;
  /** Restrict selectable date range */
  range?: { min?: Date; max?: Date };
  /** Renders at 0.5 opacity, blocks interaction */
  disabled?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppDateTimePicker({
  value,
  onChange,
  label,
  mode = "date",
  displayStyle = "compact",
  range,
  disabled = false,
  className = "",
}: AppDateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Format the trigger label based on what is selected and the mode
  function formatTrigger(date?: Date): string {
    if (!date) return mode === "time" ? "Pick a time" : "Pick a date";
    if (mode === "date") return format(date, "PPP");
    if (mode === "time") return format(date, "p");
    return format(date, "PPP p");
  }

  // Handle date selection from Calendar (preserves existing time if dateAndTime)
  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const next = value ? new Date(value) : new Date();
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
    if (mode === "date") setOpen(false);
  }

  // Handle time input change
  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const next = value ? new Date(value) : new Date();
    next.setHours(hours, minutes);
    onChange(next);
  }

  const calendarNode = (
    <div
      style={{
        backgroundColor: styling.colors.calendarBg,
        borderRadius:    styling.layout.calendarRadius,
        padding:         "var(--space-3)",
      }}
    >
      {/* Calendar grid — hidden when mode is "time" only */}
      {mode !== "time" && (
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          disabled={(date) => {
            if (range?.min && date < range.min) return true;
            if (range?.max && date > range.max) return true;
            return false;
          }}
          // Inject semantic token colors via CSS custom properties
          classNames={{
            day_selected: "!bg-[var(--surfaces-brand-interactive)] !text-[var(--typography-on-brand-primary)]",
            day_today:    "ring-1 ring-[var(--border-brand)]",
            day_disabled: "text-[var(--typography-muted)] opacity-50",
            head_cell:    "text-[var(--typography-secondary)]",
          }}
        />
      )}

      {/* Time input — shown when mode is "time" or "dateAndTime" */}
      {mode !== "date" && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <label
            style={{ color: styling.colors.label, fontSize: styling.typography.label }}
          >
            Time
          </label>
          <input
            type="time"
            value={value ? format(value, "HH:mm") : ""}
            onChange={handleTimeChange}
            style={{
              backgroundColor: styling.colors.timeBg,
              color:           styling.colors.timeText,
              borderColor:     styling.colors.timeBorder,
              borderWidth:     "1px",
              borderStyle:     "solid",
              borderRadius:    styling.layout.triggerRadius,
              paddingLeft:     "var(--space-2)",
              paddingRight:    "var(--space-2)",
              paddingTop:      "var(--space-1)",
              paddingBottom:   "var(--space-1)",
              fontSize:        styling.typography.time,
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ gap: styling.layout.labelSpacing, opacity: disabled ? 0.5 : 1 }}
    >
      {label && (
        <span style={{ color: styling.colors.label, fontSize: styling.typography.label }}>
          {label}
        </span>
      )}

      {displayStyle === "inline" ? (
        // Embedded calendar — no popover
        calendarNode
      ) : (
        // Compact trigger + popover
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            disabled={disabled}
            asChild
          >
            <button
              style={{
                backgroundColor: styling.colors.triggerBg,
                color:           styling.colors.triggerText,
                borderColor:     styling.colors.triggerBorder,
                borderWidth:     "1px",
                borderStyle:     "solid",
                borderRadius:    styling.layout.triggerRadius,
                paddingLeft:     styling.layout.triggerPaddingX,
                paddingRight:    styling.layout.triggerPaddingX,
                paddingTop:      styling.layout.triggerPaddingY,
                paddingBottom:   styling.layout.triggerPaddingY,
                fontSize:        styling.typography.trigger,
                display:         "flex",
                alignItems:      "center",
                gap:             "var(--space-2)",
                cursor:          disabled ? "not-allowed" : "pointer",
                width:           "100%",
              }}
            >
              <span style={{ color: styling.colors.icon }} aria-hidden="true">
                <Ph.CalendarBlank size={16} />
              </span>
              {formatTrigger(value)}
            </button>
          </PopoverTrigger>

          <PopoverContent className="p-0 w-auto" align="start">
            {calendarNode}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
```

**Step 3: Verify**

```bash
cd multi-repo-nextjs && npm run build
```

**Step 4: Commit**

```bash
git add app/components/Native/AppDateTimePicker.tsx
git commit -m "feat(native): add AppDateTimePicker wrapper (shadcn Calendar + Popover)"
```

---

## Task 12: Barrel Export

**Files:**
- Create: `multi-repo-nextjs/app/components/Native/index.ts`

**Step 1: Create the barrel**

```ts
// Native component wrappers — web equivalents of iOS Components/Native/App*.swift
// Usage: import { AppNativePicker, AppTooltip } from "@/app/components/Native";

export { AppNativePicker }   from "./AppNativePicker";
export { AppDateTimePicker } from "./AppDateTimePicker";
export { AppBottomSheet }    from "./AppBottomSheet";
export { AppProgressLoader } from "./AppProgressLoader";
export { AppCarousel }       from "./AppCarousel";
export { AppContextMenu }    from "./AppContextMenu";
export { AppActionSheet }    from "./AppActionSheet";
export { AppAlertPopup }     from "./AppAlertPopup";
export { AppTooltip }        from "./AppTooltip";
export { AppRangeSlider }    from "./AppRangeSlider";
export { AppColorPicker }    from "./AppColorPicker";

// Re-export types
export type { PickerOption, AppNativePickerProps }     from "./AppNativePicker";
export type { AppDateTimePickerProps, DateTimeMode }   from "./AppDateTimePicker";
export type { AppBottomSheetProps }                    from "./AppBottomSheet";
export type { AppProgressLoaderProps }                 from "./AppProgressLoader";
export type { AppCarouselProps }                       from "./AppCarousel";
export type { AppContextMenuProps, ContextMenuItem }   from "./AppContextMenu";
export type { AppActionSheetProps, AppActionSheetAction } from "./AppActionSheet";
export type { AppAlertPopupProps, AlertButton }        from "./AppAlertPopup";
export type { AppTooltipProps }                        from "./AppTooltip";
export type { AppRangeSliderProps }                    from "./AppRangeSlider";
export type { AppColorPickerProps }                    from "./AppColorPicker";
```

**Step 2: Verify full build**

```bash
cd multi-repo-nextjs && npm run build
```

Expected: Clean build. All 11 components type-check. No lint errors.

**Step 3: Commit**

```bash
git add app/components/Native/index.ts
git commit -m "feat(native): add barrel export for all Native wrappers"
```

---

## Task 13: Update docs/components.md

**Files:**
- Modify: `docs/components.md`

**Step 1: Add a "Native Wrappers" section**

Open `docs/components.md` and append a new section:

```markdown
## Native Component Wrappers

Web equivalents of `multi-repo-ios/Components/Native/App*.swift`.
Styled wrappers over shadcn/Radix primitives. Styling config lives at the
top of each file — change tokens there to restyle everywhere.

| Component | Web File | iOS File | Primitive |
|-----------|----------|----------|-----------|
| AppNativePicker | `app/components/Native/AppNativePicker.tsx` | `Components/Native/AppNativePicker.swift` | shadcn Select |
| AppDateTimePicker | `app/components/Native/AppDateTimePicker.tsx` | `Components/Native/AppDateTimePicker.swift` | shadcn Calendar + Popover |
| AppBottomSheet | `app/components/Native/AppBottomSheet.tsx` | `Components/Native/AppBottomSheet.swift` | shadcn Drawer (vaul) |
| AppProgressLoader | `app/components/Native/AppProgressLoader.tsx` | `Components/Native/AppProgressLoader.swift` | shadcn Progress + CSS spinner |
| AppCarousel | `app/components/Native/AppCarousel.tsx` | `Components/Native/AppCarousel.swift` | shadcn Carousel (Embla) |
| AppContextMenu | `app/components/Native/AppContextMenu.tsx` | `Components/Native/AppContextMenu.swift` | shadcn ContextMenu + DropdownMenu |
| AppActionSheet | `app/components/Native/AppActionSheet.tsx` | `Components/Native/AppActionSheet.swift` | shadcn AlertDialog |
| AppAlertPopup | `app/components/Native/AppAlertPopup.tsx` | `Components/Native/AppAlertPopup.swift` | shadcn AlertDialog |
| AppTooltip | `app/components/Native/AppTooltip.tsx` | `Components/Native/AppTooltip.swift` | shadcn Tooltip |
| AppRangeSlider | `app/components/Native/AppRangeSlider.tsx` | `Components/Native/AppRangeSlider.swift` | shadcn Slider (dual-thumb) |
| AppColorPicker | `app/components/Native/AppColorPicker.tsx` | `Components/Native/AppColorPicker.swift` | `<input type="color">` |

**Deferred:** AppPageHeader, AppBottomNavBar (no direct web equivalent yet)
```

**Step 2: Commit**

```bash
git add docs/components.md
git commit -m "docs: add Native wrapper section to components.md"
```

---

## Task 14: Update CLAUDE.md + Automation

**Files:**
- Modify: `multi-repo-nextjs/CLAUDE.md` (or root `CLAUDE.md`)

**Step 1: Add Native wrapper table to CLAUDE.md**

In the root `CLAUDE.md`, add a "Native Web Component Wrappers" section modelled on the iOS Native section. Include:
- The same table as `docs/components.md`
- Rule: "Always use `App*` wrappers from `app/components/Native/` instead of raw shadcn/Radix primitives in screen/page files"
- Note on styling: "Change tokens in the `const styling` block at the top of each file"

**Step 2: Update native-wrapper-guard hook**

In `.claude/settings.json`, extend the existing `native-wrapper-guard` hook (currently iOS-only) to also fire on Next.js files. Add web patterns to warn about:
- `from "@/components/ui/select"` used directly in a page/screen file
- `from "@/components/ui/drawer"` used directly
- `from "@/components/ui/alert-dialog"` used directly
- etc.

The hook message should say: "Use `AppNativePicker` from `@/app/components/Native` instead of `Select` directly."

**Step 3: Commit**

```bash
git add CLAUDE.md .claude/settings.json
git commit -m "docs(claude): add web native wrapper rules + extend native-wrapper-guard hook"
```

---

## Verification Checklist

Before declaring done, confirm:

- [ ] `npm run build` passes with zero TypeScript errors
- [ ] `npm run lint` passes with zero ESLint errors
- [ ] All 11 components are exported from `app/components/Native/index.ts`
- [ ] Every component has a `const styling` block at the top with only semantic tokens
- [ ] No `var(--color-*)` primitive tokens used in component files
- [ ] `docs/components.md` has the Native section
- [ ] `CLAUDE.md` has the Native wrapper table + rules
- [ ] All commits are clean and atomic

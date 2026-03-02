# Design Guidelines

Universal design guidelines for building screens and features across all platforms. These are **standards**, not rigid rules — they establish a comfortable baseline that keeps layouts readable, touch-friendly, and visually consistent.

> These guidelines govern **usage** of the existing design system (tokens, components, patterns). They do not redefine component internals.

---

## 1. Layout & Spacing

### Page-Level Spacing

| Context | Value | Token |
|---------|-------|-------|
| Horizontal content padding (mobile) | 24px | `space-6` / `CGFloat.spaceLG` / `Spacing.LG` |
| Horizontal content padding (desktop) | 32–40px | `space-8` to `space-10` |
| Vertical space between major sections | 32–40px | `space-8` to `space-10` |
| Vertical space between form groups | 16–20px | `space-4` to `space-5` |
| Vertical space between fields in a form group | 12px | `space-3` |
| Section header to its content | 8–12px | `space-2` to `space-3` |
| Max content width (desktop) | 1400px | Constrain with `max-w-[1400px] mx-auto` / `frame(maxWidth: 1400)` |

### Spacing Rhythm

Use the 4px grid. All spacing values should be multiples of 4. The standard scale:

```
4 → 8 → 12 → 16 → 20 → 24 → 32 → 40 → 48 → 64 → 80 → 96
```

**Guideline:** Within a section, stick to 2–3 spacing values for visual rhythm. Avoid mixing 5+ different gaps in one area — it reads as noisy.

### Vertical Flow

Sections should breathe. Use generous vertical spacing (32–40px) between distinct content blocks, and tighter spacing (12–16px) within related groups. This creates a clear visual hierarchy without relying on dividers.

```
[Page Header]
    ↕ 32–40px
[Section A]
    ↕ 16–20px (within section — form group to form group)
    ↕ 12px (within group — field to field)
    ↕ 32–40px
[Section B]
```

---

## 2. Typography Usage

### Recommended Pairings

These are the **common reach-for** roles. The full 28-role type scale is available, but most screens need only 3–4 of these:

| Purpose | Role | Size | Weight |
|---------|------|------|--------|
| Page title | `title-lg` | 28px | Bold |
| Section header | `title-sm` | 20px | Bold |
| Card/item title | `body-lg-em` | 16px | Medium |
| Body text | `body-md` | 14px | Regular |
| Secondary/supporting text | `body-sm` | 12px | Regular |
| Helper text, timestamps | `caption-md` | 12px | Regular |
| Tiny metadata | `caption-sm` | 10px | Regular |
| Button/action labels | `cta-*` (size-matched) | — | Semibold |
| Category labels, overlines | `overline-*` | 8–12px | Bold + tracking |

### Screen Typography Limits

Aim for **3–4 distinct type sizes** per screen or view. More than 5 creates visual noise. If you find yourself reaching for a 6th size, reconsider the information hierarchy.

### Weight Hierarchy

Use weight to create emphasis within the same size:
- **Regular (400):** Default body text
- **Medium (500):** Emphasized body, labels, links
- **Semibold (600):** CTAs, action text
- **Bold (700):** Headings, titles

Avoid using Bold for body text — it competes with headings.

---

## 3. Color & Emphasis

### Emphasis Levels

Limit to **2–3 emphasis levels per section**:

| Level | Typography Token | Icon Token | When to Use |
|-------|-----------------|------------|-------------|
| Primary | `typography-primary` | `icons-primary` | Main content, titles, active states |
| Secondary | `typography-secondary` | `icons-secondary` | Supporting text, subtitles |
| Muted | `typography-muted` | `icons-muted` | Timestamps, placeholders, disabled-adjacent |

Don't mix all three in a single line of text. A label + value pair should use at most 2 levels (e.g., muted label, primary value).

### Brand vs Accent

| Token Family | Color | Use For |
|-------------|-------|---------|
| **Brand** (`surfaces-brand-interactive`) | Primary neutral (zinc) | Primary CTAs, navigation active states, key toggles |
| **Accent** (`surfaces-accent`) | Accent color (indigo) | Secondary highlights, links, badges that need to stand out from brand |

**Guideline:** Brand is for actions, Accent is for highlights. A screen can have many brand-colored elements (buttons, active tabs), but accent should be used sparingly to draw attention.

### Semantic Colors

Use semantic color tokens (`success`, `warning`, `error`) only for their intended purpose:
- **Success (green):** Confirmation, completion, positive states
- **Warning (amber):** Caution, non-blocking issues, pending states
- **Error (red):** Failures, destructive actions, validation errors

Never use semantic colors decoratively. A green badge that doesn't mean "success" is misleading.

### Background Layering

Build depth through surface tokens, not shadows:

| Layer | Token | Example |
|-------|-------|---------|
| Page background | `surfaces-base-primary` | Full page behind content |
| Card / elevated surface | `surfaces-base-low-contrast` | Cards, input backgrounds, grouped content |
| Active / pressed element | `surfaces-base-low-contrast-pressed` | Selected chip, pressed state |

Keep to **2–3 surface layers** per screen. More layers create visual clutter.

---

## 4. Touch Targets & Interaction

### Minimum Touch Targets

| Context | Minimum Size | Standard |
|---------|-------------|----------|
| Standalone tappable element | 44pt / 44dp | Apple HIG |
| Inline tappable element (within list row) | 36pt / 36dp | Acceptable when row itself is 44pt+ |
| Icon-only button | 44pt / 44dp | Even if icon is 20pt, container must be 44pt |

**Guideline:** On mobile, prefer `lg` size variants of chips, buttons, and tabs. The `sm` size (24px height) is designed for compact desktop layouts and tight inline contexts — not as a primary mobile touch target.

### Mobile-First Sizing

| Component | Mobile Preference | Desktop OK |
|-----------|------------------|------------|
| Buttons (primary CTA) | `lg` (48px) | `md` (36px) |
| Chips in tab bars | `md` or `lg` | `sm` or `md` |
| Icon buttons (standalone) | `lg` (48px) | `md` (36px) |
| Form inputs | Full width, 48px+ height | Can be narrower |

### Interaction Feedback

Every tappable element must provide immediate visual feedback:
- **Buttons/chips:** Background color shift on press (via `*-pressed` tokens)
- **List rows:** Subtle background highlight on press
- **iOS:** Haptic feedback on primary actions (`.medium` for primary, `.light` for secondary)
- **Never:** Silent taps with no visual change

---

## 5. Motion & Animation

### Standard Timing

| Duration | Name | Use For |
|----------|------|---------|
| 100ms | Quick | Toolbar toggles, icon swaps, micro-interactions |
| 150ms | Normal | Button press/release, color transitions, chip state changes |
| 200ms | Moderate | Tab sliding, segment control thumb, expanding sections |
| 300ms | Slow | Sheet entrance, page transitions, toast entrance |

### Standard Curves

| Curve | Use For |
|-------|---------|
| `ease-out` | State transitions (press, hover, focus) — fast start, gentle land |
| `ease-in-out` | Position changes (sliding, expanding) — smooth both ends |
| `spring(response: 0.4, dampingFraction: 0.8)` | Overlay entrances (toasts, sheets) — bouncy, alive |

### Motion Principles

- **Transitions, not animations.** State changes should feel instant and responsive, not theatrical. Avoid animation for animation's sake.
- **Match duration to distance.** A color change needs 150ms. A sheet sliding up 400px needs 300ms. Scale timing with how far something moves.
- **Exit faster than enter.** Dismissals should be 20–30% faster than entrances. Users don't want to wait for things to leave.

---

## 6. Component Usage

### Button Hierarchy

- **One primary CTA per view.** The most important action gets `primary` variant. Everything else is `secondary` or `tertiary`.
- **Destructive actions use `danger` variant.** Never use `primary` (brand color) for delete/remove actions.
- **Tertiary for low-emphasis actions.** Cancel, dismiss, "maybe later" — things the user can skip.
- **Icon-only buttons for repeated actions.** In toolbars, list rows, and compact spaces. Always pair with accessibility label.

### Chip Variant Selection

| Variant | When to Use | Example |
|---------|-------------|---------|
| `chipTabs` | Switching between content views (acts like tabs) | "All / Active / Completed" |
| `filters` | Toggling filter criteria (can multi-select) | "Unread / Starred / Has Attachment" |
| `segmentControl` | Mutually exclusive modes in a contained bar | "List / Grid / Map" |

### Toast vs Inline Feedback

| Feedback Type | Use Toast | Use Inline |
|---------------|-----------|------------|
| Form field validation | Never | Always (below the field) |
| Form submission success | Yes | No |
| Network error (transient) | Yes | No |
| Permission denied | Yes (with action) | No |
| Background task complete | Yes | No |
| Field-specific format error | Never | Always |

**Rule:** If the error is about a specific field, show it inline. If it's about the whole operation, show a toast.

### Input Field Patterns

- **Always show a label.** Placeholder text alone is not sufficient — it disappears on input.
- **Group related fields.** Name + email in one group, address fields in another. Separate groups with 16–20px.
- **Helper text below, not above.** Hints appear below the field. Use `caption-md` in `typography-muted`.
- **Validation state replaces helper text.** When an error appears, it takes the helper text position — don't show both.

### List Patterns

- **Consistent row height within a list.** Don't mix 2-line and 4-line items in the same list unless there's a clear visual reason.
- **Trailing actions stay consistent.** If some rows have a chevron, all rows should (or use a different list section for actionless items).
- **Dividers between rows, not after the last item.** Use `row` divider variant (hairline, muted).

---

## 7. Responsive Layout

### Breakpoint Strategy

| Breakpoint | Web | iOS | Android |
|-----------|-----|-----|---------|
| Compact (mobile) | < 768px | `horizontalSizeClass == .compact` | `WindowWidthSizeClass.Compact` |
| Regular (desktop/tablet) | >= 768px | `horizontalSizeClass == .regular` | `WindowWidthSizeClass.Medium` or `Expanded` |

### Layout Behavior

| Element | Compact | Regular |
|---------|---------|---------|
| Navigation | Bottom tab bar | Collapsible sidebar |
| Content width | Full width (with 24px padding) | Constrained to 1400px max |
| Modals / sheets | Bottom sheet (full width) | Centered modal (max 600px) |
| List + detail | Push navigation (stacked) | Side-by-side split |
| Form layout | Single column | Can use 2-column for short fields |
| Primary CTA | Full width or prominent | Can be inline/right-aligned |

### Responsive Typography

The type scale stays the same across breakpoints — **don't scale font sizes with viewport**. What changes is:
- Content width (narrower = more line breaks)
- Layout direction (stack → side-by-side)
- Component density (can use `md` size buttons on desktop, `lg` on mobile)

---

## 8. Accessibility

### Contrast Requirements

Target **WCAG AA** compliance:
- Body text (< 18px): **4.5:1** contrast ratio against background
- Large text (>= 18px bold or >= 24px regular): **3:1** contrast ratio
- UI components and graphical objects: **3:1** contrast ratio

The semantic token system is designed to meet these thresholds in both light and dark mode. Don't override token values without checking contrast.

### Focus & Keyboard

- All interactive elements must be reachable via keyboard (Tab / Shift+Tab)
- Visible focus indicator: `ring-2` using semantic border tokens
- Focus order should match visual reading order (top-to-bottom, left-to-right)
- Modal focus trapping: when a sheet/dialog is open, Tab stays within it

### Screen Reader

- Every interactive element needs an accessible label (text content counts)
- Icon-only buttons **must** have `aria-label` / `accessibilityLabel`
- Decorative elements (dividers, background shapes) should be hidden from screen readers
- Form inputs must be associated with their labels
- State changes (selected, expanded, disabled) must be announced

### Reduced Motion

Respect `prefers-reduced-motion` (web) and accessibility motion settings (iOS/Android):
- Replace transitions with instant state changes
- Remove parallax and continuous animation
- Keep functional animation (progress indicators) but simplify

---

## 9. Dark Mode

Dark mode is a **first-class citizen** — not an afterthought.

### Guidelines

- **Design for both modes simultaneously.** Every screen should be reviewed in both light and dark.
- **Never hardcode colors.** All colors come from semantic tokens, which auto-adapt.
- **Shadows become less effective in dark mode.** Use surface layering (different background shades) instead of shadow elevation.
- **Test images and illustrations.** Photos work fine; illustrations with white backgrounds or light-colored elements may need dark-mode variants.
- **Borders become more important in dark mode.** In light mode, surface contrast alone may suffice. In dark mode, subtle borders (`border-muted`) help distinguish elements.

---

## 10. Content & Writing

### Casing Conventions

| Element | Case | Example |
|---------|------|---------|
| Page titles | Title Case | "User Profile" |
| Section headers | Title Case | "Account Settings" |
| Button labels | Title Case | "Save Changes" |
| Input labels | Sentence case | "Email address" |
| Placeholder text | Sentence case | "Enter your email" |
| Toast messages | Sentence case | "Changes saved successfully" |
| Error messages | Sentence case | "This field is required" |
| Tab / chip labels | Title Case | "All Items" |

### Error Messages

- **Be specific.** "This field is required" > "Error"
- **Suggest a fix.** "Password must be at least 8 characters" > "Invalid password"
- **Don't blame the user.** "We couldn't find that account" > "Wrong email"
- **Use the field label in the message.** "Email is required" > "This field is required" (when context isn't obvious)

### Empty States

Empty states should have 3 elements:
1. **Illustration or icon** (optional but encouraged)
2. **Headline** — what's empty, in plain language ("No messages yet")
3. **CTA** — the next action ("Compose your first message")

Avoid long explanatory paragraphs. One short sentence + one button.

---

## 11. Platform Parity vs Divergence

### Must Match Across Platforms

- Information architecture (same screens, same data, same navigation structure)
- Feature availability (if it exists on web, it exists on mobile — unless marked platform-specific)
- Typography hierarchy (same relative sizing and weight relationships)
- Color application (same tokens, same semantic meaning)
- Component selection (same component types for same use cases)

### Acceptable Platform Differences

- **Haptics:** iOS provides haptic feedback; web and Android don't (or use vibration API sparingly)
- **Navigation transitions:** iOS uses native push/pop; web uses route transitions; Android uses Compose animations. Each follows its platform convention.
- **System UI integration:** iOS uses native pickers/sheets; web uses shadcn equivalents; Android uses Material 3 wrappers
- **Corner radius scaling:** Web scales radius up on desktop (responsive tokens); iOS uses fixed mobile-appropriate values
- **Keyboard handling:** Platform-native behavior for input focus, keyboard avoidance, etc.

### Rule of Thumb

If a user switches from iOS to web, the app should feel **familiar but native** to each platform. Same content, same flow, platform-appropriate chrome.

---

## 12. Composition Patterns

### Card Pattern

When grouping related content into a visual container:
- Background: `surfaces-base-low-contrast`
- Padding: 16px (`space-4`)
- Corner radius: `radius-md` (12px mobile, 16px desktop)
- No border by default — use surface contrast. Add `border-muted` only if surfaces are too similar.

### Form Pattern

```
[Section Header — title-sm]
    ↕ 8–12px
[Input Field]
    ↕ 12px
[Input Field]
    ↕ 16–20px
[Section Header — title-sm]
    ↕ 8–12px
[Input Field]
    ↕ 32–40px
[Primary CTA — full width on mobile]
```

### Header + Content Pattern

```
[Page Title — title-lg]
[Subtitle — body-md, typography-secondary]
    ↕ 24–32px
[Content]
```

### Action Bar Pattern

For screens with a primary action that should stay visible:
- Fixed to bottom on mobile (safe area padding included)
- Inline at bottom of content on desktop
- Background: `surfaces-base-primary` with top `border-muted`
- Padding: 16px horizontal, 12px vertical

---

## Quick Reference Card

```
Page padding:       24px mobile / 32–40px desktop
Section gap:        32–40px
Form group gap:     16–20px
Field gap:          12px
Max content width:  1400px
Primary CTA:        1 per view, lg on mobile
Touch target:       44pt minimum
Type sizes/screen:  3–4 max
Emphasis levels:    2–3 per section
Surface layers:     2–3 per screen
WCAG level:         AA (4.5:1 body, 3:1 large text)
Animation default:  150ms ease-out
```

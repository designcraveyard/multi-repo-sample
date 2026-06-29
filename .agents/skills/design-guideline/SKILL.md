---
name: design-guideline
description: >
  Background knowledge for universal design guidelines. Automatically loaded
  by other skills (new-screen, build-feature, wireframe, complex-component,
  component-audit, screen-reviewer) to enforce layout, spacing, typography,
  color, motion, and accessibility standards. Can also be invoked directly
  via /design-guideline to review or discuss the guidelines.
allowed-tools: Read, Glob, Grep
---

# /design-guideline — Universal Design Guidelines

## Purpose

This skill provides the canonical design guidelines that govern how screens, features, and components are composed across all platforms. It does NOT modify component internals — it governs **usage**.

The full reference lives at `docs/design/design-guidelines.md`. This skill provides the condensed rules that other skills and agents should enforce.

## When This Skill Loads

- Directly via `/design-guideline` — to review, discuss, or audit against guidelines
- As a reference dependency from other skills (loaded by reading the guidelines doc)

## Phase 1: Load Guidelines

Read `docs/design/design-guidelines.md` for the full reference.

## Phase 2: Apply Context

When invoked directly, answer the user's question using the guidelines. When loaded as a dependency, enforce the relevant sections.

---

## Quick Reference (for dependent skills)

These are the key rules other skills should enforce. Full rationale in the doc.

### Layout

- **Page padding:** 24px (mobile) / 32–40px (desktop) — `space-6` / `space-8` to `space-10`
- **Section gap:** 32–40px — `space-8` to `space-10`
- **Form group gap:** 16–20px — `space-4` to `space-5`
- **Field gap:** 12px — `space-3`
- **Header to content:** 8–12px — `space-2` to `space-3`
- **Max content width:** 1400px on desktop
- **Stick to 2–3 spacing values** within a section for visual rhythm

### Typography

- **3–4 distinct type sizes per screen** — more than 5 is visual noise
- **Common pairings:** page title = `title-lg`, section header = `title-sm`, body = `body-md`, helper = `caption-md`, CTA = `cta-*`
- **Weight hierarchy:** Regular (body) → Medium (emphasis) → Semibold (CTA) → Bold (headings only)

### Color & Emphasis

- **2–3 emphasis levels per section** (primary / secondary / muted)
- **Brand for actions, Accent for highlights** — don't swap them
- **Semantic colors only for their meaning** (green = success, not decoration)
- **2–3 surface layers per screen** — more creates clutter

### Touch & Interaction

- **Minimum touch target: 44pt** — prefer `lg` variants on mobile
- **Every tappable element must show press feedback** — no silent taps
- **One primary CTA per view** — everything else is secondary or tertiary
- **Destructive = danger variant** — never brand color for delete

### Motion

- **Quick (100ms):** micro-interactions, icon swaps
- **Normal (150ms):** button press, color transitions — `ease-out`
- **Moderate (200ms):** sliding elements — `ease-in-out`
- **Slow (300ms):** sheet/toast entrance — spring curve
- **Exit 20–30% faster than enter**

### Component Selection

- **Chips:** `chipTabs` for view switching, `filters` for criteria toggling, `segmentControl` for mode selection
- **Toast vs inline:** field-specific → inline; operation-level → toast
- **Input labels always visible** — no placeholder-only fields
- **Dividers between rows, not after the last item**

### Responsive

- Compact < 768px / Regular >= 768px
- Bottom tabs (compact) → sidebar (regular)
- Bottom sheet (compact) → centered modal (regular)
- Push nav (compact) → split view (regular)
- Content: full width + 24px pad (compact) → max 1400px (regular)

### Accessibility

- **WCAG AA:** 4.5:1 body text, 3:1 large text and UI components
- **Focus visible** on all interactive elements
- **Icon-only buttons must have accessible labels**
- **Respect reduced motion** preferences

### Content

- **Title Case** for page titles, section headers, button labels, tab labels
- **Sentence case** for input labels, placeholders, toasts, errors
- **Error messages:** specific, suggest a fix, don't blame the user
- **Empty states:** headline + CTA (illustration optional)

### Platform Parity

- Same screens, same data, same navigation structure
- Platform-native chrome (pickers, transitions, haptics)
- If a user switches platforms, the app should feel familiar but native

---

## Enforcement Checklist (for skills/agents)

When reviewing or building a screen, check:

- [ ] Page padding matches guideline (24px mobile / 32–40px desktop)
- [ ] Section spacing is 32–40px
- [ ] Form groups separated by 16–20px, fields by 12px
- [ ] Desktop content constrained to max 1400px
- [ ] No more than 4 distinct type sizes on the screen
- [ ] Weight hierarchy respected (bold only for headings)
- [ ] Emphasis levels limited to 2–3 per section
- [ ] Only 1 primary CTA per view
- [ ] Touch targets >= 44pt on mobile (lg variants preferred)
- [ ] All tappable elements show press feedback
- [ ] Semantic colors used correctly (green = success, red = error)
- [ ] Both light and dark mode reviewed
- [ ] Empty states have headline + CTA
- [ ] Error messages are specific and helpful

---
name: ios-design
description: >
  Generate high-fidelity iOS 26 Liquid Glass screen mockups as single
  self-contained HTML files. iPhone + iPad frames side-by-side with full
  glass effects, SF Pro typography, Dynamic Island, and interactive behaviors.
  Reads theme.md and PRDs for context. Standalone skill.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# /ios-design — iOS 26 Liquid Glass Screen Mockups

## Purpose

Generate pixel-accurate, interactive iOS 26 / iPadOS 26 screen mockups as
**single self-contained HTML files**. Each file renders iPhone (390x844) and
iPad (1024x1366) frames side-by-side with full Liquid Glass effects —
backdrop blur, specular highlights, vibrancy, scroll-triggered morphing, and
spring sheet animations. Output is ready for browser preview, stakeholder
demos, and as visual specs before SwiftUI implementation.

**Liquid Glass is ONLY for navigation and control layers** (tab bars, nav bars,
sidebars, floating controls, sheets). Content areas (lists, cards, media,
forms) are NEVER glassed. This enforces Apple's iOS 26 design hierarchy:
content is primary, controls are functional overlay.

---

## Usage

```
/ios-design <ScreenName|description>       # single screen, 1 variation
/ios-design <Name> --dark                  # dark mode only
/ios-design <Name> --both                  # light + dark with toggle
/ios-design <Name> --variations 3          # 3 layout variations
/ios-design <Name> --pattern settings      # force archetype
/ios-design --iterate <Name>               # refine existing mockup
```

`$ARGUMENTS` contains the raw invocation string. Parse it before Phase 1.

---

## Phase 0: Parse Arguments

Extract from `$ARGUMENTS`:

- `screen_name` — PascalCase name or quoted plain-English description
- `--dark` — dark mode only (light is default)
- `--both` — light + dark with toggle
- `--variations N` — number of variations (default 1, max 3)
- `--pattern <archetype>` — force a specific archetype from the built-in library
- `--iterate` — refine an existing HTML file

Convert `screen_name` to:
- **kebab-case** for file names: `UserProfile` becomes `user-profile`
- **Human title** for display: `UserProfile` becomes "User Profile"

Determine `color_mode`:
- Default → `light`
- `--dark` → `dark`
- `--both` → `both` (generates toggle)

---

## Phase 1: Context Gathering

Read existing project context. **All sources are optional** — the skill works
standalone with just a plain-English description.

### 1a. Theme context

```
Read: docs/design/theme.md
```

If found, extract:
- **Accent color** hex value → override `--accent` CSS variable
- **Brand personality** → inform visual tone (playful vs. professional)
- **Style descriptors** → guide atmosphere choices
- **Shape language** → inform radius preferences

### 1b. Screen specs

```
Glob: docs/PRDs/**/*.md
Grep: pattern=<ScreenName|description keywords>, path=docs/
```

If matching PRD found, extract:
- Screen purpose and user stories
- Key actions and content elements
- Data shape (list items, cards, form fields)

### 1c. Component context

```
Read: docs/components.md (if exists)
Read: docs/design/information-architecture.md (if exists)
```

Extract:
- Available component names for realistic content references
- Navigation structure: tab bar items, where this screen sits in hierarchy
- Active tab for this screen

### 1d. Fallback: Ask the user

If no `screen_name` was provided AND no project context exists, use
`AskUserQuestion` with the archetype picker:

> "What screen should I design?"
> Options: Settings, Profile, List, Chat, Dashboard, Feed, Form, Search, Gallery, Media Player, Onboarding, Map, Empty State, Tab Overview, List-Detail

---

## Phase 2: Screen Planning

### 2a. Archetype matching

Match the screen description to the closest built-in archetype (see
**Screen Pattern Library** below). If `--pattern` was specified, use that
directly.

### 2b. Content planning

For each variation, plan:

- **Navigation:** Tab bar items + active tab, nav bar title + actions, back button
- **Content inventory:** Section headers, list items, card content, form fields — all with realistic labels (never lorem ipsum)
- **Glass elements:** Which surfaces get Liquid Glass (always: tab bar + nav bar; conditional: sidebar, search bar, floating buttons, segmented control, toolbar, sheet)
- **iPad adaptation:** Sidebar (replaces tab bar), split view, inspector, or centered content column
- **Interactive elements:** Which tabs switch, what scrolling does, any sheet triggers

### 2c. Variation planning (if --variations > 1)

For each variation, define:
```
V1: <Short title>
  Layout:       [archetype variant]
  iPhone:       [description]
  iPad:         [description]
  Key tradeoff: [what this gives up vs. wins]
```

### 2d. Confirmation

Show the plan summary to the user. Wait for confirmation before generating.

---

## Phase 3: Generate HTML

### 3a. Create output directory

```bash
mkdir -p docs/design/ios-screens
```

### 3b. Write HTML file

Write a single self-contained HTML file to:
`docs/design/ios-screens/<kebab-name>.html`

The file structure follows this exact template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><HumanTitle> — iOS Design</title>
  <style>
    /* ========================================================
       Liquid Glass Design System (iOS 26)
       Self-contained — no external dependencies
       ======================================================== */

    /* [Full CSS from the Liquid Glass CSS Reference below] */
  </style>
</head>
<body>
  <!-- === Page Header === -->
  <div class="page-header">
    <h1><HumanTitle></h1>
    <p class="page-sub">iOS 26 Liquid Glass</p>
  </div>

  <!-- === Variation Strip (if variations > 1) === -->
  <div class="variation-strip">
    <button class="variation-tab active" onclick="showVariation('v1', this)">V1: ...</button>
    <button class="variation-tab" onclick="showVariation('v2', this)">V2: ...</button>
  </div>

  <!-- === Mode Toggle (if --both) === -->
  <div class="mode-strip">
    <button class="mode-tab active" onclick="setMode('light', this)">Light</button>
    <button class="mode-tab" onclick="setMode('dark', this)">Dark</button>
  </div>

  <!-- === Variation Panel === -->
  <div class="variation-panel active" id="panel-v1">
    <div class="ios-stage" data-mode="light">

      <!-- ========== iPhone (390x844) ========== -->
      <div class="ios-device ios-iphone">
        <!-- Status Bar -->
        <div class="ios-status-bar">
          <span class="status-time">9:41</span>
          <div class="ios-dynamic-island"></div>
          <div class="status-icons">
            <svg class="status-icon" viewBox="0 0 16 12"><!-- signal --><rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.3"/></svg>
            <svg class="status-icon" viewBox="0 0 16 12"><!-- wifi --><path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM3.5 7.5C5 6 6.5 5.2 8 5.2s3 .8 4.5 2.3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M1 4.8C3.2 2.5 5.5 1.2 8 1.2s4.8 1.3 7 3.6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
            <svg class="status-icon battery" viewBox="0 0 27 13"><!-- battery --><rect x="0" y="0.5" width="23" height="12" rx="2.5" stroke="currentColor" stroke-width="1" fill="none"/><rect x="2" y="2.5" width="18" height="8" rx="1" fill="currentColor"/><path d="M25 4.5v4a2 2 0 000-4z" fill="currentColor" opacity="0.4"/></svg>
          </div>
        </div>

        <!-- Screen Content -->
        <div class="ios-screen" id="iphone-screen-v1">
          <!-- Glass Nav Bar -->
          <div class="glass-nav-bar" id="iphone-nav-v1">
            <div class="nav-large-title"><!-- LARGE TITLE --></div>
            <div class="nav-inline">
              <span class="nav-back"><!-- if needed --></span>
              <span class="nav-title"><!-- INLINE TITLE --></span>
              <span class="nav-action"><!-- if needed --></span>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="scroll-content" id="iphone-scroll-v1">
            <!-- [SCREEN-SPECIFIC CONTENT] -->
          </div>

          <!-- Glass Tab Bar -->
          <div class="glass-tab-bar" id="iphone-tabs-v1">
            <!-- TAB ITEMS -->
          </div>
        </div>

        <!-- Home Indicator -->
        <div class="ios-home-indicator"></div>
      </div>

      <!-- ========== iPad (1024x1366) ========== -->
      <div class="ios-device ios-ipad">
        <!-- Status Bar (iPad) -->
        <div class="ios-status-bar ipad">
          <span class="status-time">9:41</span>
          <div class="status-icons">
            <svg class="status-icon" viewBox="0 0 16 12"><rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor" opacity="0.3"/></svg>
            <svg class="status-icon" viewBox="0 0 16 12"><path d="M8 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM3.5 7.5C5 6 6.5 5.2 8 5.2s3 .8 4.5 2.3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M1 4.8C3.2 2.5 5.5 1.2 8 1.2s4.8 1.3 7 3.6" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>
            <svg class="status-icon battery" viewBox="0 0 27 13"><rect x="0" y="0.5" width="23" height="12" rx="2.5" stroke="currentColor" stroke-width="1" fill="none"/><rect x="2" y="2.5" width="18" height="8" rx="1" fill="currentColor"/><path d="M25 4.5v4a2 2 0 000-4z" fill="currentColor" opacity="0.4"/></svg>
          </div>
        </div>

        <!-- Screen Content (iPad layout) -->
        <div class="ios-screen ipad-layout">
          <!-- Glass Sidebar -->
          <div class="glass-sidebar" id="ipad-sidebar-v1">
            <!-- SIDEBAR CONTENT -->
          </div>

          <!-- Main Content -->
          <div class="ipad-main">
            <div class="glass-nav-bar ipad-nav" id="ipad-nav-v1">
              <div class="nav-inline">
                <span class="nav-title"><!-- TITLE --></span>
                <span class="nav-action"><!-- if needed --></span>
              </div>
            </div>
            <div class="scroll-content" id="ipad-scroll-v1">
              <!-- [IPAD SCREEN-SPECIFIC CONTENT] -->
            </div>
          </div>
        </div>

        <!-- Home Indicator (iPad) -->
        <div class="ios-home-indicator ipad"></div>
      </div>

    </div>
  </div>

  <script>
    /* [Interactive behaviors JS — see JS Reference below] */
  </script>
</body>
</html>
```

---

## Phase 4: Present & Next Steps

After writing the file, show:

```
## iOS Design: <HumanTitle>

**File:** docs/design/ios-screens/<kebab>.html

### Frames
- iPhone (390x844) — <archetype description>
- iPad (1024x1366) — <iPad adaptation description>
- Mode: Light [+ Dark toggle]
- Variations: N

### Interactive
- Tab bar switching (click tabs)
- Scroll-triggered glass morphing (scroll content area)
- [Sheet presentation (click trigger)]

### Next steps
- `/ios-design --iterate <Name>` to refine
- `/ios-design <AnotherScreen>` for more screens
- `/send-to-figma` to push to Figma
- `/build-feature <Name>` to implement in SwiftUI
```

---

## Phase 4b: Iterate Mode

If `--iterate` was passed:

1. Read existing `docs/design/ios-screens/<kebab>.html`
2. Ask: "What would you like to change?" (free text)
3. Parse feedback → determine which sections to modify (nav, content, tabs, layout, colors)
4. Edit only the affected HTML sections using the Edit tool
5. If adding variations, add new `.variation-panel` blocks and update tab strip
6. Re-present the updated file

---

# Liquid Glass CSS Reference

This is the **complete inline CSS design system** that goes inside each HTML
file's `<style>` block. Claude MUST use these classes and variables — never
invent ad-hoc styles, hardcoded colors, or custom class names.

## Root Variables

```css
/* ================================================================
   TOKENS: Liquid Glass Design System (iOS 26)
   ================================================================ */
:root {
  /* --- Font Stacks ------------------------------------------------ */
  --sf-pro: -apple-system, BlinkMacSystemFont, "SF Pro Display",
            "SF Pro Text", "Helvetica Neue", system-ui, sans-serif;
  --sf-compact: "SF Compact Rounded", -apple-system, system-ui, sans-serif;
  --sf-mono: "SF Mono", ui-monospace, "Menlo", monospace;

  /* --- iOS Dynamic Type Scale ------------------------------------- */
  --type-large-title: 34px;   /* weight: 700, tracking: 0.37 */
  --type-title1: 28px;        /* weight: 700, tracking: 0.36 */
  --type-title2: 22px;        /* weight: 700, tracking: 0.35 */
  --type-title3: 20px;        /* weight: 600, tracking: 0.38 */
  --type-headline: 17px;      /* weight: 600, tracking: -0.41 */
  --type-body: 17px;          /* weight: 400, tracking: -0.41 */
  --type-callout: 16px;       /* weight: 400, tracking: -0.32 */
  --type-subhead: 15px;       /* weight: 400, tracking: -0.24 */
  --type-footnote: 13px;      /* weight: 400, tracking: -0.08 */
  --type-caption1: 12px;      /* weight: 400, tracking: 0 */
  --type-caption2: 11px;      /* weight: 400, tracking: 0.07 */

  /* --- iOS System Colors ------------------------------------------ */
  --system-blue: #007AFF;
  --system-green: #34C759;
  --system-indigo: #5856D6;
  --system-orange: #FF9500;
  --system-pink: #FF2D55;
  --system-purple: #AF52DE;
  --system-red: #FF3B30;
  --system-teal: #5AC8FA;
  --system-yellow: #FFCC00;
  --system-mint: #00C7BE;
  --system-cyan: #32ADE6;
  --system-brown: #A2845E;

  /* --- Surface Colors (Light) ------------------------------------- */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F2F2F7;
  --bg-tertiary: #FFFFFF;
  --bg-grouped: #F2F2F7;
  --bg-grouped-secondary: #FFFFFF;

  /* --- Liquid Glass Materials (Light) ----------------------------- */
  --glass-ultra-thin: rgba(255, 255, 255, 0.12);
  --glass-thin: rgba(255, 255, 255, 0.22);
  --glass-regular: rgba(255, 255, 255, 0.44);
  --glass-thick: rgba(255, 255, 255, 0.64);
  --glass-chrome: rgba(255, 255, 255, 0.82);

  --glass-blur-sm: 10px;
  --glass-blur-md: 20px;
  --glass-blur-lg: 40px;
  --glass-blur-xl: 80px;

  --glass-border: rgba(255, 255, 255, 0.18);
  --glass-border-strong: rgba(255, 255, 255, 0.32);

  --glass-specular: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.30) 0%,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(255, 255, 255, 0.0) 100%
  );
  --glass-specular-strong: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.50) 0%,
    rgba(255, 255, 255, 0.12) 35%,
    rgba(255, 255, 255, 0.0) 100%
  );

  /* --- Label Colors ----------------------------------------------- */
  --label-primary: rgba(0, 0, 0, 0.85);
  --label-secondary: rgba(60, 60, 67, 0.60);
  --label-tertiary: rgba(60, 60, 67, 0.30);
  --label-quaternary: rgba(60, 60, 67, 0.18);

  /* --- Fill Colors ------------------------------------------------ */
  --fill-primary: rgba(120, 120, 128, 0.20);
  --fill-secondary: rgba(120, 120, 128, 0.16);
  --fill-tertiary: rgba(118, 118, 128, 0.12);
  --fill-quaternary: rgba(116, 116, 128, 0.08);

  /* --- Separator -------------------------------------------------- */
  --separator: rgba(60, 60, 67, 0.12);
  --separator-opaque: #C6C6C8;

  /* --- Shadows ---------------------------------------------------- */
  --shadow-glass: 0 2px 16px rgba(0, 0, 0, 0.08);
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.06),
                 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-float: 0 16px 48px rgba(0, 0, 0, 0.16),
                  0 4px 12px rgba(0, 0, 0, 0.08);

  /* --- Radius Scale ----------------------------------------------- */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-2xl: 26px;
  --radius-card: 20px;
  --radius-sheet: 32px;
  --radius-pill: 9999px;

  /* --- Spacing (4pt grid) ----------------------------------------- */
  --sp-0: 0px;
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;
  --sp-16: 64px;

  /* --- Animation -------------------------------------------------- */
  --ease-ios: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-glass: cubic-bezier(0.22, 1.0, 0.36, 1.0);
  --dur-fast: 200ms;
  --dur-normal: 350ms;
  --dur-slow: 500ms;

  /* --- Brand Accent (override from theme.md if available) --------- */
  --accent: #007AFF;
  --accent-active: #0062CC;
  --on-accent: #FFFFFF;
}
```

## Dark Mode Overrides

```css
[data-mode="dark"] {
  --bg-primary: #000000;
  --bg-secondary: #1C1C1E;
  --bg-tertiary: #2C2C2E;
  --bg-grouped: #000000;
  --bg-grouped-secondary: #1C1C1E;

  --glass-ultra-thin: rgba(44, 44, 46, 0.15);
  --glass-thin: rgba(44, 44, 46, 0.30);
  --glass-regular: rgba(44, 44, 46, 0.52);
  --glass-thick: rgba(44, 44, 46, 0.68);
  --glass-chrome: rgba(44, 44, 46, 0.85);

  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-border-strong: rgba(255, 255, 255, 0.14);

  --glass-specular: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    rgba(255, 255, 255, 0.02) 40%,
    transparent 100%
  );
  --glass-specular-strong: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0.04) 35%,
    transparent 100%
  );

  --label-primary: rgba(255, 255, 255, 0.85);
  --label-secondary: rgba(235, 235, 245, 0.60);
  --label-tertiary: rgba(235, 235, 245, 0.30);
  --label-quaternary: rgba(235, 235, 245, 0.18);

  --fill-primary: rgba(120, 120, 128, 0.36);
  --fill-secondary: rgba(120, 120, 128, 0.32);
  --fill-tertiary: rgba(118, 118, 128, 0.24);
  --fill-quaternary: rgba(116, 116, 128, 0.18);

  --separator: rgba(84, 84, 88, 0.36);
  --separator-opaque: #38383A;

  --shadow-glass: 0 2px 20px rgba(0, 0, 0, 0.30);
  --shadow-card: 0 1px 4px rgba(0, 0, 0, 0.16),
                 0 2px 8px rgba(0, 0, 0, 0.12);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.40);
  --shadow-float: 0 16px 48px rgba(0, 0, 0, 0.45),
                  0 4px 12px rgba(0, 0, 0, 0.20);

  --system-blue: #0A84FF;
  --system-green: #30D158;
  --system-indigo: #5E5CE6;
  --system-orange: #FF9F0A;
  --system-pink: #FF375F;
  --system-purple: #BF5AF2;
  --system-red: #FF453A;
  --system-teal: #64D2FF;
  --system-yellow: #FFD60A;
  --system-mint: #63E6E2;
  --system-cyan: #40C8E0;
  --system-brown: #AC8E68;

  --accent: #0A84FF;
  --accent-active: #409CFF;
}
```

## Layout & Page Shell

```css
/* --- Page Shell --------------------------------------------------- */
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--sf-pro);
  background: #1a1a2e;
  color: var(--label-primary);
  min-height: 100vh;
  padding: var(--sp-8) var(--sp-6);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.page-header {
  text-align: center;
  margin-bottom: var(--sp-6);
  color: rgba(255, 255, 255, 0.9);
}
.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: var(--sp-1);
}
.page-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 400;
}

/* --- Variation Strip ---------------------------------------------- */
.variation-strip, .mode-strip {
  display: flex;
  gap: var(--sp-2);
  justify-content: center;
  margin-bottom: var(--sp-5);
}
.variation-tab, .mode-tab {
  font-family: var(--sf-pro);
  font-size: 13px;
  font-weight: 500;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-ios);
}
.variation-tab.active, .mode-tab.active {
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.3);
}
.variation-panel { display: none; }
.variation-panel.active { display: block; }

/* --- Device Stage ------------------------------------------------- */
.ios-stage {
  display: flex;
  gap: 48px;
  align-items: flex-start;
  justify-content: center;
  flex-wrap: wrap;
}
```

## Device Chrome

```css
/* --- iPhone Frame ------------------------------------------------- */
.ios-device {
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.ios-iphone {
  width: 390px;
  height: 844px;
  border-radius: 54px;
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.15),
              0 20px 60px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

/* --- iPad Frame --------------------------------------------------- */
.ios-ipad {
  width: 1024px;
  height: 768px; /* landscape orientation for side-by-side review */
  border-radius: 26px;
  background: var(--bg-primary);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12),
              0 20px 60px rgba(0, 0, 0, 0.25),
              0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

/* --- Status Bar --------------------------------------------------- */
.ios-status-bar {
  height: 59px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 var(--sp-6) var(--sp-2);
  position: relative;
  z-index: 10;
  color: var(--label-primary);
}
.ios-status-bar.ipad {
  height: 28px;
  align-items: center;
  padding: 0 var(--sp-5);
}
.status-time {
  font-family: var(--sf-pro);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
.ios-status-bar.ipad .status-time { font-size: 14px; }
.status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--label-primary);
}
.status-icon { width: 18px; height: 12px; }
.status-icon.battery { width: 27px; height: 13px; }

/* --- Dynamic Island ----------------------------------------------- */
.ios-dynamic-island {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 126px;
  height: 37px;
  background: #000000;
  border-radius: var(--radius-pill);
  z-index: 20;
}

/* --- Home Indicator ----------------------------------------------- */
.ios-home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 134px;
  height: 5px;
  background: var(--label-tertiary);
  border-radius: var(--radius-pill);
  z-index: 10;
}
.ios-home-indicator.ipad {
  width: 160px;
  bottom: 6px;
}
```

## Screen Container

```css
/* --- Screen Area -------------------------------------------------- */
.ios-screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.ios-screen.ipad-layout {
  flex-direction: row;
}

/* --- Scrollable Content ------------------------------------------- */
.scroll-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 34px; /* safe area */
}
/* Hide scrollbar for aesthetics */
.scroll-content::-webkit-scrollbar { display: none; }
.scroll-content { scrollbar-width: none; }
```

## Liquid Glass Navigation

```css
/* --- Glass Nav Bar ------------------------------------------------ */
.glass-nav-bar {
  position: sticky;
  top: 0;
  z-index: 8;
  backdrop-filter: blur(var(--glass-blur-md));
  -webkit-backdrop-filter: blur(var(--glass-blur-md));
  background: var(--glass-regular);
  border-bottom: 0.5px solid var(--glass-border);
  padding: 0 var(--sp-4);
  transition: all var(--dur-normal) var(--ease-glass);
}
.glass-nav-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-specular);
  pointer-events: none;
  border-radius: inherit;
}

/* Large Title State */
.nav-large-title {
  font-size: var(--type-large-title);
  font-weight: 700;
  letter-spacing: 0.37px;
  color: var(--label-primary);
  padding: var(--sp-1) var(--sp-1) var(--sp-2);
  transition: opacity var(--dur-normal) var(--ease-ios),
              max-height var(--dur-normal) var(--ease-ios);
  max-height: 52px;
  overflow: hidden;
}
.glass-nav-bar.collapsed .nav-large-title {
  opacity: 0;
  max-height: 0;
  padding: 0 var(--sp-1);
}

/* Inline Title State */
.nav-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}
.nav-title {
  font-size: var(--type-headline);
  font-weight: 600;
  color: var(--label-primary);
  opacity: 0;
  transition: opacity var(--dur-normal) var(--ease-ios);
}
.glass-nav-bar.collapsed .nav-title { opacity: 1; }
.nav-back {
  font-size: var(--type-body);
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  cursor: pointer;
}
.nav-action {
  font-size: var(--type-body);
  color: var(--accent);
  font-weight: 400;
  cursor: pointer;
}

/* Scrolled State — increased opacity */
.glass-nav-bar.scrolled {
  background: var(--glass-thick);
  backdrop-filter: blur(var(--glass-blur-lg));
  -webkit-backdrop-filter: blur(var(--glass-blur-lg));
  border-bottom-color: var(--glass-border-strong);
}
.glass-nav-bar.scrolled::before {
  background: var(--glass-specular-strong);
}

/* iPad nav (no large title) */
.glass-nav-bar.ipad-nav {
  padding: 0 var(--sp-5);
}
.glass-nav-bar.ipad-nav .nav-title { opacity: 1; }
.glass-nav-bar.ipad-nav .nav-large-title { display: none; }

/* --- Glass Tab Bar ------------------------------------------------ */
.glass-tab-bar {
  position: absolute;
  bottom: 0;
  left: var(--sp-4);
  right: var(--sp-4);
  height: 56px;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  backdrop-filter: blur(var(--glass-blur-lg));
  -webkit-backdrop-filter: blur(var(--glass-blur-lg));
  background: var(--glass-regular);
  border-radius: var(--radius-2xl);
  border: 0.5px solid var(--glass-border);
  box-shadow: var(--shadow-glass);
  z-index: 8;
  transition: all var(--dur-normal) var(--ease-glass);
}
.glass-tab-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--glass-specular);
  pointer-events: none;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--sp-1) var(--sp-3);
  cursor: pointer;
  border: none;
  background: none;
  position: relative;
  z-index: 1;
  transition: transform var(--dur-fast) var(--ease-spring);
}
.tab-item:active { transform: scale(0.92); }
.tab-item svg {
  width: 24px;
  height: 24px;
  color: var(--label-secondary);
  transition: color var(--dur-fast) var(--ease-ios);
}
.tab-item span {
  font-family: var(--sf-compact);
  font-size: 10px;
  font-weight: 500;
  color: var(--label-secondary);
  transition: color var(--dur-fast) var(--ease-ios);
}
.tab-item.active svg { color: var(--accent); }
.tab-item.active span { color: var(--accent); }

/* --- Glass Sidebar (iPad) ----------------------------------------- */
.glass-sidebar {
  width: 320px;
  height: 100%;
  backdrop-filter: blur(var(--glass-blur-lg));
  -webkit-backdrop-filter: blur(var(--glass-blur-lg));
  background: var(--glass-thin);
  border-right: 0.5px solid var(--glass-border);
  overflow-y: auto;
  padding-top: 28px; /* iPad status bar height */
  flex-shrink: 0;
  position: relative;
}
.glass-sidebar::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--glass-specular);
  pointer-events: none;
}
.glass-sidebar::-webkit-scrollbar { display: none; }
.glass-sidebar { scrollbar-width: none; }

.sidebar-header {
  font-size: var(--type-title2);
  font-weight: 700;
  color: var(--label-primary);
  padding: var(--sp-4) var(--sp-5) var(--sp-3);
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-5);
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-ios);
  border-radius: var(--radius-md);
  margin: 0 var(--sp-2);
}
.sidebar-item:hover { background: var(--fill-quaternary); }
.sidebar-item.active { background: var(--fill-secondary); }
.sidebar-item svg { width: 22px; height: 22px; color: var(--label-secondary); }
.sidebar-item.active svg { color: var(--accent); }
.sidebar-item span {
  font-size: var(--type-body);
  color: var(--label-primary);
}

/* iPad Main Content */
.ipad-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* --- Glass Toolbar ------------------------------------------------ */
.glass-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--sp-2) var(--sp-4);
  backdrop-filter: blur(var(--glass-blur-md));
  -webkit-backdrop-filter: blur(var(--glass-blur-md));
  background: var(--glass-regular);
  border-top: 0.5px solid var(--glass-border);
}
```

## Liquid Glass Controls

```css
/* --- Glass Search Bar --------------------------------------------- */
.glass-search-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  margin: var(--sp-2) var(--sp-4);
  padding: var(--sp-2) var(--sp-3);
  background: var(--fill-tertiary);
  border-radius: var(--radius-md);
  color: var(--label-tertiary);
  font-size: var(--type-body);
}
.glass-search-bar svg { width: 18px; height: 18px; flex-shrink: 0; }
.glass-search-bar span { font-size: var(--type-body); }

/* --- Glass Segmented Control -------------------------------------- */
.glass-segmented {
  display: flex;
  margin: var(--sp-3) var(--sp-4);
  padding: 3px;
  background: var(--fill-tertiary);
  border-radius: var(--radius-sm);
  position: relative;
}
.segment-item {
  flex: 1;
  text-align: center;
  padding: var(--sp-2) var(--sp-3);
  font-family: var(--sf-pro);
  font-size: var(--type-subhead);
  font-weight: 500;
  color: var(--label-primary);
  cursor: pointer;
  border-radius: calc(var(--radius-sm) - 2px);
  border: none;
  background: transparent;
  position: relative;
  z-index: 1;
  transition: color var(--dur-fast) var(--ease-ios);
}
.segment-item.active {
  background: var(--bg-primary);
  box-shadow: var(--shadow-card);
  font-weight: 600;
}

/* --- Glass Floating Button ---------------------------------------- */
.glass-floating-btn {
  position: absolute;
  bottom: 100px;
  right: var(--sp-5);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  backdrop-filter: blur(var(--glass-blur-md));
  -webkit-backdrop-filter: blur(var(--glass-blur-md));
  background: var(--accent);
  color: var(--on-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: var(--shadow-float);
  cursor: pointer;
  z-index: 6;
  transition: transform var(--dur-fast) var(--ease-spring);
}
.glass-floating-btn:active { transform: scale(0.9); }
.glass-floating-btn svg { width: 24px; height: 24px; }

/* --- Glass Sheet -------------------------------------------------- */
.sheet-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  transition: background var(--dur-normal) var(--ease-ios);
  z-index: 14;
}
.sheet-overlay.visible {
  background: rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
.glass-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 70%;
  backdrop-filter: blur(var(--glass-blur-xl));
  -webkit-backdrop-filter: blur(var(--glass-blur-xl));
  background: var(--glass-chrome);
  border-radius: var(--radius-sheet) var(--radius-sheet) 0 0;
  border-top: 0.5px solid var(--glass-border-strong);
  box-shadow: var(--shadow-elevated);
  transform: translateY(100%);
  transition: transform var(--dur-normal) var(--ease-spring);
  z-index: 15;
  overflow-y: auto;
  padding: var(--sp-4);
}
.glass-sheet.presented { transform: translateY(0); }
.glass-sheet::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--glass-specular-strong);
  pointer-events: none;
}
.glass-sheet-handle {
  width: 36px;
  height: 5px;
  background: var(--fill-secondary);
  border-radius: var(--radius-pill);
  margin: 0 auto var(--sp-4);
}

/* --- Glass Pill Control ------------------------------------------- */
.glass-pill-control {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  backdrop-filter: blur(var(--glass-blur-sm));
  -webkit-backdrop-filter: blur(var(--glass-blur-sm));
  background: var(--glass-thin);
  border: 0.5px solid var(--glass-border);
  border-radius: var(--radius-pill);
  font-size: var(--type-subhead);
  color: var(--label-primary);
  cursor: pointer;
}
```

## Content Elements

```css
/* --- Grouped List Section ----------------------------------------- */
.ios-list-section {
  background: var(--bg-grouped-secondary);
  border-radius: var(--radius-md);
  margin: 0 var(--sp-4) var(--sp-4);
  overflow: hidden;
}
.ios-list-header {
  font-size: var(--type-footnote);
  font-weight: 400;
  color: var(--label-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: var(--sp-4) var(--sp-4) var(--sp-2);
}
.ios-list-footer {
  font-size: var(--type-footnote);
  color: var(--label-secondary);
  padding: var(--sp-2) var(--sp-4) var(--sp-3);
}

/* --- List Row ----------------------------------------------------- */
.ios-list-row {
  display: flex;
  align-items: center;
  min-height: 44px;
  padding: var(--sp-3) var(--sp-4);
  gap: var(--sp-3);
  position: relative;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-ios);
}
.ios-list-row:active { background: var(--fill-quaternary); }
.ios-list-row + .ios-list-row {
  border-top: 0.5px solid var(--separator);
  margin-left: var(--sp-4);
  padding-left: 0;
}
.row-icon {
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #FFFFFF;
}
.row-icon svg { width: 18px; height: 18px; }
.row-body {
  flex: 1;
  min-width: 0;
}
.row-label {
  font-size: var(--type-body);
  color: var(--label-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-detail {
  font-size: var(--type-body);
  color: var(--label-secondary);
  white-space: nowrap;
}
.row-chevron {
  color: var(--label-quaternary);
  flex-shrink: 0;
}
.row-chevron svg { width: 14px; height: 14px; }

/* --- Card --------------------------------------------------------- */
.ios-card {
  background: var(--bg-grouped-secondary);
  border-radius: var(--radius-card);
  padding: var(--sp-4);
  margin: 0 var(--sp-4) var(--sp-3);
  box-shadow: var(--shadow-card);
}

/* --- Avatar ------------------------------------------------------- */
.ios-avatar {
  border-radius: 50%;
  background: var(--fill-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--label-secondary);
  flex-shrink: 0;
  overflow: hidden;
}
.ios-avatar.sm { width: 36px; height: 36px; }
.ios-avatar.md { width: 48px; height: 48px; }
.ios-avatar.lg { width: 80px; height: 80px; }
.ios-avatar svg { width: 50%; height: 50%; }

/* --- Toggle ------------------------------------------------------- */
.ios-toggle {
  width: 51px;
  height: 31px;
  border-radius: var(--radius-pill);
  background: var(--fill-primary);
  position: relative;
  cursor: pointer;
  transition: background var(--dur-fast) var(--ease-ios);
  flex-shrink: 0;
}
.ios-toggle.on { background: var(--system-green); }
.ios-toggle::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: transform var(--dur-fast) var(--ease-spring);
}
.ios-toggle.on::after { transform: translateX(20px); }

/* --- Badge -------------------------------------------------------- */
.ios-badge {
  min-width: 18px;
  height: 18px;
  border-radius: var(--radius-pill);
  background: var(--system-red);
  color: #FFFFFF;
  font-size: var(--type-caption2);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

/* --- Buttons ------------------------------------------------------ */
.ios-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  background: var(--accent);
  color: var(--on-accent);
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--sf-pro);
  font-size: var(--type-body);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--dur-fast) var(--ease-ios);
}
.ios-button-primary:active { background: var(--accent-active); transform: scale(0.97); }

.ios-button-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  background: transparent;
  color: var(--accent);
  border: none;
  border-radius: var(--radius-pill);
  font-family: var(--sf-pro);
  font-size: var(--type-body);
  font-weight: 400;
  cursor: pointer;
}

/* --- Chip --------------------------------------------------------- */
.ios-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  background: var(--fill-secondary);
  border-radius: var(--radius-pill);
  font-size: var(--type-caption1);
  font-weight: 500;
  color: var(--label-primary);
  cursor: pointer;
}
.ios-chip.active {
  background: var(--accent);
  color: var(--on-accent);
}

/* --- Divider ------------------------------------------------------ */
.ios-divider {
  height: 0.5px;
  background: var(--separator);
  margin: 0 var(--sp-4);
}
.ios-divider.inset { margin-left: 60px; }

/* --- Empty State -------------------------------------------------- */
.ios-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-16) var(--sp-8);
  text-align: center;
  gap: var(--sp-3);
}
.ios-empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--fill-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-2);
}
.ios-empty-icon svg { width: 36px; height: 36px; color: var(--label-tertiary); }
.ios-empty-title {
  font-size: var(--type-title3);
  font-weight: 600;
  color: var(--label-primary);
}
.ios-empty-body {
  font-size: var(--type-body);
  color: var(--label-secondary);
  max-width: 280px;
  line-height: 1.4;
}

/* --- Section Spacing ---------------------------------------------- */
.section-gap { height: var(--sp-8); }
.scroll-pad-top { padding-top: 59px; } /* iPhone status bar */
.scroll-pad-top-ipad { padding-top: 28px; }
.safe-area-bottom { padding-bottom: 34px; }

/* --- Horizontal Scroll Row ---------------------------------------- */
.hscroll-row {
  display: flex;
  gap: var(--sp-3);
  overflow-x: auto;
  padding: 0 var(--sp-4) var(--sp-3);
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.hscroll-row::-webkit-scrollbar { display: none; }

/* --- Chat Bubbles ------------------------------------------------- */
.chat-bubble {
  max-width: 75%;
  padding: var(--sp-3) var(--sp-4);
  border-radius: 20px;
  font-size: var(--type-body);
  line-height: 1.4;
  margin-bottom: var(--sp-2);
}
.chat-bubble.sent {
  background: var(--accent);
  color: var(--on-accent);
  align-self: flex-end;
  border-bottom-right-radius: 6px;
}
.chat-bubble.received {
  backdrop-filter: blur(var(--glass-blur-sm));
  -webkit-backdrop-filter: blur(var(--glass-blur-sm));
  background: var(--glass-thin);
  border: 0.5px solid var(--glass-border);
  color: var(--label-primary);
  align-self: flex-start;
  border-bottom-left-radius: 6px;
}

/* --- Chat Input Bar ----------------------------------------------- */
.chat-input-bar {
  display: flex;
  align-items: flex-end;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  backdrop-filter: blur(var(--glass-blur-md));
  -webkit-backdrop-filter: blur(var(--glass-blur-md));
  background: var(--glass-regular);
  border-top: 0.5px solid var(--glass-border);
}
.chat-input {
  flex: 1;
  padding: var(--sp-2) var(--sp-3);
  background: var(--fill-tertiary);
  border: none;
  border-radius: var(--radius-xl);
  font-family: var(--sf-pro);
  font-size: var(--type-body);
  color: var(--label-primary);
  min-height: 36px;
}
.chat-send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}
.chat-send-btn svg { width: 16px; height: 16px; }

/* --- Photo Grid --------------------------------------------------- */
.photo-grid {
  display: grid;
  gap: 2px;
  padding: 0 var(--sp-1);
}
.photo-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
.photo-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
.photo-grid-item {
  aspect-ratio: 1;
  background: var(--fill-tertiary);
  overflow: hidden;
}

/* --- Stats Row ---------------------------------------------------- */
.stats-row {
  display: flex;
  justify-content: space-around;
  padding: var(--sp-4);
}
.stat-item { text-align: center; }
.stat-value {
  font-size: var(--type-title2);
  font-weight: 700;
  color: var(--label-primary);
}
.stat-label {
  font-size: var(--type-caption1);
  color: var(--label-secondary);
}

/* --- Form Elements ------------------------------------------------ */
.ios-input-group {
  background: var(--bg-grouped-secondary);
  border-radius: var(--radius-md);
  margin: 0 var(--sp-4) var(--sp-3);
  overflow: hidden;
}
.ios-input-row {
  display: flex;
  align-items: center;
  padding: var(--sp-3) var(--sp-4);
  min-height: 44px;
}
.ios-input-row + .ios-input-row {
  border-top: 0.5px solid var(--separator);
}
.ios-input-label {
  font-size: var(--type-body);
  color: var(--label-primary);
  width: 100px;
  flex-shrink: 0;
}
.ios-input-field {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--sf-pro);
  font-size: var(--type-body);
  color: var(--label-primary);
  text-align: right;
}
.ios-input-field::placeholder { color: var(--label-tertiary); }

/* --- Progress / Loading ------------------------------------------- */
.ios-progress {
  height: 4px;
  background: var(--fill-tertiary);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.ios-progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: var(--radius-pill);
  transition: width var(--dur-slow) var(--ease-ios);
}

/* --- Page Dots (Onboarding) --------------------------------------- */
.page-dots {
  display: flex;
  gap: var(--sp-2);
  justify-content: center;
  padding: var(--sp-4);
}
.page-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fill-secondary);
}
.page-dot.active { background: var(--accent); width: 24px; border-radius: var(--radius-pill); }

/* --- Image Placeholder -------------------------------------------- */
.ios-img-placeholder {
  background: var(--fill-tertiary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--label-quaternary);
  position: relative;
  overflow: hidden;
}
.ios-img-placeholder::after {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    var(--fill-quaternary) 8px,
    var(--fill-quaternary) 9px
  );
  opacity: 0.5;
}
.ios-img-placeholder svg { width: 32px; height: 32px; z-index: 1; }

/* --- Map Placeholder ---------------------------------------------- */
.ios-map-placeholder {
  flex: 1;
  background:
    linear-gradient(135deg, #E8E8ED 25%, #D1D1D6 25%, #D1D1D6 50%, #E8E8ED 50%, #E8E8ED 75%, #D1D1D6 75%)
    0 0 / 40px 40px;
  position: relative;
}
[data-mode="dark"] .ios-map-placeholder {
  background:
    linear-gradient(135deg, #2C2C2E 25%, #3A3A3C 25%, #3A3A3C 50%, #2C2C2E 50%, #2C2C2E 75%, #3A3A3C 75%)
    0 0 / 40px 40px;
}

/* --- Scrubber / Slider -------------------------------------------- */
.ios-scrubber {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: 0 var(--sp-4);
}
.scrubber-track {
  flex: 1;
  height: 4px;
  background: var(--fill-tertiary);
  border-radius: var(--radius-pill);
  position: relative;
}
.scrubber-fill {
  height: 100%;
  background: var(--label-primary);
  border-radius: var(--radius-pill);
  width: 35%; /* example progress */
}
.scrubber-thumb {
  position: absolute;
  top: 50%;
  left: 35%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--label-primary);
}
.scrubber-time {
  font-size: var(--type-caption1);
  color: var(--label-secondary);
  min-width: 36px;
}
```

---

# JS Reference

This JavaScript goes in the `<script>` block at the bottom of each HTML file.
Include only the functions relevant to the generated screen.

## Variation Switching

```javascript
function showVariation(id, btn) {
  document.querySelectorAll('.variation-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.variation-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  btn.classList.add('active');
}
```

## Mode Toggle

```javascript
function setMode(mode, btn) {
  document.querySelectorAll('.ios-stage').forEach(s => s.dataset.mode = mode);
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
```

## Tab Bar Switching

```javascript
function switchTab(tabId, btn) {
  const device = btn.closest('.ios-device');
  device.querySelectorAll('.tab-content').forEach(p => p.classList.remove('active'));
  device.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  device.querySelector('#tab-' + tabId).classList.add('active');
  btn.classList.add('active');
}
```

## Scroll-Triggered Glass Morphing

```javascript
function initScrollGlass() {
  document.querySelectorAll('.scroll-content').forEach(scroller => {
    const nav = scroller.previousElementSibling;
    if (!nav || !nav.classList.contains('glass-nav-bar')) return;
    scroller.addEventListener('scroll', () => {
      const y = scroller.scrollTop;
      nav.classList.toggle('scrolled', y > 8);
      nav.classList.toggle('collapsed', y > 44);
    });
  });
}
document.addEventListener('DOMContentLoaded', initScrollGlass);
```

## Sheet Presentation

```javascript
function presentSheet(deviceId) {
  const device = document.getElementById(deviceId) || document.querySelector('.ios-device');
  const sheet = device.querySelector('.glass-sheet');
  const overlay = device.querySelector('.sheet-overlay');
  if (sheet) sheet.classList.add('presented');
  if (overlay) overlay.classList.add('visible');
}
function dismissSheet(deviceId) {
  const device = document.getElementById(deviceId) || document.querySelector('.ios-device');
  const sheet = device.querySelector('.glass-sheet');
  const overlay = device.querySelector('.sheet-overlay');
  if (sheet) sheet.classList.remove('presented');
  if (overlay) overlay.classList.remove('visible');
}
```

## Segmented Control

```javascript
function switchSegment(segmentId, btn) {
  const parent = btn.closest('.glass-segmented');
  parent.querySelectorAll('.segment-item').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  // Show/hide segment content if applicable
  const container = parent.parentElement;
  container.querySelectorAll('.segment-content').forEach(c => c.classList.remove('active'));
  const target = container.querySelector('#segment-' + segmentId);
  if (target) target.classList.add('active');
}
```

## Toggle Switch

```javascript
function toggleSwitch(el) {
  el.classList.toggle('on');
}
```

---

# Screen Pattern Library

Each archetype defines the structural layout for iPhone and iPad frames.
Claude selects the closest match and fills in realistic content from PRD
context or plausible defaults.

## 1. Settings

**iPhone:** Large title nav "Settings". Profile card at top (avatar + name + Apple ID). Grouped inset list sections with colored icon squares (30x30, 7px radius). Rows have: `.row-icon` (colored bg + white SVG) + `.row-label` + optional `.row-detail` or `.ios-toggle` + `.row-chevron`. Sections: account, connectivity (Airplane, Wi-Fi, Bluetooth), notifications, general, apps.

**iPad:** Glass sidebar with section list (icons + labels). Main content shows selected section's detail view. No tab bar.

## 2. Profile

**iPhone:** Scroll content with centered `.ios-avatar.lg` (80px), name (title2), bio (body, secondary), `.stats-row` (3 items), action buttons row (`.ios-button-primary` + `.ios-button-secondary`), then content sections (posts/activity list or card grid).

**iPad:** Two-column layout. Left: avatar + info + stats. Right: scrollable content grid.

## 3. List (Simple)

**iPhone:** Large title nav with `.glass-search-bar` below. Scrollable `.ios-list-section` with `.ios-list-row` items. Each row: optional leading `.ios-avatar.sm`, `.row-body` (.row-label + optional subtitle), `.row-detail`, `.row-chevron`.

**iPad:** Glass sidebar shows the list. Main content area shows detail of selected item. Active item highlighted with `.sidebar-item.active`.

## 4. List-Detail (Master-Detail)

**iPhone:** List view as primary (same as Pattern 3). Tapping a row conceptually pushes detail. Include a second hidden panel (or sheet trigger demo).

**iPad:** Sidebar + detail pane visible simultaneously. Sidebar shows list items, main area shows full detail view with nav bar.

## 5. Chat / Messaging

**iPhone:** Nav bar with contact name + avatar. Scroll content is flex column with `.chat-bubble.sent` (right-aligned, accent) and `.chat-bubble.received` (left-aligned, glass). `.chat-input-bar` at bottom with `.chat-input` + `.chat-send-btn`. Messages grouped by date.

**iPad:** Glass sidebar with conversation list (avatar + name + last message + time). Main area is the active conversation.

## 6. Onboarding

**iPhone:** Full-bleed `.ios-img-placeholder` (top 40%), centered title (title1), body text, `.ios-button-primary` (full width), `.page-dots` at bottom. No nav bar or tab bar.

**iPad:** Centered card (max 560px) with illustration, text, and button. Page dots below card.

## 7. Feed / Timeline

**iPhone:** Nav bar with title. Scrollable feed of `.ios-card` items. Each card: header row (`.ios-avatar.sm` + name + time), content text, optional image placeholder, action row (like/comment/share icons with counts).

**iPad:** Centered content column (max 640px). Optional glass sidebar with filters/categories.

## 8. Dashboard / Home

**iPhone:** Nav bar with greeting ("Good morning, [Name]") and profile avatar action. `.hscroll-row` with summary cards. Vertical sections: stats grid (2x2), recent activity list, quick action buttons row.

**iPad:** Multi-column grid layout. Summary cards span full width. Stats and activity in columns.

## 9. Map / Location

**iPhone:** Full-bleed `.ios-map-placeholder`. Glass floating search bar at top. Glass sheet at bottom (can be expanded via `presentSheet`) with search results list. `.glass-floating-btn` for current location.

**iPad:** Glass sidebar with search + results list. Map fills remaining space.

## 10. Media Player

**iPhone:** Large `.ios-img-placeholder` (album art, square, ~280px, centered). Below: title (headline) + artist (subhead, secondary). `.ios-scrubber` with times. Transport controls row (shuffle, previous, play/pause circle, next, repeat). Volume scrubber. Bottom: AirPlay + queue icons.

**iPad:** Wider layout. Art on left, controls on right. Or full-width art with controls below.

## 11. Form / Input

**iPhone:** Nav bar with "Cancel" (left) and "Save" (right, accent). `.ios-list-header` sections with `.ios-input-group` containing `.ios-input-row` items. Row types: text input, picker (`.row-detail` shows current value), toggle (`.ios-toggle`). Submit area with `.ios-button-primary`.

**iPad:** Centered form column (max 560px). Same grouped input structure.

## 12. Search

**iPhone:** `.glass-search-bar` at top (prominent, larger). Below when empty: "Recent Searches" section (list with X to clear), "Trending" section (chips row). Below when populated: results list with relevant content rows.

**iPad:** Centered search (max 680px). Results in wider grid or list.

## 13. Photo Grid / Gallery

**iPhone:** `.glass-segmented` at top (Photos / Albums / Favorites). `.photo-grid.cols-3` below with `.photo-grid-item` squares. Scroll content.

**iPad:** `.glass-segmented` at top. `.photo-grid.cols-4` or `.photo-grid.cols-5`. Optional sidebar with albums.

## 14. Empty State

**iPhone:** Centered `.ios-empty-state` with `.ios-empty-icon`, `.ios-empty-title`, `.ios-empty-body`, and optional `.ios-button-primary`.

**iPad:** Same centered layout, slightly larger icon and wider text.

## 15. Tab Overview

**iPhone:** `.glass-tab-bar` with 4-5 `.tab-item` elements. Content area shows `.tab-content.active` for the selected tab. Each tab content follows its own archetype.

**iPad:** Glass sidebar replaces tab bar. Sidebar items are the tab equivalents. Content area shows selected tab's content.

---

# Rules

1. **Glass only on navigation/controls.** Never apply glass materials to content elements (cards, lists, images, forms). Only: nav bar, tab bar, sidebar, toolbar, search bar, segmented control, floating buttons, sheets.

2. **Use only classes from this CSS reference.** Never invent ad-hoc styles, inline colors, or custom class names. If a component is not covered, compose from existing classes.

3. **Realistic content.** Use plausible labels, names, dates, numbers — never lorem ipsum. Derive from PRD when available.

4. **Inline SVG icons.** Do not link to external icon libraries. Use simple inline SVGs for all icons (chevrons, system icons, tab icons). Keep SVGs minimal (path-based, currentColor).

5. **Self-contained HTML.** Every file must work when opened directly in a browser — no external CSS, JS, or font dependencies.

6. **Brand color integration.** If `docs/design/theme.md` provides an accent color, override `--accent` and `--accent-active` in the `:root` block. Keep all other system colors as-is.

7. **Contrast over glass.** All text over glass surfaces must use `var(--label-primary)` or `var(--label-secondary)` — these have rgba values tuned for glass readability. Never use pure `#000000` or `#FFFFFF` for text.

8. **Dynamic Island stays solid.** The Dynamic Island is always solid black (`#000000`), never transparent or glassed.

9. **Status bar time is always 9:41.** Following Apple convention.

10. **iPad landscape for review.** iPad frame is 1024x768 (landscape) for practical side-by-side viewing alongside the iPhone frame. This is a design review artifact, not a device simulation.

11. **Scroll content padding.** iPhone scroll content starts below nav bar (sticky) and ends above tab bar (absolute bottom). Include `safe-area-bottom` padding (34px) for home indicator.

12. **No external font loading.** Use the `-apple-system, BlinkMacSystemFont` font stack. SF Pro renders natively on macOS/iOS Safari. On other browsers, the fallback chain provides visually similar results.

13. **Tab bar floats.** The iOS 26 tab bar is not edge-to-edge — it floats with rounded corners and horizontal margins (`left/right: 16px`), sitting above the home indicator.

14. **One active variation panel.** Only one `.variation-panel` has `.active` class at a time. All others are `display: none`.

15. **Dark mode via data attribute.** Use `data-mode="light"` or `data-mode="dark"` on `.ios-stage`, not CSS `prefers-color-scheme`. This allows the mode toggle to work.

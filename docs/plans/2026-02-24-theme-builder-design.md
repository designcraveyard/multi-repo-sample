# Theme Builder — Design Document

**Date:** 2026-02-24
**Status:** Approved
**Author:** Brainstorming session

## Summary

A single-file HTML theme builder that lets developers and designers visually configure a design system theme — colors, fonts, spacing, radius, and typography scale — with a live component preview. Exports a universal `.json` theme file consumed by Claude skills, CLI scripts, and humans. Lives at `theme-builder/index.html` in the workspace root.

## Goals

1. **Visual theme configuration** — color pickers, font search, sliders, and presets instead of editing token files
2. **Instant live preview** — a stylized mini-app that reflects every change in real time
3. **Universal JSON export** — a single `.json` file that serves as the source of truth for all platforms
4. **Lightweight** — single HTML file, zero dependencies, zero build step
5. **Figma-importable** — clean semantic HTML that can be imported into Figma via htmlto.design
6. **Google Fonts integration** — searchable font picker, no system fonts

## Target Users

Developers and designers. They understand design tokens but expect a visual, intuitive tool — not a raw JSON editor.

## Architecture

### Approach: CSS Variable Engine

The theme builder uses CSS custom properties as the runtime engine. Configuration controls on the left directly mutate `:root` CSS variables. The preview panel renders HTML that references those variables — instant updates with zero JS re-rendering.

```
User picks color → JS generates 11-stop HSL ramp → Sets --color-brand-* vars on :root
                                                  → Semantic tokens reference them
                                                  → Preview HTML updates instantly
```

Export: JS reads all computed CSS variables and serializes them into structured JSON.

### File Structure

```
theme-builder/
  index.html          # The entire tool (~2000-3000 lines)
  README.md           # Usage instructions for designers
```

Single HTML file with embedded `<style>` and `<script>`. No build step, no node_modules.

## Page Layout

```
+-------------------------------------------------------------+
|  Theme Builder                    [Light / Dark] [Export]    |
+------------------------+------------------------------------+
|                        |                                    |
|  CONFIGURATION         |  LIVE PREVIEW                      |
|  (scrollable)          |  (scrollable)                      |
|                        |                                    |
|  +- Global ----------+ |  Stylized mini-app preview:        |
|  | Brand Color       | |  Nav bar, stat cards, tabs,        |
|  | Accent Color      | |  form with inputs, badges,         |
|  | Base/Neutral      | |  buttons, alerts, table,           |
|  | Status Colors     | |  typography sampler                |
|  | Body Font    [S]  | |                                    |
|  | Display Font [S]  | |                                    |
|  | Spacing Scale     | |                                    |
|  | Radius Scale      | |                                    |
|  | Type Scale        | |                                    |
|  +-------------------+ |                                    |
|                        |                                    |
|  +- Components ------+ |                                    |
|  | > Button          | |                                    |
|  | > InputField      | |                                    |
|  | > Badge           | |                                    |
|  | (expandable)      | |                                    |
|  +-------------------+ |                                    |
|                        |                                    |
+------------------------+------------------------------------+
|  JSON Preview (collapsible footer)                           |
+-------------------------------------------------------------+
```

- **Left panel (~320px):** Accordion sections for Global tokens and per-component overrides
- **Right panel (remaining):** Live preview that updates via CSS variable mutation
- **Top bar:** Light/dark toggle + Export button
- **Footer:** Collapsible live JSON preview

## Configuration Controls

### Global Section

#### Colors

| Control | Input Type | Behavior |
|---------|-----------|----------|
| Brand Color | Color picker + hex input | Single hue -> auto-generates 11-stop ramp (50-950) via HSL interpolation |
| Accent Color | Color picker + hex input | Same ramp generation |
| Base/Neutral | Color picker + hex input | Neutral gray family for backgrounds, cards, borders |
| Success | Color picker | Single hue -> solid + subtle variants |
| Warning | Color picker | Same |
| Error | Color picker | Same |

Each color section has an **"Advanced" toggle** expanding to show the full 11-stop ramp with individual stop overrides. Ramp is auto-derived by default.

#### Typography

| Control | Input Type |
|---------|-----------|
| Body Font | Google Fonts searchable dropdown |
| Display Font | Google Fonts searchable dropdown |
| Base Size | Slider (14-20px, default 16) |
| Scale Ratio | Dropdown: Minor Third (1.2), Major Third (1.25), Perfect Fourth (1.333), Golden (1.618) |
| Body Weight | Multi-select: 400, 500, 600, 700 |
| Display Weight | Multi-select: 400, 500, 600, 700 |

Type scale auto-generated from base size + ratio. Computed values shown in read-only table with individual overrides available.

#### Spacing

| Control | Input Type |
|---------|-----------|
| Base Unit | Slider (2-8px, default 4) |
| Scale | Derived: base x multipliers (1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24) |

#### Radius

| Control | Input Type |
|---------|-----------|
| Radius Preset | Dropdown: Sharp (all 0), Subtle (2-8), Rounded (4-16), Pill (8-9999) |
| Individual stops | Editable after preset selection |

### Component Override Section

Collapsible per-component blocks below the global section. Each override has a toggle: "Inherit global" (default) or "Custom" (enables picker).

Components with overrides: Button, InputField, Badge, Tabs, Card, Table.

Override properties per component: background, text color, border radius, padding (varies by component).

## Google Fonts Integration

- On load: fetch Google Fonts metadata JSON (no API key needed for CSS endpoint)
- Font picker: searchable dropdown with live font preview in the dropdown itself
- Selecting a font dynamically injects `<link href="https://fonts.googleapis.com/css2?family=...">` into the page
- Two slots: **Body** (all text) and **Display** (headings/display type)
- JSON export includes `fontFamily`, `googleFontsUrl`, and `fontWeights`

## Dark Mode

- Top bar toggle switches the preview between light and dark
- Implementation: `.dark` class on preview container overrides all semantic tokens
- Both modes are configured simultaneously in the builder
- JSON exports both light and dark semantic token sets

## Live Preview

A stylized "mini-app" exercising all token categories:

- **Top nav bar** — brand surface, icon tokens
- **Welcome heading** — display font, heading type style
- **Stat cards (3)** — base surface, border, body text, number formatting
- **Tabbed section** — tabs component with accent active state
- **Form** — InputField with border/focus ring, Picker/Select, Badge/Chip
- **Button pair** — ghost + primary buttons (accent surface)
- **Alerts (3)** — success, warning, error status surfaces
- **Data table** — high-contrast header, alternating rows, status badges
- **Typography sampler** — caption, link, muted text at bottom

### Preview Update Mechanism

- CSS property changes on `:root` propagate instantly
- Dark toggle adds/removes `.dark` class
- Font changes inject `<link>` tag dynamically
- Component overrides inject scoped CSS: `.preview .button { --btn-bg: ... }`

## JSON Export Schema

```json
{
  "meta": {
    "name": "Theme Name",
    "version": "1.0",
    "generatedAt": "ISO-8601",
    "generatorVersion": "1.0.0"
  },

  "colors": {
    "brand": {
      "hue": "#09090B",
      "ramp": { "50": "#FAFAFA", "100": "...", "...": "...", "950": "#09090B" }
    },
    "accent": { "hue": "#4F46E5", "ramp": { "...": "..." } },
    "neutral": { "hue": "#737373", "ramp": { "...": "..." } },
    "success": { "hue": "#16A34A", "ramp": { "...": "..." } },
    "warning": { "hue": "#D97706", "ramp": { "...": "..." } },
    "error": { "hue": "#DC2626", "ramp": { "...": "..." } }
  },

  "semanticTokens": {
    "light": {
      "surfaces": {
        "brandInteractive": "brand.950",
        "brandInteractiveHover": "brand.800",
        "accentPrimary": "accent.600",
        "basePrimary": "neutral.50",
        "...": "..."
      },
      "typography": { "primary": "neutral.950", "...": "..." },
      "icons": { "...": "..." },
      "border": { "...": "..." }
    },
    "dark": {
      "surfaces": {
        "brandInteractive": "brand.50",
        "accentPrimary": "accent.400",
        "basePrimary": "neutral.950",
        "...": "..."
      },
      "typography": { "...": "..." },
      "icons": { "...": "..." },
      "border": { "...": "..." }
    }
  },

  "typography": {
    "fonts": {
      "body": {
        "family": "Inter",
        "googleFontsId": "Inter",
        "weights": [400, 500, 600, 700],
        "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700"
      },
      "display": {
        "family": "Playfair Display",
        "googleFontsId": "Playfair+Display",
        "weights": [400, 700],
        "url": "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700"
      }
    },
    "scale": {
      "baseSize": 16,
      "ratio": 1.25,
      "computed": {
        "displayLarge": { "size": 96, "lineHeight": 1.1, "weight": 400, "font": "display" },
        "displayMedium": { "size": 64, "lineHeight": 1.15, "weight": 400, "font": "display" },
        "headingLarge": { "size": 56, "lineHeight": 1.2, "weight": 700, "font": "display" },
        "bodyLarge": { "size": 16, "lineHeight": 1.5, "weight": 400, "font": "body" },
        "bodySmall": { "size": 12, "lineHeight": 1.5, "weight": 400, "font": "body" },
        "...": "..."
      }
    }
  },

  "spacing": {
    "baseUnit": 4,
    "scale": {
      "space1": 4, "space2": 8, "space3": 12, "space4": 16,
      "space5": 20, "space6": 24, "space8": 32, "space10": 40,
      "space12": 48, "space16": 64, "space20": 80, "space24": 96
    }
  },

  "radius": {
    "preset": "rounded",
    "scale": {
      "none": 0, "xs": 4, "sm": 8, "md": 12,
      "lg": 16, "xl": 24, "2xl": 32, "full": 9999
    }
  },

  "componentOverrides": {
    "button": {
      "background": "accent.600",
      "borderRadius": "md"
    }
  }
}
```

### Schema Design Decisions

1. Color ramp references (`brand.950`) instead of hex in semantic tokens — downstream tools map to platform primitives
2. Semantic tokens explicit for both light AND dark — no auto-derivation at consume time
3. Font metadata includes Google Fonts URL — downstream tools inject or download directly
4. `componentOverrides` is sparse — only non-default values appear
5. `computed` type scale includes final values — consumers don't re-derive from ratio

## Downstream Integration

### 1. Claude Skill: `/apply-theme`

Reads a theme JSON and generates platform-specific token files:

- `globals.css` — primitive CSS vars + semantic token mappings for light/dark
- `DesignTokens.swift` — Color extensions with `adaptive(light:dark:)`
- `DesignTokens.kt` — `PrimitiveColors` + `SemanticColors` objects
- Google Fonts wiring per platform
- Component override application

**JSON becomes the single source of truth** for all three platforms, replacing `globals.css` as the master token file.

### 2. Scaffolding Agent Integration

A new-project scaffolding agent accepts a theme JSON path:

```
"Create a new project with theme from theme-builder/my-brand.json"
```

Pre-configures all token files, font imports, and color values from the JSON.

### 3. Figma Import Path (Future)

The preview HTML uses clean, semantic markup and CSS custom properties. A designer can:
1. Open the theme builder in a browser
2. Use htmlto.design Figma plugin to import preview as editable layers
3. Imported layers retain themed colors and typography
4. Use as starting point for screen design in Figma

## Implementation Phases

### Phase 1: Core Builder
- Single HTML file with layout (left/right panels)
- Color configuration with auto-ramp generation
- Google Fonts picker integration
- Spacing and radius controls
- Live preview with light/dark toggle
- JSON export

### Phase 2: Component Overrides
- Per-component override UI
- Scoped CSS override injection in preview

### Phase 3: Claude Skill
- `/apply-theme` skill that reads JSON and generates platform token files
- Replaces `/design-token-sync` as the primary token workflow

### Phase 4: Figma Integration
- Clean up preview HTML for htmlto.design compatibility
- Document the Figma import workflow

## Non-Goals

- No theme gallery or preset system (one theme at a time)
- No build step or framework
- No runtime theme switching in the target apps (this tool generates static token files)
- No direct Figma API integration (manual import via plugin)

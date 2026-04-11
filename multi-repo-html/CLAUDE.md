# CLAUDE.md — multi-repo-html

Standalone HTML/CSS design system mirroring the app's Figma-sourced tokens and components.

## Purpose

This design system serves two roles:
1. **Reference** — `reference/` pages showcase every token and component variant
2. **Toolkit** — component CSS + HTML snippets are consumed by plugins (wireframe, UI design, stylescape, presentations)

## Font

All files should include Geist from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet">
```

## How to Use Components

Every component has a `.css` file (styles) and `.html` file (snippet with all variants).
Components use `ds-` prefix classes and carry semantic `data-*` attributes:

```html
<button class="ds-button primary medium"
  data-component="Button"
  data-variant="primary"
  data-size="medium">
  Label
</button>
```

## Data Attributes

| Attribute | Required | Purpose |
|-----------|----------|---------|
| `data-component` | Yes | Registry name from `docs/components.md` |
| `data-variant` | Yes | Primary variant (e.g., `primary`, `secondary`) |
| `data-size` | When applicable | Size variant (`sm`, `md`, `lg`) |
| `data-state` | When non-default | Visual state (`hover`, `pressed`, `disabled`) |

## Manifest

`manifest.json` maps every component to its platform files and variant enums.
Look up `data-component` value in the manifest to find the correct import path.

## Consuming in a Plugin

**Linked (development):**
```html
<link rel="stylesheet" href="../../multi-repo-html/design-system.css" />
```

**Inlined (standalone export):**
Read the needed token + component CSS files, concatenate into a `<style>` block.

## Token Architecture

1. `tokens/primitives.css` — raw palette (never use directly in components)
2. `tokens/semantic.css` — surfaces, typography, icons, borders (light + dark mode)
3. `tokens/typography.css` — 28 type roles as `.type-*` utility classes
4. `tokens/spacing.css` — `--space-*` properties + `.gap-*`, `.p-*` utilities
5. `tokens/radius.css` — `--radius-*` properties
6. `tokens/design-tools.css` — wireframe, annotation, device, slide tokens (not in main app)

## Adding a New Component

1. Create `components/<name>/<name>.css` and `components/<name>/<name>.html`
2. Add all variant classes in the CSS with inline comments
3. Render every variant in the HTML snippet with `data-*` attributes
4. Add entry to `manifest.json`
5. Add `@import` to `design-system.css`
6. Add section to `reference/index.html`

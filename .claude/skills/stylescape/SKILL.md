---
name: stylescape
description: >
  Generate AI-powered visual mood boards for theme candidates — showcasing colors,
  typography, icons, illustrations, shapes, textures, and applied phone mockups.
  Pick a winner before committing to /generate-theme. Reads candidates from
  docs/design/theme.md (written by /define-theme). Output in docs/design/stylescapes/.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# /stylescape — Visual Mood Boards for Theme Candidates

## Purpose

Bridge the gap between `/define-theme` (text spec) and `/generate-theme` (code application).
Generates rich HTML mood boards — one per theme candidate — so the team can **see** competing
directions before committing. Each board showcases colors, typography, icons, illustrations,
shapes, textures, and applied phone mockups using the candidate's specific attributes.

**Skill chain:**
```
/define-theme  →  /stylescape  →  /generate-theme
(3 candidates)    (3 boards)      (applies winner)
```

## Arguments

`$ARGUMENTS` — optional:
- *(none)* — full run: read candidates, generate images + HTML, ask to pick
- `--pick <N>` — skip to selection; promote candidate N immediately
- `--regenerate <N>` — regenerate just candidate N's images and HTML
- `--no-images` — skip AI image generation; use CSS gradient placeholders only

---

## CRITICAL EXECUTION RULES

1. **Candidates are REQUIRED.** This skill reads `docs/design/theme.md` and expects a `## Candidates` section with 2-3 candidate blocks. If missing, stop and tell the user to run `/define-theme` first.

2. **This skill writes HTML + CSS mood boards.** It does NOT modify theme.md until the selection phase (Phase 6), and it does NOT run `/generate-theme`. Those are separate steps.

3. **AI images are optional.** If `OPENAI_API_KEY` is missing or `--no-images` is passed, every `.ss-image-tile` uses a CSS gradient placeholder instead. The skill still produces fully functional stylescapes.

4. **Phone mockups use the app's real screens.** Read the screen inventory from `docs/design/information-architecture.md` and use actual screen names and content structure.

---

## Phase 0: Read Context & Pre-flight

1. **Read theme candidates.** Read `docs/design/theme.md`.
   - Grep for `## Candidates` — if missing, STOP: "No candidates found. Run `/define-theme` to generate 3 theme directions first."
   - Parse each `### Candidate N:` block. Extract: archetype, brand palette (name + hex swatches), neutral, display font, body font, shape, atmosphere, icon weight, icon character, illustration style, image treatment, shadow, texture, motion, signature moment, 3-word summary, narrative, style descriptors.

2. **Read app context:**
   - `docs/design/information-architecture.md` — screen names for applied examples
   - `docs/PRDs/` — feature context for mockup content
   - `docs/design/design-guidelines.md` — layout/spacing standards
   - `docs/app-brief.md` — app name and category

3. **Check pipeline flags:**
   - If `pipeline.json` exists, read `flags.skip_figma`.

4. **Pre-flight checks:**
   - Check `.env.local` for `OPENAI_API_KEY`:
     - Present → images enabled
     - Missing + no `--no-images` flag → WARN: "No OPENAI_API_KEY found. Images will use CSS gradient placeholders. Add it to `.env.local` for AI-generated mood imagery."
     - Missing + `--no-images` flag → silent (expected)
   - Check `node_modules` in `.claude/plugins/asset-gen/`:
     - Missing → run `cd .claude/plugins/asset-gen && npm install`

---

## Phase 1: Plan & Confirm

Show the candidates in a compact summary:

```
3 Theme Candidates
──────────────────────────────────
1. [Archetype Name] — [3-word summary]
   Palette: [brand] · [neutral] · [display font]

2. [Archetype Name] — [3-word summary]
   Palette: [brand] · [neutral] · [display font]

3. [Archetype Name] — [3-word summary]
   Palette: [brand] · [neutral] · [display font]
```

Ask via `AskUserQuestion`:

**Q1 — Scope (header: "Candidates"):** "Generate stylescapes for which candidates?"
- **All 3** — full comparison (Recommended)
- **Drop candidate [N]** — generate 2 only (identify weakest)
- **Just candidate [N]** — single board (already have a favorite)

**Q2 — Applied mockups (header: "Screens"):** "Which 2-3 screens should appear as phone mockups in each board?"
- Pre-populate from IA screen inventory (pick the most visually distinct ones — e.g., a list screen, a detail screen, and a unique feature screen)
- Let user confirm or swap

---

## Phase 2: Generate AI Images

> **Skip entirely if `--no-images` or no `OPENAI_API_KEY`.**

For each candidate, build a spec JSON array. Each candidate gets 4-5 images:

| Image | Prompt Construction | Size |
|-------|-------------------|------|
| **Mood atmosphere** | `"[Archetype] aesthetic: [atmosphere] surface with [texture]. Abstract composition using [brand-palette hex range]. [shadow-style] depth. Professional design system mood board tile. No text."` | 1024x1024 |
| **Gradient/color study** | `"Abstract color study using [brand-50 through brand-950] palette. [warm/cool] [neutral] undertones. [atmosphere]-style depth and layering. Minimal, elegant."` | 1024x1024 |
| **Illustration sample** | `"[illustration-style] illustration in [color-approach] using [brand hex] palette. Subject: [relevant to app category]. Style reference: [archetype-specific ref]."` | 1024x1024 |
| **Icon style sample** | `"Set of 9 UI icons in [icon-weight] [icon-character] style. [brand]-tinted on [neutral] background. Icons: home, search, settings, profile, plus, heart, bell, calendar, folder. Clean vector aesthetic."` | 1024x1024 |
| **Texture/pattern** | `"[texture/pattern] background texture. [archetype]-inspired pattern. Subtle, suitable as background. [brand] color accent on [neutral] base."` | 1024x1024 |

Write spec to `/tmp/stylescape-gen-spec.json`:

```json
[
  {
    "id": "stylescape-1-mood",
    "category": "stylescape",
    "label": "Candidate 1 — Mood Atmosphere",
    "size": "1024x1024",
    "model": "gpt-image-1-mini",
    "quality": "medium",
    "outputPath": "docs/design/stylescapes/images/candidate-1-mood.png",
    "prompt": "..."
  }
]
```

Invoke via Bash:
```bash
node .claude/plugins/asset-gen/generate.js --spec /tmp/stylescape-gen-spec.json --env .env.local
```

Parse the `--- RESULT ---` JSON output. Log successes and failures. Continue even if some images fail — use CSS placeholders for failed images.

---

## Phase 3: Generate Shared CSS (`_stylescape.css`)

Create `docs/design/stylescapes/` directory (and `images/` subdirectory).

Write `docs/design/stylescapes/_stylescape.css` with these sections:

### Viewer & Page
```css
/* --- Viewer Shell --- */
.ss-viewer {
  background: #0F0F14;
  background-image: radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.02) 0%, transparent 70%);
  min-height: 100vh;
  color: #E4E4E7;
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

### Navigation
```css
/* --- Sticky Nav --- */
.ss-nav { /* sticky top nav linking between candidate boards */ }
.ss-nav a { /* tab-style links with active state */ }
.ss-nav a.active { /* underline + brand color highlight */ }
```

### Hero Banner
```css
/* --- Hero --- */
.ss-hero { /* large title + archetype + 3-word summary */ }
.ss-hero h1 { /* display font, large scale */ }
.ss-hero .ss-subtitle { /* 3-word summary */ }
.ss-hero .ss-narrative { /* 2-sentence description */ }
```

### Mood Board Grid
```css
/* --- Grid --- */
.ss-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* --- Tiles --- */
.ss-tile {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.ss-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.ss-tile.wide { grid-column: span 2; }
.ss-tile.tall { grid-row: span 2; }
```

### Component Sections
```css
/* --- Palette --- */
.ss-palette { /* flexbox swatch strip with hex labels */ }
.ss-palette .swatch { /* individual color block, rounded */ }
.ss-palette .swatch-label { /* hex value below swatch */ }

/* --- Gradient Demo --- */
.ss-gradient { /* full-width gradient strip */ }

/* --- Typography Specimen --- */
.ss-type-specimen { /* heading + body at multiple sizes */ }
.ss-type-specimen h2 { /* display font showcase */ }
.ss-type-specimen p { /* body font showcase */ }

/* --- Shape Demo --- */
.ss-shape-demo { /* buttons + cards at different radii */ }
.ss-shape-demo .shape-btn { /* button shape samples */ }
.ss-shape-demo .shape-card { /* card shape samples */ }

/* --- Icon Grid --- */
.ss-icon-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  text-align: center;
}
.ss-icon-grid i { font-size: 24px; }

/* --- Image Tile --- */
.ss-image-tile { /* container for AI-generated images */ }
.ss-image-tile img { width: 100%; border-radius: 12px; }
.ss-image-tile .ss-placeholder {
  /* CSS gradient placeholder when no image */
  aspect-ratio: 1;
  border-radius: 12px;
}

/* --- Labels & Annotations --- */
.ss-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 8px;
}

/* --- Descriptors --- */
.ss-descriptors { /* style descriptor pills at bottom */ }
.ss-descriptors .pill {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 13px;
  margin: 4px;
}
```

### Section Divider
```css
/* --- Applied Examples Section --- */
.ss-section-divider {
  text-align: center;
  padding: 48px 24px 32px;
  max-width: 1400px;
  margin: 0 auto;
}
.ss-section-divider h2 { font-size: 24px; font-weight: 300; }
```

### Phone Frames
```css
/* --- Phone Mockups --- */
.ss-applied-grid {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 24px;
  flex-wrap: wrap;
  max-width: 1400px;
  margin: 0 auto;
}

.ss-phone {
  width: 197px; /* 393/2 for manageable display */
  height: 426px; /* 852/2 */
  border-radius: 24px;
  border: 2px solid rgba(255,255,255,0.15);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.ss-phone-screen {
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 12px;
  font-size: 7px;
  line-height: 1.4;
}

.ss-phone-status-bar {
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 6px;
  font-weight: 600;
}

.ss-phone-dynamic-island {
  width: 60px;
  height: 16px;
  background: #000;
  border-radius: 99px;
  margin: 4px auto 0;
}

.ss-phone-caption {
  text-align: center;
  margin-top: 12px;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}
```

### Utilities & Animation
```css
/* --- Utilities --- */
.ss-spacer { height: 32px; }
.ss-flex { display: flex; }
.ss-gap-sm { gap: 8px; }
.ss-gap-md { gap: 16px; }
.ss-gap-lg { gap: 24px; }
.ss-rounded-sm { border-radius: 8px; }
.ss-rounded-md { border-radius: 12px; }
.ss-rounded-lg { border-radius: 20px; }
.ss-rounded-full { border-radius: 999px; }

/* --- Animations --- */
@keyframes ss-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.ss-fade-in {
  animation: ss-fade-in 0.4s ease-out both;
}

@keyframes ss-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.ss-float {
  animation: ss-float 3s ease-in-out infinite;
}
```

Write the complete CSS file — the above is the structural guide. Flesh out every selector with
full property declarations. Target ~350-450 lines of production-quality CSS.

---

## Phase 4: Generate Per-Candidate HTML

For each candidate, generate `docs/design/stylescapes/stylescape-<N>.html`.

### HEAD

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stylescape — [Candidate Name]</title>
  <link rel="stylesheet" href="_stylescape.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=[DisplayFont]:wght@300;400;700&family=[BodyFont]:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/@phosphor-icons/web"></script>
  <style>
    :root {
      --brand-50: #hex; --brand-100: #hex; /* ... through --brand-950 */
      --neutral-50: #hex; /* ... through --neutral-950 */
      --accent: #hex;
      --font-display: '[DisplayFont]', sans-serif;
      --font-body: '[BodyFont]', sans-serif;
      --radius-interactive: Npx;
      --radius-container: Npx;
    }
  </style>
</head>
```

### BODY — Part A: Mood Board

Structure the mood board with these tiles (order and span may vary per candidate):

1. **Hero** (`.ss-hero`): Archetype name in display font, 3-word summary, 2-sentence narrative
2. **Palette tile** (`.ss-tile.wide`): Brand 50-950 swatch strip + neutral strip + accent highlight
3. **Gradient tile** (`.ss-tile`): CSS gradient using brand colors — linear/radial/conic per atmosphere
4. **Typography tile** (`.ss-tile.wide`): Display font at 3 sizes + body paragraph + font name label
5. **Shape tile** (`.ss-tile`): 3 buttons (pill/rounded/sharp per candidate) + 2 cards with candidate radii
6. **Atmosphere tile** (`.ss-tile.tall`): Layered cards demonstrating shadow style + surface depth
7. **Icon tile** (`.ss-tile`): 8-12 Phosphor icons using `<i class="ph-[weight] ph-[name]">` in candidate's icon weight
8. **Mood image tiles** (`.ss-image-tile`): AI-generated images or CSS gradient placeholders
9. **Illustration tile** (`.ss-image-tile`): AI illustration sample or placeholder
10. **Texture/pattern tile** (`.ss-tile`): CSS-generated pattern or AI texture
11. **Motion tile** (`.ss-tile`): CSS keyframe animation demonstrating motion personality
12. **Descriptors** (`.ss-descriptors`): Style descriptor phrases as pill-shaped tags

### BODY — Part B: Applied Examples

```html
<div class="ss-section-divider">
  <h2>How it looks in [AppName]</h2>
</div>

<div class="ss-applied-grid">
  <!-- 2-3 phone frames side by side -->
  <div>
    <div class="ss-phone" style="background: var(--neutral-50);">
      <div class="ss-phone-status-bar">...</div>
      <div class="ss-phone-dynamic-island"></div>
      <div class="ss-phone-screen">
        <!-- Simplified screen using candidate's colors, fonts, shapes -->
        <!-- Use app's actual screen names/content from IA -->
        <!-- Real Phosphor icons in the candidate's weight -->
      </div>
    </div>
    <div class="ss-phone-caption">[Screen name] — [design callout]</div>
  </div>
  <!-- ... more phones ... -->
</div>
```

Each phone frame should:
- Use the candidate's CSS variables for all colors
- Apply the candidate's font family
- Use the candidate's border-radius values
- Show the candidate's shadow/atmosphere style
- Include real Phosphor icons at the candidate's icon weight
- Display realistic content from the app's IA (screen names, navigation items, list items)

### Candidate-specific CSS Variable Values

Map Tailwind palette names to hex values using the standard Tailwind palette:

| Palette | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---------|----|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| emerald | #ecfdf5 | #d1fae5 | #a7f3d0 | #6ee7b7 | #34d399 | #10b981 | #059669 | #047857 | #065f46 | #064e3b | #022c22 |
| teal | #f0fdfa | #ccfbf1 | #99f6e4 | #5eead4 | #2dd4bf | #14b8a6 | #0d9488 | #0f766e | #115e59 | #134e4a | #042f2e |
| indigo | #eef2ff | #e0e7ff | #c7d2fe | #a5b4fc | #818cf8 | #6366f1 | #4f46e5 | #4338ca | #3730a3 | #312e81 | #1e1b4b |
| violet | #f5f3ff | #ede9fe | #ddd6fe | #c4b5fd | #a78bfa | #8b5cf6 | #7c3aed | #6d28d9 | #5b21b6 | #4c1d95 | #2e1065 |
| rose | #fff1f2 | #ffe4e6 | #fecdd3 | #fda4af | #fb7185 | #f43f5e | #e11d48 | #be123c | #9f1239 | #881337 | #4c0519 |
| amber | #fffbeb | #fef3c7 | #fde68a | #fcd34d | #fbbf24 | #f59e0b | #d97706 | #b45309 | #92400e | #78350f | #451a03 |
| blue | #eff6ff | #dbeafe | #bfdbfe | #93c5fd | #60a5fa | #3b82f6 | #2563eb | #1d4ed8 | #1e40af | #1e3a8a | #172554 |
| zinc | #fafafa | #f4f4f5 | #e4e4e7 | #d4d4d8 | #a1a1aa | #71717a | #52525b | #3f3f46 | #27272a | #18181b | #09090b |
| stone | #fafaf9 | #f5f5f4 | #e7e5e4 | #d6d3d1 | #a8a29e | #78716c | #57534e | #44403c | #292524 | #1c1917 | #0c0a09 |
| slate | #f8fafc | #f1f5f9 | #e2e8f0 | #cbd5e1 | #94a3b8 | #64748b | #475569 | #334155 | #1e293b | #0f172a | #020617 |
| neutral | #fafafa | #f5f5f5 | #e5e5e5 | #d4d4d4 | #a3a3a3 | #737373 | #525252 | #404040 | #262626 | #171717 | #0a0a0a |

Use these values when constructing per-candidate CSS custom properties.

---

## Phase 5: Generate Index

Write `docs/design/stylescapes/index.html` — a dark gallery page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[AppName] — Stylescape Comparison</title>
  <link rel="stylesheet" href="_stylescape.css">
</head>
<body class="ss-viewer">
  <div style="max-width: 1200px; margin: 0 auto; padding: 48px 24px;">
    <h1 style="font-size: 32px; font-weight: 300; margin-bottom: 8px;">
      [AppName] Stylescapes
    </h1>
    <p style="color: rgba(255,255,255,0.5); margin-bottom: 48px;">
      3 visual directions. Compare, then pick a winner.
    </p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px;">
      <!-- Card per candidate -->
      <a href="stylescape-1.html" class="ss-tile" style="text-decoration: none; color: inherit;">
        <!-- Mini palette strip -->
        <div class="ss-palette" style="margin-bottom: 16px;">...</div>
        <h2 style="font-size: 20px; margin-bottom: 4px;">[Archetype Name]</h2>
        <p style="color: rgba(255,255,255,0.5); font-size: 14px;">[3-word summary]</p>
        <p style="font-size: 13px; margin-top: 12px;">[1-sentence narrative excerpt]</p>
      </a>
      <!-- ... more cards ... -->
    </div>

    <p style="text-align: center; margin-top: 48px; color: rgba(255,255,255,0.4); font-size: 13px;">
      Compare all three, then run <code>/stylescape --pick N</code> to finalize.
    </p>
  </div>
</body>
</html>
```

---

## Phase 6: Selection & Finalize

1. **Present the boards.** Tell the user to open `docs/design/stylescapes/index.html` in their browser:
   > "Open `docs/design/stylescapes/index.html` to compare all three directions side by side. Each links to a full mood board with palette, typography, shape, and applied phone mockups."

2. **Ask for selection** via `AskUserQuestion`:

   **Q — Pick a winner (header: "Winner"):** "Which direction should we commit to?"
   - **Candidate 1: [Name]** — [3-word summary]
   - **Candidate 2: [Name]** — [3-word summary]
   - **Candidate 3: [Name]** — [3-word summary]
   - **Mix elements from multiple** — describe what to combine

3. **Update `docs/design/theme.md`:**
   - Promote the winning candidate's attributes into the main theme sections (Aesthetic Direction, Color System, Typography, Shape, Atmosphere, etc.)
   - Remove the `## Candidates` section entirely
   - Add the new sections (Icon Style, Illustration Direction, Image Treatment) from the winner
   - Update the narrative and style descriptors to the winner's specific versions
   - If "mix" was chosen: merge the specified attributes, rewrite narrative to reflect the hybrid

4. **Offer next steps:**
   ```
   Theme finalized: [Winner Name] — [3-word summary]
   ──────────────────────────────────────────────
   theme.md updated with the winning direction.

   Next steps:
     → /send-to-figma docs/design/stylescapes/  (push boards to Figma)
     → /generate-theme                           (apply palette to code)
   ```
   - If `pipeline.json` `flags.skip_figma` is true, omit the Figma step.

---

## `--pick <N>` Shortcut

If the user passes `--pick <N>`:

1. Read `docs/design/theme.md`
2. Find `### Candidate <N>:` block
3. Promote it directly (same as Phase 6 step 3)
4. Skip image generation and HTML creation entirely
5. Show the "Theme finalized" summary

---

## `--regenerate <N>` Mode

1. Read existing `docs/design/stylescapes/stylescape-<N>.html` to confirm it exists
2. Re-run Phase 2 for just this candidate (regenerate images)
3. Re-run Phase 4 for just this candidate (regenerate HTML)
4. Show: "Candidate <N> regenerated. Open the stylescape to review."

---

## Image Prompt Construction Reference

Build prompts from the candidate's attributes. Always include:
- The archetype name for aesthetic anchoring
- Specific hex values from the brand palette (not just "emerald" — use actual hex range)
- The atmosphere/surface treatment for depth cues
- "No text" suffix to avoid unwanted typography in images
- "Professional design system" framing for quality

**Per-archetype prompt modifiers:**

| Archetype | Mood shot keywords | Illustration keywords |
|-----------|-------------------|----------------------|
| Brutally minimal | stark contrast, negative space, monochrome composition | geometric, reductive, line art |
| Editorial/refined | warm paper texture, editorial layout, classical proportion | elegant, balanced, serif-inspired |
| Bold geometric | sharp angles, strong lines, high saturation | graphic, vector, bold shapes |
| High-contrast expressive | dramatic lighting, vivid accent on dark, theatrical | dynamic, energetic, high contrast |
| Warm & organic | soft texture, warm light, natural materials | hand-drawn, organic, rounded |
| Technical utility | grid system, blueprint aesthetic, information density | schematic, precise, functional |
| Hyperminimal | extreme reduction, single element, vast space | single stroke, monoline, invisible |
| Soft editorial | warm diffused light, gentle gradient, linen texture | watercolor wash, soft edges, muted |

---

## CSS Placeholder Strategy

When images are unavailable, replace each `.ss-image-tile img` with a `.ss-placeholder` div:

```html
<div class="ss-placeholder" style="
  background: linear-gradient(135deg, var(--brand-200), var(--brand-600), var(--brand-900));
  aspect-ratio: 1;
  border-radius: 12px;
"></div>
```

Vary the gradient angle and color stops per tile to create visual diversity:
- Mood shot: `135deg`, brand-200 → brand-600 → brand-900
- Color study: `90deg`, brand-50 → brand-300 → brand-700 → brand-950
- Illustration: radial-gradient, brand-100 center → brand-500 edge
- Icon grid: `180deg`, neutral-100 → neutral-300 (subtle)
- Texture: conic-gradient, brand-100 → brand-200 → neutral-100 → brand-100

---

## File Output Summary

```
docs/design/stylescapes/
├── _stylescape.css           # Shared viewer styles (~400 lines)
├── index.html                # Gallery comparing all candidates
├── stylescape-1.html         # Candidate 1 mood board + applied mockups
├── stylescape-2.html         # Candidate 2 mood board + applied mockups
├── stylescape-3.html         # Candidate 3 mood board + applied mockups
└── images/                   # AI-generated images (if available)
    ├── candidate-1-mood.png
    ├── candidate-1-gradient.png
    ├── candidate-1-illustration.png
    ├── candidate-1-icons.png
    ├── candidate-1-texture.png
    ├── candidate-2-mood.png
    ├── ...
    └── candidate-3-texture.png
```

---
name: generate-theme
description: >
  Full-stack theme application: palette, shadow tokens, component group overrides,
  Figma library sync, then approval-gated code write. Run after /define-theme
  (which provides creative direction), or standalone. Pushes tokens + reference
  frames to a user-owned Figma file for visual review, then waits for approval
  before touching any code files.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# /generate-theme — Apply the full theme across code and Figma

## Purpose

Turn design direction (from `/define-theme` or standalone input) into shipped tokens.

The flow is **Design → Figma → Approve → Code**. Never skip the approval gate.

1. **Design stage** — resolve palette, shadows, and component group overrides through questions
2. **Figma stage** — push everything to the user's Figma library file for visual review
3. **Approval gate** — user confirms Figma looks right
4. **Code stage** — write to `globals.css`, `DesignTokens.swift`, `DesignTokens.kt`, `docs/design-tokens.md`

## Arguments

`$ARGUMENTS` — optional:
- `--palette-only` — skip shadows and component overrides; do palette + Figma only (quick swap)
- `--skip-figma` — skip Figma push entirely, go straight from approval to code
- `--no-gate` — skip the approval gate (for automated/CI runs)

---

## Phase 0: Load Creative Context

Before asking anything, read context silently:

1. **`docs/design/theme.md`** — if it exists, extract:
   - `archetype` → drives shadow preset + component group defaults in later phases
   - `brand palette`, `neutral`, `radius arg` → pre-fill Phase 1 defaults
   - `atmosphere` → map to shadow preset in Phase 2
   - Any `locked: true` entries → skip those questions

2. **Current token files** — determine active palette:
   - Grep `globals.css` for `--color-zinc` or `--color-<name>` to find current brand
   - Grep `globals.css` for `--shadow-` to check if shadow tokens already exist

3. **`docs/components.md`** — extract the 5 component groups for Phase 3

4. **Figma CLI** — check if `figma-cli/` exists at workspace root (enables Phase 5)

Summarise what was loaded before asking any questions:
> "Loaded: archetype = [X], palette = [brand], shadows = [defined/not yet defined]. Ready to configure."

---

## Phase 1: Core Token Decisions

Ask via `AskUserQuestion` (4 questions). Use `docs/design/theme.md` values as defaults where available.

**Q1 — Brand palette (header: "Brand color"):**
Lead with the theme.md recommendation if one exists. Options (pick the most relevant):
- [Recommended from theme.md] ← "from your theme direction" — show first
- zinc — near-achromatic; minimal/technical archetypes
- indigo, rose, emerald, sky, violet, amber, teal, orange — one-line archetype note each
- Other → ask in follow-up

**Q2 — Neutral + mode (header: "Neutral & mode"):**
- **zinc · adaptive** — slightly cool gray, both light & dark. Best all-rounder (Recommended)
- **stone · adaptive** — warm gray, both modes. Refined/editorial.
- **slate · adaptive** — blue-cool, both modes. Data-forward apps.
- **zinc · dark-first** — dark surfaces, high contrast. Bold/expressive archetypes.
- **neutral · light only** — pure neutral, airy. Hyperminimal/luxury archetypes.

**Q3 — Corner radius (header: "Radius"):**
Use theme.md `radius arg` as recommended default.
- **full + lg** — pill buttons inside rounded-lg cards. Warm/playful archetypes.
- **lg** — rounded-lg buttons and cards. Default for most archetypes. ← usually recommended
- **md** — medium radius throughout. Editorial/refined.
- **sm** — nearly square elements. Technical/minimal.
- **none** — absolutely square. Brutalist/hyperminimal.

**Q4 — Controls (header: "Controls"):**
- **brand** — checkboxes, switches, and radio buttons use brand accent color
- **neutral** — controls stay gray regardless of brand (suits technical archetypes)

---

## Phase 2: Shadow System Design

> Skip this phase if `--palette-only` was passed.

### 2a. Determine recommended preset

Map `atmosphere` from `docs/design/theme.md` to a shadow preset automatically:

| `theme.md` atmosphere value | Shadow preset |
|---|---|
| Flat & clean | **FLAT** |
| Subtle elevation | **SOFT** |
| Material / glass | **LAYERED** |
| Atmospheric depth | **DRAMATIC** |
| Textured / editorial | **SOFT** |

If no `theme.md` or no atmosphere recorded, ask:

**Q_shadow — Shadow style (header: "Shadow depth"):**
- **Flat** — no shadows anywhere; borders and color alone define depth. Minimal/technical.
- **Soft** — barely perceptible hairline shadows. Subtle elevation with restraint. (Recommended for most)
- **Layered** — visible but controlled shadows. Material-like depth with overlapping panels.
- **Dramatic** — strong shaped shadows + brand glow on key elements. Atmospheric/expressive.

### 2b. Present preset token values for confirmation

Show the resolved preset values in a table before locking them. Ask: "Confirm these shadow tokens, or adjust a specific one?"

Options:
- Yes, lock these values
- Adjust a token — ask which one and what value
- Switch to a different preset

### 2c. Shadow preset reference values

#### FLAT
```
--shadow-none:       none
--shadow-sm:         none
--shadow-md:         none
--shadow-lg:         none
--shadow-xl:         none
--shadow-focus:      0 0 0 3px var(--surface-accent-low-contrast)
--shadow-brand-glow: none
```

#### SOFT
```
--shadow-none:       none
--shadow-sm:         0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 1px 0 rgb(0 0 0 / 0.04)
--shadow-md:         0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.06)
--shadow-lg:         0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)
--shadow-xl:         0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.06)
--shadow-focus:      0 0 0 3px var(--surface-accent-low-contrast)
--shadow-brand-glow: none
```

#### LAYERED
```
--shadow-none:       none
--shadow-sm:         0 2px 4px 0 rgb(0 0 0 / 0.08)
--shadow-md:         0 4px 12px 0 rgb(0 0 0 / 0.12), 0 2px 4px 0 rgb(0 0 0 / 0.08)
--shadow-lg:         0 8px 24px 0 rgb(0 0 0 / 0.16), 0 4px 8px 0 rgb(0 0 0 / 0.08)
--shadow-xl:         0 16px 48px 0 rgb(0 0 0 / 0.20), 0 8px 16px 0 rgb(0 0 0 / 0.10)
--shadow-focus:      0 0 0 3px var(--surface-accent-low-contrast)
--shadow-brand-glow: none
```

#### DRAMATIC
```
--shadow-none:       none
--shadow-sm:         0 2px 8px 0 rgb(0 0 0 / 0.10)
--shadow-md:         0 8px 16px -2px rgb(0 0 0 / 0.14), 0 4px 6px -2px rgb(0 0 0 / 0.08)
--shadow-lg:         0 16px 32px -4px rgb(0 0 0 / 0.18), 0 8px 12px -4px rgb(0 0 0 / 0.10)
--shadow-xl:         0 24px 64px -8px rgb(0 0 0 / 0.22), 0 12px 24px -6px rgb(0 0 0 / 0.14)
--shadow-focus:      0 0 0 3px var(--surface-accent-low-contrast)
--shadow-brand-glow: 0 0 24px 0 rgb(from var(--surface-accent-primary) r g b / 0.25)
```

### 2d. Dark mode shadow adjustments

For **FLAT**: no dark mode overrides needed (all `none`).
For **SOFT**: no overrides — shadows are imperceptible on dark surfaces anyway.
For **LAYERED**: increase all alphas by ×1.4 in dark mode (dark backgrounds reduce perceived shadow).
For **DRAMATIC**: increase all alphas by ×1.3 in dark mode. Keep `--shadow-brand-glow` as-is.

---

## Phase 3: Component Group Overrides

> Skip this phase if `--palette-only` was passed.

### 3a. Overview

Show the 5 component groups with archetype-derived defaults from the reference table at the end of this skill. For each group the user can:
- **Inherit** — use the archetype default (fast path, no extra questions)
- **Customize** — drill-down questions for that group (2–4 questions)
- **Lock** — freeze this group's decisions; future `/generate-theme` runs skip it

Ask via `AskUserQuestion` (multiSelect: true):
"Which groups do you want to customize? Leave unchecked = inherit from archetype."

```
□ Actions   — Button, IconButton         [show archetype default: e.g. "pill shape, brand solid"]
□ Selection — Chips, Tabs, SegmentBar    [e.g. "underline tabs, pill chips"]
□ Forms     — InputField, Checkbox, Switch, RadioButton  [e.g. "full-border, standard height"]
□ Feedback  — Toast, Badge               [e.g. "bottom toast, subtle badge"]
□ Display   — Thumbnail, Divider, TextBlock, ListItem    [e.g. "rounded thumbnails, hairline"]
```

### 3b. Drill-down questions per group

For each group the user checks "customize", ask in sequence:

**Group 1 — Actions (Button, IconButton):**
- Button shape: Pill (9999px) | Rounded (16px) | Compact (8px) | Square (4px)
- Primary fill: Brand solid (dark bg, white text) | Accent (coloured bg) | Outlined (border only)
- Secondary style: Ghost (text only) | Outlined (border) | Subtle fill (low-contrast bg)
- Icon button default size: Small (32px) | Medium (40px) | Large (48px)

**Group 2 — Selection (Chips, Tabs, SegmentControlBar):**
- Tab indicator: Underline (line under active tab) | Pill (active tab has pill bg) | Bordered (outline around active)
- Chip active style: Filled (solid bg) | Outlined (border, no fill) | Soft (low-contrast fill)
- Segment background: Surface card | Transparent | Brand low-contrast

**Group 3 — Forms (InputField, Checkbox, Switch, RadioButton):**
- Input border: Full border (all sides) | Bottom border only | No border (ghost, bg only)
- Input height: Compact (36px) | Standard (44px) | Tall (52px)
- Focus ring: Brand ring (3px, accent color) | Outline offset | Brand glow (DRAMATIC only)
- Checkbox/Radio checked fill: Brand solid | Accent | Neutral dark

**Group 4 — Feedback (Toast, Badge):**
- Toast position: Bottom center | Top center | Bottom leading
- Toast style: Solid (high-contrast bg) | Subtle (low-contrast + border)
- Badge default: Solid fill | Subtle (low-contrast bg + label) | Outline

**Group 5 — Display (Thumbnail, Divider, TextBlock, ListItem):**
- Thumbnail shape: Square | Rounded (16px) | Circle
- Divider weight: Hairline (0.5px) | Default (1px) | Thick (2px)
- List row height: Compact (48px) | Standard (56px) | Comfortable (64px)

### 3c. Lock option

After drill-down, ask: "Lock these choices? Locked groups won't be overridden by future theme changes."
- Yes, lock — record `locked: true` in theme.md
- No, keep flexible

---

## Phase 4: Figma File Setup

> Skip this phase if `--skip-figma` was passed. Jump to Phase 6.

### 4a. Advise on file duplication

Show this message before asking for a file key:

> **Figma library setup**
>
> `/generate-theme` pushes token variables and component reference frames to a Figma file.
> For the best experience, start from the BubblesKit base library:
>
> 1. Open this Figma Community file: `figma.com/community/file/ZtcCQT96M2dJZjU35X8uMQ`
> 2. Click **Duplicate to your drafts** — this gives you a personal copy to modify freely
> 3. Open your duplicate and copy the file key from the URL:
>    `figma.com/design/[THIS-IS-YOUR-KEY]/...`
> 4. Paste the file key below

### 4b. Ask for file key

**Q_figma — Figma file key (header: "Figma file"):**
Free-text input. Also show:
- Skip Figma push — apply to code directly (no Figma review)

If user skips: skip Phase 5, proceed to Phase 6 without the Figma gate.

### 4c. Preview execution plan

Before running any commands, show the full plan and ask "Proceed?":

```
Figma update plan
─────────────────────────────────────────────────
Target: figma.com/design/[file-key]/...

Will push:
  ✦ Token variables  — [brand] palette (242 primitives + 32 semantic light/dark)
  ✦ Shadow tokens    — 7 tokens ([PRESET_NAME] preset)
  ✦ Shadow swatches  — 1 reference frame showing all 6 shadow levels
  ✦ Component refs   — [N] group reference frames with resolved token values
  ✦ Palette grid     — colour swatch visualisation

Will NOT touch:
  — Existing component tree structure in Figma
  — Page layout, artboards, or other frames
─────────────────────────────────────────────────
```

---

## Phase 5: Execute Figma Push

Run the following figma-cli commands in sequence. Give friendly progress updates to the user after each step — never show raw terminal commands or output.

### Step 5.1: Connect
```bash
node figma-cli/src/index.js connect
```
If this fails: tell the user Figma Desktop must be open, and on macOS, Terminal needs Full Disk Access (System Settings → Privacy & Security → Full Disk Access).

### Step 5.2: Clear old variables
```bash
node figma-cli/src/index.js var delete-all
```

### Step 5.3: Push palette tokens
```bash
node figma-cli/src/index.js tokens preset shadcn
```
This pushes 242 primitives + 32 semantic tokens (light & dark modes).

### Step 5.4: Visualise palette
```bash
node figma-cli/src/index.js var visualize
```

### Step 5.5: Render shadow swatches

Build the render-batch JSON using the resolved shadow values from Phase 2. Substitute actual CSS values as text labels on each card.

```bash
node figma-cli/src/index.js render-batch '[
  "<Frame name=\"Shadows/Reference\" w={1040} h={260} bg=\"#f5f5f5\" flex=\"col\" gap={24} p={40}>
    <Text size={13} weight=\"bold\" color=\"#71717a\">SHADOW TOKENS — [PRESET_NAME] preset</Text>
    <Frame flex=\"row\" gap={20} items=\"center\">
      <Frame name=\"shadow-none\" w={140} h={88} bg=\"#ffffff\" rounded={12} flex=\"col\" p={12} gap={4}>
        <Text size={10} color=\"#a1a1aa\">--shadow-none</Text>
        <Text size={11} color=\"#71717a\">none</Text>
      </Frame>
      <Frame name=\"shadow-sm\" w={140} h={88} bg=\"#ffffff\" rounded={12} flex=\"col\" p={12} gap={4}>
        <Text size={10} color=\"#a1a1aa\">--shadow-sm</Text>
        <Text size={11} color=\"#71717a\">sm</Text>
      </Frame>
      <Frame name=\"shadow-md\" w={140} h={88} bg=\"#ffffff\" rounded={12} flex=\"col\" p={12} gap={4}>
        <Text size={10} color=\"#a1a1aa\">--shadow-md</Text>
        <Text size={11} color=\"#71717a\">md</Text>
      </Frame>
      <Frame name=\"shadow-lg\" w={140} h={88} bg=\"#ffffff\" rounded={12} flex=\"col\" p={12} gap={4}>
        <Text size={10} color=\"#a1a1aa\">--shadow-lg</Text>
        <Text size={11} color=\"#71717a\">lg</Text>
      </Frame>
      <Frame name=\"shadow-xl\" w={140} h={88} bg=\"#ffffff\" rounded={12} flex=\"col\" p={12} gap={4}>
        <Text size={10} color=\"#a1a1aa\">--shadow-xl</Text>
        <Text size={11} color=\"#71717a\">xl</Text>
      </Frame>
      <Frame name=\"shadow-focus\" w={140} h={88} bg=\"#ffffff\" rounded={12} stroke=\"#818cf8\" flex=\"col\" p={12} gap={4}>
        <Text size={10} color=\"#a1a1aa\">--shadow-focus</Text>
        <Text size={11} color=\"#71717a\">focus ring</Text>
      </Frame>
    </Frame>
  </Frame>"
]'
```

### Step 5.6: Render component group reference frames

For each of the 5 groups, render a reference frame with the resolved token values. Use actual hex values from the chosen palette.

**Substitute these values:**
- `[brand-solid]` → hex for brand-950 (light) or brand-600 if bright palette
- `[brand-text]` → `#ffffff` if dark bg, `#000000` if light bg
- `[radius-px]` → 9999 (full), 16 (lg), 12 (md), 8 (sm), 4 (none)
- `[input-h]` → 36 (compact), 44 (standard), 52 (tall)

```bash
node figma-cli/src/index.js render-batch '[
  "<Frame name=\"Theme/Actions\" w={800} h={220} bg=\"#ffffff\" flex=\"col\" gap={20} p={32}>
    <Text size={12} weight=\"bold\" color=\"#71717a\">ACTIONS — Button · IconButton</Text>
    <Frame flex=\"row\" gap={12} items=\"center\">
      <Frame w={120} h={44} bg=\"[brand-solid]\" rounded={[radius-px]} flex=\"row\" items=\"center\" justify=\"center\">
        <Text size={14} weight=\"medium\" color=\"[brand-text]\">Primary</Text>
      </Frame>
      <Frame w={120} h={44} bg=\"#ffffff\" rounded={[radius-px]} stroke=\"#e5e5e5\" flex=\"row\" items=\"center\" justify=\"center\">
        <Text size={14} weight=\"medium\" color=\"#09090b\">Secondary</Text>
      </Frame>
      <Frame w={120} h={44} bg=\"transparent\" flex=\"row\" items=\"center\" justify=\"center\">
        <Text size={14} weight=\"medium\" color=\"#09090b\">Tertiary</Text>
      </Frame>
    </Frame>
  </Frame>",
  "<Frame name=\"Theme/Selection\" w={800} h={220} bg=\"#ffffff\" flex=\"col\" gap={20} p={32}>
    <Text size={12} weight=\"bold\" color=\"#71717a\">SELECTION — Chips · Tabs · SegmentBar</Text>
    <Frame flex=\"row\" gap={12} items=\"center\">
      <Frame w={100} h={36} bg=\"[brand-solid]\" rounded={9999} flex=\"row\" items=\"center\" justify=\"center\">
        <Text size={13} weight=\"medium\" color=\"[brand-text]\">Active</Text>
      </Frame>
      <Frame w={100} h={36} bg=\"#f5f5f5\" rounded={9999} flex=\"row\" items=\"center\" justify=\"center\">
        <Text size={13} color=\"#71717a\">Default</Text>
      </Frame>
    </Frame>
  </Frame>",
  "<Frame name=\"Theme/Forms\" w={800} h={220} bg=\"#ffffff\" flex=\"col\" gap={20} p={32}>
    <Text size={12} weight=\"bold\" color=\"#71717a\">FORMS — InputField · Checkbox · Switch · Radio</Text>
    <Frame w={280} h={[input-h]} bg=\"#ffffff\" rounded={8} stroke=\"#e5e5e5\" flex=\"row\" items=\"center\" px={12}>
      <Text size={14} color=\"#a1a1aa\">Placeholder text</Text>
    </Frame>
  </Frame>",
  "<Frame name=\"Theme/Feedback\" w={800} h={220} bg=\"#ffffff\" flex=\"col\" gap={20} p={32}>
    <Text size={12} weight=\"bold\" color=\"#71717a\">FEEDBACK — Toast · Badge</Text>
    <Frame w={320} h={52} bg=\"#09090b\" rounded={12} flex=\"row\" items=\"center\" px={16} gap={12}>
      <Text size={14} color=\"#ffffff\">Toast message</Text>
    </Frame>
  </Frame>",
  "<Frame name=\"Theme/Display\" w={800} h={220} bg=\"#ffffff\" flex=\"col\" gap={20} p={32}>
    <Text size={12} weight=\"bold\" color=\"#71717a\">DISPLAY — Thumbnail · Divider · ListItem</Text>
    <Frame flex=\"row\" gap={12} items=\"center\">
      <Frame w={48} h={48} bg=\"#e5e5e5\" rounded={[radius-px]}></Frame>
      <Frame flex=\"col\" gap={4} grow={1}>
        <Text size={14} weight=\"medium\" color=\"#09090b\">List item title</Text>
        <Text size={13} color=\"#71717a\">Secondary text</Text>
      </Frame>
    </Frame>
  </Frame>"
]'
```

### Step 5.7: Report and prompt for review

```
Figma push complete
───────────────────────────────────
✓ Token variables  — [N] variables (palette + semantic)
✓ Shadow tokens    — 7 tokens, [PRESET_NAME] preset
✓ Shadow swatches  — reference frame created on canvas
✓ Component refs   — 5 group reference frames
✓ Palette grid     — colour swatches on canvas

Open your Figma file to review the token application and component frames.
Existing components that bind to variables will have updated automatically.

When everything looks right, come back here and say "approve" to apply to code.
```

---

## Phase 6: Approval Gate

Wait for the user to review in Figma and signal approval (type "approve", "looks good", "yes", etc.).

When approval is received, show a pre-write summary:

```
Code changes preview
───────────────────────────────────────────────────────────
The following will be written:

1. [web]/app/globals.css
   → Brand palette: [current] → [brand]
   → Shadow tokens: 7 new tokens added ([PRESET_NAME] preset)
   → Radius tokens: updated to [preset]

2. [ios]/DesignTokens.swift
   → Brand color extension: updated
   → AppShadow struct: added (7 tokens)
   → .appShadow() view modifier extension: added

3. [android]/DesignTokens.kt
   → PrimitiveColors: brand palette updated
   → AppShadows object: added (Elevation + alpha values)

4. docs/design-tokens.md
   → ## Shadows section added

5. docs/design/theme.md
   → Component overrides recorded
   → Shadow preset recorded

Apply to all platforms?
```

Options:
- **Yes, apply to all platforms** — run Phase 7
- **Web only** — apply globals.css only (mobile teams not ready yet)
- **Not yet** — stop here; re-run later

---

## Phase 7: Write to Code Files

### Step 7.1: Run theme-generator for palette + radius

Find the correct platform paths:
- Web: `multi-repo-nextjs/app/globals.css` — or Glob for `**/globals.css`
- iOS: Glob for `**/DesignTokens.swift`
- Android: Glob for `**/DesignTokens.kt`

```bash
node scripts/theme-generator.js \
  --brand [brand] \
  --neutral [neutral] \
  --radius [preset] \
  --selection [brand|neutral] \
  --web [path-to-globals.css] \
  --ios [path-to-DesignTokens.swift] \
  --android [path-to-DesignTokens.kt]
```

### Step 7.2: Write shadow tokens to CSS

In `globals.css`, find the `:root {` block. Add shadow tokens after the last `--border-*` line, before the closing `}`:

```css
  /* ── Shadows ──────────────────────────────────────────────────────────── */
  --shadow-none:       [value];
  --shadow-sm:         [value];
  --shadow-md:         [value];
  --shadow-lg:         [value];
  --shadow-xl:         [value];
  --shadow-focus:      0 0 0 3px var(--surface-accent-low-contrast);
  --shadow-brand-glow: [value or none];
```

For LAYERED or DRAMATIC presets, also add inside the `@media (prefers-color-scheme: dark)` block (increase alpha by ×1.4 for LAYERED, ×1.3 for DRAMATIC to compensate for dark surface perception):

```css
  /* Shadows — dark mode: increased opacity for visibility on dark surfaces */
  --shadow-sm:  [dark-adjusted value];
  --shadow-md:  [dark-adjusted value];
  --shadow-lg:  [dark-adjusted value];
  --shadow-xl:  [dark-adjusted value];
```

### Step 7.3: Write shadow tokens to Swift

In `DesignTokens.swift`, after the last `extension Color` block, add:

```swift
// MARK: - Shadows

/// AppShadow encapsulates the three parameters of a SwiftUI .shadow() modifier.
/// Usage: .appShadow(.shadowMD)
struct AppShadow {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

extension AppShadow {
    static let shadowNone  = AppShadow(color: .clear,                              radius: 0,         x: 0, y: 0)
    static let shadowSM    = AppShadow(color: .black.opacity([alpha-sm]),          radius: [r-sm],    x: 0, y: [y-sm])
    static let shadowMD    = AppShadow(color: .black.opacity([alpha-md]),          radius: [r-md],    x: 0, y: [y-md])
    static let shadowLG    = AppShadow(color: .black.opacity([alpha-lg]),          radius: [r-lg],    x: 0, y: [y-lg])
    static let shadowXL    = AppShadow(color: .black.opacity([alpha-xl]),          radius: [r-xl],    x: 0, y: [y-xl])
    static let shadowFocus = AppShadow(color: Color.appSurfaceAccentLowContrast,   radius: 3,         x: 0, y: 0)
}

extension View {
    /// Apply a shadow token. Example: `.appShadow(.shadowMD)`
    func appShadow(_ token: AppShadow) -> some View {
        self.shadow(color: token.color, radius: token.radius, x: token.x, y: token.y)
    }
}
```

**Swift token values by preset:**

| Preset   | sm (α, r, y)     | md (α, r, y)      | lg (α, r, y)       | xl (α, r, y)        |
|----------|------------------|-------------------|--------------------|---------------------|
| FLAT     | (0.00, 0, 0)     | (0.00, 0, 0)      | (0.00, 0, 0)       | (0.00, 0, 0)        |
| SOFT     | (0.04, 2, 1)     | (0.06, 6, 4)      | (0.08, 15, 10)     | (0.10, 25, 20)      |
| LAYERED  | (0.08, 4, 2)     | (0.12, 12, 4)     | (0.16, 24, 8)      | (0.20, 48, 16)      |
| DRAMATIC | (0.10, 8, 2)     | (0.14, 16, 8)     | (0.18, 32, 16)     | (0.22, 64, 24)      |

### Step 7.4: Write shadow tokens to Kotlin

In `DesignTokens.kt`, after the `SemanticColors` object, add:

```kotlin
// ── Shadows ──────────────────────────────────────────────────────────────────
/**
 * Shadow elevation tokens.
 * Use [Elevation] with Modifier.shadow(). Use [alpha*] for custom Canvas shadows.
 * Example: Modifier.shadow(elevation = AppShadows.Elevation.md, shape = RoundedCornerShape(Radius.md))
 */
object AppShadows {
    object Elevation {
        val none = 0.dp
        val sm   = [dp-sm].dp
        val md   = [dp-md].dp
        val lg   = [dp-lg].dp
        val xl   = [dp-xl].dp
    }
    // For custom alpha-based shadows (drawBehind / Canvas)
    val color     = Color.Black
    val alphaNone = 0f
    val alphaSM   = [alpha-sm]f
    val alphaMD   = [alpha-md]f
    val alphaLG   = [alpha-lg]f
    val alphaXL   = [alpha-xl]f
}
```

**Kotlin elevation + alpha values by preset:**

| Preset   | sm (dp, α)    | md (dp, α)     | lg (dp, α)     | xl (dp, α)     |
|----------|---------------|----------------|----------------|----------------|
| FLAT     | (0, 0.00)     | (0, 0.00)      | (0, 0.00)      | (0, 0.00)      |
| SOFT     | (2, 0.04)     | (4, 0.06)      | (8, 0.08)      | (12, 0.10)     |
| LAYERED  | (4, 0.08)     | (8, 0.12)      | (16, 0.16)     | (24, 0.20)     |
| DRAMATIC | (4, 0.10)     | (8, 0.14)      | (16, 0.18)     | (24, 0.22)     |

### Step 7.5: Update docs/design-tokens.md

Add a `## Shadows` section after the `## Border Colors` section:

```markdown
## Shadows

Shadow tokens define the elevation system. Preset applied: **[PRESET_NAME]**

**Web:** CSS custom properties on `:root` — use as `box-shadow: var(--shadow-md)`
**iOS:** `AppShadow` struct + `.appShadow()` view modifier in `DesignTokens.swift`
**Android:** `AppShadows.Elevation` dp values for `Modifier.shadow()` in `DesignTokens.kt`

| CSS Variable | Light value | iOS (AppShadow) | Android (Elevation) | Role |
|---|---|---|---|---|
| `--shadow-none` | `none` | `.shadowNone` | `Elevation.none` | No elevation (flat sections) |
| `--shadow-sm` | `[value]` | `.shadowSM` | `Elevation.sm` | Cards, list items |
| `--shadow-md` | `[value]` | `.shadowMD` | `Elevation.md` | Elevated cards, dropdowns |
| `--shadow-lg` | `[value]` | `.shadowLG` | `Elevation.lg` | Sheets, popovers |
| `--shadow-xl` | `[value]` | `.shadowXL` | `Elevation.xl` | Modals, full-screen overlays |
| `--shadow-focus` | `0 0 0 3px var(--surface-accent-low-contrast)` | `.shadowFocus` | — | Keyboard focus indicator |
| `--shadow-brand-glow` | `[value or none]` | — | — | Brand accent glow (DRAMATIC only) |
```

### Step 7.6: Update docs/design/theme.md

If `docs/design/theme.md` exists, append or update:

```markdown
## Component Group Decisions
> Updated by /generate-theme [date]

| Group | Decisions | Locked |
|---|---|---|
| Actions | [shape], [primary fill], [secondary style] | [✓ / —] |
| Selection | [tab style], [chip style], [segment bg] | [✓ / —] |
| Forms | [border], [height], [focus ring] | [✓ / —] |
| Feedback | [toast position], [toast style], [badge default] | [✓ / —] |
| Display | [thumbnail shape], [divider weight], [list density] | [✓ / —] |

## Shadow System
- Preset: [PRESET_NAME]
- Applied: [date]
- Custom overrides: [list per-token overrides, or "none"]
```

### Step 7.7: Final report

```
Theme applied ✓
───────────────────────────────────────────────────────────
Files updated:
  Web:     globals.css → Brand: [old]→[new] | Shadows: 7 tokens | Radius: [preset]
  iOS:     DesignTokens.swift → Brand updated | AppShadow struct added
  Android: DesignTokens.kt → Brand updated | AppShadows object added
  Docs:    design-tokens.md → Shadows section added
           design/theme.md → Component overrides + shadow preset recorded

Theme:
  Brand:    [palette] · Neutral: [neutral] · Mode: [adaptive/dark-first/light]
  Radius:   [preset] · Controls: [brand/neutral]
  Shadows:  [PRESET_NAME] preset

Next steps:
  /figma-design    — render full screens using this theme
  /asset-gen       — generate app icon and illustrations
  /design-token-sync — re-verify token sync after any manual tweaks
```

---

## Reference: Archetype → Component Group Defaults

Use this table to pre-fill group defaults in Phase 3 before asking questions.

| Archetype | Actions | Selection | Forms | Feedback | Display |
|---|---|---|---|---|---|
| Brutally minimal | Ghost primary, compact, square | Underline tabs, bordered chips | Borderless input, bottom-border focus | Top toast, outline badge | No thumbnails, hairline dividers |
| Editorial/refined | Rounded, subtle fill | Underline tabs, pill chips | Full-border, standard height | Bottom toast, subtle badge | Rounded thumbnails, hairline dividers |
| Bold geometric | Pill, brand solid | Pill tabs, filled chips | Full-border, compact | Bottom toast, solid badge | Square thumbnails, default dividers |
| High-contrast expressive | Sharp, high-contrast solid | Bordered tabs, filled chips | Sharp-border, compact | Bottom toast, solid badge | Square thumbnails, thick dividers |
| Warm & organic | Pill, soft fill | Pill tabs, soft chips | Full-border, tall, rounded | Bottom toast, subtle badge | Circle thumbnails, soft dividers |
| Technical utility | Compact, outlined | Underline tabs, outlined chips | Full-border, compact | Top toast (inline), outline badge | Square thumbnails, hairline dividers |
| Hyperminimal | Ghost, no fill | Underline tabs, text-only chips | Borderless, bottom-border | Top toast, no badge border | No thumbnails, hairline dividers |
| Soft editorial | Rounded, warm fill | Pill tabs, soft chips | Full-border, standard | Bottom toast, subtle badge | Rounded thumbnails, hairline dividers |
| Playful & tactile | Pill, bold fill, large | Pill tabs, filled chips | Full-border, tall, rounded | Bottom toast, solid badge | Circle thumbnails, soft dividers |

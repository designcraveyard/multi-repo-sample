# /asset-gen — Generate visual assets for the app using OpenAI image generation

## Description

Interactive asset generation pipeline. Reads `docs/design/theme.md` to ground style decisions, conducts a deep visual brief session (including user-shared reference images), builds `docs/design/asset-brief.md`, then calls the asset-gen plugin to generate images via OpenAI `gpt-image-1` and save them to `assets/generated/`.

## Trigger

User says "/asset-gen" or "generate assets" or "create illustrations" or "make app icons"

## Prerequisites

- `docs/design/theme.md` must exist (run `/design-discovery` first)
- `.env.local` at workspace root must contain `OPENAI_API_KEY=sk-...`
- Node.js must be available (`node --version`)
- Plugin dependencies installed: `cd .claude/plugins/asset-gen && npm install`

## Instructions

### Step 1: Read context

Read the following files before asking any questions:
- `docs/design/theme.md` — brand personality, style descriptors, illustration direction
- `docs/app-brief.md` — app name, purpose, audience (if exists)
- `docs/design/asset-brief.md` — skip to Step 4 if this already exists and user wants to regenerate

Echo back a 2-sentence summary: "Based on your theme, I understand the visual direction is [X]. Here's what I'll use as the foundation for this session."

### Step 2: Establish asset scope

Use `AskUserQuestion` to ask which asset categories to generate in this session (multiSelect):

- **App icon** — launcher icon / home screen mark
- **Splash / launch screen** — full-bleed opening image or animation frame
- **Onboarding illustrations** — per-step walkthrough scenes (ask: how many steps?)
- **Empty state illustrations** — per-screen "nothing here yet" images (ask: which screens?)
- **Hero / marketing imagery** — App Store banner, website header
- **Background textures / patterns** — subtle tile or atmospheric layer
- **Social / OG images** — share card, Twitter/OG preview
- **Other** — free-form description

For each selected category, note the quantity and any screen-specific requirements.

### Step 3: Deep visual brief

Ask in conversational batches. Reference `theme.md` descriptors already captured — do NOT re-ask questions already answered there. Fill in what's missing for generation specificity.

**Rendering style confirmation:**
1. Confirm or refine the illustration style from theme.md. Show 5 style options with short descriptions:
   - *Flat geometric* — clean shapes, solid fills, minimal shadow
   - *Soft 3D* — inflated forms, gentle gradients, subtle depth
   - *Hand-drawn* — imperfect lines, organic feel, textured fills
   - *Minimal line art* — single-weight outlines, sparse detail
   - *Painterly / editorial* — brushwork, atmospheric, expressive

2. Color treatment:
   - Strictly on-brand palette only?
   - Allow complementary accent colors?
   - Monochromatic with one accent?

3. Subject matter direction (pick per category):
   - Characters / people present? If yes: age range, diversity, abstract or realistic?
   - Objects and concepts only?
   - Abstract / environmental / atmospheric?

4. Composition feel:
   - Centered hero subject vs. off-center with breathing room
   - Dense / detailed vs. sparse / airy
   - Landscape / wide vs. portrait / tall vs. square

5. Background treatment:
   - Solid color from brand palette
   - Subtle gradient
   - Transparent (PNG with alpha)
   - Scene / environment

**Reference image analysis:**
After the above, say: "Drop any Pinterest screenshots, moodboard images, app screenshots, or inspiration references here. I'll analyze them to sharpen the generation prompts."

For each image shared:
- Use Claude vision to extract: color tendencies, rendering style, composition patterns, mood, subject matter
- Output a bullet list of extracted style signals
- Ask user: "Does this match what you're going for, or should I weight some signals more/less?"

Synthesize all extracted signals into a **Style DNA** block:
```
Style DNA:
- Rendering: [e.g., soft 3D with warm gradients]
- Color mood: [e.g., muted pastels, warm neutrals, single bold accent]
- Composition: [e.g., centered, generous whitespace, minimal props]
- Subject: [e.g., abstract objects, no humans, concept-driven]
- Texture: [e.g., subtle grain overlay, clean surfaces]
- Feeling: [e.g., calm, focused, trustworthy, slightly playful]
```

### Step 4: Build generation specs

For each asset in scope, build a generation spec entry:

```json
{
  "id": "empty-state-notes",
  "category": "empty-states",
  "label": "Empty State — Notes Screen",
  "size": "1024x1024",
  "outputPath": "assets/generated/empty-states/empty-state-notes-v1.png",
  "quality": "high",
  "prompt": "<full generation prompt>",
  "referenceImages": ["path/to/reference.png"],
  "referenceWeight": 0.6
}
```

**Prompt construction rules:**
- Start with the Style DNA rendering descriptor
- Add subject matter specific to the asset
- Include brand color direction (e.g., "using a warm amber accent on a soft cream background")
- Add composition notes
- End with negative prompt cues: "avoid text, avoid UI chrome, avoid photorealistic rendering"
- Target 80-120 words per prompt — specific enough to be consistent, not so rigid it loses creativity

Show the user the prompt for each asset before generating. Ask: "Does this look right, or should I adjust anything?"

Write `docs/design/asset-brief.md` with the full spec before calling the script.

### Step 5: Run generation pipeline

Check prerequisites:
```bash
ls .env.local
node --version
ls .claude/plugins/asset-gen/node_modules/.bin/node 2>/dev/null || echo "not installed"
```

If dependencies not installed:
```bash
cd .claude/plugins/asset-gen && npm install
```

Create output directories:
```bash
mkdir -p assets/generated/app-icon assets/generated/splash assets/generated/onboarding assets/generated/empty-states assets/generated/hero assets/generated/patterns assets/generated/social
```

Write the generation spec to a temp file and run:
```bash
node .claude/plugins/asset-gen/generate.js --spec /tmp/asset-gen-spec.json --env .env.local
```

The script outputs a JSON result with:
- `generated`: array of `{ id, outputPath, success, error? }`
- `manifestUpdated`: true/false

For each generated asset, report success or failure with the file path.

### Step 6: Post-generation options

After generation completes, offer three optional steps via `AskUserQuestion` (multiSelect):

**A — Update code references**
For empty states, heroes, onboarding: scan relevant component/screen files and update placeholder image `src` attributes or asset references to point at the newly generated files.

**B — Push to Figma**
If `figma-cli/` exists and Figma Desktop is open:
```bash
node figma-cli/src/index.js connect
```
Then for each generated PNG, import it as a Figma image fill on a new frame named after the asset ID.

**C — Skip — just save the files**
Files are already saved. Done.

### Step 7: Report

Print a summary table:

```
## Asset Generation Report

| Asset | Category | File | Status |
|-------|----------|------|--------|
| App Icon | app-icon | assets/generated/app-icon/app-icon-v1.png | ✓ |
| Empty State — Notes | empty-states | assets/generated/empty-states/empty-state-notes-v1.png | ✓ |
...

Brief saved: docs/design/asset-brief.md
Manifest updated: assets/generated/manifest.json

To iterate on any asset: /asset-iterate
```

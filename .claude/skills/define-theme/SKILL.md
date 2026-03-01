---
name: define-theme
description: >
  Define the visual identity for an app — commits to a bold aesthetic archetype, brand
  personality, color palette, typography direction, atmosphere, motion personality, and
  the "one unforgettable moment". Writes docs/design/theme.md and offers to apply via
  /generate-theme. Run after /design-discovery produces an IA, or standalone. Borrows
  the creative intentionality of /frontend-design: NEVER settle for generic defaults;
  always commit to a clear, distinctive visual direction.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---

# /define-theme — Define the app's visual identity

## Purpose

Turn a product brief into a complete, opinionated visual identity spec. This is the **creative**
half of theming — it defines direction, character, and distinctiveness. The **mechanical** half
is `/generate-theme` (palette execution). The output is `docs/design/theme.md`, which drives
`/generate-theme`, `/figma-design`, and `/asset-gen`.

**Core principle (from `/frontend-design`):**
> Commit to a BOLD aesthetic direction and execute it with precision. Generic "AI-default"
> aesthetics — muted purple gradients, Inter everywhere, uniform padding, flat everything —
> are the enemy. Every app should have ONE unforgettable thing. Define it here.

**Skill chain:**
```
/design-discovery  →  /define-theme  →  /generate-theme  →  /figma-design
  (IA + screens)      (identity spec)    (apply to code)    (render screens)
```

## Arguments

`$ARGUMENTS` — optional:
- `--update` — Revise existing `docs/design/theme.md`; surface current values as defaults
- `--palette-only` — Skip to palette selection only (for quick color swaps)
- `--apply` — After writing `theme.md`, immediately invoke `/generate-theme`

---

## Phase 0: Read Existing State

Before asking anything:

1. **Check for existing theme doc.** Read `docs/design/theme.md`.
   - If it exists and `--update` was NOT passed: show one-line summary and ask "Refine or start fresh?"
   - If refining: surface current values as defaults throughout.

2. **Read app context** (whichever exist):
   - `docs/app-brief.md` — name, category, one-liner, target audience
   - `docs/PRDs/` — scan for feature themes and emotional tenor
   - `docs/personas/` — who uses this and what they expect

3. **Read current code palette:**
   Grep `DesignTokens.swift` or `globals.css` for color palette names (colorEmerald, colorIndigo…).
   Note: "Current brand palette: emerald." Surface as a default option in Phase 2.

4. **Check Figma variables** (if Figma MCP is available):
   `mcp__figma__get_variable_defs` with the project file key. Note any brand variables found.

---

## Phase 1: Personality & Mood

Ask 2 questions via `AskUserQuestion` (header pair: "Personality" + "Mood").

**Q1 — Personality:** "How would you describe this app's personality?"
- **Calm & focused** — quiet, reliable, gets out of the way. Notion, Bear, Apple Notes.
- **Bold & expressive** — confident, high-energy, makes a statement. Craft, Todoist, Fantastical.
- **Warm & approachable** — friendly, human, a little soft. Day One, Things, Readwise.
- **Clean & technical** — precise, minimal, information-first. Linear, Arc, Obsidian.

**Q2 — Mood:** "What emotional quality should the design communicate?"
- **Focused clarity** — whitespace, restraint, one thing at a time
- **Quiet confidence** — premium without showiness, muted and refined
- **Warm energy** — inviting, rounded, personality in the details
- **Sharp precision** — high contrast, clear hierarchy, almost no decoration

---

## Phase 1.5: Aesthetic Archetype (Claude synthesis, no question yet)

**Do NOT ask a question.** Based on Phase 1, Claude synthesises a recommendation as narrative,
then asks the user to confirm it.

**Archetype mapping:**

| Personality + Mood | Primary archetype | Alternative |
|---|---|---|
| Calm + Focused clarity | **Brutally minimal** — extreme whitespace, type-only hierarchy, no surface ornamentation | **Editorial/refined** — generous type scale, soft depth |
| Calm + Quiet confidence | **Editorial/refined** — premium typography, subtle surface differentiation, restrained color | **Luxury minimal** — near-monochromatic, elevated spacing |
| Bold + Focused clarity | **Bold geometric** — strong typographic hierarchy, confident shapes, one dominant accent | **Graphic/editorial** — high-contrast sections, graphic dividers |
| Bold + Sharp precision | **High-contrast expressive** — dark or pure-white surfaces with stark accent moments | **Brutalist/raw** — structural elements exposed, rough energy |
| Warm + Warm energy | **Warm & organic** — rounded forms, warm neutrals, soft shadows, felt-not-seen texture | **Playful & tactile** — bubbly shapes, energetic, slightly toy-like |
| Warm + Quiet confidence | **Soft editorial** — warm grays, refined type, gentle shadows, natural accents | **Premium warm** — stone/cream palette, editorial rhythm |
| Clean + Focused clarity | **Technical utility** — tight grid, data-forward, monospace accents, zero decoration | **Arc-style** — utility that is secretly beautiful underneath |
| Clean + Sharp precision | **Hyperminimal** — maximum reduction; every element must justify its existence | **Crystalline** — minimal but with one sharp geometric signature |

**Write the recommendation as a specific narrative**, for example:
> "Given **Warm & approachable + Warm energy**, I'd point you toward **Warm & organic** —
> rounded, inviting, with subtle depth and a natural accent color. Think Day One: nothing
> flashy, but every surface feels considered. The alternative is **Soft editorial** if you
> want a slightly more composed, less bubbly feel. I'd start with Warm & organic."

Then ask:

**Q3 — Aesthetic archetype (header: "Aesthetic"):** "Does this feel right?"
- [Primary archetype] — [short description]
- [Alternative archetype] — [short description]
- Something different (describe it)

---

## Phase 2: Color & Typography Direction

Generate palette recommendations with rationale before asking. Use this mapping:

**Archetype → palette + typography character:**

| Archetype | Brand palette | Neutral | Typography character |
|---|---|---|---|
| Brutally minimal | Zinc, Slate (nearly achromatic) | zinc | Extreme size contrast, tight tracking, type does ALL the work |
| Editorial/refined | Emerald, Teal, Stone | stone | Display scale contrast, light-to-regular weight, generous leading |
| Bold geometric | Indigo, Violet, Rose | zinc | Heavy display weight, tight body, stark hierarchy |
| High-contrast expressive | Rose, Violet, Orange | zinc (dark-first) | Bold weights, dramatic scale jumps |
| Warm & organic | Amber, Teal, Green | stone | Regular-medium weights, slightly larger body, rounded feel |
| Technical utility | Blue, Indigo, Slate | slate | Regular weight, monospace accents for data/labels |
| Hyperminimal | Zinc, Slate (single accent shade) | neutral | One typeface, maximum size contrast, invisible color |
| Soft editorial | Teal, Emerald, Amber | stone | Light display weight, editorial body rhythm, generous spacing |

Present recommendations as specific narrative before asking Q4.

**Q4 — Brand palette (header: "Brand color"):**
- [Recommended 1] — [one-line rationale tied to archetype]
- [Recommended 2] — [one-line rationale]
- [Current palette if still suitable] — "currently configured"
- Something else (full Tailwind list)

**Q5 — Neutral, mode & typography feel (header: "Neutral & type"):**
- **zinc · adaptive · balanced type** — slightly cool gray, standard weights, sharp hierarchy. Best all-rounder. (Recommended for most)
- **stone · adaptive · editorial type** — warm gray, generous body text, light-to-regular weights. Refined journal feel.
- **slate · adaptive · technical type** — blue-cool, tight density, regular weight throughout. Data-forward apps.
- **zinc · dark-first · bold type** — dark surfaces, high contrast, heavier weights. Bold/expressive archetypes.
- **neutral · light only · spacious type** — pure neutral, airy layout, maximum whitespace. Hyperminimal/luxury.

---

## Phase 2.5: Typography Direction (Web Apps)

> Skip this phase if the app is iOS/Android only — those platforms use SF Pro / Roboto by default.
> Typography character on native is expressed through weight, scale, and tracking — not font family.
> For web (Next.js), font choice is one of the most differentiating decisions you can make.

Ask 1 question (or 2 if the user wants more control) via `AskUserQuestion`.

**Anti-generic mandate:** NEVER recommend Inter, Roboto, SF Pro, or Arial as a display or heading
font for web without explicit user request. These are defaults, not design decisions. Every theme
should offer at least one unexpected, distinctive choice.

**Q_type — Display / heading font character (header: "Display font"):**
"What character should headings and display text communicate on web? This is often the single most
memorable design choice."

- **Geometric precision** — clean, mathematical, contemporary. Confident without personality. → DM Sans, Outfit, Geist, Plus Jakarta Sans
- **Humanist warmth** — drawn from calligraphy, approachable at any size. → Figtree, Nunito, Lato, Atkinson Hyperlegible
- **Editorial serif** — authority meets modernity; mixes well with clean sans body. → Fraunces, Playfair Display, Lora, Source Serif 4
- **Monospace / honest** — code-aesthetic, technical authority, system-honest. → JetBrains Mono, IBM Plex Mono, Commit Mono
- **Characterful / expressive** — distinctive at large sizes, display-only. → Syne, Clash Display, Cabinet Grotesk, Satoshi

After the user selects, synthesize a pairing recommendation:
> "For [archetype] + [display choice], I'd pair: **[Display Font]** (heading/display) +
> **[Body Font]** (body/UI). Both are on Google Fonts. Rationale: [1 sentence on why it
> serves the archetype]. Avoid: [1 specific anti-choice, e.g. 'not Inter as display — too
> neutral for this archetype']."

---

## Phase 3: Shape, Density & Atmosphere

Ask 2 questions via `AskUserQuestion`.

**Q6 — Shape, space & layout philosophy (header: "Shape & space"):**
"How are elements shaped and laid out?"

- **Pill buttons / soft cards / balanced spacing** — interactive elements pill-shaped (r=9999), cards gently rounded (r=20), standard space-4/6 gaps. Current system default. (Recommended)
- **Uniformly rounded / spacious** — everything shares medium radius (r=12–16), editorial spacing, generous vertical rhythm. Suits warm/organic and editorial.
- **Sharp / compact** — near-square containers (r=4–8), tight spacing, information-dense. Suits technical and hyperminimal.
- **Ultra-rounded / spacious** — all elements use large or pill radius, generous padding everywhere. Playful/tactile archetypes.

Maps to `/generate-theme`: Pill/balanced → `full+lg`, Uniformly/spacious → `md`, Sharp/compact → `sm`, Ultra/spacious → `xl`.

**Q7 — Atmosphere & surface treatment (header: "Atmosphere"):**
"How should surfaces feel — what's the sense of depth?"

- **Flat & clean** — solid white/black, thin-border separation, no depth cues. Content is everything. Grid-breaking elements via bold typography, not shadows.
- **Subtle elevation** — slight background differentiation (white → zinc-50 → zinc-100 steps), hairline shadows on sheets. Quiet, unobtrusive depth. Standard grid.
- **Material / glass** — iOS vibrancy and blur, translucent overlays, layered transparency. Native iOS premium feel. Overlapping panels where logical.
- **Atmospheric depth** — gradient mesh or brand tint on background, floating cards with shaped shadows, colour bleeds between sections. Layout asymmetry encouraged.
- **Textured / editorial** — grain overlay, paper feel, or geometric pattern in background. Sections treated like magazine spreads (web). High visual richness.

---

## Phase 4: Motion, Signature & References

**Q8 — Motion & the unforgettable moment (header: "Motion & signature"):**
Two things in one answer. First, motion feel:

- **Minimal / instant** — system defaults only, no custom animation. Content-first, zero theatrics.
- **Purposeful micro-interactions** — spring physics on transitions and sheets, subtle state animations, light haptics. Polished without showiness.
- **Expressive & kinetic** — dramatic spring animations, playful transitions, rich haptic patterns. The UI has personality you can feel.

Then, immediately after the user picks motion, ask as a follow-on (in the same message or a
short subsequent one — keep it conversational):

> "What's the ONE moment in this app someone will remember? Something specific:
> the recording FAB pulses while capturing; AI responses stream in word-by-word; the
> note list has a spring on swipe-delete. Describe it — or say 'suggest one'."

If user says "suggest one": derive from the PRDs/IA context.
For a notes app example: "The voice recorder FAB expands into a full-screen sheet with a
fluid spring — the only moment of drama in an otherwise still interface."

**Reference images (optional, after Q8):**

> "Optional: drop screenshots, moodboard images, or competitor references — I'll extract
> style signals to sharpen the brief. Or type 'skip'."

If images provided: use Claude vision. Extract per image: color tendencies, typography feel,
surface treatment, density, motion energy, atmosphere. Consolidate. Ask: "Does this match,
or anything to adjust?"

---

## Phase 5: Anti-Generic Check

Before writing `theme.md`, review the accumulated answers against the anti-patterns list at
the bottom of this skill. If any combination risks landing in generic territory, say so:

> "One thing to sharpen: [specific risk]. For example, Zinc + balanced + flat + minimal
> is fine for a hyperminimal archetype, but combined with 'warm & approachable' it reads
> as underdeveloped. I'd suggest bumping atmosphere to 'subtle elevation' to give warmth
> some physical expression."

Only flag real risks — don't add noise. If the choices are coherent and committed, proceed.

---

## Phase 6: Write `docs/design/theme.md`

Synthesise all answers into the theme document.

```markdown
# Theme & Visual Identity

> Generated by /define-theme · [date]
> Apply with: `/generate-theme [brand] [neutral] --radius [preset]`

---

## Aesthetic Direction

| Attribute | Value |
|---|---|
| **Archetype** | [e.g. "Editorial/refined"] |
| Personality | [Q1] |
| Mood | [Q2] |
| In 3 words | [3 sharp adjectives — NOT "clean, simple, modern"; those describe nothing] |
| The unforgettable moment | [the signature interaction described in Phase 4] |

> [1–2 sentence narrative. Opinionated and specific — enough to brief a designer.
> Should NOT be applicable to any other app.]
> Example: "[AppName] feels like the thinking person's notebook: warm but precise,
> with generous whitespace that makes every note feel important. The only moment of
> drama is the recording button — everything else defers to the content."

---

## Color System

| Setting | Value | Rationale |
|---|---|---|
| Brand palette | [Tailwind name] | [1-sentence tied to archetype] |
| Neutral palette | [neutral] | [1-sentence] |
| Mode | [light / dark / adaptive] | |
| Brand accent (light) | [500–600 hex] | Primary interactive color |
| Brand accent (dark) | [300–400 hex] | Dark mode interactive color |
| Background base | [white / zinc-950 / etc.] | |

**Full Tailwind brand palette:** [name] (50–950)

---

## Typography Direction

| Setting | Value |
|---|---|
| Character | [e.g. "system-native, hierarchy through scale and weight alone"] |
| Display heading weight | [bold / heavy / light] |
| Body weight | [regular / light / medium] |
| Body size | [standard 16pt / editorial 17–18pt / compact 14pt] |
| Tracking (letter-spacing) | [normal / tight / loose — for display headings] |
| Monospace accents | [yes — for timestamps/data / no] |
| **Web display font** | [e.g. "Fraunces" — NEVER Inter or Roboto as display] |
| **Web body font** | [e.g. "DM Sans" or system-ui] |
| Font pairing rationale | [1 sentence on why this pairing serves the archetype] |
| Font availability | [Google Fonts / system / self-hosted] |

> **iOS/Android:** SF Pro / Roboto by default. Typography character expressed via weight,
> scale, and tracking — not font family. **Web:** full freedom. The display font is often
> the most memorable design decision. Commit to a pairing — don't leave it at Inter.

---

## Shape Language

| Setting | Value |
|---|---|
| Interactive elements | [pill / rounded / sharp] |
| Container radius | [radiusLG=20 / radiusXL=24 / radiusMD=12 / radiusSM=8] |
| `/generate-theme` radius arg | `[full / lg / md / sm / xl]` |
| Shape metaphor | [e.g. "pill-shaped actions inside generously rounded containers"] |

---

## Spatial Composition

| Setting | Value |
|---|---|
| Density | [balanced / spacious / compact] |
| Vertical rhythm | [tight / standard / generous] |
| Negative space role | [functional (separates zones) / expressive (breathing room IS the design)] |

---

## Atmosphere & Surface

| Setting | Value |
|---|---|
| Treatment | [flat / subtle elevation / material/glass / atmospheric] |
| Background depth | [single tone / subtle gradient / color bleed / layered] |
| iOS material | [system default / vibrancy/blur / custom] |
| Shadow style | [none / hairline / shaped / dramatic] |
| Texture | [none / grain overlay (web) / paper feel] |

---

## Motion & Interaction

| Setting | Value |
|---|---|
| Motion personality | [minimal / purposeful / expressive] |
| Primary transition | [e.g. "spring physics on sheets and navigation push"] |
| Haptics | [none / light / rich] |
| Signature animation | [name it — e.g. "The Recorder Spring"] |
| Anti-pattern to avoid | [e.g. "no decorative loading states — transitions feel instant"] |

---

## Style Descriptors

[12–18 adjectives/phrases defining the visual language. Used by `/figma-design` for
render decisions and `/asset-gen` for illustration style. Be specific and vivid —
these should only fit THIS app.]

- [e.g. "warm zinc surfaces with a single emerald accent thread"]
- [e.g. "type does all the work — color is punctuation, not decoration"]
- [e.g. "generous vertical rhythm; each note card breathes"]
- [e.g. "spring animations that feel physical, not mechanical"]
- [e.g. "the recorder is the only moment of theatrics"]
- ...

---

## Visual References

[Apps, sites, or products referenced during the session]
[Extracted signals from reference images, if any]
[Contrast note: "We are NOT going for [X] — e.g. not clinical, not dark-for-dark's-sake"]

---

## Anti-Patterns to Avoid

[Specific things NOT to do — tied to this archetype and these choices. Not generic.]

- [ ] [e.g. "No purple gradients — brand is emerald, keep it"]
- [ ] [e.g. "No bold shadow boxes — elevation is hairline only"]
- [ ] [e.g. "No Inter or Roboto on web — choose a characterful alternative"]
- [ ] [e.g. "No decorative loading states — transitions feel instant"]

---

## Next Steps

1. Apply palette to all platforms:
   `/generate-theme [brand] [neutral] --radius [preset]`

2. Push updated tokens to Figma:
   `node figma-cli/src/index.js tokens preset shadcn`

3. Render screens using this identity:
   `/figma-design`

4. Generate app icon and empty-state illustrations:
   `/asset-gen`
```

---

## Phase 7: Apply

After writing the doc, summarise the identity in 2–3 sentences (use the theme.md narrative)
and ask:

"Theme doc written. Ready to apply this palette to all platform files now?"

Options:
- **Yes, apply now** — run `/generate-theme [brand] [neutral] --radius [preset]` immediately
- **Not yet** — print the exact command to run later, then stop

If applying: execute `/generate-theme`, report updated files.

---

## Palette × Archetype Reasoning Reference

| Palette | Archetype fit | Real-world use |
|---|---|---|
| **emerald** | Editorial/refined, Warm & organic, Soft editorial | Robinhood, cash.app |
| **teal** | Editorial/refined, Technical utility, Soft editorial | Notion accents, Figma |
| **indigo** | Bold geometric, Technical utility, High-contrast expressive | Linear, Supabase |
| **violet** | Bold geometric, High-contrast expressive | Vercel, Retool |
| **rose** | High-contrast expressive, Playful & tactile | Framer, Stripe accents |
| **amber** | Warm & organic, Playful & tactile | Bezel, Capo |
| **zinc** | Brutally minimal, Hyperminimal, Technical utility | Vercel, shadcn/ui |
| **slate** | Technical utility, Hyperminimal, Crystalline | Tailwind prose defaults |
| **stone** | Warm & organic, Soft editorial, Premium warm | Substack, Day One |

---

## Font Pairing Reference (Web)

Use when synthesizing a pairing recommendation in Phase 2.5.

> **Rule:** The display font should feel *slightly surprising* — not the first thing you'd
> reach for. Pair it with a body font that stays out of the way. Do NOT pair two expressive fonts.

| Archetype | Display (heading) | Body (UI/content) | Effect |
|-----------|-------------------|-------------------|--------|
| Brutally minimal | Geist / system | Geist | Type IS the design; no font identity needed |
| Editorial/refined | Fraunces / Playfair Display | DM Sans / Switzer | Classical credibility × clean modernity |
| Soft editorial | Lora / Source Serif 4 | Figtree / Atkinson | Warm authority, readable at length |
| Bold geometric | Clash Display / Cabinet Grotesk | Geist / Outfit | Confident, unapologetically contemporary |
| High-contrast expressive | Syne / DM Serif Display | DM Sans | Drama on display, restraint in body |
| Warm & organic | Nunito / Figtree | Figtree / system | Rounded, human, never corporate |
| Technical utility | IBM Plex Mono / JetBrains Mono | IBM Plex Sans | Honest, systematic, code-adjacent |
| Hyperminimal | One font only (e.g. Geist) | same font | Reduction to a single voice |
| Luxury/refined | Cormorant Garamond / DM Serif | DM Sans | Premium restraint; serif at display only |
| Playful & tactile | Nunito / Quicksand | Nunito | Bubbly, friendly, never heavy |

**Explicit anti-choices by archetype:**
- Brutally minimal → NOT Playfair (too decorative), NOT Cabinet Grotesk (too fashionable)
- Editorial → NOT Inter (invisible, no character), NOT Roboto (Android-generic)
- Warm/organic → NOT Geist (too cold), NOT mono (too technical)
- Technical → NOT Fraunces (too editorial), NOT Nunito (too friendly)

---

## Anti-Generic Rules (from `/frontend-design` philosophy)

**NEVER:**
- Choose the "safe" option in every phase — safety compounds into forgettable
- Default to Zinc + Indigo + medium radius + flat as a generic starting point
- Let "balanced" in every dimension produce a theme with no point of view
- Use "clean, simple, modern" as style descriptors — they describe nothing
- Recommend Inter or Roboto as a web font (they are the Arial of 2025)
- Leave the "unforgettable moment" empty or vague
- Write a theme.md narrative paragraph that could apply to any app

**ALWAYS:**
- Commit to the archetype and let it have consequences — a **Brutally minimal** theme
  should feel uncomfortable in how much it removes
- Make the palette rationale feel inevitable given the personality
- List specific anti-patterns, tied to this app, not generic warnings
- Keep style descriptors opinionated and vivid — they are creative direction, not observation

**Self-check before writing theme.md:**
Read the 3-word summary and the narrative paragraph aloud. If they could describe three
different apps, the direction is not committed enough — sharpen before writing.

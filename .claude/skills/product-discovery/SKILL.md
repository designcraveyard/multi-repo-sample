# /product-discovery — Define what you're building

## Description

Interactive product definition wizard. Guides the user through problem definition, personas, feature brainstorming, and MVP scoping. Produces structured documents that downstream skills (/design-discovery, /schema-discovery) consume.

## Trigger

User says "/product-discovery" or "start product discovery" or "define the product"

## Instructions

### Step 1: Read Context

Read `tracker.md` in the project root to get the app name and description from scaffold.

### Step 2: Interactive Q&A

Conduct a structured conversation with the user. Use `AskUserQuestion` for choices, free-form questions for open-ended topics.

**Problem & Audience:**
1. What problem does this app solve? (free-form)
2. Who is it for? Describe 2-3 target user types (→ will become personas)
3. What's the one-line elevator pitch?

**Features:**
4. Brainstorm features together:
   - Ask user to list all features they can think of (free-form)
   - Help organize into categories
   - For each feature, write a 1-2 sentence description
5. Prioritize using MoSCoW:
   - Must Have (MVP)
   - Should Have (post-MVP priority)
   - Could Have (nice to have)
   - Won't Have (out of scope)
6. Define the MVP boundary — which Must-Haves ship in v1?

**Competitive Context:**
7. Any competitive or reference apps? (optional)
8. What differentiates this app?

### Step 3: Generate Output Documents

Create these files in the project's `docs/` directory:

**`docs/app-brief.md`:**
- App name, elevator pitch, value proposition
- Key differentiators
- Target audience summary
- Tech stack (from scaffold)

**`docs/personas/<name>.md`** (one per persona):
- Name, role, demographics
- Goals, frustrations, needs
- Key scenarios/user stories
- How this app helps them

**`docs/mvp-matrix.md`:**
- Feature priority table with columns: Feature | Priority | Description | Web | iOS | Android
- Group by Must/Should/Could/Won't
- Mark which platforms each feature applies to

**`docs/PRDs/<feature-slug>.md`** (one per Must-Have feature):
- Brief PRD (2-3 sentences + 3-5 key user stories)
- Data requirements (what data this feature needs)
- Platform notes (any platform-specific considerations)
- Status: Draft (will be expanded by /deep-dive)

### Step 4: Update Tracker

Update `tracker.md`:
- Set Phase "Product Definition" = Done, 100%
- Add each feature to the Features section with checkboxes
- Log key decisions in the Decision Log

### Output Summary

Print a summary of what was created:
- Number of personas, features, PRDs
- Suggest next step: `/design-discovery` or `/deep-dive <feature>` for detailed specs

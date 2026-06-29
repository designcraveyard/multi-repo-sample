# /product-discovery — Define what you're building

## Description

Interactive product definition wizard. Guides the user through problem definition, personas, feature brainstorming, and MVP scoping. Produces structured documents that downstream skills (/deep-dive, /pipeline, /schema-discovery) consume. Supports material ingestion and fast-track mode.

## Trigger

User says "/product-discovery" or "start product discovery" or "define the product"

## Instructions

### Phase 0: Ingest Existing Materials

Before asking questions, check if the user has existing materials:

Ask: "Do you have any existing docs, decks, notes, competitor references, or user interviews I should review first?"

Accept and process:
- Free-form text pasted directly
- File paths to local files (PDFs, docs, markdown, text files)
- Competitor app names or URLs
- Notion/Google Docs links (fetch via WebFetch if accessible)

For each provided material:
1. Read/fetch the content
2. Extract: problem statement, target audience, features mentioned, market positioning, user pain points
3. Build a running context summary

If materials are comprehensive (cover problem + audience + features):
- Enter **fast-track mode**: generate PRDs directly from ingested content
- Present draft documents for user review/adjustment
- Skip redundant Q&A questions (only ask what wasn't covered)

If no materials or materials are sparse → proceed to Step 1 as normal.

### Step 1: Read Context

Read `tracker.md` in the project root to get the app name and description from scaffold.

### Step 2: Smart Q&A (skip what's already known)

If Phase 0 provided materials, pre-fill answers from extracted content and present them for confirmation:
> "From your materials, I've gathered:
> - Problem: [extracted]
> - Target users: [extracted]
> - Key features: [extracted]
> Adjust anything? Or should I proceed with these?"

Only ask questions whose answers were NOT covered by the ingested materials.

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

### Step 2b: Competitive Research

Use WebSearch to research 3-5 similar/competitor apps automatically:
1. Search for apps solving the same problem
2. For each competitor found:
   - Name and brief description
   - Key features (how they solve the problem)
   - Pricing model (if visible)
   - App store ratings (if mobile app)
   - What users complain about (from reviews)
3. Present findings to user:
   > "Here's what I found in the competitive landscape:
   > | App | Key Features | Gap/Opportunity |
   > |-----|-------------|-----------------|
   > | ... | ... | ... |
   >
   > Any competitors I missed? Anything to adjust based on this?"

Use this competitive intelligence to inform the PRD differentiators.

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

**`docs/design/user-journeys/<persona-slug>.md`** (one per persona):
- Journey name and persona
- Trigger: what initiates the journey
- Steps: numbered sequence of user actions and system responses
- Outcome: what success looks like
- Pain points: where friction might occur
- Opportunities: where the app can delight

Example format:
```markdown
# User Journey: Daily Note Capture (Alex)

**Trigger:** Alex has an idea during a meeting

1. Opens app from home screen
2. Taps "Quick Note" FAB → editor opens with cursor ready
3. Types note in markdown → auto-saves every 2 seconds
4. Taps "Done" → returns to note list, new note at top
5. Later, searches for the note by keyword

**Outcome:** Note captured in <10 seconds, findable later
**Pain point:** If search is slow or inaccurate, Alex loses trust
**Opportunity:** AI-powered tagging could eliminate manual organization
```

**`docs/PRDs/<feature-slug>.md`** (one per Must-Have feature):
- Brief PRD (2-3 sentences + 3-5 key user stories with acceptance criteria)
- User stories format: "As a [persona], I want to [action] so that [benefit]"
  - Acceptance criteria: "Given [context], when [action], then [result]"
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
- Suggest next step: `/deep-dive <feature>` for detailed specs, or `/pipeline` to continue the full guided workflow

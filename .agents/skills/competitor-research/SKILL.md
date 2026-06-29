---
name: competitor-research
description: >
  Comprehensive competitor intelligence skill. For a list of competitor apps,
  pulls App Store + Play Store metadata and screenshots, scrapes live websites
  in desktop and mobile viewports, extracts user flows and page content,
  gathers review sentiment (iTunes RSS, google-play-scraper, Reddit/X),
  and captures UI patterns from Mobbin and pageflows.com. Synthesises
  everything into a feature matrix, gap analysis, and competitive brief.
  Outputs a local HTML gallery and/or a Figma board. Designed to run
  fully autonomously inside Codex Cowork — all questions are batched
  upfront in Phase 0, then execution is hands-free.
allowed-tools: Read, Glob, Grep, Write, Bash, WebSearch, WebFetch, AskUserQuestion, Agent, mcp__playwright__browser_navigate, mcp__playwright__browser_resize, mcp__playwright__browser_take_screenshot, mcp__playwright__browser_snapshot, mcp__playwright__browser_fill_form, mcp__playwright__browser_wait_for, mcp__playwright__browser_click, mcp__playwright__browser_network_requests
---

# /competitor-research — Competitor Intelligence Report

## Description
Builds a complete competitor intelligence dossier: app store metadata, live website flows (desktop + mobile), UI screenshots from Mobbin/pageflows, review sentiment, feature matrix, and gap analysis. Outputs a browsable HTML gallery and `docs/competitive/brief.md`. Runs autonomously in Codex Cowork or interactively in Codex CLI.

## Trigger
User says `/competitor-research` or "run competitor research" or "analyse my competitors"

## Arguments
- No arguments required — all inputs collected in Phase 0
- Optional: `/competitor-research --competitors "App1, App2, App3"` to skip discovery

---

## Instructions

### ⚡ Cowork Note
This skill is optimised for **Codex Cowork** (Codex Desktop autonomous mode). All interactive questions are batched in Phase 0. After Phase 0, the skill runs end-to-end without further prompts. When running in standard Codex CLI, the same Phase 0 questions apply — then execution proceeds autonomously.

---

### Phase 0 — Setup (All Questions Upfront)

**Step 0.1 — Read existing context**

If `docs/app-brief.md` exists, read it. Extract:
- Product category / keywords
- Target user segment
- Any competitors already mentioned

**Step 0.2 — Ask all setup questions in a single batch**

Use `AskUserQuestion` with up to 4 questions at once:

```
Q1: What is your app / product category? (pre-fill from app-brief.md if found)
Q2: List any known competitors (comma-separated). Leave blank to auto-discover.
Q3: Which region/market to focus on? (default: US)
Q4: Output format — HTML Gallery, Figma Push, or Both?
```

Also ask:
- Any gated sites (Mobbin, competitor apps) where you have login credentials?
  Provide as `site: email / password` — stored only in-memory for this session, never written to disk.
- Should the skill capture core in-app flows after login, or public-facing pages only?

**Step 0.3 — Competitor discovery**

If user provided < 3 competitors, run `WebSearch`:
- `"<category>" app top competitors 2025`
- `best <category> apps site:producthunt.com OR site:g2.com`

Build a final competitor list of 5–8 apps. Confirm with user if running interactively; proceed automatically in Cowork.

**Step 0.4 — Initialise output directory**

```bash
mkdir -p docs/competitive/screenshots
mkdir -p docs/competitive/reviews
```

Create `docs/competitive/research-state.json`:
```json
{
  "competitors": [...],
  "region": "us",
  "output_mode": "gallery|figma|both",
  "credentials": {},
  "phases_complete": []
}
```

---

### Phase 1 — App Store Metadata + Screenshots

For each competitor, run in sequence (or parallel via Agent if > 3 competitors):

**1a. iTunes Search API (App Store)**

```
WebFetch: https://itunes.apple.com/search?term=<app>&entity=software&country=<region>&limit=5
```

Extract from response:
- `trackName`, `averageUserRating`, `userRatingCount`, `description`
- `screenshotUrls[]`, `price`, `artistName`, `primaryGenreName`, `trackId`

Download screenshots via Bash:
```bash
mkdir -p docs/competitive/screenshots/<competitor>/ios
curl -o docs/competitive/screenshots/<competitor>/ios/screen-1.png "<screenshotUrl1>"
# repeat for each URL
```

**1b. Play Store (Playwright)**

If bundle ID known, navigate directly:
```
browser_navigate: https://play.google.com/store/apps/details?id=<bundleId>&hl=en&gl=<region>
```

If only name known, search first:
```
browser_navigate: https://play.google.com/store/search?q=<name>&c=apps
```
Then click the top result to get to the detail page.

Use `browser_snapshot` to extract:
- Rating, review count, description, developer, last update, install count
- Screenshot image URLs from the page

Use `browser_take_screenshot` for the full listing page.

Download Play Store screenshots:
```bash
mkdir -p docs/competitive/screenshots/<competitor>/android
curl -o docs/competitive/screenshots/<competitor>/android/screen-1.png "<url>"
```

Save combined metadata to `docs/competitive/reviews/<competitor>.json`:
```json
{
  "name": "...",
  "ios": { "rating": 4.5, "reviews": 12000, "price": "Free", "appId": "..." },
  "android": { "rating": 4.3, "reviews": 8500, "bundleId": "..." },
  "description": "..."
}
```

---

### Phase 2 — Live Website & Msite Analysis

For each competitor:

**2a. Detect web presence**

```
WebSearch: "<CompetitorName>" official website OR web app OR msite
```

Identify: marketing site URL, web app URL (if different), msite (m.competitor.com).

**2b. Desktop screenshots (1440×900)**

```
browser_resize: { width: 1440, height: 900 }
browser_navigate: <homepage URL>
browser_take_screenshot → docs/competitive/screenshots/<competitor>/web/desktop-home.png
browser_snapshot → extract: headline, subheadline, primary CTA, nav items, key features listed
```

Walk these pages (screenshot + snapshot each):
1. Homepage
2. Features / Product page
3. Pricing page (if exists)
4. Signup / Register page

**2c. Mobile screenshots (390×844)**

```
browser_resize: { width: 390, height: 844 }
```

Repeat the same 4 pages:
```
browser_navigate: <homepage>
browser_take_screenshot → docs/competitive/screenshots/<competitor>/web/mobile-home.png
```

For msites (m.competitor.com), navigate there instead and repeat.

**2d. Core user flow capture (requires login)**

If user provided credentials in Phase 0 OR user opted into in-app flow capture:

```
browser_navigate: <login page>
browser_fill_form: { email: "...", password: "..." }
browser_click: [Login button]
browser_wait_for: { url_contains: "dashboard OR home OR feed" }
```

After login, capture these flows (1 screenshot per step):
1. **Onboarding** — if first-login experience is detectable (look for tour/welcome/setup steps)
2. **Core action flow** — the app's primary value action (create, explore, complete — infer from product category)
3. **Settings / Profile** — what customisation is exposed

```
browser_take_screenshot → docs/competitive/screenshots/<competitor>/web/desktop-flow-<n>.png
```

**2e. Gated content fallback (Chrome extension)**

If Playwright is blocked by bot-detection or hard login wall:

> "I can't access `<URL>` automatically. If you have the Codex Chrome extension installed, open it in your browser, navigate to this page while logged in, then paste the page content or screenshots into the chat and I'll continue."

Accept pasted content and proceed with text extraction.

**2f. Build web flow map**

From all snapshots, synthesise a flow map:
```
Landing → [CTA: "Start Free"] → Signup (Email/Google/Apple) →
Onboarding (3 steps: goal → profile → first action) →
Dashboard → Core Feature → Share/Export
```

Note: feature names used, tone of copy, friction points, trust signals.

---

### Phase 3 — UI Pattern Screenshots (Design Reference Sites)

**3a. pageflows.com**

```
browser_resize: { width: 1440, height: 900 }
browser_navigate: https://pageflows.com/
browser_fill_form OR browser_click search: "<competitor name>"
```

Capture visible flow thumbnails:
```
browser_take_screenshot → docs/competitive/screenshots/<competitor>/pageflows/overview.png
```

Click into individual flows if accessible. If login wall appears:
- Apply login-pause pattern (credentials from Phase 0, or `browser_wait_for` manual login)
- After auth, search and capture

**3b. Mobbin**

```
browser_navigate: https://mobbin.com/browse/ios/apps
```

Search for competitor:
```
browser_click: [Search]
browser_type: "<competitor name>"
```

Capture app screen grid:
```
browser_take_screenshot → docs/competitive/screenshots/<competitor>/mobbin/overview.png
```

Click individual screens if accessible. Apply login-pause pattern if blocked.

---

### Phase 4 — Review Sentiment

For each competitor:

**4a. App Store reviews (iTunes RSS)**

```
WebFetch: https://itunes.apple.com/us/rss/customerreviews/page=1/id=<appId>/sortBy=mostRecent/json
WebFetch: https://itunes.apple.com/us/rss/customerreviews/page=2/id=<appId>/sortBy=mostRecent/json
# Pages 1-5 (up to 500 reviews)
```

Extract: rating, title, body, date. Synthesise:
- Top 5 praise themes (most common positive patterns)
- Top 5 complaint themes (most common negative patterns)
- 1-star dominant issues (what makes users rage-quit)

**4b. Play Store reviews (google-play-scraper)**

First check if installed:
```bash
pip show google-play-scraper 2>/dev/null || pip install google-play-scraper -q
```

Run scraper:
```bash
python3 -c "
import json
from google_play_scraper import reviews, Sort
result, _ = reviews(
    '<bundleId>',
    lang='en',
    country='us',
    sort=Sort.NEWEST,
    count=200
)
print(json.dumps(result))
" > docs/competitive/reviews/<competitor>-android-raw.json
```

Same synthesis: praise themes, complaint themes, 1-star patterns.

**4c. Reddit & X sentiment**

```
WebSearch: '"<AppName>" site:reddit.com (complaints OR problems OR hate OR love OR switched OR better)'
WebSearch: '"<AppName>" site:reddit.com review 2024 OR 2025'
WebSearch: '"<AppName>" (site:x.com OR site:twitter.com) feedback OR disappointed OR love'
```

For each search: read top 3–5 results, extract recurring themes, viral moments, community sentiment.

**4d. Write sentiment summary**

Append to `docs/competitive/reviews/<competitor>.json`:
```json
{
  "sentiment": {
    "ios_rating": 4.5,
    "android_rating": 4.3,
    "top_praise": ["Fast performance", "Clean UI", "Offline support"],
    "top_complaints": ["No dark mode", "Crashes on export", "Expensive subscription"],
    "one_star_issues": ["Data loss", "Subscription not cancellable"],
    "reddit_themes": ["Users praise X but hate Y", "Heavy comparison with CompetitorB"],
    "x_themes": ["Viral moment: Z", "Recurring complaint: W"]
  }
}
```

---

### Phase 5 — Feature Matrix & Gap Analysis

**5a. Build feature list**

From Phases 1–4, compile a master feature list across all competitors:
- Infer from: app descriptions, website feature pages, review praise/complaints, web flow maps

**5b. Score each competitor**

| Feature | Our App | CompA | CompB | CompC | CompD |
|---------|---------|-------|-------|-------|-------|
| iOS app | — | ✅ | ✅ | ❌ | ✅ |
| Android app | — | ✅ | ❌ | ✅ | ✅ |
| Web app | — | ✅ | ✅ | ✅ | ❌ |
| Offline mode | — | ✅ | ❌ | ❌ | ✅ |
| Free tier | — | ✅ | ❌ | ✅ | ✅ |
| ... | | | | | |

**5c. Identify Gap Opportunities**

Cross-reference: features that are (a) commonly requested in reviews AND (b) missing from most competitors:

```
Gap Opportunities (ranked by user demand signal):
1. [Feature] — X% of competitor 1-star reviews mention this; only N/M competitors offer it
2. ...
```

**5d. Pricing & positioning map**

| Competitor | Free Tier | Paid From | Model | Platform |
|-----------|-----------|-----------|-------|----------|
| CompA | Yes (limited) | $9.99/mo | Freemium | iOS + Web |
| CompB | No | $4.99/mo | Subscription | All |
| ... | | | | |

---

### Phase 6 — Output

**6a. Always: Write `docs/competitive/brief.md`**

Structure:
```markdown
# Competitive Analysis Brief
_Generated: <date>_

## Market Overview
<2–3 sentence landscape summary>

## Competitors Analysed
<list with App Store / Play Store links>

## Per-Competitor Summaries
### <CompetitorName>
- **Platforms:** iOS / Android / Web
- **Rating:** ⭐ 4.5 iOS · 4.3 Android
- **Pricing:** Free + $9.99/mo
- **Top Praise:** Fast, clean UI, reliable sync
- **Top Complaints:** No dark mode, expensive
- **Web Flow:** Landing → Email signup → 2-step onboarding → Dashboard
- **Design Notes:** [observations from Mobbin/pageflows/web captures]

## Feature Matrix
<table from Phase 5b>

## Pricing Map
<table from Phase 5d>

## Gap Opportunities
<ranked list from Phase 5c>

## Positioning Recommendation
<2–3 sentences on where our app can differentiate>
```

**6b. HTML Gallery (if output_mode = gallery or both)**

Generate `docs/competitive/index.html` — a self-contained single-file gallery:
- Left sidebar: competitor list (click to jump)
- Per-competitor section:
  - Header: name, rating badges (iOS / Android), pricing pill
  - Sentiment bar: praise themes (green) / complaint themes (red)
  - Screenshot tabs: `App Store` | `Play Store` | `Web Desktop` | `Web Mobile` | `Pageflows` | `Mobbin`
  - Screenshot grid: lazy-loaded `<img>` tags pointing to `./screenshots/<competitor>/...`
  - Web flow map: rendered as a simple horizontal step diagram
- Bottom: Feature Matrix table (sticky header)
- Bottom: Gap Opportunities section

Use inline CSS only (no external dependencies). Dark-mode aware via `prefers-color-scheme`.

Open when done:
```bash
open docs/competitive/index.html
```

**6c. Figma Push (if output_mode = figma or both)**

```bash
# Verify figma-cli is available
node figma-cli/src/index.js connect

# Create a Competitive Analysis page
node figma-cli/src/index.js render '<Frame name="Competitive Analysis — Overview" width={1440} height={900}>
  <!-- Feature matrix + gap opportunities -->
</Frame>'

# One frame per competitor
node figma-cli/src/index.js render '<Frame name="<CompetitorName>" width={1440} height={1200}>
  <!-- Screenshots + metadata + sentiment -->
</Frame>'

# Convert frames to components
node figma-cli/src/index.js node to-component "<frame node id>"
```

---

### Error Recovery

- **iTunes API returns no results**: Try alternate search terms (short name, developer name). If still empty, note in brief.md and continue.
- **Play Store scraper fails**: Fall back to Playwright scrape of the Play Store listing page directly.
- **Playwright blocked by bot-detection**: Apply Chrome extension fallback (Phase 2e). If also unavailable, note the gap and continue with other sources.
- **Mobbin/pageflows login wall with no credentials**: Skip screenshot capture for that site, note in brief.md: "Mobbin capture skipped — login required. Log in manually and re-run Phase 3 if needed."
- **google-play-scraper not installable**: Fall back to Playwright scrape of Play Store reviews page.
- **Figma CLI not connected**: Skip Figma push, report: "Figma CLI not connected. Open Figma Desktop and run `node figma-cli/src/index.js connect` to retry."

---

### Completion

Report:
```
✅ Competitor Research Complete
────────────────────────────────
Competitors analysed: N
Screenshots captured: N (iOS) + N (Android) + N (Web) + N (Mobbin/pageflows)
Reviews processed: ~N App Store + ~N Play Store + N Reddit/X threads

Outputs:
  docs/competitive/brief.md       ← written competitive brief
  docs/competitive/index.html     ← screenshot gallery (open to browse)
  docs/competitive/screenshots/   ← all captured images
  docs/competitive/reviews/       ← raw review data per competitor

Gap Opportunities identified: N
Top opportunity: <#1 gap from Phase 5c>
```

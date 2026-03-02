---
name: send-to-figma
description: >
  Serve HTML files from a folder locally, then use the Figma remote MCP server's
  generate_figma_design tool to capture each page as editable Figma layers.
  Supports wireframes, UI style prototypes, and any static HTML in the repo.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, TodoWrite, mcp__figma__generate_figma_design
---

# /send-to-figma — Batch HTML-to-Figma Capture

## Purpose

Take a folder of HTML files (wireframes, UI style prototypes, Next.js exported
pages, or any static HTML) and send each page to Figma as **editable design
layers** using the official Figma remote MCP server's `generate_figma_design`
tool.

---

## Usage

```
/send-to-figma                     # interactive — asks for folder
/send-to-figma <folder-path>       # direct — e.g. docs/design/ui-styles
/send-to-figma --nextjs            # serve running Next.js app instead of static files
```

`$ARGUMENTS` contains the raw invocation string. Parse it before Phase 1.

---

## Phase 0: Parse Arguments

Extract from `$ARGUMENTS`:
- `folder_path` — relative path to folder with HTML files, or empty (ask)
- `mode` — `static` (default) | `nextjs` (if `--nextjs` flag present)

---

## Phase 1: Folder Selection

### 1a. If no folder_path provided

Scan the repo for folders containing HTML files:

```
Glob: docs/**/*.html
Glob: **/*.html (exclude node_modules, .next, .git, figma-cli, figma-plugin-html-import)
```

Build a list of candidate folders (any folder with 2+ HTML files). Present to the user:

> **Which folder should I send to Figma?**
>
> Suggested folders:
> - `docs/design/ui-styles/` — 12 HTML screens (themed prototypes)
> - `docs/wireframes/` — 8 HTML screens (grayscale wireframes)
> - Other (enter a path)

### 1b. If `--nextjs` mode

Confirm that `multi-repo-nextjs/` exists and has a `package.json`. The skill
will use the running dev server (or start one) instead of a static file server.

---

## Phase 2: File Discovery & Confirmation

### Static mode

1. Glob `<folder_path>/*.html`
2. Exclude gallery/index files (`index.html` unless it's the only file)
3. Sort alphabetically
4. Show the file list to the user:

```
Found 12 HTML files in docs/design/ui-styles/:

 1. ai-chat.html
 2. chat-history.html
 3. folder-manager.html
 4. note-editor.html
 5. note-info.html
 6. note-list.html
 7. search-results.html
 8. settings.html
 9. tag-browser.html
10. voice-memo-detail.html
11. voice-memo-list.html
12. voice-recorder.html

Send all 12 pages to Figma, or select specific ones?
```

Options:
- **All** — process every file
- **Select** — user provides numbers (e.g. "1,3,5-8")
- **Single** — user picks one file

Store the final file list as `html_files[]`.

### Next.js mode

1. Read `multi-repo-nextjs/app/` directory structure
2. Identify all route pages (`page.tsx` files)
3. Map each to a URL path (e.g. `app/(authenticated)/page.tsx` → `/`)
4. Present the route list and let the user select

Store the final URL list as `page_urls[]`.

---

## Phase 3: Figma Destination

Ask the user:

> **Where should the captured designs go in Figma?**
> - **New Figma file** — creates a fresh file (you'll pick the org/team)
> - **Existing Figma file** — paste a Figma file URL
> - **Clipboard** — capture to clipboard for manual paste

Store as `destination` (new | existing | clipboard).

If `existing`, store the Figma URL as `figma_file_url`.

---

## Phase 4: Start Local Server & Inject Capture Script

### Static mode

Start a local HTTP server to serve the HTML folder. Use `-p` flag (not `-l`):

```bash
cd <workspace_root>
npx serve <folder_path> -p 8787 --no-clipboard 2>&1 &
SERVER_PID=$!
sleep 4
curl -s -o /dev/null -w "%{http_code}" http://localhost:8787/<first_file>.html
```

If port 8787 is in use, try 8788, 8789, etc.

Build the URL list:
```
base_url = http://localhost:8787
page_urls = html_files.map(f => base_url + "/" + f)
```

**Inject the Figma capture script** into every HTML file in `html_files[]`:

```bash
for f in <file1>.html <file2>.html ...; do
  sed -i '' 's|<meta charset="UTF-8" />|<meta charset="UTF-8" />\n  <script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>|' "<folder_path>/$f"
done
```

This is required — the capture script must be in the HTML source for the hash-based auto-capture to work.

### Next.js mode

Check if the dev server is already running on port 3000:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

If not running:
```bash
cd multi-repo-nextjs && npm run dev &
```

Wait for ready, then use `page_urls` from Phase 2 with `http://localhost:3000` as base.

---

## Phase 5: Capture Pages — ONE AT A TIME (Sequential)

> **CRITICAL: Browser tabs in the background get throttled and the capture script
> times out with "Capture timed out. Try keeping this tab in the foreground."
> You MUST capture pages one at a time, waiting for each to complete before
> opening the next. NEVER open multiple capture tabs in parallel.**

### 5a. First page — create the Figma file

1. Call `generate_figma_design` with NO `outputMode` to get destination options
2. Based on user's destination choice, call again with `outputMode: "newFile"` (+ `planKey`, `fileName`) or `"existingFile"` (+ `fileKey`)
3. This returns a `captureId`
4. Open the first page in the browser with the capture hash:
   ```bash
   open "http://localhost:8787/<first_file>.html#figmacapture=<captureId>&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F<captureId>%2Fsubmit&figmadelay=2000"
   ```
5. Wait 8 seconds: `sleep 8`
6. Poll: call `generate_figma_design` with `captureId: "<captureId>"`
7. If status is `pending`, wait 5s and poll again (up to 10 times)
8. Once `completed`, note the `file_key` from the response

### 5b. If `newFile` — user must claim the file first

When using `newFile`, the response returns a claim URL (e.g. `https://www.figma.com/integrations/claim/<key>`). The user **must open and claim this file** before `existingFile` mode will work for subsequent pages. Open the claim URL:

```bash
open "https://www.figma.com/integrations/claim/<file_key>"
```

Ask the user to paste the Figma file URL back after claiming. Extract the `fileKey` from it.

### 5c. Remaining pages — sequential loop

For each remaining page in `html_files[]`, repeat this exact sequence:

```
1. generate_figma_design(outputMode: "existingFile", fileKey: "<fileKey>")
   → returns new captureId

2. open "http://localhost:8787/<file>.html#figmacapture=<captureId>&figmaendpoint=...&figmadelay=2000"

3. sleep 8

4. Poll generate_figma_design(captureId: "<captureId>")
   → if pending, sleep 5 and poll again
   → once completed, proceed to next page

5. Print progress: "page_name captured (N/total)"
```

Use TodoWrite to track progress across all pages.

**DO NOT attempt to:**
- Open multiple tabs simultaneously (background tabs get throttled)
- Generate all capture IDs upfront then open all at once
- Use Playwright for local pages (the script tag + `open` approach works reliably when done one at a time)

---

## Phase 6: (Removed — captured automatically in Phase 5 loop)

---

## Phase 7: Cleanup & Summary

After all pages are captured:

1. **Remove injected capture scripts** from all HTML files:
   ```bash
   cd <workspace_root>/<folder_path>
   for f in *.html; do
     sed -i '' '/<script src="https:\/\/mcp.figma.com\/mcp\/html-to-design\/capture.js" async><\/script>/d' "$f"
   done
   ```

2. **Stop the local server:**
   ```bash
   kill $(lsof -ti:8787) 2>/dev/null
   ```

3. **Show a summary:**

```
## Figma capture complete

Sent ${captured_count} pages from ${folder_path}/:

| # | Page | Status |
|---|------|--------|
| 1 | AI Chat | captured |
| 2 | Chat History | captured |
| ... | ... | ... |

Figma file: https://www.figma.com/design/<fileKey>/...

### Next steps
- Open the Figma file to review captured layers
- Run `/figma-component-sync` to check component coverage
- Use Figma's auto-layout tools to refine captured frames
```

---

## Error Handling

| Error | Recovery |
|-------|----------|
| `npx serve` not available | Try `python3 -m http.server 8787` as fallback |
| Port 8787 in use | Try 8788, 8789, etc. Use `kill $(lsof -ti:8787)` to free it |
| `npx serve -l` ignores port | Use `-p` flag instead: `npx serve <folder> -p 8787` |
| `generate_figma_design` not available | Tell user to run: `claude mcp add --transport http figma https://mcp.figma.com/mcp` and authenticate via `/mcp` |
| HTML files reference external CSS (e.g. `tokens.css`) | Serve the whole folder so relative paths resolve |
| Browser fails to load page | Check server, retry URL |
| "Capture timed out" error | Tab was in background. **Must keep each tab in foreground.** Re-generate a captureId and re-open that single page |
| `existingFile` returns "file could not be accessed" | File from `newFile` claim URL must be claimed first. Open the claim URL, have user claim, then use the real fileKey |
| Capture stays `pending` after 10 polls | Verify: (1) capture script is in the HTML source, (2) server is running, (3) page loaded in foreground tab. Re-generate captureId if needed |
| Multiple pages opened in parallel all timeout | This is expected — browser throttles background tabs. Switch to one-at-a-time sequential capture |

---

## Relationship to Other Skills

| Skill | Relationship |
|-------|-------------|
| `/wireframe` | Upstream: generates the HTML wireframe files that this skill sends to Figma |
| `/figma-design` | Alternative: generates Figma frames via figma-cli render JSX — higher control but manual. This skill captures the full visual fidelity of the HTML. |
| `/define-theme` | Upstream: themed prototypes in `docs/design/ui-styles/` use the theme defined here |
| `/figma-component-sync` | Downstream: after capture, sync component registry with Figma |

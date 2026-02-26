# Markdown Table Editor Sheet — Design

**Date:** 2026-02-26
**Status:** Approved
**Scope:** iOS only (`multi-repo-ios`)

---

## Problem

The current inline table editing approach (`MarkdownTableView` overlay on `UITextView`) has fundamental
reliability issues: live-syncing `onModelChanged → syncTableToStorage` on every keystroke triggers
`collectionView.reloadData()` which destroys the active text field, crashes with stale NSRange
accesses when `lineBlocks` is out of date, and is difficult to debug or extend.

## Solution

Replace the inline editable overlay with a **dedicated full-screen sheet table editor**. The
embedded card becomes read-only. Editing only happens in the sheet. The text storage is only
touched on **Done** and **Delete** — no live sync.

---

## Architecture

### Separation of Concerns

| Concern | Old | New |
|---|---|---|
| Display table in editor | Editable `MarkdownTableView` overlay | Read-only `MarkdownTableCardView` |
| Edit table cells | Live-sync UITextField grid | `MarkdownTableEditorView` sheet |
| Write back to storage | `onModelChanged → syncTableToStorage` on every keystroke | Only on Done / Delete |

### Files

**Create:**
- `MarkdownTableCardView.swift` — read-only UIView card with scroll + delete button
- `MarkdownTableEditorView.swift` — SwiftUI full-screen sheet
- `MarkdownTableActionBar.swift` — floating pill action bar inside the sheet

**Modify:**
- `AppMarkdownEditor.swift` — swap overlay logic, add sheet state + presentation, remove all live-sync

**Retire:**
- `MarkdownTableView.swift` — fully replaced by `MarkdownTableCardView`

**Unchanged:**
- `MarkdownTableModel.swift`, `MarkdownTextStorage.swift`, `MarkdownLayoutManager.swift`

---

## Data Flow

### Insert New Table
1. User taps table button in `MarkdownKeyboardToolbar`
2. Coordinator inserts blank markdown at cursor:
   `"| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n|  |  |  |\n"`
3. `processEditing` → `lineBlocks` updated
4. `updateTableOverlays()` → `MarkdownTableCardView` created for the new group
5. Sheet opened immediately (blank model, `tableEditorGroupRange` = new group range)

### Edit Existing Table
1. User taps the `MarkdownTableCardView`
2. Tap gesture callback: read group range → `MarkdownTableModel.fromMarkdown(groupText)`
3. Sheet opened with pre-filled model and stored group range

### Done
1. `model.toMarkdown()` produces new pipe-syntax markdown
2. `storage.replaceCharacters(safeRange, newMarkdown)` with bounds-checked range
3. Sheet dismissed
4. `updateTableOverlays()` → card refreshes

### Cancel (new insert)
1. Remove the blank markdown that was inserted (restore cursor)
2. Sheet dismissed, no card shown

### Delete (from card)
1. `storage.replaceCharacters(groupRange, "")` — removes table from storage
2. Card removed from text view

---

## Component Specs

### MarkdownTableCardView

- **Type:** `UIView` subclass, added as subview of `UITextView` (same positioning as current overlay)
- **Layout:** positioned over the invisible table text rows, same rect calculation as `updateTableOverlays`
- **Interior:** `UIScrollView` (vertical, max 200pt height) wrapping a `UIStackView` of row views
- **Rows:** horizontal `UIStackView` of `UILabel` cells; equal fractional column widths
- **Header row:** semibold font, slightly darker background (`surfacesBaseLowContrast`)
- **Data rows:** body font, clear background, 0.5pt bottom border using `borderDefault`
- **Cell padding:** 8pt horizontal, 4pt vertical; text truncated with `byTruncatingTail`
- **Outer styling:** 8pt corner radius, 1pt border `borderDefault`, `surfacesBasePrimary` background
- **Delete button:** `UIButton` top-right corner (8pt inset), trash SF Symbol (14pt), `systemRed` tint, semi-transparent pill background — always visible
- **Tap target:** whole card minus delete button → `onTap: () -> Void` callback
- **Delete target:** delete button → `onDelete: () -> Void` callback

### MarkdownTableEditorView

- **Type:** SwiftUI `View` presented via `.fullScreenCover`
- **Conforms to:** `Identifiable` (so it can be used as `item:` in fullScreenCover)
- **Header:** `.appPageHeader(title: "Table", displayMode: .inline)` with:
  - Left: `AppIconButton` (back chevron `Ph.caretLeft.regular`) → `onCancel()`
  - Right: `AppButton("Done", variant: .primary, size: .small)` → `onDone(model)`
- **Grid:** `MarkdownTableEditorGrid` — `UIViewRepresentable` wrapping `UICollectionView`
  - Compositional layout: equal fractional column widths, estimated 44pt row height
  - Cell: `UITextField`, no border style, `returnKeyType = .next`, `UITextFieldDelegate`
  - `suppressReload` flag prevents `reloadData()` during text input
  - Tab → next cell, Return → next row (adds row if at last)
  - Horizontal + vertical scroll for large tables
- **Action bar:** `MarkdownTableActionBar` floating at bottom center, above keyboard via `keyboardLayoutGuide`

### MarkdownTableActionBar

- **Type:** SwiftUI `View` (pill shape, blur background matching `MarkdownKeyboardToolbar`)
- **Buttons (L→R):**
  1. Add Row (`plus` + down arrow icon)
  2. Add Column (`plus` + right arrow icon)
  3. Delete Row (`minus` + down arrow, disabled when only 1 row)
  4. Delete Column (`minus` + right arrow, disabled when only 1 column)
  5. Divider
  6. Align (tap → menu: Left / Center / Right, applies to focused column)
  7. Header toggle (toggle button, filled when header row is on)
- **Positioning:** `safeAreaInset(edge: .bottom)` with keyboard avoidance

---

## AppMarkdownEditor Changes

### New State (SwiftUI)
```swift
@State private var tableEditorModel: MarkdownTableModel?
@State private var tableEditorGroupRange: NSRange?   // nil = new insert
@State private var tableInsertRange: NSRange?        // cursor range before insert (for cancel)
```

### New Callback on MarkdownEditorRepresentable
```swift
var onTableTap: ((MarkdownTableModel, NSRange) -> Void)?
```

### Removed
- `tableOverlays` array and all `onModelChanged` / `syncTableToStorage` / `isUpdatingFromOverlay` live-sync code
- `MarkdownTableView` usage
- All deferred `updateTableOverlays()` calls from `textViewDidChange`

### Kept / Simplified
- `updateTableOverlays()` — still runs to position `MarkdownTableCardView` instances, but no model sync
- `tableGroups()` reading from `lineBlocks` — still used for positioning cards
- Bounds-check guards added in previous session remain

---

## Export

`MarkdownExporter.exportToFile(storage:filename:)` is unchanged — it exports the raw text storage
string which already contains the pipe-syntax markdown. Tables export correctly as standard
GitHub-Flavored Markdown tables.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Embedded card style | Non-editable visual grid | User selected option A |
| Action bar scope | Structural + alignment + header toggle | User selected option C |
| Table name | Static "Table" label | User selected option A |
| Card max height | 200pt, scrollable | User selected option B |
| Live sync | None — write-on-Done only | Eliminates all crash scenarios |

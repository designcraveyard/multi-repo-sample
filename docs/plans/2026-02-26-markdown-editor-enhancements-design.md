# Markdown Editor Enhancements — Design

**Date:** 2026-02-26
**Scope:** iOS markdown editor (`Components/MarkdownEditor/`)

## 1. Bear-Style Visual Tables

Replace pipe-syntax table rendering with custom `UIView` overlay system.

**Components:**
- `MarkdownTableView` — `UIView` with `UICollectionView` grid. Each cell is an editable `UITextField`.
- `MarkdownTableModel` — 2D array of cell strings, tracks header row, column widths, alignment per column.
- Table placeholder — `NSTextAttachment` in text storage; layout manager reserves vertical space; overlay renders the grid.

**Interactions:**
- Tap cell to edit (blue highlight)
- Three-dot context menu: Copy Table As (Markdown/CSV), Align Column, Add/Delete Row/Column, Move Row/Column
- Tab navigates cells; Enter moves to cell below or adds new row
- Context menu via `UIMenu` on long-press or three-dot button

**Styling (design tokens):**
- Borders: `borderDefault`, Header bg: `surfacesBaseLowContrast`, Selection: `surfacesBrandInteractive` @ 0.12 opacity
- Cell text: `MarkdownFonts.body`, Corner radius: 8pt

**Export:** Share button serializes `MarkdownTableModel` → pipe-delimited markdown with alignment markers.

## 2. Highlighted Text (`==text==`)

**Syntax:** `==highlighted text==` parsed in `MarkdownTextStorage` alongside existing inline formatting.

**Rendering:**
- Background: `surfacesWarningLowContrast` (yellow-tinted, light+dark)
- Rounded corners (3pt) via custom `NSLayoutManager` background drawing
- Full nesting: `==**bold**==`, `**==highlight==**`, etc.

**Toolbar:** Highlight button (highlighter SF Symbol) in both keyboard and selection toolbars. Toggle on/off.

## 3. Code Block Container + Toolbar Picker

**Container rendering:**
- Full-width rounded rect using `MarkdownColors.codeBackground`
- 12pt horizontal / 8pt vertical padding, 8pt corner radius
- Drawn by `MarkdownLayoutManager` behind all lines between ``` fences
- Fence markers visible in muted color inside container

**Toolbar picker:**
- Replace single code button with picker (like Aa heading button)
- Two options: Inline Code (single backticks) / Code Block (triple backticks)
- Chevron indicator on button icon

## 4. Image System

**Embedding (NSTextAttachment + image store):**
- `MarkdownImageStore` — `[UUID: ImageEntry]` (original image, cropped image, alt text)
- `MarkdownImageAttachment` — Custom `NSTextAttachment`, renders rounded-corner thumbnail (8pt radius, 1px border `borderMuted`), max width = text view width - margins

**Insertion sources (action sheet):**
- Camera (`UIImagePickerController`), Photos (`PHPickerViewController`), Files (`UIDocumentPickerViewController`), URL (alert + async download)
- New image button in toolbar (camera icon)

**Fullscreen viewer (`MarkdownImageViewer`):**
- Modal full screen, black background, status bar hidden
- `UIScrollView` with pinch-to-zoom, double-tap toggle (1x/2x)
- Swipe-down to dismiss (interactive)
- Top bar: Close (X), Crop button

**Custom crop (`MarkdownImageCropView`):**
- Draggable corner + edge handles, dimmed overlay (black @ 0.5)
- Aspect ratios: Free, 1:1, 4:3, 16:9
- Grid lines (rule of thirds, white @ 0.3)
- Handle color: `surfacesBrandInteractive`
- Cancel / Done in top bar

## 5. Share/Export (Raw Markdown)

- Share button in toolbar triggers `UIActivityViewController`
- Serializer walks `NSTextStorage` → raw markdown string
- Tables → pipe syntax, Highlights → `==text==`, Images → `![alt](image-uuid.jpg)`
- Output as `.md` UTI

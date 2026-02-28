# MarkdownEditor

**Figma:** bubbles-kit
**Web:** `multi-repo-nextjs/app/components/MarkdownEditor/MarkdownEditor.tsx`
**iOS:** `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift`
**Android:** `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppMarkdownEditor.kt`

---

## Overview

A rich-text WYSIWYG markdown editor with inline rendering, formatting toolbars, table support, and validation states. Users type standard markdown syntax (headings, lists, bold, italic, code, etc.) and the content renders as formatted text in-place.

Each platform uses a different rendering engine:
- **Web:** TipTap (ProseMirror) with extensions for tables, task lists, links, and the `tiptap-markdown` bridge for bidirectional markdown conversion. Includes a floating BubbleMenu on text selection and a fixed formatting toolbar (top on desktop, bottom on mobile). Optional AI transcribe (voice-to-text) and AI transform buttons.
- **iOS:** Custom `UITextView` + `NSAttributedString` backend with 15+ helper files covering text storage, layout, input processing, keyboard/selection toolbars, table editing, image attachments with crop/viewer, and markdown export. Supports a `showChrome` toggle for form-field vs. bare (Apple Notes style) display.
- **Android:** `compose-rich-editor` (`RichTextEditor` from `com.mohamedrejeb.richeditor`) with a horizontally scrollable formatting toolbar. Toolbar groups: inline formatting, headings, lists, blocks, and rich elements (table, link). Styling via `MarkdownEditorStyling` from the semantic design token system.

**Type:** Complex (rich-text editor composing multiple internal sub-components)

---

## Props

### Web (`MarkdownEditorProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | -- | **Required.** Raw markdown string |
| `onChange` | `(markdown: string) => void` | -- | **Required.** Called with raw markdown on every change |
| `label` | `string?` | `undefined` | Label rendered above the editor |
| `hint` | `string?` | `undefined` | Helper / validation text below the editor |
| `state` | `InputFieldState` | `"default"` | Validation state: `"default"` / `"success"` / `"warning"` / `"error"` |
| `placeholder` | `string` | `""` | Placeholder text when editor is empty |
| `minHeight` | `number` | `200` | Minimum height in pixels |
| `maxHeight` | `number?` | `undefined` | Maximum height in pixels (enables scrolling) |
| `disabled` | `boolean` | `false` | Disables the editor |
| `autoFocus` | `boolean` | `false` | Auto-focus the editor on mount |
| `enableAITranscribe` | `boolean` | `false` | Enable AI transcribe (mic) button in toolbar |
| `enableAITransform` | `boolean` | `false` | Enable AI transform (sparkles) button in toolbar |
| `className` | `string` | `""` | Additional CSS class on the outer wrapper |

### iOS (`AppMarkdownEditor`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `Binding<String>` | -- | **Required.** Markdown content binding |
| `label` | `String?` | `nil` | Optional field label above the editor |
| `placeholder` | `String` | `""` | Placeholder text when editor is empty |
| `state` | `AppInputFieldState` | `.default` | Validation state: `.default` / `.success` / `.warning` / `.error` |
| `hint` | `String?` | `nil` | Helper/error text below the editor |
| `minHeight` | `CGFloat` | `200` | Minimum editor height |
| `maxHeight` | `CGFloat?` | `nil` | Maximum editor height (scrolls beyond) |
| `isDisabled` | `Bool` | `false` | Disables editing |
| `showChrome` | `Bool` | `true` | Show form-field chrome (border, label, hint); `false` = bare full-bleed editor |

### Android (`AppMarkdownEditor`)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `value` | `String` | -- | **Required.** Current markdown string |
| `onValueChange` | `(String) -> Unit` | -- | **Required.** Callback when markdown content changes |
| `modifier` | `Modifier` | `Modifier` | Standard Compose modifier |
| `placeholder` | `String` | `""` | Placeholder text shown when editor is empty |
| `label` | `String?` | `null` | Optional label displayed above the editor |
| `hint` | `String?` | `null` | Helper/error text displayed below the editor |
| `state` | `MarkdownEditorState` | `Default` | Validation state: `Default` / `Success` / `Warning` / `Error` |
| `enabled` | `Boolean` | `true` | Whether the editor is interactive; `false` makes it read-only |

---

## Validation States

All platforms support four validation states that change border color and hint text color:

| State | Border | Hint Color | Description |
|-------|--------|------------|-------------|
| Default | `--border-default` / transparent | `--typography-muted` | Normal editing |
| Success | `--border-success` | `--typography-success` | Valid content |
| Warning | `--border-warning` | `--typography-warning` | Needs attention |
| Error | `--border-error` | `--typography-error` | Invalid content |

---

## Toolbar Features

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Bold | Yes | Yes | Yes |
| Italic | Yes | Yes | Yes |
| Strikethrough | Yes | Yes | Yes |
| Underline | No | No | Yes |
| Inline code | Yes | Yes | Yes |
| Headings (H1-H3) | Yes | Yes | Yes |
| Bullet list | Yes | Yes | Yes |
| Numbered list | Yes | Yes | Yes |
| Task list | Yes | Yes | Yes (via markdown) |
| Blockquote | Yes | Yes | Yes |
| Code block | Yes | Yes | Yes |
| Horizontal rule | Yes | Yes | Yes |
| Link | Yes | Yes | Yes |
| Table | Yes (TipTap extension) | Yes (custom card view) | Yes (markdown injection) |
| Image | No | Yes (attachment + crop + viewer) | No |
| AI Transcribe | Optional | No | No |
| AI Transform | Optional | No | No |

---

## Platform Differences

| Feature | Web | iOS | Android |
|---------|-----|-----|---------|
| Engine | TipTap (ProseMirror) | Custom UITextView + NSAttributedString | compose-rich-editor |
| Toolbar position | Fixed top (desktop) + bottom (mobile) + floating BubbleMenu | Fixed toolbar | Scrollable horizontal toolbar (bottom) |
| Table editing | TipTap table extension (resizable) | Custom `MarkdownTableEditorView` sheet | Raw markdown injection |
| Image support | No | Full (attachment, crop, viewer) | No |
| AI features | Transcribe + Transform buttons | No | No |
| Chrome toggle | No | `showChrome` for bare vs form-field style | No |
| Helper files | Single file + `MarkdownToolbar.tsx` + CSS | 15+ helper files in `Components/MarkdownEditor/` | Single file + `MarkdownEditorStyling` |

---

## Token Usage

| Property | Token |
|----------|-------|
| Border (default) | `--border-default` |
| Border (focused) | `--border-active` |
| Border (error) | `--border-error` |
| Background | `--surfaces-base-primary` |
| Text | `--typography-primary` |
| Placeholder | `--typography-secondary` |
| Label | `--typography-secondary` |
| Hint | `--typography-muted` (state-dependent) |
| Toolbar icons | `--typography-secondary` (active: `--surfaces-brand-interactive`) |
| Toolbar background | `--surfaces-base-primary` |
| BubbleMenu bg (web) | `--surfaces-inverse-primary` |
| BubbleMenu text (web) | `--typography-on-brand-primary` |
| Disabled | `opacity-50` / `0.5 opacity` |

---

## Usage Examples

### Web

```tsx
import { MarkdownEditor } from "@/app/components/MarkdownEditor";

// Basic
<MarkdownEditor value={md} onChange={setMd} label="Description" />

// With validation
<MarkdownEditor
  value={md}
  onChange={setMd}
  label="Notes"
  state="error"
  hint="Content is required"
/>

// With AI features
<MarkdownEditor
  value={md}
  onChange={setMd}
  enableAITranscribe
  enableAITransform
/>

// Custom height with placeholder
<MarkdownEditor
  value={md}
  onChange={setMd}
  minHeight={300}
  maxHeight={600}
  placeholder="Start writing..."
/>
```

### iOS

```swift
@State var markdown = ""

// Basic
AppMarkdownEditor(text: $markdown, label: "Description")

// With validation
AppMarkdownEditor(
    text: $markdown,
    label: "Notes",
    state: .error,
    hint: "Content is required"
)

// Bare mode (no chrome -- Apple Notes style)
AppMarkdownEditor(text: $markdown, showChrome: false)

// Custom height
AppMarkdownEditor(
    text: $markdown,
    placeholder: "Start writing...",
    minHeight: 300,
    maxHeight: 600
)
```

### Android

```kotlin
import com.abhishekverma.multirepo.ui.components.AppMarkdownEditor
import com.abhishekverma.multirepo.ui.components.MarkdownEditorState

var markdown by remember { mutableStateOf("") }

// Basic
AppMarkdownEditor(
    value = markdown,
    onValueChange = { markdown = it },
    label = "Description",
)

// With validation
AppMarkdownEditor(
    value = markdown,
    onValueChange = { markdown = it },
    label = "Notes",
    state = MarkdownEditorState.Error,
    hint = "Content is required",
)

// With placeholder
AppMarkdownEditor(
    value = markdown,
    onValueChange = { markdown = it },
    placeholder = "Start writing...",
)
```

---

## iOS Helper Files

The iOS implementation is a full custom UITextView stack with the following helper files in `Components/MarkdownEditor/`:

| File | Purpose |
|------|---------|
| `AppMarkdownEditor.swift` | SwiftUI entry point and coordinator |
| `MarkdownTextStorage.swift` | `NSTextStorage` subclass for real-time syntax highlighting |
| `MarkdownLayoutManager.swift` | Custom `NSLayoutManager` for rendering |
| `MarkdownInputProcessor.swift` | Processes keyboard input for markdown shortcuts |
| `MarkdownSelectionToolbar.swift` | Floating toolbar on text selection |
| `MarkdownKeyboardToolbar.swift` | Fixed keyboard-attached formatting toolbar |
| `MarkdownStyling.swift` | Centralized styling using semantic design tokens |
| `MarkdownTableModel.swift` | Data model for table cells |
| `MarkdownTableView.swift` | Table rendering in the editor |
| `MarkdownTableActionBar.swift` | Row/column add/delete toolbar for tables |
| `MarkdownTableEditorView.swift` | Sheet-based table editor UI |
| `MarkdownTableCardView.swift` | Compact table card representation |
| `MarkdownImageAttachment.swift` | Image attachment handling |
| `MarkdownImageStore.swift` | Image storage and management |
| `MarkdownImageCropView.swift` | Image cropping UI |
| `MarkdownImageViewer.swift` | Full-screen image viewer |
| `MarkdownExporter.swift` | Export markdown with embedded images |

---

## Accessibility

- **Web:** `role="textbox"` with `aria-multiline="true"`; `aria-invalid` set to `"true"` on error state; `aria-describedby` links to hint text element; `aria-label` falls back to the `label` prop or `"Markdown editor"`; BubbleMenu and toolbar buttons have `title` attributes for tooltips.
- **iOS:** Built on `UITextView` which provides native VoiceOver support; label and hint are announced via accessibility properties; toolbar buttons are accessible as standard UI elements.
- **Android:** Built on `RichTextEditor` from compose-rich-editor which provides built-in Compose semantics; label and hint are linked via content description; toolbar buttons have `contentDescription` set for TalkBack.

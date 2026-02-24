# Android Markdown Editor — Design

**Date:** 2026-02-24
**Status:** Approved

## Goal

Build a full-fledged markdown editor for the Android app matching iOS and web feature parity. The editor is a reusable Compose component with a demo screen wired into AdaptiveNavShell.

## Library Choice

**Compose RichEditor** (`com.mohamedrejeb.richeditor:richeditor-compose`) — Compose-native rich text editor with bidirectional markdown conversion. Analogous to Tiptap on web.

## File Structure

```
multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/
├── ui/components/AppMarkdownEditor.kt          # Reusable component
├── feature/editor/EditorScreen.kt              # Full-screen editor tab
├── feature/editor/EditorScreenState.kt         # Sealed state (pattern consistency)
├── navigation/Screen.kt                        # + Editor route
├── ui/native/NativeComponentStyling.kt         # + MarkdownEditorStyling
└── MainActivity.kt                             # + Editor tab in AdaptiveNavShell
```

## Component API

```kotlin
@Composable
fun AppMarkdownEditor(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    label: String? = null,
    hint: String? = null,
    state: InputFieldState = InputFieldState.Default,
    enabled: Boolean = true,
)
```

## Feature Set (Parity with iOS/Web)

### Inline Formatting
- Bold, Italic, Underline, Strikethrough, Inline Code

### Block Elements
- H1, H2, H3 headings
- Bullet list, Numbered list, Task list (checkboxes)
- Blockquote, Code block, Horizontal rule

### Rich Elements
- Table insertion (3x3 default)
- Link insertion (dialog prompt for URL + display text)

### Toolbar
Bottom fixed toolbar with horizontally scrollable buttons grouped by function:
1. Inline: Bold, Italic, Underline, Strikethrough, Code (5 buttons)
2. Headings: H1, H2, H3 (3 buttons)
3. Lists: Bullet, Numbered, Task (3 buttons)
4. Blocks: Quote, Code Block, HR (3 buttons)
5. Rich: Table, Link (2 buttons)

Dividers between groups. Active state uses `surfacesBrandInteractiveLowContrast`.

### Editor Screen Features
- Top bar with: Share, View Raw (opens AppBottomSheet), Done (dismiss keyboard)
- AppPageHeader integration
- Full-screen editor below header

## Navigation

- New route: `@Serializable data object Editor : Screen`
- Tab index 1 in AdaptiveNavShell (matching iOS: Components, **Editor**, Explore, Settings)
- Icon: `Icons.Outlined.Edit` (Phosphor `NotePencil` equivalent)

## Styling

All via semantic tokens:
- Colors: `SemanticColors.*`
- Spacing: `Spacing.*`
- Typography: `AppTypography.*`
- Centralized in `MarkdownEditorStyling` object inside `NativeComponentStyling.kt`

## Dependencies

Add to `libs.versions.toml`:
```toml
[versions]
richeditor = "1.0.0-rc11"

[libraries]
richeditor-compose = { module = "com.mohamedrejeb.richeditor:richeditor-compose", version.ref = "richeditor" }
```

Add to `app/build.gradle.kts`:
```kotlin
implementation(libs.richeditor.compose)
```

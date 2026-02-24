# Android Markdown Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-fledged markdown editor for Android with feature parity to iOS/web, wired as a tab in AdaptiveNavShell.

**Architecture:** Compose RichEditor library (`richeditor-compose:1.0.0-rc13`) provides the core rich text editing with markdown import/export. A reusable `AppMarkdownEditor` component wraps it with a formatting toolbar. An `EditorScreen` hosts it full-screen and adds top-bar actions (View Raw, Done).

**Tech Stack:** Kotlin, Jetpack Compose, richeditor-compose 1.0.0-rc13, Material Icons, Hilt

---

### Task 1: Add richeditor-compose dependency

**Files:**
- Modify: `multi-repo-android/gradle/libs.versions.toml:1-50`
- Modify: `multi-repo-android/app/build.gradle.kts:52-93`

**Step 1: Add version and library to version catalog**

In `gradle/libs.versions.toml`, add under `[versions]`:
```toml
richeditor = "1.0.0-rc13"
```

Under `[libraries]`:
```toml
richeditor-compose = { module = "com.mohamedrejeb.richeditor:richeditor-compose", version.ref = "richeditor" }
```

**Step 2: Add dependency to app build.gradle.kts**

In `app/build.gradle.kts`, add in `dependencies {}` block after the Serialization section:
```kotlin
    // Rich Text Editor
    implementation(libs.richeditor.compose)
```

**Step 3: Sync and verify build**

Run: `cd multi-repo-android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL

**Step 4: Commit**

```bash
git -C multi-repo-android add gradle/libs.versions.toml app/build.gradle.kts
git -C multi-repo-android commit -m "feat: add richeditor-compose dependency for markdown editor"
```

---

### Task 2: Add MarkdownEditorStyling to NativeComponentStyling.kt

**Files:**
- Modify: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/native/NativeComponentStyling.kt:246`

**Step 1: Append styling object**

Add at the end of `NativeComponentStyling.kt` (after `NativeRangeSliderStyling`):

```kotlin
// ── 14. Markdown Editor ─────────────────────────────────────────────────

object MarkdownEditorStyling {
    object Colors {
        val editorBackground: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBasePrimary
        val editorText: Color @Composable @ReadOnlyComposable get() = SemanticColors.typographyPrimary
        val placeholder: Color @Composable @ReadOnlyComposable get() = SemanticColors.typographyMuted
        val toolbarBackground: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBaseLowContrast
        val toolbarDivider: Color @Composable @ReadOnlyComposable get() = SemanticColors.borderMuted
        val toolbarIcon: Color @Composable @ReadOnlyComposable get() = SemanticColors.iconsPrimary
        val toolbarIconActive: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBrandInteractive
        val toolbarButtonActiveBg: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBrandInteractiveLowContrast
        val border: Color @Composable @ReadOnlyComposable get() = SemanticColors.borderDefault
        val borderFocused: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBrandInteractive
        val codeBackground: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBaseHighContrast
        val codeText: Color @Composable @ReadOnlyComposable get() = SemanticColors.typographySecondary
        val linkText: Color @Composable @ReadOnlyComposable get() = SemanticColors.typographyAccent
        val rawSheetBackground: Color @Composable @ReadOnlyComposable get() = SemanticColors.surfacesBaseLowContrast
        val rawSheetText: Color @Composable @ReadOnlyComposable get() = SemanticColors.typographyPrimary
    }
    object Layout {
        val toolbarHeight: Dp = 48.dp
        val toolbarButtonSize: Dp = 36.dp
        val toolbarButtonCorner: Dp = Radius.sm
        val toolbarIconSize: Dp = 20.dp
        val toolbarButtonSpacing: Dp = 2.dp
        val toolbarDividerWidth: Dp = 1.dp
        val toolbarDividerHeight: Dp = 24.dp
        val toolbarPaddingH: Dp = Spacing.space2
        val editorPaddingH: Dp = Spacing.space4
        val editorPaddingV: Dp = Spacing.space3
        val editorCornerRadius: Dp = Radius.md
        val borderWidth: Dp = 1.dp
        val borderWidthFocused: Dp = 2.dp
        val editorMinHeight: Dp = 200.dp
    }
    object Typography {
        val editorBody: TextStyle = AppTypography.bodyLarge
        val rawText: TextStyle = AppTypography.bodyMedium
        val placeholder: TextStyle = AppTypography.bodyLarge
    }
}
```

**Step 2: Build to verify**

Run: `cd multi-repo-android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git -C multi-repo-android add app/src/main/java/com/abhishekverma/multirepo/ui/native/NativeComponentStyling.kt
git -C multi-repo-android commit -m "feat: add MarkdownEditorStyling tokens to NativeComponentStyling"
```

---

### Task 3: Create AppMarkdownEditor component

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/ui/components/AppMarkdownEditor.kt`

**Step 1: Create the component file**

This is the main reusable component. It wraps `RichTextEditor` from the richeditor-compose library and adds a formatting toolbar.

```kotlin
// AppMarkdownEditor.kt
// Reusable markdown editor component wrapping compose-rich-editor.
//
// Features: Bold, Italic, Underline, Strikethrough, Inline Code, H1-H3,
// Bullet/Numbered lists, Blockquote, Code Block, Horizontal Rule, Link.
// Table insertion supported via raw markdown injection.
//
// Usage:
//   var markdown by remember { mutableStateOf("") }
//   AppMarkdownEditor(
//       value = markdown,
//       onValueChange = { markdown = it },
//       placeholder = "Start writing...",
//   )

package com.abhishekverma.multirepo.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Code
import androidx.compose.material.icons.outlined.FormatBold
import androidx.compose.material.icons.outlined.FormatItalic
import androidx.compose.material.icons.outlined.FormatListBulleted
import androidx.compose.material.icons.outlined.FormatListNumbered
import androidx.compose.material.icons.outlined.FormatQuote
import androidx.compose.material.icons.outlined.FormatStrikethrough
import androidx.compose.material.icons.outlined.FormatUnderlined
import androidx.compose.material.icons.outlined.HorizontalRule
import androidx.compose.material.icons.outlined.Link
import androidx.compose.material.icons.outlined.TableChart
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import com.abhishekverma.multirepo.ui.native.MarkdownEditorStyling
import com.mohamedrejeb.richeditor.model.rememberRichTextState
import com.mohamedrejeb.richeditor.ui.material3.RichTextEditor
import com.mohamedrejeb.richeditor.ui.material3.RichTextEditorDefaults

// --- Props

enum class MarkdownEditorState {
    Default, Success, Warning, Error,
}

// --- Component

@Composable
fun AppMarkdownEditor(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    label: String? = null,
    hint: String? = null,
    state: MarkdownEditorState = MarkdownEditorState.Default,
    enabled: Boolean = true,
) {
    val richTextState = rememberRichTextState()
    var isFocused by remember { mutableStateOf(false) }
    var isInternalUpdate by remember { mutableStateOf(false) }

    // --- Sync external value into editor
    LaunchedEffect(value) {
        if (!isInternalUpdate) {
            richTextState.setMarkdown(value)
        }
        isInternalUpdate = false
    }

    // --- Configure rich text styling
    LaunchedEffect(Unit) {
        richTextState.config.linkColor = MarkdownEditorStyling.Colors.linkText
        richTextState.config.codeSpanColor = MarkdownEditorStyling.Colors.codeText
        richTextState.config.codeSpanBackgroundColor = MarkdownEditorStyling.Colors.codeBackground
    }

    val borderColor = when {
        state == MarkdownEditorState.Error -> MarkdownEditorStyling.Colors.border
        isFocused -> MarkdownEditorStyling.Colors.borderFocused
        else -> MarkdownEditorStyling.Colors.border
    }
    val borderWidth = if (isFocused) {
        MarkdownEditorStyling.Layout.borderWidthFocused
    } else {
        MarkdownEditorStyling.Layout.borderWidth
    }

    Column(modifier = modifier) {
        // --- Label
        if (label != null) {
            Text(
                text = label,
                style = MarkdownEditorStyling.Typography.editorBody,
                color = MarkdownEditorStyling.Colors.editorText,
            )
            Spacer(Modifier.height(MarkdownEditorStyling.Layout.editorPaddingV))
        }

        // --- Editor + Toolbar container
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(MarkdownEditorStyling.Layout.editorCornerRadius))
                .border(
                    width = borderWidth,
                    color = borderColor,
                    shape = RoundedCornerShape(MarkdownEditorStyling.Layout.editorCornerRadius),
                )
                .background(MarkdownEditorStyling.Colors.editorBackground),
        ) {
            // --- RichTextEditor
            RichTextEditor(
                state = richTextState,
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = MarkdownEditorStyling.Layout.editorMinHeight)
                    .weight(1f, fill = false)
                    .padding(
                        horizontal = MarkdownEditorStyling.Layout.editorPaddingH,
                        vertical = MarkdownEditorStyling.Layout.editorPaddingV,
                    )
                    .onFocusChanged { isFocused = it.isFocused },
                colors = RichTextEditorDefaults.richTextEditorColors(
                    containerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                ),
                placeholder = {
                    if (placeholder.isNotEmpty()) {
                        Text(
                            text = placeholder,
                            style = MarkdownEditorStyling.Typography.placeholder,
                            color = MarkdownEditorStyling.Colors.placeholder,
                        )
                    }
                },
                readOnly = !enabled,
            )

            // --- Toolbar
            if (enabled) {
                MarkdownToolbar(
                    richTextState = richTextState,
                    onMarkdownInsert = { insertion ->
                        val current = richTextState.toMarkdown()
                        val updated = current + insertion
                        isInternalUpdate = true
                        richTextState.setMarkdown(updated)
                        onValueChange(updated)
                    },
                )
            }
        }

        // --- Hint
        if (hint != null) {
            Spacer(Modifier.height(MarkdownEditorStyling.Layout.editorPaddingV))
            Text(
                text = hint,
                style = MarkdownEditorStyling.Typography.rawText,
                color = MarkdownEditorStyling.Colors.placeholder,
            )
        }
    }
}

// --- Toolbar

@Composable
private fun MarkdownToolbar(
    richTextState: com.mohamedrejeb.richeditor.model.RichTextState,
    onMarkdownInsert: (String) -> Unit,
) {
    // --- Divider above toolbar
    Box(
        Modifier
            .fillMaxWidth()
            .height(MarkdownEditorStyling.Layout.toolbarDividerWidth)
            .background(MarkdownEditorStyling.Colors.toolbarDivider)
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(MarkdownEditorStyling.Layout.toolbarHeight)
            .background(MarkdownEditorStyling.Colors.toolbarBackground)
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = MarkdownEditorStyling.Layout.toolbarPaddingH),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(MarkdownEditorStyling.Layout.toolbarButtonSpacing),
    ) {
        // --- Inline formatting
        val isBold = richTextState.currentSpanStyle.fontWeight == FontWeight.Bold
        val isItalic = richTextState.currentSpanStyle.fontStyle == FontStyle.Italic
        val isUnderline = richTextState.currentSpanStyle.textDecoration == TextDecoration.Underline
        val isStrikethrough = richTextState.currentSpanStyle.textDecoration == TextDecoration.LineThrough
        val isCode = richTextState.isCodeSpan

        ToolbarButton(Icons.Outlined.FormatBold, "Bold", isBold) {
            richTextState.toggleSpanStyle(SpanStyle(fontWeight = FontWeight.Bold))
        }
        ToolbarButton(Icons.Outlined.FormatItalic, "Italic", isItalic) {
            richTextState.toggleSpanStyle(SpanStyle(fontStyle = FontStyle.Italic))
        }
        ToolbarButton(Icons.Outlined.FormatUnderlined, "Underline", isUnderline) {
            richTextState.toggleSpanStyle(SpanStyle(textDecoration = TextDecoration.Underline))
        }
        ToolbarButton(Icons.Outlined.FormatStrikethrough, "Strikethrough", isStrikethrough) {
            richTextState.toggleSpanStyle(SpanStyle(textDecoration = TextDecoration.LineThrough))
        }
        ToolbarButton(Icons.Outlined.Code, "Code", isCode) {
            richTextState.toggleCodeSpan()
        }

        ToolbarDivider()

        // --- Headings (insert as markdown)
        ToolbarButton(icon = null, "H1", isActive = false, label = "H1") {
            onMarkdownInsert("\n# ")
        }
        ToolbarButton(icon = null, "H2", isActive = false, label = "H2") {
            onMarkdownInsert("\n## ")
        }
        ToolbarButton(icon = null, "H3", isActive = false, label = "H3") {
            onMarkdownInsert("\n### ")
        }

        ToolbarDivider()

        // --- Lists
        val isBullet = richTextState.isUnorderedList
        val isNumbered = richTextState.isOrderedList

        ToolbarButton(Icons.Outlined.FormatListBulleted, "Bullet List", isBullet) {
            richTextState.toggleUnorderedList()
        }
        ToolbarButton(Icons.Outlined.FormatListNumbered, "Numbered List", isNumbered) {
            richTextState.toggleOrderedList()
        }
        // Task list (insert as markdown)
        ToolbarButton(icon = null, "Task List", isActive = false, label = "☐") {
            onMarkdownInsert("\n- [ ] ")
        }

        ToolbarDivider()

        // --- Blocks
        ToolbarButton(Icons.Outlined.FormatQuote, "Blockquote", isActive = false) {
            onMarkdownInsert("\n> ")
        }
        ToolbarButton(Icons.Outlined.Code, "Code Block", isActive = false) {
            onMarkdownInsert("\n```\n\n```\n")
        }
        ToolbarButton(Icons.Outlined.HorizontalRule, "Divider", isActive = false) {
            onMarkdownInsert("\n---\n")
        }

        ToolbarDivider()

        // --- Rich elements
        ToolbarButton(Icons.Outlined.TableChart, "Table", isActive = false) {
            onMarkdownInsert("\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n")
        }
        ToolbarButton(Icons.Outlined.Link, "Link", isActive = false) {
            richTextState.addLink(text = "link text", url = "https://")
        }
    }
}

// --- Toolbar Button

@Composable
private fun ToolbarButton(
    icon: ImageVector?,
    contentDescription: String,
    isActive: Boolean,
    label: String? = null,
    onClick: () -> Unit,
) {
    val bgColor = if (isActive) {
        MarkdownEditorStyling.Colors.toolbarButtonActiveBg
    } else {
        Color.Transparent
    }
    val iconColor = if (isActive) {
        MarkdownEditorStyling.Colors.toolbarIconActive
    } else {
        MarkdownEditorStyling.Colors.toolbarIcon
    }

    Box(
        modifier = Modifier
            .size(MarkdownEditorStyling.Layout.toolbarButtonSize)
            .clip(RoundedCornerShape(MarkdownEditorStyling.Layout.toolbarButtonCorner))
            .background(bgColor)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        if (icon != null) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                modifier = Modifier.size(MarkdownEditorStyling.Layout.toolbarIconSize),
                tint = iconColor,
            )
        } else if (label != null) {
            Text(
                text = label,
                style = MarkdownEditorStyling.Typography.rawText,
                color = iconColor,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

// --- Toolbar Divider

@Composable
private fun ToolbarDivider() {
    Box(
        modifier = Modifier
            .width(MarkdownEditorStyling.Layout.toolbarDividerWidth)
            .height(MarkdownEditorStyling.Layout.toolbarDividerHeight)
            .background(MarkdownEditorStyling.Colors.toolbarDivider)
    )
}
```

**Step 2: Build to verify**

Run: `cd multi-repo-android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL

**Step 3: Commit**

```bash
git -C multi-repo-android add app/src/main/java/com/abhishekverma/multirepo/ui/components/AppMarkdownEditor.kt
git -C multi-repo-android commit -m "feat: add AppMarkdownEditor component with formatting toolbar"
```

---

### Task 4: Create EditorScreen and wire navigation

**Files:**
- Create: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/editor/EditorScreen.kt`
- Modify: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/navigation/Screen.kt:6-12`
- Modify: `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt:49-67`

**Step 1: Add Editor route to Screen.kt**

Add after `data object Showcase`:
```kotlin
    @Serializable
    data object Editor : Screen
```

**Step 2: Create EditorScreen.kt**

```kotlin
// EditorScreen.kt
// Full-screen markdown editor tab with top bar actions.
// Hosts AppMarkdownEditor with View Raw (bottom sheet) and Done (dismiss keyboard).

package com.abhishekverma.multirepo.feature.editor

import android.content.Intent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Done
import androidx.compose.material.icons.outlined.Share
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.material3.Text
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.font.FontFamily
import com.abhishekverma.multirepo.ui.components.AppMarkdownEditor
import com.abhishekverma.multirepo.ui.native.AppBottomSheet
import com.abhishekverma.multirepo.ui.native.AppPageHeader
import com.abhishekverma.multirepo.ui.native.HeaderAction
import com.abhishekverma.multirepo.ui.native.MarkdownEditorStyling
import com.abhishekverma.multirepo.ui.theme.Spacing

// --- Sample markdown for demo

private val SAMPLE_MARKDOWN = """
# Welcome to the Editor

This is a **bold** and *italic* text example with ~~strikethrough~~.

## Lists

- Bullet item one
- Bullet item two
  - Nested item

1. Numbered item
2. Another item

- [ ] Task unchecked
- [x] Task completed

## Code

Inline `code` looks like this.

```
fun hello() {
    println("Hello, world!")
}
```

## Blockquote

> This is a blockquote.
> It can span multiple lines.

## Table

| Name | Role | Status |
|------|------|--------|
| Alice | Dev | Active |
| Bob | Design | Active |

---

That's the editor demo!
""".trimIndent()

// --- Screen

@Composable
fun EditorScreen() {
    var markdown by rememberSaveable { mutableStateOf(SAMPLE_MARKDOWN) }
    var showRawSheet by remember { mutableStateOf(false) }
    val focusManager = LocalFocusManager.current
    val context = LocalContext.current

    Column(modifier = Modifier.fillMaxSize()) {
        // --- Top bar
        AppPageHeader(
            title = "Editor",
            actions = listOf(
                HeaderAction(
                    icon = Icons.Outlined.Share,
                    contentDescription = "Share",
                    onClick = {
                        val sendIntent = Intent(Intent.ACTION_SEND).apply {
                            putExtra(Intent.EXTRA_TEXT, markdown)
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "Share markdown"))
                    },
                ),
                HeaderAction(
                    icon = Icons.Outlined.Description,
                    contentDescription = "View Raw",
                    onClick = { showRawSheet = true },
                ),
                HeaderAction(
                    icon = Icons.Outlined.Done,
                    contentDescription = "Done",
                    onClick = { focusManager.clearFocus() },
                ),
            ),
        )

        // --- Editor
        AppMarkdownEditor(
            value = markdown,
            onValueChange = { markdown = it },
            placeholder = "Start writing...",
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = Spacing.space4, vertical = Spacing.space2),
        )
    }

    // --- Raw Markdown Sheet
    AppBottomSheet(
        isPresented = showRawSheet,
        onDismiss = { showRawSheet = false },
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(Spacing.space4)
                .verticalScroll(rememberScrollState()),
        ) {
            Text(
                text = "Raw Markdown",
                style = MarkdownEditorStyling.Typography.editorBody,
                color = MarkdownEditorStyling.Colors.editorText,
            )
            androidx.compose.foundation.layout.Spacer(
                modifier = Modifier.padding(vertical = Spacing.space2)
            )
            SelectionContainer {
                Text(
                    text = markdown,
                    style = MarkdownEditorStyling.Typography.rawText.copy(fontFamily = FontFamily.Monospace),
                    color = MarkdownEditorStyling.Colors.rawSheetText,
                )
            }
        }
    }
}
```

**Step 3: Wire Editor tab into MainActivity.kt**

In `MainActivity.kt`, update the tabs list and when block:

Add import:
```kotlin
import com.abhishekverma.multirepo.feature.editor.EditorScreen
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.outlined.Edit
```

Update `tabs` list (insert Editor at index 1):
```kotlin
val tabs = listOf(
    NavTab(label = "Home", icon = Icons.Outlined.Home, selectedIcon = Icons.Filled.Home),
    NavTab(label = "Editor", icon = Icons.Outlined.Edit, selectedIcon = Icons.Filled.Edit),
    NavTab(label = "Showcase", icon = Icons.Outlined.List, selectedIcon = Icons.Filled.List),
)
```

Update `when (tab)`:
```kotlin
when (tab) {
    0 -> HomeScreen()
    1 -> EditorScreen()
    2 -> ShowcaseScreen()
}
```

**Step 4: Build to verify**

Run: `cd multi-repo-android && ./gradlew assembleDebug`
Expected: BUILD SUCCESSFUL

**Step 5: Commit**

```bash
git -C multi-repo-android add app/src/main/java/com/abhishekverma/multirepo/feature/editor/EditorScreen.kt \
    app/src/main/java/com/abhishekverma/multirepo/navigation/Screen.kt \
    app/src/main/java/com/abhishekverma/multirepo/MainActivity.kt
git -C multi-repo-android commit -m "feat: add EditorScreen and wire as tab 1 in AdaptiveNavShell"
```

---

### Task 5: Build and verify end-to-end

**Step 1: Clean build**

Run: `cd multi-repo-android && ./gradlew clean assembleDebug`
Expected: BUILD SUCCESSFUL

**Step 2: Verify file structure**

```
feature/editor/EditorScreen.kt           ✓
ui/components/AppMarkdownEditor.kt       ✓
navigation/Screen.kt (Editor added)      ✓
MainActivity.kt (tab wired)              ✓
ui/native/NativeComponentStyling.kt      ✓
gradle/libs.versions.toml                ✓
app/build.gradle.kts                     ✓
```

**Step 3: Final commit (if any fixups needed)**

```bash
git -C multi-repo-android add -A
git -C multi-repo-android commit -m "fix: address any build issues from markdown editor integration"
```

---

## Feature Parity Summary

| Feature | iOS | Web | Android |
|---------|-----|-----|---------|
| Bold/Italic/Underline/Strike | NSTextStorage spans | Tiptap toggleBold etc. | toggleSpanStyle |
| Inline Code | Custom regex + monospace | Tiptap toggleCode | toggleCodeSpan() |
| H1-H3 | Line classifier + font | Tiptap toggleHeading | Markdown insertion |
| Bullet/Numbered Lists | NSTextStorage + LayoutManager drawing | Tiptap toggleBulletList | toggleUnorderedList/toggleOrderedList |
| Task Lists | Custom checkbox drawing + tap | Tiptap TaskList extension | Markdown insertion |
| Blockquote | Custom border drawing | Tiptap toggleBlockquote | Markdown insertion |
| Code Block | Fenced code detection | Tiptap toggleCodeBlock | Markdown insertion |
| Horizontal Rule | Custom line drawing | Tiptap setHorizontalRule | Markdown insertion |
| Table | Custom grid drawing | Tiptap Table extension | Markdown insertion |
| Link | UIAlertController prompt | Tiptap setLink | addLink() |
| Toolbar | Keyboard accessory / floating pill | Fixed bottom + BubbleMenu | Fixed bottom (scrollable) |
| View Raw | AppBottomSheet | N/A (WYSIWYG only) | AppBottomSheet |
| Keyboard Dismiss | Done button | N/A | Done button in header |

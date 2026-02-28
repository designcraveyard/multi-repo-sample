---
name: design-token-sync
description: Sync design tokens between web CSS custom properties in globals.css, Swift Color/spacing/font extensions in DesignTokens.swift, and Kotlin SemanticColors/Spacing/AppTypography objects in DesignTokens.kt. Use when design tokens change on any platform, when the user says "sync tokens" or "update colors", after modifying globals.css, or when setting up the design system for the first time.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Design Token Sync

Keep design tokens in sync between web (CSS custom properties), iOS (Swift extensions), and Android (Kotlin objects).

## Token Sources
- **Web source of truth:** `multi-repo-nextjs/app/globals.css`
- **iOS output:** `multi-repo-ios/multi-repo-ios/DesignTokens.swift`
- **Android output:** `multi-repo-android/app/src/main/java/<base-package>/ui/theme/DesignTokens.kt`
- **Shared spec:** `docs/design-tokens.md`

## Workflow

### Phase 1: Read All Sources

```bash
cat multi-repo-nextjs/app/globals.css
```

```bash
cat multi-repo-ios/multi-repo-ios/DesignTokens.swift 2>/dev/null || echo "FILE_NOT_FOUND"
```

```bash
find multi-repo-android/app/src/main/java -name "DesignTokens.kt" 2>/dev/null | xargs cat 2>/dev/null || echo "Android DesignTokens.kt not found"
```

```bash
cat docs/design-tokens.md
```

### Phase 2: Parse Web Tokens

Extract all CSS custom properties from `globals.css`:
- `:root { }` block → light mode values
- `@media (prefers-color-scheme: dark) :root { }` block → dark mode values

For each `--<name>: <value>` pair, record the token name and both mode values.
Map to Swift name using the naming convention from [references/token-mapping.md](references/token-mapping.md):
- `--background` → `appBackground`
- `--foreground` → `appForeground`
- `--color-<name>` → `app<PascalName>`

### Phase 3: Write DesignTokens.swift

If `DesignTokens.swift` does not exist, create it in full.
If it exists, update **only** the token values in the `// MARK: - Colors` section — preserve any custom extensions added below.

```swift
// DesignTokens.swift
// Auto-synced from multi-repo-nextjs/app/globals.css
// DO NOT edit token values manually — run /design-token-sync to regenerate.

import SwiftUI

// MARK: - Colors
extension Color {
    // <token human name>
    static let app<PascalName> = Color(light: Color(hex: "<light-hex>"), dark: Color(hex: "<dark-hex>"))
    // ... one line per token
}

// MARK: - Color Helpers (do not modify)
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8)  & 0xFF) / 255
        let b = Double(int & 0xFF)         / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: 1)
    }

    init(light: Color, dark: Color) {
        self.init(UIColor { traits in
            traits.userInterfaceStyle == .dark ? UIColor(dark) : UIColor(light)
        })
    }
}

// MARK: - Spacing
extension CGFloat {
    static let spaceXS:  CGFloat = 4
    static let spaceSM:  CGFloat = 8
    static let spaceMD:  CGFloat = 16
    static let spaceLG:  CGFloat = 24
    static let spaceXL:  CGFloat = 32
    static let space2XL: CGFloat = 48
}

// MARK: - Typography
extension Font {
    static let appTitle   = Font.system(size: 28, weight: .semibold)
    static let appBody    = Font.system(size: 16, weight: .regular)
    static let appCaption = Font.system(size: 12, weight: .regular)
}
```

### Phase 4: Write DesignTokens.kt (Android)

Check if the Android project exists:
```bash
find multi-repo-android/app/src/main/java -maxdepth 5 -name "*.kt" | head -3 2>/dev/null || echo "Android not found"
```

If found, locate (or create) the file at
`multi-repo-android/app/src/main/java/<base-package>/ui/theme/DesignTokens.kt`.

If `DesignTokens.kt` does not exist, create it in full.
If it exists, update **only** the token values inside `SemanticColors`, `PrimitiveColors`, `Spacing`, and `AppTypography` — preserve any other extensions below.

Map each CSS token to Kotlin following the naming convention:
- `--color-zinc-950` → `PrimitiveColors.colorZinc950` (primitive, Color object)
- `--surfaces-brand-interactive` → `SemanticColors.surfacesBrandInteractive` (semantic, Color object)
- `--typography-primary` → `SemanticColors.typographyPrimary` (semantic)
- `--border-default` → `SemanticColors.borderDefault` (semantic)

```kotlin
// DesignTokens.kt
// Auto-synced from multi-repo-nextjs/app/globals.css
// DO NOT edit token values manually — run /design-token-sync to regenerate.

package <base.package>.ui.theme

import androidx.compose.ui.graphics.Color

// --- Primitive Colors (raw values — only used inside SemanticColors, never in UI code)

object PrimitiveColors {
    // <primitive token name>
    val colorZinc950Light = Color(0xFF09090B)
    val colorZinc950Dark  = Color(0xFFFAFAFA)
    // ... one pair per primitive token
}

// --- Semantic Colors (use these in all component and screen files)

object SemanticColors {
    // Surfaces
    val surfacesBrandInteractive = PrimitiveColors.colorZinc950Light // update to actual primitive ref
    // Typography
    val typographyPrimary = PrimitiveColors.colorZinc950Light
    // Border
    val borderDefault = PrimitiveColors.colorZinc950Light
    // ... one val per semantic token
    // TODO: wire light/dark mode using isSystemInDarkTheme() or MaterialTheme.colorScheme
}

// --- Spacing (matches CSS --space-* and iOS CGFloat.space*)

object Spacing {
    val XS  = 4.dp
    val SM  = 8.dp
    val MD  = 16.dp
    val LG  = 24.dp
    val XL  = 32.dp
    val XXL = 48.dp
}

// --- Typography (matches iOS Font.app* and CSS typography scale)

object AppTypography {
    // These map to MaterialTheme.typography — override in Theme.kt as needed
    val titleLarge  = androidx.compose.material3.Typography().titleLarge
    val bodyMedium  = androidx.compose.material3.Typography().bodyMedium
    val labelSmall  = androidx.compose.material3.Typography().labelSmall
}
```

> Note: The `Spacing` object requires `import androidx.compose.ui.unit.dp`.
> For proper dark mode support, wire `SemanticColors` to `MaterialTheme.colorScheme` or a
> `CompositionLocal` inside the app `Theme.kt` file rather than using hard references.
> Flag this with a `// TODO: wire dark mode` comment if not yet done.

If the Android project does not exist, skip this phase and note it in the report.

### Phase 5: Update docs/design-tokens.md

Update the **Color Tokens** table to reflect the current set of tokens (CSS variable name, Swift name, Kotlin name, with light/dark values).

### Phase 6: Sync Report

```
## Design Token Sync Report

| Token | CSS Variable | Swift Name | Kotlin Name | Light | Dark | Status |
|-------|-------------|-----------|-------------|-------|------|--------|
| Background | --background | Color.appBackground | SemanticColors.background | #ffffff | #0a0a0a | Synced ✓ |
| Foreground | --foreground | Color.appForeground | SemanticColors.foreground | #171717 | #ededed | Synced ✓ |

Tokens written to: multi-repo-ios/multi-repo-ios/DesignTokens.swift
Tokens written to: multi-repo-android/.../ui/theme/DesignTokens.kt [or: Android project not found — skipped]
Spec updated: docs/design-tokens.md
```

Flag any tokens in the CSS that have no Swift counterpart, no Kotlin counterpart, or vice versa.

### Phase 7: Push to Figma

If `figma-cli/` exists in the workspace root, push updated tokens to Figma Desktop.
All commands run from the workspace root:

```bash
node figma-cli/src/index.js connect
node figma-cli/src/index.js var delete-all           # Clear stale variables
node figma-cli/src/index.js tokens preset shadcn      # Push primitives + semantic tokens (Light/Dark)
node figma-cli/src/index.js var visualize             # Create color swatches on canvas
```

If Figma Desktop is not open, note in the report and suggest running the push later.

Add to the sync report:
```
Figma tokens: Pushed ✓ (or: Figma Desktop not available — run manually later)
```

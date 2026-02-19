---
name: design-token-sync
description: Sync design tokens between web CSS custom properties in globals.css and Swift Color/spacing/font extensions in DesignTokens.swift. Use when design tokens change on either platform, when the user says "sync tokens" or "update colors", after modifying globals.css, or when setting up the design system for the first time.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Design Token Sync

Keep design tokens in sync between web (CSS custom properties) and iOS (Swift extensions).

## Token Sources
- **Web source of truth:** `multi-repo-nextjs/app/globals.css`
- **iOS output:** `multi-repo-ios/multi-repo-ios/DesignTokens.swift`
- **Shared spec:** `docs/design-tokens.md`

## Workflow

### Phase 1: Read Both Sources

```bash
cat multi-repo-nextjs/app/globals.css
```

```bash
cat multi-repo-ios/multi-repo-ios/DesignTokens.swift 2>/dev/null || echo "FILE_NOT_FOUND"
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

### Phase 4: Update docs/design-tokens.md

Update the **Color Tokens** table to reflect the current set of tokens (both CSS variable name and Swift name, with light/dark values).

### Phase 5: Sync Report

```
## Design Token Sync Report

| Token | CSS Variable | Swift Name | Light | Dark | Status |
|-------|-------------|-----------|-------|------|--------|
| Background | --background | Color.appBackground | #ffffff | #0a0a0a | Synced ✓ |
| Foreground | --foreground | Color.appForeground | #171717 | #ededed | Synced ✓ |

Tokens written to: multi-repo-ios/multi-repo-ios/DesignTokens.swift
Spec updated: docs/design-tokens.md
```

Flag any tokens in the CSS that have no Swift counterpart (and vice versa).

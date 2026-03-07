---
name: add-phosphor-icon
description: Add a new Phosphor icon to the PhosphorSlim icon set (iOS). Downloads SVG from unpkg CDN, creates the xcassets imageset, and adds the enum case. Invoke automatically when phosphor-slim-guard warns about missing icons, or when building a screen that needs new icons. Also supports --migrate mode to convert from PhosphorSwift SPM.
user-invocable: true
---

# Add Phosphor Icon to PhosphorSlim

Adds one or more Phosphor icons to the local PhosphorSlim icon set.

## Context

PhosphorSwift SPM package (9,108 SVGs) was replaced with a local `PhosphorSlim.swift`
containing only the icons actually used (~45 icons) for fast clean builds. When a new
screen needs an icon not in the slim set, use this skill to add it.

## Inputs

The user provides one or more icon names in any Phosphor format:
- PascalCase: `MagnifyingGlass`, `ArrowRight`, `ChatCircle`
- camelCase: `magnifyingGlass`, `arrowRight`, `chatCircle`
- kebab-case: `magnifying-glass`, `arrow-right`, `chat-circle`

Optional flags:
- `--weights all` — download all 6 weights (default: `regular` only)
- `--weights regular,fill,bold` — download specific weights
- `--migrate` — scan all `Ph.xxx` usages, create PhosphorSlim.swift from scratch, remove SPM

## Procedure

For each icon requested:

### Step 1: Normalize the name
- **camelCase** for the Swift enum case (e.g. `chatCircle`)
- **kebab-case** for the raw value and file names (e.g. `chat-circle`)

### Step 2: Check if already present
- Read `multi-repo-ios/multi-repo-ios/PhosphorSlim.swift`
- If the enum case already exists, skip and inform the user

### Step 3: Download SVGs
Download from unpkg CDN. Each weight has its own folder:
- Regular: `https://unpkg.com/@phosphor-icons/core/assets/regular/<kebab>.svg`
- Thin: `https://unpkg.com/@phosphor-icons/core/assets/thin/<kebab>.svg` -> save as `<kebab>-thin.svg`
- Light: `https://unpkg.com/@phosphor-icons/core/assets/light/<kebab>.svg` -> save as `<kebab>-light.svg`
- Bold: `https://unpkg.com/@phosphor-icons/core/assets/bold/<kebab>.svg` -> save as `<kebab>-bold.svg`
- Fill: `https://unpkg.com/@phosphor-icons/core/assets/fill/<kebab>-fill.svg` -> save as `<kebab>-fill.svg`
- Duotone: `https://unpkg.com/@phosphor-icons/core/assets/duotone/<kebab>-duotone.svg` -> save as `<kebab>-duotone.svg`

Use `curl` to download. Verify each SVG is valid (starts with `<svg`).

### Step 4: Create xcassets imagesets
Base path: `multi-repo-ios/multi-repo-ios/Resources/PhosphorIcons.xcassets/`

For each weight variant, create `<filename>.imageset/` containing:
- The SVG file
- A `Contents.json`:
```json
{
  "images": [{ "filename": "<filename>.svg", "idiom": "universal" }],
  "info": { "author": "xcode", "version": 1 },
  "properties": { "preserves-vector-representation": true }
}
```

Filename mapping:
- Regular weight: `<kebab>.svg` in `<kebab>.imageset/`
- Other weights: `<kebab>-<weight>.svg` in `<kebab>-<weight>.imageset/`

### Step 5: Add enum case to PhosphorSlim.swift
Edit `multi-repo-ios/multi-repo-ios/PhosphorSlim.swift`.
Add the new case in **alphabetical order** within the enum:
```swift
case chatCircle = "chat-circle"
```

### Step 6: Report
Print: icon name, weights added, new total icon count.
Remind: "No `import` needed -- PhosphorSlim.swift is compiled directly into the target."

## Migration Mode (`--migrate`)

For converting from PhosphorSwift SPM to PhosphorSlim:

1. Scan all Swift files for `Ph.<name>.<weight>` usages: `grep -roh 'Ph\.\w\+\.' multi-repo-ios/`
2. Extract unique icon names and weight variants
3. Download all needed SVGs (Step 3 above)
4. Create xcassets imagesets (Step 4 above)
5. Generate `PhosphorSlim.swift` with all extracted icons
6. Strip `import PhosphorSwift` from all Swift files
7. Remove PhosphorSwift SPM from `project.pbxproj`:
   - `PBXBuildFile` entry
   - Frameworks build phase reference
   - `packageProductDependencies` entry
   - `packageReferences` entry
   - `XCRemoteSwiftPackageReference` block
   - `XCSwiftPackageProductDependency` block
8. Validate with `plutil -lint` on pbxproj

## Validation

After adding, verify:
1. The enum case uses camelCase matching the kebab-case raw value
2. The SVG files exist in the correct imageset folders
3. Each Contents.json has `preserves-vector-representation: true`
4. Cases in PhosphorSlim.swift are alphabetically sorted

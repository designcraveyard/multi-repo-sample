---
name: figma-cli
description: Background knowledge for using figma-ds-cli to write to Figma Desktop — create tokens, render components, export assets, visualize variables. Use when the user wants to push tokens to Figma, create Figma components from code, visualize the design system, or export assets. Complements the Figma MCP server (which reads from Figma).
user-invocable: false
allowed-tools: Bash, Read, Glob, Grep
---

# Figma CLI (figma-ds-cli)

CLI at `figma-cli/` that controls Figma Desktop directly via WebSocket. No API key needed.

**MCP = Read from Figma. CLI = Write to Figma.**

## Setup

```bash
cd figma-cli && npm install   # First time only
node src/index.js connect     # Yolo mode (recommended) — patches Figma once, then auto-connects
node src/index.js connect --safe  # Safe mode — uses plugin, no Figma modification
```

If permission error on macOS: System Settings → Privacy → Full Disk Access → Add Terminal.

The `connect` command auto-starts a speed daemon for 10x faster subsequent commands.

## Command Reference

All commands run from the workspace root as: `node figma-cli/src/index.js <command>`

### Design Tokens

```bash
node figma-cli/src/index.js tokens preset shadcn   # 244 primitives + 32 semantic (Light/Dark)
node figma-cli/src/index.js tokens tailwind         # 242 primitive colors only
node figma-cli/src/index.js tokens ds               # IDS Base colors
node figma-cli/src/index.js var list                 # Show existing variables
node figma-cli/src/index.js var visualize            # Create color swatches on canvas
node figma-cli/src/index.js var visualize "primitives"  # Filter by collection
node figma-cli/src/index.js var delete-all           # Delete all variables
node figma-cli/src/index.js var delete-all -c "primitives"  # Delete specific collection
```

**Important:** `var list` only SHOWS variables. Use `tokens` commands to CREATE them.

### Rendering Frames & Components

Use JSX-like syntax. **Always use `render` (not `eval`)** — it has smart positioning.

```bash
# Single frame
node figma-cli/src/index.js render '<Frame name="Card" w={320} h={200} bg="#18181b" rounded={12} flex="col" p={24} gap={12}>
  <Text size={18} weight="bold" color="#fff">Title</Text>
  <Text size={14} color="#a1a1aa" w="fill">Description</Text>
</Frame>'

# Multiple frames
node figma-cli/src/index.js render-batch '[
  "<Frame name=\"Card 1\" w={320} h={200} bg=\"#18181b\" rounded={12} flex=\"col\" p={24}><Text color=\"#fff\">Title</Text></Frame>",
  "<Frame name=\"Card 2\" w={320} h={200} bg=\"#18181b\" rounded={12} flex=\"col\" p={24}><Text color=\"#fff\">Title</Text></Frame>"
]'
```

**JSX props:**
- Layout: `flex="row"|"col"`, `gap={16}`, `p={24}`, `px={16}`, `py={8}`, `items="center"`, `justify="center"`
- Size: `w={320}`, `h={200}`, `w="fill"`, `grow={1}`
- Appearance: `bg="#fff"`, `rounded={16}`, `stroke="#000"`
- Text: `<Text size={18} weight="bold" color="#000">content</Text>`

**Common mistakes (silently ignored, no error!):**
`layout="horizontal"` → `flex="row"` | `padding={24}` → `p={24}` | `fill="#fff"` → `bg="#fff"` | `cornerRadius={12}` → `rounded={12}` | `fontSize={18}` → `size={18}`

### Converting & Binding

```bash
node figma-cli/src/index.js node to-component "ID1" "ID2"  # Convert frames to components
node figma-cli/src/index.js bind fill "zinc/900" -n "ID1"   # Bind variable to node fill
```

### Finding & Inspecting

```bash
node figma-cli/src/index.js find "Button"       # Find nodes by name
node figma-cli/src/index.js canvas info          # What's on canvas
```

### Exporting

```bash
node figma-cli/src/index.js export png           # Export as PNG
node figma-cli/src/index.js export svg           # Export as SVG
```

### Website Recreation

```bash
node figma-cli/src/index.js recreate-url "https://example.com" --name "Page"
node figma-cli/src/index.js screenshot-url "https://example.com"
```

### Daemon Management

```bash
node figma-cli/src/index.js daemon status
node figma-cli/src/index.js daemon restart
```

## Integration with Workspace Skills

figma-cli is integrated as the primary Figma write tool across all design skills and agents:

### `/design-token-sync` (Phase 7)
Push synced tokens to Figma:
```bash
node figma-cli/src/index.js connect
node figma-cli/src/index.js var delete-all
node figma-cli/src/index.js tokens preset shadcn
node figma-cli/src/index.js var visualize
```

### `/generate-theme` (Step 3)
Push new palette and visualize:
```bash
node figma-cli/src/index.js connect
node figma-cli/src/index.js var delete-all
node figma-cli/src/index.js tokens preset shadcn
node figma-cli/src/index.js var visualize
```

### `/figma-component-sync` (Phase 7)
Push missing component frames and cross-check tokens:
```bash
node figma-cli/src/index.js render '<Frame name="ComponentName" ...>'
node figma-cli/src/index.js node to-component "<node-id>"
node figma-cli/src/index.js var list                # Cross-check tokens
```

### `/complex-component` (Phase 5)
Push completed complex component to Figma:
```bash
node figma-cli/src/index.js render '<Frame name="ComponentName" ...>'
node figma-cli/src/index.js node to-component "<node-id>"
node figma-cli/src/index.js bind fill "surfaces/brand-interactive" -n "<node-id>"
```

### `/component-audit` (Check 6)
Export Figma component for visual comparison:
```bash
node figma-cli/src/index.js export png
```

### `/validate-tokens` (Check 6)
Cross-check code tokens against Figma variables:
```bash
node figma-cli/src/index.js var list
```

### `/design-discovery` (Sub-flow B & D)
Import/push tokens and recreate wireframes in Figma:
```bash
node figma-cli/src/index.js recreate-url "file:///path/to/wireframe.html" --name "ScreenName"
```

### Agents
- `design-system-sync` — full read+write Figma round-trip using MCP + figma-cli
- `design-consistency-checker` — cross-checks tokens against Figma variables via `var list`
- `complex-component-reviewer` — exports Figma screenshots for visual diff

### Creating Components for Figma
When a component is implemented in code but doesn't exist in Figma:
1. Render the component frame(s) with `render` or `render-batch`
2. Convert to component with `node to-component "ID"`
3. Bind variables with `bind fill "token/name" -n "ID"`

## Rules

1. **Always use `render` for creating frames** — has smart positioning to avoid overlaps
2. **Never use `eval` to create** — no positioning, everything overlaps at (0,0)
3. **Never show terminal commands to users** — run silently, give friendly feedback
4. **For multiple frames** — use `render-batch`, not multiple `render` calls
5. **Convert to components** after creation with `node to-component`
6. **Full reference:** See `figma-cli/CLAUDE.md` and `figma-cli/REFERENCE.md`

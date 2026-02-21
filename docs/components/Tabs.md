# Tabs

**Figma:** bubbles-kit › `78:284` (bar) + `76:660` (_Tabs item)
**Axes:** Size(Small/Medium/Large) × Active(Off/On) = 6

A horizontal tab navigation bar with an animated sliding underline indicator. Supports uncontrolled and controlled active state. Full keyboard navigation (Arrow keys, Home, End).

---

## Props

### Web (`TabsProps`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | — | Tab definitions (required) |
| `size` | `TabSize` | `"md"` | Size of all tabs |
| `defaultTab` | `string` | First item id | Initial active tab (uncontrolled) |
| `activeTab` | `string` | — | Controlled active tab id |
| `onChange` | `(id: string) => void` | — | Fires when active tab changes |
| `className` | `string` | `""` | Extra Tailwind classes |

### `TabItem`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display label |
| `icon` | `ReactNode` | Optional leading icon |

### iOS (`AppTabs`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `[AppTabItem]` | — | Tab definitions (required) |
| `size` | `AppTabSize` | `.md` | Size |
| `activeTab` | `String` (binding) | — | Binding to active tab id |
| `onChange` | `((String) -> Void)?` | `nil` | Change callback |

---

## Sizes

| Size | Padding | Font | Icon size |
|------|---------|------|-----------|
| `sm` | `px-2 py-1` (4/8 px) | `cta-sm` 12px/600 | 16 × 16 px |
| `md` | `px-3 py-2` (8/12 px) | `cta-md` 14px/600 | 16 × 16 px |
| `lg` | `px-4 py-2` (8/16 px) | `cta-lg` 16px/600 | 20 × 20 px |

---

## Sliding Indicator

- Brand-colored underline that animates horizontally to track the active tab
- Implemented via absolute-positioned `<span>` with CSS `transition: left, width` (web) / matched animation (iOS)
- Updates on active change and on container resize (`ResizeObserver`)

---

## Token Usage

| Property | Token |
|----------|-------|
| Indicator color | `--surfaces-brand-interactive` / `Color.surfacesBrandInteractive` |
| Bottom border | `--border-default` / `Color.borderDefault` |
| Active tab text | `--typography-primary` / `Color.typographyPrimary` |
| Inactive tab text | `--typography-secondary` / `Color.typographySecondary` |
| Inactive hover bg | `--surfaces-base-low-contrast` / `Color.surfacesBaseLowContrast` |
| Focus ring | `--border-active` / `Color.borderActive` |

---

## Controlled vs Uncontrolled

```tsx
// Uncontrolled — manages its own state
<Tabs items={tabs} defaultTab="settings" />

// Controlled — parent owns active state
const [active, setActive] = useState("home");
<Tabs items={tabs} activeTab={active} onChange={setActive} />
```

---

## Accessibility

- Container: `role="tablist"` + `aria-orientation="horizontal"`
- Each button: `role="tab"` + `aria-selected` + `aria-controls="tabpanel-{id}"`
- Roving `tabIndex` — only active tab is in tab order; arrow keys move focus
- Keyboard: `ArrowRight` / `ArrowLeft` cycle tabs; `Home` / `End` jump to first/last

### TabPanel companion

Use `TabPanel` to associate content with tabs:

```tsx
<TabPanel id="home" activeTab={active}>
  <HomeContent />
</TabPanel>
```

`TabPanel` renders `role="tabpanel"` + `aria-labelledby` + `hidden` when inactive.

---

## Usage Examples

### Web

```tsx
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { Icon } from "@/app/components/icons";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity", icon: <Icon name="Bell" /> },
  { id: "settings", label: "Settings" },
];

// Uncontrolled
<Tabs items={tabs} size="md" />

// Controlled with panels
const [active, setActive] = useState("overview");
<>
  <Tabs items={tabs} activeTab={active} onChange={setActive} />
  <TabPanel id="overview" activeTab={active}>…</TabPanel>
  <TabPanel id="activity" activeTab={active}>…</TabPanel>
  <TabPanel id="settings" activeTab={active}>…</TabPanel>
</>
```

### iOS

```swift
@State private var activeTab = "overview"

AppTabs(
    items: [
        AppTabItem(id: "overview", label: "Overview"),
        AppTabItem(id: "activity", label: "Activity", icon: AnyView(Ph.bell.regular.iconSize(.sm))),
        AppTabItem(id: "settings", label: "Settings"),
    ],
    activeTab: $activeTab
)
```

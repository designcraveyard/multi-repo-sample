# Template Extension — Detailed Implementation Plan

> **Date:** 2026-04-16  
> **Prerequisite:** Read `docs/template-extension-report.md` for full context on what's being extracted and why.  
> **Scope:** 30 items across 6 phases — inner-layer patterns → screens → chat/AI patterns → advanced.  
> **Platforms:** Each item is implemented on iOS, Web, and Android (cross-platform parity).

---

## File Structure Convention

New items follow existing conventions:

```
Patterns (inner-layer + complex):
  iOS:     Components/Patterns/App<Name>.swift
  Web:     app/components/patterns/<Name>/<Name>.tsx + index.ts
  Android: ui/patterns/App<Name>.kt

Screen Templates:
  iOS:     Views/Templates/<Name>TemplateView.swift + <Name>TemplateViewModel.swift
  Web:     app/templates/<name>/page.tsx (+ loading.tsx, error.tsx)
  Android: feature/templates/<Name>TemplateScreen.kt + ViewModel.kt + ScreenState.kt
```

All items get registered in `docs/components.md` under a new **Patterns (Inner-Layer)**, **Patterns (Complex)**, and **Screen Templates** section.

---

## Phase 1 — Inner-Layer Foundation Patterns

> **Goal:** Build the glue layer that every screen template will compose from.  
> **Depends on:** Existing atomics only.

---

### 1.1 EmptyStateView

**What:** Centered placeholder shown when a screen/section has no data.

**Source reference:** FitChat `TodayEmptyState.swift`, 99-neo inline empty states

**API (iOS):**
```swift
EmptyStateView(
    icon: Ph.magnifyingGlass.regular,   // or Image(systemName:)
    title: "No results found",
    subtitle: "Try adjusting your filters", // optional
    actionLabel: "Clear Filters",           // optional
    action: { clearFilters() }              // optional
)
```

**Composes:** PhosphorSlim icon, AppTextBlock (title + subtitle), AppButton (tertiary or primary)

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppEmptyState.swift`
   - VStack centered with Spacer top/bottom
   - Icon: `.iconSize(.xl)`, `.foregroundStyle(.typographyMuted)`
   - Title: `.appBodyLargeEm`, `.typographyPrimary`
   - Subtitle: `.appBodySmall`, `.typographyMuted`, `.multilineTextAlignment(.center)`, max 280pt width
   - Action: AppButton (tertiary, md) — optional, hidden if no action
   - Spacing: `.space3` between icon and title, `.space2` between title and subtitle, `.space4` before button
2. **Web** — `app/components/patterns/EmptyState/EmptyState.tsx`
   - Flex column centered, same token mapping
   - Uses `<Icon>` component, `<Button variant="tertiary">`
3. **Android** — `ui/patterns/AppEmptyState.kt`
   - Column(horizontalAlignment = CenterHorizontally), same token mapping
4. **Register** in `docs/components.md`

---

### 1.2 SectionHeader

**What:** Title row used between content sections inside scrollable pages. Not the nav bar — lives inside scroll content.

**Source reference:** 99-neo `ProjectDetailView` section titles, FitChat `AppInnerPageHeader`

**API (iOS):**
```swift
AppSectionHeader(
    title: "Available Units",
    subtitle: "3 configurations",     // optional
    trailing: .seeAll { showAll() }   // optional — .seeAll, .badge("12"), .iconButton(Ph.plus)
)
```

**Composes:** Text (title + subtitle), trailing slot (AppButton tertiary / AppBadge / AppIconButton)

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppSectionHeader.swift`
   - HStack: leading VStack (title `.appTitleSmall` + optional subtitle `.appBodySmall.typographyMuted`) + Spacer + trailing slot
   - Trailing enum: `.seeAll(action)`, `.badge(label, type)`, `.iconButton(icon, action)`, `.none`
   - Padding: none (caller provides context padding)
2. **Web** — `app/components/patterns/SectionHeader/SectionHeader.tsx`
3. **Android** — `ui/patterns/AppSectionHeader.kt`
4. **Register** in `docs/components.md`

---

### 1.3 GroupedCard

**What:** Bordered, rounded container with optional section label. Groups rows (ListItems, toggles, form fields) with dividers between them.

**Source reference:** FitChat filter sheets (card-wrapped toggle rows), 99-neo InteractiveQuestionCard

**API (iOS):**
```swift
AppGroupedCard(label: "PREFERENCES") {  // label optional
    AppListItem(title: "Dark Mode", trailing: .toggle(isOn: $darkMode))
    AppListItem(title: "Notifications", trailing: .toggle(isOn: $notifs))
    AppListItem(title: "Language", trailing: .button(label: "English", action: {}))
}
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppGroupedCard.swift`
   - Optional label: `.appOverlineSmall`, `.typographyMuted`, uppercase, `.space2` below
   - Container: VStack(spacing: 0), auto-insert AppDivider between children
   - Background: `Color.surfacesBaseLowContrast`
   - Clip: `RoundedRectangle(cornerRadius: .radiusMD)`
   - Border: `.overlay(RoundedRectangle.stroke(Color.borderDefault, lineWidth: 1))`
   - Use `@ViewBuilder content` for children — dividers auto-inserted via `_VariadicView` or manual ForEach
2. **Web** — `app/components/patterns/GroupedCard/GroupedCard.tsx`
   - `<div>` with border, rounded, bg-surfaces-base-low-contrast, auto-dividers between children
3. **Android** — `ui/patterns/AppGroupedCard.kt`
   - Column with border, clip, background token
4. **Register** in `docs/components.md`

---

### 1.4 BottomActionBar

**What:** Sticky bar pinned to bottom of screen with 1-2 action buttons. Has top shadow/border.

**Source reference:** FitChat CreateDishView (Save), 99-neo ProjectDetailView (Brochure + View Number)

**API (iOS):**
```swift
.bottomActionBar {
    AppButton("Save", variant: .primary, size: .lg, isLoading: saving) { save() }
}
// or dual-button:
.bottomActionBar {
    HStack(spacing: .space3) {
        AppButton("Cancel", variant: .secondary, size: .lg) { cancel() }
        AppButton("Confirm", variant: .primary, size: .lg) { confirm() }
    }
}
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppBottomActionBar.swift` (ViewModifier)
   - Uses `.safeAreaInset(edge: .bottom)`
   - Container: VStack with `.space3` padding horizontal, `.space2` padding vertical
   - Background: `Color.surfacesBasePrimary`
   - Top border: `AppDivider()` or shadow `Color.black.opacity(0.05), radius: 8, y: -4`
   - Content: `@ViewBuilder` slot
2. **Web** — `app/components/patterns/BottomActionBar/BottomActionBar.tsx`
   - `position: sticky; bottom: 0;` with `border-top` and `bg-surfaces-base-primary`
3. **Android** — `ui/patterns/AppBottomActionBar.kt`
   - Box with Modifier.align(Alignment.BottomCenter), elevation shadow
4. **Register** in `docs/components.md`

---

### 1.5 SectionDivider (AppDivider extension)

**What:** Extend existing AppDivider with a `.section` variant — 8pt tall, full-width, used between major page sections.

**Source reference:** 99-neo ProjectDetailView (8pt grey spacer between sections)

**Implementation steps:**
1. **iOS** — Edit existing `Components/Divider/AppDivider.swift`
   - Add `variant` enum: `.row` (existing 1pt), `.section` (8pt)
   - `.section`: `Color.surfacesBaseLowContrast.frame(height: 8)` full-width, no horizontal padding
2. **Web** — Edit existing `app/components/Divider/Divider.tsx`
   - Add `variant="section"` prop: `h-2 bg-surfaces-base-low-contrast`
3. **Android** — Edit existing `ui/components/AppDivider.kt`
   - Add `variant = DividerVariant.Section`: `height = 8.dp`, `surfacesBaseLowContrast`
4. **Update** `docs/components.md` Divider entry

---

### 1.6 SortMenuRow

**What:** A row pattern for sort/filter options: `[Label] [Spacer] [Selected Value] [Caret-Down]` that opens a dropdown menu.

**Source reference:** FitChat `FoodFilterSheet.swift` menuRow helper

**API (iOS):**
```swift
AppSortMenuRow(
    label: "Sort by",
    options: ["A–Z", "Newest", "Calories ↑", "Calories ↓"],
    selected: $sortOption
)
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppSortMenuRow.swift`
   - Menu wrapping HStack: label `.appBodyMedium` + Spacer + selected value `.appBodyMedium.typographySecondary` + `Ph.caretDown.regular.iconSize(.sm)`
   - Menu content: ForEach options with checkmark on selected
   - Full-row tappable via Menu label
2. **Web** — `app/components/patterns/SortMenuRow/SortMenuRow.tsx`
   - Uses AppNativePicker or native `<select>` styled as row
3. **Android** — `ui/patterns/AppSortMenuRow.kt`
   - ExposedDropdownMenuBox with row layout
4. **Register** in `docs/components.md`

---

### 1.7 FilterSheet

**What:** Composable bottom sheet for presenting filter controls — the most frequently needed "glue" pattern.

**Source reference:** FitChat `FoodFilterSheet.swift`, `RoutineFilterSheet.swift`

**API (iOS):**
```swift
AppFilterSheet(isPresented: $showFilters) {
    FilterToggleRow(label: "Verified Only", isOn: $filters.verifiedOnly)
    FilterToggleRow(label: "Vegetarian", isOn: $filters.vegOnly)
    FilterPickerRow(label: "Category", options: categories, selected: $filters.category)
    FilterChipGroup(label: "TAGS", chips: tags, selected: $filters.selectedTags)
    FilterRangeRow(label: "Price Range", range: $filters.priceRange, bounds: 0...100)
} onReset: {
    filters = .default
}
```

**Composes:** AppBottomSheet, GroupedCard, AppListItem + .toggle, SortMenuRow, AppChip, AppRangeSlider, AppButton

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppFilterSheet.swift`
   - Wrapper around AppBottomSheet with NavigationStack (for title + close button)
   - ScrollView content: `@ViewBuilder` for filter rows
   - Bottom bar: "Reset" (tertiary, shown when any filter active) + "Apply" (primary)
   - Active filter count computed and exposed via binding
   - Sub-components: `FilterToggleRow`, `FilterPickerRow`, `FilterChipGroup`, `FilterRangeRow`
2. **Web** — `app/components/patterns/FilterSheet/FilterSheet.tsx`
   - Uses AppBottomSheet, maps filter row types to web equivalents
3. **Android** — `ui/patterns/AppFilterSheet.kt`
   - ModalBottomSheet with filter rows
4. **Register** in `docs/components.md`

---

## Phase 2 — More Inner Patterns

> **Goal:** Complete the inner pattern layer with scroll behaviors, loading states, and layout utilities.  
> **Depends on:** Phase 1 patterns.

---

### 2.1 StickySearchBar

**What:** Search input + optional segment tabs + optional chip row, pinned above scrollable content.

**Source reference:** FitChat `FoodLibraryView`, 99-neo `LocalityReportsView`

**API (iOS):**
```swift
StickySearchBar(
    searchText: $query,
    placeholder: "Search...",
    segments: ["All", "Active", "Archived"],  // optional
    selectedSegment: $segment,                  // optional
    chips: filterChips,                         // optional
    selectedChips: $activeChips                  // optional
)
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppStickySearchBar.swift`
   - VStack(spacing: .space2): AppInputField(variant: .search) + optional AppSegmentControlBar + optional horizontal AppChip row
   - Background: `Color.surfacesBasePrimary` (prevents content showing through)
   - Placed above ScrollView in parent VStack(spacing: 0)
   - Not a ViewModifier — a standalone view composed into screen layout
2. **Web** — `app/components/patterns/StickySearchBar/StickySearchBar.tsx`
   - `sticky top-0 z-10 bg-surfaces-base-primary` with search + optional segments + chips
3. **Android** — `ui/patterns/AppStickySearchBar.kt`
4. **Register** in `docs/components.md`

---

### 2.2 ExpandableSection

**What:** ViewModifier that limits content height/lines with a "Read more" / "Show less" toggle.

**Source reference:** 99-neo `ProjectDetailView` (overview text, amenities grid)

**API (iOS):**
```swift
Text(longDescription)
    .expandable(lineLimit: 4)

// or for item grids:
LazyVGrid(columns: columns) { items }
    .expandable(itemLimit: 9, totalCount: amenities.count)
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppExpandableSection.swift` (ViewModifier)
   - `@State private var isExpanded = false`
   - For text: applies `.lineLimit(isExpanded ? nil : limit)`
   - For grids: wraps content with conditional `.frame(maxHeight:)` or slices array
   - Toggle button: "Read more" / "Show less" in `.appBodySmallEm`, `.typographyBrand`
   - Animation: `withAnimation(.easeInOut(duration: 0.2))`
2. **Web** — CSS `line-clamp` + JS toggle, or Tailwind `line-clamp-4` class
3. **Android** — `maxLines` + "Read more" button
4. **Register** in `docs/components.md`

---

### 2.3 ChipRow

**What:** Simple horizontal scrolling chip selector. Lighter than SegmentControlBar — no bar wrapper, just a scrollable HStack of chips.

**Source reference:** 99-neo ExploreView (requirement chips), ProjectDetailView (BHK chips)

**API (iOS):**
```swift
AppChipRow(
    items: ["2 BHK", "3 BHK", "4 BHK"],
    selected: $selectedBHK,          // single-select
    variant: .chipTabs,
    size: .sm,
    leadingIcon: { item in Ph.house.regular }  // optional per-chip icon
)
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppChipRow.swift`
   - ScrollView(.horizontal, showsIndicators: false) + HStack(spacing: .space2)
   - ForEach items → AppChip with active state from selected binding
   - Optional per-item leading icon closure
   - Supports single-select (binding) or multi-select (Set binding)
2. **Web** — `app/components/patterns/ChipRow/ChipRow.tsx`
3. **Android** — `ui/patterns/AppChipRow.kt` — LazyRow
4. **Register** in `docs/components.md`

---

### 2.4 SkeletonView

**What:** Animated shimmer placeholder shapes for loading states. Alternative to spinner.

**Source reference:** 99-neo `SavedPropertiesView` (shimmer rectangles)

**API (iOS):**
```swift
// Preset shapes
AppSkeleton.textLines(count: 3)        // 3 lines of varying width
AppSkeleton.card(height: 120)          // rectangle card
AppSkeleton.avatar(size: .md)          // circle
AppSkeleton.listRows(count: 5)         // 5 list-item-shaped rows

// Custom
RoundedRectangle(cornerRadius: .radiusMD)
    .fill(Color.surfacesBaseLowContrast)
    .frame(height: 120)
    .shimmer()
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppSkeleton.swift`
   - `.shimmer()` ViewModifier: gradient mask animation (left → right sweep)
   - Static factory methods for common shapes: `.textLines()`, `.card()`, `.avatar()`, `.listRows()`
   - Colors: `surfacesBaseLowContrast` base, lighter gradient sweep
   - Animation: `Animation.linear(duration: 1.5).repeatForever(autoreverses: false)`
2. **Web** — `app/components/patterns/Skeleton/Skeleton.tsx`
   - CSS `@keyframes shimmer` with gradient background
3. **Android** — `ui/patterns/AppSkeleton.kt`
   - Brush.linearGradient animation
4. **Register** in `docs/components.md`

---

### 2.5 ScrollAwareHeader

**What:** Header that starts transparent and gains blur/solid background as user scrolls.

**Source reference:** 99-neo ChatView (ScrollOffsetPreferenceKey → blur header)

**API (iOS):**
```swift
ScrollAwareHeader(threshold: 10) {
    HStack {
        backButton
        Spacer()
        title
        Spacer()
        avatarButton
    }
} content: {
    LazyVStack { messageList }
}
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppScrollAwareHeader.swift`
   - ZStack: ScrollView (with GeometryReader tracking offset via PreferenceKey) + header overlay
   - When `scrollOffset > threshold`: apply `.ultraThinMaterial` background + `Color.surfacesBasePrimary.opacity(0.8)`
   - Animation: `.easeOut(duration: 0.2)`
   - Pass `coordinateSpace` name for offset tracking
2. **Web** — `app/components/patterns/ScrollAwareHeader/ScrollAwareHeader.tsx`
   - IntersectionObserver on sentinel element, toggle `backdrop-blur` class
3. **Android** — `ui/patterns/AppScrollAwareHeader.kt`
   - `nestedScrollConnection` tracking first visible item offset
4. **Register** in `docs/components.md`

---

## Phase 3 — Core Screen Templates

> **Goal:** Build the 4 most universally needed screen templates using Phase 1+2 patterns.  
> **Depends on:** Phase 1 and Phase 2 patterns.  
> **Convention:** Each screen template ships with placeholder/mock data and all 4 states (Loading, Empty, Error, Populated).

---

### 3.1 Settings / Profile Screen Template

**What:** Grouped settings list with avatar header, sectioned rows, danger zone.

**Source reference:** FitChat `ProfileView.swift`, 99-neo `ProfileView.swift`

**Sections:**
1. **User header** — AppThumbnail (lg, rounded) + name + email
2. **Account section** — GroupedCard with ListItem rows (Edit Profile → push, Notifications → toggle, Appearance → trailing label "System")
3. **Preferences section** — GroupedCard (Language → picker, Theme → picker)
4. **Support section** — GroupedCard (Help Center → push, Send Feedback → push, About → trailing label version)
5. **Danger zone** — GroupedCard (Logout → destructive, Delete Account → destructive with confirmation alert)

**Implementation steps per platform:**

**iOS** — `Views/Templates/SettingsTemplateView.swift` + `SettingsTemplateViewModel.swift`
1. NavigationStack with `.appPageHeader(title: "Settings")`
2. ScrollView > VStack(spacing: .space6):
   - User header section (AppThumbnail + AppTextBlock)
   - GroupedCard per section with AppListItem rows
   - SectionDivider between groups
3. Trailing controls: .toggle for switches, .iconButton(Ph.caretRight) for navigation, .button for labels
4. Danger zone: `.destructive` role buttons with AppAlertPopup confirmation
5. ViewModel: mock user data, toggle handlers, logout/delete actions

**Web** — `app/templates/settings/page.tsx`
1. Max-width container (640px), stacked sections
2. Same GroupedCard + ListItem composition
3. Uses AppBottomSheet for mobile delete confirmation, AppAlertPopup for desktop

**Android** — `feature/templates/SettingsTemplateScreen.kt`
1. LazyColumn with grouped card sections
2. Same structure, Material3 tokens

---

### 3.2 Login Screen Template (upgrade)

**What:** Full auth screen replacing current stub — hero area + social auth + email form + terms.

**Source reference:** FitChat `LoginView.swift`, 99-neo `LoginView.swift`

**Sections:**
1. **Hero area** — Gradient or image fill, top 40% of screen, app icon + tagline
2. **Auth form** — "Get Started" title, email AppInputField, AppButton "Continue with Email"
3. **Social divider** — AppDivider with centered "or" label
4. **Social buttons** — AppButton "Continue with Google" (icon), AppButton "Continue with Apple" (icon)
5. **Terms footer** — Small text "By continuing, you agree to our Terms and Privacy Policy"

**Implementation steps:**
1. **iOS** — Upgrade existing `Views/Auth/LoginView.swift`
   - ZStack with gradient background (brand color → transparent)
   - VStack: hero spacer + form card (surfacesBasePrimary bg, radiusLG, shadow)
   - Email input → social buttons → terms
   - Keyboard avoidance via `.ignoresSafeArea(.keyboard)`
2. **Web** — Upgrade existing `app/(auth)/login/page.tsx`
   - Centered card on desktop, full-screen on mobile
3. **Android** — Upgrade existing `feature/auth/LoginScreen.kt`

---

### 3.3 Search / Filter Screen Template

**What:** Universal search + filter + results list. The most commonly needed screen pattern.

**Source reference:** FitChat `FoodLibraryView` + `FoodSearchView`, 99-neo `LocalityReportsView`

**Sections:**
1. **StickySearchBar** — Search input + optional SegmentControlBar (tabs) + optional ChipRow (quick filters)
2. **Filter trigger** — AppIconButton (funnel icon) in search bar trailing, opens FilterSheet
3. **Results list** — LazyVStack of AppListItem rows (thumbnail + title + subtitle + trailing)
4. **EmptyState** — When no results match
5. **FAB** — Optional floating create button (bottom-trailing)

**States:** Loading (SkeletonView list rows), Empty (EmptyStateView), Error (EmptyStateView with retry), Populated (results list)

**Implementation steps:**
1. **iOS** — `Views/Templates/SearchTemplateView.swift` + `SearchTemplateViewModel.swift`
   - VStack(spacing: 0): StickySearchBar + ScrollView(LazyVStack)
   - FilterSheet presented via `.appBottomSheet`
   - ViewModel: `@Published searchText`, `@Published results`, `@Published filters`
   - Debounced search (500ms) via `.task(id: searchText)`
   - Sections: optional grouped by category with SectionHeader
   - FAB: ZStack overlay, bottom-trailing, AppButton with icon
2. **Web** — `app/templates/search/page.tsx`
   - Same composition, `useDebounce` hook for search
3. **Android** — `feature/templates/SearchTemplateScreen.kt`
   - LazyColumn with stickyHeader for search bar

---

### 3.4 Chat Screen Template

**What:** Full conversational UI — the flagship template for AI/agent apps.

**Source reference:** 99-neo `ChatView.swift` + `ChatViewModel.swift`

**Message types (generic):**
```swift
enum ChatMessage: Identifiable {
    case user(id: UUID, text: String)
    case aiText(id: UUID, markdown: String)
    case aiStreaming(id: UUID, events: [String])    // tool call progress
    case aiCard(id: UUID, cards: [CardModel])       // rich card carousel
    case aiQuestion(id: UUID, question: QuestionModel) // interactive form
}
```

**Sections:**
1. **ScrollAwareHeader** — Back/history button + title/segment + avatar
2. **Message timeline** — LazyVStack: user bubbles (right), AI markdown (left), card embeds, question cards
3. **ChatInputBar** — Expandable pill input + mic (optional) + send
4. **ChatHistorySheet** — Bottom sheet listing past sessions

**Implementation steps:**
1. **iOS** — `Views/Templates/ChatTemplateView.swift` + `ChatTemplateViewModel.swift`
   - ScrollAwareHeader with blur transition
   - ScrollView + ScrollViewReader (auto-scroll to bottom on new messages)
   - Message rendering: switch on ChatMessage type
     - `.user` → right-aligned pill, `surfacesBaseLowContrast` bg
     - `.aiText` → left-aligned, MarkdownUI with custom theme
     - `.aiStreaming` → StreamingStatusView (animated badges)
     - `.aiCard` → horizontal AppCarousel with generic cards
     - `.aiQuestion` → InteractiveQuestionCard
   - ChatInputBar pinned at bottom via `.safeAreaInset(edge: .bottom)`
   - ChatHistorySheet via `.appBottomSheet`
   - ViewModel: `messages: [ChatMessage]`, `sendMessage(text:)`, `isStreaming`
2. **Web** — `app/templates/chat/page.tsx`
   - Flex column: header + scrollable messages + input bar
   - Markdown via `react-markdown`
   - SSE/streaming via `EventSource` or fetch stream
3. **Android** — `feature/templates/ChatTemplateScreen.kt`
   - LazyColumn reversed for message timeline
   - Markdown via `compose-markdown`

---

## Phase 4 — Chat & AI Patterns

> **Goal:** Build the specialized patterns that make chat/agent UIs rich.  
> **Depends on:** Phase 1 patterns. Used by Phase 3 Chat Screen.

---

### 4.1 ChatInputBar

**Source reference:** 99-neo `Components/Chat/ChatInputBar.swift`

**API (iOS):**
```swift
ChatInputBar(text: $message, placeholder: "Ask anything...") { text in
    viewModel.send(text)
}
```

**Features:**
- Pill-shaped container (surfacesBaseLowContrast bg, full radius)
- Leading slot: search/sparkle icon (configurable)
- Expandable TextField (grows to ~4 lines, then scrolls)
- Trailing slot: mic button (optional) + send button (blue circle, disabled when empty)
- Send button: `Ph.arrowUp.regular` on `surfacesBrandInteractive` circle

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppChatInputBar.swift`
   - HStack(alignment: .bottom): leading icon + TextField + trailing buttons
   - TextField uses `axis: .vertical` with lineLimit(1...4)
   - Send disabled when text.trimmingCharacters.isEmpty
   - Mic button: optional via `showMic: Bool` parameter (recording state managed externally)
2. **Web** — `app/components/patterns/ChatInputBar/ChatInputBar.tsx`
   - `<textarea>` with auto-resize, same pill styling
3. **Android** — `ui/patterns/AppChatInputBar.kt`
   - OutlinedTextField with pill shape

---

### 4.2 InteractiveQuestionCard

**Source reference:** 99-neo `Components/Chat/InteractiveQuestionCard.swift`

**API (iOS):**
```swift
InteractiveQuestionCard(
    question: "What's your budget range?",
    options: ["Under 50L", "50L - 1Cr", "1Cr - 2Cr", "Above 2Cr"],
    selectionMode: .single,  // or .multiple
    showOther: true,
    onSubmit: { selected, otherText in ... }
)
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppQuestionCard.swift`
   - Card container (surfacesBaseLowContrast bg, radiusMD, border)
   - Question text: `.appBodyLargeEm`
   - Options: ForEach → `.single` uses AppRadioButton, `.multiple` uses AppCheckbox
   - "Other" option: when selected, shows AppInputField below
   - Submit button: AppButton (primary, sm) — "Done" / "Submit"
   - Disabled submit until selection made
2. **Web** — `app/components/patterns/QuestionCard/QuestionCard.tsx`
3. **Android** — `ui/patterns/AppQuestionCard.kt`

---

### 4.3 StreamingStatusView

**Source reference:** 99-neo `Components/Chat/SSEStreamEventView.swift`

**API (iOS):**
```swift
StreamingStatusView(events: ["Searching properties...", "Analyzing 12 results..."])
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppStreamingStatus.swift`
   - VStack(alignment: .leading, spacing: .space2)
   - Each event: HStack with animated dot + text in AppBadge-like pill
   - Last event shows animated typing indicator (3 bouncing dots)
   - Entrance animation: `.transition(.opacity.combined(with: .move(edge: .leading)))`
2. **Web** — `app/components/patterns/StreamingStatus/StreamingStatus.tsx`
3. **Android** — `ui/patterns/AppStreamingStatus.kt`

---

### 4.4 ChatHistorySheet

**Source reference:** 99-neo `Components/Chat/ChatHistorySheet.swift`

**API (iOS):**
```swift
ChatHistorySheet(
    sessions: chatSessions,
    onSelect: { session in loadSession(session) },
    onDelete: { session in deleteSession(session) }
)
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppChatHistorySheet.swift`
   - Presented via AppBottomSheet(.large)
   - Search bar at top (filter sessions by title/preview)
   - Sections: "Pinned" + "Recent" (with SectionHeader)
   - Rows: AppListItem (title = session name, subtitle = last message preview, metadata = timestamp)
   - Swipe-to-delete on each row
   - Empty state when no sessions
2. **Web** — `app/components/patterns/ChatHistorySheet/ChatHistorySheet.tsx`
3. **Android** — `ui/patterns/AppChatHistorySheet.kt`

---

### 4.5 RichCardCarousel

**Source reference:** 99-neo `PropertyCard.swift` + `ProjectCardCarousel.swift` (genericized)

**API (iOS):**
```swift
AppCardCarousel(cards: recommendations) { card in
    VStack(alignment: .leading) {
        AsyncImage(url: card.imageURL).frame(height: 160).clipped()
        Text(card.title).font(.appBodyLargeEm)
        Text(card.subtitle).font(.appBodySmall).foregroundStyle(.typographyMuted)
    }
} onTap: { card in
    openDetail(card)
}
```

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppCardCarousel.swift`
   - AppCarousel(style: .scrollSnap) wrapping generic card builder
   - Card: surfacesBaseLowContrast bg, radiusMD, border, shadow
   - Card width: 280pt (configurable)
   - Optional: save/heart button overlay (top-right), badge overlay (top-left)
2. **Web** — `app/components/patterns/CardCarousel/CardCarousel.tsx`
   - Horizontal scroll-snap container with CSS
3. **Android** — `ui/patterns/AppCardCarousel.kt`
   - LazyRow with snap fling behavior

---

## Phase 5 — Advanced Screen Templates

> **Goal:** Additional screen templates for common app patterns.  
> **Depends on:** Phase 1-4.

---

### 5.1 Onboarding / Wizard Screen Template

**What:** Multi-step flow with progress indicator, per-step content, back/next navigation.

**Sections:**
1. **StepIndicator** at top (existing pattern)
2. **Content area** — per-step slot (form fields, selections, media)
3. **Bottom bar** — Back (tertiary) + Next/Complete (primary), or just Next if step 1

**Implementation steps:**
1. **iOS** — `Views/Templates/OnboardingTemplateView.swift`
   - TabView(selection: $step) with `.tabViewStyle(.page(indexDisplayMode: .never))`
   - AppStepIndicator at top
   - BottomActionBar with conditional back + next
   - Per-step views: welcome, preferences (chips), profile (form), complete (success)
2. **Web** — `app/templates/onboarding/page.tsx`
3. **Android** — `feature/templates/OnboardingTemplateScreen.kt`

---

### 5.2 Detail Screen Template

**What:** Product/article/item detail with hero gallery + info + sectioned content + sticky action bar.

**Source reference:** 99-neo `ProjectDetailView.swift`

**Sections:**
1. **Hero gallery** — AppCarousel (paged) with images, counter badge
2. **Info card** — Title + subtitle + badges + stat cells (HStack)
3. **Content sections** — Repeating: SectionHeader + content (text, grid, list) + SectionDivider
4. **ExpandableSection** on long text blocks
5. **BottomActionBar** — Primary CTA + optional secondary

**Implementation steps:**
1. **iOS** — `Views/Templates/DetailTemplateView.swift`
   - ScrollView > VStack(spacing: 0):
     - AppCarousel(.paged) height 280
     - Info VStack: title + subtitle + HStack of stat cells
     - ForEach sections: SectionDivider + SectionHeader + content
   - BottomActionBar overlay
2. **Web** — `app/templates/detail/page.tsx`
3. **Android** — `feature/templates/DetailTemplateScreen.kt`

---

### 5.3 CRUD Form Screen Template

**What:** Create/edit entity form with grouped sections, validation, and submit.

**Sections:**
1. **AppInnerPageHeader** — "Create [Entity]" + X close
2. **Form sections** — GroupedCard per section, AppInputField / AppNativePicker / AppSwitch / AppCheckbox rows
3. **Validation** — Per-field error states on AppInputField
4. **BottomActionBar** — "Save" primary button with loading state

**Implementation steps:**
1. **iOS** — `Views/Templates/FormTemplateView.swift`
   - Presented as .sheet with NavigationStack
   - ScrollView > VStack: GroupedCard sections with form fields
   - BottomActionBar with Save + optional Delete (destructive)
   - ViewModel: `@Published` fields, `validate() -> Bool`, `save() async`
2. **Web** — `app/templates/form/page.tsx`
3. **Android** — `feature/templates/FormTemplateScreen.kt`

---

### 5.4 MediaGallery

**What:** Horizontal image/video gallery with fullscreen viewer.

**Source reference:** 99-neo `ImageGallery.swift` + `VideoCarousel.swift`

**Implementation steps:**
1. **iOS** — `Components/Patterns/AppMediaGallery.swift`
   - AppCarousel(.scrollSnap) with image/video cards
   - Tap → `.fullScreenCover` with TabView paged viewer + close button + counter
   - Video: play button overlay, AVPlayer in fullscreen
2. **Web** — `app/components/patterns/MediaGallery/MediaGallery.tsx`
   - Lightbox library for fullscreen
3. **Android** — `ui/patterns/AppMediaGallery.kt`

---

## Phase 6 — Advanced Patterns & Polish

> **Goal:** Power-user patterns and analytics components.

---

### 6.1 MultiSelect / ReorderMode

**Source reference:** FitChat `TodayView`

**Implementation:** ViewModifier that overlays circular checkboxes on list items when activated, shows selection count + action bar.

### 6.2 PhotoAttachment

**Source reference:** FitChat `AddReflectionSheet`

**Implementation:** Pick → optional crop → preview with X remove → fullscreen on tap.

### 6.3 TrendChartCard

**Source reference:** FitChat `TrendChartCard.swift`

**Implementation:** Chart card with SectionHeader, time-range ChipRow (week/month/year), SwiftUI Charts / Recharts / MPAndroidChart.

### 6.4 Dashboard Screen Template

**Source reference:** FitChat `TodayView`

**Implementation:** Swipeable tab pages (AppCarousel paged), per-tab summary cards, progress indicators, FAB.

### 6.5 MapCard

**Source reference:** 99-neo `MapCard.swift`

**Implementation:** Inline MapKit / Google Maps embed with pin + metadata overlay card.

---

## Registration & Documentation

After each phase, update:

1. **`docs/components.md`** — Add entries under new sections:
   - `## Patterns (Inner-Layer)` — EmptyState, SectionHeader, GroupedCard, BottomActionBar, etc.
   - `## Patterns (Complex)` — ChatInputBar, QuestionCard, CardCarousel, etc.
   - `## Screen Templates` — Settings, Login, Search, Chat, Onboarding, Detail, Form

2. **`CLAUDE.md`** — Update component counts and add Screen Templates section

3. **`/new-screen` skill** — Add template selection:
   ```
   Start from template?
   > blank (empty screen)
   > settings (grouped settings list)
   > chat (conversational UI)  
   > search (search + filter + results)
   > form (create/edit entity)
   > detail (hero + sections + action bar)
   > onboarding (multi-step wizard)
   > dashboard (multi-tab summary)
   ```

4. **Component showcase** — Add new pattern demos to existing showcase screen

---

## Total Inventory After All Phases

| Layer | Before | After |
|-------|--------|-------|
| Atomic Components | 19 | 19 (unchanged) |
| Existing Patterns | 4 | 4 (unchanged) |
| Inner-Layer Patterns | 0 | **12** (EmptyState, SectionHeader, GroupedCard, BottomActionBar, SectionDivider, SortMenuRow, FilterSheet, StickySearchBar, ExpandableSection, ChipRow, SkeletonView, ScrollAwareHeader) |
| Complex Patterns | 0 | **8** (ChatInputBar, QuestionCard, StreamingStatus, ChatHistorySheet, CardCarousel, MediaGallery, MultiSelect, PhotoAttachment) |
| Screen Templates | 0 | **7** (Settings, Login, Search, Chat, Onboarding, Detail, Form) |
| Native Wrappers | 13 | 13 (unchanged) |
| Adaptive Wrappers | 3 | 3 (unchanged) |
| **Total** | **39** | **66** |

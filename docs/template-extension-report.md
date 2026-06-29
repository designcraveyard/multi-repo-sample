# Template Extension Report: Borrowing from FitChat & 99-neo

> **Date:** 2026-04-16  
> **Goal:** Identify reusable UI components, patterns, screens, and templates from FitChat iOS and 99-neo iOS that can be generalized and bundled into the multi-repo-sample template.

---

## Executive Summary

The multi-repo-sample template currently has a **strong atomic foundation** (19 atomic components, 4 patterns, 13 native wrappers, 3 adaptive wrappers — all cross-platform). What it lacks are **higher-order compositions**: screen templates, complex patterns, and domain-agnostic page layouts that apps actually ship with.

Between FitChat and 99-neo, there are **~25 extractable items** across 4 tiers that would transform the template from "design system + scaffolding" into "design system + ready-to-use screens."

---

## What Already Exists in multi-repo-sample

| Layer | Count | Examples |
|-------|-------|---------|
| Atomic Components | 19 | Button, InputField, Badge, Chip, Label, Switch, Checkbox, RadioButton, Toast, Thumbnail, Divider, DateGrid, Tabs, SegmentControlBar, IconButton, MarkdownEditor |
| Patterns | 4 | ListItem, TextBlock, StepIndicator, Stepper |
| Native Wrappers | 13 | BottomSheet, PageHeader, Carousel, DateTimePicker, NativePicker, RangeSlider, ProgressLoader, WebView, AlertPopup, ActionSheet, ContextMenu, Tooltip, ColorPicker |
| Adaptive Wrappers | 3 | AdaptiveNavShell, AdaptiveSheet, AdaptiveSplitView |
| Screens | 0 real screens | Only component showcases and login stub |

**The gap is clear: zero reusable screen templates, zero complex patterns, zero page compositions.**

---

## Tier 1 — Generic Screen Templates (High Priority)

These screens exist in virtually every app and can be extracted almost verbatim.

### 1.1 Settings / Profile Screen
- **Source:** FitChat `ProfileView.swift` + 99-neo `ProfileView.swift`
- **What it is:** Grouped list with avatar header, sectioned rows (ListItem with trailing controls), danger zone at bottom (delete account, logout)
- **Composes:** AppListItem, AppThumbnail, AppTextBlock, AppSwitch, AppDivider, AppPageHeader
- **Genericization:** Strip domain models. Make sections configurable. Keep avatar + name + email header, grouped settings rows, danger zone pattern.
- **Platforms needed:** iOS (both have it), Web (new), Android (new)

### 1.2 Chat / Conversational UI Screen
- **Source:** 99-neo `ChatView.swift` (11 message types!) + `ChatViewModel.swift`
- **What it is:** Full conversational interface with:
  - Custom floating header with blur-on-scroll
  - Message timeline (user bubbles right, AI markdown left)
  - Sticky input bar at bottom (ChatInputBar)
  - Rich card embeds (carousels, maps, images, interactive questions)
  - SSE streaming support
  - Chat history sheet
- **Composes:** ChatInputBar, AppBottomSheet (history), AppCarousel (rich cards), AppThumbnail, MarkdownUI
- **Genericization:** Abstract message types into a protocol/union. Keep: user bubble, AI text (markdown), AI card embed (generic slot), interactive question card. Strip: PropertyCard, FloorPlanCarousel, SiteVisitCard (domain-specific).
- **Platforms needed:** iOS (extract from 99-neo), Web (new — ChatKit wrapper exists but no native), Android (new)

### 1.3 Search / Filter Screen
- **Source:** FitChat `FoodLibraryView.swift` + `FoodSearchView.swift` + 99-neo `LocalityReportsView.swift`
- **What it is:** Sticky search bar + horizontal chip filters + segment control tabs + results list + FAB for create + empty state
- **Composes:** AppInputField (search variant), AppChip, AppSegmentControlBar, AppListItem, AppIconButton (FAB)
- **Genericization:** Replace food/property models with generic `Searchable` protocol. Keep: search bar, chip filters, segmented tabs, results list, empty state, FAB.
- **Platforms needed:** All three

### 1.4 Onboarding / Wizard Flow
- **Source:** FitChat `GoalsView.swift` + step-based flows + `AppStepIndicator`
- **What it is:** Multi-step form with progress indicator, back/next navigation, per-step content slots
- **Composes:** AppStepIndicator, AppButton, AppInputField, AppRadioButton, AppCheckbox
- **Genericization:** Already generic — just needs a screen template wrapping StepIndicator with a content slot per step.
- **Platforms needed:** All three

### 1.5 Login / Auth Screen
- **Source:** FitChat `LoginView.swift` + 99-neo `LoginView.swift`
- **What it is:** Hero image/gradient + email input + social auth buttons (Apple, Google) + magic link option
- **Composes:** AppButton, AppInputField, AppDivider
- **Genericization:** Already exists as stub in multi-repo. Needs upgrade to full template with hero area, social buttons, terms footer.
- **Platforms needed:** All three (upgrade existing)

---

## Tier 2 — Complex Patterns (Medium Priority)

These are multi-component compositions that show up repeatedly across different screens.

### 2.1 ChatInputBar (Message Input)
- **Source:** 99-neo `Components/Chat/ChatInputBar.swift`
- **What it is:** Pill-shaped input with sparkle/search icon, expandable TextField, mic button (tap to record → transcribe), send button. Grows vertically with text.
- **Composes:** AppInputField (bare), AppIconButton, audio recorder
- **Genericization:** Strip audio transcription service dependency. Keep: expandable input, leading icon slot, trailing action buttons (send + optional mic). Make leading/trailing slots configurable.
- **Cross-platform:** iOS done, Web + Android new

### 2.2 InteractiveQuestionCard
- **Source:** 99-neo `Components/Chat/InteractiveQuestionCard.swift`
- **What it is:** AI-presented card with question text + radio/checkbox options + "Other" freeform input. Used for structured data collection inside chat.
- **Composes:** AppRadioButton, AppCheckbox, AppInputField, AppButton
- **Genericization:** Already quite generic. Just needs domain-neutral naming.
- **Cross-platform:** iOS done, Web + Android new

### 2.3 Rich Card Carousel (Generic)
- **Source:** 99-neo `PropertyCard.swift` + `ProjectCardCarousel.swift`
- **What it is:** Horizontal snap-scrolling carousel of image + title + subtitle + action cards. Tap opens detail.
- **Composes:** AppCarousel (scrollSnap mode), AppThumbnail, AppTextBlock, AppIconButton (save/heart)
- **Genericization:** Replace PropertyCardModel with generic `CardModel` (image URL, title, subtitle, metadata, action). Keep snap-scroll + dot indicators.
- **Cross-platform:** iOS done (abstract from PropertyCard), Web + Android new

### 2.4 MediaGallery (Image + Video)
- **Source:** 99-neo `ImageGallery.swift` + `VideoCarousel.swift` + `FloorPlanCarousel.swift`
- **What it is:** Horizontal scrolling image/video gallery with fullscreen viewer on tap
- **Composes:** AppCarousel, AppThumbnail, native video player
- **Genericization:** Merge image gallery + video carousel into one MediaGallery pattern with type discrimination. Keep: horizontal scroll, fullscreen viewer, counter badge.
- **Cross-platform:** iOS extract, Web + Android new

### 2.5 MapCard (Embedded Map)
- **Source:** 99-neo `Components/Chat/MapCard.swift` + FitChat `MapSnapshotView.swift`
- **What it is:** Inline map display (either snapshot or interactive) with pin and optional metadata overlay
- **Composes:** MapKit / Google Maps embed, AppTextBlock
- **Genericization:** Thin wrapper around platform maps. iOS: MapKit. Web: Leaflet or Google Maps. Android: Google Maps Compose.
- **Cross-platform:** iOS done, Web + Android new

### 2.6 TrendChartCard (Analytics)
- **Source:** FitChat `TrendChartCard.swift` + `InsightsView.swift`
- **What it is:** Line/bar chart card with section header, time-range picker (week/month/year), insight text below
- **Composes:** SwiftUI Charts, AppChip (time filter), AppTextBlock
- **Genericization:** Keep chart card frame + time picker. Use platform charts (SwiftUI Charts / Recharts / MPAndroidChart). Accept generic data series.
- **Cross-platform:** iOS extract, Web + Android new

### 2.7 SSEStreamEventView (Streaming Status)
- **Source:** 99-neo `Components/Chat/SSEStreamEventView.swift`
- **What it is:** Renders real-time streaming event pills (e.g., "Searching properties...", "Analyzing options...")
- **Composes:** AppBadge / AppLabel, animation
- **Genericization:** Rename to `StreamingStatusView`. Accept array of status strings with animated appearance. Useful for any AI/agent UI showing tool calls in progress.
- **Cross-platform:** iOS done, Web + Android new

### 2.8 ChatHistorySheet
- **Source:** 99-neo `Components/Chat/ChatHistorySheet.swift`
- **What it is:** Bottom sheet listing past chat sessions with timestamps and preview text
- **Composes:** AppBottomSheet, AppListItem, AppDivider
- **Genericization:** Already generic enough — list of sessions with title + timestamp + preview.
- **Cross-platform:** iOS done, Web + Android new

---

## Tier 3 — Screen Sections & Layout Patterns (Nice to Have)

### 3.1 Hero Section (Explore / Landing)
- **Source:** 99-neo `ExploreView.swift`
- **What it is:** Personalized feed with requirement chips at top, scrollable sections (projects, localities, insights), pull-to-refresh
- **Genericization:** Abstract into `FeedView` — configurable sections with horizontal/vertical scrolling, chip filters, section headers with "See All"

### 3.2 Detail Screen Layout
- **Source:** 99-neo `ProjectDetailView.swift`
- **What it is:** Scrollable detail page: hero image gallery → info card → tabbed sections → action bar pinned at bottom
- **Genericization:** `DetailScreenLayout` — hero slot + info slot + sections + sticky action bar. Used for product detail, profile detail, article detail, etc.

### 3.3 Report / Article View
- **Source:** 99-neo `ReportDetailSheet.swift`
- **What it is:** Markdown-rendered content with header, metrics, and action buttons in a sheet
- **Genericization:** `ArticleView` — title + markdown body + optional metrics bar + share/save actions

### 3.4 CRUD Form Screen
- **Source:** FitChat `CreateIngredientView.swift`, `CreateDishView.swift`, `CreateRoutineView.swift`
- **What it is:** Form with grouped sections, validation, submit button. Some with nested pickers (ingredient picker in dish form).
- **Genericization:** `FormScreen` template — grouped form sections, per-field validation, submit bar, optional nested picker sheets

### 3.5 Dashboard / Today Screen
- **Source:** FitChat `TodayView.swift`
- **What it is:** Swipeable multi-tab daily view with summary cards, progress rings, quick-add FAB
- **Genericization:** `DashboardScreen` — tab-paged sections with summary cards and progress indicators

### 3.6 Empty State Pattern
- **Source:** Both projects use contextual empty states with icon + title + subtitle + CTA button
- **Genericization:** `EmptyStateView` — icon + title + body + optional action button. Already partially exists (via AppTextBlock) but needs a dedicated pattern.

---

## Tier 4 — Infrastructure & Utilities (Supporting)

### 4.1 Audio Recorder + Transcription
- **Source:** 99-neo `AppAudioRecorder.swift` + FitChat web `use-audio-recorder.ts` + `transcribe-service.ts`
- **What it is:** Mic recording → audio file → OpenAI Whisper transcription → text
- **Genericization:** Utility service, not a UI component. Pairs with ChatInputBar mic button.

### 4.2 Markdown Rendering Theme
- **Source:** 99-neo `ChatMarkdownTheme.swift` (MarkdownUI theme for chat bubbles)
- **What it is:** Custom MarkdownUI theme matching design tokens for AI responses
- **Genericization:** Ship as default markdown theme in the template

### 4.3 Scroll Offset Tracking
- **Source:** 99-neo ChatView `ScrollOffsetPreferenceKey`
- **What it is:** SwiftUI preference key for tracking scroll position (used for blur-on-scroll header)
- **Genericization:** Small utility — bundle as a ViewModifier

### 4.4 Components Demo / Showcase Screen
- **Source:** 99-neo `ComponentsDemoView.swift` + existing multi-repo showcase
- **What it is:** Live component gallery for development
- **Genericization:** Already exists. Extend to include new patterns/templates.

---

## Tier 2B — Inner-Layer Patterns & Compositions (High Priority)

These are the **glue patterns** — sub-screen compositions that show up inside almost every real screen. They sit between atomics and full screens, and are the most frequently reused layer in both FitChat and 99-neo.

### 2B.1 Filter Bottom Sheet
- **Source:** FitChat `FoodFilterSheet.swift` + `RoutineFilterSheet.swift`, 99-neo `ProjectDetailView` (inline BHK/amenity filters)
- **What it is:** Bottom sheet presenting filter controls — toggle rows (AppListItem + AppSwitch), dropdown selectors (Menu + caret icon), chip multi-select, range sliders, with Reset and Apply buttons
- **Composes:** AppBottomSheet, AppListItem (with .toggle trailing), AppChip (.filters variant), AppNativePicker, AppRangeSlider, AppButton, AppDivider
- **Key features:**
  - Active filter count badge on trigger button
  - Reset all button (shown only when filters are active)
  - Section labels (uppercased, muted color)
  - Card-style grouped rows with dividers between
- **Genericization:** `FilterSheet` — accepts array of `FilterSection` (toggle, picker, chip-select, range). Returns active filter state. Domain-agnostic.
- **Platforms needed:** All three

### 2B.2 Sort Menu Row
- **Source:** FitChat `FoodFilterSheet.swift` (menuRow helper), 99-neo reports views
- **What it is:** A reusable row pattern: `[Label] [Spacer] [Selected Value] [Caret-Down Icon]` that opens a Menu with checkmarked options
- **Composes:** Native Menu, AppDivider
- **Genericization:** `SortMenuRow` — accepts label, options array, selected binding. Renders checkmark on active option.
- **Platforms needed:** All three

### 2B.3 Section Header (Inner Page)
- **Source:** FitChat `AppInnerPageHeader.swift`, 99-neo `ProjectDetailView` section titles
- **What it is:** Two distinct patterns:
  - **AppInnerPageHeader** (FitChat) — ZStack with centered title + leading X/back button + trailing action buttons. Used at top of sheets and sub-pages.
  - **Section Title** (both) — Simple `Text().font(.appTitleSmall)` with optional trailing "See All" button. Used between scrollable content sections.
- **Composes:** AppIconButton, AppTextBlock
- **Genericization:** Already have AppInnerPageHeader. Need a **SectionHeader** pattern: title + optional subtitle + optional trailing action ("See All", count badge, etc.)
- **Platforms needed:** All three

### 2B.4 Sticky Search + Filter Bar
- **Source:** FitChat `FoodLibraryView`, `FoodSearchView`, 99-neo `LocalityReportsView`
- **What it is:** A pinned bar above scrollable content containing: search input + optional segment control + optional horizontal chip row. Content scrolls underneath while bar stays fixed.
- **Composes:** AppInputField (search variant), AppSegmentControlBar, AppChip
- **Implementation pattern:**
  ```swift
  VStack(spacing: 0) {
      VStack { searchBar; segmentControl; chipRow }
          .background(Color.surfacesBasePrimary)
      ScrollView { content }
  }
  ```
- **Genericization:** `StickySearchBar` — configurable slots: search field (always), segment tabs (optional), chip filters (optional). Sticky behavior built in.
- **Platforms needed:** All three

### 2B.5 Expandable / Collapsible Section
- **Source:** 99-neo `ProjectDetailView` (overview text + amenities grid expand/collapse)
- **What it is:** Content with initial line limit or item count cap, "Read more" / "Show less" toggle, animated expand/collapse
- **Composes:** AppButton (tertiary), withAnimation
- **Implementation:**
  ```swift
  Text(content).lineLimit(expanded ? nil : 4)
  Button(expanded ? "Show less" : "Read more") {
      withAnimation { expanded.toggle() }
  }
  ```
- **Genericization:** `ExpandableSection` ViewModifier — accepts initial line limit (for text) or item count (for grids), toggle label, animation. Works on any content.
- **Platforms needed:** All three

### 2B.6 Bottom Action Bar (Sticky CTA)
- **Source:** FitChat `CreateDishView` (Save button), 99-neo `ProjectDetailView` (Brochure + View Number buttons)
- **What it is:** Sticky bar pinned to bottom safe area with 1-2 action buttons, optional info row above (like macro stats). Has top shadow/border.
- **Composes:** AppButton, safeAreaInset
- **Implementation:**
  ```swift
  .safeAreaInset(edge: .bottom) {
      VStack { optionalInfoRow; buttonRow }
          .padding(.horizontal, .space4)
          .background(Color.surfacesBasePrimary)
          .shadow(color: .black.opacity(0.05), radius: 8, y: -4)
  }
  ```
- **Genericization:** `BottomActionBar` — accepts primary button + optional secondary button + optional top content slot. Handles safe area, shadow, background.
- **Platforms needed:** All three

### 2B.7 Empty State View
- **Source:** FitChat `TodayEmptyState.swift`, 99-neo (inline empty states in ExploreView, SavedPropertiesView)
- **What it is:** Centered vertical stack: icon/illustration → title → subtitle → optional CTA button
- **Composes:** AppTextBlock, AppButton, PhosphorSlim icon
- **Genericization:** `EmptyStateView` — icon (Phosphor name or custom), title, subtitle, optional action button. Centered vertically with spacers.
- **Platforms needed:** All three

### 2B.8 Grouped Form Card
- **Source:** FitChat filter sheets, create forms; 99-neo InteractiveQuestionCard
- **What it is:** A visually grouped section with neutral background, rounded corners, border, containing rows separated by dividers. Section label above.
- **Composes:** VStack, RoundedRectangle overlay, AppDivider, section label Text
- **Implementation:**
  ```swift
  VStack(spacing: 0) {
      Text("SECTION LABEL").font(.appOverlineSmall).foregroundStyle(.typographyMuted)
      VStack(spacing: 0) {
          ForEach(rows) { row in
              rowContent(row)
              if !isLast { AppDivider() }
          }
      }
      .background(Color.surfacesBaseLowContrast)
      .clipShape(RoundedRectangle(cornerRadius: .radiusMD))
      .overlay(RoundedRectangle(cornerRadius: .radiusMD).stroke(Color.borderDefault))
  }
  ```
- **Genericization:** `GroupedCard` — accepts section label + content rows. Handles background, border, corner radius, dividers. Used inside settings, filter sheets, forms.
- **Platforms needed:** All three

### 2B.9 Swipe-to-Delete Row
- **Source:** 99-neo `ChatHistorySheet` (swipe delete on chat sessions), FitChat `TodayReflectionContent` (swipe delete on reflections)
- **What it is:** List row with `.swipeActions(edge: .trailing)` destructive delete button, optionally combined with `.contextMenu` for edit/duplicate/delete
- **Composes:** AppListItem, native swipeActions, AppContextMenu
- **Genericization:** Not a standalone component — rather a **usage pattern** to document. The template should show how to combine ListItem + swipeActions + contextMenu.
- **Platforms needed:** Pattern documentation for all three

### 2B.10 Loading Skeleton / Shimmer
- **Source:** 99-neo `SavedPropertiesView` (3x shimmer rectangles), FitChat (ProgressLoader for loading states)
- **What it is:** Placeholder rectangles with animated shimmer effect while data loads
- **Composes:** RoundedRectangle + `.shimmering()` modifier
- **Genericization:** `SkeletonView` — accepts shape (rectangle, circle, text lines), size, corner radius. Applies shimmer animation. Alternative to spinner for list/card loading.
- **Platforms needed:** All three

### 2B.11 Multi-Select / Reorder Mode
- **Source:** FitChat `TodayView` + `TodayNutritionContent` (long-press → checkboxes → action bar)
- **What it is:** Toggle mode where list rows show circular checkboxes, selected items tracked in Set, action bar appears at bottom (Move, Duplicate, Delete)
- **Composes:** AppCheckbox, BottomActionBar, AppListItem, transition animations
- **Key features:**
  - Long-press or menu triggers reorder mode
  - Selection count shown in action bar
  - "Done" exits mode
  - Items animate in/out
- **Genericization:** `SelectionMode` pattern — ViewModifier or state wrapper that adds checkbox overlay to list items + shows selection action bar. Generic actions configurable.
- **Platforms needed:** All three

### 2B.12 Photo Attachment Flow
- **Source:** FitChat `AddReflectionSheet` (PhotosPicker → CropImageView → preview with X remove)
- **What it is:** End-to-end image attachment: pick → optional crop → preview thumbnail with remove button → fullscreen viewer on tap
- **Composes:** Native PhotosPicker, CropImageView, AppThumbnail, AppIconButton (X remove)
- **Genericization:** `PhotoAttachment` pattern — shows selected image preview, X to remove, tap for fullscreen. Crop step optional. Used in forms, chat input, profile editors.
- **Platforms needed:** All three

### 2B.13 Scroll-Aware Blur Header
- **Source:** 99-neo `ChatView` (ScrollOffsetPreferenceKey → header background blur)
- **What it is:** Custom header that starts transparent and gains blur/background as user scrolls down
- **Composes:** GeometryReader, PreferenceKey, .ultraThinMaterial
- **Implementation:** Measures scroll offset via coordinate space, applies material background when offset > threshold
- **Genericization:** `ScrollAwareHeader` ViewModifier — accepts header content, blur threshold. Applies progressive blur on scroll.
- **Platforms needed:** iOS (SwiftUI-specific), Web (Intersection Observer), Android (scroll listener)

### 2B.14 Section Divider (Thick)
- **Source:** 99-neo `ProjectDetailView` (8pt grey spacer between major sections)
- **What it is:** A thick horizontal divider (8pt) in `surfacesBaseLowContrast` color used between major page sections. Different from AppDivider (1pt line between rows).
- **Composes:** `Color.surfacesBaseLowContrast.frame(height: 8)`
- **Genericization:** Add a `.section` variant to existing AppDivider — thicker (8pt), full-width, used between major page sections vs `.row` variant (1pt, with padding).
- **Platforms needed:** All three (extend existing AppDivider)

### 2B.15 Horizontal Chip Scroller
- **Source:** 99-neo `ExploreView` (requirement chips), `ProjectDetailView` (BHK chips, amenity category chips)
- **What it is:** Horizontal scrolling row of chips used for category selection, requirement display, or quick filters. Not the full SegmentControlBar — simpler, often read-only or single-select within a section.
- **Composes:** ScrollView(.horizontal), HStack, AppChip
- **Genericization:** Already partially covered by AppSegmentControlBar, but this is a lighter pattern — just a scrollable chip row without the bar wrapper. Could be a `ChipRow` pattern.
- **Platforms needed:** All three

---

## Extraction Priority Matrix

### Inner-Layer Patterns (Tier 2B)

| Item | Effort | Impact | Priority |
|------|--------|--------|----------|
| **EmptyStateView** | Low | Very High | P0 |
| **SectionHeader** | Low | High | P0 |
| **GroupedCard** | Low | High | P0 |
| **BottomActionBar** | Low | High | P0 |
| **SectionDivider** (AppDivider .section variant) | Low | Medium | P0 |
| **FilterSheet** | Medium | Very High | P0 |
| **SortMenuRow** | Low | Medium | P0 |
| **StickySearchBar** | Medium | High | P1 |
| **ExpandableSection** | Low | Medium | P1 |
| **ChipRow** (horizontal scroller) | Low | Medium | P1 |
| **SkeletonView / Shimmer** | Medium | Medium | P1 |
| **ScrollAwareHeader** | Medium | Medium | P1 |
| **BottomActionBar** | Low | High | P1 |
| **MultiSelect / ReorderMode** | High | Medium | P2 |
| **PhotoAttachment flow** | Medium | Medium | P2 |
| **SwipeToDelete pattern** | Low | Medium | P2 |

### Screen Templates & Complex Patterns (Tiers 1 & 2)

| Item | Effort | Impact | Priority |
|------|--------|--------|----------|
| **Settings/Profile Screen** | Low | High | P0 |
| **Chat Screen + ChatInputBar** | High | Very High | P0 |
| **Search/Filter Screen** | Medium | High | P0 |
| **Login Screen (upgrade)** | Low | Medium | P0 |
| **InteractiveQuestionCard** | Low | High | P1 |
| **Rich Card Carousel** | Medium | High | P1 |
| **SSEStreamEventView** | Low | Medium | P1 |
| **ChatHistorySheet** | Low | Medium | P1 |
| **Onboarding/Wizard Flow** | Medium | Medium | P1 |
| **MediaGallery** | Medium | Medium | P2 |
| **MapCard** | Medium | Medium | P2 |
| **TrendChartCard** | Medium | Medium | P2 |
| **Detail Screen Layout** | Medium | Medium | P2 |
| **CRUD Form Screen** | Medium | Medium | P2 |
| **Dashboard Screen** | High | Medium | P2 |
| **Report/Article View** | Low | Low | P3 |
| **Hero/Feed Section** | Medium | Low | P3 |
| **Audio Recorder** | Medium | Low | P3 |
| **Markdown Theme** | Low | Low | P3 |

---

## Recommended Implementation Order

### Phase 1 — Inner-Layer Foundation (P0 patterns, prerequisite for all screens)
1. **EmptyStateView** — Used by every screen below
2. **SectionHeader** — Title + optional trailing action ("See All", badge)
3. **GroupedCard** — Bordered card with section label + divider rows
4. **BottomActionBar** — Sticky bottom CTA with safe area handling
5. **SectionDivider** — Extend AppDivider with `.section` variant (8pt thick)
6. **SortMenuRow** — Label + selected value + caret menu
7. **FilterSheet** — Composable filter bottom sheet (toggles, pickers, chips, range, reset)

### Phase 2 — More Inner Patterns
8. **StickySearchBar** — Search + optional segments + optional chips, pinned above scroll
9. **ExpandableSection** — Line-limit + "Read more/less" toggle ViewModifier
10. **ChipRow** — Simple horizontal scrolling chip selector
11. **SkeletonView** — Shimmer loading placeholder shapes
12. **ScrollAwareHeader** — Transparent → blur header on scroll

### Phase 3 — Core Screens (compose from Phase 1+2 patterns)
13. **Settings/Profile Screen** — GroupedCard + ListItem + SectionHeader + BottomActionBar
14. **Login Screen upgrade** — Hero + social auth + email input
15. **Search/Filter Screen** — StickySearchBar + FilterSheet + results list + EmptyState + FAB
16. **Chat Screen** — ScrollAwareHeader + message timeline + ChatInputBar + ChatHistorySheet

### Phase 4 — Chat & AI Patterns
17. **ChatInputBar** — Expandable pill input + mic + send
18. **InteractiveQuestionCard** — Radio/checkbox form card for AI conversations
19. **StreamingStatusView** (SSEStreamEventView) — Agent tool call progress pills
20. **ChatHistorySheet** — Past sessions list in bottom sheet
21. **Rich Card Carousel** — Generic horizontal snap-scroll image+text cards

### Phase 5 — Advanced Screens
22. **Onboarding/Wizard Flow** — StepIndicator + per-step content + back/next
23. **Detail Screen Layout** — Hero gallery + info card + expandable sections + BottomActionBar
24. **CRUD Form Screen** — GroupedCard sections + validation + submit bar
25. **MediaGallery** — Image + video horizontal gallery + fullscreen viewer

### Phase 6 — Advanced Patterns & Polish
26. **MultiSelect / ReorderMode** — Long-press → checkboxes → action bar
27. **PhotoAttachment** — Pick → crop → preview → remove flow
28. **TrendChartCard** — Chart card with time-range filter chips
29. **Dashboard Screen** — Multi-tab swipeable daily summary
30. **MapCard** — Embedded map with pin + metadata overlay

---

## Source File Reference

### From FitChat iOS (`/Users/abhishekverma/Documents/GitHub/fit-chat/fit-chat-ios/`)

| File | Extracts To |
|------|-------------|
| `Views/Profile/ProfileView.swift` | Settings Screen template |
| `Views/Auth/LoginView.swift` | Login Screen template |
| `Views/Library/FoodLibraryView.swift` | Search/Filter Screen template |
| `Views/Food/FoodSearchView.swift` | Search/Filter Screen template |
| `Views/Today/TodayView.swift` | Dashboard Screen template |
| `Views/Insights/InsightsView.swift` | Analytics patterns |
| `Views/Goals/GoalsView.swift` | Onboarding/Wizard patterns |
| `Components/TrendChartCard.swift` | TrendChartCard pattern |
| `Components/MapSnapshotView.swift` | MapCard pattern |
| `Views/Workout/RoutineListView.swift` | Search/Filter Screen template |

### From 99-neo iOS (`/Users/abhishekverma/Documents/GitHub/99-neo/99-neo-ios/`)

| File | Extracts To |
|------|-------------|
| `Views/Chat/ChatView.swift` | Chat Screen template |
| `Views/Chat/ChatViewModel.swift` | Chat Screen ViewModel |
| `Components/Chat/ChatInputBar.swift` | ChatInputBar pattern |
| `Components/Chat/InteractiveQuestionCard.swift` | InteractiveQuestionCard pattern |
| `Components/Chat/SSEStreamEventView.swift` | StreamingStatusView pattern |
| `Components/Chat/ChatHistorySheet.swift` | ChatHistorySheet pattern |
| `Components/Chat/PropertyCard.swift` | Rich Card Carousel (genericize) |
| `Components/Chat/ProjectCardCarousel.swift` | Rich Card Carousel (genericize) |
| `Components/Chat/ImageGallery.swift` | MediaGallery pattern |
| `Components/Chat/VideoCarousel.swift` | MediaGallery pattern |
| `Components/Chat/MapCard.swift` | MapCard pattern |
| `Views/Explore/ExploreView.swift` | Hero/Feed Section pattern |
| `Views/ProjectDetail/ProjectDetailView.swift` | Detail Screen Layout |
| `Views/Reports/LocalityReportsView.swift` | Search/Filter Screen template |
| `Views/ProfileView.swift` | Settings Screen template |

---

## Architecture Notes

### How templates should work in multi-repo-sample

1. **Screen templates** live in a new directory: `Views/Templates/` (iOS), `app/templates/` (web), `feature/templates/` (Android)
2. Each template is a **complete, runnable screen** with placeholder data — not abstract classes
3. Templates use ONLY existing components from `docs/components.md` — no new atomics needed
4. Templates follow the existing pattern: Loading → Empty → Error → Populated states
5. Domain-specific names (FoodRow, PropertyCard) become generic names (ContentRow, ContentCard)
6. The `/new-screen` skill can offer template selection: "Start from: blank | settings | chat | search | form | dashboard"

### What stays domain-specific (NOT extracted)

- FoodRow, MacroStatsBar, ExerciseThumbnail (FitChat-specific)
- PropertyCard, FloorPlanCarousel, SiteVisitCard (99-neo-specific)
- HealthKit integration, nutrition calculations
- Real estate search/filter logic, RERA data models

The goal is to extract the **layout pattern and composition logic**, not the domain models.

---

## Summary

| Category | Already Have | Can Extract | Gap Closed |
|----------|-------------|-------------|------------|
| Atomic Components | 19 | 0 (sufficient) | N/A |
| Existing Patterns | 4 | — | — |
| **Inner-Layer Patterns** | **0** | **+15 new** | **From 0 to 15** |
| **Complex Patterns** | **0** | **+8 new** | **From 0 to 8** |
| Native Wrappers | 13 | 0 (sufficient) | N/A |
| **Screen Templates** | **0** | **+7 screens** | **From 0 to 7** |
| Layout Patterns | 0 | +4 sections | From 0 to 4 |

**Bottom line:** The children projects have solved **three layers** the template hasn't addressed:
1. **Inner patterns** (FilterSheet, GroupedCard, EmptyState, StickySearchBar, etc.) — the "glue" between atomics and screens
2. **Complex patterns** (ChatInputBar, InteractiveQuestionCard, RichCardCarousel, etc.) — multi-component compositions for specific use cases
3. **Screen templates** (Settings, Chat, Search, Login, Onboarding, Detail, Form) — complete runnable screens

Extracting all three layers makes multi-repo-sample a genuinely ship-ready starter kit, not just a component library.

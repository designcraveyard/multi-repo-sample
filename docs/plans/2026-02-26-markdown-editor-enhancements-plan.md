# Markdown Editor Enhancements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add highlighted text, code block container, code picker, image embedding with fullscreen viewer/crop, Bear-style visual tables, and markdown export to the iOS markdown editor.

**Architecture:** All changes are within `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/`. New files for table overlay, image store, image viewer, image crop, and markdown exporter. Existing files modified for highlight syntax, code block rendering, toolbar picker, and share button.

**Tech Stack:** UIKit (UITextView, NSTextStorage, NSLayoutManager, UICollectionView, UIScrollView), SwiftUI wrappers, PHPicker, UIImagePickerController, UIDocumentPickerViewController, design tokens from DesignTokens.swift.

---

### Task 1: Highlighted Text — Styling Tokens

**Files:**
- Modify: `Components/MarkdownEditor/MarkdownStyling.swift`

**Step 1: Add highlight color token to MarkdownColors**

Add after the `strikethrough` section (~line 204):

```swift
// ── Highlight ──────────────────────────────────────────────────
/// Highlighted text background — warm yellow, works in light+dark.
static let highlightBackground = UIColor(Color.surfacesWarningLowContrast)
```

**Step 2: Add highlight corner radius to MarkdownLayout**

Add after code block section (~line 288):

```swift
// ── Highlight ─────────────────────────────────────────────────
/// Corner radius for highlighted text background rects.
static let highlightCornerRadius: CGFloat = 3
```

**Step 3: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownStyling.swift
git -C multi-repo-ios commit -m "feat(editor): add highlight design tokens"
```

---

### Task 2: Highlighted Text — Parsing & Rendering

**Files:**
- Modify: `Components/MarkdownEditor/MarkdownTextStorage.swift`
- Modify: `Components/MarkdownEditor/MarkdownLayoutManager.swift`

**Step 1: Add highlight regex in MarkdownTextStorage.applyInlineFormatting()**

Add after the underline section (~line 590) and before strikethrough:

```swift
// Highlight: ==text==
applyInlineHidden(nsText: nsText, pattern: "==(.+?)==", markerLen: 2, isInCodeBlock: isInCodeBlock) { contentRange in
    self.backing.addAttribute(.backgroundColor, value: MarkdownColors.highlightBackground, range: contentRange)
}
```

**Step 2: Add rounded background drawing in MarkdownLayoutManager**

Override `drawBackground(forGlyphRange:at:)` to detect `.backgroundColor` matching `highlightBackground` and draw rounded rects instead of sharp default rects. This gives the 3pt rounded corners.

Add method to MarkdownLayoutManager:

```swift
override func drawBackground(forGlyphRange glyphsToShow: NSRange, at origin: CGPoint) {
    guard let textStorage = textStorage else {
        super.drawBackground(forGlyphRange: glyphsToShow, at: origin)
        return
    }

    let charRange = characterRange(forGlyphRange: glyphsToShow, actualGlyphRange: nil)

    // Collect highlight ranges and draw them with rounded rects
    textStorage.enumerateAttribute(.backgroundColor, in: charRange, options: []) { value, range, _ in
        guard let bgColor = value as? UIColor,
              bgColor == MarkdownColors.highlightBackground else { return }

        let glyphRange = self.glyphRange(forCharacterRange: range, actualCharacterRange: nil)
        enumerateLineFragments(forGlyphRange: glyphRange) { _, usedRect, _, effectiveGlyphRange, _ in
            let intersection = NSIntersectionRange(glyphRange, effectiveGlyphRange)
            guard intersection.length > 0 else { return }
            let rect = self.boundingRect(forGlyphRange: intersection, in: self.textContainers.first!)
            let drawRect = rect.offsetBy(dx: origin.x, dy: origin.y).insetBy(dx: -2, dy: -1)
            let path = UIBezierPath(roundedRect: drawRect, cornerRadius: MarkdownLayout.highlightCornerRadius)
            bgColor.setFill()
            path.fill()
        }
    }

    // Remove highlight backgroundColor before super draws (to avoid double-draw)
    // We handle it manually above, so suppress default sharp-rect drawing
    // by temporarily removing the attribute — or just don't call super for highlights.
    // Safest: call super and let it draw other backgrounds (code inline, etc.)
    super.drawBackground(forGlyphRange: glyphsToShow, at: origin)
}
```

Note: The approach above may double-draw highlights. A cleaner approach: use a custom attribute key (e.g. `.highlightBackground`) instead of `.backgroundColor` for highlights, so the system doesn't draw them. Then only the layout manager draws them with rounded corners.

Better approach — use custom attribute:

In MarkdownTextStorage.swift, add custom key:
```swift
extension NSAttributedString.Key {
    static let highlightBackground = NSAttributedString.Key("md.highlightBackground")
}
```

In applyInlineFormatting, use the custom key:
```swift
self.backing.addAttribute(.highlightBackground, value: MarkdownColors.highlightBackground, range: contentRange)
```

In MarkdownLayoutManager, draw it in `drawGlyphs` (after super call), scanning for `.highlightBackground` attribute and drawing rounded rects. No need to override `drawBackground`.

**Step 3: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownTextStorage.swift multi-repo-ios/Components/MarkdownEditor/MarkdownLayoutManager.swift
git -C multi-repo-ios commit -m "feat(editor): add ==highlight== parsing and rounded background rendering"
```

---

### Task 3: Highlighted Text — Toolbar Integration

**Files:**
- Modify: `Components/MarkdownEditor/MarkdownKeyboardToolbar.swift`
- Modify: `Components/MarkdownEditor/MarkdownSelectionToolbar.swift`
- Modify: `Components/MarkdownEditor/AppMarkdownEditor.swift`

**Step 1: Add `.highlight` case to MarkdownToolbarAction enum**

In MarkdownKeyboardToolbar.swift (~line 13):
```swift
case highlight
```

**Step 2: Add highlight button to keyboard toolbar**

In the buttons array, add after `.strikethrough` and before `.inlineCode` (~line 67):
```swift
ButtonSpec(icon: "highlighter", label: "Highlight", action: .highlight, dividerAfter: false),
```

**Step 3: Add highlight button to selection toolbar**

In MarkdownSelectionToolbar.swift buttons array, add after `.strikethrough` and before `.inlineCode`:
```swift
ButtonSpec(icon: "highlighter", label: "Highlight", action: .highlight, dividerAfter: false),
```

**Step 4: Add highlight handler in Coordinator.handleToolbarAction**

In AppMarkdownEditor.swift Coordinator, add case in switch (~line 556):
```swift
case .highlight:
    toggleWrap(textView: textView, prefix: "==", suffix: "==")
```

**Step 5: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownKeyboardToolbar.swift multi-repo-ios/Components/MarkdownEditor/MarkdownSelectionToolbar.swift multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift
git -C multi-repo-ios commit -m "feat(editor): add highlight button to toolbars"
```

---

### Task 4: Code Block Container Rendering

**Files:**
- Modify: `Components/MarkdownEditor/MarkdownLayoutManager.swift`

**Step 1: Draw full-width code block container**

In `drawGlyphs(forGlyphRange:at:)`, after the table group flushing and before the per-block switch, collect consecutive code block lines (codeFenceOpen, codeBlock, codeFenceClose) and draw a single rounded background rect behind them.

Add a code block group collector similar to tableGroup:

```swift
var codeBlockGroup: [NSRange] = []

// Inside the loop, accumulate code blocks
case .codeFenceOpen, .codeBlock, .codeFenceClose:
    codeBlockGroup.append(lineRange)
    continue
default:
    if !codeBlockGroup.isEmpty {
        drawCodeBlockContainer(ranges: codeBlockGroup, origin: origin, container: container)
        codeBlockGroup.removeAll()
    }
```

Then implement `drawCodeBlockContainer`:

```swift
private func drawCodeBlockContainer(ranges: [NSRange], origin: CGPoint, container: NSTextContainer) {
    guard let first = ranges.first, let last = ranges.last else { return }

    let firstGlyph = glyphIndexForCharacter(at: first.location)
    let lastGlyph = glyphIndexForCharacter(at: last.location)
    let firstRect = lineFragmentRect(forGlyphAt: firstGlyph, effectiveRange: nil)
    let lastRect = lineFragmentRect(forGlyphAt: lastGlyph, effectiveRange: nil)

    let containerRect = CGRect(
        x: origin.x,
        y: origin.y + firstRect.minY - MarkdownLayout.codeBlockPadding,
        width: container.size.width,
        height: (lastRect.maxY - firstRect.minY) + MarkdownLayout.codeBlockPadding * 2
    )

    let path = UIBezierPath(roundedRect: containerRect, cornerRadius: MarkdownLayout.codeBlockCornerRadius)
    MarkdownColors.codeBackground.setFill()
    path.fill()
}
```

**Important:** This must be drawn BEFORE `super.drawGlyphs` so text renders on top of the background. Restructure the method:
1. First pass: collect code block groups and table groups from lineBlocks
2. Draw code block containers (background)
3. Call `super.drawGlyphs` (renders text)
4. Second pass: draw overlays (bullets, checkboxes, HR, blockquote bars, table grids)

**Step 2: Remove per-line `.backgroundColor` from code blocks in MarkdownTextStorage**

Since the layout manager now draws the container, remove the `.backgroundColor: MarkdownColors.codeBackground` from the `codeFenceOpen`, `codeBlock`, and `codeFenceClose` cases in `applyBlockStyle`. Keep the font and text color attributes.

**Step 3: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownLayoutManager.swift multi-repo-ios/Components/MarkdownEditor/MarkdownTextStorage.swift
git -C multi-repo-ios commit -m "feat(editor): render code blocks as full-width rounded containers"
```

---

### Task 5: Code Picker in Toolbar

**Files:**
- Modify: `Components/MarkdownEditor/MarkdownKeyboardToolbar.swift`
- Modify: `Components/MarkdownEditor/MarkdownSelectionToolbar.swift`
- Modify: `Components/MarkdownEditor/AppMarkdownEditor.swift`

**Step 1: Add `.codePicker` action to MarkdownToolbarAction**

```swift
case codePicker
```

**Step 2: Replace code button in keyboard toolbar**

Change the existing `.inlineCode` button to `.codePicker`:
```swift
ButtonSpec(icon: "chevron.left.forwardslash.chevron.right", label: "Code", action: .codePicker, dividerAfter: true),
```

Remove the `.codeBlock` button from the Block elements group (it's now in the picker).

**Step 3: Replace code button in selection toolbar**

Same change — `.inlineCode` → `.codePicker`.

**Step 4: Add code picker handler in Coordinator**

Add method `showCodePicker(in:storage:)` similar to `showHeadingPicker`:

```swift
case .codePicker:
    showCodePicker(in: textView, storage: storage)
    return

// ...

private func showCodePicker(in textView: UITextView, storage: MarkdownTextStorage) {
    guard let viewController = textView.window?.rootViewController?.presentedViewController
            ?? textView.window?.rootViewController else { return }

    let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)

    alert.addAction(UIAlertAction(title: "Inline Code", style: .default) { [weak self] _ in
        self?.toggleWrap(textView: textView, prefix: "`", suffix: "`")
        DispatchQueue.main.async {
            self?.parent.text = textView.textStorage.string
            self?.updatePlaceholder(textView)
        }
    })

    alert.addAction(UIAlertAction(title: "Code Block", style: .default) { [weak self] _ in
        let range = textView.selectedRange
        let insertion = "```\n\n```"
        storage.replaceCharacters(in: range, with: insertion)
        textView.selectedRange = NSRange(location: range.location + 4, length: 0)
        DispatchQueue.main.async {
            self?.parent.text = textView.textStorage.string
            self?.updatePlaceholder(textView)
        }
    })

    alert.addAction(UIAlertAction(title: "Cancel", style: .cancel))

    if let popover = alert.popoverPresentationController {
        popover.sourceView = textView
        let caretRect = textView.caretRect(for: textView.selectedTextRange?.start ?? textView.beginningOfDocument)
        popover.sourceRect = caretRect
    }

    viewController.present(alert, animated: true)
}
```

**Step 5: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownKeyboardToolbar.swift multi-repo-ios/Components/MarkdownEditor/MarkdownSelectionToolbar.swift multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift
git -C multi-repo-ios commit -m "feat(editor): replace code button with inline/block picker"
```

---

### Task 6: Image Store & Attachment

**Files:**
- Create: `Components/MarkdownEditor/MarkdownImageStore.swift`
- Create: `Components/MarkdownEditor/MarkdownImageAttachment.swift`

**Step 1: Create MarkdownImageStore**

```swift
// MarkdownImageStore.swift
// Stores images referenced by the markdown editor.
// Images are keyed by UUID; the editor text contains NSTextAttachments
// that reference these UUIDs.

import UIKit

struct ImageEntry {
    let id: UUID
    var originalImage: UIImage
    var croppedImage: UIImage?
    var altText: String

    var displayImage: UIImage { croppedImage ?? originalImage }
}

class MarkdownImageStore {
    private(set) var images: [UUID: ImageEntry] = [:]

    @discardableResult
    func addImage(_ image: UIImage, altText: String = "") -> UUID {
        let id = UUID()
        images[id] = ImageEntry(id: id, originalImage: image, croppedImage: nil, altText: altText)
        return id
    }

    func image(for id: UUID) -> ImageEntry? {
        images[id]
    }

    func updateCroppedImage(_ cropped: UIImage, for id: UUID) {
        images[id]?.croppedImage = cropped
    }

    func removeImage(for id: UUID) {
        images.removeValue(forKey: id)
    }
}
```

**Step 2: Create MarkdownImageAttachment**

```swift
// MarkdownImageAttachment.swift
// Custom NSTextAttachment that renders an image thumbnail
// inline in the markdown editor text view.

import UIKit
import SwiftUI

class MarkdownImageAttachment: NSTextAttachment {
    let imageID: UUID
    private weak var imageStore: MarkdownImageStore?
    private var cachedImage: UIImage?
    private var maxWidth: CGFloat

    init(imageID: UUID, imageStore: MarkdownImageStore, maxWidth: CGFloat) {
        self.imageID = imageID
        self.imageStore = imageStore
        self.maxWidth = maxWidth
        super.init(data: nil, ofType: nil)
        updateBounds()
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) not supported")
    }

    func updateBounds() {
        guard let entry = imageStore?.image(for: imageID) else { return }
        let img = entry.displayImage
        let aspectRatio = img.size.width / img.size.height
        let displayWidth = min(maxWidth, img.size.width)
        let displayHeight = displayWidth / aspectRatio
        bounds = CGRect(x: 0, y: 0, width: displayWidth, height: displayHeight)
    }

    override func image(forBounds imageBounds: CGRect, textContainer: NSTextContainer?, characterIndex charIndex: Int) -> UIImage? {
        guard let entry = imageStore?.image(for: imageID) else { return nil }
        let img = entry.displayImage

        let renderer = UIGraphicsImageRenderer(size: imageBounds.size)
        return renderer.image { ctx in
            let rect = CGRect(origin: .zero, size: imageBounds.size)
            let path = UIBezierPath(roundedRect: rect, cornerRadius: 8)
            path.addClip()
            img.draw(in: rect)

            // 1px border
            let borderColor = UIColor(Color.borderMuted)
            borderColor.setStroke()
            let borderPath = UIBezierPath(roundedRect: rect.insetBy(dx: 0.5, dy: 0.5), cornerRadius: 8)
            borderPath.lineWidth = 1
            borderPath.stroke()
        }
    }
}
```

**Step 3: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownImageStore.swift multi-repo-ios/Components/MarkdownEditor/MarkdownImageAttachment.swift
git -C multi-repo-ios commit -m "feat(editor): add image store and custom text attachment"
```

---

### Task 7: Image Insertion from Toolbar

**Files:**
- Modify: `Components/MarkdownEditor/MarkdownKeyboardToolbar.swift`
- Modify: `Components/MarkdownEditor/MarkdownSelectionToolbar.swift`
- Modify: `Components/MarkdownEditor/AppMarkdownEditor.swift`

**Step 1: Add `.imagePicker` action to MarkdownToolbarAction**

```swift
case imagePicker
```

**Step 2: Add image button to keyboard toolbar**

In the Rich elements group (Group 5), add before `.table`:
```swift
ButtonSpec(icon: "photo.on.rectangle.angled", label: "Image", action: .imagePicker, dividerAfter: false),
```

**Step 3: Add imageStore to Coordinator**

In Coordinator properties:
```swift
let imageStore = MarkdownImageStore()
```

**Step 4: Add image picker handler in Coordinator**

Handle `.imagePicker` action — show action sheet with 4 options (Camera, Photos, Files, URL). Each option presents the appropriate picker. On image selection, create `MarkdownImageAttachment` and insert into text storage.

The Coordinator needs to conform to `UIImagePickerControllerDelegate`, `PHPickerViewControllerDelegate`, and `UIDocumentPickerDelegate`.

Key implementation points:
- Camera: `UIImagePickerController(sourceType: .camera)`
- Photos: `PHPickerViewController` with `PHPickerConfiguration` (selectionLimit: 1, filter: .images)
- Files: `UIDocumentPickerViewController(forOpeningContentTypes: [.image])`
- URL: `UIAlertController` with text field, then `URLSession.shared.data(from:)` to download

After getting the image:
```swift
func insertImage(_ image: UIImage, in textView: UITextView) {
    let maxWidth = textView.bounds.width - textView.textContainerInset.left - textView.textContainerInset.right - 10
    let id = imageStore.addImage(image)
    let attachment = MarkdownImageAttachment(imageID: id, imageStore: imageStore, maxWidth: maxWidth)
    let attrString = NSAttributedString(attachment: attachment)

    guard let storage = textStorage else { return }
    let insertionPoint = textView.selectedRange.location
    storage.replaceCharacters(in: NSRange(location: insertionPoint, length: 0), with: "\n")
    storage.insert(attrString, at: insertionPoint + 1)
    storage.replaceCharacters(in: NSRange(location: insertionPoint + 2, length: 0), with: "\n")
    textView.selectedRange = NSRange(location: insertionPoint + 3, length: 0)

    parent.text = textView.textStorage.string
    updatePlaceholder(textView)
}
```

**Step 5: Add tap-on-image gesture**

In the existing `handleCheckboxTap` method (or a new tap gesture), detect taps on `MarkdownImageAttachment` by checking the attributes at the tapped character index for `NSTextAttachment`. If found and it's a `MarkdownImageAttachment`, present the fullscreen viewer.

**Step 6: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownKeyboardToolbar.swift multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift
git -C multi-repo-ios commit -m "feat(editor): add image insertion from camera, photos, files, URL"
```

---

### Task 8: Fullscreen Image Viewer

**Files:**
- Create: `Components/MarkdownEditor/MarkdownImageViewer.swift`

**Step 1: Create MarkdownImageViewer**

SwiftUI view presented as `.fullScreenCover`. Features:
- Black background, status bar hidden
- `UIScrollView` wrapper with `UIImageView` for pinch-to-zoom
- Double-tap gesture (toggle 1x ↔ 2x zoom)
- Drag-to-dismiss (interactive, vertical pan gesture)
- Top overlay bar: Close (X) button left, Crop button right
- All button styling via design tokens

```swift
// MarkdownImageViewer.swift
// Fullscreen image viewer with pinch-to-zoom, double-tap zoom,
// swipe-to-dismiss, and crop access.

import SwiftUI

struct MarkdownImageViewer: View {
    let imageEntry: ImageEntry
    let imageStore: MarkdownImageStore
    let onCropComplete: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var showCrop = false

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ZoomableImageView(image: imageEntry.displayImage)

            // Top bar
            VStack {
                HStack {
                    Button { dismiss() } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(.ultraThinMaterial.opacity(0.5))
                            .clipShape(Circle())
                    }

                    Spacer()

                    Button { showCrop = true } label: {
                        Image(systemName: "crop")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(.ultraThinMaterial.opacity(0.5))
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)

                Spacer()
            }
        }
        .statusBarHidden()
        .fullScreenCover(isPresented: $showCrop) {
            MarkdownImageCropView(
                image: imageEntry.originalImage,
                onCrop: { cropped in
                    imageStore.updateCroppedImage(cropped, for: imageEntry.id)
                    onCropComplete(cropped)
                    showCrop = false
                },
                onCancel: { showCrop = false }
            )
        }
    }
}

// UIKit-backed zoomable image view
struct ZoomableImageView: UIViewRepresentable {
    let image: UIImage

    func makeUIView(context: Context) -> UIScrollView {
        let scrollView = UIScrollView()
        scrollView.delegate = context.coordinator
        scrollView.minimumZoomScale = 1
        scrollView.maximumZoomScale = 5
        scrollView.showsVerticalScrollIndicator = false
        scrollView.showsHorizontalScrollIndicator = false
        scrollView.backgroundColor = .clear

        let imageView = UIImageView(image: image)
        imageView.contentMode = .scaleAspectFit
        imageView.tag = 100
        scrollView.addSubview(imageView)

        // Double-tap to toggle zoom
        let doubleTap = UITapGestureRecognizer(target: context.coordinator, action: #selector(Coordinator.handleDoubleTap(_:)))
        doubleTap.numberOfTapsRequired = 2
        scrollView.addGestureRecognizer(doubleTap)

        context.coordinator.scrollView = scrollView
        return scrollView
    }

    func updateUIView(_ scrollView: UIScrollView, context: Context) {
        guard let imageView = scrollView.viewWithTag(100) as? UIImageView else { return }
        imageView.frame = CGRect(origin: .zero, size: scrollView.bounds.size)
    }

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, UIScrollViewDelegate {
        weak var scrollView: UIScrollView?

        func viewForZooming(in scrollView: UIScrollView) -> UIView? {
            scrollView.viewWithTag(100)
        }

        @objc func handleDoubleTap(_ gesture: UITapGestureRecognizer) {
            guard let scrollView else { return }
            if scrollView.zoomScale > 1 {
                scrollView.setZoomScale(1, animated: true)
            } else {
                let point = gesture.location(in: scrollView.viewWithTag(100))
                let zoomRect = CGRect(x: point.x - 50, y: point.y - 50, width: 100, height: 100)
                scrollView.zoom(to: zoomRect, animated: true)
            }
        }
    }
}
```

**Step 2: Wire up viewer presentation from Coordinator**

When image attachment is tapped, present `MarkdownImageViewer` as a `.fullScreenCover` from the hosting SwiftUI view. This requires passing image tap events up through the UIViewRepresentable.

Add a callback `onImageTap: ((UUID) -> Void)?` to `MarkdownEditorRepresentable` and a `@State var viewingImageID: UUID?` to `AppMarkdownEditor`.

**Step 3: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownImageViewer.swift multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift
git -C multi-repo-ios commit -m "feat(editor): add fullscreen image viewer with pinch-to-zoom"
```

---

### Task 9: Image Crop View

**Files:**
- Create: `Components/MarkdownEditor/MarkdownImageCropView.swift`

**Step 1: Create MarkdownImageCropView**

SwiftUI view with UIKit-backed crop interaction:
- Image displayed centered on black background
- Crop overlay: dimmed area (black @ 0.5) outside crop rect, clear inside
- Draggable corner handles (4 corners) + edge handles (4 edges)
- Handle color: `Color.surfacesBrandInteractive`
- Grid lines: rule of thirds (white @ 0.3 opacity), 2 horizontal + 2 vertical
- Bottom toolbar: aspect ratio buttons (Free, 1:1, 4:3, 16:9)
- Top bar: Cancel (left), Done (right)
- On Done: crop the UIImage to the selected rect, call onCrop callback

Key implementation: Use a `GeometryReader` to get available space. Track crop rect as `@State var cropRect: CGRect`. Corner handles are draggable circles. Constrain crop rect within image bounds. Apply aspect ratio lock when a preset is selected.

```swift
// MarkdownImageCropView.swift
// Custom image crop view with drag handles, aspect ratios, and rule-of-thirds grid.

import SwiftUI
```

The full implementation involves:
- `CropOverlayView` — draws dimmed overlay + grid + handles
- `DragHandle` — small circles at corners/edges, each with a `DragGesture`
- Aspect ratio enforcement on drag
- `cropImage()` — uses `CGImage.cropping(to:)` mapped from view coords to image coords

**Step 2: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownImageCropView.swift
git -C multi-repo-ios commit -m "feat(editor): add custom image crop view with aspect ratios"
```

---

### Task 10: Bear-Style Visual Table — Model & View

**Files:**
- Create: `Components/MarkdownEditor/MarkdownTableModel.swift`
- Create: `Components/MarkdownEditor/MarkdownTableView.swift`

**Step 1: Create MarkdownTableModel**

```swift
// MarkdownTableModel.swift
// Data model for a visual table in the markdown editor.

import Foundation

enum ColumnAlignment {
    case left, center, right
}

class MarkdownTableModel: ObservableObject {
    @Published var cells: [[String]]  // rows × columns
    @Published var alignments: [ColumnAlignment]

    var rowCount: Int { cells.count }
    var columnCount: Int { cells.first?.count ?? 0 }
    var hasHeader: Bool { rowCount > 0 }

    init(cells: [[String]], alignments: [ColumnAlignment]? = nil) {
        self.cells = cells
        self.alignments = alignments ?? Array(repeating: .left, count: cells.first?.count ?? 0)
    }

    // MARK: - Mutations
    func addRow(at index: Int? = nil) { ... }
    func addColumn(at index: Int? = nil) { ... }
    func deleteRow(at index: Int) { ... }
    func deleteColumn(at index: Int) { ... }
    func moveRow(from: Int, to: Int) { ... }
    func moveColumn(from: Int, to: Int) { ... }

    // MARK: - Markdown Export
    func toMarkdown() -> String {
        guard !cells.isEmpty else { return "" }
        var lines: [String] = []

        // Header row
        let header = "| " + cells[0].joined(separator: " | ") + " |"
        lines.append(header)

        // Separator row with alignment
        let sep = "| " + alignments.map { alignment -> String in
            switch alignment {
            case .left: return "---"
            case .center: return ":---:"
            case .right: return "---:"
            }
        }.joined(separator: " | ") + " |"
        lines.append(sep)

        // Data rows
        for row in cells.dropFirst() {
            lines.append("| " + row.joined(separator: " | ") + " |")
        }

        return lines.joined(separator: "\n")
    }

    // MARK: - Parse from Markdown
    static func fromMarkdown(_ text: String) -> MarkdownTableModel? { ... }
}
```

**Step 2: Create MarkdownTableView**

A UIView that uses UICollectionView with compositional layout to render an editable grid. Each cell contains a UITextField. The view is overlaid on top of the text view at the table's position.

Key features:
- `UICollectionViewCompositionalLayout` with grid sections
- Cells are `UICollectionViewCell` subclasses with `UITextField`
- Header row gets bold font + background color
- Three-dot button on long-press opens `UIMenu` context menu
- Tab/Enter key forwarding between cells
- Sizing: auto-calculate column widths (equal or content-based)
- All colors from design tokens

**Step 3: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownTableModel.swift multi-repo-ios/Components/MarkdownEditor/MarkdownTableView.swift
git -C multi-repo-ios commit -m "feat(editor): add visual table model and collection view"
```

---

### Task 11: Table Integration with Editor

**Files:**
- Modify: `Components/MarkdownEditor/AppMarkdownEditor.swift`
- Modify: `Components/MarkdownEditor/MarkdownTextStorage.swift`
- Modify: `Components/MarkdownEditor/MarkdownLayoutManager.swift`

**Step 1: Replace pipe-syntax table rendering with placeholder**

When a table is detected in lineBlocks, instead of rendering pipe text, insert a table placeholder (custom NSTextAttachment or reserved vertical space) and overlay `MarkdownTableView` at that position.

The Coordinator maintains a dictionary `[NSRange: MarkdownTableView]` mapping text ranges to table overlays. On each `processEditing`, re-detect table ranges, create/update/remove overlays.

**Step 2: Wire table insertion from toolbar**

Modify the `.table` action handler to create a `MarkdownTableModel` with default 3 columns and insert the visual table.

**Step 3: Wire table context menu**

The three-dot menu actions (Add Row, Add Column, Delete Row/Column, Move, Copy As, Align) call methods on `MarkdownTableModel`, which triggers re-render of `MarkdownTableView`.

**Step 4: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/
git -C multi-repo-ios commit -m "feat(editor): integrate visual table overlay with editor"
```

---

### Task 12: Markdown Export (Share Button)

**Files:**
- Create: `Components/MarkdownEditor/MarkdownExporter.swift`
- Modify: `Components/MarkdownEditor/MarkdownKeyboardToolbar.swift`
- Modify: `Components/MarkdownEditor/AppMarkdownEditor.swift`

**Step 1: Create MarkdownExporter**

```swift
// MarkdownExporter.swift
// Serializes the editor's attributed string + table models + image store
// back to raw markdown text.

import UIKit

struct MarkdownExporter {

    static func export(
        storage: MarkdownTextStorage,
        tableModels: [NSRange: MarkdownTableModel],
        imageStore: MarkdownImageStore
    ) -> String {
        // Walk through lineBlocks and reconstruct markdown:
        // - Headings → "# ", "## ", etc.
        // - Bold → "**text**", Italic → "*text*"
        // - Highlight → "==text=="
        // - Lists → "- ", "1. ", "- [ ] "
        // - Blockquotes → "> "
        // - Code blocks → "```\n...\n```"
        // - Tables → tableModel.toMarkdown()
        // - Images → "![alt](image-uuid.jpg)"
        // - HR → "---"
        // Since the backing store IS raw markdown (just with hidden syntax chars),
        // the simplest approach: return storage.string directly.
        // The text storage already holds the raw markdown —
        // hidden characters are still in the string, just invisible visually.
        return storage.string
    }
}
```

Note: Since MarkdownTextStorage stores raw markdown text with syntax characters (they're just hidden visually), the export for most elements is simply `storage.string`. The exception is visual tables (which replaced the pipe syntax) — those need `tableModel.toMarkdown()` substituted at the table ranges. And image attachments need `![alt](uuid.jpg)` substituted.

**Step 2: Add `.share` action to toolbar**

Add to MarkdownToolbarAction:
```swift
case share
```

Add button to keyboard toolbar (in the Rich group):
```swift
ButtonSpec(icon: "square.and.arrow.up", label: "Share", action: .share, dividerAfter: false),
```

**Step 3: Handle share action in Coordinator**

```swift
case .share:
    let markdown = MarkdownExporter.export(storage: storage, tableModels: tableModels, imageStore: imageStore)
    let activityVC = UIActivityViewController(activityItems: [markdown], applicationActivities: nil)
    if let popover = activityVC.popoverPresentationController {
        popover.sourceView = textView
    }
    viewController.present(activityVC, animated: true)
```

**Step 4: Commit**

```bash
git -C multi-repo-ios add multi-repo-ios/Components/MarkdownEditor/MarkdownExporter.swift multi-repo-ios/Components/MarkdownEditor/MarkdownKeyboardToolbar.swift multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift
git -C multi-repo-ios commit -m "feat(editor): add markdown export via share button"
```

---

### Task 13: Final Integration & Testing

**Step 1: Build the project**

```bash
cd multi-repo-ios && xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 17' build 2>&1 | tail -20
```

Fix any compilation errors.

**Step 2: Manual test checklist**

- [ ] Type `==hello==` → yellow rounded background appears
- [ ] Type `==**bold highlight**==` → bold text with yellow background
- [ ] Tap highlight button with text selected → wraps with `==`
- [ ] Code block (```) renders as full-width rounded container
- [ ] Code picker shows Inline Code / Code Block options
- [ ] Tap image button → shows Camera/Photos/Files/URL options
- [ ] Insert image → renders inline with rounded corners and border
- [ ] Tap image → opens fullscreen viewer (black bg, pinch-to-zoom)
- [ ] Double-tap in viewer → toggles zoom
- [ ] Tap crop → opens crop view with handles
- [ ] Select aspect ratio → crop rect locks to ratio
- [ ] Done crop → image updates in editor
- [ ] Insert table → visual grid appears
- [ ] Tap cell to edit → blue highlight, keyboard
- [ ] Tab navigates between cells
- [ ] Three-dot menu → Add/Delete/Move row/column
- [ ] Share button → exports raw markdown

**Step 3: Final commit**

```bash
git -C multi-repo-ios add -A && git -C multi-repo-ios commit -m "feat(editor): complete markdown editor enhancements — highlights, code blocks, images, tables, export"
```

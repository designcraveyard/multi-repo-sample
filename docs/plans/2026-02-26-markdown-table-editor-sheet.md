# Markdown Table Editor Sheet — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken inline `MarkdownTableView` overlay with a read-only card + dedicated full-screen sheet editor that only writes to storage on Done/Delete.

**Architecture:** The embedded card (`MarkdownTableCardView`) is a read-only UIView overlay positioned over invisible table text — tap it to open the sheet. All editing happens exclusively in `MarkdownTableEditorView` (SwiftUI full-screen sheet). Storage is only touched on Done (write final markdown) or Delete (remove range). No live sync.

**Tech Stack:** SwiftUI + UIKit, NSTextStorage, NSLayoutManager, UICollectionView, Combine, design tokens from MarkdownStyling.swift + DesignTokens.swift

---

## Task 1: Add `hasHeader` and `copy()` to MarkdownTableModel

**Files:**
- Modify: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownTableModel.swift`

**Step 1: Add `hasHeader` published property and `copy()` method**

In `MarkdownTableModel`, add after `var columnCount`:

```swift
/// Whether the first row is styled as a header. Visual only — does not change
/// the exported markdown structure (GFM always requires a header + separator).
@Published var hasHeader: Bool = true
```

Update `init` to accept `hasHeader`:

```swift
init(cells: [[String]], alignments: [ColumnAlignment]? = nil, hasHeader: Bool = true) {
    self.cells = cells
    self.alignments = alignments ?? Array(repeating: .left, count: cells.first?.count ?? 0)
    self.hasHeader = hasHeader
}
```

Add `copy()` after `moveColumn`:

```swift
/// Returns a deep copy — used so the sheet editor can be cancelled without
/// affecting the original model.
func copy() -> MarkdownTableModel {
    MarkdownTableModel(cells: cells.map { $0 }, alignments: alignments, hasHeader: hasHeader)
}
```

**Step 2: Verify `makeDefault()` and `fromMarkdown()` still compile**

No changes needed — `hasHeader` defaults to `true`.

**Step 3: Commit**

```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/MarkdownTableModel.swift
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "feat(table): add hasHeader + copy() to MarkdownTableModel"
```

---

## Task 2: MarkdownTableCardView (Read-Only Embedded Card)

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownTableCardView.swift`

**Step 1: Create the file**

```swift
// MarkdownTableCardView.swift
// Read-only visual grid card rendered inline in the markdown text view.
// Positioned over invisible table pipe-syntax text. Tap opens the editor sheet.

import UIKit
import SwiftUI

// MARK: - MarkdownTableCardView

class MarkdownTableCardView: UIView {

    // MARK: - Callbacks

    var onTap: (() -> Void)?
    var onDelete: (() -> Void)?

    // MARK: - Properties

    private let model: MarkdownTableModel
    private let scrollView = UIScrollView()
    private let rowStack = UIStackView()
    private let deleteButton = UIButton(type: .system)
    private let maxDisplayHeight: CGFloat = 200
    private let rowHeight: CGFloat = 36
    private let cellHPad: CGFloat = 8

    // Design tokens
    private let borderColor   = UIColor(Color.borderDefault)
    private let headerBG      = UIColor(Color.surfacesBaseLowContrast)
    private let bodyBG        = UIColor(Color.surfacesBasePrimary)
    private let textColor     = MarkdownColors.text
    private let dividerColor  = UIColor(Color.borderMuted)
    private let cornerRadius: CGFloat = 8

    // MARK: - Init

    init(model: MarkdownTableModel) {
        self.model = model
        super.init(frame: .zero)
        setupShell()
        buildRows()
        setupDeleteButton()
        setupTap()
    }

    required init?(coder: NSCoder) { fatalError() }

    // MARK: - Setup

    private func setupShell() {
        backgroundColor = bodyBG
        layer.cornerRadius = cornerRadius
        layer.borderWidth = 1
        layer.borderColor = borderColor.cgColor
        clipsToBounds = true

        scrollView.isScrollEnabled = true
        scrollView.showsHorizontalScrollIndicator = false
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        addSubview(scrollView)

        rowStack.axis = .vertical
        rowStack.spacing = 0
        rowStack.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(rowStack)

        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: bottomAnchor),

            rowStack.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            rowStack.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor),
            rowStack.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor),
            rowStack.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor),
            rowStack.widthAnchor.constraint(equalTo: scrollView.frameLayoutGuide.widthAnchor),
        ])
    }

    private func buildRows() {
        rowStack.arrangedSubviews.forEach { $0.removeFromSuperview() }
        for (rowIdx, row) in model.cells.enumerated() {
            let isHeader = rowIdx == 0 && model.hasHeader
            rowStack.addArrangedSubview(makeRowView(cells: row, isHeader: isHeader, rowIdx: rowIdx))
        }
    }

    private func makeRowView(cells: [String], isHeader: Bool, rowIdx: Int) -> UIView {
        let container = UIView()
        container.backgroundColor = isHeader ? headerBG : .clear
        container.translatesAutoresizingMaskIntoConstraints = false
        container.heightAnchor.constraint(equalToConstant: rowHeight).isActive = true

        // Bottom border
        let border = UIView()
        border.backgroundColor = dividerColor
        border.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(border)
        NSLayoutConstraint.activate([
            border.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            border.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            border.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            border.heightAnchor.constraint(equalToConstant: 0.5),
        ])

        guard !cells.isEmpty else { return container }

        var prevAnchor = container.leadingAnchor
        for (colIdx, text) in cells.enumerated() {
            let label = UILabel()
            label.text = text
            label.font = isHeader
                ? UIFont.systemFont(ofSize: MarkdownFonts.body.pointSize, weight: .semibold)
                : MarkdownFonts.body
            label.textColor = textColor
            label.lineBreakMode = .byTruncatingTail
            label.numberOfLines = 1
            label.translatesAutoresizingMaskIntoConstraints = false
            container.addSubview(label)

            NSLayoutConstraint.activate([
                label.topAnchor.constraint(equalTo: container.topAnchor),
                label.bottomAnchor.constraint(equalTo: border.topAnchor),
                label.leadingAnchor.constraint(equalTo: prevAnchor, constant: cellHPad),
            ])

            // Equal-width columns via width multiplier
            if colIdx == cells.count - 1 {
                label.trailingAnchor.constraint(
                    equalTo: container.trailingAnchor, constant: -cellHPad
                ).isActive = true
            } else {
                // Vertical cell divider
                let divider = UIView()
                divider.backgroundColor = dividerColor
                divider.translatesAutoresizingMaskIntoConstraints = false
                container.addSubview(divider)

                let cellWidth = 1.0 / CGFloat(cells.count)
                label.widthAnchor.constraint(
                    equalTo: container.widthAnchor, multiplier: cellWidth,
                    constant: -(cellHPad * 2)
                ).isActive = true

                NSLayoutConstraint.activate([
                    divider.widthAnchor.constraint(equalToConstant: 0.5),
                    divider.topAnchor.constraint(equalTo: container.topAnchor),
                    divider.bottomAnchor.constraint(equalTo: border.topAnchor),
                    divider.leadingAnchor.constraint(
                        equalTo: label.trailingAnchor, constant: cellHPad
                    ),
                ])
                prevAnchor = divider.trailingAnchor
            }
        }
        return container
    }

    private func setupDeleteButton() {
        var config = UIButton.Configuration.filled()
        config.image = UIImage(systemName: "trash", withConfiguration:
            UIImage.SymbolConfiguration(pointSize: 11, weight: .medium))
        config.baseForegroundColor = .systemRed
        config.baseBackgroundColor = UIColor.systemBackground.withAlphaComponent(0.85)
        config.cornerStyle = .capsule
        config.contentInsets = NSDirectionalEdgeInsets(top: 5, leading: 7, bottom: 5, trailing: 7)
        deleteButton.configuration = config
        deleteButton.translatesAutoresizingMaskIntoConstraints = false
        deleteButton.addTarget(self, action: #selector(deleteTapped), for: .touchUpInside)
        addSubview(deleteButton)

        NSLayoutConstraint.activate([
            deleteButton.topAnchor.constraint(equalTo: topAnchor, constant: 6),
            deleteButton.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -6),
        ])
    }

    private func setupTap() {
        let tap = UITapGestureRecognizer(target: self, action: #selector(cardTapped))
        addGestureRecognizer(tap)
    }

    // MARK: - Actions

    @objc private func cardTapped() { onTap?() }
    @objc private func deleteTapped() { onDelete?() }

    // MARK: - Refresh

    /// Call after the underlying model data changes to rebuild rows.
    func refresh() {
        buildRows()
    }

    // MARK: - Intrinsic Size

    override var intrinsicContentSize: CGSize {
        let contentHeight = CGFloat(model.rowCount) * rowHeight
        return CGSize(width: UIView.noIntrinsicMetric, height: min(contentHeight, maxDisplayHeight))
    }
}
```

**Step 2: Build succeeds — run:**
```bash
cd /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | grep -E "error:|warning:|BUILD"
```
Expected: `BUILD SUCCEEDED` (or only pre-existing warnings).

**Step 3: Commit**
```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/MarkdownTableCardView.swift
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "feat(table): add read-only MarkdownTableCardView"
```

---

## Task 3: MarkdownTableActionBar (SwiftUI Floating Bar)

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownTableActionBar.swift`

**Step 1: Create the file**

```swift
// MarkdownTableActionBar.swift
// Floating pill action bar for the dedicated table editor sheet.
// Provides structural operations: add/delete row+column, alignment, header toggle.

import SwiftUI

// MARK: - MarkdownTableActionBar

struct MarkdownTableActionBar: View {

    // MARK: - Inputs

    @ObservedObject var model: MarkdownTableModel
    var focusedColumn: Int?

    // MARK: - Body

    var body: some View {
        HStack(spacing: 2) {
            // --- Structural ---
            barButton(icon: "arrow.down.to.line", label: "Add Row") {
                model.addRow()
            }
            barButton(icon: "arrow.right.to.line", label: "Add Col") {
                model.addColumn()
            }
            barButton(icon: "minus", label: "Del Row",
                      disabled: model.rowCount <= 1) {
                model.deleteRow(at: model.rowCount - 1)
            }
            barButton(icon: "minus.square", label: "Del Col",
                      disabled: model.columnCount <= 1) {
                model.deleteColumn(at: model.columnCount - 1)
            }

            Divider()
                .frame(height: 20)
                .padding(.horizontal, 4)

            // --- Alignment ---
            Menu {
                Button {
                    applyAlignment(.left)
                } label: { Label("Align Left", systemImage: "text.alignleft") }
                Button {
                    applyAlignment(.center)
                } label: { Label("Align Center", systemImage: "text.aligncenter") }
                Button {
                    applyAlignment(.right)
                } label: { Label("Align Right", systemImage: "text.alignright") }
            } label: {
                Label("Align", systemImage: "text.alignleft")
                    .labelStyle(.iconOnly)
                    .frame(width: 32, height: 32)
                    .foregroundStyle(Color(MarkdownColors.text))
            }

            Divider()
                .frame(height: 20)
                .padding(.horizontal, 4)

            // --- Header Toggle ---
            Toggle(isOn: Binding(
                get: { model.hasHeader },
                set: { model.hasHeader = $0 }
            )) {
                Label("Header", systemImage: model.hasHeader ? "tablecells.fill" : "tablecells")
                    .labelStyle(.iconOnly)
            }
            .toggleStyle(.button)
            .tint(Color(MarkdownColors.link))
            .frame(width: 32, height: 32)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(.ultraThinMaterial)
        .clipShape(Capsule())
        .shadow(color: .black.opacity(0.08), radius: 8, x: 0, y: 2)
    }

    // MARK: - Helpers

    private func applyAlignment(_ alignment: ColumnAlignment) {
        let col = focusedColumn ?? 0
        model.setAlignment(alignment, forColumn: col)
    }

    @ViewBuilder
    private func barButton(
        icon: String,
        label: String,
        disabled: Bool = false,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 14, weight: .medium))
                .frame(width: 32, height: 32)
                .foregroundStyle(disabled
                    ? Color(MarkdownColors.text).opacity(0.3)
                    : Color(MarkdownColors.text))
        }
        .disabled(disabled)
    }
}
```

**Step 2: Build check**
```bash
cd /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | grep -E "error:|BUILD"
```

**Step 3: Commit**
```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/MarkdownTableActionBar.swift
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "feat(table): add MarkdownTableActionBar"
```

---

## Task 4: MarkdownTableEditorView (Full-Screen Sheet)

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownTableEditorView.swift`

This file contains two types: `TableEditorSession` (the identifiable wrapper used as the `.fullScreenCover` item) and `MarkdownTableEditorView` (the sheet itself with an embedded UICollectionView grid).

**Step 1: Create the file**

```swift
// MarkdownTableEditorView.swift
// Full-screen sheet for editing a markdown table.
// Contains an editable UICollectionView grid + floating MarkdownTableActionBar.
// Writes back to the markdown storage ONLY when the user taps Done.

import SwiftUI
import UIKit
import Combine

// MARK: - TableEditorSession

/// Identifiable wrapper passed to .fullScreenCover(item:).
struct TableEditorSession: Identifiable {
    let id = UUID()
    /// Working copy — edits here don't touch the storage until Done.
    let model: MarkdownTableModel
    /// Location in storage to replace on Done. nil = new table, insert at cursorPosition.
    let groupRange: NSRange?
    /// Cursor character offset — used when groupRange is nil (new insert).
    let cursorPosition: Int
}

// MARK: - MarkdownTableEditorView

struct MarkdownTableEditorView: View {

    // MARK: - Inputs

    let session: TableEditorSession
    let onCancel: () -> Void
    let onDone: (MarkdownTableModel) -> Void

    // MARK: - State

    @State private var focusedColumn: Int? = nil

    // MARK: - Body

    var body: some View {
        NavigationStack {
            MarkdownTableEditorGrid(
                model: session.model,
                onFocusedColumnChanged: { col in focusedColumn = col }
            )
            .ignoresSafeArea(.keyboard)
            .safeAreaInset(edge: .bottom, spacing: 0) {
                VStack(spacing: 0) {
                    Spacer(minLength: 0)
                    HStack {
                        Spacer()
                        MarkdownTableActionBar(
                            model: session.model,
                            focusedColumn: focusedColumn
                        )
                        Spacer()
                    }
                    .padding(.bottom, 16)
                }
                .background(Color.clear)
            }
            .navigationTitle("Table")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: onCancel) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 17, weight: .semibold))
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") { onDone(session.model) }
                        .fontWeight(.semibold)
                        .foregroundStyle(Color(MarkdownColors.link))
                }
            }
        }
    }
}

// MARK: - MarkdownTableEditorGrid (UIViewRepresentable)

struct MarkdownTableEditorGrid: UIViewRepresentable {

    @ObservedObject var model: MarkdownTableModel
    var onFocusedColumnChanged: ((Int?) -> Void)?

    func makeCoordinator() -> Coordinator {
        Coordinator(model: model, onFocusedColumnChanged: onFocusedColumnChanged)
    }

    func makeUIView(context: Context) -> UICollectionView {
        let cv = UICollectionView(frame: .zero,
                                  collectionViewLayout: context.coordinator.createLayout(for: model))
        cv.backgroundColor = UIColor(Color.surfacesBasePrimary)
        cv.dataSource = context.coordinator
        cv.delegate = context.coordinator
        cv.register(EditorCellView.self, forCellWithReuseIdentifier: EditorCellView.reuseID)
        cv.keyboardDismissMode = .interactive
        context.coordinator.collectionView = cv
        return cv
    }

    func updateUIView(_ cv: UICollectionView, context: Context) {
        // Layout changes (column count) require a full layout rebuild.
        let coord = context.coordinator
        if coord.lastColumnCount != model.columnCount {
            coord.lastColumnCount = model.columnCount
            cv.collectionViewLayout = coord.createLayout(for: model)
            cv.reloadData()
        }
    }

    // MARK: - Coordinator

    class Coordinator: NSObject, UICollectionViewDataSource, UICollectionViewDelegate {
        let model: MarkdownTableModel
        var onFocusedColumnChanged: ((Int?) -> Void)?
        weak var collectionView: UICollectionView?

        private var focusedIndexPath: IndexPath?
        private var suppressReload = false
        var lastColumnCount: Int = 0
        private var cancellables = Set<AnyCancellable>()

        // Design tokens
        private let headerBG   = UIColor(Color.surfacesBaseLowContrast)
        private let selectColor = UIColor(Color.surfacesBrandInteractive).withAlphaComponent(0.12)
        private let borderColor = UIColor(Color.borderDefault)
        private let headerFont  = UIFont.systemFont(
            ofSize: MarkdownFonts.body.pointSize, weight: .semibold)
        private let bodyFont    = MarkdownFonts.body

        init(model: MarkdownTableModel,
             onFocusedColumnChanged: ((Int?) -> Void)?) {
            self.model = model
            self.lastColumnCount = model.columnCount
            self.onFocusedColumnChanged = onFocusedColumnChanged
            super.init()
            observeModel()
        }

        private func observeModel() {
            model.$cells
                .receive(on: RunLoop.main)
                .sink { [weak self] _ in
                    guard let self, !self.suppressReload else { return }
                    self.collectionView?.collectionViewLayout =
                        self.createLayout(for: self.model)
                    self.collectionView?.reloadData()
                }
                .store(in: &cancellables)
        }

        // MARK: - Layout

        func createLayout(for model: MarkdownTableModel) -> UICollectionViewLayout {
            UICollectionViewCompositionalLayout { [weak self] _, environment in
                guard let self else { return nil }
                let colCount = model.columnCount
                guard colCount > 0 else { return nil }

                // Use fractional width when columns fit, or fixed 110pt for wide tables.
                let availableWidth = environment.container.effectiveContentSize.width
                let minColWidth: CGFloat = 110
                let useFixed = CGFloat(colCount) * minColWidth > availableWidth

                let itemWidth: NSCollectionLayoutDimension = useFixed
                    ? .absolute(minColWidth)
                    : .fractionalWidth(1.0 / CGFloat(colCount))

                let item = NSCollectionLayoutItem(
                    layoutSize: .init(widthDimension: itemWidth,
                                      heightDimension: .absolute(44)))
                let groupWidth: NSCollectionLayoutDimension = useFixed
                    ? .absolute(minColWidth * CGFloat(colCount))
                    : .fractionalWidth(1.0)
                let group = NSCollectionLayoutGroup.horizontal(
                    layoutSize: .init(widthDimension: groupWidth,
                                      heightDimension: .absolute(44)),
                    repeatingSubitem: item,
                    count: colCount)
                return NSCollectionLayoutSection(group: group)
            }
        }

        // MARK: - DataSource

        func collectionView(_ cv: UICollectionView,
                            numberOfItemsInSection section: Int) -> Int {
            model.rowCount * model.columnCount
        }

        func collectionView(_ cv: UICollectionView,
                            cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
            let cell = cv.dequeueReusableCell(
                withReuseIdentifier: EditorCellView.reuseID,
                for: indexPath) as! EditorCellView
            let row = indexPath.item / model.columnCount
            let col = indexPath.item % model.columnCount
            let isHeader = row == 0 && model.hasHeader
            let isFocused = indexPath == focusedIndexPath

            cell.configure(
                text: model.cells[row][col],
                isHeader: isHeader,
                isFocused: isFocused,
                font: isHeader ? headerFont : bodyFont,
                headerBG: headerBG,
                selectionColor: selectColor,
                borderColor: borderColor,
                alignment: model.alignments[col])

            cell.onTextChanged = { [weak self] newText in
                guard let self,
                      row < self.model.cells.count,
                      col < self.model.cells[row].count else { return }
                self.suppressReload = true
                self.model.cells[row][col] = newText
                self.suppressReload = false
            }

            cell.onReturn = { [weak self] in
                self?.moveFocus(from: indexPath, down: true)
            }

            cell.onTab = { [weak self] in
                self?.moveFocus(from: indexPath, forward: true)
            }

            return cell
        }

        // MARK: - Delegate

        func collectionView(_ cv: UICollectionView,
                            didSelectItemAt indexPath: IndexPath) {
            focusedIndexPath = indexPath
            cv.reloadData()
            let col = indexPath.item % model.columnCount
            onFocusedColumnChanged?(col)
            DispatchQueue.main.async {
                (cv.cellForItem(at: indexPath) as? EditorCellView)?.focusTextField()
            }
        }

        // MARK: - Focus Navigation

        private func moveFocus(from ip: IndexPath, forward: Bool = false, down: Bool = false) {
            let row = ip.item / model.columnCount
            let col = ip.item % model.columnCount
            var newRow = row
            var newCol = col

            if forward {
                newCol += 1
                if newCol >= model.columnCount { newCol = 0; newRow += 1 }
            }
            if down {
                newRow += 1
                if newRow >= model.rowCount { model.addRow() }
            }

            guard newRow < model.rowCount, newCol < model.columnCount else { return }
            let newIP = IndexPath(item: newRow * model.columnCount + newCol, section: 0)
            focusedIndexPath = newIP
            let col = newIP.item % model.columnCount
            onFocusedColumnChanged?(col)

            // Structural change (addRow) needs a full reload; text-only moves don't.
            let needsReload = down && newRow == model.rowCount - 1 && newRow == row + 1
            if needsReload {
                collectionView?.reloadData()
            } else {
                collectionView?.reloadData()
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.05) { [weak self] in
                guard let cv = self?.collectionView else { return }
                (cv.cellForItem(at: newIP) as? EditorCellView)?.focusTextField()
            }
        }
    }
}

// MARK: - EditorCellView

private class EditorCellView: UICollectionViewCell, UITextFieldDelegate {

    static let reuseID = "EditorCellView"

    private let textField = UITextField()
    var onTextChanged: ((String) -> Void)?
    var onReturn: (() -> Void)?
    var onTab: (() -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        textField.borderStyle = .none
        textField.textColor = MarkdownColors.text
        textField.backgroundColor = .clear
        textField.returnKeyType = .next
        textField.translatesAutoresizingMaskIntoConstraints = false
        textField.delegate = self
        textField.addTarget(self, action: #selector(textChanged), for: .editingChanged)
        contentView.addSubview(textField)

        NSLayoutConstraint.activate([
            textField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 8),
            textField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -8),
            textField.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
        ])

        // Right and bottom borders
        for (isBottom) in [true, false] {
            let line = UIView()
            line.backgroundColor = UIColor(Color.borderDefault)
            line.translatesAutoresizingMaskIntoConstraints = false
            contentView.addSubview(line)
            if isBottom {
                NSLayoutConstraint.activate([
                    line.heightAnchor.constraint(equalToConstant: 0.5),
                    line.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
                    line.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
                    line.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
                ])
            } else {
                NSLayoutConstraint.activate([
                    line.widthAnchor.constraint(equalToConstant: 0.5),
                    line.topAnchor.constraint(equalTo: contentView.topAnchor),
                    line.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
                    line.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
                ])
            }
        }
    }

    required init?(coder: NSCoder) { fatalError() }

    func configure(
        text: String,
        isHeader: Bool,
        isFocused: Bool,
        font: UIFont,
        headerBG: UIColor,
        selectionColor: UIColor,
        borderColor: UIColor,
        alignment: ColumnAlignment
    ) {
        textField.text = text
        textField.font = font
        contentView.backgroundColor = isFocused ? selectionColor : (isHeader ? headerBG : .clear)
        textField.textAlignment = alignment == .center ? .center : alignment == .right ? .right : .left
    }

    func focusTextField() { textField.becomeFirstResponder() }

    @objc private func textChanged() { onTextChanged?(textField.text ?? "") }

    // MARK: - UITextFieldDelegate

    func textFieldShouldReturn(_ textField: UITextField) -> Bool {
        onReturn?()
        return false
    }
}
```

**Step 2: Build check**
```bash
cd /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | grep -E "error:|BUILD"
```

**Step 3: Commit**
```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/MarkdownTableEditorView.swift
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "feat(table): add MarkdownTableEditorView + EditorCellView"
```

---

## Task 5: Wire AppMarkdownEditor — Replace Overlays + Add Sheet

This is the largest task. Read `AppMarkdownEditor.swift` in full before starting.

**Files:**
- Modify: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift`

### 5a — Add sheet state to AppMarkdownEditor (SwiftUI struct)

In `AppMarkdownEditor`, add alongside the existing `@State` properties:

```swift
@State private var tableEditorSession: TableEditorSession?
```

### 5b — Add `onTableTap` + `onTableDelete` callbacks to MarkdownEditorRepresentable

After `var onImageTap`:
```swift
var onTableTap: ((MarkdownTableModel, NSRange) -> Void)?
var onTableDelete: ((NSRange) -> Void)?
```

### 5c — Wire `.fullScreenCover` for the table sheet

In `chromeWrapped`, after the existing `.fullScreenCover(item: $viewingImageEntry)`:

```swift
.fullScreenCover(item: $tableEditorSession) { session in
    MarkdownTableEditorView(
        session: session,
        onCancel: {
            tableEditorSession = nil
        },
        onDone: { editedModel in
            // Written back in updateUIView via coordinator
            tableEditorSession = nil
            // Signal coordinator to commit
        }
    )
}
```

**Note:** Because the coordinator lives inside `MarkdownEditorRepresentable`, the cleanest commit path is to give AppMarkdownEditor a callback that the coordinator sets up. Use a closure stored in an `@State` wrapper. See 5d for the pattern.

**Revised approach — use a `@State var onTableDone` closure:**

```swift
@State private var tableEditorSession: TableEditorSession?
@State private var pendingTableCommit: ((MarkdownTableModel) -> Void)?
```

`pendingTableCommit` is set by the coordinator via a new `onTableCommitReady` callback on `MarkdownEditorRepresentable`. Then:

```swift
.fullScreenCover(item: $tableEditorSession) { session in
    MarkdownTableEditorView(
        session: session,
        onCancel: { tableEditorSession = nil },
        onDone: { editedModel in
            pendingTableCommit?(editedModel)
            tableEditorSession = nil
        }
    )
}
```

Add to both `chromeWrapped` and `bareEditor`.

### 5d — Add coordinator callbacks for table operations

In `MarkdownEditorRepresentable`:
```swift
var onTableTap: ((MarkdownTableModel, NSRange) -> Void)?
var onTableDelete: ((NSRange) -> Void)?
var onTableCommitReady: (( (MarkdownTableModel) -> Void ) -> Void)?
```

In `makeUIView`, after setting up the text view:
```swift
// Give AppMarkdownEditor a handle to the commit closure
parent.onTableCommitReady?({ [weak context.coordinator] model in
    context.coordinator?.commitTableEdit(model: model)
})
```

### 5e — Replace `updateTableOverlays` in Coordinator

**Remove** the old `updateTableOverlays` implementation entirely.

**Remove** from Coordinator:
- `private var tableOverlays: [(groupRange: NSRange, view: MarkdownTableView, model: MarkdownTableModel)]`
- `private var isUpdatingFromOverlay = false`
- `syncTableToStorage(model:groupRange:)`
- All `isUpdatingFromOverlay` guards

**Add** new properties:
```swift
// Table card overlays (read-only)
private var tableCardOverlays: [(groupRange: NSRange, card: MarkdownTableCardView)] = []
// Stored for commitTableEdit
private var pendingGroupRange: NSRange? = nil
```

**New `updateTableOverlays`:**

```swift
func updateTableOverlays() {
    guard let textView = textView,
          let storage = textStorage else { return }

    let layoutManager = textView.layoutManager
    let container = textView.textContainer
    let inset = textView.textContainerInset
    let groups = storage.tableGroups()
    let storageLength = storage.length

    var newOverlays: [(groupRange: NSRange, card: MarkdownTableCardView)] = []

    for group in groups {
        guard NSMaxRange(group) <= storageLength else { continue }

        let rowEntries = storage.lineBlocks.filter { entry in
            if case .tableRow = entry.block,
               NSIntersectionRange(group, entry.range).length > 0 { return true }
            return false
        }
        guard !rowEntries.isEmpty else { continue }

        let firstCharLoc = rowEntries.first!.range.location
        let lastCharLoc  = rowEntries.last!.range.location
        guard firstCharLoc < storageLength, lastCharLoc < storageLength else { continue }

        let firstGlyph = layoutManager.glyphIndexForCharacter(at: firstCharLoc)
        let lastGlyph  = layoutManager.glyphIndexForCharacter(at: lastCharLoc)
        let firstRect  = layoutManager.lineFragmentRect(forGlyphAt: firstGlyph, effectiveRange: nil)
        let lastRect   = layoutManager.lineFragmentRect(forGlyphAt: lastGlyph,  effectiveRange: nil)

        let cardRect = CGRect(
            x: inset.left,
            y: inset.top + firstRect.minY,
            width: container.size.width,
            height: lastRect.maxY - firstRect.minY
        )

        let groupText = (storage.string as NSString).substring(with: group)

        if let existing = tableCardOverlays.first(where: {
            NSIntersectionRange($0.groupRange, group).length > 0
        }) {
            existing.card.frame = cardRect
            existing.card.refresh()
            newOverlays.append((group, existing.card))
            tableCardOverlays.removeAll { $0.card === existing.card }
        } else {
            guard let model = MarkdownTableModel.fromMarkdown(groupText) else { continue }
            let card = MarkdownTableCardView(model: model)
            card.frame = cardRect

            card.onTap = { [weak self] in
                guard let self else { return }
                let copy = model.copy()
                self.parent.onTableTap?(copy, group)
            }

            card.onDelete = { [weak self] in
                guard let self,
                      let storage = self.textStorage,
                      NSMaxRange(group) <= storage.length else { return }
                storage.replaceCharacters(in: group, with: "")
                self.parent.text = storage.string
                DispatchQueue.main.async { self.updateTableOverlays() }
            }

            textView.addSubview(card)
            newOverlays.append((group, card))
        }
    }

    // Remove stale cards
    for stale in tableCardOverlays { stale.card.removeFromSuperview() }
    tableCardOverlays = newOverlays
}
```

### 5f — Add `commitTableEdit` to Coordinator

```swift
func commitTableEdit(model: MarkdownTableModel, groupRange: NSRange?, cursorPosition: Int) {
    guard let textView = textView,
          let storage = textStorage else { return }

    let newMarkdown = model.toMarkdown() + "\n"

    if let groupRange = groupRange {
        // Edit existing: replace the group range
        guard groupRange.location <= storage.length else { return }
        let safeLength = min(groupRange.length, storage.length - groupRange.location)
        guard safeLength >= 0 else { return }
        storage.replaceCharacters(in: NSRange(location: groupRange.location, length: safeLength),
                                  with: newMarkdown)
    } else {
        // New insert: insert at cursor position
        let insertPoint = min(cursorPosition, storage.length)
        // Add a leading newline if not at start of line
        let nsString = storage.string as NSString
        let prefix = insertPoint > 0 && nsString.character(at: insertPoint - 1) != 0x0A ? "\n" : ""
        storage.replaceCharacters(
            in: NSRange(location: insertPoint, length: 0),
            with: prefix + newMarkdown)
    }

    parent.text = storage.string
    DispatchQueue.main.async { [weak self] in self?.updateTableOverlays() }
}
```

### 5g — Wire the toolbar `.table` action to open the sheet (not insert directly)

Find the `case .table:` in `handleToolbarAction`. Replace:

```swift
// OLD:
case .table:
    let table = "| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n|  |  |  |"
    storage.replaceCharacters(in: range, with: table)
    textView.selectedRange = NSRange(location: range.location + table.count, length: 0)
    DispatchQueue.main.async { [weak self] in
        self?.updateTableOverlays()
    }
```

```swift
// NEW:
case .table:
    let cursorPos = textView.selectedRange.location
    let defaultModel = MarkdownTableModel.makeDefault()
    parent.onTableTap?(defaultModel, nil)  // nil groupRange = new insert
    // Store cursor position for commit — AppMarkdownEditor sets tableEditorSession
    // with cursorPosition = cursorPos when onTableTap fires with groupRange nil
```

**Wait** — `onTableTap` is used both for tapping an existing card AND for new inserts. Rename the callback for clarity:

```swift
// In MarkdownEditorRepresentable:
var onOpenTableEditor: ((MarkdownTableModel, NSRange?, Int) -> Void)?
//                         model, groupRange (nil=new), cursorPos
```

Update card tap and toolbar to use `onOpenTableEditor`.

In `AppMarkdownEditor`, wire `onOpenTableEditor`:

```swift
onOpenTableEditor: { model, groupRange, cursorPos in
    tableEditorSession = TableEditorSession(
        model: model,
        groupRange: groupRange,
        cursorPosition: cursorPos
    )
}
```

And `pendingTableCommit` is set up in `makeUIView` or as part of `onOpenTableEditor` setup:

```swift
// In AppMarkdownEditor chromeWrapped / bareEditor, pass to MarkdownEditorRepresentable:
pendingTableCommit: { commit in
    // Store for use by onDone
    self.pendingTableCommit = commit
}
```

**Simplified final wiring** (replacing the pendingTableCommit indirection):

Since `MarkdownEditorRepresentable` is a struct, the coordinator is stable across re-renders. Store `commitTableEdit` closure directly in Coordinator and access it via the `updateUIView` path. The cleanest approach:

In `AppMarkdownEditor`:
```swift
@State private var tableEditorSession: TableEditorSession?
```

Pass `onOpenTableEditor` to `MarkdownEditorRepresentable`. On Done in the sheet, call coordinator's `commitTableEdit` through a stored reference. The Coordinator is accessible via the `MarkdownEditorRepresentable`'s `Coordinator` type — but SwiftUI doesn't expose it directly from AppMarkdownEditor.

**Final clean solution:** Use a shared `@StateObject` commit relay:

```swift
// In AppMarkdownEditor
final class TableCommitRelay: ObservableObject {
    var commit: ((MarkdownTableModel, NSRange?, Int) -> Void)?
}
@StateObject private var tableRelay = TableCommitRelay()
```

Pass `tableRelay` into `MarkdownEditorRepresentable`. Coordinator sets `tableRelay.commit`. Sheet's `onDone` calls `tableRelay.commit?(model, session.groupRange, session.cursorPosition)`.

**Step 1: Add `TableCommitRelay` at the top of AppMarkdownEditor.swift (before the struct)**

```swift
/// Bridges the SwiftUI table-editor sheet's Done action back to the UIKit coordinator.
final class TableCommitRelay: ObservableObject {
    var commit: ((MarkdownTableModel, NSRange?, Int) -> Void)?
}
```

**Step 2: Add state to AppMarkdownEditor**
```swift
@StateObject private var tableRelay = TableCommitRelay()
@State private var tableEditorSession: TableEditorSession?
```

**Step 3: Pass relay into MarkdownEditorRepresentable**
```swift
// In MarkdownEditorRepresentable properties:
var tableRelay: TableCommitRelay
var onOpenTableEditor: ((MarkdownTableModel, NSRange?, Int) -> Void)?
```

**Step 4: In `makeUIView`, set relay.commit**
```swift
context.coordinator.tableCommitRelay = tableRelay
tableRelay.commit = { [weak coordinator = context.coordinator] model, range, cursor in
    coordinator?.commitTableEdit(model: model, groupRange: range, cursorPosition: cursor)
}
```

**Step 5: Wire `.fullScreenCover` in both `chromeWrapped` and `bareEditor`**
```swift
.fullScreenCover(item: $tableEditorSession) { session in
    MarkdownTableEditorView(
        session: session,
        onCancel: { tableEditorSession = nil },
        onDone: { editedModel in
            tableRelay.commit?(editedModel, session.groupRange, session.cursorPosition)
            tableEditorSession = nil
        }
    )
}
```

**Step 6: Build and verify**
```bash
cd /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | grep -E "error:|BUILD"
```

**Step 7: Commit**
```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "feat(table): wire sheet editor — read-only cards + Done/Delete only sync"
```

---

## Task 6: Retire MarkdownTableView.swift

**Files:**
- Modify: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownTableView.swift`

The old `MarkdownTableView` is no longer referenced after Task 5. Rather than deleting the file (which requires Xcode project file changes), empty it to a tombstone comment:

**Step 1: Replace the entire file content with:**

```swift
// MarkdownTableView.swift
// RETIRED — replaced by MarkdownTableCardView (read-only) + MarkdownTableEditorView (sheet).
// This file is intentionally empty. The type is no longer used.
```

**Step 2: Build check — ensure no references remain**
```bash
cd /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios
grep -r "MarkdownTableView" . --include="*.swift" | grep -v "MarkdownTableView.swift"
```
Expected: no output (zero remaining references).

**Step 3: Commit**
```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/MarkdownTableView.swift
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "chore(table): retire MarkdownTableView — replaced by card+sheet"
```

---

## Task 7: Remove Dead Code from AppMarkdownEditor + MarkdownInputProcessor

**Files:**
- Modify: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/AppMarkdownEditor.swift`
- Modify: `multi-repo-ios/multi-repo-ios/Components/MarkdownEditor/MarkdownInputProcessor.swift`

**Step 1: In AppMarkdownEditor.swift, delete (now dead after Task 5):**
- Any remaining `isUpdatingFromOverlay` property or guard
- Any remaining `syncTableToStorage` method
- Any `onModelChanged` references
- The old `tableOverlays` array property
- The table-insert string in `.table` case (replaced by sheet open call)

**Step 2: In MarkdownInputProcessor.swift, find table-related Enter key handling**

The input processor currently intercepts Enter inside table rows to add rows. Since table rows are now invisible (the card overlays them) and editing happens only in the sheet, this logic should be removed or made a no-op. Find and remove the `tableRow` Enter handling:

```swift
// Remove any block like:
if case .tableRow = block {
    // insert new row via processor
}
```

**Step 3: Build + grep for leftover references**
```bash
cd /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 16' \
  build 2>&1 | grep -E "error:|BUILD"

grep -r "isUpdatingFromOverlay\|syncTableToStorage\|onModelChanged" . --include="*.swift"
```
Expected: BUILD SUCCEEDED, zero grep matches.

**Step 4: Commit**
```bash
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  add multi-repo-ios/Components/MarkdownEditor/
git -C /Users/abhishekverma/Documents/multi-repo-sample/multi-repo-ios \
  commit -m "chore(table): remove dead live-sync code and table row input intercept"
```

---

## Final Smoke Test Checklist

Before declaring done, manually verify in Simulator (iPhone 16):

- [ ] Tap table button → sheet opens immediately with blank 3×2 table
- [ ] Type in cells — full text entry works (no 1-char limit)
- [ ] Return key moves to next row; adds new row when at last row
- [ ] Add Row / Add Column buttons work in action bar
- [ ] Delete Row / Delete Column disabled correctly when 1 row / 1 col
- [ ] Header toggle changes row 0 styling in the grid
- [ ] Align menu applies to focused column (visible in grid)
- [ ] Done → table card appears in editor at cursor position
- [ ] Table card shows correct columns and header styling
- [ ] Table card scrolls vertically when rows exceed 200pt height
- [ ] Tap table card → sheet reopens with pre-filled data
- [ ] Edit + Done → card refreshes with new data
- [ ] Delete button on card → table removed from editor
- [ ] Cancel on new insert → no table inserted, editor unchanged
- [ ] Export (share button) → .md file contains valid pipe-syntax table
- [ ] Table text in storage is invisible (card overlaps it completely)

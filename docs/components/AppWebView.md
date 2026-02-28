# AppWebView

**Web:** _N/A -- mobile only_
**iOS:** `multi-repo-ios/multi-repo-ios/Components/Native/AppWebView.swift`
**Android:** _N/A -- not implemented_

---

## Overview

A reusable web view wrapper for embedding web content within the native app. iOS wraps `WKWebView` via `UIViewRepresentable` with JavaScript enabled by default, loading state tracking, optional pull-to-refresh, and error callbacks. Android does not currently have an `AppWebView` wrapper in the native components directory.

---

## Props

### iOS (`AppWebView`)
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `URL` | required | The URL to load in the web view |
| `isLoading` | `Binding<Bool>` | `.constant(false)` | Reflects whether the web view is currently loading content |
| `allowsRefresh` | `Bool` | `false` | Enables pull-to-refresh on the web view's scroll view |
| `onError` | `((Error) -> Void)?` | `nil` | Optional callback invoked when a navigation error occurs |

---

## Platform Notes

| Platform | Native API Wrapped |
|----------|-------------------|
| Web | _N/A_ |
| iOS | `WKWebView` via `UIViewRepresentable` with `WKNavigationDelegate` Coordinator |
| Android | _Not implemented_ |

**iOS implementation details:**
- JavaScript is enabled via `WKWebViewConfiguration.defaultWebpagePreferences.allowsContentJavaScript = true`
- Web view is transparent (`isOpaque = false`, `backgroundColor = .clear`)
- URL changes are detected in `updateUIView` and trigger a reload
- `NSAllowsLocalNetworking` is enabled in `Info.plist` for local HTTP URLs
- Navigation delegate tracks `didStartProvisionalNavigation`, `didFinish`, `didFail`, and `didFailProvisionalNavigation` for loading state and errors

---

## Usage Examples

### iOS
```swift
// Basic
AppWebView(url: URL(string: "https://example.com")!)

// With loading state
@State private var isLoading = true
AppWebView(url: myURL, isLoading: $isLoading)

// With pull-to-refresh and error handler
AppWebView(
    url: myURL,
    isLoading: $isLoading,
    allowsRefresh: true
) { error in
    print("WebView error: \(error)")
}
```

---

## Accessibility

- **iOS:** `WKWebView` provides VoiceOver support for web content natively; the web page's own ARIA attributes and semantic HTML are respected by VoiceOver.

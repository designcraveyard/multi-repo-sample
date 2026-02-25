---
name: chatkit-setup
description: Interactive wizard to configure OpenAI ChatKit integration across all three platforms. Use when setting up a new ChatKit workflow, changing the workflow ID, updating the WebView URL, or reconfiguring the assistant feature.
user_invocable: true
---

# ChatKit Setup Wizard

Interactive wizard that configures the OpenAI ChatKit integration across web, iOS, and Android.

## When to Use

- First-time ChatKit setup
- Changing the OpenAI workflow ID
- Updating the deployed WebView URL (e.g. switching from localhost to Vercel)
- Reconfiguring ChatKit theme or composer options

## Steps

### Step 1: Gather Configuration

Ask the user for:

1. **OpenAI API key** — Verify it exists in:
   - `multi-repo-nextjs/.env.local` as `OPENAI_API_KEY`
   - If missing, guide user to add it

2. **Workflow ID** — The `wf_...` ID from OpenAI Agents platform
   - Current value is in `chatkit.config.json` at workspace root

3. **Deployment URL** — Where the web app is deployed (for WebView loading)
   - For local dev: `http://192.168.1.6:3000/assistant-embed` (use machine's LAN IP, not localhost)
   - For production: `https://<domain>/assistant-embed` or a standalone Vercel URL
   - Or a standalone deployed URL (e.g. `https://my-agent.vercel.app/`)

4. **File uploads** — Enable/disable file attachment in the ChatKit composer
   - Requires `chatkit_configuration.file_upload.enabled: true` in the session creation API route

### Step 2: Update Files

Update these files with the gathered values:

| File | What to Update |
|------|---------------|
| `chatkit.config.json` | `workflowId`, `deployment.localUrl` or `deployment.vercelDomain` |
| `multi-repo-nextjs/app/api/chatkit/session/route.ts` | `WORKFLOW_ID` constant, `chatkit_configuration.file_upload.enabled` |
| `multi-repo-ios/multi-repo-ios/Views/AssistantView.swift` | `assistantURL` constant |
| `multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/feature/assistant/AssistantScreen.kt` | `url` parameter |

### Step 3: Verify

1. If web: run `npm run build` in `multi-repo-nextjs/` to verify no type errors
2. If iOS: run `xcodebuild build` to verify Swift compiles
3. Remind user to test the Assistant tab on each platform

## Architecture Reference

### Web (Next.js)

- **API route:** `app/api/chatkit/session/route.ts` — creates sessions via `openai.beta.chatkit.sessions.create()`
- **Authenticated page:** `app/(authenticated)/assistant/page.tsx` — cookie auth, full nav
- **Embed page:** `app/assistant-embed/page.tsx` — no auth chrome, for WebView
- **Middleware:** `/assistant-embed` and `/api/chatkit` excluded from auth redirect
- **CDN script:** `https://cdn.platform.openai.com/deployments/chatkit/chatkit.js`
- **React hook:** `useChatKit({ api: { getClientSecret }, composer: { attachments: { enabled } } })`

### iOS

- **WebView wrapper:** `Components/Native/AppWebView.swift` — reusable `WKWebView` via `UIViewRepresentable`
- **Screen:** `Views/AssistantView.swift` — loads the deployment URL in `AppWebView`
- **Tab:** Index 4 ("Assistant") in `ContentView.swift` `AdaptiveNavShell`
- **ATS:** `NSAllowsLocalNetworking` in `Info.plist` for `http://` local dev URLs

### Android

- **WebView wrapper:** `ui/native/AppWebView.kt` — reusable Compose `AndroidView` wrapping `WebView`
- **Screen:** `feature/assistant/AssistantScreen.kt` — loads the deployment URL in `AppWebView` with `Modifier.imePadding()`
- **Tab:** Index 4 ("Assistant") in `MainActivity.kt` `AdaptiveNavShell`
- **Cleartext:** `android:usesCleartextTraffic="true"` in `AndroidManifest.xml` for `http://` dev URLs
- **Keyboard fix:** `Modifier.imePadding()` on WebView + `consumeWindowInsets(innerPadding)` in `AdaptiveNavShell` CompactLayout

## Key Gotchas

- The `user` parameter is **required** in `chatkit.sessions.create()` — omitting it returns a 400 error
- `chatkit_configuration.file_upload.enabled: true` must be set server-side to enable file uploads — client-side `composer.attachments.enabled` alone is not sufficient
- ChatKit `ColorScheme` type is `'light' | 'dark'` only — no `'system'` option
- The ChatKit CDN script must be loaded before the `<ChatKit>` component renders
- iOS `NSAllowsLocalNetworking` only covers local IPs (192.168.x.x etc.) — for arbitrary HTTP domains, use `NSAllowsArbitraryLoads` instead
- **Android WebView keyboard:** With edge-to-edge (`enableEdgeToEdge()`), the Scaffold's `innerPadding` must be consumed via `consumeWindowInsets(innerPadding)` so that `imePadding()` on the WebView doesn't double-count the bottom nav bar height. Do NOT use `adjustResize`/`adjustPan` in manifest or `setDecorFitsSystemWindows` — these conflict with edge-to-edge.

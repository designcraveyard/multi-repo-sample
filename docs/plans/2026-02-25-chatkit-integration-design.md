# ChatKit Integration — Design Plan

## Context

We want to integrate OpenAI-hosted AI assistant workflows into all three apps via ChatKit. Agents are created on the OpenAI Agents platform (out of scope here). The integration layer is:

- **Web (Next.js)**: Native ChatKit React component on a dedicated "Assistant" page
- **iOS (SwiftUI)**: WebView loading the Vercel-hosted ChatKit page
- **Android (Compose)**: WebView loading the Vercel-hosted ChatKit page

Additionally, we need:
- A `chatkit.config.json` config file storing all ChatKit settings
- A Claude skill (`/chatkit-setup`) that interactively populates this config

---

## Architecture

### Dual-Route Strategy

The web app serves ChatKit via **two routes** to handle the different auth mechanisms:

| Route | Auth | Purpose |
|-------|------|---------|
| `app/(authenticated)/assistant/page.tsx` | Cookie (middleware) | Web users on desktop/mobile browser |
| `app/assistant-embed/page.tsx` | Token via URL param | iOS/Android WebView (no cookies) |

Both routes render the same ChatKit component but differ in how they obtain the auth token for the API call.

### API Route: `app/api/chatkit/session/route.ts`

Dual-auth endpoint that creates OpenAI ChatKit sessions:

```
POST /api/chatkit/session
  - If Authorization: Bearer <token> header present → validate Supabase token directly
  - Else → use cookie-based Supabase session (standard web flow)
  - On success → call openai.responses.create() → return { client_secret }
  - On failure → return 401
```

### Middleware Update

Add `/assistant-embed` and `/api/chatkit` to the middleware exclusion list so WebView requests aren't redirected to `/login`:

```typescript
// middleware.ts — update the unauthenticated check:
if (
  !user &&
  !request.nextUrl.pathname.startsWith("/login") &&
  !request.nextUrl.pathname.startsWith("/auth") &&
  !request.nextUrl.pathname.startsWith("/assistant-embed") &&
  !request.nextUrl.pathname.startsWith("/api/chatkit")
) {
```

### WebView Auth Flow (iOS/Android)

```
Native app (authenticated)
  → gets Supabase access token from local session
  → loads WebView: https://<vercel-domain>/assistant-embed?token=<access_token>
  → embed page reads token from URL, passes as Authorization header to /api/chatkit/session
  → API route validates token, returns client_secret
  → ChatKit renders
```

### Config File: `chatkit.config.json` (workspace root)

```json
{
  "agent": {
    "model": "gpt-4.1",
    "instructions": "You are a helpful assistant."
  },
  "theme": {
    "colorScheme": "system",
    "accentColor": "#0066FF",
    "accentLevel": 2,
    "radius": "medium",
    "density": "normal"
  },
  "startScreen": {
    "greeting": "Hi! How can I help?",
    "prompts": []
  },
  "composer": {
    "placeholder": "Ask anything..."
  },
  "deployment": {
    "vercelDomain": ""
  }
}
```

Consumed by the web app via `import config from '@/../chatkit.config.json'` (Next.js supports JSON imports).

---

## Files to Create

### Web (Next.js)

| File | Purpose |
|------|---------|
| `multi-repo-nextjs/app/api/chatkit/session/route.ts` | API route — dual-auth, creates OpenAI sessions |
| `multi-repo-nextjs/app/(authenticated)/assistant/page.tsx` | Web ChatKit page (cookie auth, inside nav shell) |
| `multi-repo-nextjs/app/assistant-embed/page.tsx` | Embed ChatKit page (token auth, no nav chrome, for WebView) |
| `multi-repo-nextjs/app/assistant-embed/layout.tsx` | Minimal layout (no AuthProvider, no nav shell) |
| `chatkit.config.json` | Shared config at workspace root |

### iOS

| File | Purpose |
|------|---------|
| `multi-repo-ios/.../Components/Native/AppWebView.swift` | Generic WKWebView wrapper (reusable) |
| `multi-repo-ios/.../Views/AssistantView.swift` | Assistant screen — loads WebView with token |

### Android

| File | Purpose |
|------|---------|
| `multi-repo-android/.../ui/native/AppWebView.kt` | Generic WebView composable wrapper (reusable) |
| `multi-repo-android/.../feature/assistant/AssistantScreen.kt` | Assistant screen — loads WebView with token |

### Claude Skill

| File | Purpose |
|------|---------|
| `.claude/skills/chatkit-setup/SKILL.md` | Interactive wizard to populate `chatkit.config.json` |

## Files to Modify

| File | Change |
|------|--------|
| `multi-repo-nextjs/middleware.ts` | Exclude `/assistant-embed` and `/api/chatkit` from auth redirect |
| `multi-repo-android/.../MainActivity.kt` | Add 4th "Assistant" tab to `AdaptiveNavShell` |
| `multi-repo-nextjs/package.json` | Add `@openai/chatkit-react` and `openai` dependencies |
| `multi-repo-nextjs/.env.local.example` | Add `OPENAI_API_KEY` placeholder |

### Not Modified Yet (Future)

iOS `ContentView.swift` and web authenticated layout don't use `AdaptiveNavShell` as root navigation yet. The Assistant screen/view will be created and wired when those platforms adopt `AdaptiveNavShell`. For now, iOS can navigate to `AssistantView` from ContentView directly (e.g., via a button or link), and web can be accessed directly at `/assistant`.

---

## Implementation Steps

### Step 1: Config + Dependencies
1. Create `chatkit.config.json` at workspace root
2. `cd multi-repo-nextjs && npm install @openai/chatkit-react openai`
3. Add `OPENAI_API_KEY` to `.env.local` and `.env.local.example`

### Step 2: API Route
1. Create `app/api/chatkit/session/route.ts` with dual-auth logic
2. Read model/instructions from `chatkit.config.json`
3. Use `createServerClient` from `@supabase/ssr` for token validation (same pattern as middleware)

### Step 3: Web ChatKit Pages
1. Create `app/(authenticated)/assistant/page.tsx` — `"use client"`, uses `useChatKit()` hook, calls `/api/chatkit/session` for client secret, applies theme from config
2. Create `app/assistant-embed/page.tsx` — same ChatKit component but reads `?token=` from URL and passes as Authorization header in the session fetch
3. Create `app/assistant-embed/layout.tsx` — bare-minimum layout (no AuthProvider, no nav)

### Step 4: Middleware Update
1. Add `/assistant-embed` and `/api/chatkit` exclusions to the middleware auth check

### Step 5: iOS AppWebView + AssistantView
1. Create `Components/Native/AppWebView.swift` — `UIViewRepresentable` wrapping `WKWebView`, props: `url: URL`, `isLoading: Binding<Bool>`, `onError: ((Error) -> Void)?`
2. Create `Views/AssistantView.swift` — gets token from `SupabaseManager.shared.client.auth.session?.accessToken`, builds URL `https://<domain>/assistant-embed?token=<token>` (token passed as URL query param; the embed page's JS reads it and sends it as `Authorization` header to the API route), renders `AppWebView`
3. Add styling entry in `NativeComponentStyling.swift`

### Step 6: Android AppWebView + AssistantScreen
1. Create `ui/native/AppWebView.kt` — Compose `AndroidView` wrapping `android.webkit.WebView`, props: `url: String`, `modifier: Modifier`, loading/error callbacks
2. Create `feature/assistant/AssistantScreen.kt` — gets token from `authRepository`, builds embed URL, renders `AppWebView`
3. Add 4th `NavTab` in `MainActivity.kt`:
   ```kotlin
   NavTab(label = "Assistant", icon = Icons.Outlined.Chat, selectedIcon = Icons.Filled.Chat),
   ```
   And add `3 -> AssistantScreen()` to the `when` block

### Step 7: Claude Skill (`/chatkit-setup`)
Interactive wizard that asks:
1. OpenAI API key set in `.env.local`? (verify/guide)
2. Model choice (gpt-4.1 / gpt-4.1-mini / gpt-4.1-nano)
3. Agent instructions (free text)
4. Theme accent hex color
5. Start screen greeting
6. Suggested prompts (1-3, or skip)
7. Vercel deployment domain

Then writes `chatkit.config.json`, creates all files, installs deps, and wires navigation.

### Step 8: Documentation
1. Add ChatKit/Assistant section to root `CLAUDE.md`
2. Update `multi-repo-nextjs` and mobile CLAUDE.md files with new routes/screens

---

## Key Existing Code to Reuse

| Utility | File | Usage |
|---------|------|-------|
| `createClient()` (server) | `multi-repo-nextjs/lib/supabase/server.ts` | Cookie-based auth in API route |
| `createServerClient` | `@supabase/ssr` | Token-based auth in API route (same as middleware pattern) |
| `AuthRepository` | `multi-repo-android/.../data/auth/AuthRepository.kt` | Get access token on Android |
| `SupabaseManager.shared.client.auth` | iOS Supabase SDK | Get access token on iOS |
| `AdaptiveNavShell` | All platforms | Tab navigation (Android wired, iOS/web ready) |
| `NativeComponentStyling.swift` | iOS | Styling for AppWebView |
| `NavTab` | `multi-repo-android/.../ui/native/NavTab.kt` | Android tab definition |

---

## Verification

1. **Web (cookie auth)**: Run `npm run dev`, log in, navigate to `/assistant`, verify ChatKit renders and responds
2. **Web (embed)**: Open `/assistant-embed?token=<valid_supabase_token>` directly — verify ChatKit works without cookies
3. **API route**: `curl -X POST http://localhost:3000/api/chatkit/session -H "Authorization: Bearer <token>"` — should return `{ client_secret: "..." }`
4. **Android**: Build with `./gradlew assembleDebug`, verify 4th "Assistant" tab appears, WebView loads and ChatKit renders
5. **iOS**: Build in Xcode, verify AssistantView loads WebView with ChatKit (requires Vercel deployment)
6. **Config**: Modify `chatkit.config.json` theme → rebuild web → verify theme changes propagate
7. **Skill**: Run `/chatkit-setup` → verify it asks all questions and writes valid config

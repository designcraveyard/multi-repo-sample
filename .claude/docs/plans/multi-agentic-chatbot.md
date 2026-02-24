# Multi-Agentic Chatbot — Implementation Plan

## Context

Build a personal AI assistant chatbot with multi-agent handoffs across all 3 platforms (Next.js, SwiftUI, Android Compose). Users chat with a triage agent that seamlessly routes to specialist agents (Web Search, Knowledge Base, Task Manager). Conversations persist in Supabase. The backend lives in Next.js API routes using the OpenAI Agents SDK (`@openai/agents` TypeScript).

## Architecture Overview

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Next.js Web │  │  SwiftUI iOS │  │ Android App  │
│  (React 19)  │  │  (URLSession)│  │ (OkHttp/Ktor)│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────────┬────┴────────────────┘
                    ▼
         POST /api/chat/stream (SSE)
         GET/POST /api/chat/conversations
                    │
                    ▼
        ┌───────────────────────┐
        │   Triage Agent        │  (gpt-4.1)
        │   ┌─────────┐        │
        │   │ handoffs │────────┼──► Web Search Agent (gpt-4.1-mini + OpenAI web_search)
        │   │          │────────┼──► Knowledge Base Agent (gpt-4.1-mini + Supabase FTS)
        │   │          │────────┼──► Task Manager Agent (gpt-4.1-mini + tasks CRUD)
        │   └─────────┘        │
        └───────────────────────┘
                    │
                    ▼
              Supabase (Postgres)
         conversations | messages
         knowledge_base | tasks
```

**Key decisions:**
- **SSE streaming** via `fetch` + `ReadableStream` (not WebSocket) — works natively with Next.js API routes
- **Custom chat UI** on all platforms (not ChatKit) — full control over design tokens and component reuse
- **OpenAI built-in `web_search` tool** for the search agent — no extra API key
- **Supabase Auth** with email/password included in scope

---

## Phase 1: Supabase Schema + Auth

### 1.1 Auth Setup

Install Supabase client packages:
- **Web:** `npm install @supabase/supabase-js @supabase/ssr` in `multi-repo-nextjs/`
- **iOS:** Add `supabase-swift` via SPM
- **Android:** Already has `supabase-kt 3.2.5` in version catalog

Create Supabase clients:
- `multi-repo-nextjs/lib/supabase/client.ts` — browser client (anon key)
- `multi-repo-nextjs/lib/supabase/server.ts` — server client for API routes (reads cookies)
- `multi-repo-nextjs/lib/supabase/admin.ts` — service-role client for agent tools

Create minimal auth pages:
- `multi-repo-nextjs/app/login/page.tsx` — email/password login form
- `multi-repo-nextjs/app/signup/page.tsx` — email/password signup form
- `multi-repo-nextjs/app/api/auth/callback/route.ts` — OAuth callback handler
- iOS: `Views/LoginView.swift` + `ViewModels/AuthViewModel.swift`
- Android: `feature/auth/LoginScreen.kt` + `LoginViewModel.kt`

### 1.2 Database Migrations

**File:** `supabase/migrations/20260224000000_create_chat_tables.sql`

```sql
-- conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content text NOT NULL DEFAULT '',
  agent_name text,
  tool_calls jsonb,
  handoff_from text,
  handoff_to text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- knowledge_base
CREATE TABLE public.knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_conversations_user ON public.conversations(user_id, updated_at DESC);
CREATE INDEX idx_knowledge_search ON public.knowledge_base USING gin(search_vector);
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status);

-- auto-update conversation.updated_at on new message
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON public.messages FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_conversations" ON public.conversations FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_messages" ON public.messages FOR ALL
  USING (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()))
  WITH CHECK (conversation_id IN (SELECT id FROM public.conversations WHERE user_id = auth.uid()));

CREATE POLICY "own_knowledge" ON public.knowledge_base FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own_tasks" ON public.tasks FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

Generate types: `supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts`

---

## Phase 2: Agent Backend (Next.js API Routes)

### 2.1 Install Dependencies

```bash
cd multi-repo-nextjs && npm install @openai/agents zod
```

Note: The SDK requires Zod v4. If v3 is installed, upgrade.

### 2.2 Agent Definitions

**File structure:**
```
multi-repo-nextjs/lib/agents/
  triage.ts              # Triage agent with handoffs
  web-search.ts          # Web search specialist (OpenAI web_search built-in tool)
  knowledge-base.ts      # Knowledge base specialist (Supabase FTS tool)
  task-manager.ts        # Task manager specialist (CRUD tools)
  types.ts               # Shared Zod schemas and types
```

**Triage agent** (`lib/agents/triage.ts`):
- Model: `gpt-4.1`
- Handoffs to 3 specialists with clear routing descriptions
- Handles simple greetings/general questions directly

**Web Search agent** (`lib/agents/web-search.ts`):
- Model: `gpt-4.1-mini`
- Uses OpenAI built-in `web_search` tool (no external API key needed)
- Instructions: cite sources, summarize concisely

**Knowledge Base agent** (`lib/agents/knowledge-base.ts`):
- Model: `gpt-4.1-mini`
- Tools: `query_knowledge_base` (Supabase full-text search), `save_to_knowledge_base` (INSERT)
- Tools receive user_id via agent context for RLS-scoped queries

**Task Manager agent** (`lib/agents/task-manager.ts`):
- Model: `gpt-4.1-mini`
- Tools: `list_tasks`, `create_task`, `update_task`, `delete_task`
- All tool operations scoped to authenticated user_id

### 2.3 API Routes

```
multi-repo-nextjs/app/api/chat/
  stream/route.ts                    # POST — SSE streaming endpoint
  conversations/route.ts             # GET (list) + POST (create)
  conversations/[id]/route.ts        # GET (with messages) + DELETE
  conversations/[id]/messages/route.ts  # GET (paginated)
```

**Streaming endpoint** (`POST /api/chat/stream`):
1. Authenticate user from Supabase JWT (Authorization header or cookie)
2. Load last 50 messages for conversation from Supabase
3. Save user message to `messages` table immediately
4. Convert history to OpenAI `inputItems` format
5. Run triage agent with `run()` (async iterable streaming)
6. Stream SSE events to client:
   - `text_delta` — streamed tokens
   - `agent_change` — handoff occurred (agent name)
   - `tool_start` / `tool_result` — tool invocation
   - `message_complete` — final message saved to DB
   - `done` / `error` — stream termination
7. Save complete assistant message to DB after stream finishes

**SSE event contract:**
```typescript
type SSEEvent =
  | { type: 'text_delta'; delta: string }
  | { type: 'agent_change'; agent_name: string }
  | { type: 'tool_start'; tool_name: string }
  | { type: 'tool_result'; tool_name: string; result: string }
  | { type: 'message_complete'; message_id: string; content: string; agent_name: string }
  | { type: 'done' }
  | { type: 'error'; message: string }
```

---

## Phase 3: Web Chat UI (Next.js)

### 3.1 New Files

```
multi-repo-nextjs/app/chat/
  page.tsx                          # Chat screen with AdaptiveSplitView
  loading.tsx                       # Loading skeleton
  error.tsx                         # Error boundary
app/components/Chat/
  ChatMessageList.tsx               # Scrollable message list (auto-scroll to bottom)
  ChatMessageBubble.tsx             # User/assistant bubble using semantic tokens
  ChatInputBar.tsx                  # InputField + IconButton (PaperPlaneTilt send)
  ChatAgentIndicator.tsx            # Badge showing active agent
  ChatToolResultCard.tsx            # Bordered card for tool results
  ChatConversationList.tsx          # Sidebar list using ListItem pattern
  ChatEmptyState.tsx                # Empty conversation illustration
  ChatStreamingText.tsx             # Progressive text render with cursor
  index.ts                          # Barrel export
app/hooks/
  useChat.ts                        # SSE consumption hook: manages messages, streaming state, active agent
```

### 3.2 Layout

- **Compact (<768px):** Full-screen chat. Conversation list via separate page or bottom sheet.
- **Regular (>=768px):** `AdaptiveSplitView` — left panel (conversation list, 320px), right panel (active chat).
- Chat input bar fixed at bottom with `InputField` (trailing `IconButton` with `Ph.paperPlaneTilt`).
- Add "Chat" tab to `AdaptiveNavShell` in root layout (`Ph.chatCircle` icon).

### 3.3 Message Rendering

- User bubbles: right-aligned, `--surfaces-brand-interactive` bg, `--typography-on-brand-primary` text
- Assistant bubbles: left-aligned, `--surfaces-base-low-contrast` bg, `--typography-primary` text
- Agent change: centered `Badge` divider between messages (brand/accent/success per agent)
- Tool results: bordered card (`--border-muted`) inline within assistant message
- Streaming: append tokens to last message, show blinking `|` cursor

### 3.4 Existing Components to Reuse

| Component | Usage | File |
|-----------|-------|------|
| `InputField` | Chat input bar | [InputField.tsx](multi-repo-nextjs/app/components/InputField/InputField.tsx) |
| `IconButton` | Send button | [IconButton.tsx](multi-repo-nextjs/app/components/IconButton/IconButton.tsx) |
| `Badge` | Agent indicator | [Badge.tsx](multi-repo-nextjs/app/components/Badge/Badge.tsx) |
| `ListItem` | Conversation list items | [ListItem.tsx](multi-repo-nextjs/app/components/patterns/ListItem/ListItem.tsx) |
| `Thumbnail` | User/agent avatars | [Thumbnail.tsx](multi-repo-nextjs/app/components/Thumbnail/Thumbnail.tsx) |
| `Toast` | Error notifications | [Toast.tsx](multi-repo-nextjs/app/components/Toast/Toast.tsx) |
| `Divider` | Message separators | [Divider.tsx](multi-repo-nextjs/app/components/Divider/Divider.tsx) |
| `AdaptiveSplitView` | Chat layout | [AdaptiveSplitView.tsx](multi-repo-nextjs/app/components/Adaptive/AdaptiveSplitView.tsx) |
| `AdaptiveNavShell` | Add Chat tab | [AdaptiveNavShell.tsx](multi-repo-nextjs/app/components/Adaptive/AdaptiveNavShell.tsx) |
| `Icon` (Phosphor) | All icons | [Icon.tsx](multi-repo-nextjs/app/components/icons/Icon.tsx) |

---

## Phase 4: iOS Chat UI (SwiftUI)

### 4.1 New Files

```
multi-repo-ios/multi-repo-ios/
  Models/ChatModels.swift                    # Conversation, Message, SSEEvent structs
  ViewModels/ChatViewModel.swift             # @Observable with URLSession SSE streaming
  ViewModels/AuthViewModel.swift             # Supabase auth state
  Views/ChatView.swift                       # Main chat screen with AdaptiveSplitView
  Views/LoginView.swift                      # Email/password login
  Components/Chat/
    ChatMessageList.swift                    # ScrollViewReader message list
    ChatMessageBubble.swift                  # User/assistant bubble
    ChatInputBar.swift                       # HStack: InputField + send IconButton
    ChatAgentIndicator.swift                 # Badge for agent name
    ChatToolResultCard.swift                 # Tool result card
    ChatConversationList.swift               # List of conversations using AppListItem
```

### 4.2 Patterns

- Use `URLSession.shared.bytes(for:)` with `AsyncBytes.lines` for SSE parsing
- `ChatViewModel` manages: `messages`, `streamingText`, `isStreaming`, `activeAgent`, `conversations`
- Use `.task {}` for initial load, `.onSubmit {}` for send
- Add "Chat" tab to `AdaptiveNavShell` in app entry (`Ph.chatCircle` icon)
- Use `AppPageHeader` for conversation title
- Use `AppBottomSheet` for conversation actions (delete, rename)

---

## Phase 5: Android Chat UI (Jetpack Compose)

### 5.1 New Files

```
multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/
  feature/chat/
    ChatScreen.kt                            # Screen composable
    ChatScreenState.kt                       # sealed interface: Loading | Empty | Error | Populated
    ChatViewModel.kt                         # @HiltViewModel with StateFlow
    components/
      ChatMessageList.kt                     # LazyColumn
      ChatMessageBubble.kt                   # Message bubble
      ChatInputBar.kt                        # Row: InputField + send IconButton
      ChatAgentIndicator.kt                  # Agent badge chip
      ChatToolResultCard.kt                  # Tool result card
      ChatConversationList.kt                # Conversation list
  feature/auth/
    LoginScreen.kt                           # Login screen
    LoginViewModel.kt                        # Auth ViewModel
  data/
    models/ChatModels.kt                     # Data classes
    repository/ChatRepository.kt             # API calls + SSE stream consumption
  navigation/Screen.kt                       # Add Chat data object
```

### 5.2 Patterns

- Add `Chat` to `Screen` sealed interface in [Screen.kt](multi-repo-android/app/src/main/java/com/abhishekverma/multirepo/navigation/Screen.kt)
- Use `OkHttp` or Ktor for SSE consumption → emit `Flow<SSEEvent>`
- `ChatViewModel` collects flow and updates `StateFlow<ChatScreenState>`
- `ChatScreenState.Populated` contains: `conversations`, `messages`, `streamingText`, `activeAgent`
- Wire into `AdaptiveNavShell` in `MainActivity` with "Chat" tab
- Use `AdaptiveSplitView` for tablet layout

---

## Phase 6: Polish + Integration

1. **Auto-title conversations:** After first assistant response, use a quick LLM call to generate a 3-5 word title
2. **Markdown rendering:** Render assistant messages as markdown (web: react-markdown or existing Tiptap; iOS: AttributedString; Android: `AnnotatedString`)
3. **Keyboard shortcuts (web):** Enter = send, Shift+Enter = newline
4. **Empty states:** Empty conversation list, empty chat (welcome message with suggestions)
5. **Error/retry:** Toast on stream error, retry button on failed messages
6. Run `/component-audit` on all new chat components
7. Run `/prd-update` to document the feature

---

## Verification

### Backend
```bash
cd multi-repo-nextjs
npm run build                    # Ensure no TS errors
npm run dev                      # Start dev server
# Test with curl:
curl -X POST http://localhost:3000/api/chat/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt>" \
  -d '{"title": null}'

curl -N -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt>" \
  -d '{"conversation_id": "<id>", "message": "Hello"}'
# Should stream SSE events
```

### Web
- Open `http://localhost:3000/chat`
- Verify conversation list loads (empty state initially)
- Create new conversation, send a message
- Verify streaming text appears progressively
- Verify agent handoff badge appears when routing to specialist
- Test responsive: resize below 768px — should switch to compact layout

### iOS
```bash
cd multi-repo-ios
xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios \
  -destination 'platform=iOS Simulator,name=iPhone 17' build
```
- Verify Chat tab appears in bottom nav
- Test login → chat flow
- Verify SSE streaming works

### Android
```bash
cd multi-repo-android && ./gradlew assembleDebug
```
- Verify Chat tab appears
- Test login → chat flow
- Verify SSE streaming works

### Supabase
```bash
supabase db push    # Apply migrations
supabase gen types typescript --linked > multi-repo-nextjs/lib/database.types.ts
```
- Verify tables created: `conversations`, `messages`, `knowledge_base`, `tasks`
- Verify RLS policies block cross-user access

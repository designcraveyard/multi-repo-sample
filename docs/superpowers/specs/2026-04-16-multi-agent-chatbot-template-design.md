# Multi-Agent Chatbot Template — Design Spec

**Date:** 2026-04-16
**Status:** Draft
**Source:** 99-neo project (`/Users/abhishekverma/Documents/GitHub/99-neo`)

## Overview

Import the production-grade multi-agentic chatbot system from 99-neo into the multi-repo-sample template. When a user scaffolds a new project via `/new-project`, they choose between three AI modes:

1. **Simple** — ChatKit widget (existing behavior)
2. **Full Multi-Agent** — OpenAI Agents SDK with SSE streaming, native iOS chat, admin panel, debug layer, RAG pipeline. Ships with a working Pokémon demo.
3. **None** — No AI assistant

The Pokémon demo is the default working app for "Full Multi-Agent" — functional out of the box, user replaces agents with their own domain later.

## Decisions Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Demo approach | Pokémon-first (working app) | Instantly understandable, PokéAPI is free, shows all agent capabilities |
| Admin panel | Ship it (full editor) | Hot-swap prompts/models/tools without code changes |
| Card system | Fixed Pokémon cards | Simple, no unnecessary abstraction |
| Debug panel | Desktop-only, toggle via bug icon | Matches 99-neo pattern |
| Supabase tables | All except engagement | Chat + Memory + Agent config + Debug + RAG |
| iOS voice input | Yes | Showcases native advantage over WebView |
| SSE event names | Pokémon-specific | Simpler, matches 99-neo pattern |
| Web chat UI | Decomposed into clean components | Template teaches good patterns |
| Architecture | Platform Parallel (Approach C) | Solid foundation, then parallel web/iOS tracks |

## Architecture: Approach C — Platform Parallel

```
Foundation (sequential):
  F1: Supabase schema — all tables + edge function + seed data
  F2: SSE protocol spec — event types, payload shapes, TypeScript types
  F3: Agent framework — lib/agents/ with Pokémon agents + tools + PokéAPI
  F4: Trace system — lib/agents/trace.ts

Web track (sequential):
  W1: Chat UI — ChatPage, ChatMessageList, ChatInput, useChatStream
  W2: Pokémon cards — PokemonCard, EvolutionCard, TypeMatchupCard, TeamCard
  W3: Debug panel — DebugPanel, useDebugEvents, debug API route
  W4: Admin panel — agent/tool editors, version history

iOS track (can parallel with W3-W4):
  I1: AgentService (SSE client) + ChatSessionService (REST)
  I2: ChatView + ChatViewModel + ChatInputBar
  I3: Pokémon card components (SwiftUI)
  I4: Voice input (AppAudioRecorder + transcription)

Integration (after both tracks):
  S1: Scaffold — modify /new-project wizard
  S2: Pipeline — add agent_setup phase
  S3: Config — scaffold.config.json + scripts + template files
  S4: Documentation — CLAUDE.md updates, API contracts, new skills
```

---

## 1. Supabase Schema

### Migration 1 — Chat Core

```sql
CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  active_agent text,
  message_count int DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text,
  agent_name text,
  tool_calls jsonb,
  sequence_number int NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id, sequence_number);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
  );
CREATE POLICY "Service inserts messages" ON chat_messages
  FOR INSERT WITH CHECK (true);
```

### Migration 2 — Memory

```sql
CREATE TABLE user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  memory_type text NOT NULL CHECK (memory_type IN ('preference', 'requirement', 'context', 'feedback')),
  content text NOT NULL,
  confidence float DEFAULT 0.8,
  source_session_id uuid,
  is_active boolean DEFAULT true,
  last_reinforced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content)
);

CREATE INDEX idx_user_memories_user ON user_memories(user_id, is_active);

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memories" ON user_memories
  FOR ALL USING (auth.uid() = user_id);
```

### Migration 3 — Agent Config

```sql
CREATE TABLE agent_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  model text DEFAULT 'gpt-4.1-mini',
  system_prompt text,
  temperature float DEFAULT 0.7,
  is_entry_point boolean DEFAULT false,
  is_background boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE tool_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  tool_type text,
  code_ref text,
  parameters_schema jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE agent_tools (
  agent_id uuid REFERENCES agent_configs ON DELETE CASCADE,
  tool_id uuid REFERENCES tool_definitions ON DELETE CASCADE,
  parameter_overrides jsonb,
  PRIMARY KEY (agent_id, tool_id)
);

CREATE TABLE agent_handoffs (
  source_agent_id uuid REFERENCES agent_configs ON DELETE CASCADE,
  target_agent_id uuid REFERENCES agent_configs ON DELETE CASCADE,
  tool_description_override text,
  sort_order int DEFAULT 0,
  PRIMARY KEY (source_agent_id, target_agent_id)
);

CREATE TABLE agent_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number int NOT NULL,
  snapshot jsonb NOT NULL,
  published_at timestamptz DEFAULT now(),
  published_by uuid,
  notes text
);

CREATE TABLE admin_roles (
  user_id uuid REFERENCES auth.users NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- RLS: service role only (admin panel uses service key)
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users check own admin status" ON admin_roles
  FOR SELECT USING (auth.uid() = user_id);
```

### Migration 4 — Debug Traces

```sql
CREATE TABLE debug_traces (
  trace_id text PRIMARY KEY,
  user_id text,
  session_id text,
  started_at timestamptz,
  total_ms int,
  summary jsonb,
  events jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_debug_traces_session ON debug_traces(session_id);
CREATE INDEX idx_debug_traces_user ON debug_traces(user_id);

ALTER TABLE debug_traces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own traces" ON debug_traces
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Service inserts traces" ON debug_traces
  FOR INSERT WITH CHECK (true);
```

### Migration 5 — RAG / Knowledge Base

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE insight_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text,
  slug text UNIQUE NOT NULL,
  report_text text,
  entity_name text,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE insight_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON insight_reports FOR SELECT USING (true);
CREATE POLICY "Service write" ON insight_reports FOR ALL USING (true);

CREATE TABLE intelligence_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid,
  entity_type text,
  entity_slug text,
  chunk_text text,
  content_section text,
  embedding vector(1536),
  chunk_index int,
  entity_name text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_embeddings_entity ON intelligence_embeddings(entity_type, entity_slug);
```

### Migration 6 — RPC Functions

```sql
CREATE OR REPLACE FUNCTION search_intel(
  query_embedding vector(1536),
  match_count int DEFAULT 5,
  filter_entity_type text DEFAULT NULL
)
RETURNS TABLE (
  chunk_text text,
  content_section text,
  entity_type text,
  entity_slug text,
  entity_name text,
  similarity float
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    ie.chunk_text,
    ie.content_section,
    ie.entity_type,
    ie.entity_slug,
    ie.entity_name,
    1 - (ie.embedding <=> query_embedding) AS similarity
  FROM intelligence_embeddings ie
  WHERE (filter_entity_type IS NULL OR ie.entity_type = filter_entity_type)
  ORDER BY ie.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Edge Function — embed-insight-report

```
supabase/functions/embed-insight-report/index.ts
```

Triggered by DB trigger on `insight_reports` INSERT/UPDATE. Chunks markdown by `##` headings, embeds each chunk via OpenAI `text-embedding-3-small` (1536 dims), upserts into `intelligence_embeddings`.

### Seed Script

```
scripts/seed-pokemon.ts
```

- Fetches ~50 popular Pokémon from PokéAPI (Kanto + fan favorites)
- Writes species data as markdown to `insight_reports` (type: `pokemon_species`)
- Writes type matchup data to `insight_reports` (type: `pokemon_type`)
- Seeds `agent_configs` with 4 agents (PokéRouter, Pokédex Expert, Team Builder, Battle Strategist) + 1 background (Memory)
- Seeds `tool_definitions` with 7 tools
- Seeds `agent_tools` and `agent_handoffs` with the graph wiring
- Triggers embedding generation via edge function

---

## 2. SSE Protocol

### Core Events (domain-agnostic)

| Event | Payload | When |
|-------|---------|------|
| `session` | `{ sessionId: string, isNew: boolean }` | Stream opens |
| `agent_thinking` | `{}` | Agent starts processing |
| `tool_call` | `{ label: string, toolName: string, agentName?: string }` | Tool invoked or handoff |
| `text_delta` | `{ token: string }` | Each streaming token |
| `message_done` | `{ fullText: string, agentName: string }` | Response complete |
| `done` | `{}` | Stream closed |
| `error` | `{ source: string, message: string, stack?: string }` | Non-fatal error |

### Pokémon Card Events

| Event | Payload | Tool |
|-------|---------|------|
| `pokemon_card` | `{ name, id, sprite, types[], stats[], abilities[], height, weight }` | `lookup_pokemon` |
| `evolution_card` | `{ chain: [{ name, id, sprite, trigger }] }` | `get_evolution_chain` |
| `type_matchup_card` | `{ pokemon, weaknesses[], resistances[], immunities[] }` | `analyze_type_matchup` |
| `team_card` | `{ team: [{ name, id, sprite, types[], role }], coverage }` | `suggest_team` |

### Wire Format

```
event: {type}\ndata: {json}\n\n
```

### Request

```
POST /api/chat
Headers: Authorization: Bearer <jwt> | Cookie session
Body: { message: string, sessionId?: string }
Response: text/event-stream
Response Headers: X-Trace-Id: t_xxxxx_yyyyy
```

### Shared Types File

`lib/agents/types.ts` — TypeScript interfaces for all payloads.
`Models/AgentEvent.swift` — Swift enum with 11 cases (7 core + 4 cards).
`Models/ChatCardModels.swift` — Swift structs for card payloads.

---

## 3. Agent Framework

### Directory

```
multi-repo-nextjs/lib/agents/
├── index.ts              — Graph wiring + caching
├── context.ts            — AgentContext + loaders
├── config-cache.ts       — DB config with code fallback (5-min TTL)
├── trace.ts              — Trace class (14 phases, timers, persistence)
├── types.ts              — Shared types
├── triage.ts             — PokéRouter (entry point)
├── pokedex-expert.ts     — Species, abilities, evolution
├── team-builder.ts       — Team composition, coverage
├── battle-strategist.ts  — Matchups, moves, items
├── memory-agent.ts       — Background preference extraction
└── tools/
    ├── lookup-pokemon.ts
    ├── get-evolution-chain.ts
    ├── analyze-type-matchup.ts
    ├── suggest-team.ts
    ├── get-move-details.ts
    ├── search-pokemon-intel.ts
    ├── save-memory.ts
    └── index.ts
```

### Agent Graph

```
PokéRouter (Triage — is_entry_point: true)
├── Pokédex Expert
│   Tools: lookup_pokemon, get_evolution_chain, search_pokemon_intel
│   Handoffs: → PokéRouter
├── Team Builder
│   Tools: suggest_team, lookup_pokemon, analyze_type_matchup
│   Handoffs: → PokéRouter
├── Battle Strategist
│   Tools: analyze_type_matchup, get_move_details, lookup_pokemon
│   Handoffs: → PokéRouter
└── Memory Agent (is_background: true)
    Tools: save_memory
```

### Agent Definition Pattern

```typescript
import { Agent } from "@openai/agents";
import type { AgentContext } from "./context";

export function createPokedexExpert() {
  return new Agent<AgentContext>({
    name: "Pokédex Expert",
    model: "gpt-4.1-mini",
    instructions: (ctx) => `You are a Pokédex expert. You know everything about Pokémon species, abilities, evolution chains, and lore.

User's preferences: ${ctx.profileSummary}
Conversation so far: ${ctx.conversationHistory}

Rules:
- Call at least one tool on every request
- Use search_pokemon_intel for deep lore questions
- Always show the pokemon_card when discussing a specific Pokémon
- Keep responses concise (under 200 words of text alongside cards)`,
    tools: [lookupPokemon, getEvolutionChain, searchPokemonIntel],
    handoffs: [], // back-handoff wired in index.ts
    modelSettings: { temperature: 0.7 },
  });
}
```

### Tool Pattern

```typescript
import { tool } from "@openai/agents";
import { z } from "zod";

export const lookupPokemon = tool({
  name: "lookup_pokemon",
  description: "Look up a Pokémon by name or Pokédex number.",
  parameters: z.object({
    name: z.string().describe("Pokémon name or Pokédex number"),
  }),
  execute: async ({ name }, ctx) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
    if (!res.ok) return { error: `Pokémon "${name}" not found` };
    const data = await res.json();
    return {
      name: data.name,
      id: data.id,
      sprite: data.sprites.other["official-artwork"].front_default,
      types: data.types.map(t => t.type.name),
      stats: data.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
      abilities: data.abilities.map(a => a.ability.name),
      height: data.height / 10,
      weight: data.weight / 10,
    };
  },
});
```

### AgentContext

```typescript
interface AgentContext {
  userId: string;
  sessionId: string;
  profileSummary: string;
  conversationHistory: string;
  rawMemories: Array<{ memory_type: string; content: string; confidence: number }> | null;
  supabase: SupabaseClient;
  trace: Trace;
}
```

Loaded in parallel at request start:
1. `loadMemories(userId)` — active memories sorted by confidence
2. `buildProfileSummary(memories)` — compact string (<300 chars)
3. `loadChatHistory(sessionId)` — last 20 messages formatted

### Config Cache

- First request: fetch all 4 agent config tables from Supabase
- Cache in-memory with 5-min TTL
- Cookie `agent-code-fallback=true` bypasses DB, uses code definitions
- Admin panel save → immediate cache invalidation

### Triage Routing

PokéRouter system prompt:
```
You are a routing agent. Classify user intent and hand off immediately. Never answer directly.

Routing rules:
- Species info, abilities, evolution, lore → Pokédex Expert
- Team building, coverage analysis, suggestions → Team Builder
- Battle matchups, move recommendations, strategy → Battle Strategist
- "Remember X" / preference statements → save memory inline, then continue
```

### Memory Agent (Background)

Fire-and-forget after each response:
- Receives the last exchange (user message + assistant response)
- Extracts preference signals (e.g., "I love Fire types", "I need a Rain team")
- Upserts to `user_memories` with confidence and type
- Deactivates superseded memories

---

## 4. Trace System

### Trace Class API

```typescript
class Trace {
  constructor(userId: string, sessionId: string)

  // Properties
  readonly id: string;          // t_${Date.now().toString(36)}_${random}
  readonly userId: string;
  readonly sessionId: string;

  // Core
  log(phase: string, event: string, data?: Record<string, unknown>): void
  startTimer(key: string): void
  endTimer(key: string): number  // returns ms, deletes timer

  // Convenience (14 phases)
  auth(event, data?): void
  context(event, data?, durationMs?): void
  config(event, data?): void
  route(event, data?): void
  agent(agentName, event, data?, durationMs?): void
  toolCall(toolName, event, data?, durationMs?): void
  toolResult(toolName, event, data?, durationMs?): void
  sse(event, data?): void
  card(event, data?): void
  map(event, data?): void
  memory(event, data?, durationMs?): void
  engagement(event, data?, durationMs?): void
  perf(event, data?): void
  error(phase, event, error, data?): void

  // Output
  getEvents(): TraceEvent[]
  summary(): TraceSummary
  async persist(): Promise<void>  // fire-and-forget to debug_traces
}
```

### Console Format

```
[TRACE:t_xxxx][Phase:agent:tool] +elapsedMs event_name (durationMs) {data}
```

### Persistence

Insert to `debug_traces` after stream closes. Gracefully handles missing table (logs warning, no crash).

---

## 5. Web Chat UI

### Directory

```
multi-repo-nextjs/app/components/Chat/
├── ChatPage.tsx              — Layout: header + messages + input + debug
├── ChatMessageList.tsx       — Scrollable list with auto-scroll
├── ChatMessage.tsx           — Single message renderer (switch on type)
├── ChatInput.tsx             — Text area + send button
├── ChatHeader.tsx            — Title, history button, debug icon
├── ChatHistorySheet.tsx      — Session list sidebar
├── StreamEventPill.tsx       — "Searching Pokédex..." animated pill
├── cards/
│   ├── PokemonCard.tsx       — Sprite + types + stat bars (~120 lines)
│   ├── EvolutionCard.tsx     — Chain with arrows + sprites (~80 lines)
│   ├── TypeMatchupCard.tsx   — Weakness/resistance grid (~90 lines)
│   └── TeamCard.tsx          — 6-mon grid + coverage (~100 lines)
├── debug/
│   ├── DebugPanel.tsx        — Right-side resizable panel (~300 lines)
│   └── DebugEventRow.tsx     — Expandable event row (~100 lines)
└── index.ts

multi-repo-nextjs/lib/hooks/
├── use-chat-stream.ts        — SSE connection + message state (~150 lines)
└── use-debug-events.ts       — Event capture + buffering (~80 lines)
```

### Component Responsibilities

**ChatPage** (~100 lines): Layout shell. Holds `sessionId` + `debugOpen` state. Wires `useChatStream()` to children.

**useChatStream** (~150 lines): SSE logic. `sendMessage(text)` → POST /api/chat → parse event/data lines → update messages → capture debug events. Returns `{ messages, isStreaming, sessionId, sendMessage, debugEvents }`.

**ChatMessageList** (~80 lines): Scrollable container, auto-scroll via ref + useEffect, delegates to ChatMessage.

**ChatMessage** (~60 lines): Switch on role/cardType → user bubble (right) | assistant markdown (left, via react-markdown + remark-gfm) | event pill | card component.

**ChatInput** (~50 lines): Auto-growing textarea (1-5 lines), Enter=send, Shift+Enter=newline, disabled during streaming.

**StreamEventPill** (~40 lines): Rotating star + shimmer text. Label updates: "Thinking..." → "Searching Pokédex..." → "Analyzing types..."

### Card Components

**PokemonCard**: Sprite (96×96), name + dex number, type badges (colored pills), stat bars (horizontal, value labels), abilities, height/weight.

**EvolutionCard**: Horizontal chain — sprite → arrow(trigger) → sprite → arrow → sprite. Wraps on mobile.

**TypeMatchupCard**: Grid with colored cells. Weaknesses (2×, red), resistances (½×, green), immunities (0×, gray). Pokémon header with sprite.

**TeamCard**: 2×3 mini-card grid (sprite + name + types + role label). Coverage footer.

### Debug Panel

**DebugPanel** (~300 lines): Right-side fixed, drag-resizable 300-800px. Filter input. Auto-scrolling event list. Stats footer. Actions: Export JSON, Server traces, Copy (full/last), Clear.

**DebugEventRow** (~100 lines): Collapsed: elapsed | type badge (colored) | preview | payload size. Expanded: JSON + special views for tool_call, tool_result, text_message, error.

**useDebugEvents** (~80 lines): `captureEvent(type, data)`, `captureTraceId(id)`, `resetEvents()`. Buffers text_delta tokens, flushes as single `text_message` on message_done.

**TYPE_COLORS**: ~15 entries — blue (user), purple (thinking), orange (tool_call), green (tool_result/pokemon_card), red (error), etc.

---

## 6. Web API Routes

```
app/api/
├── chat/
│   ├── route.ts                    — SSE streaming (~400 lines)
│   ├── debug/route.ts              — GET traces by session/trace ID
│   └── sessions/
│       ├── route.ts                — POST create, GET list
│       └── [id]/
│           ├── route.ts            — GET session, DELETE session
│           └── messages/route.ts   — GET history
├── admin/
│   ├── agents/
│   │   ├── route.ts                — GET list, POST create
│   │   └── [id]/route.ts          — GET, PUT, DELETE
│   ├── tools/
│   │   ├── route.ts                — GET list, POST create
│   │   └── [id]/route.ts          — GET, PUT, DELETE
│   ├── handoffs/route.ts           — GET/PUT graph
│   └── versions/
│       ├── route.ts                — GET list, POST publish
│       └── [id]/route.ts          — GET, POST rollback
└── ai/
    └── transcribe/route.ts         — Audio → text
```

### Main Chat Route Flow (`/api/chat/route.ts`)

1. Authenticate (cookie or Bearer JWT)
2. Parse body `{ message, sessionId }`
3. Create Trace instance
4. Load context in parallel (memories, history, profile summary)
5. Load agent graph (DB or code fallback)
6. Open SSE stream (TransformStream + TextEncoder)
7. Set `X-Trace-Id` header
8. `run(entryAgent, input, { stream: true, context })`
9. For each stream event: emit SSE events, call tool functions, emit card events
10. Emit `message_done` + `done`
11. Background: save messages, run memory extraction, persist trace

### Auth Pattern

Dual auth (from 99-neo `api-auth.ts`):
- Web: cookie-based Supabase session
- iOS: `Authorization: Bearer <jwt>` header
- Returns `{ userId, supabase }` or 401

### Middleware Changes

`middleware.ts` must exclude these paths from auth redirect (iOS sends JWT directly, not cookies):
- `/api/chat` — SSE streaming endpoint
- `/api/chat/sessions` — session CRUD
- `/api/ai/transcribe` — voice transcription
- `/api/admin/*` — admin panel (has own auth check)

These routes handle their own authentication via `authenticateRequest()`.

### Admin Panel Auth

Admin API routes use the Supabase service role key server-side. Client-side access gated by an `admin_roles` table check:
- `admin_roles(user_id, role)` — seeded with the developer's user ID during setup
- Admin layout fetches `/api/admin/me` → checks if `auth.uid()` exists in `admin_roles`
- Non-admins see a 403 page

---

## 7. Admin Panel

```
app/(authenticated)/admin/
├── layout.tsx                  — Sidebar nav
├── page.tsx                    — Dashboard: agent graph visualization
├── agents/
│   ├── page.tsx                — Agent list
│   └── [id]/AgentEditorClient.tsx — Model, temp, prompt, tools, handoffs
├── tools/
│   ├── page.tsx                — Tool list
│   └── [id]/ToolEditorClient.tsx — Name, desc, params schema (JSON)
├── versions/page.tsx           — History + rollback
└── test/page.tsx               — Live testing mini-chat + event log
```

Features:
- Agent editor: model dropdown, temperature slider, system prompt textarea, tool checkboxes, handoff ordering
- Tool editor: name, description, Zod parameter schema (JSON editor)
- Version history: snapshot on save, one-click rollback
- Test page: send a message, see SSE events in real-time, verify config changes
- All saves invalidate 5-min config cache immediately

---

## 8. iOS Native Chat

### Directory

```
multi-repo-ios/
├── Services/
│   ├── AgentService.swift          — SSE client (singleton)
│   ├── ChatSessionService.swift    — REST sessions API
│   └── TranscribeService.swift     — Voice → text API
├── Views/Chat/
│   ├── ChatView.swift              — Main screen (~470 lines)
│   └── ChatViewModel.swift         — @Observable state (~350 lines)
├── Components/Chat/
│   ├── ChatInputBar.swift          — Text + mic + send (~150 lines)
│   ├── SSEStreamEventView.swift    — Tool/thinking pill
│   ├── ChatMarkdownTheme.swift     — MarkdownUI theme
│   ├── ChatHistoryView.swift       — Session list sheet
│   ├── Cards/
│   │   ├── PokemonCardView.swift
│   │   ├── EvolutionCardView.swift
│   │   ├── TypeMatchupCardView.swift
│   │   └── TeamCardView.swift
│   └── Audio/
│       └── AppAudioRecorder.swift  — Mic + level metering
├── Models/
│   ├── ChatCardModels.swift        — Card payload structs
│   └── AgentEvent.swift            — SSE event enum (11 cases)
```

### Key Patterns

- **AgentService**: Singleton, `URLSession.bytes()`, manual SSE line parsing, `AsyncStream<AgentEvent>`, JWT from Supabase session, base URL from env/Info.plist/production fallback, `warmup(jwt)` on app launch
- **Info.plist additions**: `NSMicrophoneUsageDescription` (voice recording), `NSAllowsLocalNetworking` (dev server)
- **ChatViewModel**: `@Observable @MainActor`, `messages: [ChatMessage]` (enum, 11 cases), `streamToken` for scroll, `seedMessages()` before async, haptic every 5th delta
- **ChatView**: `LazyVStack` + `ScrollViewReader`, header blur on scroll, context menu, history sheet at 90%
- **ChatInputBar**: Pill shape, 1-5 lines, mic button (tap record/stop), send button, error styling
- **Voice**: `AppAudioRecorder` (AVFoundation) → `/api/ai/transcribe` → inject text
- **ChatMessage enum**: user, aiText, aiEvent, aiPokemonCard, aiEvolutionCard, aiTypeMatchupCard, aiTeamCard

### Navigation Integration

Chat is the home tab (Tab 1) in `AdaptiveNavShell`. Replaces current `ContentView` as the primary screen.

---

## 9. Scaffold Integration

### `/new-project` Changes

Add to Batch 2 after platform selection:

```
"AI Assistant Setup:"
  1. Simple (ChatKit widget — web embed + iOS WebView)
  2. Full Multi-Agent (OpenAI Agents SDK — native chat, admin panel, debug layer)
  3. None
```

### scaffold.config.json Addition

```json
"ai": {
  "AI_MODE": { "default": "none", "enum": ["none", "simple", "multi-agent"] },
  "OPENAI_API_KEY": { "secret": true, "description": "Required for multi-agent mode" }
}
```

### scaffold.sh Logic

```bash
if [ "$AI_MODE" = "simple" ]; then
  # Remove: lib/agents/, app/api/chat/, app/api/admin/, app/components/Chat/
  # Remove: Views/Chat/, Components/Chat/, Services/AgentService.swift
  # Keep: assistant/ page, AppWebView, chatkit routes
elif [ "$AI_MODE" = "none" ]; then
  # Remove all AI: agents, chat, admin, assistant, chatkit, transcribe
  # Remove iOS: Chat views, agent service, assistant view, transcribe
elif [ "$AI_MODE" = "multi-agent" ]; then
  # Remove: app/assistant/, app/assistant-embed/, app/api/chatkit/
  # Remove: chatkit.config.json, Views/AssistantView.swift (WebView)
  # Keep: lib/agents/, app/api/chat/, admin panel, iOS native chat
fi
```

### Pipeline Phase Addition

New phase after `scaffold` (only if `AI_MODE = "multi-agent"`):

```
Phase 1.5: agent_setup
  1. Verify OPENAI_API_KEY in .env.local
  2. Run Supabase migrations (chat + agent config + debug + memory + RAG)
  3. Run seed-pokemon.ts (fetch PokéAPI → insight_reports → agent configs)
  4. Verify PokéAPI connectivity
  5. npm run build (confirm compilation)
  6. Mark phase done
```

### New Skills

| Skill | Purpose |
|-------|---------|
| `/add-agent <name>` | Scaffold new specialist agent + register in graph + seed DB |
| `/add-tool <name>` | Scaffold new tool with Zod schema + register with agent |
| `/add-card <name>` | Scaffold card: SSE event + web component + iOS view + types |

---

## 10. Dependencies

### Web (package.json additions)

```json
{
  "@openai/agents": "^0.5.4",
  "zod": "^4.3.6",
  "react-markdown": "^10.1.0",
  "remark-gfm": "^4.0.1"
}
```

`openai` and `@supabase/supabase-js` already present.

### iOS

- **MarkdownUI** (SPM) — markdown rendering in chat bubbles
- **AVFoundation** — system framework for audio recording
- PokéAPI via native URLSession — no external dependency

### Environment Variables

```env
# Required for multi-agent mode
OPENAI_API_KEY=sk-...

# Existing (already in template)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 11. Documentation Updates

| File | Changes |
|------|---------|
| `CLAUDE.md` | Add Multi-Agent Architecture section |
| `docs/api-contracts.md` | Add chat tables, SSE events, request/response contracts |
| `docs/agent-system.md` | New: agent graph, tools, context, config cache, memory |
| `docs/debug-tracing.md` | New: Trace API, debug panel, persistence, export |
| `scaffold.config.json` | Add `ai` section |

---

## File Count Estimate

| Area | New Files | Lines (approx) |
|------|-----------|----------------|
| Supabase migrations | 6 | ~300 |
| Edge function | 1 | ~80 |
| Seed script | 1 | ~200 |
| Agent framework (lib/agents/) | 13 | ~1,500 |
| Web API routes | 12 | ~1,200 |
| Web Chat UI | 12 | ~1,300 |
| Web Admin panel | 8 | ~1,200 |
| iOS Services | 3 | ~650 |
| iOS Views/Chat | 2 | ~820 |
| iOS Components/Chat | 8 | ~800 |
| iOS Models | 2 | ~200 |
| Shared types | 1 | ~100 |
| Scaffold changes | 3 | ~200 |
| Documentation | 3 | ~400 |
| **Total** | **~75 files** | **~8,950 lines** |

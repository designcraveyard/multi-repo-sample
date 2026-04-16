# Multi-Agent Chatbot Template — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import the multi-agentic chatbot system from 99-neo into multi-repo-sample, with a working Pokemon demo, debug layer, admin panel, and scaffold integration.

**Architecture:** Platform Parallel — build foundation (schema + SSE protocol + agents + trace) sequentially, then split into parallel web and iOS tracks, finally integrate with scaffold system.

**Tech Stack:** OpenAI Agents SDK (`@openai/agents`), Next.js 16 API routes (SSE streaming), SwiftUI (native iOS chat), Supabase (persistence + RAG), PokéAPI (free, no key needed)

**Spec:** `docs/superpowers/specs/2026-04-16-multi-agent-chatbot-template-design.md`

**Source project:** `/Users/abhishekverma/Documents/GitHub/99-neo` (99-neo-web + 99-neo-ios)

---

## File Structure

### New Files — Foundation

```
multi-repo-nextjs/
├── lib/agents/
│   ├── types.ts                    — Shared TypeScript types (events, payloads, context)
│   ├── trace.ts                    — Trace class (14 phases, timers, persistence)
│   ├── context.ts                  — AgentContext interface + parallel loaders
│   ├── config-cache.ts             — DB config with code fallback (5-min TTL)
│   ├── index.ts                    — Agent graph wiring + caching
│   ├── triage.ts                   — PokéRouter (entry point)
│   ├── pokedex-expert.ts           — Species/abilities/evolution agent
│   ├── team-builder.ts             — Team composition agent
│   ├── battle-strategist.ts        — Matchup/moves agent
│   ├── memory-agent.ts             — Background preference extractor
│   └── tools/
│       ├── index.ts                — Tool registry (barrel export)
│       ├── lookup-pokemon.ts       — PokéAPI species lookup
│       ├── get-evolution-chain.ts  — Evolution chain from PokéAPI
│       ├── analyze-type-matchup.ts — Type effectiveness calc
│       ├── suggest-team.ts         — Team builder with coverage
│       ├── get-move-details.ts     — Move data from PokéAPI
│       ├── search-pokemon-intel.ts — RAG over insight_reports
│       └── save-memory.ts          — Upsert user_memories
├── lib/chat/
│   └── sessions.ts                 — Chat session CRUD helpers
├── lib/auth/
│   └── api-auth.ts                 — Dual auth (cookie + JWT)
├── lib/hooks/
│   ├── use-chat-stream.ts          — SSE connection + message state
│   └── use-debug-events.ts         — Debug event capture + buffering
├── app/api/
│   ├── chat/
│   │   ├── route.ts                — Main SSE streaming endpoint
│   │   ├── debug/route.ts          — Debug trace retrieval
│   │   └── sessions/
│   │       ├── route.ts            — POST create, GET list
│   │       └── [id]/
│   │           ├── route.ts        — GET session, DELETE session
│   │           └── messages/route.ts — GET message history
│   ├── admin/
│   │   ├── me/route.ts             — Admin role check
│   │   ├── agents/
│   │   │   ├── route.ts            — GET list, POST create
│   │   │   └── [id]/route.ts       — GET, PUT, DELETE agent
│   │   ├── tools/
│   │   │   ├── route.ts            — GET list, POST create
│   │   │   └── [id]/route.ts       — GET, PUT, DELETE tool
│   │   ├── handoffs/route.ts       — GET/PUT handoff graph
│   │   └── versions/
│   │       ├── route.ts            — GET list, POST publish
│   │       └── [id]/route.ts       — GET, POST rollback
│   └── ai/
│       └── transcribe/route.ts     — Audio → text (for iOS voice)
├── app/components/Chat/
│   ├── index.ts                    — Barrel export
│   ├── ChatPage.tsx                — Layout shell
│   ├── ChatMessageList.tsx         — Scrollable message list
│   ├── ChatMessage.tsx             — Single message renderer
│   ├── ChatInput.tsx               — Text area + send
│   ├── ChatHeader.tsx              — Title, history, debug toggle
│   ├── ChatHistorySheet.tsx        — Session list sidebar
│   ├── StreamEventPill.tsx         — Tool/thinking indicator
│   ├── cards/
│   │   ├── PokemonCard.tsx         — Sprite + types + stat bars
│   │   ├── EvolutionCard.tsx       — Chain with arrows
│   │   ├── TypeMatchupCard.tsx     — Weakness/resistance grid
│   │   └── TeamCard.tsx            — 6-mon grid + coverage
│   └── debug/
│       ├── DebugPanel.tsx          — Right-side resizable panel
│       └── DebugEventRow.tsx       — Expandable event row
├── app/(authenticated)/
│   └── admin/
│       ├── layout.tsx              — Admin sidebar nav + role gate
│       ├── page.tsx                — Agent graph dashboard
│       ├── agents/
│       │   ├── page.tsx            — Agent list
│       │   └── [id]/AgentEditorClient.tsx
│       ├── tools/
│       │   ├── page.tsx            — Tool list
│       │   └── [id]/ToolEditorClient.tsx
│       ├── versions/page.tsx       — Version history + rollback
│       └── test/page.tsx           — Live agent testing

multi-repo-ios/multi-repo-ios/
├── Services/
│   ├── AgentService.swift          — SSE client (singleton)
│   ├── ChatSessionService.swift    — REST sessions API
│   └── TranscribeService.swift     — Voice → text API
├── Views/Chat/
│   ├── ChatView.swift              — Main chat screen
│   └── ChatViewModel.swift         — @Observable state + SSE
├── Components/Chat/
│   ├── ChatInputBar.swift          — Text + mic + send
│   ├── SSEStreamEventView.swift    — Tool/thinking pill
│   ├── ChatMarkdownTheme.swift     — MarkdownUI theme
│   ├── ChatHistoryView.swift       — Session list sheet
│   ├── Cards/
│   │   ├── PokemonCardView.swift
│   │   ├── EvolutionCardView.swift
│   │   ├── TypeMatchupCardView.swift
│   │   └── TeamCardView.swift
│   └── Audio/
│       └── AppAudioRecorder.swift  — Mic recording
├── Models/
│   ├── ChatCardModels.swift        — Card payload structs
│   └── AgentEvent.swift            — SSE event enum

supabase/
├── migrations/
│   ├── 20260416100000_chat_core.sql
│   ├── 20260416100001_user_memories.sql
│   ├── 20260416100002_agent_config.sql
│   ├── 20260416100003_debug_traces.sql
│   ├── 20260416100004_knowledge_base.sql
│   └── 20260416100005_rpc_functions.sql
├── functions/
│   └── embed-insight-report/index.ts
└── seed/
    └── seed-pokemon.ts

scripts/
└── seed-pokemon.ts                 — Symlink or copy of supabase/seed/
```

### Modified Files

```
multi-repo-nextjs/package.json              — Add @openai/agents, zod, react-markdown, remark-gfm
multi-repo-nextjs/middleware.ts              — Exclude /api/chat, /api/admin, /api/ai from auth redirect
multi-repo-nextjs/app/(authenticated)/page.tsx — Replace with ChatPage import (or redirect)
multi-repo-ios/multi-repo-ios/ContentView.swift — Replace Tab 2 (AI Demo) with ChatView, remove Tab 4 (Assistant)
multi-repo-ios/multi-repo-ios/Info.plist     — Add NSMicrophoneUsageDescription
scaffold.config.json                         — Add ai section (AI_MODE, OPENAI_API_KEY)
.claude/skills/new-project/SKILL.md          — Add AI mode question to Batch 2
.claude/skills/pipeline/SKILL.md             — Add agent_setup phase
CLAUDE.md                                    — Add Multi-Agent Architecture section
```

---

## FOUNDATION PHASE

---

### Task 1: Install Dependencies

**Files:**
- Modify: `multi-repo-nextjs/package.json`

- [ ] **Step 1: Install npm packages**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm install @openai/agents@^0.5.4 zod@^4.3.6 react-markdown@^10.1.0 remark-gfm@^4.0.1
```

- [ ] **Step 2: Verify installation**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && node -e "require('@openai/agents'); console.log('agents OK')" && node -e "require('zod'); console.log('zod OK')"
```

Expected: Both print OK.

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add package.json package-lock.json && git -C multi-repo-nextjs commit -m "feat: add @openai/agents, zod, react-markdown, remark-gfm"
```

---

### Task 2: Supabase Migrations — Chat Core

**Files:**
- Create: `supabase/migrations/20260416100000_chat_core.sql`

- [ ] **Step 1: Write migration**

```sql
-- Chat sessions and messages for multi-agent chatbot

CREATE TABLE chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  active_agent text,
  message_count int DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_last_message ON chat_sessions(last_message_at DESC);

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

CREATE INDEX idx_chat_messages_session_seq ON chat_messages(session_id, sequence_number);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own messages" ON chat_messages
  FOR SELECT USING (
    session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
  );
CREATE POLICY "Service inserts messages" ON chat_messages
  FOR INSERT WITH CHECK (true);
```

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/migrations/20260416100000_chat_core.sql && git commit -m "feat: add chat_sessions and chat_messages tables"
```

---

### Task 3: Supabase Migrations — User Memories

**Files:**
- Create: `supabase/migrations/20260416100001_user_memories.sql`

- [ ] **Step 1: Write migration**

```sql
-- User memories for cross-session preference tracking

CREATE TABLE user_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  memory_type text NOT NULL CHECK (memory_type IN ('preference', 'requirement', 'context', 'feedback')),
  content text NOT NULL,
  confidence float DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  source_session_id uuid REFERENCES chat_sessions ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  last_reinforced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, content)
);

CREATE INDEX idx_user_memories_active ON user_memories(user_id, is_active) WHERE is_active = true;

ALTER TABLE user_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memories" ON user_memories
  FOR ALL USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/migrations/20260416100001_user_memories.sql && git commit -m "feat: add user_memories table"
```

---

### Task 4: Supabase Migrations — Agent Config

**Files:**
- Create: `supabase/migrations/20260416100002_agent_config.sql`

- [ ] **Step 1: Write migration**

```sql
-- Agent configuration tables for admin panel

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
  tool_type text DEFAULT 'function',
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
  published_by uuid REFERENCES auth.users ON DELETE SET NULL,
  notes text
);

CREATE TABLE admin_roles (
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- RLS: admin tables use service role key
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users check own admin status" ON admin_roles
  FOR SELECT USING (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/migrations/20260416100002_agent_config.sql && git commit -m "feat: add agent config tables for admin panel"
```

---

### Task 5: Supabase Migrations — Debug Traces

**Files:**
- Create: `supabase/migrations/20260416100003_debug_traces.sql`

- [ ] **Step 1: Write migration**

```sql
-- Debug traces for SSE event persistence and debugging

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
CREATE INDEX idx_debug_traces_created ON debug_traces(created_at DESC);

ALTER TABLE debug_traces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own traces" ON debug_traces
  FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Service inserts traces" ON debug_traces
  FOR INSERT WITH CHECK (true);
```

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/migrations/20260416100003_debug_traces.sql && git commit -m "feat: add debug_traces table"
```

---

### Task 6: Supabase Migrations — Knowledge Base (RAG)

**Files:**
- Create: `supabase/migrations/20260416100004_knowledge_base.sql`

- [ ] **Step 1: Write migration**

```sql
-- Knowledge base with vector embeddings for RAG

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
CREATE POLICY "Public read insight reports" ON insight_reports FOR SELECT USING (true);

CREATE TABLE intelligence_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES insight_reports ON DELETE CASCADE,
  entity_type text,
  entity_slug text,
  chunk_text text NOT NULL,
  content_section text,
  embedding vector(1536),
  chunk_index int DEFAULT 0,
  entity_name text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_embeddings_entity ON intelligence_embeddings(entity_type, entity_slug);
CREATE INDEX idx_embeddings_vector ON intelligence_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);
```

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/migrations/20260416100004_knowledge_base.sql && git commit -m "feat: add knowledge base tables with pgvector"
```

---

### Task 7: Supabase Migrations — RPC Functions

**Files:**
- Create: `supabase/migrations/20260416100005_rpc_functions.sql`

- [ ] **Step 1: Write migration**

```sql
-- Vector similarity search for RAG

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

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/migrations/20260416100005_rpc_functions.sql && git commit -m "feat: add search_intel RPC for vector similarity search"
```

---

### Task 8: Shared Types + Trace System

**Files:**
- Create: `multi-repo-nextjs/lib/agents/types.ts`
- Create: `multi-repo-nextjs/lib/agents/trace.ts`
- Reference: `99-neo-web/lib/agents/trace.ts` (195 lines — port and generalize)

- [ ] **Step 1: Create types.ts**

Create `multi-repo-nextjs/lib/agents/types.ts` with all shared TypeScript types. This file defines the SSE event protocol, card payloads, agent context, and trace interfaces. Port the event types from the 99-neo chat route and adapt card payloads for Pokemon.

Contents must include:
- `SSEEventType` — string union of all event names (`session`, `agent_thinking`, `tool_call`, `text_delta`, `pokemon_card`, `evolution_card`, `type_matchup_card`, `team_card`, `message_done`, `done`, `error`)
- `PokemonCardPayload` — `{ name: string, id: number, sprite: string, types: string[], stats: { name: string, value: number }[], abilities: string[], height: number, weight: number }`
- `EvolutionCardPayload` — `{ chain: { name: string, id: number, sprite: string, trigger: string }[] }`
- `TypeMatchupCardPayload` — `{ pokemon: string, weaknesses: { type: string, multiplier: number }[], resistances: { type: string, multiplier: number }[], immunities: string[] }`
- `TeamCardPayload` — `{ team: { name: string, id: number, sprite: string, types: string[], role: string }[], coverage: { uncovered: string[], doubleResisted: string[] } }`
- `ChatMessage` — `{ id: string, role: 'user' | 'assistant' | 'event', content: string, agentName?: string, cards?: CardPayload[] }`
- `CardPayload` — discriminated union: `{ type: 'pokemon_card', data: PokemonCardPayload } | { type: 'evolution_card', data: EvolutionCardPayload } | ...`
- `AgentContext` interface — `{ userId, sessionId, profileSummary, conversationHistory, rawMemories, supabase, trace }`
- `TraceEvent` interface — `{ traceId, timestamp, phase, agent?, tool?, event, data?, durationMs?, error? }`
- `TraceSummary` interface — `{ traceId, userId, sessionId, totalMs, totalEvents, agentsUsed, toolCallCount, sseEventCount, errorCount, errors }`

- [ ] **Step 2: Create trace.ts**

Create `multi-repo-nextjs/lib/agents/trace.ts` by porting from `99-neo-web/lib/agents/trace.ts` (195 lines). This file is almost entirely domain-agnostic — rename `NeevaContext` references to `AgentContext`. Keep:
- Trace class with constructor `(userId, sessionId)`
- `id` generation: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
- All 14 convenience methods: `auth`, `context`, `config`, `route`, `agent`, `toolCall`, `toolResult`, `sse`, `card`, `map`, `memory`, `engagement`, `perf`, `error`
- `startTimer(key)` / `endTimer(key)` → returns ms
- `getEvents()` → `TraceEvent[]`
- `summary()` → `TraceSummary`
- `persist()` → fire-and-forget insert to `debug_traces` table via supabase client passed as param
- Console logging format: `[TRACE:${id}][${phase}:${agent}:${tool}] +${elapsed}ms ${event}`
- Graceful handling of missing table (try/catch, console.warn)

- [ ] **Step 3: Verify compilation**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npx tsc --noEmit lib/agents/types.ts lib/agents/trace.ts 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/agents/types.ts lib/agents/trace.ts && git -C multi-repo-nextjs commit -m "feat: add shared agent types and Trace system"
```

---

### Task 9: Dual Auth Helper

**Files:**
- Create: `multi-repo-nextjs/lib/auth/api-auth.ts`
- Reference: `99-neo-web/lib/auth/api-auth.ts` (60 lines — port directly)

- [ ] **Step 1: Create api-auth.ts**

Port from `99-neo-web/lib/auth/api-auth.ts`. This file exports `authenticateRequest(req: NextRequest)` which:
1. Checks for `Authorization: Bearer <jwt>` header (iOS path)
2. Falls back to cookie-based Supabase session (web path)
3. Returns `{ userId: string, supabase: SupabaseClient }` on success
4. Returns `null` on failure (caller returns 401)

Use the existing `createClient` from `@/lib/supabase/server` for cookie path. For JWT path, create a service-role client and verify the token via `supabase.auth.getUser(token)`.

- [ ] **Step 2: Update middleware.ts**

Modify `multi-repo-nextjs/middleware.ts` to exclude agent API routes from auth redirect. Add these paths to the exclusion check alongside the existing `/assistant-embed` and `/api/chatkit` exclusions:
- `/api/chat` (SSE endpoint — handles own auth via Bearer JWT)
- `/api/admin` (admin panel — handles own auth)
- `/api/ai` (transcription — handles own auth)

Read the current file first to understand the exact pattern used for path exclusion, then add the new paths in the same style.

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/auth/api-auth.ts middleware.ts && git -C multi-repo-nextjs commit -m "feat: add dual auth (cookie + JWT) and exclude agent routes from middleware"
```

---

### Task 10: Agent Context + Config Cache

**Files:**
- Create: `multi-repo-nextjs/lib/agents/context.ts`
- Create: `multi-repo-nextjs/lib/agents/config-cache.ts`
- Reference: `99-neo-web/lib/agents/context.ts` (314 lines), `99-neo-web/lib/agents/config-cache.ts` (269 lines)

- [ ] **Step 1: Create context.ts**

Port from `99-neo-web/lib/agents/context.ts`, replacing domain-specific fields. Keep:
- `AgentContext` interface (matches types.ts definition)
- `loadAgentContext(userId, sessionId, supabase)` → loads in parallel:
  - `loadMemories(userId, supabase)` — query `user_memories` where `is_active = true`, order by `confidence DESC`, limit 20
  - `buildProfileSummary(memories)` — compact string (<300 chars) summarizing user preferences
  - `loadChatHistory(sessionId, supabase)` — query `chat_messages` where `session_id`, order by `sequence_number`, limit 20, format as `"User: ...\nAssistant: ..."`

Remove all 99-neo specific fields: `buyerProfile`, `buyerName`, `engagementSignal`, `onOfficeWifi`, `isOnboarded`.

- [ ] **Step 2: Create config-cache.ts**

Port from `99-neo-web/lib/agents/config-cache.ts`. Keep:
- In-memory cache object with `agents`, `tools`, `agentTools`, `handoffs`, `lastLoaded` timestamp
- `loadFromDb(supabase)` — fetches all 4 tables in parallel, stores in cache
- `isStale()` — returns true if `Date.now() - lastLoaded > 5 * 60 * 1000`
- `invalidateCache()` — resets `lastLoaded` to 0
- `getAgentConfig(slug)` — returns cached config or null
- `applyDbOverrides(agent, dbConfig)` — patches model, temperature, system_prompt onto code-defined agent
- Cookie check: `useCodeFallback` reads `agent-code-fallback` cookie (req.cookies), if `true` skips DB

Remove domain-specific: `component_configs`, `agent_component_mappings`.

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/agents/context.ts lib/agents/config-cache.ts && git -C multi-repo-nextjs commit -m "feat: add AgentContext loader and config cache with DB fallback"
```

---

### Task 11: Chat Session Helpers

**Files:**
- Create: `multi-repo-nextjs/lib/chat/sessions.ts`
- Reference: `99-neo-web/lib/chat/sessions.ts` (149 lines — port directly)

- [ ] **Step 1: Create sessions.ts**

Port from `99-neo-web/lib/chat/sessions.ts`. Functions:
- `createSession(userId, supabase)` → insert into `chat_sessions`, return `{ id, isNew: true }`
- `getOrCreateSession(sessionId, userId, supabase)` → if sessionId provided and valid, return it; else create new
- `saveChatMessage(sessionId, role, content, agentName, toolCalls, supabase)` → insert into `chat_messages` with next sequence_number, update `chat_sessions.message_count` and `last_message_at`
- `loadChatHistory(sessionId, supabase, limit?)` → query `chat_messages` ordered by `sequence_number`, limit 20
- `listSessions(userId, supabase)` → query `chat_sessions` where `status = 'active'`, order by `last_message_at DESC`, limit 50
- `deleteSession(sessionId, userId, supabase)` → update `status = 'deleted'`

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/chat/sessions.ts && git -C multi-repo-nextjs commit -m "feat: add chat session CRUD helpers"
```

---

### Task 12: Pokemon Tools (PokéAPI Integration)

**Files:**
- Create: `multi-repo-nextjs/lib/agents/tools/lookup-pokemon.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/get-evolution-chain.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/analyze-type-matchup.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/suggest-team.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/get-move-details.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/search-pokemon-intel.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/save-memory.ts`
- Create: `multi-repo-nextjs/lib/agents/tools/index.ts`
- Reference: `99-neo-web/lib/agents/tools/save-memory.ts` (185 lines), `99-neo-web/lib/agents/tools/search-intel.ts` (385 lines — port RAG pattern)

- [ ] **Step 1: Create lookup-pokemon.ts**

Uses `@openai/agents` `tool()` function with Zod params:
- Parameter: `name: z.string()` (Pokémon name or dex number)
- Calls `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
- Returns `PokemonCardPayload` shape: `{ name, id, sprite (official-artwork), types, stats, abilities, height (dm→m), weight (hg→kg) }`
- Error case: return `{ error: "Pokémon not found" }` if 404

- [ ] **Step 2: Create get-evolution-chain.ts**

- Parameter: `name: z.string()`
- Step 1: fetch `https://pokeapi.co/api/v2/pokemon-species/${name}`
- Step 2: fetch the `evolution_chain.url` from species data
- Step 3: walk the chain recursively, collecting `{ name, id, sprite, trigger }` for each stage
- Returns `EvolutionCardPayload`

- [ ] **Step 3: Create analyze-type-matchup.ts**

- Parameter: `name: z.string()`
- Fetch pokemon data for types, then fetch `https://pokeapi.co/api/v2/type/${typeName}` for each type
- Compute combined weaknesses (2×), resistances (½×), immunities (0×) accounting for dual types
- Returns `TypeMatchupCardPayload`

- [ ] **Step 4: Create suggest-team.ts**

- Parameters: `core_pokemon: z.string()` (pokemon to build team around), `strategy: z.string().optional()` (e.g., "balanced", "offensive", "rain team")
- Fetch core pokemon types, compute weaknesses
- Suggest 5 complementary pokemon from a hardcoded pool of ~30 popular competitive pokemon (with types and roles)
- Compute coverage: which types are uncovered, which are double-resisted
- Returns `TeamCardPayload`

- [ ] **Step 5: Create get-move-details.ts**

- Parameter: `name: z.string()` (move name)
- Fetch `https://pokeapi.co/api/v2/move/${name.toLowerCase().replace(/ /g, '-')}`
- Return `{ name, type, power, accuracy, pp, damageClass, effectText }`
- This tool returns text, no card

- [ ] **Step 6: Create search-pokemon-intel.ts**

Port the RAG pattern from `99-neo-web/lib/agents/tools/search-intel.ts`:
- Parameter: `query: z.string()`
- Create embedding via `openai.embeddings.create({ model: 'text-embedding-3-small', input: query })`
- Call `supabase.rpc('search_intel', { query_embedding, match_count: 5, filter_entity_type: 'pokemon_species' })`
- Return concatenated chunk texts with section headers

- [ ] **Step 7: Create save-memory.ts**

Port from `99-neo-web/lib/agents/tools/save-memory.ts`:
- Parameters: `content: z.string()`, `memory_type: z.enum(['preference', 'requirement', 'context', 'feedback'])`, `confidence: z.number().optional()`
- Upsert to `user_memories` (on conflict `(user_id, content)` update `confidence`, `last_reinforced_at`, `is_active`)
- Deactivate contradicting memories (if type is 'preference' and content starts with same prefix)
- Return `{ saved: true, content }`

- [ ] **Step 8: Create tools/index.ts barrel**

```typescript
export { lookupPokemon } from './lookup-pokemon';
export { getEvolutionChain } from './get-evolution-chain';
export { analyzeTypeMatchup } from './analyze-type-matchup';
export { suggestTeam } from './suggest-team';
export { getMoveDetails } from './get-move-details';
export { searchPokemonIntel } from './search-pokemon-intel';
export { saveMemory } from './save-memory';
```

- [ ] **Step 9: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/agents/tools/ && git -C multi-repo-nextjs commit -m "feat: add 7 Pokemon tools (PokéAPI + RAG + memory)"
```

---

### Task 13: Pokemon Agents + Graph Wiring

**Files:**
- Create: `multi-repo-nextjs/lib/agents/triage.ts`
- Create: `multi-repo-nextjs/lib/agents/pokedex-expert.ts`
- Create: `multi-repo-nextjs/lib/agents/team-builder.ts`
- Create: `multi-repo-nextjs/lib/agents/battle-strategist.ts`
- Create: `multi-repo-nextjs/lib/agents/memory-agent.ts`
- Create: `multi-repo-nextjs/lib/agents/index.ts`
- Reference: `99-neo-web/lib/agents/triage.ts` (134 lines — use as pattern), `99-neo-web/lib/agents/index.ts` (246 lines — port graph wiring)

- [ ] **Step 1: Create triage.ts (PokéRouter)**

Use `new Agent<AgentContext>()` from `@openai/agents`:
- `name: "PokéRouter"`
- `model: "gpt-4.1-mini"`
- `is_entry_point: true`
- System prompt (via `instructions` function receiving context): "You are a routing agent for a Pokémon assistant. Classify user intent and hand off immediately. Never answer directly. Rules: species/abilities/evolution/lore → Pokédex Expert; team building/coverage → Team Builder; battle matchups/strategy/moves → Battle Strategist; preference statements → save memory inline then continue."
- `tools: [saveMemory]` (for inline memory saves)
- `handoffs: []` (wired in index.ts)

- [ ] **Step 2: Create pokedex-expert.ts**

- `name: "Pokédex Expert"`, `model: "gpt-4.1-mini"`, `temperature: 0.7`
- System prompt: "You are a Pokédex expert. You know everything about Pokémon species. Call at least one tool on every request. Always show pokemon_card when discussing a specific Pokémon. Use search_pokemon_intel for deep lore. Keep text responses under 200 words."
- `tools: [lookupPokemon, getEvolutionChain, searchPokemonIntel]`

- [ ] **Step 3: Create team-builder.ts**

- `name: "Team Builder"`, `model: "gpt-4.1-mini"`, `temperature: 0.8`
- System prompt: "You are a Pokémon team building expert. Analyze type coverage, suggest complementary team members. Always use suggest_team tool. Explain your reasoning for each pick."
- `tools: [suggestTeam, lookupPokemon, analyzeTypeMatchup]`

- [ ] **Step 4: Create battle-strategist.ts**

- `name: "Battle Strategist"`, `model: "gpt-4.1-mini"`, `temperature: 0.6`
- System prompt: "You are a Pokémon battle strategist. Analyze type matchups, recommend moves and held items. Use analyze_type_matchup for defensive analysis. Use get_move_details for move specifics."
- `tools: [analyzeTypeMatchup, getMoveDetails, lookupPokemon]`

- [ ] **Step 5: Create memory-agent.ts**

Port pattern from `99-neo-web/lib/agents/memory-agent.ts` (382 lines — simplify significantly):
- `name: "Memory Extractor"`, `is_background: true`
- System prompt: "Extract user preferences from the conversation. Look for: favorite types, preferred playstyle, team preferences, generation preferences. Save each as a separate memory."
- `tools: [saveMemory]`
- Called fire-and-forget after each response in the chat route

- [ ] **Step 6: Create index.ts (graph wiring)**

Port from `99-neo-web/lib/agents/index.ts` (246 lines):
- `buildAgentGraph()` → creates all 5 agents, wires handoffs:
  - PokéRouter → [Pokédex Expert, Team Builder, Battle Strategist]
  - Each specialist → [PokéRouter] (back-handoff)
- `getAgentGraph(supabase?, useCodeFallback?)` → checks config cache, applies DB overrides if available, returns `{ entryAgent, memoryAgent }`
- Cache the built graph in module scope, rebuild on cache invalidation

- [ ] **Step 7: Verify compilation**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npx tsc --noEmit lib/agents/*.ts lib/agents/tools/*.ts 2>&1 | head -20
```

- [ ] **Step 8: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/agents/ && git -C multi-repo-nextjs commit -m "feat: add Pokemon agent graph (PokéRouter + 3 specialists + memory)"
```

---

## WEB TRACK

---

### Task 14: Main Chat SSE Route

**Files:**
- Create: `multi-repo-nextjs/app/api/chat/route.ts`
- Reference: `99-neo-web/app/api/chat/route.ts` (987 lines — port core ~400 lines, strip domain logic)

- [ ] **Step 1: Create route.ts**

Port from 99-neo's chat route. This is the largest single file. Keep:
1. `authenticateRequest(req)` call at top
2. Parse body `{ message, sessionId }`
3. Create `new Trace(userId, sessionId)`
4. `getOrCreateSession()` — emit `session` event
5. `loadAgentContext()` in parallel (memories, history, profile summary) — use trace timers
6. `getAgentGraph(supabase)` — get entry agent
7. `TransformStream` + `TextEncoder` setup for SSE
8. `write(event, data)` helper that also calls `trace.sse()`
9. Set response headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `X-Trace-Id: trace.id`, `X-Accel-Buffering: no`
10. `run(entryAgent, [{ role: 'user', content: message }], { stream: true, context })` from `@openai/agents`
11. Stream event loop:
    - `run_item_stream_event` with `output_text_delta` → `write('text_delta', { token })`
    - `run_item_stream_event` with `tool_call_item` → `write('tool_call', { label, toolName })`, then call tool, if tool returns card data → `write('pokemon_card' | 'evolution_card' | etc, data)`
    - Agent updated → `write('tool_call', { label: agentLabel, agentName })`
12. After stream: `write('message_done', { fullText, agentName })`, `write('done', {})`
13. Background (after stream closes): `saveChatMessage()` for user + assistant, run memory agent fire-and-forget, `trace.persist(supabase)`
14. Return `new Response(readable, { headers })`

Remove from 99-neo: all domain-specific card emission (project_cards, floor_plan_cards, map_card, etc.), persuasion agent, engagement tracking, onboarding gate, 99acres search, commentary generation.

Target: ~400 lines.

- [ ] **Step 2: Verify the route compiles**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npx tsc --noEmit app/api/chat/route.ts 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/api/chat/route.ts && git -C multi-repo-nextjs commit -m "feat: add main chat SSE streaming endpoint with Pokemon agent integration"
```

---

### Task 15: Session & Debug API Routes

**Files:**
- Create: `multi-repo-nextjs/app/api/chat/sessions/route.ts`
- Create: `multi-repo-nextjs/app/api/chat/sessions/[id]/route.ts`
- Create: `multi-repo-nextjs/app/api/chat/sessions/[id]/messages/route.ts`
- Create: `multi-repo-nextjs/app/api/chat/debug/route.ts`
- Reference: 99-neo equivalents (14 + 34 + 18 + 51 lines — port directly)

- [ ] **Step 1: Create sessions/route.ts**

- `POST` → `authenticateRequest`, call `createSession(userId, supabase)`, return JSON
- `GET` → `authenticateRequest`, call `listSessions(userId, supabase)`, return JSON

- [ ] **Step 2: Create sessions/[id]/route.ts**

- `GET` → authenticate, fetch session by id (verify ownership), return JSON
- `DELETE` → authenticate, call `deleteSession(id, userId, supabase)`, return 204

- [ ] **Step 3: Create sessions/[id]/messages/route.ts**

- `GET` → authenticate, call `loadChatHistory(id, supabase)`, return JSON

- [ ] **Step 4: Create debug/route.ts**

Port from `99-neo-web/app/api/chat/debug/route.ts` (51 lines):
- `GET ?sessionId=xxx` → query `debug_traces` where `session_id`, return traces
- `GET ?traceId=xxx` → query `debug_traces` where `trace_id`, return single trace
- Auth required, return 401 if unauthenticated

- [ ] **Step 5: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/api/chat/ && git -C multi-repo-nextjs commit -m "feat: add chat session CRUD and debug trace API routes"
```

---

### Task 16: Transcription API Route

**Files:**
- Create: `multi-repo-nextjs/app/api/ai/transcribe/route.ts`

- [ ] **Step 1: Create transcribe/route.ts**

- `POST` with `multipart/form-data` body containing audio file
- `authenticateRequest(req)`
- Use `openai.audio.transcriptions.create({ model: 'whisper-1', file })` (openai SDK already installed)
- Return `{ text: transcription.text }`
- Error handling: return 400 if no audio file, 500 if OpenAI fails

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/api/ai/transcribe/route.ts && git -C multi-repo-nextjs commit -m "feat: add audio transcription API route for iOS voice input"
```

---

### Task 17: useChatStream Hook

**Files:**
- Create: `multi-repo-nextjs/lib/hooks/use-chat-stream.ts`

- [ ] **Step 1: Create use-chat-stream.ts**

React hook (~150 lines) that manages SSE connection and message state:

```typescript
export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const debugEvents = useDebugEvents();

  async function sendMessage(text: string) { ... }
  function loadSession(id: string) { ... }
  function newChat() { ... }

  return { messages, isStreaming, sessionId, sendMessage, loadSession, newChat, debugEvents };
}
```

`sendMessage` flow:
1. Append user message to `messages` immediately
2. Append thinking placeholder (event type)
3. `fetch('/api/chat', { method: 'POST', body: { message: text, sessionId } })`
4. Read `X-Trace-Id` header → `debugEvents.captureTraceId(id)`
5. `debugEvents.captureEvent('user_message', { text })`
6. Read response body as stream: `response.body.getReader()`
7. Parse SSE lines: look for `event: ` and `data: ` prefixes
8. For each parsed event: `debugEvents.captureEvent(eventType, data)` AND update messages state:
   - `session` → `setSessionId(data.sessionId)`
   - `agent_thinking` → (already showing placeholder)
   - `tool_call` → update placeholder label
   - `text_delta` → accumulate text in current assistant message
   - `pokemon_card` / `evolution_card` / `type_matchup_card` / `team_card` → append card to current message's `cards` array
   - `message_done` → finalize message text + agentName
   - `done` → `setIsStreaming(false)`
   - `error` → append error message

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/hooks/use-chat-stream.ts && git -C multi-repo-nextjs commit -m "feat: add useChatStream SSE hook"
```

---

### Task 18: useDebugEvents Hook

**Files:**
- Create: `multi-repo-nextjs/lib/hooks/use-debug-events.ts`
- Reference: `99-neo-web/app/components/chat/DebugPanel.tsx` (656 lines — extract hook logic from within)

- [ ] **Step 1: Create use-debug-events.ts**

Extract the debug event capture logic from 99-neo's DebugPanel into a standalone hook (~80 lines):

```typescript
interface DebugEvent {
  timestamp: number;
  elapsed: number;      // ms since first event
  eventType: string;
  payloadSize: number;
  payload: unknown;
  preview: string;      // human-readable 1-line summary
}

export function useDebugEvents() {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [traceId, setTraceId] = useState<string | null>(null);
  const firstTimestamp = useRef<number | null>(null);
  const tokenBuffer = useRef({ tokens: '', count: 0, startTime: 0 });

  function captureEvent(eventType: string, data: unknown) { ... }
  function captureTraceId(id: string) { ... }
  function resetEvents() { ... }

  return { events, traceId, captureEvent, captureTraceId, resetEvents };
}
```

Key behaviors:
- `text_delta` tokens buffered in ref, NOT emitted individually
- On `message_done`: flush buffer as single `text_message` event with `tokenCount` and `streamDuration`
- `preview` generation: event-type-specific one-liners (e.g., tool_call → "lookup_pokemon({name: 'charizard'})", pokemon_card → "Charizard #6")
- `payloadSize`: `JSON.stringify(data).length`
- `elapsed`: `timestamp - firstTimestamp`

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add lib/hooks/use-debug-events.ts && git -C multi-repo-nextjs commit -m "feat: add useDebugEvents hook with token buffering"
```

---

### Task 19: Chat UI Components (Core)

**Files:**
- Create: `multi-repo-nextjs/app/components/Chat/ChatPage.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/ChatHeader.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/ChatMessageList.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/ChatMessage.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/ChatInput.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/StreamEventPill.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/ChatHistorySheet.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/index.ts`

- [ ] **Step 1: Create ChatPage.tsx (~100 lines)**

Layout shell. `'use client'` directive. Uses `useChatStream()` hook. Renders:
- `<ChatHeader>` with title, history toggle, debug toggle (bug icon, `hidden md:flex`)
- `<ChatMessageList>` with messages + isStreaming
- `<ChatInput>` with sendMessage + isStreaming
- Conditional `<DebugPanel>` when `debugOpen === true`
- State: `debugOpen: boolean`, history sheet open state

- [ ] **Step 2: Create ChatHeader.tsx (~40 lines)**

- Left: "PokéChat" title (or app name)
- Center: nothing
- Right: history icon button + debug bug icon button (desktop only)
- Props: `onHistoryToggle`, `onDebugToggle`, `debugOpen`

- [ ] **Step 3: Create ChatMessageList.tsx (~80 lines)**

- Scrollable container (`overflow-y-auto`, `flex-1`)
- `useRef` for scroll container + `useEffect` auto-scroll on messages change
- Maps `messages` to `<ChatMessage>` components
- Shows "Start a conversation" empty state when no messages

- [ ] **Step 4: Create ChatMessage.tsx (~60 lines)**

Switch on message type:
- `role === 'user'` → right-aligned bubble with `bg-[var(--surfaces-base-low-contrast)]` (semantic token)
- `role === 'assistant'` → left-aligned, render content via `<ReactMarkdown remarkPlugins={[remarkGfm]}>`, then render `cards` array below text
- `role === 'event'` → `<StreamEventPill>`
- Card rendering: map over `message.cards`, switch on `card.type` → `<PokemonCard>`, `<EvolutionCard>`, etc.

- [ ] **Step 5: Create ChatInput.tsx (~50 lines)**

- `<textarea>` with auto-grow (1-5 lines), controlled via `inputValue` state
- Enter = send (call `onSend(inputValue)`, clear input), Shift+Enter = newline
- Send button (right side) — disabled when `inputValue.trim() === ''` or `isStreaming`
- Props: `onSend: (text: string) => void`, `isStreaming: boolean`

- [ ] **Step 6: Create StreamEventPill.tsx (~40 lines)**

Port from 99-neo's `SSEStreamEventView` concept:
- Horizontal pill with rotating star icon (CSS animation) + shimmer text
- Props: `label: string` (e.g., "Searching Pokédex...", "Analyzing types...")
- Shimmer via CSS gradient animation on text

- [ ] **Step 7: Create ChatHistorySheet.tsx (~60 lines)**

- Slide-in sidebar (left) or bottom sheet on mobile
- Lists sessions from `GET /api/chat/sessions`
- Each item: title (or "New chat"), last message timestamp, message count
- Click → `loadSession(id)`
- Swipe-to-delete or delete button → `DELETE /api/chat/sessions/{id}`
- "New Chat" button at top

- [ ] **Step 8: Create index.ts barrel**

```typescript
export { ChatPage } from './ChatPage';
```

- [ ] **Step 9: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/components/Chat/ && git -C multi-repo-nextjs commit -m "feat: add decomposed chat UI components (ChatPage, MessageList, Input, Header, History)"
```

---

### Task 20: Pokemon Card Components (Web)

**Files:**
- Create: `multi-repo-nextjs/app/components/Chat/cards/PokemonCard.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/cards/EvolutionCard.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/cards/TypeMatchupCard.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/cards/TeamCard.tsx`

- [ ] **Step 1: Create PokemonCard.tsx (~120 lines)**

Props: `data: PokemonCardPayload`
- Top: sprite image (96×96, `next/image` or `<img>`) + name (capitalize) + `#${id}` dex number
- Type badges: horizontal row of colored pills. Color map: `{ fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F8D030', psychic: '#F85888', ice: '#98D8D8', dragon: '#7038F8', dark: '#705848', fairy: '#EE99AC', normal: '#A8A878', fighting: '#C03028', flying: '#A890F0', poison: '#A040A0', ground: '#E0C068', rock: '#B8A038', bug: '#A8B820', ghost: '#705898', steel: '#B8B8D0' }`
- Stats: 6 horizontal bars (HP, Attack, Defense, Sp.Atk, Sp.Def, Speed). Bar width = `(value / 255) * 100%`. Label + value on left, bar on right.
- Abilities: comma-separated below stats
- Footer: Height (m) + Weight (kg)
- Card styled with `rounded-xl border` using semantic tokens

- [ ] **Step 2: Create EvolutionCard.tsx (~80 lines)**

Props: `data: EvolutionCardPayload`
- Horizontal flex row with arrows between stages
- Each stage: sprite (64×64) + name below
- Arrow: `→` with trigger text above (e.g., "Lv 16", "Trade", "Fire Stone")
- Wraps on mobile via `flex-wrap`

- [ ] **Step 3: Create TypeMatchupCard.tsx (~90 lines)**

Props: `data: TypeMatchupCardPayload`
- Header: Pokémon name + sprite
- Three sections: "Weak to (2×)" in red-tinted rows, "Resists (½×)" in green-tinted rows, "Immune to (0×)" in gray rows
- Each row: type badge (colored pill) + multiplier
- Use same type color map as PokemonCard

- [ ] **Step 4: Create TeamCard.tsx (~100 lines)**

Props: `data: TeamCardPayload`
- 2×3 grid of mini cards (3 columns on desktop, 2 on mobile)
- Each mini card: sprite (48×48) + name + type badges + role label (smaller text, muted)
- Footer: coverage summary — "Uncovered types: Ground, Ice" in warning color, or "Full coverage!" in success color

- [ ] **Step 5: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/components/Chat/cards/ && git -C multi-repo-nextjs commit -m "feat: add Pokemon card components (PokemonCard, EvolutionCard, TypeMatchup, TeamCard)"
```

---

### Task 21: Debug Panel (Web)

**Files:**
- Create: `multi-repo-nextjs/app/components/Chat/debug/DebugPanel.tsx`
- Create: `multi-repo-nextjs/app/components/Chat/debug/DebugEventRow.tsx`
- Reference: `99-neo-web/app/components/chat/DebugPanel.tsx` (656 lines — port UI, hook is already separate)

- [ ] **Step 1: Create DebugPanel.tsx (~300 lines)**

Port from 99-neo's DebugPanel. Props: `isOpen, onToggle, events: DebugEvent[], traceId, sessionId, onClearEvents`.

Key features to port exactly:
- Right-side fixed panel (`position: fixed`, `right: 0`, `top: 0`, `height: 100vh`)
- Drag-resizable width (300-800px) via pointer events on left edge: `isDragging`, `startX`, `startWidth` state, `onPointerDown/Move/Up` handlers
- Filter input at top (case-insensitive substring match on `eventType + preview`)
- Scrollable event list with auto-scroll (`scrollRef` + `requestAnimationFrame` after events change)
- Stats footer: `Total {elapsed}ms | Msgs {count} | Tools {count} | Cards {count}`
- Action bar buttons:
  - **Export** → download `debug-${traceId}-${Date.now()}.json` with `{ traceId, sessionId, events, exportedAt }`
  - **Server** → `fetch('/api/chat/debug?sessionId=${sessionId}')`, download result
  - **Copy** → dropdown with "All events" and "Last message" options → `navigator.clipboard.writeText()`
  - **Clear** → `onClearEvents()`

- TYPE_COLORS constant (adapt from 99-neo, replace domain types with Pokemon types):
```typescript
const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  user_message: { bg: 'rgba(52,152,219,0.18)', fg: '#2980b9' },
  session: { bg: 'rgba(107,203,119,0.12)', fg: '#6bcb77' },
  agent_thinking: { bg: 'rgba(155,89,182,0.12)', fg: '#9b59b6' },
  tool_call: { bg: 'rgba(243,156,18,0.12)', fg: '#f39c12' },
  tool_result: { bg: 'rgba(46,204,113,0.12)', fg: '#27ae60' },
  text_message: { bg: 'rgba(52,152,219,0.10)', fg: '#3498db' },
  pokemon_card: { bg: 'rgba(231,76,60,0.12)', fg: '#e74c3c' },
  evolution_card: { bg: 'rgba(230,126,34,0.12)', fg: '#e67e22' },
  type_matchup_card: { bg: 'rgba(26,188,156,0.12)', fg: '#1abc9c' },
  team_card: { bg: 'rgba(46,204,113,0.12)', fg: '#2ecc71' },
  message_done: { bg: 'rgba(44,62,80,0.12)', fg: '#7f8c8d' },
  done: { bg: 'rgba(127,140,141,0.10)', fg: '#95a5a6' },
  error: { bg: 'rgba(255,0,0,0.12)', fg: '#ff4444' },
};
```

- [ ] **Step 2: Create DebugEventRow.tsx (~100 lines)**

Port from within 99-neo's DebugPanel (the row rendering logic):
- Collapsed view: `elapsed` (right-aligned, monospace, ~60px) | type badge (colored bg/fg, 72px min-width) | preview (truncated, flex-1) | payload size (e.g., "1.2K" or "523B")
- Click to expand → shows full JSON payload (`JSON.stringify(data, null, 2)` in `<pre>`)
- Special expanded views:
  - `tool_call`: "Agent: {agentName}" + "Tool: {toolName}" + "Input" + JSON of args
  - `tool_result`: "Tool: {toolName} — {durationMs}ms" + "Output" + JSON
  - `text_message`: "{tokenCount} tokens · streamed in {streamDuration}" + text preview
  - `error`: "Source: {source}" + "Message" + error text + "Stack" + stack trace

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/components/Chat/debug/ && git -C multi-repo-nextjs commit -m "feat: add DebugPanel with resizable panel, filtering, export, and event rows"
```

---

### Task 22: Wire Chat to Home Page

**Files:**
- Modify: `multi-repo-nextjs/app/(authenticated)/page.tsx`

- [ ] **Step 1: Read current home page**

Read `multi-repo-nextjs/app/(authenticated)/page.tsx` to understand current content.

- [ ] **Step 2: Replace with ChatPage**

Replace the home page content with the ChatPage component:

```typescript
import { ChatPage } from '@/app/components/Chat';

export default function Home() {
  return <ChatPage />;
}
```

This makes the chat the primary experience (Tab 1 / home route).

- [ ] **Step 3: Verify build**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm run build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/\(authenticated\)/page.tsx && git -C multi-repo-nextjs commit -m "feat: wire ChatPage as home page"
```

---

### Task 23: Admin Panel — API Routes

**Files:**
- Create: `multi-repo-nextjs/app/api/admin/me/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/agents/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/agents/[id]/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/tools/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/tools/[id]/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/handoffs/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/versions/route.ts`
- Create: `multi-repo-nextjs/app/api/admin/versions/[id]/route.ts`
- Reference: `99-neo-web/app/api/admin/` (port agent/tool/version routes, skip domain-specific data routes)

- [ ] **Step 1: Create me/route.ts (~20 lines)**

- `GET` → authenticate, query `admin_roles` for `auth.uid()`, return `{ isAdmin: true, role }` or `{ isAdmin: false }`

- [ ] **Step 2: Create agents/route.ts (~35 lines)**

- `GET` → authenticate + admin check, query `agent_configs` ordered by `is_entry_point DESC, name`, return JSON array
- `POST` → authenticate + admin check, insert new `agent_configs` row, invalidate config cache, return created agent

- [ ] **Step 3: Create agents/[id]/route.ts (~60 lines)**

- `GET` → authenticate + admin check, fetch agent by id with joined tools (via `agent_tools`) and handoffs (via `agent_handoffs`), return JSON
- `PUT` → authenticate + admin check, update `agent_configs` row (model, temperature, system_prompt), update `agent_tools` and `agent_handoffs` relationships, invalidate cache, return updated agent
- `DELETE` → authenticate + admin check, delete `agent_configs` row (cascades to agent_tools, agent_handoffs), invalidate cache, return 204

- [ ] **Step 4: Create tools/route.ts + tools/[id]/route.ts (~75 lines total)**

Same pattern as agents but for `tool_definitions` table. PUT accepts `parameters_schema` as JSON.

- [ ] **Step 5: Create handoffs/route.ts (~40 lines)**

- `GET` → return full handoff graph as `{ sourceSlug, targetSlug, description, sortOrder }[]`
- `PUT` → replace all handoffs (delete + bulk insert), invalidate cache

- [ ] **Step 6: Create versions/route.ts + versions/[id]/route.ts (~80 lines total)**

- `GET /versions` → list versions ordered by `published_at DESC`
- `POST /versions` → snapshot current `agent_configs + tool_definitions + agent_tools + agent_handoffs` as JSONB, increment version_number, return version
- `GET /versions/[id]` → return version snapshot
- `POST /versions/[id]` (rollback) → load snapshot, replace all 4 tables' contents, invalidate cache, return restored version

- [ ] **Step 7: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/api/admin/ && git -C multi-repo-nextjs commit -m "feat: add admin API routes for agent/tool/handoff/version CRUD"
```

---

### Task 24: Admin Panel — UI Pages

**Files:**
- Create: `multi-repo-nextjs/app/(authenticated)/admin/layout.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/page.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/agents/page.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/agents/[id]/AgentEditorClient.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/tools/page.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/tools/[id]/ToolEditorClient.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/versions/page.tsx`
- Create: `multi-repo-nextjs/app/(authenticated)/admin/test/page.tsx`
- Reference: `99-neo-web/app/(authenticated)/admin/` (port UI structure, simplify)

- [ ] **Step 1: Create admin/layout.tsx (~50 lines)**

- Server component that checks admin role via `GET /api/admin/me`
- If not admin: render 403 page with "Access Denied"
- If admin: render sidebar nav + children
- Sidebar links: Dashboard, Agents, Tools, Versions, Test

- [ ] **Step 2: Create admin/page.tsx (Dashboard, ~80 lines)**

- Fetch all agents and handoffs
- Render agent graph as a visual diagram (simple CSS-based: entry agent at top, arrows to specialists, back arrows)
- Show stats: total agents, total tools, last version timestamp

- [ ] **Step 3: Create agents/page.tsx (~40 lines)**

- Fetch `GET /api/admin/agents`
- List agents in a table: name, slug, model, temperature, is_entry_point badge, is_background badge
- Click row → navigate to `/admin/agents/[id]`
- "New Agent" button

- [ ] **Step 4: Create agents/[id]/AgentEditorClient.tsx (~150 lines)**

`'use client'` component. Port from 99-neo's `AgentEditorClient.tsx`:
- Model dropdown: `gpt-4.1-mini`, `gpt-4.1`, `gpt-4o-mini`, `gpt-4o`
- Temperature slider: 0.0 → 1.0, step 0.1
- System prompt: `<textarea>` (full height, monospace)
- Tools: checkboxes listing all `tool_definitions`, checked = linked via `agent_tools`
- Handoffs: list of target agents with drag-to-reorder, description override text field
- Save button → `PUT /api/admin/agents/[id]`
- "Publish Version" button → `POST /api/admin/versions` (snapshots entire graph)

- [ ] **Step 5: Create tools pages (~100 lines total)**

Same pattern as agents. Tool editor has: name, slug, description, `parameters_schema` (JSON textarea with syntax highlighting via `<pre contentEditable>`), `code_ref` (read-only, shows which file implements it).

- [ ] **Step 6: Create versions/page.tsx (~60 lines)**

- List versions: version number, published date, published by, notes
- "Rollback" button per version → `POST /api/admin/versions/[id]` with confirmation dialog
- Current version highlighted

- [ ] **Step 7: Create test/page.tsx (~100 lines)**

- Mini chat interface (text input + send)
- Inline SSE event log (simplified DebugPanel — table of events with type + preview)
- Tests the current agent configuration (same `/api/chat` endpoint)
- Useful for verifying prompt changes before publishing a version

- [ ] **Step 8: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add app/\(authenticated\)/admin/ && git -C multi-repo-nextjs commit -m "feat: add admin panel UI (dashboard, agent/tool editors, versions, test page)"
```

---

### Task 25: Web Build Verification

- [ ] **Step 1: Run full build**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm run build 2>&1 | tail -30
```

Fix any TypeScript or build errors.

- [ ] **Step 2: Run lint**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm run lint 2>&1 | tail -20
```

Fix any lint errors.

- [ ] **Step 3: Manual test**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm run dev
```

Open `http://localhost:3000`. Verify:
- Chat page loads as home
- Can type a message and send (will fail without OPENAI_API_KEY — that's expected)
- Debug panel opens when clicking bug icon
- Admin panel accessible at `/admin` (will show 403 until admin_roles is seeded)

- [ ] **Step 4: Commit any fixes**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-nextjs add -A && git -C multi-repo-nextjs commit -m "fix: resolve build and lint issues in web chat + admin"
```

---

## iOS TRACK

---

### Task 26: iOS SSE Client (AgentService)

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Services/AgentService.swift`
- Create: `multi-repo-ios/multi-repo-ios/Models/AgentEvent.swift`
- Reference: `99-neo-ios/Services/NeevaService.swift` (435 lines — port and rename)

- [ ] **Step 1: Create AgentEvent.swift (~60 lines)**

```swift
import Foundation

enum AgentEvent {
    case session(id: String, isNew: Bool)
    case agentThinking
    case toolCall(label: String)
    case textDelta(token: String)
    case pokemonCard(PokemonCardData)
    case evolutionCard(EvolutionCardData)
    case typeMatchupCard(TypeMatchupCardData)
    case teamCard(TeamCardData)
    case messageDone(fullText: String, agentName: String)
    case done
    case error(message: String)
}
```

- [ ] **Step 2: Create AgentService.swift (~400 lines)**

Port from `NeevaService.swift`, rename `Neeva` → `Agent` throughout:
- `AgentService.shared` singleton
- `baseURL` resolution: Xcode env var `AGENT_BASE_URL` → Info.plist `AGENT_BASE_URL` → production fallback (Vercel URL from scaffold)
- `send(message: String, sessionId: String?, jwt: String) -> AsyncStream<AgentEvent>`:
  - `URLRequest` to `\(baseURL)/api/chat`
  - Method: POST, body: `{ "message": message, "sessionId": sessionId }`
  - Headers: `Authorization: Bearer \(jwt)`, `Content-Type: application/json`, `Accept: text/event-stream`, `Accept-Encoding: identity`
  - Timeout: 120s
  - `URLSession.shared.bytes(for: request)`
  - Parse lines: look for `event: ` and `data: ` prefixes
  - JSON decode each data payload based on event type
  - Yield `AgentEvent` cases via `AsyncStream.Continuation`
- `warmup(jwt: String)` → HEAD request to `/api/chat` (pre-connect)
- All JSON decoding uses `JSONDecoder` with standard settings
- Error handling: yield `.error(message)` on decode failures, don't crash stream

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Services/AgentService.swift multi-repo-ios/Models/AgentEvent.swift && git -C multi-repo-ios commit -m "feat: add AgentService SSE client and AgentEvent enum"
```

---

### Task 27: iOS Chat Card Models

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Models/ChatCardModels.swift`
- Reference: `99-neo-ios/Models/ChatCardModels.swift` (136 lines — rewrite for Pokemon)

- [ ] **Step 1: Create ChatCardModels.swift (~100 lines)**

```swift
import Foundation

struct PokemonCardData: Codable, Identifiable {
    let name: String
    let id: Int
    let sprite: String
    let types: [String]
    let stats: [PokemonStat]
    let abilities: [String]
    let height: Double
    let weight: Double
}

struct PokemonStat: Codable {
    let name: String
    let value: Int
}

struct EvolutionCardData: Codable {
    let chain: [EvolutionStage]
}

struct EvolutionStage: Codable, Identifiable {
    let name: String
    let id: Int
    let sprite: String
    let trigger: String
}

struct TypeMatchupCardData: Codable {
    let pokemon: String
    let weaknesses: [TypeMultiplier]
    let resistances: [TypeMultiplier]
    let immunities: [String]
}

struct TypeMultiplier: Codable {
    let type: String
    let multiplier: Double
}

struct TeamCardData: Codable {
    let team: [TeamMember]
    let coverage: TeamCoverage
}

struct TeamMember: Codable, Identifiable {
    let name: String
    let id: Int
    let sprite: String
    let types: [String]
    let role: String
}

struct TeamCoverage: Codable {
    let uncovered: [String]
    let doubleResisted: [String]
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Models/ChatCardModels.swift && git -C multi-repo-ios commit -m "feat: add Pokemon chat card models"
```

---

### Task 28: iOS Chat Session Service

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Services/ChatSessionService.swift`
- Reference: `99-neo-ios/Services/ChatSession.swift` (154 lines — port and rename)

- [ ] **Step 1: Create ChatSessionService.swift (~150 lines)**

Port from `ChatSession.swift`:
- `ChatSessionService.shared` singleton
- Uses same `baseURL` resolution as `AgentService`
- `listSessions(jwt: String) async throws -> [ChatSessionSummary]`
- `loadMessages(sessionId: String, jwt: String) async throws -> [ChatMessageRecord]`
- `deleteSession(sessionId: String, jwt: String) async throws`

Model structs:
```swift
struct ChatSessionSummary: Codable, Identifiable {
    let id: String
    let title: String?
    let status: String
    let activeAgent: String?
    let messageCount: Int
    let lastMessageAt: String
    let startedAt: String
}

struct ChatMessageRecord: Codable, Identifiable {
    let id: String
    let role: String
    let content: String?
    let agentName: String?
    let toolCalls: ToolCallsPayload?
    let createdAt: String
    let sequenceNumber: Int
}

struct ToolCallsPayload: Codable {
    let pokemonCards: [PokemonCardData]?
    let evolutionCards: [EvolutionCardData]?
    let typeMatchupCards: [TypeMatchupCardData]?
    let teamCards: [TeamCardData]?
}
```

Use `CodingKeys` with `snake_case` → `camelCase` mapping. All requests use `Authorization: Bearer \(jwt)`.

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Services/ChatSessionService.swift && git -C multi-repo-ios commit -m "feat: add ChatSessionService for REST session management"
```

---

### Task 29: iOS ChatViewModel

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Views/Chat/ChatViewModel.swift`
- Reference: `99-neo-ios/Views/Chat/ChatViewModel.swift` (348 lines — port and adapt)

- [ ] **Step 1: Create ChatViewModel.swift (~350 lines)**

Port from 99-neo's `ChatViewModel`:

```swift
import Foundation
import SwiftUI

enum ChatMessage: Identifiable {
    case user(id: UUID = UUID(), text: String)
    case aiText(id: UUID = UUID(), markdown: String)
    case aiEvent(id: UUID = UUID(), events: [SSEEvent])
    case aiPokemonCard(id: UUID = UUID(), data: PokemonCardData)
    case aiEvolutionCard(id: UUID = UUID(), data: EvolutionCardData)
    case aiTypeMatchupCard(id: UUID = UUID(), data: TypeMatchupCardData)
    case aiTeamCard(id: UUID = UUID(), data: TeamCardData)

    var id: UUID { /* switch on cases, return id */ }
}

enum SSEEvent {
    case thinking
    case toolCall(label: String)
    case done
}

@Observable @MainActor
final class ChatViewModel {
    var messages: [ChatMessage] = []
    var sessionId: String?
    var isStreaming = false
    var historySessions: [ChatSessionSummary] = []
    var streamToken: Int = 0  // increment to trigger scroll

    func sendMessage(_ text: String, preSeeded: Bool = false) async { ... }
    func seedMessages(for text: String) { ... }
    func loadHistory() async { ... }
    func loadSession(_ summary: ChatSessionSummary) async { ... }
    func deleteSession(_ id: String) async { ... }
    func newChat() { ... }
}
```

Key methods:
- `seedMessages(for:)` — synchronously appends `.user(text)` + `.aiEvent([.thinking])` before async work
- `sendMessage(_:)` — gets JWT from `SupabaseManager.shared.client.auth.session`, calls `AgentService.shared.send()`, iterates `AsyncStream<AgentEvent>`:
  - `.textDelta(token)` → accumulate in buffer, update last `.aiText` message, increment `streamToken`
  - `.toolCall(label)` → update `.aiEvent` with new label
  - `.pokemonCard(data)` → append `.aiPokemonCard(data)`
  - `.evolutionCard(data)` → append `.aiEvolutionCard(data)`
  - `.typeMatchupCard(data)` → append `.aiTypeMatchupCard(data)`
  - `.teamCard(data)` → append `.aiTeamCard(data)`
  - `.messageDone(fullText, agentName)` → finalize `.aiText` with full text
  - `.done` → `isStreaming = false`
  - `.error(message)` → append `.aiText(markdown: "Error: \(message)")`
- All mutations wrapped in `withAnimation { }`
- Haptic feedback (light impact) every 5th text delta via counter

- [ ] **Step 2: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Views/Chat/ChatViewModel.swift && git -C multi-repo-ios commit -m "feat: add ChatViewModel with SSE stream consumption"
```

---

### Task 30: iOS ChatView + ChatInputBar

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Views/Chat/ChatView.swift`
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/ChatInputBar.swift`
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/SSEStreamEventView.swift`
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/ChatHistoryView.swift`
- Reference: `99-neo-ios/Views/Chat/ChatView.swift` (468 lines), `99-neo-ios/Components/Chat/ChatInputBar.swift` (216 lines), `99-neo-ios/Components/Chat/SSEStreamEventView.swift` (186 lines)

- [ ] **Step 1: Create ChatView.swift (~400 lines)**

Port from 99-neo's `ChatView`:
- `@State private var vm = ChatViewModel()`
- `@State private var inputText = ""`
- Custom header with blur-on-scroll (via `ScrollOffsetKey` PreferenceKey)
- `ScrollViewReader` wrapping `LazyVStack` of messages
- Message rendering: switch on `ChatMessage` case → user bubble (right), AI markdown (left via MarkdownUI), event pill, card views
- Auto-scroll on `vm.streamToken` change via `.onChange(of:)`
- Context menu on messages: Copy, Share
- History sheet at 90% height via `.sheet(isPresented:)`
- Bottom sticky `ChatInputBar`
- `.task { await vm.loadHistory() }` on appear

- [ ] **Step 2: Create ChatInputBar.swift (~150 lines)**

Port from 99-neo:
- Pill-shaped container with `Capsule()` background
- Multi-line `TextField` (1-5 lines, `.lineLimit(1...5)`)
- Mic button (left side) — tap to start recording, tap again to stop + transcribe
- Send button (right side, blue) — disabled when empty or streaming
- Props: `text: Binding<String>`, `isStreaming: Bool`, `onSend: (String) -> Void`, `onTranscription: (String) -> Void`
- Mic state managed internally: `isRecording`, `audioRecorder` reference

- [ ] **Step 3: Create SSEStreamEventView.swift (~100 lines)**

Port from 99-neo:
- Horizontal pill showing current agent activity
- Rotating star icon via `RotationEffect` with `Animation.linear(duration: 2).repeatForever()`
- Shimmer text animation on label
- Input: `[SSEEvent]` array, renders the last non-done event

- [ ] **Step 4: Create ChatHistoryView.swift (~80 lines)**

Port from 99-neo's `ChatHistorySheet`:
- `List` of `ChatSessionSummary` items
- Each row: title (or "New chat"), timestamp, message count badge
- Tap → `vm.loadSession(summary)` + dismiss sheet
- Swipe-to-delete → `vm.deleteSession(summary.id)`
- "New Chat" button at top

- [ ] **Step 5: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Views/Chat/ multi-repo-ios/Components/Chat/ && git -C multi-repo-ios commit -m "feat: add ChatView, ChatInputBar, SSEStreamEventView, ChatHistoryView"
```

---

### Task 31: iOS Pokemon Card Views

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/PokemonCardView.swift`
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/EvolutionCardView.swift`
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/TypeMatchupCardView.swift`
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/Cards/TeamCardView.swift`

- [ ] **Step 1: Create PokemonCardView.swift (~120 lines)**

- `AsyncImage(url:)` for sprite (96×96)
- Name (capitalized) + "#\(id)" dex number
- Type badges: horizontal `HStack` of `Text` pills with type-specific background colors (same color map as web)
- Stat bars: `ForEach(data.stats)` → label + `ProgressView` or custom `GeometryReader` bar, value label
- Abilities: comma-separated `Text`
- Height/weight footer
- Card container: `.background(Color.surfacesBasePrimary)`, `.clipShape(RoundedRectangle(cornerRadius: .radiusMD))`

- [ ] **Step 2: Create EvolutionCardView.swift (~80 lines)**

- Horizontal `ScrollView(.horizontal)` with `HStack`
- Each stage: `AsyncImage` (64×64) + name `Text`
- Between stages: arrow `Image(systemName: "arrow.right")` + trigger text

- [ ] **Step 3: Create TypeMatchupCardView.swift (~90 lines)**

- Header with pokemon name
- Three sections with section headers: "Weak to", "Resists", "Immune to"
- Each item: type badge pill + multiplier text
- Color-coded: red for weaknesses, green for resistances, gray for immunities

- [ ] **Step 4: Create TeamCardView.swift (~100 lines)**

- `LazyVGrid(columns: [.init(), .init(), .init()])` for 3-column layout
- Each cell: `AsyncImage` (48×48) + name + type mini-badges + role label (muted text)
- Footer: coverage summary text

- [ ] **Step 5: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Components/Chat/Cards/ && git -C multi-repo-ios commit -m "feat: add Pokemon card SwiftUI views"
```

---

### Task 32: iOS Voice Input

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/Audio/AppAudioRecorder.swift`
- Create: `multi-repo-ios/multi-repo-ios/Services/TranscribeService.swift`
- Modify: `multi-repo-ios/multi-repo-ios/Info.plist`

- [ ] **Step 1: Create AppAudioRecorder.swift (~120 lines)**

Port pattern from 99-neo:
- `@Observable` class
- Uses `AVAudioRecorder` with settings: `.wav` format, 16kHz sample rate, 1 channel
- `startRecording()` → request mic permission, configure audio session, start recording to temp file
- `stopRecording() -> URL?` → stop recording, return file URL
- `audioLevel: Float` — updated via `AVAudioRecorder.averagePower` on timer for visual feedback
- Cleanup: delete temp file after transcription

- [ ] **Step 2: Create TranscribeService.swift (~60 lines)**

- `TranscribeService.shared` singleton
- `transcribe(audioURL: URL, jwt: String) async throws -> String`
- POST multipart/form-data to `\(baseURL)/api/ai/transcribe` with audio file
- Returns decoded `{ text: String }` response

- [ ] **Step 3: Update Info.plist**

Add `NSMicrophoneUsageDescription` key with value "PokéChat uses your microphone for voice input" (read current Info.plist first to find the right insertion point).

- [ ] **Step 4: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Components/Chat/Audio/ multi-repo-ios/Services/TranscribeService.swift multi-repo-ios/Info.plist && git -C multi-repo-ios commit -m "feat: add voice input (AppAudioRecorder + TranscribeService)"
```

---

### Task 33: iOS Markdown Theme + Navigation Wiring

**Files:**
- Create: `multi-repo-ios/multi-repo-ios/Components/Chat/ChatMarkdownTheme.swift`
- Modify: `multi-repo-ios/multi-repo-ios/ContentView.swift`

- [ ] **Step 1: Create ChatMarkdownTheme.swift (~80 lines)**

Port from 99-neo's `ChatMarkdownTheme.swift` (673 lines — take only the essentials):
- Custom `MarkdownUI.Theme` with:
  - Body text: `Font.appBodyMedium`, `Color.typographyPrimary`
  - Code blocks: monospace font, `Color.surfacesBaseLowContrast` background, rounded corners
  - Links: `Color.surfacesBrandInteractive`
  - Lists: proper indentation
  - Headings: `Font.appHeadingSmall` / `Font.appHeadingMedium`
- Keep it minimal — just enough for clean chat markdown rendering

- [ ] **Step 2: Update ContentView.swift**

Read current `ContentView.swift`. Replace Tab 2 ("AI Demo" using `AIDemoView()`) with `ChatView()` and make it Tab 1 (primary tab). Remove Tab 4 ("Assistant" using `AssistantView()`) since native chat replaces it.

Updated tab order:
- Tab 0: Chat (was AI Demo) → `ChatView()`
- Tab 1: Components (showcase — keep for template demo)
- Tab 2: Editor (keep)
- Tab 3: Settings (keep)

- [ ] **Step 3: Verify iOS build**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-ios && xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 17' build 2>&1 | tail -20
```

- [ ] **Step 4: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git -C multi-repo-ios add multi-repo-ios/Components/Chat/ChatMarkdownTheme.swift multi-repo-ios/ContentView.swift && git -C multi-repo-ios commit -m "feat: add ChatMarkdownTheme and wire ChatView as primary tab"
```

---

## INTEGRATION PHASE

---

### Task 34: Edge Function + Seed Script

**Files:**
- Create: `supabase/functions/embed-insight-report/index.ts`
- Create: `supabase/seed/seed-pokemon.ts`
- Reference: `99-neo/supabase/functions/embed-insight-report/` (port directly)

- [ ] **Step 1: Create embed-insight-report edge function**

Port from 99-neo. Triggered by DB trigger on `insight_reports` INSERT/UPDATE:
1. Receive payload with `report_text`, `entity_type`, `slug`, `entity_name`
2. Split markdown by `##` headings into chunks
3. For each chunk: call OpenAI `text-embedding-3-small` to generate 1536-dim embedding
4. Delete existing embeddings for this entity_slug
5. Insert new embeddings into `intelligence_embeddings`

- [ ] **Step 2: Create seed-pokemon.ts**

Script that populates the database with Pokemon demo data:
1. Fetch 50 popular Pokemon from PokéAPI (Gen 1 starters, legendaries, fan favorites)
2. For each: generate a markdown report with species info, stats, evolution, notable moves, competitive role
3. Insert into `insight_reports` with `report_type: 'pokemon_species'`, `slug: pokemon name`
4. Insert agent configs for 4 agents (PokéRouter, Pokédex Expert, Team Builder, Battle Strategist) + Memory Agent
5. Insert 7 tool definitions
6. Insert agent_tools relationships
7. Insert agent_handoffs (triage → specialists, specialists → triage)
8. Log progress: "Seeded N Pokemon, 5 agents, 7 tools"

Run with: `npx tsx supabase/seed/seed-pokemon.ts`

Requires: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` in `.env.local`

- [ ] **Step 3: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add supabase/functions/ supabase/seed/ && git commit -m "feat: add embed-insight-report edge function and seed-pokemon script"
```

---

### Task 35: Scaffold Integration

**Files:**
- Modify: `scaffold.config.json`
- Modify: `.claude/skills/new-project/SKILL.md`
- Modify: `.claude/skills/pipeline/SKILL.md`

- [ ] **Step 1: Update scaffold.config.json**

Read current file. Add `ai` section to parameters:

```json
"ai": {
  "AI_MODE": {
    "default": "none",
    "enum": ["none", "simple", "multi-agent"],
    "description": "AI assistant mode: none, simple (ChatKit), or multi-agent (OpenAI Agents SDK)"
  },
  "OPENAI_API_KEY": {
    "secret": true,
    "description": "Required for multi-agent and simple modes"
  }
}
```

Add to `demo_content_to_remove` section — entries for multi-agent files to remove when `AI_MODE = "simple"` or `"none"`:
- `lib/agents/` (web)
- `app/api/chat/` (web)
- `app/api/admin/` (web)
- `app/components/Chat/` (web)
- `Views/Chat/` (iOS)
- `Components/Chat/` (iOS)
- `Services/AgentService.swift` (iOS)
- `Services/ChatSessionService.swift` (iOS)
- `Services/TranscribeService.swift` (iOS)

And entries for ChatKit files to remove when `AI_MODE = "multi-agent"`:
- `app/assistant/` (web)
- `app/assistant-embed/` (web)
- `app/api/chatkit/` (web)
- `Views/AssistantView.swift` (iOS)

- [ ] **Step 2: Update /new-project SKILL.md**

Read current file. Add to Batch 2 (after platform selection, before Supabase):

```
**AI Assistant Setup:**
1. Simple — ChatKit widget (web embed + iOS WebView). Quick setup.
2. Full Multi-Agent — OpenAI Agents SDK with streaming, native iOS chat, admin panel, debug layer. Ships with Pokemon demo. Requires OPENAI_API_KEY.
3. None — No AI assistant.

If "Full Multi-Agent" selected:
- Set AI_MODE=multi-agent in scaffold.config.json
- Force Supabase ON (required for chat persistence + agent config)
- Prompt for OPENAI_API_KEY
- After scaffold: run Supabase migrations + seed-pokemon.ts
```

- [ ] **Step 3: Update /pipeline SKILL.md**

Read current file. Add phase after `scaffold`:

```
Phase 1.5: agent_setup (only if AI_MODE = "multi-agent")
  Checkpoint: scaffold.config.json has AI_MODE = "multi-agent"
  Steps:
    1. Verify OPENAI_API_KEY exists in .env.local
    2. Run supabase db push (applies all migrations including chat + agent tables)
    3. Run npx tsx supabase/seed/seed-pokemon.ts (seed Pokemon data + agent configs)
    4. Verify PokéAPI connectivity (curl https://pokeapi.co/api/v2/pokemon/pikachu)
    5. npm run build (verify compilation)
  Artifacts: seeded database, compiled build
  Next: product_discovery
```

- [ ] **Step 4: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add scaffold.config.json .claude/skills/new-project/SKILL.md .claude/skills/pipeline/SKILL.md && git commit -m "feat: add AI mode selection to scaffold wizard and pipeline"
```

---

### Task 36: Documentation Updates

**Files:**
- Create: `docs/agent-system.md`
- Create: `docs/debug-tracing.md`
- Modify: `docs/api-contracts.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Create docs/agent-system.md**

Document the agent architecture:
- Agent graph diagram (PokéRouter → specialists)
- Tool registry (7 tools with descriptions, parameters, return types)
- AgentContext interface and what gets loaded per-request
- Config cache system (DB vs code fallback)
- Memory system (extraction, deactivation, reinforcement)
- How to add a new agent (`/add-agent` skill reference)
- How to add a new tool
- How to add a new card type (SSE event + web component + iOS view)

- [ ] **Step 2: Create docs/debug-tracing.md**

Document the debug system:
- Trace class API (14 phases, timers, persistence)
- DebugPanel usage (toggle, filter, export, server traces)
- SSE event protocol (all event types with payloads)
- Console log format
- `debug_traces` table schema

- [ ] **Step 3: Update docs/api-contracts.md**

Read current file. Add sections for:
- Chat tables (`chat_sessions`, `chat_messages`, `user_memories`)
- Agent config tables (`agent_configs`, `tool_definitions`, `agent_tools`, `agent_handoffs`, `agent_versions`, `admin_roles`)
- Debug table (`debug_traces`)
- Knowledge base tables (`insight_reports`, `intelligence_embeddings`)
- SSE event protocol (request → response → event types)
- TypeScript ↔ Swift type mappings for card payloads

- [ ] **Step 4: Update CLAUDE.md**

Read current file. Add a "Multi-Agent Architecture" section after the "ChatKit Integration" section:

```markdown
## Multi-Agent Architecture (Full Mode)

When scaffolded with `AI_MODE=multi-agent`, the app includes a production-grade multi-agent chatbot:

**Agent Graph:** PokéRouter (triage) → Pokédex Expert, Team Builder, Battle Strategist + Memory Agent (background)

**Web:** Native SSE streaming at `/api/chat`, decomposed React chat UI, debug panel, admin panel at `/admin`

**iOS:** Fully native SwiftUI chat (not WebView). AgentService SSE client, ChatViewModel, voice input.

**Key directories:** `lib/agents/` (agent framework), `app/components/Chat/` (web UI), `Views/Chat/` + `Components/Chat/` (iOS UI), `app/(authenticated)/admin/` (admin panel)

**Debug:** Bug icon in chat header → right-side panel showing all SSE events in real-time. Server traces persisted to `debug_traces` table.

**Admin panel:** `/admin` — edit agent prompts, models, tools, handoffs. Version history with rollback. Live testing page.

**Skills:** `/add-agent <name>`, `/add-tool <name>`, `/add-card <name>` for extending the system.
```

Also update the Skills table and Supabase section.

- [ ] **Step 5: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add docs/ CLAUDE.md && git commit -m "docs: add agent system, debug tracing, and update API contracts + CLAUDE.md"
```

---

### Task 37: New Skills for Agent Development

**Files:**
- Create: `.claude/skills/add-agent/SKILL.md`
- Create: `.claude/skills/add-tool/SKILL.md`
- Create: `.claude/skills/add-card/SKILL.md`

- [ ] **Step 1: Create /add-agent skill**

Skill that scaffolds a new specialist agent:
1. Ask: agent name, description, which tools (from existing registry), model preference
2. Create `lib/agents/{slug}.ts` with Agent definition
3. Register in `lib/agents/index.ts` graph (add to triage handoffs)
4. Generate SQL insert for `agent_configs` + `agent_tools` + `agent_handoffs`
5. Run the SQL via Supabase MCP or output for manual execution

- [ ] **Step 2: Create /add-tool skill**

Skill that scaffolds a new tool:
1. Ask: tool name, description, parameters (guided Zod schema), which agent owns it
2. Create `lib/agents/tools/{slug}.ts` with tool definition
3. Export from `lib/agents/tools/index.ts`
4. Register with agent in `lib/agents/index.ts`
5. Generate SQL insert for `tool_definitions` + `agent_tools`

- [ ] **Step 3: Create /add-card skill**

Skill that scaffolds a new SSE card type:
1. Ask: card name, payload shape (fields + types), which tool emits it
2. Add TypeScript type to `lib/agents/types.ts`
3. Add SSE event name to `SSEEventType` union
4. Create web component: `app/components/Chat/cards/{Name}Card.tsx`
5. Add case to `ChatMessage.tsx` switch
6. Add Swift struct to `Models/ChatCardModels.swift`
7. Add case to `AgentEvent.swift` enum
8. Create SwiftUI view: `Components/Chat/Cards/{Name}CardView.swift`
9. Add case to `ChatView.swift` message rendering
10. Add color entry to `TYPE_COLORS` in DebugPanel
11. Add SSE parsing case in `AgentService.swift`

- [ ] **Step 4: Commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add .claude/skills/add-agent/ .claude/skills/add-tool/ .claude/skills/add-card/ && git commit -m "feat: add /add-agent, /add-tool, /add-card skills"
```

---

### Task 38: Final Verification

- [ ] **Step 1: Web build**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm run build 2>&1 | tail -20
```

- [ ] **Step 2: iOS build**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-ios && xcodebuild -project multi-repo-ios.xcodeproj -scheme multi-repo-ios -destination 'platform=iOS Simulator,name=iPhone 17' build 2>&1 | tail -20
```

- [ ] **Step 3: Lint**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample/multi-repo-nextjs && npm run lint 2>&1 | tail -20
```

- [ ] **Step 4: Verify file count**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && find multi-repo-nextjs/lib/agents -type f | wc -l && find multi-repo-nextjs/app/components/Chat -type f | wc -l && find multi-repo-nextjs/app/api/chat -type f | wc -l && find multi-repo-nextjs/app/api/admin -type f | wc -l && find multi-repo-ios/multi-repo-ios/Views/Chat -type f | wc -l && find multi-repo-ios/multi-repo-ios/Components/Chat -type f | wc -l && find supabase/migrations -name "*.sql" | wc -l
```

Expected approximate counts:
- lib/agents: ~18 files
- app/components/Chat: ~14 files
- app/api/chat: ~6 files
- app/api/admin: ~9 files
- Views/Chat (iOS): ~2 files
- Components/Chat (iOS): ~9 files
- supabase migrations: ~8 files (2 existing + 6 new)

- [ ] **Step 5: Fix any remaining issues and commit**

```bash
cd /Users/abhishekverma/Documents/GitHub/multi-repo-sample && git add -A && git commit -m "fix: final verification fixes for multi-agent chatbot template"
```

---

## Task Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| **Foundation** | 1-13 | Dependencies, 6 migrations, types, trace, auth, context, config cache, sessions, 7 tools, 5 agents, graph wiring |
| **Web Track** | 14-25 | SSE route, session/debug APIs, transcription, hooks, 7 chat components, 4 card components, debug panel, home page wiring, admin panel (API + UI), build verification |
| **iOS Track** | 26-33 | AgentService, card models, session service, ChatViewModel, ChatView, ChatInputBar, SSEStreamEventView, ChatHistoryView, 4 card views, voice input, markdown theme, nav wiring |
| **Integration** | 34-38 | Edge function, seed script, scaffold config, new-project skill, pipeline phase, documentation, 3 new skills, final verification |
| **Total** | **38 tasks** | ~75 new files, ~9,000 lines |

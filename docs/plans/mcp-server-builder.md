# Plan: MCP Server Demo + MCP Server Builder Plugin

## Context

The workspace has a rich automation layer (30 skills, 9 agents, 2 plugins) and a Supabase backend with Google OAuth. Currently 3 MCP servers are configured (playwright, context7, supabase). The goal is to:

1. **Build a working demo MCP server** (`mcp-server/`) that exposes the `profiles` table via HTTP with Google OAuth
2. **Build an MCP Server Builder plugin** (`.claude/plugins/mcp-server-builder/`) with a `/new-mcp-server` skill, `mcp-server-reviewer` agent, and advisory hooks — so anyone can scaffold new MCP servers from Supabase tables

---

## Deliverable 1: Demo MCP Server (`mcp-server/`)

### Architecture

- **Transport:** Streamable HTTP (Express) — no stdio
- **Auth:** Google OAuth via `google-auth-library` — validates Bearer ID tokens, extracts email
- **Data:** Supabase service-role client (bypasses RLS since server is trusted backend)
- **Session:** Stateful — one `McpServer` instance per session, user email baked in at init

### SDK Packages (confirmed from Context7)

```
@modelcontextprotocol/server   → McpServer, isInitializeRequest
@modelcontextprotocol/node     → NodeStreamableHTTPServerTransport
@modelcontextprotocol/express  → createMcpExpressApp (DNS rebinding protection)
zod                            → import * as z from 'zod/v4'
```

### File Structure

```
mcp-server/
├── package.json              # type:module, ESM, deps listed below
├── tsconfig.json             # strict, ES2022, bundler resolution
├── .env.example              # SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_CLIENT_ID, PORT
├── src/
│   ├── index.ts              # Express app + /mcp POST/GET/DELETE + session mgmt
│   ├── auth.ts               # Google token validation middleware + .well-known endpoint
│   ├── supabase.ts           # createClient with service role, findUserByEmail helper
│   ├── tools/
│   │   └── profiles.ts       # 4 tools: get_profile, update_profile, list_profiles, search_profiles
│   ├── resources/
│   │   └── profiles.ts       # 3 resources: profile://me, profile://{userId}, schema://profiles
│   └── prompts/
│       └── profiles.ts       # 1 prompt: profile_summary
└── README.md                 # Setup, .mcp.json snippet, tool/resource reference
```

### Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/server": "^2.0.0",
    "@modelcontextprotocol/node": "^2.0.0",
    "@modelcontextprotocol/express": "^2.0.0",
    "@supabase/supabase-js": "^2.49.0",
    "google-auth-library": "^9.14.0",
    "dotenv": "^16.4.0",
    "zod": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "@types/express": "^5.0.0"
  }
}
```

### Tools (4)

| Tool | Input | Description |
|------|-------|-------------|
| `get_profile` | (none) | Current user's profile via email lookup |
| `update_profile` | `display_name?`, `avatar_url?` | Update current user's profile |
| `list_profiles` | `limit`, `offset` | Paginated list of all profiles |
| `search_profiles` | `query` | Case-insensitive name search |

### Resources (3)

| URI | Description |
|-----|-------------|
| `profile://me` | Current authenticated user's profile |
| `profile://{userId}` | Any user's profile (with list callback) |
| `schema://profiles` | Profiles table DDL + RLS policies |

### Prompts (1)

| Prompt | Args | Description |
|--------|------|-------------|
| `profile_summary` | `include_metadata?` | Instructs LLM to call get_profile then summarize |

### Auth Flow

1. Claude Code sends `Authorization: Bearer <google-id-token>` (configured in `.mcp.json` headers)
2. `authMiddleware` in Express validates via `google-auth-library` `verifyIdToken()`
3. Extracts `email` from payload → stores in `res.locals.userEmail`
4. On 401: returns `WWW-Authenticate: Bearer realm="mcp"` header
5. `/.well-known/oauth-protected-resource` endpoint (no auth) points to `accounts.google.com`

### .mcp.json Update

```json
"mcp-server-profiles": {
  "type": "http",
  "url": "http://localhost:3001/mcp",
  "headers": {
    "Authorization": "Bearer ${GOOGLE_ID_TOKEN}"
  }
}
```

---

## Deliverable 2: MCP Server Builder Plugin

### File Structure

```
.claude/plugins/mcp-server-builder/
├── plugin.json
├── skills/
│   └── new-mcp-server/
│       └── SKILL.md                    # /new-mcp-server interactive wizard
├── agents/
│   └── mcp-server-reviewer.md          # Code quality reviewer agent
├── hooks/
│   ├── console-log-guard.py            # Warns on console.log in mcp-server* files
│   ├── auth-middleware-reminder.py      # Warns if no auth in server entry points
│   └── mcp-json-reminder.py            # Reminds to update .mcp.json
└── references/
    ├── mcp-patterns.md                 # SDK import map, tool/resource/prompt patterns
    └── auth-patterns.md                # Google OAuth + API key middleware patterns
```

### plugin.json

Follows exact pattern of `openai-agent-builder/plugin.json`:
- `name`: `mcp-server-builder`
- `skills`: `skills/`
- `agents`: `agents/`
- `hooks`: PostToolUse on `Write|Edit` — 3 advisory Python hooks

### Skill: `/new-mcp-server` (8 phases)

| Phase | Action |
|-------|--------|
| 1. Gather Info | Ask: server name, description, tables (via Supabase MCP `list_tables`), auth method (Google OAuth / API key), port |
| 2. Scaffold Project | Create directory, write package.json/tsconfig/.env.example from references |
| 3. Generate Tools | Query column schemas via Supabase MCP → auto-generate CRUD tools per table |
| 4. Generate Resources | Create schema:// and {table}://{id} resources per table |
| 5. Generate Auth | Google OAuth middleware or API key middleware based on Phase 1 |
| 6. Generate README | Setup guide, .mcp.json snippet, tool/resource reference table |
| 7. Wire .mcp.json | Read existing .mcp.json, add new server entry |
| 8. Install & Test | `npm install`, `npm run dev`, invoke `mcp-server-reviewer` agent |

### Agent: `mcp-server-reviewer`

Checklist-based reviewer (pattern from `schema-reviewer.md`):
- **SDK Patterns**: correct imports, `registerTool` not deprecated `tool()`, Zod v4, `isError: true` on errors
- **Transport**: `createMcpExpressApp`, session management, POST/GET/DELETE handlers
- **Auth**: middleware present, `.well-known` endpoint, 401 with WWW-Authenticate
- **Supabase**: service role client, error checking on queries, no hardcoded creds
- **Logging**: `console.error` only, no `console.log`
- **Config**: `type: module`, strict TS, `.env.example` exists

Report format: Critical / Warning / Info → Verdict (PASS / PASS WITH WARNINGS / NEEDS FIXES)

### Hooks (3 PostToolUse advisories)

| Hook | Trigger | Message |
|------|---------|---------|
| `console-log-guard.py` | `console.log` in `mcp-server*/*.ts` | Use `console.error` — stdout reserved for JSON-RPC |
| `auth-middleware-reminder.py` | `index.ts`/`server.ts` in `mcp-server*` without auth import | Import and apply authMiddleware |
| `mcp-json-reminder.py` | New `index.ts`/`package.json` in `mcp-server*` | Remember to update .mcp.json |

---

## Execution Order

### Step 1: Demo MCP Server (10 files)
1. `mkdir -p mcp-server/src/tools mcp-server/src/resources mcp-server/src/prompts`
2. Write `package.json`, `tsconfig.json`, `.env.example`
3. Write `src/supabase.ts` (shared dep)
4. Write `src/auth.ts` (shared dep)
5. Write `src/tools/profiles.ts`
6. Write `src/resources/profiles.ts`
7. Write `src/prompts/profiles.ts`
8. Write `src/index.ts` (imports everything, Express app)
9. Write `README.md`
10. `cd mcp-server && npm install`
11. Test: `npm run dev` → verify server starts on :3001
12. Update `.mcp.json` with new entry

### Step 2: Plugin (10 files)
1. Create directory structure under `.claude/plugins/mcp-server-builder/`
2. Write `plugin.json`
3. Write 3 hook scripts (`hooks/*.py`)
4. Write 2 reference docs (`references/*.md`)
5. Write skill `skills/new-mcp-server/SKILL.md`
6. Write agent `agents/mcp-server-reviewer.md`

### Step 3: Integration
1. Update `CLAUDE.md` — add to Skills table, Agents table, Plugins section, Hooks section
2. Update memory file with new MCP server builder context

---

## Verification

1. **Demo server starts**: `cd mcp-server && npm run dev` → logs "MCP Profiles server listening on http://127.0.0.1:3001/mcp"
2. **Auth endpoint works**: `curl http://localhost:3001/.well-known/oauth-protected-resource` → returns JSON with `accounts.google.com`
3. **401 without token**: `curl -X POST http://localhost:3001/mcp` → 401 with WWW-Authenticate header
4. **Plugin loads**: Claude Code picks up the new plugin hooks (visible in hook output on Write/Edit to mcp-server files)
5. **Skill visible**: `/new-mcp-server` appears as a usable skill in Claude sessions
6. **Agent works**: Invoke `mcp-server-reviewer` on `mcp-server/` → produces checklist report

---

## Known Considerations

- **Google ID token acquisition**: Users need `gcloud auth print-identity-token --audiences=<CLIENT_ID>` or equivalent. README will document this.
- **findUserByEmail**: Uses `auth.admin.listUsers()` — fine for small user bases, README notes the limitation.
- **Zod v4**: MCP SDK v2 requires `import * as z from 'zod/v4'` — separate package.json from workspace, no conflict.
- **Port**: Demo uses 3001 to avoid conflict with Next.js dev server on 3000.

# Skill: /new-mcp-server

Interactive wizard to scaffold a new MCP server from Supabase tables. Generates a fully-wired Express + TypeScript server with tools, resources, auth, and README.

---

## Phase 1 — Gather Information

Ask the user for:

1. **Server name** (kebab-case, e.g. `mcp-server-orders`) — becomes the directory name and npm package name
2. **Description** — one-sentence purpose of this server
3. **Tables** — use the Supabase MCP `list_tables` tool to show available tables, ask which to expose
4. **Auth method** — "Google OAuth" or "API key"
5. **Port** — default `3001`, check for conflicts with any existing mcp-server directories

Confirm the plan before proceeding.

---

## Phase 2 — Scaffold Project

Create the directory structure:

```
<server-name>/
├── package.json
├── tsconfig.json
├── .env.example
└── src/
    ├── index.ts
    ├── auth.ts
    ├── supabase.ts
    ├── tools/
    ├── resources/
    └── prompts/
```

Use [mcp-patterns.md](../../references/mcp-patterns.md) for package.json versions and tsconfig.json settings.

**package.json:**
- `"type": "module"` (ESM)
- `"name"`: use the server name
- scripts: `dev` (tsx --watch), `start` (tsx), `build` (tsc)
- deps: `@modelcontextprotocol/sdk`, `@supabase/supabase-js`, `express`, `zod`
- devDeps: `tsx`, `typescript`, `@types/express`, `@types/node`

---

## Phase 3 — Generate Tools

For each selected table:

1. Query column info via Supabase MCP (or use results from `list_tables`)
2. Generate a `src/tools/<table>.ts` file with:
   - `get_<table_singular>` — fetch by primary key
   - `list_<table>` — paginated list with limit/offset
   - `search_<table>` — ilike search on the first text/varchar column (if any)
   - `create_<table>` — insert (skip id/created_at/updated_at)
   - `update_<table>` — update by primary key

Use the tool pattern from [mcp-patterns.md](../../references/mcp-patterns.md).

**Rules:**
- Always return `{ isError: true, content: [...] }` on Supabase errors — never throw
- Use `z.string().describe('...')` on all parameters

---

## Phase 4 — Generate Resources

For each table, create `src/resources/<table>.ts` with:

- `schema://<table>` — static resource returning DDL (query columns from Supabase MCP)
- `<table>://{id}` — template resource for fetching a single row by primary key, with `list` callback

Use the resource patterns from [mcp-patterns.md](../../references/mcp-patterns.md).

---

## Phase 5 — Generate Auth

Use the selected auth method from Phase 1:

- **Google OAuth** → copy the Google middleware from [auth-patterns.md](../../references/auth-patterns.md) into `src/auth.ts`. Register `/.well-known/oauth-protected-resource` in `index.ts`.
- **API key** → copy the API key middleware from [auth-patterns.md](../../references/auth-patterns.md) into `src/auth.ts`.

Write `src/supabase.ts` using the service role pattern (same in both cases).

---

## Phase 6 — Generate README

Write `README.md` with:

- Setup: copy `.env.example`, fill vars, `npm install`, `npm run dev`
- Auth instructions (how to get a token for Google OAuth, or how to set `MCP_API_KEY`)
- `.mcp.json` snippet
- Tables of all tools, resources, and prompts generated

---

## Phase 7 — Wire .mcp.json

Read the workspace `.mcp.json`. Add a new entry:

```json
"<server-name>": {
  "type": "http",
  "url": "http://localhost:<port>/mcp",
  "headers": {
    "<auth-header>": "Bearer ${<TOKEN_ENV_VAR>}"
  }
}
```

Save the updated `.mcp.json`.

---

## Phase 8 — Install & Test

```bash
cd <server-name> && npm install
```

Then run `npm run dev` briefly to confirm the server starts (will fail on missing env vars — that's expected and acceptable).

**If Google OAuth was selected:**

1. Generate a `scripts/get-token.mjs` script. This script:
   - Reads `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from `.env`
   - Opens Google sign-in in the browser
   - Catches the callback on `http://localhost:3002/callback`
   - Prints the ID token for use with `GOOGLE_ID_TOKEN` env var

2. Tell the user they need to set up a Google Cloud Console credential:
   - Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   - Create a **Web application** OAuth client (not Android or iOS)
   - Add `http://localhost:3002/callback` to Authorized redirect URIs
   - Copy Client ID into `.env` as `GOOGLE_CLIENT_ID`
   - Copy Client secret into `.env` as `GOOGLE_CLIENT_SECRET`

3. Remind the user: the token `audience` must match the `GOOGLE_CLIENT_ID` in `.env` exactly.

Finally, invoke the `mcp-server-reviewer` agent on the new server directory to perform a code quality review.

---

## Reference Files

- [mcp-patterns.md](../../references/mcp-patterns.md) — SDK imports, tool/resource/prompt patterns
- [auth-patterns.md](../../references/auth-patterns.md) — Google OAuth + API key middleware

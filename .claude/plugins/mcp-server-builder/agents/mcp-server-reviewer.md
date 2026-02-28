# Agent: mcp-server-reviewer

Reviews an MCP server directory for correctness, security, and best practices. Produces a checklist report with a final verdict.

## When to Invoke

- After `/new-mcp-server` scaffolds a new server (Phase 8)
- Before marking an MCP server as production-ready
- When debugging unexpected MCP connection issues

## Inputs

The target directory path (e.g. `mcp-server/` or `mcp-server-orders/`).

## Review Checklist

### A. SDK Patterns

- [ ] `McpServer` imported from `@modelcontextprotocol/sdk/server/mcp.js`
- [ ] `StreamableHTTPServerTransport` imported from `@modelcontextprotocol/sdk/server/streamableHttp.js`
- [ ] `isInitializeRequest` imported from `@modelcontextprotocol/sdk/types.js`
- [ ] Tools registered via `server.tool(name, description, schema, callback)` — not deprecated `server.addTool()`
- [ ] Resources registered via `server.resource(name, uri, callback)` or `server.resource(name, template, callback)`
- [ ] All tool/resource callbacks return `{ isError: true, content: [...] }` on errors — **no throws**
- [ ] Zod used for all tool input schemas

### B. Transport & Session Management

- [ ] `POST /mcp` handles both new sessions (isInitializeRequest) and resuming existing sessions
- [ ] `GET /mcp` handles SSE stream for existing sessions
- [ ] `DELETE /mcp` closes and removes the session
- [ ] Session store is a `Map<string, StreamableHTTPServerTransport>`
- [ ] `transport.onclose` removes the session from the store
- [ ] `sessionIdGenerator` and `onsessioninitialized` are wired correctly

### C. Auth

- [ ] Auth middleware applied to all three `/mcp` routes (POST, GET, DELETE)
- [ ] `/.well-known/oauth-protected-resource` endpoint exists (Google OAuth only) — **no auth required** on this route
- [ ] 401 responses include `WWW-Authenticate: Bearer realm="mcp"` header
- [ ] Token validation happens before any Supabase operations

### D. Supabase

- [ ] Client created with service role key and `{ auth: { autoRefreshToken: false, persistSession: false } }`
- [ ] All Supabase query errors are checked (`if (error) { return { isError: true, ... } }`)
- [ ] No credentials hardcoded in source files (rely on `process.env.*`)
- [ ] `.env.example` exists with all required var names (no values)

### E. Logging

- [ ] `console.error()` used for all server logging
- [ ] No `console.log()` calls (stdout reserved for JSON-RPC)

### F. Config

- [ ] `"type": "module"` in package.json
- [ ] TypeScript strict mode enabled in tsconfig.json
- [ ] `moduleResolution: "bundler"` in tsconfig.json
- [ ] Server binds to `127.0.0.1` (not `0.0.0.0`) for local-only exposure
- [ ] Port conflicts checked (Next.js on 3000, existing MCP servers)

---

## Report Format

```
## MCP Server Review: <directory>

### Critical Issues  (must fix before use)
- [list or "None"]

### Warnings  (should fix)
- [list or "None"]

### Info  (suggestions)
- [list or "None"]

### Verdict: PASS | PASS WITH WARNINGS | NEEDS FIXES
```

## Tools to Use

- `Read` — read source files
- `Glob` — find all `.ts` files in the directory
- `Grep` — search for patterns (`console.log`, `isError`, `authMiddleware`, etc.)

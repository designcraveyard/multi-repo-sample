# MCP SDK Patterns Reference

## Package Versions

```json
{
  "@modelcontextprotocol/sdk": "^1.12.1",
  "@supabase/supabase-js": "^2.49.0",
  "express": "^4.21.0",
  "zod": "^3.24.0"
}
```

## Import Map

```typescript
// Server + transport
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

// Zod (v3 — matches SDK peer dep)
import { z } from 'zod';
```

## Tool Pattern

```typescript
server.tool(
  'tool_name',
  'Human-readable description',
  {
    param1: z.string().describe('...'),
    param2: z.number().optional(),
  },
  async ({ param1, param2 }) => {
    const { data, error } = await supabase.from('table').select('*');
    if (error) {
      return { isError: true, content: [{ type: 'text', text: error.message }] };
    }
    return { content: [{ type: 'text', text: JSON.stringify(data) }] };
  }
);
```

## Static Resource Pattern

```typescript
server.resource('resource-name', 'resource://uri', async () => ({
  contents: [{ uri: 'resource://uri', text: '...', mimeType: 'application/json' }],
}));
```

## Template Resource Pattern

```typescript
server.resource(
  'resource-name',
  new ResourceTemplate('resource://{id}', {
    list: async () => ({
      resources: items.map(i => ({ uri: `resource://${i.id}`, name: i.name })),
    }),
  }),
  async (_uri: URL, variables: Record<string, string | string[]>) => {
    const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
    return { contents: [{ uri: `resource://${id}`, text: '...', mimeType: 'application/json' }] };
  }
);
```

## Prompt Pattern

```typescript
server.prompt(
  'prompt_name',
  'Description',
  { arg1: z.string().optional() },
  ({ arg1 }) => ({
    messages: [{
      role: 'user',
      content: { type: 'text', text: `Do something with ${arg1}` },
    }],
  })
);
```

## Session Management (index.ts)

```typescript
const sessions = new Map<string, StreamableHTTPServerTransport>();

app.post('/mcp', authMiddleware, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    await sessions.get(sessionId)!.handleRequest(req, res, req.body);
    return;
  }

  if (!isInitializeRequest(req.body)) {
    res.status(400).json({ error: 'Expected initialize request' });
    return;
  }

  const newId = randomUUID();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => newId,
    onsessioninitialized: (id) => sessions.set(id, transport),
  });
  transport.onclose = () => sessions.delete(newId);

  const server = createServer(/* userEmail */);
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

app.get('/mcp', authMiddleware, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) { res.status(404).json({ error: 'Session not found' }); return; }
  await sessions.get(sessionId)!.handleRequest(req, res);
});

app.delete('/mcp', authMiddleware, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) { res.status(404).json({ error: 'Session not found' }); return; }
  await sessions.get(sessionId)!.handleRequest(req, res);
  sessions.delete(sessionId);
});
```

## Error Handling Rule

Always return `{ isError: true, content: [...] }` — **never throw** from tool/resource callbacks. Throwing causes the MCP session to close.

## Logging Rule

Use `console.error()` for all server logging. `stdout` is reserved for JSON-RPC framing in stdio transports and must not be written to.

## curl Testing

When testing MCP endpoints with curl, you **must** include the `Accept` header:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Authorization: Bearer $GOOGLE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'
```

The MCP SDK requires `Accept: application/json, text/event-stream`. Without it, the server returns a 406 or silently drops the request. This is the most common gotcha when testing outside Claude Code.

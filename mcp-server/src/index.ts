import 'dotenv/config';
import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import { authMiddleware, wellKnownHandler } from './auth.js';
import { registerProfileTools } from './tools/profiles.js';
import { registerProfileResources } from './resources/profiles.js';
import { registerProfilePrompts } from './prompts/profiles.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const app = express();
app.use(express.json());

// OAuth protected resource discovery endpoint (no auth required)
app.get('/.well-known/oauth-protected-resource', wellKnownHandler);

// Session store: sessionId → transport
const sessions = new Map<string, StreamableHTTPServerTransport>();

function createServer(userEmail: string): McpServer {
  const server = new McpServer({
    name: 'mcp-server-profiles',
    version: '1.0.0',
  });
  registerProfileTools(server, userEmail);
  registerProfileResources(server, userEmail);
  registerProfilePrompts(server);
  return server;
}

// POST /mcp — initialize or resume session
app.post('/mcp', authMiddleware, async (req, res) => {
  const userEmail: string = res.locals.userEmail;
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  // Resume existing session
  if (sessionId && sessions.has(sessionId)) {
    const transport = sessions.get(sessionId)!;
    await transport.handleRequest(req, res, req.body);
    return;
  }

  // New session — must be an initialize request
  if (!isInitializeRequest(req.body)) {
    res.status(400).json({ error: 'Expected initialize request for new session' });
    return;
  }

  const newSessionId = randomUUID();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => newSessionId,
    onsessioninitialized: (id) => {
      sessions.set(id, transport);
    },
  });

  transport.onclose = () => {
    sessions.delete(newSessionId);
  };

  const server = createServer(userEmail);
  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

// GET /mcp — SSE stream for server-sent events
app.get('/mcp', authMiddleware, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const transport = sessions.get(sessionId)!;
  await transport.handleRequest(req, res);
});

// DELETE /mcp — close session
app.delete('/mcp', authMiddleware, async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !sessions.has(sessionId)) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  const transport = sessions.get(sessionId)!;
  await transport.handleRequest(req, res);
  sessions.delete(sessionId);
});

app.listen(PORT, '127.0.0.1', () => {
  console.error(`MCP Profiles server listening on http://127.0.0.1:${PORT}/mcp`);
});

# Auth Patterns for MCP Servers

## Option A: Google OAuth (ID Token)

### Dependency
```json
"google-auth-library": "^9.14.0"
```

### Middleware (src/auth.ts)
```typescript
import { OAuth2Client } from 'google-auth-library';
import type { Request, Response, NextFunction } from 'express';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID!);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.slice(7);
  if (!token) {
    res.set('WWW-Authenticate', 'Bearer realm="mcp"');
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    const email = ticket.getPayload()?.email;
    if (!email) { res.status(401).json({ error: 'No email in token' }); return; }
    res.locals.userEmail = email;
    next();
  } catch {
    res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token"');
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function wellKnownHandler(_req: Request, res: Response) {
  res.json({
    resource: `http://localhost:${process.env.PORT ?? 3001}/mcp`,
    authorization_servers: ['https://accounts.google.com'],
  });
}
```

### Register in Express
```typescript
app.get('/.well-known/oauth-protected-resource', wellKnownHandler);
app.post('/mcp', authMiddleware, ...);
app.get('/mcp', authMiddleware, ...);
app.delete('/mcp', authMiddleware, ...);
```

### .env.example (Google OAuth)
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### .mcp.json Entry
```json
"my-server": {
  "type": "http",
  "url": "http://localhost:3001/mcp",
  "headers": { "Authorization": "Bearer ${GOOGLE_ID_TOKEN}" }
}
```

### Google Cloud Console Credential

You need a **Web application** OAuth credential (not Android or iOS):

1. [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create Credentials → OAuth client ID → **Web application**
3. Add `http://localhost:3002/callback` to **Authorized redirect URIs**
4. Copy the Client ID and Client secret into `.env`

The token `audience` must match the `GOOGLE_CLIENT_ID` in `.env` exactly.

### Getting a Token (dev)

**Option A: get-token.mjs (recommended)**

Each scaffolded MCP server includes a `scripts/get-token.mjs` script that handles the full browser-based OAuth flow. It requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`:

```bash
node scripts/get-token.mjs
# Opens browser → Google sign-in → catches callback on :3002
# Prints the ID token and an export command
export GOOGLE_ID_TOKEN="eyJhbG..."
```

The script spins up a temporary server on port 3002, opens the Google consent page, exchanges the auth code for tokens, and prints the ID token. Valid for approximately 1 hour.

**Option B: gcloud CLI**

```bash
export GOOGLE_ID_TOKEN=$(gcloud auth print-identity-token --audiences=YOUR_CLIENT_ID)
```

---

## Option B: API Key

### Middleware (src/auth.ts)
```typescript
import type { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.MCP_API_KEY!;

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'] ?? req.headers.authorization?.slice(7);
  if (key !== API_KEY) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  next();
}
```

### .mcp.json Entry
```json
"my-server": {
  "type": "http",
  "url": "http://localhost:3001/mcp",
  "headers": { "x-api-key": "${MCP_API_KEY}" }
}
```

### .env.example
```
MCP_API_KEY=your-secret-key-here
```

---

## Supabase Client (always service role)

```typescript
// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

The MCP server uses the service role key — it is a **trusted backend**. Auth is enforced at the HTTP layer (not by Supabase RLS) since the server acts on behalf of authenticated users.

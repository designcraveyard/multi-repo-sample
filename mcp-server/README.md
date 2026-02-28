# MCP Server — Profiles

A Model Context Protocol server exposing the Supabase `profiles` table via Streamable HTTP transport with Google OAuth authentication.

## Setup

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Where to find it |
|----------|-----------------|
| `SUPABASE_URL` | Supabase project settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings → API (service_role key) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials |
| `GOOGLE_CLIENT_SECRET` | Same credential page → Client secret |
| `PORT` | Default `3001` (avoids conflict with Next.js on 3000) |

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm run dev      # watch mode
npm start        # single run
```

Server logs to stderr: `MCP Profiles server listening on http://127.0.0.1:3001/mcp`

## Google Cloud Console Setup

Before you can authenticate, you need a Google OAuth 2.0 credential:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials → OAuth client ID**
3. Application type: **Web application** (not Android or iOS)
4. Under **Authorized redirect URIs**, add: `http://localhost:3002/callback`
5. Click **Create**
6. Copy the **Client ID** into `.env` as `GOOGLE_CLIENT_ID`
7. Copy the **Client secret** into `.env` as `GOOGLE_CLIENT_SECRET`

**Important:** The token's `audience` claim must match the `GOOGLE_CLIENT_ID` in your `.env`. If you reuse a credential from another project, make sure the client ID matches exactly.

## Getting an ID Token

### Option A: get-token.mjs (recommended for local dev)

The included script handles the full OAuth flow in your browser:

```bash
node scripts/get-token.mjs
```

This will:
1. Open Google sign-in in your browser
2. Catch the OAuth callback on `http://localhost:3002/callback`
3. Exchange the auth code for an ID token
4. Print the token and an `export` command

Copy the export command to set the token in your shell:

```bash
export GOOGLE_ID_TOKEN="eyJhbG..."
```

The token is valid for approximately 1 hour. Run the script again when it expires.

### Option B: gcloud CLI

If you have the `gcloud` CLI installed and authenticated:

```bash
export GOOGLE_ID_TOKEN=$(gcloud auth print-identity-token --audiences=YOUR_CLIENT_ID)
```

## .mcp.json Configuration

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "mcp-server-profiles": {
      "type": "http",
      "url": "http://localhost:3001/mcp",
      "headers": {
        "Authorization": "Bearer ${GOOGLE_ID_TOKEN}"
      }
    }
  }
}
```

Set `GOOGLE_ID_TOKEN` in your shell before launching Claude Code:

```bash
export GOOGLE_ID_TOKEN=$(gcloud auth print-identity-token --audiences=YOUR_CLIENT_ID)
```

## Tools

| Tool | Input | Description |
|------|-------|-------------|
| `get_profile` | — | Current user's profile via email lookup |
| `update_profile` | `display_name?`, `avatar_url?` | Update current user's profile |
| `list_profiles` | `limit`, `offset` | Paginated list of all profiles |
| `search_profiles` | `query` | Case-insensitive display_name search |

## Resources

| URI | Description |
|-----|-------------|
| `profile://me` | Current authenticated user's profile |
| `profile://{userId}` | Any user's profile by UUID (listable) |
| `schema://profiles` | Profiles table DDL + RLS policies |

## Prompts

| Prompt | Args | Description |
|--------|------|-------------|
| `profile_summary` | `include_metadata?` | Asks LLM to call get_profile then summarize |

## Testing with curl

When testing the MCP endpoint directly with curl, you must include the `Accept` header that the MCP SDK expects:

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Authorization: Bearer $GOOGLE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "test", "version": "1.0.0" }
    }
  }'
```

Without the `Accept: application/json, text/event-stream` header, the MCP SDK will reject the request.

## Auth Flow

1. Claude Code sends `Authorization: Bearer <google-id-token>` header
2. Server validates token via `google-auth-library` `verifyIdToken()`
3. Email extracted from payload → used for Supabase lookups
4. 401 responses include `WWW-Authenticate: Bearer realm="mcp"` header
5. `GET /.well-known/oauth-protected-resource` (no auth) → returns Google issuer info

## Notes

- **Service role client**: Server uses the Supabase service role key, bypassing RLS. This is intentional — the server is a trusted backend; auth is enforced at the HTTP layer.
- **findUserByEmail**: Uses `auth.admin.listUsers()`. Fine for small user bases; consider caching for larger deployments.
- **Sessions**: Stateful — one `McpServer` instance per HTTP session, user email baked in at initialization.

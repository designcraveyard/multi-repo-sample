# {{PROJECT_NAME}}

A self-hosted ChatKit application with a custom backend, authentication middleware, rate limiting, custom widgets, and server-side action handling.

## Architecture

This is a monorepo with two packages:

```
{{PROJECT_NAME}}/
  frontend/    React + ChatKit UI (Vite dev server on :5173)
  backend/     Express API server (on :3001)
```

### Backend Components

- **`server.ts`** -- Entry point. Composes middleware and mounts routes.
- **`chatkit-server.ts`** -- ChatKit route handler. Creates sessions via the OpenAI Responses API and processes server-side actions.
- **`middleware.ts`** -- Auth middleware (Bearer token validation) and rate limiting (100 req / 15 min per IP).

### Frontend Components

- **`App.tsx`** -- ChatKit UI with custom widgets and action handling.
- **`actions.ts`** -- Client-side action handler. Routes actions locally or forwards them to the backend.
- **`widgets/ExampleWidget.tsx`** -- Example custom widget rendered inside the conversation.

## Setup

### 1. Install dependencies

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your OpenAI API key
```

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

The frontend dev server proxies `/api` requests to the backend at `http://localhost:3001`.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `NODE_ENV` | No | Set to `development` to skip auth (default: `development`) |
| `PORT` | No | Backend port (default: `3001`) |
| `AUTH_SECRET` | Production | Secret for token validation |

## Middleware

### Rate Limiting

All `/api` routes are rate-limited to 100 requests per 15-minute window per IP address. Configured in `backend/src/middleware.ts`.

### Authentication

The `authMiddleware` protects all `/api/chatkit` routes. In development mode (`NODE_ENV=development`), auth is bypassed. In production, it expects a `Bearer <token>` in the `Authorization` header.

To implement your auth strategy, edit the `authMiddleware` function in `backend/src/middleware.ts`. Common options:

- **API key validation** -- Check the token against a stored API key.
- **JWT verification** -- Verify a JSON Web Token using a shared secret or public key.
- **Session token** -- Validate against a session store (Redis, database, etc.).

## Custom Widgets

Widgets are React components rendered inline in the ChatKit conversation. They receive data from tool call outputs.

Register widgets in `frontend/src/App.tsx`:

```tsx
const widgets = {
  example: ExampleWidget,
  // Add more widgets here
};
```

Widgets are triggered when a tool call returns output matching a registered widget key.

## Server-Side Actions

Actions can be handled client-side in `frontend/src/actions.ts` or forwarded to the backend for server-side processing:

```typescript
// Client-side action
case 'copy': {
  await navigator.clipboard.writeText(action.text);
  return { success: true };
}

// Server-side action (forwarded to backend)
case 'server-action': {
  const res = await fetch('/api/chatkit/action', { ... });
  return await res.json();
}
```

The backend action endpoint in `backend/src/chatkit-server.ts` handles server-side operations such as database writes, third-party API calls, or any logic that should not run in the browser.

## Deployment

### Frontend

Build the frontend for production:

```bash
cd frontend
npm run build
```

The output in `frontend/dist/` can be served by any static hosting provider. Update the API base URL to point to your deployed backend.

### Backend

The backend runs as a Node.js process. Deploy to any platform that supports Node.js (e.g., Railway, Render, Fly.io, AWS EC2).

Production checklist:

1. Set `NODE_ENV=production` in environment.
2. Set `AUTH_SECRET` and implement token validation in `middleware.ts`.
3. Update `{{CORS_ORIGIN}}` in `server.ts` to your frontend domain.
4. Configure a process manager (PM2, systemd) or container runtime.

## Template Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{PROJECT_NAME}}` | Project name used in package.json and page title |
| `{{MODEL}}` | OpenAI model ID (e.g., `gpt-4o`) |
| `{{AGENT_INSTRUCTIONS}}` | System instructions for the agent |
| `{{TOOLS}}` | Server-side tool definitions |
| `{{CORS_ORIGIN}}` | Allowed CORS origin (default: `http://localhost:5173`) |
| `{{AUTH_STRATEGY}}` | Authentication strategy description |
| `{{THEME_COLOR_SCHEME}}` | ChatKit color scheme (`light`, `dark`, `system`) |
| `{{THEME_COLOR}}` | ChatKit accent color |
| `{{THEME_RADIUS}}` | ChatKit border radius |

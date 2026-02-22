# ChatKit Integration Patterns

> Skills read this file before generating ChatKit agent code.

## Installation

```bash
# Frontend (React)
npm install @openai/chatkit-react

# Backend (Python — optional, for self-hosted)
pip install chatkit
```

ChatKit is **React/TypeScript only** for the frontend. Python agents use a Python backend with a React ChatKit frontend (monorepo pattern).

## Basic Embed (React)

The simplest ChatKit setup — just embed and configure.

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // Implement session refresh if needed
        }
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-[600px] w-[400px]" />;
}
```

### Backend — Client Secret Endpoint (TypeScript/Express)

```typescript
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI();

app.post('/api/chatkit/session', async (req, res) => {
  try {
    const session = await openai.responses.create({
      model: 'gpt-4.1',
      input: [], // Empty — client sends messages
    });
    res.json({ client_secret: session.client_secret });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.listen(3001, () => console.log('Backend running on :3001'));
```

### Backend — Client Secret Endpoint (Python/FastAPI)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["POST"],
    allow_headers=["*"],
)

client = OpenAI()

@app.post("/api/chatkit/session")
async def create_session():
    response = client.responses.create(
        model="gpt-4.1",
        input=[],
    )
    return {"client_secret": response.client_secret}
```

## Theming

```tsx
const { control } = useChatKit({
  api: { getClientSecret },
  theme: {
    colorScheme: 'dark',       // 'light' | 'dark' | 'system'
    color: {
      accent: {
        primary: '#D7263D',    // Brand color
        level: 2,              // Color intensity (1-3)
      },
    },
    radius: 'round',           // 'none' | 'small' | 'medium' | 'round'
    density: 'normal',         // 'compact' | 'normal' | 'relaxed'
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
});
```

### Theme Options Reference

| Property | Values | Default |
|----------|--------|---------|
| `colorScheme` | `'light'`, `'dark'`, `'system'` | `'system'` |
| `color.accent.primary` | Any hex color | `'#0066FF'` |
| `color.accent.level` | `1`, `2`, `3` | `2` |
| `radius` | `'none'`, `'small'`, `'medium'`, `'round'` | `'medium'` |
| `density` | `'compact'`, `'normal'`, `'relaxed'` | `'normal'` |
| `typography.fontFamily` | Any CSS font-family | System default |

## Start Screen

```tsx
const { control } = useChatKit({
  api: { getClientSecret },
  startScreen: {
    greeting: 'Welcome to our AI Assistant! How can I help you today?',
    prompts: [
      {
        label: 'Explain a concept',
        prompt: 'Explain quantum computing in simple terms',
        icon: 'lightbulb',
      },
      {
        label: 'Write code',
        prompt: 'Write a React component that fetches data from an API',
        icon: 'square-code',
      },
      {
        label: 'Analyze data',
        prompt: 'Help me analyze my sales data and find trends',
        icon: 'chart',
      },
    ],
  },
});
```

## Composer Customization

```tsx
const { control } = useChatKit({
  api: { getClientSecret },
  composer: {
    placeholder: 'Ask anything about your data...',
    tools: [
      { id: 'upload', label: 'Upload', icon: 'paperclip', pinned: true },
      { id: 'search', label: 'Search', icon: 'search' },
    ],
  },
});
```

## Custom Widgets

Widgets let you render custom UI in chat responses.

```tsx
import { ChatKit, useChatKit, type Widgets } from '@openai/chatkit-react';

function ChatWithWidgets() {
  const { control } = useChatKit({
    api: { getClientSecret },
    widgets: {
      onAction: async (action, widgetItem) => {
        console.log('Widget action:', action);

        switch (action.type) {
          case 'approve_request':
            await fetch('/api/requests/approve', {
              method: 'POST',
              body: JSON.stringify({ requestId: action.payload?.requestId }),
              headers: { 'Content-Type': 'application/json' },
            });
            // Notify server to update widget
            await control.ref.current?.sendCustomAction(
              { type: 'request_approved', payload: action.payload },
              widgetItem.id,
            );
            break;

          case 'open_details':
            // Client-only navigation
            window.open(`/details/${action.payload?.id}`, '_blank');
            break;

          default:
            // Send unknown actions to server
            await control.ref.current?.sendCustomAction(action, widgetItem.id);
        }
      },
    },
  });

  return <ChatKit control={control} className="h-[700px] w-[500px]" />;
}
```

## Header Actions

```tsx
const { control } = useChatKit({
  api: { getClientSecret },
  header: {
    leftAction: {
      icon: 'settings-cog',
      onClick: () => alert('Settings clicked'),
    },
  },
});
```

## Entity Tags & Previews

```tsx
const { control } = useChatKit({
  api: { getClientSecret },
  entities: {
    onTagSearch: async (query) => [
      { id: 'user_123', title: 'Jane Doe' },
      { id: 'user_456', title: 'John Smith' },
    ],
    onRequestPreview: async (entity) => ({
      preview: {
        type: 'Card',
        children: [
          { type: 'Text', value: `Profile: ${entity.title}` },
          { type: 'Text', value: 'Role: Developer' },
        ],
      },
    }),
  },
});
```

## Self-Hosted Backend (Full Control)

For full control over the agent backend, self-host instead of using OpenAI's hosted agent.

### Python Backend (FastAPI)

```python
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from agents import Agent, Runner

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

agent = Agent(
    name="Support agent",
    instructions="You are a helpful support agent.",
    model="gpt-4.1",
)

@app.websocket("/ws/chat")
async def websocket_chat(ws: WebSocket):
    await ws.accept()
    input_items = []
    try:
        while True:
            data = await ws.receive_json()
            input_items.append({"role": "user", "content": data["message"]})
            result = await Runner.run(agent, input_items)
            await ws.send_json({"message": result.final_output})
            input_items = result.to_input_list()
    except Exception:
        await ws.close()

@app.post("/api/chatkit/session")
async def create_session():
    # For self-hosted, you manage sessions yourself
    import uuid
    session_id = str(uuid.uuid4())
    return {"client_secret": session_id, "session_id": session_id}
```

### TypeScript Backend (Express)

```typescript
import express from 'express';
import { Agent, run } from '@openai/agents';

const app = express();
app.use(express.json());

const agent = new Agent({
  name: 'Support agent',
  instructions: 'You are a helpful support agent.',
  model: 'gpt-4.1',
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    const input = [...history, { role: 'user', content: message }];
    const result = await run(agent, input);
    res.json({
      message: result.finalOutput,
      history: result.toInputList(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Agent run failed' });
  }
});

app.listen(3001);
```

## Monorepo Structure (ChatKit Projects)

```
my-chatkit-agent/
├── frontend/              # React + ChatKit
│   ├── package.json       # @openai/chatkit-react, vite, react
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx       # React entry
│       ├── App.tsx        # ChatKit embed
│       └── widgets/       # Custom widget components (if custom tier)
├── backend/               # Agent backend
│   ├── package.json       # @openai/agents (TS) or requirements.txt (Python)
│   └── src/
│       ├── server.ts      # Express API
│       └── agent.ts       # Agent definition
├── .env.example
├── .gitignore
└── README.md
```

## Common Pitfalls

1. **ChatKit is React only** — no Vue, Angular, or vanilla JS support
2. **`getClientSecret` must return a string** — the client secret from the API
3. **CORS must be configured** on the backend for the frontend origin
4. **Don't hardcode the client secret** — always fetch from your backend
5. **Theme colors must be hex strings** — no CSS variable references
6. **Widgets need `onAction`** — unhandled actions are silently dropped
7. **Python backends need CORS middleware** — FastAPI requires explicit CORS setup

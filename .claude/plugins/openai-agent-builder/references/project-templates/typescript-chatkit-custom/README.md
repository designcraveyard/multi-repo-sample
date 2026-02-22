# {{PROJECT_NAME}}

{{AGENT_INSTRUCTIONS}}

A ChatKit-powered AI chat application with custom widgets, action handlers, a React frontend, and an Express backend.

## Project Structure

```
{{PROJECT_NAME}}/
├── frontend/                # React + Vite + ChatKit UI
│   ├── src/
│   │   ├── App.tsx          # ChatKit component with widgets and theming
│   │   ├── main.tsx         # React entry point
│   │   ├── actions.ts       # Custom action handler for widget events
│   │   └── widgets/
│   │       └── ExampleWidget.tsx  # Example custom widget component
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/                 # Express API server
│   ├── src/
│   │   └── server.ts        # Session endpoint for ChatKit client secrets
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Setup

### 1. Install dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env` and set your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

## Running

Start both servers (backend first):

```bash
# Terminal 1 — Backend (port 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How It Works

1. The frontend renders a ChatKit component that manages the chat UI.
2. When a session is needed, ChatKit calls `getClientSecret()` in the frontend.
3. The frontend fetches `POST /api/chatkit/session` from the backend.
4. The backend creates an OpenAI response with a client secret and returns it.
5. ChatKit uses the client secret to stream the conversation directly from OpenAI.
6. Custom widgets render inline in the chat when the agent emits matching widget nodes.
7. Widget interactions trigger actions that are routed through the `handleAction` handler.

The Vite dev server proxies `/api` requests to the backend at `http://localhost:3001`, so no CORS issues in development.

## Custom Widgets

This template includes a custom widget system that lets you render interactive UI components inline within the chat conversation.

### How Widgets Work

1. **Widget components** are React components that receive `data` and `onAction` props.
2. **Widget registration** happens in `App.tsx` via the `widgets.nodes` config object.
3. **Action handling** is centralized in `actions.ts` via the `widgets.onAction` handler.

When the agent emits a widget node (e.g., `example_widget`), ChatKit looks up the registered component and renders it with the provided data.

### Adding a New Widget

#### 1. Create the widget component

Create a new file in `frontend/src/widgets/`:

```tsx
// frontend/src/widgets/MyWidget.tsx
import React from 'react';

interface MyWidgetProps {
  data: {
    // Define your widget's data shape
    message: string;
  };
  onAction: (action: { type: string; data: unknown }) => void;
}

export function MyWidget({ data, onAction }: MyWidgetProps) {
  return (
    <div>
      <p>{data.message}</p>
      <button onClick={() => onAction({ type: 'my_action', data: {} })}>
        Click Me
      </button>
    </div>
  );
}
```

#### 2. Register the widget in App.tsx

Add your widget to the `widgets.nodes` object:

```tsx
import { MyWidget } from './widgets/MyWidget';

// Inside useChatKit config:
widgets: {
  onAction: handleAction,
  nodes: {
    example_widget: ExampleWidget,
    my_widget: MyWidget,  // Add your widget here
  },
},
```

#### 3. Add the action handler

Handle widget actions in `frontend/src/actions.ts`:

```typescript
case 'my_action':
  console.log('My action triggered:', action.data);
  context.sendCustomAction({
    type: 'my_action_result',
    data: { status: 'done' },
  });
  break;
```

### Action Handler API

The `handleAction` function receives two arguments:

- **`action`** — The action dispatched by the widget, with `type` (string) and `data` (unknown).
- **`context`** — Provides `sendCustomAction()` to send data back to the agent.

## ChatKit Theming

The ChatKit component supports theming via the `theme` prop:

- **colorScheme** — `'light'`, `'dark'`, or `'system'`
- **color** — Accent color: `'iris'`, `'jade'`, `'ruby'`, `'amber'`, `'cyan'`, `'orange'`, etc.
- **radius** — Border radius: `'none'`, `'small'`, `'medium'`, `'large'`, `'full'`

Edit `frontend/src/App.tsx` to customize the theme.

## Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
npm start
```

The frontend build output is in `frontend/dist/`. Serve it with any static file server and point API requests to the backend.

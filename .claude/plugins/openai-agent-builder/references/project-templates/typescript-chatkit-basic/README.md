# {{PROJECT_NAME}}

{{AGENT_INSTRUCTIONS}}

A ChatKit-powered AI chat application with a React frontend and Express backend.

## Project Structure

```
{{PROJECT_NAME}}/
├── frontend/          # React + Vite + ChatKit UI
│   ├── src/
│   │   ├── App.tsx    # ChatKit component with theming
│   │   └── main.tsx   # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/           # Express API server
│   ├── src/
│   │   └── server.ts  # Session endpoint for ChatKit client secrets
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

The Vite dev server proxies `/api` requests to the backend at `http://localhost:3001`, so no CORS issues in development.

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

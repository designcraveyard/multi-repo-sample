import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authMiddleware, rateLimiter } from './middleware.js';
import { createChatKitRoutes } from './chatkit-server.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: '{{CORS_ORIGIN}}' }));

// Apply rate limiting to API routes
app.use('/api', rateLimiter);

// Apply auth middleware to ChatKit routes
app.use('/api/chatkit', authMiddleware);

// Mount ChatKit routes
app.use('/api/chatkit', createChatKitRoutes());

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const openai = new OpenAI();

app.post('/api/chatkit/session', async (req, res) => {
  try {
    const response = await openai.responses.create({
      model: '{{MODEL}}',
      instructions: '{{AGENT_INSTRUCTIONS}}',
      input: [],
    });
    res.json({ client_secret: response.client_secret });
  } catch (error) {
    console.error('Session creation failed:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

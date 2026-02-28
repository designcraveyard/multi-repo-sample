import { OAuth2Client } from 'google-auth-library';
import type { Request, Response, NextFunction } from 'express';

const googleClientId = process.env.GOOGLE_CLIENT_ID!;
const client = new OAuth2Client(googleClientId);

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.set('WWW-Authenticate', 'Bearer realm="mcp"');
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: googleClientId });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(401).json({ error: 'Token has no email claim' });
      return;
    }
    res.locals.userEmail = payload.email;
    next();
  } catch {
    res.set('WWW-Authenticate', 'Bearer realm="mcp", error="invalid_token"');
    res.status(401).json({ error: 'Invalid or expired Google ID token' });
  }
}

export function wellKnownHandler(_req: Request, res: Response) {
  res.json({
    resource: `http://localhost:${process.env.PORT ?? 3001}/mcp`,
    authorization_servers: ['https://accounts.google.com'],
  });
}

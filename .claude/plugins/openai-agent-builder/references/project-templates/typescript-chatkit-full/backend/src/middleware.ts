import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Rate limiter: 100 requests per 15 minutes per IP
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth middleware: validates API key or session token
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  // {{AUTH_STRATEGY}}: Replace with your auth logic
  // Options: API key validation, JWT verification, session token check

  if (process.env.NODE_ENV === 'development') {
    // Skip auth in development
    next();
    return;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  // TODO: Validate token against your auth provider
  if (!token) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  next();
}

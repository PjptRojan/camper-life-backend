/**
 * middleware/auth.ts
 * -----------------------------------------------------------------------------
 * The request-side counterpart to `auth.ts` (which only ISSUES tokens). These
 * middlewares VERIFY the bearer token on protected routes and gate admin-only
 * endpoints.
 *
 *   • authenticate  — require a valid JWT; attaches `req.user` ({ id, role }).
 *   • requireAdmin   — must run AFTER authenticate; 403s non-admins.
 *
 * Usage: router.post('/', authenticate, requireAdmin, handler)
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/** The claims we sign into the JWT in auth.ts. */
export interface JwtPayload {
  userId: string;
  role: Role;
}

/** The authenticated principal we attach to the request. */
export interface AuthedUser {
  id: string;
  role: Role;
}

// Augment Express's Request so `req.user` is typed everywhere downstream.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

/**
 * Require a valid `Authorization: Bearer <token>` header. On success attaches
 * `req.user` and calls next(); otherwise responds 401.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Allow only admins through. Must be chained AFTER `authenticate` so `req.user`
 * is populated.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  next();
}

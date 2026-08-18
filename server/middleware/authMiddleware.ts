import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-ai-trip-planner';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export function generateToken(payload: { id: string; email: string; name: string; role?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string; role?: string };
    let user = db.findUserById(decoded.id);
    if (!user && decoded.id && decoded.email) {
      const userRole: 'admin' | 'user' = (decoded.id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1' || decoded.role === 'admin') ? 'admin' : 'user';
      user = db.upsertUser({
        id: decoded.id,
        name: decoded.name || decoded.email.split('@')[0],
        email: decoded.email,
        role: userRole,
      });
    }
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists.' });
    }
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string; role?: string };
      let user = db.findUserById(decoded.id);
      if (!user && decoded.id && decoded.email) {
        const userRole: 'admin' | 'user' = (decoded.id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1' || decoded.role === 'admin') ? 'admin' : 'user';
        user = db.upsertUser({
          id: decoded.id,
          name: decoded.name || decoded.email.split('@')[0],
          email: decoded.email,
          role: userRole,
        });
      }
      if (user) {
        req.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    } catch (err) {
      // ignore
    }
  }
  next();
}

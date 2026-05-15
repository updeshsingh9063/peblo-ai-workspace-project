// src/lib/jwt.ts — JWT helpers for auth tokens
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'peblo-dev-secret-change-in-prod';

export interface TokenPayload {
  id: string;
  email: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, SECRET) as TokenPayload;
}

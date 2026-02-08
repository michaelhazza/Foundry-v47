import jwt from 'jsonwebtoken';
import { config } from './env';

export interface TokenPayload {
  id: string;
  organisationId: string;
  role: 'admin' | 'member';
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.auth.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.auth.jwtSecret) as TokenPayload;
}

import jwt from 'jsonwebtoken';
import { randomUUID, createHash } from 'crypto';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export function generateTokens(payload: object) {
  const jti = randomUUID(); // Unique ID for the refresh token

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ ...payload, jti }, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken, jti };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

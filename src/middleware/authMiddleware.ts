import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { User } from '../types/user.types.js';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export function getUserFromRequest(req: Request): User | null {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  console.log('Authorization header:', authHeader);
  console.log('Extracted token:', token);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as { id: number; email: string; firstname?: string; lastname?: string };
    console.log('Decoded JWT payload:', payload);
    return {
      id: payload.id,
      email: payload.email,
      firstname: payload.firstname ?? '',
      lastname: payload.lastname ?? ''
    };
  } catch(error) {
    console.error('Error verifying token:', error);
    return null;
  }
}
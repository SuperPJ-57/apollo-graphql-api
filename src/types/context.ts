import { Request, Response as ExpressResponse } from 'express';
import { User } from './user.types.js';

export interface MyContext {
  req: Request;
  res: ExpressResponse;
  user? : User | null;
}

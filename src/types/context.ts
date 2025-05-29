import { Request, Response as ExpressResponse } from 'express';

export interface MyContext {
  req: Request;
  res: ExpressResponse;
}

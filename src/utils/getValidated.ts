import type { Request, Response } from 'express';

/**
 * Get validated data from res.locals (Express 5 compatible)
 * Falls back to req data if validation middleware wasn't used
 */
export function getValidatedQuery<T = any>(req: Request, res: Response): T {
  return (res.locals as any).validatedQuery || req.query;
}

export function getValidatedParams<T = any>(req: Request, res: Response): T {
  return (res.locals as any).validatedParams || req.params;
}

export function getValidatedBody<T = any>(req: Request, res: Response): T {
  return (res.locals as any).validatedBody || req.body;
}

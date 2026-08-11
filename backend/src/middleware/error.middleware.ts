import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Handle Prisma / Database duplicate key errors
  if ('code' in err && err.code === 'P2002') {
    return sendError(res, 'A record with this unique key already exists', 409);
  }

  console.error('🔥 [Unhandled Error]:', err);

  const message =
    process.env.NODE_ENV === 'development'
      ? err.message || 'Internal Server Error'
      : 'Something went wrong on the server';

  return sendError(res, message, 500);
};

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return next(new BadRequestError('Validation failed', formattedErrors));
      }
      next(error);
    }
  };
};

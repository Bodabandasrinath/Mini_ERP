import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedRequest, AuthUser } from '../types';
import { UnauthorizedError } from '../utils/errors';

export const authenticateToken = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Access token required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
};

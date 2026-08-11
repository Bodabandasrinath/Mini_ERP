import { Response, NextFunction } from 'express';
import { Role, AuthenticatedRequest } from '../types';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication context missing'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Role '${req.user.role}' does not have permission for this resource.`
        )
      );
    }

    next();
  };
};


import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import type { UserRole } from '../constants/roles.constants.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden('You do not have permission to access this resource')
      );
    }

    next();
  };
};

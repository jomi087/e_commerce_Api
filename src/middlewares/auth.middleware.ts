import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = req.cookies?.authSessionToken;

  if (!token) {
    throw ApiError.unauthorized('Authentication token is required');
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded as Express.Request['user'];
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        return next(ApiError.unauthorized(ERROR_MESSAGES.SESSION_TOKEN_EXPIRED));
      }

      if (error.name === 'JsonWebTokenError' || error.name === 'SyntaxError') {
        return next(ApiError.unauthorized(ERROR_MESSAGES.INVALID_TOKEN));
      }
    }

    next(error);
  }
};

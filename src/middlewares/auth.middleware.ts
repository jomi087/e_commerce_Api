import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';
import { ERROR_MESSAGES } from '../constants/messages.constants.js';
import { User } from '../modules/users/user.model.js';
import { AuthTokenPayload } from '../modules/auth/types/auth.types.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.authSessionToken;

  if (!token) {
    return next(ApiError.unauthorized(ERROR_MESSAGES.AUTH_TOKEN_REQUIRED));
  }

  try {
    // Verify JWT
    const decoded = verifyToken<AuthTokenPayload>(token);

    // Check whether user exists and is active
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw ApiError.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    // Attach authenticated user to request
    req.user = {
      id: user.id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

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

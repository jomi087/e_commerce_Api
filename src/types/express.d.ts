import type { JwtPayload } from 'jsonwebtoken';
import type { UserRole } from '../constants/roles.constants.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        role: UserRole;
        email: string;
      };

      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};

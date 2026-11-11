import type { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../../../constants/roles.constants.js';

export interface AuthTokenPayload extends JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

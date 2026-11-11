import { ERROR_MESSAGES } from '../../constants/messages.constants.js';
import { USER_ROLES } from '../../constants/roles.constants.js';
import { ApiError } from '../../utils/ApiError.js';
import { signToken } from '../../utils/jwt.js';
import { User } from '../users/user.model.js';
import type { RegisterInput, LoginInput } from './auth.validation.js';
import bcrypt from 'bcrypt';

export class AuthService {
  async register(_input: RegisterInput) {
    const { email, name, password } = _input;

    // Check whether the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw ApiError.conflict(ERROR_MESSAGES.USER_EXISTS);
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      role: USER_ROLES.CUSTOMER,
    });

    // Generate JWT payload
    const payload = {
      id: newUser.id.toString(),
      role: newUser.role,
      email: newUser.email,
    };

    const token = signToken(payload);

    return {
      token,
      userInfo: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  }

  async login(_input: LoginInput) {
    const { email, password } = _input;

    // Find user and explicitly include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw ApiError.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate JWT payload
    const payload = {
      id: user.id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = signToken(payload);

    return {
      token,
      userInfo: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async userInfo(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

export const authService = new AuthService();

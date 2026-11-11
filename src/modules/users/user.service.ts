import { User } from './user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ERROR_MESSAGES } from '../../constants/messages.constants.js';
import type { GetAllUsersQuery, UpdateProfileInput, UpdateUserStatusInput } from './user.validation.js';

export class UserService {
  // Get the authenticated user's profile
  async getProfile(userId: string) {
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

  // Update the authenticated user's profile
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const updateData: Partial<Pick<UpdateProfileInput, 'name' | 'email'>> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.email !== undefined) {
      updateData.email = input.email.toLowerCase().trim();
    }

    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw ApiError.conflict(ERROR_MESSAGES.USER_EXISTS);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!user) {
        throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      //handle race condition
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 11000
      ) {
        throw ApiError.conflict(ERROR_MESSAGES.USER_EXISTS);
      }

      throw error;
    }
  }

  // Get all users (Admin)

  async getAllUsers(query: GetAllUsersQuery) {
    const { role, page, limit } = query;

    const filter = role ? { role } : {};

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(filter),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        isActive: user.isActive,
        role: user.role,
      })),
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
      },
    };
  }

  // Get a user by ID (Admin)
  async getUserById(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  // Activate or deactivate a user (Admin)
  async updateUserStatus(userId: string, input: UpdateUserStatusInput) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isActive: input.isActive } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      isActive: user.isActive,
    };
  }
}

export const userService = new UserService();

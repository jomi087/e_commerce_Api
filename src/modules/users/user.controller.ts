import type { Request, Response } from 'express';
import { userService } from './user.service.js';
import { SUCCESS_MESSAGES } from '../../constants/messages.constants.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import type {
  UpdateProfileInput,
  UserIdInput,
  UpdateUserStatusInput,
  GetAllUsersQuery,
} from './user.validation.js';

export class UserController {
  // Get the authenticated user's profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    const userInfo = await userService.getProfile(req.user!.id);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, userInfo);
  };

  // Update the authenticated user's profile
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    const input = req.validated?.body as UpdateProfileInput;

    const userInfo = await userService.updateProfile(req.user!.id, input);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, userInfo);
  };

  // Get all users (Admin)
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const query = req.validated?.query as GetAllUsersQuery;

    const result = await userService.getAllUsers(query);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, result);
  };

  // Get a user by ID (Admin)
  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.validated?.params as UserIdInput;

    const userInfo = await userService.getUserById(userId);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, userInfo);
  };

  // Activate or deactivate a user (Admin)
  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.validated?.params as UserIdInput;
    const input = req.validated?.body as UpdateUserStatusInput;

    const userInfo = await userService.updateUserStatus(userId, input);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, userInfo);
  };
}

export const userController = new UserController();

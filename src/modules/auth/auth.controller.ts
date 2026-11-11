import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import { env } from '../../config/env.js';
import { SUCCESS_MESSAGES } from '../../constants/messages.constants.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

export class AuthController {
  private setSessionCookie(res: Response, token: string): void {
    res.cookie('authSessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: env.AUTH_SESSION_COOKIE_AGE,
    });
  }

  register = async (req: Request, res: Response): Promise<void> => {
    const { userInfo, token } = await authService.register(req.body);

    this.setSessionCookie(res, token);

    sendSuccess(res, 201, SUCCESS_MESSAGES.REGISTER_SUCCESS, userInfo);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { userInfo, token } = await authService.login(req.body);

    this.setSessionCookie(res, token);

    sendSuccess(res, 200, SUCCESS_MESSAGES.LOGIN_SUCCESS, userInfo);
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('authSessionToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    sendSuccess(res, 200, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const userInfo = await authService.userInfo(req.user!.id);

    sendSuccess(res, 200, SUCCESS_MESSAGES.SUCCESS, { userInfo });
  };
}

export const authController = new AuthController();

import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (
  payload: string | object | Buffer,
  options?: SignOptions
): string => {
  const secret: Secret = env.JWT_SECRET;
  const defaultOptions: SignOptions = {
    expiresIn: env.AUTH_SESSION_TOKEN_EXPIRY as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, secret, { ...defaultOptions, ...options });
};

export const verifyToken = <T = unknown>(token: string): T => {
  const secret: Secret = env.JWT_SECRET;
  return jwt.verify(token, secret) as T;
};

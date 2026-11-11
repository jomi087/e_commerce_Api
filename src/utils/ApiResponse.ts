
import type { Response } from 'express';

export const sendSuccess = <T = unknown>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null,
  });
};

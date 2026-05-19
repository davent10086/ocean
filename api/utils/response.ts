import type { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    ...(data !== undefined ? { data } : {}),
    ...(message ? { message } : {}),
  });
};

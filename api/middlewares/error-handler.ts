import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/app-error.js';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const message = error.code === 'P2002' ? '存在重复数据，请检查后重试。' : '数据库操作失败，请稍后重试。';
    res.status(400).json({
      success: false,
      message,
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: '服务器开小差了，请稍后再试。',
  });
};

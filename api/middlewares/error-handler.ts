import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
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

  // 生产环境只输出错误消息，避免泄露堆栈；开发环境输出完整错误便于排查
  if (env.NODE_ENV === 'production') {
    console.error(error.message);
  } else {
    console.error(error);
  }
  res.status(500).json({
    success: false,
    message: '服务器开小差了，请稍后再试。',
  });
};

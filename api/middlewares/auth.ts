import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

interface TokenPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError('请先登录后再访问该资源。', 401));
    return;
  }

  const token = authorization.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError('登录状态已失效，请重新登录。', 401));
  }
};

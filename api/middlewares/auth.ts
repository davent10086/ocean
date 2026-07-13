import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '../../shared/types.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

interface TokenPayload {
  id: number;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export const authenticate = async (
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

  let payload: TokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    next(new AppError('登录状态已失效，请重新登录。', 401));
    return;
  }

  try {
    // 验签后查询数据库，确保用户仍然存在且角色未变更（删除/降级后 Token 立即失效）
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, disabled: true },
    });

    if (!user || user.role !== payload.role) {
      next(new AppError('登录状态已失效，请重新登录。', 401));
      return;
    }

    if (user.disabled) {
      next(new AppError('该账号已被禁用，请联系管理员。', 403));
      return;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    req.user = authUser;
    next();
  } catch (error) {
    next(error);
  }
};

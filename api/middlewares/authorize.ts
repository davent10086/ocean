import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../../shared/types.js';
import { AppError } from '../utils/app-error.js';

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError('请先登录后再访问该资源。', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('你没有权限执行当前操作。', 403));
      return;
    }

    next();
  };
};

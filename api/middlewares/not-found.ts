import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(new AppError(`未找到接口 ${req.originalUrl}`, 404));
};

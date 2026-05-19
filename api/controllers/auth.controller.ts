import type { Request, Response } from 'express';
import { login, register } from '../services/auth.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const loginController = catchAsync(async (req: Request, res: Response) => {
  const result = await login(req.body.email, req.body.password);
  sendSuccess(res, result, '登录成功，欢迎回来。');
});

export const registerController = catchAsync(async (req: Request, res: Response) => {
  const result = await register(req.body.email, req.body.password);
  sendSuccess(res, result, '注册成功，欢迎加入蓝海书库。', 201);
});

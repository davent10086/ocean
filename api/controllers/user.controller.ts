import type { Request, Response } from 'express';
import { createUser, listUsers } from '../services/user.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const listUsersController = catchAsync(async (_req: Request, res: Response) => {
  const result = await listUsers();
  sendSuccess(res, result);
});

export const createUserController = catchAsync(async (req: Request, res: Response) => {
  const result = await createUser(req.body);
  sendSuccess(res, result, '用户创建成功。', 201);
});

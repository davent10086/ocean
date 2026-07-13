import type { Request, Response } from 'express';
import {
  createUser,
  deleteUser,
  listUsers,
  resetUserPassword,
  setUserDisabled,
  updateUser,
} from '../services/user.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const listUsersController = catchAsync(async (req: Request, res: Response) => {
  const result = await listUsers({
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
  });
  sendSuccess(res, result);
});

export const createUserController = catchAsync(async (req: Request, res: Response) => {
  const result = await createUser(req.user!.id, req.body);
  sendSuccess(res, result, '用户创建成功。', 201);
});

export const updateUserController = catchAsync(async (req: Request, res: Response) => {
  const result = await updateUser(req.user!.id, Number(req.params.id), req.body);
  sendSuccess(res, result, '用户角色已更新。');
});

export const resetUserPasswordController = catchAsync(async (req: Request, res: Response) => {
  await resetUserPassword(req.user!.id, Number(req.params.id), req.body.password);
  sendSuccess(res, undefined, '密码已重置。');
});

export const updateUserStatusController = catchAsync(async (req: Request, res: Response) => {
  const result = await setUserDisabled(req.user!.id, Number(req.params.id), req.body.disabled);
  sendSuccess(res, result, req.body.disabled ? '用户已禁用。' : '用户已启用。');
});

export const deleteUserController = catchAsync(async (req: Request, res: Response) => {
  await deleteUser(req.user!.id, Number(req.params.id));
  sendSuccess(res, undefined, '用户已删除。');
});

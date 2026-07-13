import { z } from 'zod';
import { passwordSchema } from './auth.schema.js';
import { idParamsSchema } from './book.schema.js';

export const userIdParamsSchema = idParamsSchema;

export const createUserSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  password: passwordSchema,
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const updateUserStatusSchema = z.object({
  disabled: z.boolean(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

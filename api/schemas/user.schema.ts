import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  password: z.string().min(6, '密码长度至少为 6 位。'),
  role: z.enum(['ADMIN', 'MEMBER']),
});

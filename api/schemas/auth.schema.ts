import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  password: z.string().min(6, '密码长度至少为 6 位。'),
});

export const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址。'),
    password: z.string().min(6, '密码长度至少为 6 位。'),
    confirmPassword: z.string().min(6, '请再次输入密码。'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: '两次输入的密码不一致。',
  });

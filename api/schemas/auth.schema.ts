import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, '密码长度至少为 8 位。')
  .regex(/[A-Z]/, '密码必须包含大写字母。')
  .regex(/[a-z]/, '密码必须包含小写字母。')
  .regex(/[0-9]/, '密码必须包含数字。');

export { passwordSchema };

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址。'),
  // 登录只校验非空，复杂度校验在注册时完成，避免老用户因密码策略升级无法登录
  password: z.string().min(1, '请输入密码。'),
});

export const registerSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址。'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: '两次输入的密码不一致。',
  });

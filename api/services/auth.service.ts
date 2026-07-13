import jwt, { type SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { createAuditLog } from './audit-log.service.js';

const buildAuthResult = (user: { id: number; email: string; role: 'ADMIN' | 'MEMBER' }) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions,
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('邮箱或密码不正确。', 401);
  }

  if (user.disabled) {
    throw new AppError('该账号已被禁用，请联系管理员。', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('邮箱或密码不正确。', 401);
  }

  await createAuditLog({
    userId: user.id,
    action: 'LOGIN',
    resource: 'auth',
    detail: '用户登录系统',
  });

  return buildAuthResult(user);
};

export const register = async (email: string, password: string) => {
  const normalizedEmail = email.toLowerCase();

  // 注册场景下用户尚未存在，无法预先获得 userId 写审计日志。
  // 这里在事务内先创建用户，再用真实 user.id 补记审计日志，避免外键约束错误。
  const user = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw new AppError('该邮箱已存在，请更换后再试。', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const createdUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: 'MEMBER',
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // AuditAction 枚举暂无 REGISTER，复用 CREATE 表示创建用户
    await createAuditLog({
      userId: createdUser.id,
      action: 'CREATE',
      resource: 'auth',
      detail: '用户注册',
      tx,
    });

    return createdUser;
  });

  return buildAuthResult(user);
};

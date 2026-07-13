import bcrypt from 'bcryptjs';
import type { PaginatedResult } from '../../shared/types.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { createAuditLog } from './audit-log.service.js';

const userSelect = {
  id: true,
  email: true,
  role: true,
  disabled: true,
  createdAt: true,
} as const;

export const listUsers = async (query: {
  page: number;
  pageSize: number;
}): Promise<PaginatedResult<unknown>> => {
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userSelect,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.user.count(),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
};

export const createUser = async (
  creatorId: number,
  input: {
    email: string;
    password: string;
    role: 'ADMIN' | 'MEMBER';
  },
) => {
  const email = input.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError('该邮箱已存在，请更换后再试。', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: input.role,
    },
    select: userSelect,
  });

  await createAuditLog({
    userId: creatorId,
    action: 'CREATE',
    resource: 'user',
    resourceId: user.id,
    detail: `创建用户 ${user.email}`,
  });

  return user;
};

export const updateUser = async (
  currentUserId: number,
  id: number,
  input: { role: 'ADMIN' | 'MEMBER' },
) => {
  // 不允许修改自己的角色，避免误操作导致权限丢失
  if (currentUserId === id) {
    throw new AppError('不能修改自己的角色。', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError('用户不存在或已被删除。', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: input.role },
    select: userSelect,
  });

  await createAuditLog({
    userId: currentUserId,
    action: 'UPDATE',
    resource: 'user',
    resourceId: id,
    detail: `修改用户 ${user.email} 的角色为 ${input.role}`,
  });

  return user;
};

export const resetUserPassword = async (
  currentUserId: number,
  id: number,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError('用户不存在或已被删除。', 404);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  await createAuditLog({
    userId: currentUserId,
    action: 'UPDATE',
    resource: 'user',
    resourceId: id,
    detail: `重置用户 ${existingUser.email} 的密码`,
  });
};

export const setUserDisabled = async (
  currentUserId: number,
  id: number,
  disabled: boolean,
) => {
  // 不允许禁用自己，避免管理员锁定自己
  if (currentUserId === id) {
    throw new AppError('不能禁用或启用自己。', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError('用户不存在或已被删除。', 404);
  }

  const user = await prisma.user.update({
    where: { id },
    data: { disabled },
    select: userSelect,
  });

  await createAuditLog({
    userId: currentUserId,
    action: 'UPDATE',
    resource: 'user',
    resourceId: id,
    detail: disabled
      ? `禁用用户 ${existingUser.email}`
      : `启用用户 ${existingUser.email}`,
  });

  return user;
};

export const deleteUser = async (currentUserId: number, id: number) => {
  // 不允许删除自己
  if (currentUserId === id) {
    throw new AppError('不能删除自己。', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new AppError('用户不存在或已被删除。', 404);
  }

  // 检查是否有未归还的借阅记录，有则阻止删除
  const activeBorrow = await prisma.borrowRecord.findFirst({
    where: {
      userId: id,
      returnDate: null,
    },
  });

  if (activeBorrow) {
    throw new AppError('该用户仍有未归还的借阅记录，暂时不能删除。', 400);
  }

  await prisma.user.delete({ where: { id } });

  await createAuditLog({
    userId: currentUserId,
    action: 'DELETE',
    resource: 'user',
    resourceId: id,
    detail: `删除用户 ${existingUser.email}`,
  });
};

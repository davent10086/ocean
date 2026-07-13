import type { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

interface CreateAuditLogInput {
  userId: number;
  action: AuditAction;
  resource: string;
  resourceId?: number;
  detail?: string;
  // 可选的事务客户端，传入时审计日志写入同一事务，保证原子性
  tx?: Prisma.TransactionClient;
}

export const createAuditLog = async (input: CreateAuditLogInput) => {
  const client = input.tx ?? prisma;
  return client.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId ?? null,
      detail: input.detail ?? null,
    },
  });
};

export const listAuditLogs = async (params: {
  page: number;
  pageSize: number;
  action?: string;
  userId?: number;
}) => {
  const where: Prisma.AuditLogWhereInput = {};

  if (params.action) {
    where.action = params.action as AuditAction;
  }

  if (params.userId) {
    where.userId = params.userId;
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
};
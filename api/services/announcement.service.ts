import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { createAuditLog } from './audit-log.service.js';

export const listAnnouncements = async (query: {
  page: number;
  pageSize: number;
}) => {
  const [items, total] = await prisma.$transaction([
    prisma.announcement.findMany({
      include: {
        author: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.announcement.count(),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
};

export const getLatestAnnouncements = async (limit = 5) => {
  return prisma.announcement.findMany({
    include: {
      author: {
        select: { id: true, email: true, role: true },
      },
    },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
};

export const createAnnouncement = async (
  userId: number,
  input: { title: string; content: string; pinned?: boolean },
) => {
  const announcement = await prisma.announcement.create({
    data: {
      title: input.title,
      content: input.content,
      pinned: input.pinned ?? false,
      authorId: userId,
    },
    include: {
      author: { select: { id: true, email: true, role: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'CREATE',
    resource: 'announcement',
    resourceId: announcement.id,
    detail: `发布公告《${announcement.title}》`,
  });

  return announcement;
};

export const updateAnnouncement = async (
  userId: number,
  id: number,
  input: { title: string; content: string; pinned?: boolean },
) => {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('公告不存在或已被删除。', 404);
  }

  const announcement = await prisma.announcement.update({
    where: { id },
    data: input,
    include: {
      author: { select: { id: true, email: true, role: true } },
    },
  });

  await createAuditLog({
    userId,
    action: 'UPDATE',
    resource: 'announcement',
    resourceId: id,
    detail: `更新公告《${announcement.title}》`,
  });

  return announcement;
};

export const deleteAnnouncement = async (userId: number, id: number) => {
  const existing = await prisma.announcement.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('公告不存在或已被删除。', 404);
  }

  await prisma.announcement.delete({ where: { id } });

  await createAuditLog({
    userId,
    action: 'DELETE',
    resource: 'announcement',
    resourceId: id,
    detail: `删除公告《${existing.title}》`,
  });
};

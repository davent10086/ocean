import { BorrowStatus, Prisma } from '@prisma/client';
import type { AuthUser, PaginatedResult } from '../../shared/types.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { calculateDueDate, getBorrowBlockReason } from '../utils/borrow-policy.js';
import { createAuditLog } from './audit-log.service.js';

// 同步过期借阅记录的节流间隔（毫秒），避免每次列表/创建/归还都触发 updateMany
const SYNC_OVERDUE_INTERVAL_MS = 10 * 60 * 1000;
let lastSyncOverdueAt = 0;

export const syncOverdueBorrows = async () => {
  const now = Date.now();
  if (now - lastSyncOverdueAt < SYNC_OVERDUE_INTERVAL_MS) {
    return;
  }
  lastSyncOverdueAt = now;
  await prisma.borrowRecord.updateMany({
    where: {
      returnDate: null,
      dueDate: { lt: new Date() },
      status: BorrowStatus.BORROWED,
    },
    data: {
      status: BorrowStatus.OVERDUE,
    },
  });
};

export const listBorrowRecords = async (
  currentUser: AuthUser,
  query: { page: number; pageSize: number },
): Promise<PaginatedResult<unknown>> => {
  await syncOverdueBorrows();

  const where: Prisma.BorrowRecordWhereInput =
    currentUser.role === 'ADMIN' ? {} : { userId: currentUser.id };

  const [items, total] = await Promise.all([
    prisma.borrowRecord.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        book: true,
      },
      orderBy: { borrowDate: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.borrowRecord.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
};

export const createBorrowRecord = async (bookId: number, currentUser: AuthUser) => {
  await syncOverdueBorrows();

  // 将库存校验与扣减、借阅记录创建合并到同一事务，避免 TOCTOU 竞态导致超扣
  return prisma.$transaction(async (tx) => {
    const [book, activeBorrowCount, duplicatedBorrow] = await Promise.all([
      tx.book.findUnique({ where: { id: bookId } }),
      tx.borrowRecord.count({
        where: {
          userId: currentUser.id,
          returnDate: null,
        },
      }),
      tx.borrowRecord.findFirst({
        where: {
          userId: currentUser.id,
          bookId,
          returnDate: null,
        },
      }),
    ]);

    if (!book) {
      throw new AppError('图书不存在或已被删除。', 404);
    }

    const blockedReason = getBorrowBlockReason({
      stock: book.stock,
      activeBorrowCount,
      duplicateActiveBorrow: Boolean(duplicatedBorrow),
      limit: env.BORROW_LIMIT,
    });

    if (blockedReason) {
      throw new AppError(blockedReason, 400);
    }

    // 条件更新：仅当库存 >= 1 时才扣减，影响行数为 0 说明并发已被他人抢光
    const updateResult = await tx.book.updateMany({
      where: { id: bookId, stock: { gte: 1 } },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });

    if (updateResult.count === 0) {
      throw new AppError('当前图书库存不足，暂时无法借阅。', 400);
    }

    const record = await tx.borrowRecord.create({
      data: {
        userId: currentUser.id,
        bookId,
        dueDate: calculateDueDate(env.BORROW_DAYS),
        status: BorrowStatus.BORROWED,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        book: true,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      action: 'BORROW',
      resource: 'borrow',
      resourceId: record.id,
      detail: `借阅图书《${book.title}》`,
      tx,
    });

    return record;
  });
};

export const returnBorrowRecord = async (recordId: number, currentUser: AuthUser) => {
  await syncOverdueBorrows();

  const record = await prisma.borrowRecord.findUnique({
    where: { id: recordId },
    include: {
      book: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!record) {
    throw new AppError('借阅记录不存在。', 404);
  }

  if (currentUser.role !== 'ADMIN' && record.userId !== currentUser.id) {
    throw new AppError('你只能归还自己的借阅记录。', 403);
  }

  if (record.returnDate) {
    throw new AppError('该图书已归还，无需重复操作。', 400);
  }

  return prisma.$transaction(async (tx) => {
    const updatedRecord = await tx.borrowRecord.update({
      where: { id: recordId },
      data: {
        returnDate: new Date(),
        status: BorrowStatus.RETURNED,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        book: true,
      },
    });

    const updatedBook = await tx.book.update({
      where: { id: updatedRecord.bookId },
      data: {
        stock: {
          increment: 1,
        },
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      action: 'RETURN',
      resource: 'borrow',
      resourceId: recordId,
      detail: `归还图书《${updatedBook.title}》`,
      tx,
    });

    return {
      ...updatedRecord,
      book: updatedBook,
    };
  });
};

import { BorrowStatus, Prisma } from '@prisma/client';
import type { AuthUser } from '../../shared/types.js';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { calculateDueDate, getBorrowBlockReason } from '../utils/borrow-policy.js';

export const syncOverdueBorrows = async () => {
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

export const listBorrowRecords = async (currentUser: AuthUser) => {
  await syncOverdueBorrows();

  const where: Prisma.BorrowRecordWhereInput =
    currentUser.role === 'ADMIN' ? {} : { userId: currentUser.id };

  return prisma.borrowRecord.findMany({
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
  });
};

export const createBorrowRecord = async (bookId: number, currentUser: AuthUser) => {
  await syncOverdueBorrows();

  const [book, activeBorrowCount, duplicatedBorrow] = await prisma.$transaction([
    prisma.book.findUnique({ where: { id: bookId } }),
    prisma.borrowRecord.count({
      where: {
        userId: currentUser.id,
        returnDate: null,
      },
    }),
    prisma.borrowRecord.findFirst({
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

  return prisma.$transaction(async (tx) => {
    await tx.book.update({
      where: { id: bookId },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });

    return tx.borrowRecord.create({
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

    return {
      ...updatedRecord,
      book: updatedBook,
    };
  });
};

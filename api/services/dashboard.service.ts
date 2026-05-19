import { Prisma } from '@prisma/client';
import type { AuthUser } from '../../shared/types.js';
import { prisma } from '../config/prisma.js';
import { syncOverdueBorrows } from './borrow.service.js';

export const getAdminDashboardSummary = async () => {
  await syncOverdueBorrows();

  const [totalBooks, activeBorrows, overdueBorrows, totalUsers, recentRecords, lowStockBooks] =
    await Promise.all([
      prisma.book.count(),
      prisma.borrowRecord.count({
        where: {
          returnDate: null,
        },
      }),
      prisma.borrowRecord.count({
        where: {
          status: 'OVERDUE',
          returnDate: null,
        },
      }),
      prisma.user.count(),
      prisma.borrowRecord.findMany({
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
        take: 6,
      }),
      prisma.book.findMany({
        where: {
          stock: {
            lte: 2,
          },
        },
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        take: 5,
      }),
    ]);

  return {
    scope: 'ADMIN' as const,
    counts: {
      totalBooks,
      activeBorrows,
      overdueBorrows,
      totalUsers,
    },
    recentRecords,
    lowStockBooks,
  };
};

export const getMemberDashboardSummary = async (currentUser: AuthUser) => {
  await syncOverdueBorrows();

  const borrowFilter: Prisma.BorrowRecordWhereInput = { userId: currentUser.id };

  const [activeBorrows, overdueBorrows, recentRecords] = await Promise.all([
    prisma.borrowRecord.count({
      where: {
        ...borrowFilter,
        returnDate: null,
      },
    }),
    prisma.borrowRecord.count({
      where: {
        ...borrowFilter,
        status: 'OVERDUE',
        returnDate: null,
      },
    }),
    prisma.borrowRecord.findMany({
      where: borrowFilter,
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
      take: 6,
    }),
  ]);

  return {
    scope: 'MEMBER' as const,counts: {
      activeBorrows,
      overdueBorrows,
    },
    recentRecords,
  };
};

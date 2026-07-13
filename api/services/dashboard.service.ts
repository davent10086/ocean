import { Prisma } from '@prisma/client';
import type { AuthUser } from '../../shared/types.js';
import { prisma } from '../config/prisma.js';
import { syncOverdueBorrows } from './borrow.service.js';

// 仪表盘相关常量，避免魔法数字散落各处
const RECENT_RECORDS_LIMIT = 6;
const LOW_STOCK_BOOKS_LIMIT = 5;
const LOW_STOCK_THRESHOLD = 2;
const MONTHLY_BORROWS_MONTHS = 6;
const WEEKLY_ACTIVITY_DAYS = 7;

interface MonthlyBorrowRow {
  month: string;
  count: bigint;
}

interface WeeklyActivityRow {
  day: string;
  borrows: bigint;
  returns: bigint;
}

const getMonthlyBorrows = async (userId?: number) => {
  // 近 6 个月按月分组统计借阅数，使用 PostgreSQL date_trunc 避免全表加载到内存
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (MONTHLY_BORROWS_MONTHS - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const userCondition = userId ? Prisma.sql`AND user_id = ${userId}` : Prisma.empty;

  const rows = await prisma.$queryRaw<MonthlyBorrowRow[]>`
    SELECT to_char(date_trunc('month', borrow_date), 'YYYY-MM') AS month,
           COUNT(*)::bigint AS count
    FROM borrow_records
    WHERE borrow_date >= ${startDate} ${userCondition}
    GROUP BY month
    ORDER BY month ASC
  `;

  // 构建完整的近 6 个月标签，缺失月份补 0
  const months: string[] = [];
  for (let i = MONTHLY_BORROWS_MONTHS - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const countMap = new Map(rows.map((row) => [row.month, Number(row.count)]));

  return months.map((month) => ({
    month,
    count: countMap.get(month) ?? 0,
  }));
};

const getWeeklyActivity = async (userId?: number) => {
  // 近 7 天按日分组统计借阅与归还数，使用 PostgreSQL date_trunc 避免全表加载到内存
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (WEEKLY_ACTIVITY_DAYS - 1));
  startDate.setHours(0, 0, 0, 0);

  const userCondition = userId ? Prisma.sql`AND user_id = ${userId}` : Prisma.empty;

  const borrowRows = await prisma.$queryRaw<WeeklyActivityRow[]>`
    SELECT to_char(date_trunc('day', borrow_date), 'YYYY-MM-DD') AS day,
           COUNT(*)::bigint AS borrows,
           0::bigint AS returns
    FROM borrow_records
    WHERE borrow_date >= ${startDate} ${userCondition}
    GROUP BY day
  `;

  const returnRows = await prisma.$queryRaw<WeeklyActivityRow[]>`
    SELECT to_char(date_trunc('day', return_date), 'YYYY-MM-DD') AS day,
           0::bigint AS borrows,
           COUNT(*)::bigint AS returns
    FROM borrow_records
    WHERE return_date >= ${startDate} ${userCondition}
    GROUP BY day
  `;

  // 合并借阅与归还数据
  const borrowMap = new Map(borrowRows.map((row) => [row.day, Number(row.borrows)]));
  const returnMap = new Map(returnRows.map((row) => [row.day, Number(row.returns)]));

  // 构建完整的近 7 天标签，缺失日期补 0
  const dayNames: string[] = [];
  const dayKeys: string[] = [];
  for (let i = WEEKLY_ACTIVITY_DAYS - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayNames.push(`${d.getMonth() + 1}/${d.getDate()}`);
    dayKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  return dayNames.map((day, idx) => ({
    day,
    borrows: borrowMap.get(dayKeys[idx]) ?? 0,
    returns: returnMap.get(dayKeys[idx]) ?? 0,
  }));
};

export const getAdminDashboardSummary = async () => {
  await syncOverdueBorrows();

  const [totalBooks, activeBorrows, overdueBorrows, totalUsers, recentRecords, lowStockBooks, monthlyBorrows, weeklyActivity] =
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
        take: RECENT_RECORDS_LIMIT,
      }),
      prisma.book.findMany({
        where: {
          stock: {
            lte: LOW_STOCK_THRESHOLD,
          },
        },
        orderBy: [{ stock: 'asc' }, { updatedAt: 'desc' }],
        take: LOW_STOCK_BOOKS_LIMIT,
      }),
      getMonthlyBorrows(),
      getWeeklyActivity(),
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
    charts: {
      monthlyBorrows,
      weeklyActivity,
    },
  };
};

export const getMemberDashboardSummary = async (currentUser: AuthUser) => {
  await syncOverdueBorrows();

  const borrowFilter: Prisma.BorrowRecordWhereInput = { userId: currentUser.id };

  // 会员仪表盘仅查询自己的借阅数据，传入 userId 过滤图表统计
  const [activeBorrows, overdueBorrows, recentRecords, monthlyBorrows, weeklyActivity] = await Promise.all([
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
      take: RECENT_RECORDS_LIMIT,
    }),
    getMonthlyBorrows(currentUser.id),
    getWeeklyActivity(currentUser.id),
  ]);

  return {
    scope: 'MEMBER' as const,
    counts: {
      activeBorrows,
      overdueBorrows,
    },
    recentRecords,
    charts: {
      monthlyBorrows,
      weeklyActivity,
    },
  };
};

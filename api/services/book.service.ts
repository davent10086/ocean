import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';

export const listBooks = async (query: {
  search?: string;
  page: number;
  pageSize: number;
}) => {
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
          { isbn: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
};

export const createBook = async (input: {
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  stock: number;
}) => {
  const existingBook = await prisma.book.findUnique({ where: { isbn: input.isbn } });

  if (existingBook) {
    throw new AppError('ISBN 已存在，请检查后再试。', 409);
  }

  return prisma.book.create({ data: input });
};

export const updateBook = async (id: number, input: {
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  stock: number;
}) => {
  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    throw new AppError('图书不存在或已被删除。', 404);
  }

  const duplicatedBook = await prisma.book.findFirst({
    where: {
      isbn: input.isbn,
      NOT: { id },
    },
  });

  if (duplicatedBook) {
    throw new AppError('ISBN 已存在，请检查后再试。', 409);
  }

  return prisma.book.update({
    where: { id },
    data: input,
  });
};

export const deleteBook = async (id: number) => {
  const existingBook = await prisma.book.findUnique({ where: { id } });

  if (!existingBook) {
    throw new AppError('图书不存在或已被删除。', 404);
  }

  const activeBorrow = await prisma.borrowRecord.findFirst({
    where: {
      bookId: id,
      returnDate: null,
    },
  });

  if (activeBorrow) {
    throw new AppError('该图书仍有未归还记录，暂时不能删除。', 400);
  }

  await prisma.book.delete({ where: { id } });
};

import { z } from 'zod';
import { idParamsSchema } from './book.schema.js';

export const createBorrowRecordSchema = z.object({
  bookId: z.coerce.number().int().positive('图书 ID 不合法。'),
});

// 复用通用 ID 参数校验，避免重复定义
export const borrowRecordIdParamsSchema = idParamsSchema;

export const listBorrowRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

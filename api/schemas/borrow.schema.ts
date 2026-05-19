import { z } from 'zod';

export const createBorrowRecordSchema = z.object({
  bookId: z.coerce.number().int().positive('图书 ID 不合法。'),
});

export const borrowRecordIdParamsSchema = z.object({
  id: z.coerce.number().int().positive('借阅记录 ID 不合法。'),
});

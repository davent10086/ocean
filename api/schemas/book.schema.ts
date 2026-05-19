import { z } from 'zod';

export const bookIdParamsSchema = z.object({
  id: z.coerce.number().int().positive('图书 ID 不合法。'),
});

export const saveBookSchema = z.object({
  title: z.string().min(1, '请输入图书标题。').max(120, '图书标题过长。'),
  author: z.string().min(1, '请输入作者名称。').max(80, '作者名称过长。'),
  isbn: z.string().min(6, 'ISBN 长度不能过短。').max(30, 'ISBN 长度不能过长。'),
  publishYear: z.coerce.number().int('出版年份必须为整数。').min(1000, '出版年份不合法。').max(new Date().getFullYear() + 1, '出版年份不合法。'),
  stock: z.coerce.number().int('库存必须为整数。').min(0, '库存不能为负数。').max(9999),
});

export const listBooksQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

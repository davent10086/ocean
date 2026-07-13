import { z } from 'zod';
import { idParamsSchema } from './book.schema.js';

export const saveAnnouncementSchema = z.object({
  title: z.string().min(1, '请输入公告标题。').max(120, '公告标题过长。'),
  content: z.string().min(1, '请输入公告内容。').max(5000, '公告内容过长。'),
  pinned: z.boolean().optional().default(false),
});

export const listAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const announcementIdParamsSchema = idParamsSchema;

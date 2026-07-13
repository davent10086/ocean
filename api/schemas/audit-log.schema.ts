import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  action: z.string().trim().optional(),
  userId: z.coerce.number().int().positive().optional(),
});

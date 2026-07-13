import type { Request, Response } from 'express';
import { listAuditLogs } from '../services/audit-log.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const listAuditLogsController = catchAsync(async (req: Request, res: Response) => {
  // query 已由 validate 中间件解析为带默认值的数字，这里用 unknown 中转避免类型冲突
  const query = req.query as unknown as {
    page: number;
    pageSize: number;
    action?: string;
    userId?: number;
  };
  const result = await listAuditLogs({
    page: query.page,
    pageSize: query.pageSize,
    action: query.action,
    userId: query.userId,
  });
  sendSuccess(res, result);
});
import type { Request, Response } from 'express';
import { getAdminDashboardSummary, getMemberDashboardSummary } from '../services/dashboard.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const getAdminDashboardSummaryController = catchAsync(async (req: Request, res: Response) => {
  const result = await getAdminDashboardSummary();
  sendSuccess(res, result);
});

export const getMemberDashboardSummaryController = catchAsync(async (req: Request, res: Response) => {
  const result = await getMemberDashboardSummary(req.user!);
  sendSuccess(res, result);
});

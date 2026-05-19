import type { Request, Response } from 'express';
import { createBorrowRecord, listBorrowRecords, returnBorrowRecord } from '../services/borrow.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const listBorrowRecordsController = catchAsync(async (req: Request, res: Response) => {
  const result = await listBorrowRecords(req.user!);
  sendSuccess(res, result);
});

export const createBorrowRecordController = catchAsync(async (req: Request, res: Response) => {
  const result = await createBorrowRecord(req.body.bookId, req.user!);
  sendSuccess(res, result, '借阅成功，记得按时归还。', 201);
});

export const returnBorrowRecordController = catchAsync(async (req: Request, res: Response) => {
  const result = await returnBorrowRecord(Number(req.params.id), req.user!);
  sendSuccess(res, result, '归还成功，欢迎下次借阅。');
});

import type { Request, Response } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  getLatestAnnouncements,
  listAnnouncements,
  updateAnnouncement,
} from '../services/announcement.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const listAnnouncementsController = catchAsync(async (req: Request, res: Response) => {
  const result = await listAnnouncements({
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
  });
  sendSuccess(res, result);
});

export const getLatestAnnouncementsController = catchAsync(async (_req: Request, res: Response) => {
  const items = await getLatestAnnouncements(5);
  sendSuccess(res, items);
});

export const createAnnouncementController = catchAsync(async (req: Request, res: Response) => {
  const result = await createAnnouncement(req.user!.id, req.body);
  sendSuccess(res, result, '公告发布成功。', 201);
});

export const updateAnnouncementController = catchAsync(async (req: Request, res: Response) => {
  const result = await updateAnnouncement(req.user!.id, Number(req.params.id), req.body);
  sendSuccess(res, result, '公告更新成功。');
});

export const deleteAnnouncementController = catchAsync(async (req: Request, res: Response) => {
  await deleteAnnouncement(req.user!.id, Number(req.params.id));
  sendSuccess(res, undefined, '公告删除成功。');
});

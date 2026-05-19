import type { Request, Response } from 'express';
import { createBook, deleteBook, listBooks, updateBook } from '../services/book.service.js';
import { catchAsync } from '../utils/catch-async.js';
import { sendSuccess } from '../utils/response.js';

export const listBooksController = catchAsync(async (req: Request, res: Response) => {
  const result = await listBooks({
    search: String(req.query.search ?? ''),
    page: Number(req.query.page ?? 1),
    pageSize: Number(req.query.pageSize ?? 10),
  });

  sendSuccess(res, result);
});

export const createBookController = catchAsync(async (req: Request, res: Response) => {
  const result = await createBook(req.body);
  sendSuccess(res, result, '图书创建成功。', 201);
});

export const updateBookController = catchAsync(async (req: Request, res: Response) => {
  const result = await updateBook(Number(req.params.id), req.body);
  sendSuccess(res, result, '图书更新成功。');
});

export const deleteBookController = catchAsync(async (req: Request, res: Response) => {
  await deleteBook(Number(req.params.id));
  sendSuccess(res, undefined, '图书删除成功。');
});

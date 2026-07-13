import type { ApiResponse, DashboardSummary, LoginResult, PaginatedResult, BookItem, BorrowRecordItem, AnnouncementItem } from '../../shared/types';
import type { AuditLogItem, BookFormValues, RegisterFormValues, ResetPasswordFormValues, UpdateUserFormValues, UserFormValues, UserListItem } from '../types/app';
import { http } from './http';

const unwrap = async <T>(request: Promise<{ data: ApiResponse<T> }>) => {
  const response = await request;
  if (!response.data.success || response.data.data === undefined) {
    throw new Error(response.data.message || '响应数据为空');
  }
  return response.data.data;
};

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    unwrap<LoginResult>(http.post('/auth/login', payload)),
  register: (payload: RegisterFormValues) =>
    unwrap<LoginResult>(http.post('/auth/register', payload)),
};

export const dashboardApi = {
  getAdminSummary: () => unwrap<DashboardSummary>(http.get('/dashboard')),
  getMemberSummary: () => unwrap<DashboardSummary>(http.get('/dashboard/me')),
};

export const booksApi = {
  list: (params: { search?: string; page: number; pageSize: number }) =>
    unwrap<PaginatedResult<BookItem>>(http.get('/books', { params })),
  create: (payload: BookFormValues) => unwrap<BookItem>(http.post('/books', payload)),
  update: (id: number, payload: BookFormValues) => unwrap<BookItem>(http.put(`/books/${id}`, payload)),
  remove: async (id: number) => {
    const response = await http.delete(`/books/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '删除失败');
    }
  },
};

export const borrowApi = {
  list: (params: { page: number; pageSize: number }) =>
    unwrap<PaginatedResult<BorrowRecordItem>>(http.get('/borrow-records', { params })),
  create: (bookId: number) => unwrap<BorrowRecordItem>(http.post('/borrow-records', { bookId })),
  returnBook: (id: number) => unwrap<BorrowRecordItem>(http.post(`/borrow-records/${id}/return`)),
};

export const usersApi = {
  list: (params: { page: number; pageSize: number }) =>
    unwrap<PaginatedResult<UserListItem>>(http.get('/users', { params })),
  create: (payload: UserFormValues) => unwrap<UserListItem>(http.post('/users', payload)),
  update: (id: number, payload: UpdateUserFormValues) =>
    unwrap<UserListItem>(http.put(`/users/${id}`, payload)),
  resetPassword: (id: number, payload: ResetPasswordFormValues) =>
    http.patch(`/users/${id}/password`, { password: payload.password }),
  setStatus: (id: number, disabled: boolean) =>
    unwrap<UserListItem>(http.patch(`/users/${id}/status`, { disabled })),
  remove: async (id: number) => {
    const response = await http.delete(`/users/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '删除失败');
    }
  },
};

export const auditLogsApi = {
  list: (params: { page: number; pageSize: number; action?: string; userId?: number }) =>
    unwrap<PaginatedResult<AuditLogItem>>(http.get('/audit-logs', { params })),
};

export const announcementsApi = {
  list: (params: { page: number; pageSize: number }) =>
    unwrap<PaginatedResult<AnnouncementItem>>(http.get('/announcements', { params })),
  latest: () => unwrap<AnnouncementItem[]>(http.get('/announcements/latest')),
  create: (payload: { title: string; content: string; pinned?: boolean }) =>
    unwrap<AnnouncementItem>(http.post('/announcements', payload)),
  update: (id: number, payload: { title: string; content: string; pinned?: boolean }) =>
    unwrap<AnnouncementItem>(http.put(`/announcements/${id}`, payload)),
  remove: async (id: number) => {
    const response = await http.delete(`/announcements/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || '删除失败');
    }
  },
};

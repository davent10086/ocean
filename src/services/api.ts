import type { ApiResponse, DashboardSummary, LoginResult, PaginatedResult, BookItem, BorrowRecordItem } from '../../shared/types';
import type { BookFormValues, RegisterFormValues, UserFormValues, UserListItem } from '../types/app';
import { http } from './http';

const unwrap = async <T>(request: Promise<{ data: ApiResponse<T> }>) => {
  const response = await request;
  return response.data.data as T;
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
  remove: (id: number) => unwrap<void>(http.delete(`/books/${id}`)),
};

export const borrowApi = {
  list: () => unwrap<BorrowRecordItem[]>(http.get('/borrow-records')),
  create: (bookId: number) => unwrap<BorrowRecordItem>(http.post('/borrow-records', { bookId })),
  returnBook: (id: number) => unwrap<BorrowRecordItem>(http.post(`/borrow-records/${id}/return`)),
};

export const usersApi = {
  list: () => unwrap<UserListItem[]>(http.get('/users')),
  create: (payload: UserFormValues) => unwrap<UserListItem>(http.post('/users', payload)),
};

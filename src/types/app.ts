import type { AuthUser, BookItem, BorrowRecordItem, DashboardSummary, PaginatedResult } from '../../shared/types';

export type { AuthUser, BookItem, BorrowRecordItem, DashboardSummary, PaginatedResult };

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BookFormValues {
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  stock: number;
}

export interface UserFormValues {
  email: string;
  password: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface UserListItem extends AuthUser {
  createdAt: string;
}

import type { AuthUser, BookItem, BorrowRecordItem, DashboardSummary, PaginatedResult, AnnouncementItem } from '../../shared/types';

export type { AuthUser, BookItem, BorrowRecordItem, DashboardSummary, PaginatedResult, AnnouncementItem };

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

export interface UpdateUserFormValues {
  role: 'ADMIN' | 'MEMBER';
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

export interface UserListItem extends AuthUser {
  disabled: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  userId: number;
  action: string;
  resource: string;
  resourceId: number | null;
  detail: string | null;
  createdAt: string;
  user: AuthUser;
}

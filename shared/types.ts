export type UserRole = 'ADMIN' | 'MEMBER';
export type BorrowStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface BookItem {
  id: number;
  title: string;
  author: string;
  isbn: string;
  publishYear: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BorrowRecordItem {
  id: number;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: BorrowStatus;
  user: AuthUser;
  book: BookItem;
}

export interface AdminDashboardSummary {
  scope: 'ADMIN';
  counts: {
    totalBooks: number;
    activeBorrows: number;
    overdueBorrows: number;
    totalUsers: number;
  };
  recentRecords: BorrowRecordItem[];
  lowStockBooks: BookItem[];
  charts: DashboardCharts;
}

export interface MemberDashboardSummary {
  scope: 'MEMBER';
  counts: {
    activeBorrows: number;
    overdueBorrows: number;
  };
  recentRecords: BorrowRecordItem[];
  charts: DashboardCharts;
}

export interface DashboardCharts {
  monthlyBorrows: { month: string; count: number }[];
  weeklyActivity: { day: string; borrows: number; returns: number }[];
}

export type DashboardSummary = AdminDashboardSummary | MemberDashboardSummary;

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  authorId: number;
  author: AuthUser;
  createdAt: string;
  updatedAt: string;
}

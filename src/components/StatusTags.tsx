import { Tag } from 'antd';
import type { BorrowStatus, UserRole } from '../../shared/types';

export function BorrowStatusTag({ status }: { status: BorrowStatus }) {
  const config = {
    BORROWED: { color: 'processing', label: '借阅中' },
    RETURNED: { color: 'success', label: '已归还' },
    OVERDUE: { color: 'error', label: '已逾期' },
  }[status];

  return <Tag color={config.color}>{config.label}</Tag>;
}

export function RoleTag({ role }: { role: UserRole }) {
  return <Tag color={role === 'ADMIN' ? 'blue' : 'cyan'}>{role === 'ADMIN' ? '管理员' : '成员'}</Tag>;
}

export function UserStatusTag({ disabled }: { disabled: boolean }) {
  return disabled
    ? <Tag color="error">已禁用</Tag>
    : <Tag color="success">正常</Tag>;
}

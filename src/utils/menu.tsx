import { BookOutlined, DashboardOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import type { ItemType } from 'antd/es/menu/interface';
import type { UserRole } from '../../shared/types';

export interface AppMenuItem {
  key: string;
  label: string;
  icon: JSX.Element;
  roles: UserRole[];
}

const menuItems: AppMenuItem[] = [
  { key: '/dashboard', label: '蓝海总览', icon: <DashboardOutlined />, roles: ['ADMIN', 'MEMBER'] },
  { key: '/books', label: '图书管理', icon: <BookOutlined />, roles: ['ADMIN', 'MEMBER'] },
  { key: '/borrows', label: '借阅记录', icon: <ReadOutlined />, roles: ['ADMIN', 'MEMBER'] },
  { key: '/users', label: '用户管理', icon: <TeamOutlined />, roles: ['ADMIN'] },
];

export const getMenuItemsByRole = (role?: UserRole): ItemType[] => {
  if (!role) {
    return [];
  }

  return menuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => ({
      key: item.key,
      icon: item.icon,
      label: item.key === '/dashboard' && role === 'MEMBER' ? '我的概览' : item.label,
    }));
};

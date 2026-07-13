import { LogoutOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuthStore } from '../store/auth-store';
import { getMenuItemsByRole } from '../utils/menu';
import { ChatBot } from '../components/ChatBot';

const { Header, Sider, Content } = Layout;

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: '在蓝色海岸边管理每一本书', subtitle: '让借阅、归还与库存流转更清晰。' },
  '/books': { title: '搜索、浏览与维护书库', subtitle: '让每一本书都井然有序。' },
  '/borrows': { title: '借阅与归还', subtitle: '追踪每一本书的流转轨迹。' },
  '/users': { title: '用户与权限', subtitle: '管理成员账号与角色。' },
  '/announcements': { title: '公告与通知', subtitle: '让读者及时了解最新动态。' },
  '/audit-logs': { title: '操作日志', subtitle: '追踪系统变更记录。' },
};

function OwlLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="20" fill="url(#owl-grad)" />
      <path d="M35 38C35 32 40 28 50 28C60 28 65 32 65 38C65 44 60 48 50 48C40 48 35 44 35 38Z" fill="white" />
      <circle cx="43" cy="38" r="6" fill="#1e3a8a" />
      <circle cx="57" cy="38" r="6" fill="#1e3a8a" />
      <circle cx="44" cy="37" r="2.5" fill="white" />
      <circle cx="58" cy="37" r="2.5" fill="white" />
      <path d="M47 46L50 50L53 46" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinejoin="round" />
      <path d="M28 55C28 55 32 62 50 62C68 62 72 55 72 55" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M30 30L38 24" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 30L62 24" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
      <rect x="40" y="68" width="20" height="8" rx="2" fill="#1e40af" />
      <rect x="41" y="69" width="8" height="6" rx="1" fill="white" />
      <rect x="51" y="69" width="8" height="6" rx="1" fill="white" />
      <defs>
        <linearGradient id="owl-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const items = useMemo(() => getMenuItemsByRole(user?.role), [user?.role]);

  const pageMeta = PAGE_META[location.pathname] ?? PAGE_META['/dashboard']!;

  const actionItems = useMemo<MenuProps['items']>(() => [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ], [logout, navigate]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="light" className="app-sider" breakpoint="lg" collapsedWidth={0} collapsible>
        <div className="brand-block">
          <OwlLogo />
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: '#0f2857' }}>
              蓝海书库
            </Typography.Title>
            <Typography.Text style={{ color: '#6883ad' }}>Blue Ocean Library</Typography.Text>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={({ key }) => navigate(String(key))}
          className="app-menu"
        />
      </Sider>
      <Layout className="app-shell">
        <Header className="app-header">
          <div className="header-title-group">
            <Typography.Title level={4} style={{ margin: 0, color: '#0b2252' }}>
              {pageMeta.title}
            </Typography.Title>
            <Typography.Text style={{ color: 'var(--color-text-secondary)' }}>{pageMeta.subtitle}</Typography.Text>
          </div>
          <Space size="middle">
            <Dropdown menu={{ items: actionItems }} trigger={['click']}>
              <Space className="user-chip">
                <Avatar style={{ backgroundColor: '#3B82F6' }}>{user?.email?.slice(0, 1).toUpperCase()}</Avatar>
                <div>
                  <Typography.Text strong>{user?.email}</Typography.Text>
                  <div className="muted-text">{user?.role === 'ADMIN' ? '管理员' : '成员'}</div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
      <ChatBot />
    </Layout>
  );
}

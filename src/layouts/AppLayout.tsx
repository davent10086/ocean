import { BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuthStore } from '../store/auth-store';
import { getMenuItemsByRole } from '../utils/menu';
import { ChatBot } from '../components/ChatBot';

const { Header, Sider, Content } = Layout;

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const items = useMemo(() => getMenuItemsByRole(user?.role), [user?.role]);

  const actionItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={240} theme="light" className="app-sider">
        <div className="brand-block">
          <div className="brand-mark">B</div>
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
          <div>
            <Typography.Title level={4} style={{ margin: 0, color: '#0b2252' }}>
              在蓝色海岸边管理每一本书
            </Typography.Title>
            <Typography.Text style={{ color: '#5f769f' }}>让借阅、归还与库存流转更清晰。</Typography.Text>
          </div>
          <Space size="middle">
            <Button shape="circle" icon={<BellOutlined />} />
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

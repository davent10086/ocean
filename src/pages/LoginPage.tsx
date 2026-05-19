import { LockOutlined, MailOutlined, ReadOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Segmented, Space, Typography } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginPet } from '../components/LoginPet';
import { authApi } from '../services/api';
import { feedback } from '../services/feedback';
import { useAuthStore } from '../store/auth-store';
import type { LoginFormValues, RegisterFormValues } from '../types/app';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const target = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const result = await authApi.login(values);
      setAuth(result.token, result.user);
      feedback.success('登录成功，欢迎来到蓝海书库。');
      navigate(target, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: RegisterFormValues) => {
    setLoading(true);

    try {
      const result = await authApi.register(values);
      setAuth(result.token, result.user);
      feedback.success('注册成功，欢迎来到蓝海书库。');
      navigate(target, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="login-glow login-glow-a" aria-hidden="true" />
        <div className="login-glow login-glow-b" aria-hidden="true" />
        <div className="login-grid" aria-hidden="true" />
        <Space direction="vertical" size={24}>
          <div className="brand-pill">
            <ReadOutlined /> 蓝海书库管理台
          </div>
          <LoginPet sleeping={passwordFocused} />
          <Typography.Title level={1} className="login-title">
            让馆长先为你
            <br />
            点亮今天的书海工位。
          </Typography.Title>
        </Space>
      </div>
      <Card className="login-card" variant="borderless">
        <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {mode === 'login' ? '欢迎登录' : '创建账号'}
          </Typography.Title>
          <Typography.Text type="secondary">
            {mode === 'login' ? '使用邮箱与密码进入你的书海工作台。' : '注册后将以成员身份进入书海工作台。'}
          </Typography.Text>
        </Space>
        <Segmented
          block
          className="login-mode-switch"
          options={[
            { label: '登录', value: 'login' },
            { label: '注册', value: 'register' },
          ]}
          value={mode}
          onChange={(value) => setMode(value as 'login' | 'register')}
        />
        {mode === 'login' ? (
          <Form<LoginFormValues>
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ email: 'admin@blueocean.local', password: 'Admin123!' }}
          >
            <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
              <Input prefix={<MailOutlined />} placeholder="请输入邮箱" size="large" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              进入系统
            </Button>
          </Form>
        ) : (
          <Form<RegisterFormValues> layout="vertical" onFinish={handleRegister}>
            <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
              <Input prefix={<MailOutlined />} placeholder="请输入注册邮箱" size="large" />
            </Form.Item>
            <Form.Item name="password" label="密码" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                size="large"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              注册并进入系统
            </Button>
          </Form>
        )}
        <Card className="login-tips" variant="borderless">
          <Typography.Text strong>演示账号</Typography.Text>
          <div>管理员：admin@blueocean.local / Admin123!</div>
          <div>成员：member@blueocean.local / Member123!</div>
        </Card>
      </Card>
    </div>
  );
}

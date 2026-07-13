import { Button, Result } from 'antd';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';

interface RequireAuthProps {
  roles?: Array<'ADMIN' | 'MEMBER'>;
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function RequireAuth({ roles }: RequireAuthProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // token 过期检查
  if (token && isTokenExpired(token)) {
    logout();
    return <Navigate to="/login?expired=1" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="无权限访问"
        subTitle="当前页面仅向管理员开放。"
        extra={<Button type="primary" onClick={() => navigate('/dashboard')}>返回总览</Button>}
      />
    );
  }

  return <Outlet />;
}

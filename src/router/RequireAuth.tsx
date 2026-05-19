import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Result } from 'antd';
import { useAuthStore } from '../store/auth-store';

interface RequireAuthProps {
  roles?: Array<'ADMIN' | 'MEMBER'>;
}

export function RequireAuth({ roles }: RequireAuthProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Result status="403" title="无权限访问" subTitle="当前页面仅向管理员开放。" />;
  }

  return <Outlet />;
}

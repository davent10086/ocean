import { useEffect } from 'react';
import { App as AntdApp } from 'antd';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BooksPage from './pages/BooksPage';
import BorrowsPage from './pages/BorrowsPage';
import UsersPage from './pages/UsersPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import { RequireAuth } from './router/RequireAuth';
import { setMessageApi } from './services/feedback';
import { useAuthStore } from './store/auth-store';

function HomeRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function FeedbackBridge() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return null;
}

export default function App() {
  return (
    <AntdApp>
      <FeedbackBridge />
      <Router>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/borrows" element={<BorrowsPage />} />
            </Route>
          </Route>
          <Route element={<RequireAuth roles={['ADMIN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AntdApp>
  );
}

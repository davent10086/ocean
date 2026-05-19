import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3B82F6',
          colorInfo: '#3B82F6',
          borderRadius: 14,
          fontFamily: 'Segoe UI, PingFang SC, Microsoft YaHei, sans-serif',
          colorBgLayout: '#edf5ff',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);

import { BookOutlined, ReadOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';
import { Button, Card, Col, List, Result, Row, Spin, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { PageTransition } from '../components/Motion';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { PageHeader } from '../components/PageHeader';
import { DashboardCharts } from '../components/DashboardCharts';
import { BorrowStatusTag } from '../components/StatusTags';
import { StatisticCard } from '../components/StatisticCard';
import { dashboardApi } from '../services/api';
import { useAuthStore } from '../store/auth-store';
import type { DashboardSummary } from '../types/app';
import { LIBRARY_DATA_CHANGED_EVENT } from '../utils/data-sync';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextSummary =
        user?.role === 'ADMIN' ? await dashboardApi.getAdminSummary() : await dashboardApi.getMemberSummary();
      setSummary(nextSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    const handleDataChanged = () => {
      void fetchSummary();
    };

    window.addEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    void fetchSummary();

    return () => {
      window.removeEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    };
  }, [fetchSummary]);

  if (loading) {
    return <Spin className="page-spin" />;
  }

  if (error) {
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={error}
        extra={<Button type="primary" onClick={() => void fetchSummary()}>重试</Button>}
      />
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <PageTransition className="page-stack">
      <PageHeader
        title={user?.role === 'ADMIN' ? '蓝海总览' : '我的借阅概览'}
        description={
          user?.role === 'ADMIN'
            ? '查看库存、借阅与逾期概况，保持图书流转透明。'
            : '查看自己的借阅状态与近期动态，专注个人借阅信息。'
        }
      />
      <motion.div
        className="dashboard-hero"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="dashboard-hero-glow" aria-hidden="true" />
        <Typography.Title level={2} style={{ margin: 0, color: '#0f2b63' }}>
          {user?.role === 'ADMIN' ? '在蓝色海岸边管理每一本书' : '欢迎回到蓝海书库'}
        </Typography.Title>
        <Typography.Text style={{ color: '#56739a', fontSize: 16 }}>
          {user?.role === 'ADMIN'
            ? '库存、借阅与逾期数据一目了然，让图书流转更清晰。'
            : '查看你的借阅状态，发现更多好书。'}
        </Typography.Text>
      </motion.div>
      <AnnouncementBanner />
      <Row gutter={[16, 16]} justify="start">
        {summary.scope === 'ADMIN' && (
          <>
            <Col xs={24} sm={12} xl={6}>
              <StatisticCard title="图书总数" value={summary.counts.totalBooks} icon={<BookOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <StatisticCard title="在借数量" value={summary.counts.activeBorrows} icon={<ReadOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <StatisticCard title="逾期数量" value={summary.counts.overdueBorrows} icon={<WarningOutlined />} />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <StatisticCard title="用户数量" value={summary.counts.totalUsers} icon={<TeamOutlined />} />
            </Col>
          </>
        )}
        {summary.scope === 'MEMBER' && (
          <>
            <Col xs={24} sm={8} xl={8}>
              <StatisticCard title="我的在借" value={summary.counts.activeBorrows} icon={<ReadOutlined />} />
            </Col>
            <Col xs={24} sm={8} xl={8}>
              <StatisticCard title="我的逾期" value={summary.counts.overdueBorrows} icon={<WarningOutlined />} />
            </Col>
            <Col xs={24} sm={8} xl={8}>
              <StatisticCard title="可借额度" value={`${Math.max(0, 5 - summary.counts.activeBorrows)} 本`} icon={<BookOutlined />} />
            </Col>
          </>
        )}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={summary.scope === 'ADMIN' ? 14 : 24}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="ocean-card" variant="borderless">
              <Typography.Title level={4}>{summary.scope === 'ADMIN' ? '最近借阅动态' : '我的最近借阅'}</Typography.Title>
              <List
                dataSource={summary.recentRecords}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={summary.scope === 'ADMIN' ? `${item.book.title}  ${item.user.email}` : item.book.title}
                      description={`借阅于 ${dayjs(item.borrowDate).format('YYYY-MM-DD HH:mm')}，应还 ${dayjs(item.dueDate).format('YYYY-MM-DD')}`}
                    />
                    <BorrowStatusTag status={item.status} />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </Col>
        {summary.scope === 'ADMIN' && (
          <Col xs={24} xl={10}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <Card className="ocean-card" variant="borderless">
                <Typography.Title level={4}>低库存提醒</Typography.Title>
                <List
                  dataSource={summary.lowStockBooks}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta title={item.title} description={`${item.author}  ISBN ${item.isbn}`} />
                      <Typography.Text strong style={{ color: item.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                        剩余 {item.stock}
                      </Typography.Text>
                    </List.Item>
                  )}
                />
              </Card>
            </motion.div>
          </Col>
        )}
      </Row>
      <DashboardCharts charts={summary.charts} />
    </PageTransition>
  );
}

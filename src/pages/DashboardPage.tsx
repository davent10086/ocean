import { BookOutlined, ReadOutlined, TeamOutlined, WarningOutlined } from '@ant-design/icons';
import { Card, Col, List, Row, Spin, Typography } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { PageHeader } from '../components/PageHeader';
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

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const nextSummary =
          user?.role === 'ADMIN' ? await dashboardApi.getAdminSummary() : await dashboardApi.getMemberSummary();
        setSummary(nextSummary);
      } finally {
        setLoading(false);
      }
    };

    const handleDataChanged = () => {
      void fetchSummary();
    };

    window.addEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    void fetchSummary();

    return () => {
      window.removeEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    };
  }, [user?.role]);

  if (loading || !summary) {
    return <Spin size="large" className="page-spin" />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={user?.role === 'ADMIN' ? '蓝海总览' : '我的借阅概览'}
        description={
          user?.role === 'ADMIN'
            ? '查看库存、借阅与逾期概况，保持图书流转透明。'
            : '查看自己的借阅状态与近期动态，专注个人借阅信息。'
        }
      />
      <Row gutter={[16, 16]}>
        {summary.scope === 'ADMIN' && (
          <Col xs={24} md={12} xl={6}>
            <StatisticCard title="图书总数" value={summary.counts.totalBooks} icon={<BookOutlined />} />
          </Col>
        )}
        <Col xs={24} md={12} xl={6}>
          <StatisticCard title={summary.scope === 'ADMIN' ? '在借数量' : '我的在借'} value={summary.counts.activeBorrows} icon={<ReadOutlined />} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatisticCard title={summary.scope === 'ADMIN' ? '逾期数量' : '我的逾期'} value={summary.counts.overdueBorrows} icon={<WarningOutlined />} />
        </Col>
        <Col xs={24} md={12} xl={6}>
          <StatisticCard
            title={summary.scope === 'ADMIN' ? '用户数量' : '我的角色'}
            value={summary.scope === 'ADMIN' ? summary.counts.totalUsers : '成员'}
            icon={<TeamOutlined />}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={summary.scope === 'ADMIN' ? 14 : 24}>
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
        </Col>
        {summary.scope === 'ADMIN' && (
          <Col xs={24} xl={10}>
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
          </Col>
        )}
      </Row>
    </div>
  );
}

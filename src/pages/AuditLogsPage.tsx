import { Button, Card, Result, Select, Space, Spin, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { PageTransition } from '../components/Motion';
import dayjs from 'dayjs';
import { PageHeader } from '../components/PageHeader';
import { auditLogsApi } from '../services/api';
import type { AuditLogItem, PaginatedResult } from '../types/app';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: '创建', color: 'green' },
  UPDATE: { label: '更新', color: 'blue' },
  DELETE: { label: '删除', color: 'red' },
  LOGIN: { label: '登录', color: 'purple' },
  BORROW: { label: '借阅', color: 'orange' },
  RETURN: { label: '归还', color: 'cyan' },
};

const RESOURCE_LABELS: Record<string, string> = {
  book: '图书',
  user: '用户',
  borrow: '借阅',
  auth: '认证',
};

export default function AuditLogsPage() {
  const [data, setData] = useState<PaginatedResult<AuditLogItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState({ page: 1, pageSize: 10, action: '' });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { page: number; pageSize: number; action?: string } = {
        page: query.page,
        pageSize: query.pageSize,
      };
      if (query.action) {
        params.action = query.action;
      }
      setData(await auditLogsApi.list(params));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const columns: ColumnsType<AuditLogItem> = [
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作用户',
      key: 'user',
      width: 200,
      render: (_, record) => record.user.email,
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (value: string) => {
        const info = ACTION_LABELS[value] ?? { label: value, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '资源',
      key: 'resource',
      width: 100,
      render: (_, record) => RESOURCE_LABELS[record.resource] ?? record.resource,
    },
    {
      title: '详情',
      dataIndex: 'detail',
      key: 'detail',
      ellipsis: true,
    },
  ];

  if (loading && !data) {
    return <Spin className="page-spin" />;
  }

  if (error) {
    return (
      <PageTransition className="page-stack">
        <PageHeader title="操作日志" description="查看所有用户的操作记录，追踪系统变更。" />
        <Result
          status="error"
          title="加载失败"
          subTitle={error}
          extra={<Button type="primary" onClick={() => void loadLogs()}>重试</Button>}
        />
      </PageTransition>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <PageTransition className="page-stack">
      <PageHeader title="操作日志" description="查看所有用户的操作记录，追踪系统变更。" />
      <Card className="ocean-card" variant="borderless">
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            allowClear
            placeholder="筛选操作类型"
            style={{ width: 160 }}
            value={query.action || undefined}
            onChange={(value) => setQuery({ ...query, page: 1, action: value ?? '' })}
            options={Object.entries(ACTION_LABELS).map(([key, info]) => ({
              value: key,
              label: info.label,
            }))}
          />
          <Select
            style={{ width: 120 }}
            value={query.pageSize}
            onChange={(value) => setQuery({ ...query, page: 1, pageSize: value })}
            options={[
              { value: 10, label: '10条/页' },
              { value: 20, label: '20条/页' },
              { value: 50, label: '50条/页' },
            ]}
          />
        </Space>
        {loading || !data ? (
          <Spin className="page-spin" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data.items}
            pagination={{
              current: data.page,
              pageSize: data.pageSize,
              total: data.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setQuery({ ...query, page, pageSize }),
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>
    </PageTransition>
  );
}
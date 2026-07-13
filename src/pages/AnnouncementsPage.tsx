import { DeleteOutlined, EditOutlined, PlusOutlined, PushpinOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Popconfirm, Space, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../components/Motion';
import dayjs from 'dayjs';
import { AnnouncementFormModal } from '../components/AnnouncementFormModal';
import { PageHeader } from '../components/PageHeader';
import { announcementsApi } from '../services/api';
import { feedback } from '../services/feedback';
import type { AnnouncementItem, PaginatedResult } from '../types/app';

export default function AnnouncementsPage() {
  const [data, setData] = useState<PaginatedResult<AnnouncementItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState({ page: 1, pageSize: 10 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setData(await announcementsApi.list(query));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSave = async (values: { title: string; content: string; pinned: boolean }) => {
    setSaving(true);
    try {
      if (editingItem) {
        await announcementsApi.update(editingItem.id, values);
        feedback.success('公告已更新。');
      } else {
        await announcementsApi.create(values);
        feedback.success('公告已发布。');
      }
      setModalOpen(false);
      setEditingItem(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    await announcementsApi.remove(id);
    feedback.success('公告已删除。');
    await loadData();
  }, [loadData]);

  const columns = useMemo<ColumnsType<AnnouncementItem>>(() => [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <Space>
          {record.pinned && <Tag icon={<PushpinOutlined />} color="blue">置顶</Tag>}
          <Typography.Text strong>{title}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 300,
    },
    {
      title: '发布者',
      key: 'author',
      width: 160,
      render: (_, record) => record.author.email,
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => { setEditingItem(record); setModalOpen(true); }}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除该公告吗？" onConfirm={() => void handleDelete(record.id)}>
            <Button danger type="link" size="small" icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [handleDelete]);

  return (
    <PageTransition className="page-stack">
      <PageHeader
        title="公告管理"
        description="发布、编辑与管理图书馆公告，让读者及时了解最新动态。"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditingItem(null); setModalOpen(true); }}
          >
            发布公告
          </Button>
        }
      />
      <Card className="ocean-card" variant="borderless">
        {loading && !data ? (
          <Spin className="page-spin" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={data?.items ?? []}
            pagination={{
              current: data?.page ?? query.page,
              pageSize: data?.pageSize ?? query.pageSize,
              total: data?.total ?? 0,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setQuery({ page, pageSize }),
            }}
            locale={{ emptyText: <Empty description="暂无公告" image={Empty.PRESENTED_IMAGE_SIMPLE}><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setModalOpen(true); }}>发布公告</Button></Empty> }}
          />
        )}
      </Card>
      <AnnouncementFormModal
        open={modalOpen}
        title={editingItem ? '编辑公告' : '发布公告'}
        initialValues={editingItem ?? undefined}
        confirmLoading={saving}
        onCancel={() => { setModalOpen(false); setEditingItem(null); }}
        onSubmit={handleSave}
      />
    </PageTransition>
  );
}

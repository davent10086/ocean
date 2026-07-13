import { DeleteOutlined, EditOutlined, PlusOutlined, ReadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Input, Popconfirm, Result, Space, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../components/Motion';
import dayjs from 'dayjs';
import { BookFormModal } from '../components/BookFormModal';
import { PageHeader } from '../components/PageHeader';
import { booksApi, borrowApi } from '../services/api';
import { feedback } from '../services/feedback';
import { useAuthStore } from '../store/auth-store';
import type { BookItem, BookFormValues, PaginatedResult } from '../types/app';
import { LIBRARY_DATA_CHANGED_EVENT } from '../utils/data-sync';

export default function BooksPage() {
  const user = useAuthStore((state) => state.user);
  const [books, setBooks] = useState<PaginatedResult<BookItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [query, setQuery] = useState({ page: 1, pageSize: 10, search: '' });
  const [borrowingId, setBorrowingId] = useState<number | null>(null);

  const loadBooks = useCallback(async (nextQuery = query) => {
    setLoading(true);
    setError(null);
    try {
      setBooks(await booksApi.list(nextQuery));
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const handleDataChanged = () => {
      void loadBooks(query);
    };

    window.addEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    void loadBooks(query);

    return () => {
      window.removeEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    };
  }, [loadBooks, query]);

  const handleSave = async (values: BookFormValues) => {
    setSaving(true);
    try {
      if (editingBook) {
        await booksApi.update(editingBook.id, values);
        feedback.success('图书信息已更新。');
      } else {
        await booksApi.create(values);
        feedback.success('图书已加入书库。');
      }
      setModalOpen(false);
      setEditingBook(null);
      await loadBooks(query);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id: number) => {
    await booksApi.remove(id);
    feedback.success('图书已删除。');
    await loadBooks(query);
  }, [loadBooks, query]);

  const handleBorrow = useCallback(async (bookId: number) => {
    setBorrowingId(bookId);
    try {
      await borrowApi.create(bookId);
      feedback.success('借阅成功。');
      window.dispatchEvent(new CustomEvent(LIBRARY_DATA_CHANGED_EVENT));
      await loadBooks(query);
    } finally {
      setBorrowingId(null);
    }
  }, [loadBooks, query]);

  const columns = useMemo<ColumnsType<BookItem>>(() => {
    const base: ColumnsType<BookItem> = [
      { title: '书名', dataIndex: 'title', key: 'title' },
      { title: '作者', dataIndex: 'author', key: 'author' },
      { title: 'ISBN', dataIndex: 'isbn', key: 'isbn' },
      { title: '出版年份', dataIndex: 'publishYear', key: 'publishYear', width: 110 },
      {
        title: '库存',
        dataIndex: 'stock',
        key: 'stock',
        width: 100,
        render: (value: number) => <span style={{ color: value === 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{value}</span>,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 160,
        render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
      },
    ];

    base.push({
      title: '操作',
      key: 'actions',
      width: user?.role === 'ADMIN' ? 220 : 120,
      render: (_, record) => (
        <Space>
          {record.stock > 0 && (
            <Button
              type="link"
              icon={<ReadOutlined />}
              loading={borrowingId === record.id}
              onClick={() => void handleBorrow(record.id)}
            >
              借阅
            </Button>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingBook(record); setModalOpen(true); }}>编辑</Button>
              <Popconfirm title="确认删除这本图书吗？" onConfirm={() => void handleDelete(record.id)}>
                <Button danger type="link" icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    });

    return base;
  }, [handleBorrow, handleDelete, borrowingId, user?.role]);

  if (loading && !books) {
    return <Spin className="page-spin" />;
  }

  if (error) {
    return (
      <PageTransition className="page-stack">
        <PageHeader title="图书管理" description="搜索、浏览与维护书库，让每一本书都井然有序。" />
        <Result
          status="error"
          title="加载失败"
          subTitle={error}
          extra={<Button type="primary" onClick={() => void loadBooks(query)}>重试</Button>}
        />
      </PageTransition>
    );
  }

  if (!books) {
    return null;
  }

  return (
    <PageTransition className="page-stack">
      <PageHeader
        title="图书管理"
        description="搜索、浏览与维护书库，让每一本书都井然有序。"
        extra={user?.role === 'ADMIN' ? <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingBook(null); setModalOpen(true); }}>新增图书</Button> : null}
      />
      <Card className="ocean-card" variant="borderless">
        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="搜索书名、作者或 ISBN"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onPressEnter={() => setQuery({ ...query, page: 1, search })}
            style={{ width: 320 }}
          />
          <Button onClick={() => setQuery({ ...query, page: 1, search })}>搜索</Button>
        </Space>
        {loading || !books ? (
          <Spin className="page-spin" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={books.items}
            pagination={{
              current: books.page,
              pageSize: books.pageSize,
              total: books.total,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              onChange: (page, pageSize) => setQuery({ ...query, page, pageSize }),
            }}
            scroll={{ x: 900 }}
            locale={{ emptyText: <Empty description="暂无图书" image={Empty.PRESENTED_IMAGE_SIMPLE}><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingBook(null); setModalOpen(true); }}>新增图书</Button></Empty> }}
          />
        )}
      </Card>
      <BookFormModal
        open={modalOpen}
        title={editingBook ? '编辑图书' : '新增图书'}
        initialValues={editingBook ?? undefined}
        confirmLoading={saving}
        onCancel={() => { setModalOpen(false); setEditingBook(null); }}
        onSubmit={(values) => void handleSave(values)}
      />
    </PageTransition>
  );
}

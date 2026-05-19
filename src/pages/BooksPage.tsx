import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Input, Popconfirm, Space, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { BookFormModal } from '../components/BookFormModal';
import { PageHeader } from '../components/PageHeader';
import { booksApi } from '../services/api';
import { feedback } from '../services/feedback';
import { useAuthStore } from '../store/auth-store';
import type { BookItem, BookFormValues, PaginatedResult } from '../types/app';
import { LIBRARY_DATA_CHANGED_EVENT } from '../utils/data-sync';

export default function BooksPage() {
  const user = useAuthStore((state) => state.user);
  const [books, setBooks] = useState<PaginatedResult<BookItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);
  const [query, setQuery] = useState({ page: 1, pageSize: 10, search: '' });

  const loadBooks = useCallback(async (nextQuery = query) => {
    setLoading(true);
    try {
      setBooks(await booksApi.list(nextQuery));
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
        render: (value: number) => <span style={{ color: value === 0 ? '#ef4444' : '#0f766e' }}>{value}</span>,
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 160,
        render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
      },
    ];

    if (user?.role === 'ADMIN') {
      base.push({
        title: '操作',
        key: 'actions',
        width: 140,
        render: (_, record) => (
          <Space>
            <Button type="link" icon={<EditOutlined />} onClick={() => { setEditingBook(record); setModalOpen(true); }}>编辑</Button>
            <Popconfirm title="确认删除这本图书吗？" onConfirm={() => void handleDelete(record.id)}>
              <Button danger type="link" icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          </Space>
        ),
      });
    }

    return base;
  }, [handleDelete, user?.role]);

  return (
    <div className="page-stack">
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
              onChange: (page, pageSize) => setQuery({ ...query, page, pageSize }),
            }}
            scroll={{ x: 900 }}
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
    </div>
  );
}

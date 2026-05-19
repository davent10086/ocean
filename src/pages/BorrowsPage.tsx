import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Space, Spin, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { BorrowStatusTag, RoleTag } from '../components/StatusTags';
import { PageHeader } from '../components/PageHeader';
import { booksApi, borrowApi } from '../services/api';
import { feedback } from '../services/feedback';
import type { BookItem, BorrowRecordItem, PaginatedResult } from '../types/app';
import { LIBRARY_DATA_CHANGED_EVENT } from '../utils/data-sync';

export default function BorrowsPage() {
  const [records, setRecords] = useState<BorrowRecordItem[]>([]);
  const [bookPool, setBookPool] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [borrowRecords, books] = await Promise.all([
        borrowApi.list(),
        booksApi.list({ page: 1, pageSize: 50, search: '' }),
      ]);
      setRecords(borrowRecords);
      setBookPool((books as PaginatedResult<BookItem>).items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleDataChanged = () => {
      void loadData();
    };

    window.addEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    void loadData();

    return () => {
      window.removeEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    };
  }, [loadData]);

  const handleBorrow = async (bookId: number) => {
    setActionId(bookId);
    try {
      await borrowApi.create(bookId);
      feedback.success('借阅成功。');
      await loadData();
    } finally {
      setActionId(null);
    }
  };

  const handleReturn = useCallback(async (recordId: number) => {
    setActionId(recordId);
    try {
      await borrowApi.returnBook(recordId);
      feedback.success('归还成功。');
      await loadData();
    } finally {
      setActionId(null);
    }
  }, [loadData]);

  const columns = useMemo<ColumnsType<BorrowRecordItem>>(() => [
    {
      title: '图书',
      key: 'book',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong>{record.book.title}</Typography.Text>
          <Typography.Text type="secondary">{record.book.author}</Typography.Text>
        </Space>
      ),
    },
    {
      title: '借阅用户',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>{record.user.email}</Typography.Text>
          <RoleTag role={record.user.role} />
        </Space>
      ),
    },
    { title: '借阅时间', dataIndex: 'borrowDate', render: (value: string) => dayjs(value).format('YYYY-MM-DD') },
    { title: '应还时间', dataIndex: 'dueDate', render: (value: string) => dayjs(value).format('YYYY-MM-DD') },
    { title: '状态', dataIndex: 'status', render: (value) => <BorrowStatusTag status={value} /> },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="link"
          disabled={Boolean(record.returnDate)}
          loading={actionId === record.id}
          onClick={() => void handleReturn(record.id)}
        >
          {record.returnDate ? '已归还' : '归还图书'}
        </Button>
      ),
    },
  ], [actionId, handleReturn]);

  const availableBooks = bookPool.filter((item) => item.stock > 0);

  return (
    <div className="page-stack">
      <PageHeader
        title="借阅记录"
        description="借阅、归还与状态追踪都在这里发生。"
        extra={<Button icon={<ReloadOutlined />} onClick={() => void loadData()}>刷新</Button>}
      />
      <Card className="ocean-card" variant="borderless">
        <Typography.Title level={4}>可借图书</Typography.Title>
        {loading ? (
          <Spin className="page-spin" />
        ) : (
          <div className="borrow-grid">
            {availableBooks.map((book) => (
              <Card key={book.id} className="borrow-book-card" variant="borderless">
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Typography.Title level={5} style={{ margin: 0 }}>{book.title}</Typography.Title>
                  <Typography.Text type="secondary">{book.author}</Typography.Text>
                  <Typography.Text>库存：{book.stock}</Typography.Text>
                  <Button type="primary" loading={actionId === book.id} onClick={() => void handleBorrow(book.id)}>
                    立即借阅
                  </Button>
                </Space>
              </Card>
            ))}
          </div>
        )}
      </Card>
      <Card className="ocean-card" variant="borderless">
        <Typography.Title level={4}>借阅明细</Typography.Title>
        {loading ? (
          <Spin className="page-spin" />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={records}
            expandable={{
              expandedRowRender: (record) => (
                <div className="expanded-row">
                  <p>ISBN：{record.book.isbn}</p>
                  <p>借阅详情：{record.user.email} 于 {dayjs(record.borrowDate).format('YYYY-MM-DD HH:mm')} 借出，{record.returnDate ? `已于 ${dayjs(record.returnDate).format('YYYY-MM-DD HH:mm')} 归还。` : '当前尚未归还。'}</p>
                </div>
              ),
            }}
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </div>
  );
}

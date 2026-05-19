import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { PageHeader } from '../components/PageHeader';
import { RoleTag } from '../components/StatusTags';
import { UserFormModal } from '../components/UserFormModal';
import { usersApi } from '../services/api';
import { feedback } from '../services/feedback';
import type { UserFormValues, UserListItem } from '../types/app';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await usersApi.list());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleCreate = async (values: UserFormValues) => {
    setSaving(true);
    try {
      await usersApi.create(values);
      feedback.success('用户创建成功。');
      setOpen(false);
      await loadUsers();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<UserListItem> = [
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (value) => <RoleTag role={value} /> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm') },
  ];

  return (
    <div className="page-stack">
      <PageHeader title="用户管理" description="管理员可以创建成员或新的管理员账号。" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>新增用户</Button>} />
      <Card className="ocean-card" variant="borderless">
        {loading ? (
          <Spin className="page-spin" />
        ) : (
          <Table rowKey="id" columns={columns} dataSource={users} />
        )}
      </Card>
      <UserFormModal open={open} confirmLoading={saving} onCancel={() => setOpen(false)} onSubmit={(values) => void handleCreate(values)} />
    </div>
  );
}

import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  LockOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Popconfirm, Space, Spin, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../components/Motion';
import dayjs from 'dayjs';
import { PageHeader } from '../components/PageHeader';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import { RoleTag, UserStatusTag } from '../components/StatusTags';
import { UserFormModal } from '../components/UserFormModal';
import { usersApi } from '../services/api';
import { feedback } from '../services/feedback';
import { useAuthStore } from '../store/auth-store';
import type {
  PaginatedResult,
  ResetPasswordFormValues,
  UpdateUserFormValues,
  UserFormValues,
  UserListItem,
} from '../types/app';
import type { UserRole } from '../../shared/types';
import { LIBRARY_DATA_CHANGED_EVENT } from '../utils/data-sync';

export default function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [data, setData] = useState<PaginatedResult<UserListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState({ page: 1, pageSize: 10 });

  // 弹窗状态
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserListItem | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      setData(await usersApi.list(query));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const handleDataChanged = () => {
      void loadUsers();
    };

    window.addEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    void loadUsers();

    return () => {
      window.removeEventListener(LIBRARY_DATA_CHANGED_EVENT, handleDataChanged);
    };
  }, [loadUsers]);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormMode('create');
    setFormModalOpen(true);
  };

  const openEditModal = (user: UserListItem) => {
    setEditingUser(user);
    setFormMode('edit');
    setFormModalOpen(true);
  };

  const openResetModal = (user: UserListItem) => {
    setResetTarget(user);
    setResetModalOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues | UpdateUserFormValues) => {
    setSaving(true);
    try {
      if (formMode === 'create') {
        await usersApi.create(values as UserFormValues);
        feedback.success('用户创建成功。');
      } else if (editingUser) {
        await usersApi.update(editingUser.id, values as UpdateUserFormValues);
        feedback.success('用户角色已更新。');
      }
      setFormModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!resetTarget) return;
    setSaving(true);
    try {
      await usersApi.resetPassword(resetTarget.id, values);
      feedback.success('密码已重置。');
      setResetModalOpen(false);
      setResetTarget(null);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDisabled = async (user: UserListItem) => {
    try {
      await usersApi.setStatus(user.id, !user.disabled);
      feedback.success(user.disabled ? '用户已启用。' : '用户已禁用。');
      await loadUsers();
    } catch {
      // 错误提示已由 http 拦截器统一处理
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usersApi.remove(id);
      feedback.success('用户已删除。');
      await loadUsers();
    } catch {
      // 错误提示已由 http 拦截器统一处理
    }
  };

  const columns = useMemo<ColumnsType<UserListItem>>(() => [
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (value: UserRole) => <RoleTag role={value} /> },
    { title: '状态', dataIndex: 'disabled', key: 'disabled', render: (value: boolean) => <UserStatusTag disabled={value} /> },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      render: (_, record) => {
        const isSelf = currentUser?.id === record.id;
        return (
          <Space>
            <Tooltip title={isSelf ? '不能修改自己的角色' : '编辑角色'}>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                disabled={isSelf}
                onClick={() => openEditModal(record)}
              >
                编辑
              </Button>
            </Tooltip>
            <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => openResetModal(record)}>
              重置密码
            </Button>
            <Tooltip title={isSelf ? '不能禁用自己' : record.disabled ? '启用用户' : '禁用用户'}>
              <Button
                type="link"
                size="small"
                icon={record.disabled ? <UnlockOutlined /> : <LockOutlined />}
                disabled={isSelf}
                onClick={() => void handleToggleDisabled(record)}
              >
                {record.disabled ? '启用' : '禁用'}
              </Button>
            </Tooltip>
            <Popconfirm
              title="确认删除该用户吗？"
              description={isSelf ? '不能删除自己' : '删除后无法恢复，有未还书的用户无法删除。'}
              okText="删除"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              disabled={isSelf}
              onConfirm={() => void handleDelete(record.id)}
            >
              <Button danger type="link" size="small" icon={<DeleteOutlined />} disabled={isSelf}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ], [currentUser?.id]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageTransition className="page-stack">
      <PageHeader
        title="用户管理"
        description="管理员可以创建用户、编辑角色、重置密码、禁用或删除账号。"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>新增用户</Button>}
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
            locale={{ emptyText: <Empty description="暂无用户" image={Empty.PRESENTED_IMAGE_SIMPLE}><Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>新增用户</Button></Empty> }}
          />
        )}
      </Card>
      <UserFormModal
        open={formModalOpen}
        mode={formMode}
        initialValues={editingUser ?? undefined}
        confirmLoading={saving}
        onCancel={() => { setFormModalOpen(false); setEditingUser(null); }}
        onSubmit={(values) => void handleFormSubmit(values)}
      />
      <ResetPasswordModal
        open={resetModalOpen}
        email={resetTarget?.email}
        confirmLoading={saving}
        onCancel={() => { setResetModalOpen(false); setResetTarget(null); }}
        onSubmit={(values) => void handleResetPassword(values)}
      />
    </PageTransition>
  );
}

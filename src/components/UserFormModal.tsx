import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { UpdateUserFormValues, UserFormValues } from '../types/app';

interface UserFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialValues?: Partial<UserFormValues & UpdateUserFormValues>;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: UserFormValues | UpdateUserFormValues) => void;
}

export function UserFormModal({
  open,
  mode,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
}: UserFormModalProps) {
  const [form] = Form.useForm<UserFormValues & UpdateUserFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        email: initialValues?.email ?? '',
        password: '',
        role: initialValues?.role ?? 'MEMBER',
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  const isCreate = mode === 'create';

  return (
    <Modal
      open={open}
      title={isCreate ? '新增用户' : '编辑用户角色'}
      okText={isCreate ? '创建' : '保存'}
      cancelText="取消"
      confirmLoading={confirmLoading}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          if (isCreate) {
            onSubmit(values as UserFormValues);
          } else {
            onSubmit({ role: values.role } as UpdateUserFormValues);
          }
          form.resetFields();
        }}
      >
        <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
          <Input placeholder="name@example.com" disabled={!isCreate} />
        </Form.Item>
        {isCreate && (
          <Form.Item
            label="初始密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少 8 位' },
              { pattern: /[A-Z]/, message: '密码必须包含大写字母' },
              { pattern: /[a-z]/, message: '密码必须包含小写字母' },
              { pattern: /[0-9]/, message: '密码必须包含数字' },
            ]}
          >
            <Input.Password placeholder="至少 8 位，含大小写字母和数字" />
          </Form.Item>
        )}
        <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
          <Select
            options={[
              { label: '成员', value: 'MEMBER' },
              { label: '管理员', value: 'ADMIN' },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

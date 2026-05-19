import { Form, Input, Modal, Select } from 'antd';
import type { UserFormValues } from '../types/app';

interface UserFormModalProps {
  open: boolean;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: UserFormValues) => void;
}

export function UserFormModal({ open, confirmLoading, onCancel, onSubmit }: UserFormModalProps) {
  const [form] = Form.useForm<UserFormValues>();

  return (
    <Modal
      open={open}
      title="新增用户"
      okText="创建"
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
        initialValues={{ role: 'MEMBER' }}
        onFinish={(values) => {
          onSubmit(values);
          form.resetFields();
        }}
      >
        <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
          <Input placeholder="name@example.com" />
        </Form.Item>
        <Form.Item label="初始密码" name="password" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
          <Input.Password placeholder="请输入初始密码" />
        </Form.Item>
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

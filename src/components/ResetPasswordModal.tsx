import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';
import type { ResetPasswordFormValues } from '../types/app';

interface ResetPasswordModalProps {
  open: boolean;
  email?: string;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: ResetPasswordFormValues) => void;
}

export function ResetPasswordModal({
  open,
  email,
  confirmLoading,
  onCancel,
  onSubmit,
}: ResetPasswordModalProps) {
  const [form] = Form.useForm<ResetPasswordFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open]);

  return (
    <Modal
      open={open}
      title={`重置密码${email ? ` - ${email}` : ''}`}
      okText="重置"
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
          onSubmit(values);
          form.resetFields();
        }}
      >
        <Form.Item
          label="新密码"
          name="password"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码至少 8 位' },
            { pattern: /[A-Z]/, message: '密码必须包含大写字母' },
            { pattern: /[a-z]/, message: '密码必须包含小写字母' },
            { pattern: /[0-9]/, message: '密码必须包含数字' },
          ]}
        >
          <Input.Password placeholder="至少 8 位，含大小写字母和数字" />
        </Form.Item>
        <Form.Item
          label="确认新密码"
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: '请再次输入密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

import { Form, Input, InputNumber, Modal } from 'antd';
import { useEffect } from 'react';
import type { BookFormValues } from '../types/app';

interface BookFormModalProps {
  open: boolean;
  title: string;
  initialValues?: Partial<BookFormValues>;
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (values: BookFormValues) => void;
}

export function BookFormModal({
  open,
  title,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
}: BookFormModalProps) {
  const [form] = Form.useForm<BookFormValues>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        title: initialValues?.title ?? '',
        author: initialValues?.author ?? '',
        isbn: initialValues?.isbn ?? '',
        publishYear: initialValues?.publishYear ?? new Date().getFullYear(),
        stock: initialValues?.stock ?? 1,
      });
    } else {
      form.resetFields();
    }
  }, [form, initialValues, open]);

  return (
    <Modal
      open={open}
      title={title}
      okText="保存"
      cancelText="取消"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form layout="vertical" form={form} onFinish={onSubmit}>
        <Form.Item label="图书标题" name="title" rules={[{ required: true, message: '请输入图书标题' }]}>
          <Input placeholder="例如：海边的卡夫卡" />
        </Form.Item>
        <Form.Item label="作者" name="author" rules={[{ required: true, message: '请输入作者名称' }]}>
          <Input placeholder="例如：村上春树" />
        </Form.Item>
        <Form.Item label="ISBN" name="isbn" rules={[{ required: true, message: '请输入 ISBN' }]}>
          <Input placeholder="请输入 ISBN" />
        </Form.Item>
        <Form.Item label="出版年份" name="publishYear" rules={[{ required: true, message: '请输入出版年份' }]}>
          <InputNumber min={1000} max={new Date().getFullYear() + 1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="库存" name="stock" rules={[{ required: true, message: '请输入库存数量' }]}>
          <InputNumber min={0} max={9999} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

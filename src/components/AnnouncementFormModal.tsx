import { useEffect, useRef } from 'react';
import { Form, Input, Modal, Switch } from 'antd';

interface AnnouncementFormValues {
  title: string;
  content: string;
  pinned: boolean;
}

interface AnnouncementFormModalProps {
  open: boolean;
  title: string;
  initialValues?: Partial<AnnouncementFormValues>;
  confirmLoading: boolean;
  onCancel: () => void;
  onSubmit: (values: AnnouncementFormValues) => void;
}

export function AnnouncementFormModal({
  open,
  title,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
}: AnnouncementFormModalProps) {
  const [form] = Form.useForm<AnnouncementFormValues>();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (open) {
      hasInitialized.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (open && !hasInitialized.current) {
      form.setFieldsValue({
        title: '',
        content: '',
        pinned: false,
        ...initialValues,
      });
      hasInitialized.current = true;
    }
  }, [open, initialValues, form]);

  return (
    <Modal
      open={open}
      title={title}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="保存"
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
      >
        <Form.Item
          name="title"
          label="公告标题"
          rules={[{ required: true, message: '请输入公告标题' }, { max: 120, message: '标题不能超过120字' }]}
        >
          <Input placeholder="请输入公告标题" maxLength={120} showCount />
        </Form.Item>
        <Form.Item
          name="content"
          label="公告内容"
          rules={[{ required: true, message: '请输入公告内容' }, { max: 5000, message: '内容不能超过5000字' }]}
        >
          <Input.TextArea placeholder="请输入公告内容" rows={6} maxLength={5000} showCount />
        </Form.Item>
        <Form.Item name="pinned" label="置顶" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}

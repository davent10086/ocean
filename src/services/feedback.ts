import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance | null = null;

export const setMessageApi = (api: MessageInstance) => {
  messageApi = api;
};

export const feedback = {
  success: (content: string) => {
    if (messageApi) {
      void messageApi.success(content);
    } else {
      console.warn('feedback.success 调用时 messageApi 尚未初始化:', content);
    }
  },
  error: (content: string) => {
    if (messageApi) {
      void messageApi.error(content);
    } else {
      console.warn('feedback.error 调用时 messageApi 尚未初始化:', content);
    }
  },
};

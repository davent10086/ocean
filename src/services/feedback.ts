import type { MessageInstance } from 'antd/es/message/interface';

let messageApi: MessageInstance | null = null;

export const setMessageApi = (api: MessageInstance) => {
  messageApi = api;
};

export const feedback = {
  success: (content: string) => {
    if (messageApi) {
      void messageApi.success(content);
    }
  },
  error: (content: string) => {
    if (messageApi) {
      void messageApi.error(content);
    }
  },
};

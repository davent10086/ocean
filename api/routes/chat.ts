import { pipeUIMessageStreamToResponse, type UIMessage } from 'ai';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { createChatAgentStream } from '../services/chat-agent.service.js';
import { AppError } from '../utils/app-error.js';
import { catchAsync } from '../utils/catch-async.js';
import { validate } from '../middlewares/validate.js';

const router = Router();

// 校验消息载荷：必须是数组且长度 <= 20，避免超大上下文消耗资源
const chatSchema = z.object({
  messages: z
    .array(z.any())
    .min(1, '消息不能为空。')
    .max(20, '单次最多发送 20 条消息。'),
});

router.post(
  '/',
  validate({ body: chatSchema }),
  catchAsync(async (req, res) => {
    const user = req.user;
    if (!user) {
      throw new AppError('未授权，请先登录。', 401);
    }

    if (!env.DEEPSEEK_API_KEY) {
      throw new AppError('AI 助手暂未配置 API Key，其他书库功能可正常使用。', 503);
    }

    const messages = req.body.messages as UIMessage[];
    const stream = createChatAgentStream(messages, user);
    pipeUIMessageStreamToResponse({ response: res, stream });
  }),
);

export default router;

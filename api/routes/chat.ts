import { pipeUIMessageStreamToResponse, type UIMessage } from 'ai';
import { Router } from 'express';
import { createChatAgentStream } from '../services/chat-agent.service.js';

const router = Router();

router.post('/', async (req, res) => {
  // 从请求中获取用户信息，处理TypeScript类型检查，先断言请求对象类型再访问user属性
  const user = (req as any).user;
  const messages = Array.isArray(req.body?.messages) ? (req.body.messages as UIMessage[]) : null;

  try {
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!messages) {
      res.status(400).json({ error: 'Invalid messages payload' });
      return;
    }

    const stream = createChatAgentStream(messages, user);
    pipeUIMessageStreamToResponse({ response: res, stream });
  } catch (error) {
    // 记录错误日志便于排查问题，避免未使用变量警告
    console.error('Chat agent stream error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

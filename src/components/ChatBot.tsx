import { CloseOutlined, MessageOutlined, RobotOutlined, SendOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Input, Space, Typography } from 'antd';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import ReactMarkdown from 'react-markdown';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useAnimation, useDragControls } from 'framer-motion';
import { useAuthStore } from '../store/auth-store';
import { notifyLibraryDataChanged } from '../utils/data-sync';

interface ToolInvocationPart {
  toolCallId?: string;
  toolName?: string;
  state?: string;
  output?: {
    error?: unknown;
    title?: string;
    confirmed?: boolean;
  };
  input?: {
    title?: string;
  };
  type: string;
}

function isToolInvocationPart(part: { type: string }): part is ToolInvocationPart {
  return part.type.startsWith('tool-') || part.type === 'dynamic-tool';
}

const SNAP_MARGIN = 32;
const FAB_SIZE = 40;

function useSnapToSide() {
  const controls = useAnimation();
  const constraintsRef = useRef({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      constraintsRef.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const snapToSide = useCallback(
    (info: { point: { x: number; y: number } }, elementWidth: number) => {
      const vw = constraintsRef.current.width;
      const centerX = info.point.x;
      const snapX = centerX < vw / 2 ? SNAP_MARGIN : vw - elementWidth - SNAP_MARGIN;
      const clampedY = Math.max(SNAP_MARGIN, Math.min(info.point.y, constraintsRef.current.height - SNAP_MARGIN - FAB_SIZE));
      controls.start({ x: snapX, y: clampedY, transition: { type: 'spring', stiffness: 260, damping: 28 } });
    },
    [controls],
  );

  return { controls, snapToSide };
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const token = useAuthStore((state) => state.token);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const syncedToolCallIdsRef = useRef(new Set<string>());

  const fabControls = useSnapToSide();
  const windowControls = useSnapToSide();
  const windowDragControls = useDragControls();

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    [token],
  );

  const { messages, sendMessage, addToolResult, status } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    for (const message of messages) {
      for (const part of message.parts) {
        if (!isToolInvocationPart(part)) {
          continue;
        }

        const toolInvocation = part;
        const toolCallId = toolInvocation.toolCallId;
        const toolName =
          toolInvocation.toolName ||
          (typeof part.type === 'string' && part.type.startsWith('tool-') ? part.type.replace('tool-', '') : '');

        if (!toolCallId || syncedToolCallIdsRef.current.has(toolCallId)) {
          continue;
        }

        const isSuccessfulExecution =
          (toolName === 'executeBorrowBook' || toolName === 'executeReturnBook') &&
          toolInvocation.state === 'output-available' &&
          !toolInvocation.output?.error;

        if (isSuccessfulExecution) {
          syncedToolCallIdsRef.current.add(toolCallId);
          notifyLibraryDataChanged();
        }
      }
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        onDragEnd={(_, info) => fabControls.snapToSide(info, FAB_SIZE)}
        animate={fabControls.controls}
        initial={{ x: window.innerWidth - SNAP_MARGIN - FAB_SIZE, y: window.innerHeight - SNAP_MARGIN - FAB_SIZE - 60 }}
        className="chat-fab-wrapper"
        whileDrag={{ scale: 1.1 }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          className="chat-fab"
          onClick={() => setIsOpen(true)}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={windowDragControls}
      onDragEnd={(_, info) => windowControls.snapToSide(info, 380)}
      animate={windowControls.controls}
      initial={{ x: window.innerWidth - SNAP_MARGIN - 380, y: window.innerHeight - SNAP_MARGIN - 600 - 60 }}
      className="chat-window-wrapper"
    >
      <Card className="chat-window ocean-card" styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}>
        <div
          className="chat-header"
          style={{ cursor: 'grab' }}
          onPointerDown={(e) => windowDragControls.start(e)}
        >
          <Space>
            <RobotOutlined style={{ fontSize: 20, color: '#3b82f6' }} />
            <Typography.Text strong>猫头鹰馆长 (AI助手)</Typography.Text>
          </Space>
          <Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />
        </div>

        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <RobotOutlined style={{ fontSize: 48, color: '#bae6fd', marginBottom: 16 }} />
              <Typography.Text type="secondary">嗨！我是蓝海书库的猫头鹰馆长。想借书、还书还是查数据？随时问我！</Typography.Text>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`chat-message-wrapper ${m.role === 'user' ? 'is-user' : 'is-ai'}`}>
              <div className="chat-avatar">
                {m.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              </div>
              <div className="chat-message-content">
                {m.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <div key={`${part.type}-${index}`} className="chat-bubble">
                        <ReactMarkdown>{part.text}</ReactMarkdown>
                      </div>
                    );
                  }

                  if (isToolInvocationPart(part)) {
                    const toolInvocation = part;
                    const toolCallId = toolInvocation.toolCallId;
                    if (!toolCallId) return null;
                    const toolName = toolInvocation.toolName || (typeof part.type === 'string' && part.type.startsWith('tool-') ? part.type.replace('tool-', '') : '');
                    const confirmationTitle = toolInvocation.output?.title ?? toolInvocation.input?.title;
                    const hasConfirmationDecision = typeof toolInvocation.output?.confirmed === 'boolean';

                    if (toolName === 'requestBorrowConfirmation') {
                      if (toolInvocation.state === 'output-error' || hasConfirmationDecision) {
                        return (
                          <div key={toolCallId} className="chat-tool-result">
                            ✓ 已处理借阅请求: {confirmationTitle}
                          </div>
                        );
                      }
                      return (
                        <Card key={toolCallId} size="small" className="chat-confirm-card">
                          <Typography.Text strong>馆长向你确认：</Typography.Text>
                          <p>是否确认借阅《{confirmationTitle}》？</p>
                          <Space>
                            <Button type="primary" size="small" onClick={() => addToolResult({ toolCallId, tool: toolName, output: { confirmed: true } })}>
                              确认借阅
                            </Button>
                            <Button size="small" onClick={() => addToolResult({ toolCallId, tool: toolName, output: { confirmed: false } })}>
                              取消
                            </Button>
                          </Space>
                        </Card>
                      );
                    }

                    if (toolName === 'requestReturnConfirmation') {
                      if (toolInvocation.state === 'output-error' || hasConfirmationDecision) {
                        return (
                          <div key={toolCallId} className="chat-tool-result">
                            ✓ 已处理还书请求: {confirmationTitle}
                          </div>
                        );
                      }
                      return (
                        <Card key={toolCallId} size="small" className="chat-confirm-card">
                          <Typography.Text strong>馆长向你确认：</Typography.Text>
                          <p>是否确认归还《{confirmationTitle}》？</p>
                          <Space>
                            <Button type="primary" size="small" onClick={() => addToolResult({ toolCallId, tool: toolName, output: { confirmed: true } })}>
                              确认归还
                            </Button>
                            <Button size="small" onClick={() => addToolResult({ toolCallId, tool: toolName, output: { confirmed: false } })}>
                              取消
                            </Button>
                          </Space>
                        </Card>
                      );
                    }

                    // 隐藏后端执行型工具的内部细节，只在执行中显示 loading
                    if (toolInvocation.state !== 'output-available' && toolInvocation.state !== 'output-error') {
                      return (
                        <div key={toolCallId} className="chat-tool-loading">
                          <span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span> 正在执行 {toolName}
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="chat-message-wrapper is-ai">
              <div className="chat-avatar"><RobotOutlined /></div>
              <div className="chat-message-content">
                 <div className="chat-bubble"><span className="typing-dot">.</span><span className="typing-dot">.</span><span className="typing-dot">.</span></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="问问猫头鹰馆长..."
              disabled={isLoading}
              autoFocus
            />
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} disabled={isLoading || !input.trim()} />
          </form>
        </div>
      </Card>
    </motion.div>
  );
}

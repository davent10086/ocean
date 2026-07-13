import { randomUUID } from 'crypto';
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { convertToModelMessages, createUIMessageStream, type UIMessage, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { AuthUser } from '../../shared/types.js';
import { env } from '../config/env.js';
import { listBooks } from './book.service.js';
import { listBorrowRecords, createBorrowRecord, returnBorrowRecord } from './borrow.service.js';
import { getAdminDashboardSummary } from './dashboard.service.js';

type AnyAgentToolDefinition = {
  name: string;
  description: string;
  schema: z.ZodTypeAny;
  execute?: (input: unknown) => Promise<unknown>;
};

type AgentToolDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  name: string;
  description: string;
  schema: TSchema;
  execute?: (input: z.infer<TSchema>) => Promise<unknown>;
};

function defineAgentTool<TSchema extends z.ZodTypeAny>(tool: AgentToolDefinition<TSchema>) {
  return tool as AnyAgentToolDefinition;
}

const MAX_AGENT_STEPS = 5;

const searchBooksSchema = z.object({
  keyword: z.string().describe('书名、作者或 ISBN'),
});

const emptySchema = z.object({});

const borrowConfirmationSchema = z.object({
  bookId: z.number(),
  title: z.string(),
});

const returnConfirmationSchema = z.object({
  recordId: z.number(),
  title: z.string(),
});

const executeBorrowSchema = z.object({
  bookId: z.number(),
});

const executeReturnSchema = z.object({
  recordId: z.number(),
});

function buildSystemPrompt(user: AuthUser) {
  return `你是一个专业的蓝海书库智能助手（图书管理员猫头鹰）。
当前用户角色：${user.role}，用户邮箱：${user.email}。
你可以帮助用户搜索图书、查询借阅记录，并执行借书和还书操作。
只有管理员（ADMIN）可以查询系统运营报表；普通用户只能处理自己的借阅相关事务。

重要规则：
1. 每次用户要求借书时，你必须先定位目标图书，然后调用 requestBorrowConfirmation。不要只在文本里口头询问“是否确认”。
2. 每次用户要求还书时，你必须先定位目标借阅记录，然后调用 requestReturnConfirmation。不要只在文本里口头询问“是否确认”。
3. 当用户在界面上确认后，你会收到该确认工具的结果。只有 confirmed 为 true 时，才能调用 executeBorrowBook 或 executeReturnBook 真正执行操作。
4. 如果 confirmed 为 false，必须尊重用户取消，不得继续执行借还书。
5. 绝对不要跳过确认步骤直接执行借还书，也不要把自然语言确认当作真正确认。
6. 如果 searchBooks 返回唯一匹配图书且库存大于 0，下一步必须调用 requestBorrowConfirmation，并传入 bookId 与 title。
7. 如果 getBorrowRecords 已经定位到唯一可归还记录，下一步必须调用 requestReturnConfirmation，并传入 recordId 与 title。
8. 回答要符合猫头鹰馆长的人设，温和、专业、有点小可爱。`;
}

function createAgentTools(user: AuthUser): AnyAgentToolDefinition[] {
  const tools: AnyAgentToolDefinition[] = [
    defineAgentTool({
      name: 'searchBooks',
      description: '根据关键字搜索图书',
      schema: searchBooksSchema,
      execute: async ({ keyword }) => listBooks({ search: keyword, page: 1, pageSize: 10 }),
    }),
    defineAgentTool({
      name: 'getBorrowRecords',
      description: '查询当前用户的借阅记录',
      schema: emptySchema,
      execute: async () => listBorrowRecords(user, { page: 1, pageSize: 50 }),
    }),
    defineAgentTool({
      name: 'requestBorrowConfirmation',
      description:
        '借书前唯一允许的确认方式。只要用户表达借书意图，且已定位到目标图书，就必须调用此工具请求确认，禁止只用自然语言口头确认。',
      schema: borrowConfirmationSchema,
    }),
    defineAgentTool({
      name: 'requestReturnConfirmation',
      description:
        '还书前唯一允许的确认方式。只要用户表达还书意图，且已定位到目标借阅记录，就必须调用此工具请求确认，禁止只用自然语言口头确认。',
      schema: returnConfirmationSchema,
    }),
    defineAgentTool({
      name: 'executeBorrowBook',
      description: '真正执行借书操作。必须在用户通过 requestBorrowConfirmation 确认后调用。',
      schema: executeBorrowSchema,
      execute: async ({ bookId }) => {
        try {
          const record = await createBorrowRecord(bookId, user);
          return { success: true, record };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),
    defineAgentTool({
      name: 'executeReturnBook',
      description: '真正执行还书操作。必须在用户通过 requestReturnConfirmation 确认后调用。',
      schema: executeReturnSchema,
      execute: async ({ recordId }) => {
        try {
          const record = await returnBorrowRecord(recordId, user);
          return { success: true, record };
        } catch (error) {
          return { success: false, error: getErrorMessage(error) };
        }
      },
    }),
  ];

  if (user.role === 'ADMIN') {
    tools.push(defineAgentTool({
      name: 'getDashboardSummary',
      description: '查询系统运营总览和报表数据（仅管理员可用）',
      schema: emptySchema,
      execute: async () => getAdminDashboardSummary(),
    }));
  }

  return tools;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '未知错误';
}

function safeStringify(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getTextContent(content: unknown) {
  if (typeof content === 'string') {
    return content;
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part;
      }

      if (!part || typeof part !== 'object') {
        return '';
      }

      const candidate = part as { type?: string; text?: unknown };
      if ((candidate.type === 'text' || candidate.type === 'reasoning') && typeof candidate.text === 'string') {
        return candidate.text;
      }

      return '';
    })
    .filter(Boolean)
    .join('\n');
}

function normalizeToolArgs(args: unknown) {
  if (args && typeof args === 'object' && !Array.isArray(args)) {
    return args as Record<string, unknown>;
  }

  return {} as Record<string, unknown>;
}

async function buildConversationHistory(messages: UIMessage[]): Promise<BaseMessage[]> {
  const modelMessages = await convertToModelMessages(
    messages.map((message) => {
      const { id, ...uiMessage } = message;
      void id;
      return uiMessage;
    }),
    { ignoreIncompleteToolCalls: true },
  );

  const conversation: BaseMessage[] = [];

  for (const message of modelMessages) {
    switch (message.role) {
      case 'system':
        conversation.push(new SystemMessage(String(message.content ?? '')));
        break;

      case 'user':
        conversation.push(new HumanMessage({ content: getTextContent(message.content) }));
        break;

      case 'assistant': {
        const content = Array.isArray(message.content) ? message.content : [];
        const toolCalls = content
          .filter((part) => part?.type === 'tool-call')
          .map((part) => ({
            id: part.toolCallId,
            name: part.toolName,
            args: normalizeToolArgs(part.input),
          }));

        conversation.push(
          new AIMessage({
            content: getTextContent(message.content),
            tool_calls: toolCalls,
          }),
        );
        break;
      }

      case 'tool': {
        if (!Array.isArray(message.content)) {
          break;
        }

        for (const part of message.content) {
          if (part?.type !== 'tool-result') {
            continue;
          }

          conversation.push(
            new ToolMessage({
              content: safeStringify(part.output),
              tool_call_id: part.toolCallId,
              name: part.toolName,
            }),
          );
        }
        break;
      }

      default:
        break;
    }
  }

  return conversation;
}

function writeTextPart(writer: UIMessageStreamWriter<UIMessage>, text: string) {
  if (!text.trim()) {
    return;
  }

  const textId = randomUUID();
  writer.write({ type: 'text-start', id: textId });
  writer.write({ type: 'text-delta', id: textId, delta: text });
  writer.write({ type: 'text-end', id: textId });
}

function buildToolErrorOutput(message: string) {
  return { success: false, error: message };
}

async function handleConfirmationToolCall(
  toolCall: { id?: string; name: string; args: Record<string, unknown> },
  tool: AgentToolDefinition,
  writer: UIMessageStreamWriter<UIMessage>,
) {
  const toolCallId = toolCall.id ?? randomUUID();
  const parsedInput = tool.schema.safeParse(toolCall.args);

  if (!parsedInput.success) {
    writer.write({
      type: 'tool-input-error',
      toolCallId,
      toolName: tool.name,
      input: toolCall.args,
      errorText: parsedInput.error.issues[0]?.message ?? '工具参数无效。',
    });
    return;
  }

  const input = parsedInput.data;
  writer.write({
    type: 'tool-input-available',
    toolCallId,
    toolName: tool.name,
    input,
    ...(typeof input.title === 'string' ? { title: input.title } : {}),
  });
}

async function executeToolCall(
  toolCall: { id?: string; name: string; args: Record<string, unknown> },
  tool: AgentToolDefinition,
  writer: UIMessageStreamWriter<UIMessage>,
  conversation: BaseMessage[],
) {
  const toolCallId = toolCall.id ?? randomUUID();
  const parsedInput = tool.schema.safeParse(toolCall.args);

  if (!parsedInput.success) {
    const output = buildToolErrorOutput(parsedInput.error.issues[0]?.message ?? '工具参数无效。');
    writer.write({
      type: 'tool-input-error',
      toolCallId,
      toolName: tool.name,
      input: toolCall.args,
      errorText: output.error,
    });
    conversation.push(
      new ToolMessage({
        content: safeStringify(output),
        tool_call_id: toolCallId,
        name: tool.name,
        status: 'error',
      }),
    );
    return;
  }

  const input = parsedInput.data;
  writer.write({
    type: 'tool-input-available',
    toolCallId,
    toolName: tool.name,
    input,
    ...(typeof input.title === 'string' ? { title: input.title } : {}),
  });

  const output = tool.execute ? await tool.execute(input) : buildToolErrorOutput(`工具 ${tool.name} 不支持服务端执行。`);
  writer.write({
    type: 'tool-output-available',
    toolCallId,
    output,
  });

  conversation.push(
    new ToolMessage({
      content: safeStringify(output),
      tool_call_id: toolCallId,
      name: tool.name,
      status:
        typeof output === 'object' &&
          output !== null &&
          'success' in output &&
          output.success === false
          ? 'error'
          : 'success',
    }),
  );
}

async function runAgentLoop(
  messages: UIMessage[],
  user: AuthUser,
  writer: UIMessageStreamWriter<UIMessage>,
) {
  const tools = createAgentTools(user);
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));
  const conversation = [
    new SystemMessage(buildSystemPrompt(user)),
    ...(await buildConversationHistory(messages)),
  ];

  const model = new ChatOpenAI({
    model: 'deepseek-chat',
    temperature: 0,
    maxRetries: 2,
    configuration: {
      apiKey: env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com/v1',
    },
  }).bindTools(
    tools.map(({ name, description, schema }) => ({
      name,
      description,
      schema,
    })),
  );

  writer.write({ type: 'start' });

  for (let step = 0; step < MAX_AGENT_STEPS; step += 1) {
    if (step > 0) {
      writer.write({ type: 'start-step' });
    }

    const aiMessage = await model.invoke(conversation);
    conversation.push(aiMessage);

    writeTextPart(writer, getTextContent(aiMessage.content));

    const toolCalls = (aiMessage.tool_calls ?? []).map((toolCall) => ({
      id: toolCall.id,
      name: toolCall.name,
      args: normalizeToolArgs(toolCall.args),
    }));

    if (toolCalls.length === 0) {
      writer.write({ type: 'finish', finishReason: 'stop' });
      return;
    }

    const confirmationCall = toolCalls.find((toolCall) => {
      const tool = toolMap.get(toolCall.name);
      return tool && !tool.execute;
    });

    if (confirmationCall) {
      const tool = toolMap.get(confirmationCall.name);
      if (tool) {
        await handleConfirmationToolCall(confirmationCall, tool, writer);
      }
      writer.write({ type: 'finish', finishReason: 'tool-calls' });
      return;
    }

    for (const toolCall of toolCalls) {
      const tool = toolMap.get(toolCall.name);
      if (!tool) {
        const toolCallId = toolCall.id ?? randomUUID();
        const output = buildToolErrorOutput(`未找到工具 ${toolCall.name}。`);
        writer.write({
          type: 'tool-input-error',
          toolCallId,
          toolName: toolCall.name,
          input: toolCall.args,
          errorText: output.error,
        });
        conversation.push(
          new ToolMessage({
            content: safeStringify(output),
            tool_call_id: toolCallId,
            name: toolCall.name,
            status: 'error',
          }),
        );
        continue;
      }

      await executeToolCall(toolCall, tool, writer, conversation);
    }
  }

  writeTextPart(writer, '为了保证操作安全，我先暂停在这里。你可以换一种说法继续提问，我会接着帮你处理。');
  writer.write({ type: 'finish', finishReason: 'length' });
}

export function createChatAgentStream(messages: UIMessage[], user: AuthUser) {
  return createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      await runAgentLoop(messages, user, writer);
    },
    onError: (error) => getErrorMessage(error),
  });
}

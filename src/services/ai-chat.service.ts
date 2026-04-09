import { prisma } from '@/config/database';
import { genAI, CHAT_MODEL, SYSTEM_PROMPT, MAX_MESSAGES_PER_MINUTE } from '@/config/gemini.config';
import { searchSimilarChunks, type SearchResult } from '@/services/embedding.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ========================
// Types
// ========================

interface ChatSource {
  sourceType: string;
  sourceId: string;
  title: string;
  snippet: string;
}

interface ChatResponse {
  content: string;
  sources: ChatSource[];
}

// ========================
// Rate Limiting (in-memory)
// ========================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (userId: string): void => {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return;
  }

  if (entry.count >= MAX_MESSAGES_PER_MINUTE) {
    throw new AppError(
      `Bạn đã gửi quá ${MAX_MESSAGES_PER_MINUTE} tin nhắn/phút. Vui lòng chờ một chút.`,
      429,
    );
  }

  entry.count++;
};

// Clean up rate limit entries periodically (every 5 minutes)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);

// ========================
// Session Management
// ========================

export const createSession = async (
  userId: bigint,
  title?: string,
): Promise<{ id: string; title: string | null }> => {
  const session = await prisma.chatSession.create({
    data: {
      userId,
      title: title || 'Cuộc trò chuyện mới',
    },
    select: { id: true, title: true },
  });

  return { id: session.id.toString(), title: session.title };
};

export const getSessions = async (
  userId: bigint,
): Promise<{ id: string; title: string | null; createdAt: Date; messageCount: number }[]> => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId, isActive: true },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      _count: { select: { messages: true } },
    },
  });

  return sessions.map((s) => ({
    id: s.id.toString(),
    title: s.title,
    createdAt: s.createdAt,
    messageCount: s._count.messages,
  }));
};

export const getMessages = async (
  sessionId: bigint,
  userId: bigint,
): Promise<{ id: string; role: string; content: string; sources: unknown; createdAt: Date }[]> => {
  // Verify session belongs to user
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId, isActive: true },
  });

  if (!session) {
    throw new AppError('Phiên trò chuyện không tồn tại.', 404);
  }

  const messages = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      role: true,
      content: true,
      sources: true,
      createdAt: true,
    },
  });

  return messages.map((m) => ({
    id: m.id.toString(),
    role: m.role,
    content: m.content,
    sources: m.sources,
    createdAt: m.createdAt,
  }));
};

export const deleteSession = async (sessionId: bigint, userId: bigint): Promise<void> => {
  const session = await prisma.chatSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new AppError('Phiên trò chuyện không tồn tại.', 404);
  }

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { isActive: false },
  });
};

// ========================
// RAG Chat Pipeline
// ========================

/**
 * Build context from retrieved chunks for the LLM prompt.
 */
const buildContext = (chunks: SearchResult[]): { context: string; sources: ChatSource[] } => {
  if (chunks.length === 0) {
    return { context: '', sources: [] };
  }

  const sources: ChatSource[] = [];
  const contextParts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const meta = chunk.metadata as Record<string, string> | null;
    const docTitle = meta?.documentTitle || 'Tài liệu không rõ';
    const category = meta?.category || 'Chung';

    contextParts.push(
      `--- Tài liệu ${i + 1}: "${docTitle}" (Danh mục: ${category}) ---\n${chunk.content}`,
    );

    // Only add unique sources
    if (!sources.find((s) => s.sourceId === chunk.sourceId.toString())) {
      sources.push({
        sourceType: chunk.sourceType,
        sourceId: chunk.sourceId.toString(),
        title: docTitle,
        snippet: chunk.content.slice(0, 150) + '...',
      });
    }
  }

  return {
    context: contextParts.join('\n\n'),
    sources,
  };
};

/**
 * Main RAG chat function — non-streaming version.
 * Returns complete response with sources.
 */
export const chat = async (
  userId: bigint,
  sessionId: bigint | null,
  message: string,
): Promise<ChatResponse & { sessionId: string }> => {
  checkRateLimit(userId.toString());

  // Create session if not provided
  let activeSessionId: bigint;
  if (!sessionId) {
    // Auto-generate title from first message
    const title = message.length > 50 ? message.slice(0, 50) + '...' : message;
    const session = await prisma.chatSession.create({
      data: { userId, title },
    });
    activeSessionId = session.id;
  } else {
    // Verify session ownership
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId, isActive: true },
    });
    if (!session) {
      throw new AppError('Phiên trò chuyện không tồn tại.', 404);
    }
    activeSessionId = sessionId;
  }

  // Save user message
  await prisma.chatMessage.create({
    data: {
      sessionId: activeSessionId,
      role: 'user',
      content: message,
    },
  });

  // Step 1: Retrieve relevant chunks
  const chunks = await searchSimilarChunks(message);
  const { context, sources } = buildContext(chunks);

  // Step 2: Build conversation history (last 10 messages)
  const history = await prisma.chatMessage.findMany({
    where: { sessionId: activeSessionId },
    orderBy: { createdAt: 'asc' },
    take: 10,
    select: { role: true, content: true },
  });

  // Step 3: Build prompt
  const contextSection =
    context.length > 0
      ? `\n[TÀI LIỆU THAM KHẢO]\n${context}\n[/TÀI LIỆU THAM KHẢO]`
      : '\n[Không tìm thấy tài liệu liên quan trong hệ thống]';

  // Step 4: Call Gemini
  const response = await genAI.models.generateContent({
    model: CHAT_MODEL,
    contents: [
      ...history.slice(0, -1).map((msg) => ({
        role: msg.role === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: msg.content }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: `${contextSection}\n\nCâu hỏi của nhân viên: ${message}` }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  });

  const aiContent = response.text ?? 'Xin lỗi, tôi không thể trả lời lúc này.';

  // Step 5: Save assistant message
  await prisma.chatMessage.create({
    data: {
      sessionId: activeSessionId,
      role: 'assistant',
      content: aiContent,
      sources: sources.length > 0 ? (sources as unknown as Record<string, unknown>[]) : undefined,
    },
  });

  // Update session title if it was just created
  await prisma.chatSession.update({
    where: { id: activeSessionId },
    data: { updatedAt: new Date() },
  });

  return {
    sessionId: activeSessionId.toString(),
    content: aiContent,
    sources,
  };
};

/**
 * Streaming version of RAG chat using SSE.
 * Yields text chunks as they arrive from Gemini.
 */
export async function* chatStream(
  userId: bigint,
  sessionId: bigint | null,
  message: string,
): AsyncGenerator<{ type: 'text' | 'sources' | 'session' | 'done' | 'error'; data: string }> {
  checkRateLimit(userId.toString());

  // Create or verify session
  let activeSessionId: bigint;
  if (!sessionId) {
    const title = message.length > 50 ? message.slice(0, 50) + '...' : message;
    const session = await prisma.chatSession.create({
      data: { userId, title },
    });
    activeSessionId = session.id;
  } else {
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId, isActive: true },
    });
    if (!session) {
      yield { type: 'error', data: 'Phiên trò chuyện không tồn tại.' };
      return;
    }
    activeSessionId = sessionId;
  }

  // Emit session ID
  yield { type: 'session', data: activeSessionId.toString() };

  // Save user message
  await prisma.chatMessage.create({
    data: {
      sessionId: activeSessionId,
      role: 'user',
      content: message,
    },
  });

  // Step 1: Retrieve relevant chunks
  const chunks = await searchSimilarChunks(message);
  const { context, sources } = buildContext(chunks);

  // Emit sources early so frontend can display them
  if (sources.length > 0) {
    yield { type: 'sources', data: JSON.stringify(sources) };
  }

  // Step 2: Get conversation history
  const history = await prisma.chatMessage.findMany({
    where: { sessionId: activeSessionId },
    orderBy: { createdAt: 'asc' },
    take: 10,
    select: { role: true, content: true },
  });

  // Step 3: Build prompt
  const contextSection =
    context.length > 0
      ? `\n[TÀI LIỆU THAM KHẢO]\n${context}\n[/TÀI LIỆU THAM KHẢO]`
      : '\n[Không tìm thấy tài liệu liên quan trong hệ thống]';

  // Step 4: Stream from Gemini
  let fullContent = '';

  try {
    const response = await genAI.models.generateContentStream({
      model: CHAT_MODEL,
      contents: [
        ...history.slice(0, -1).map((msg) => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: msg.content }],
        })),
        {
          role: 'user' as const,
          parts: [{ text: `${contextSection}\n\nCâu hỏi của nhân viên: ${message}` }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        fullContent += text;
        yield { type: 'text', data: text };
      }
    }
  } catch (error) {
    logger.error('Gemini streaming error:', error);
    const errorMsg = 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.';
    fullContent = errorMsg;
    yield { type: 'text', data: errorMsg };
  }

  // Step 5: Save complete assistant message
  await prisma.chatMessage.create({
    data: {
      sessionId: activeSessionId,
      role: 'assistant',
      content: fullContent,
      sources: sources.length > 0 ? (sources as unknown as Record<string, unknown>[]) : undefined,
    },
  });

  await prisma.chatSession.update({
    where: { id: activeSessionId },
    data: { updatedAt: new Date() },
  });

  yield { type: 'done', data: '' };
}

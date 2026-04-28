/**
 * Groq fallback (OpenAI-compatible) — dùng khi Gemini fail / quota / parse fail.
 * Chỉ trả raw text JSON; caller tự parse. KHÔNG làm gì nếu thiếu GROQ_API_KEY.
 */
import { env } from '@/config/env.config';
import { logger } from '@/config/logger';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqJsonOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GroqChatChoice {
  message?: { content?: string };
}

interface GroqChatResponse {
  choices?: GroqChatChoice[];
}

export async function groqGenerateJson(opts: GroqJsonOptions): Promise<string | null> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return null;

  const payload = {
    model: opts.model || env.GROQ_MODEL,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    response_format: { type: 'json_object' as const },
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4000,
  };

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '<no body>');
      logger.warn(`[groq] ${res.status} ${errText.slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content ?? null;
    if (text) {
      logger.info(`[groq] ok len=${text.length} model=${payload.model}`);
    }
    return text;
  } catch (err) {
    logger.error('[groq] request failed:', err);
    return null;
  }
}

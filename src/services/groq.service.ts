/**
 * Groq fallback (OpenAI-compatible) — dùng khi Gemini fail / quota / parse fail.
 * KHÔNG làm gì nếu thiếu GROQ_API_KEY (trả null).
 */
import { env } from '@/config/env.config';
import { logger } from '@/config/logger';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface GroqGenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** Khi true → bật response_format json_object (caller cần JSON parseable). */
  forceJson?: boolean;
}

interface GroqChatChoice {
  message?: { content?: string };
}

interface GroqChatResponse {
  choices?: GroqChatChoice[];
}

export function isGroqEnabled(): boolean {
  return Boolean(env.GROQ_API_KEY);
}

/**
 * Gọi Groq Chat Completions; trả raw string content (caller tự parse).
 * Trả null khi: thiếu API key / lỗi network / status != 200 / response rỗng.
 */
export async function groqGenerate(opts: GroqGenerateOptions): Promise<string | null> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return null;

  const body: Record<string, unknown> = {
    model: opts.model || env.GROQ_MODEL,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userPrompt },
    ],
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.maxTokens ?? 4000,
  };
  if (opts.forceJson) {
    body.response_format = { type: 'json_object' };
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '<no body>');
      logger.warn(`[groq] ${res.status} ${errText.slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content ?? null;
    if (text) {
      logger.info(
        `[groq] ok len=${text.length} model=${body.model as string} json=${Boolean(opts.forceJson)}`,
      );
    }
    return text;
  } catch (err) {
    logger.error('[groq] request failed:', err);
    return null;
  }
}

/** Backward compat — Module 1 dùng forceJson=true. */
export async function groqGenerateJson(
  opts: Omit<GroqGenerateOptions, 'forceJson'>,
): Promise<string | null> {
  return groqGenerate({ ...opts, forceJson: true });
}

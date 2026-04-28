/**
 * Universal Gemini → Groq fallback wrapper.
 *
 * Drop-in replacement cho `genAI.models.generateContent(opts)`:
 * - Thử Gemini trước.
 * - Nếu Gemini throw (quota, key invalid, network) hoặc trả empty text →
 *   build payload Groq tương đương + gọi Groq Chat Completions.
 * - Trả về `{ text: string }` (subset interface mà 99% callers dùng).
 *
 * KHÔNG hỗ trợ streaming (callers stream giữ nguyên `genAI.models.generateContentStream`).
 * KHÔNG hỗ trợ embeddings (Groq không có endpoint embedding tương đương).
 */
import { genAI } from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { groqGenerate } from '@/services/groq.service';

// Mượn type của @google/genai để typecheck pass khi caller spread params trực tiếp.
// Định nghĩa minimal subset thay vì import sâu để tránh coupling.
interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

interface GeminiContent {
  role?: string;
  parts?: GeminiPart[];
}

interface GeminiGenerateConfig {
  systemInstruction?: string | GeminiContent | { parts?: GeminiPart[] };
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
  thinkingConfig?: { thinkingBudget?: number };
  // các field khác Groq bỏ qua
  [k: string]: unknown;
}

export interface GenerateContentParams {
  model: string;
  contents: string | GeminiContent[] | GeminiContent;
  config?: GeminiGenerateConfig;
}

export interface GenerateContentResult {
  text: string;
}

const TRUNCATE_ERR = 200;

function extractText(input: unknown): string {
  if (!input) return '';
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    return input
      .map((c) => {
        if (typeof c === 'string') return c;
        if (c && typeof c === 'object') {
          const obj = c as GeminiContent;
          if (obj.parts) {
            return obj.parts
              .map((p) => (p && typeof p === 'object' && 'text' in p ? (p.text ?? '') : ''))
              .join('\n');
          }
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  if (typeof input === 'object') {
    const obj = input as GeminiContent;
    if (obj.parts) {
      return obj.parts.map((p) => p?.text ?? '').join('\n');
    }
  }
  return '';
}

function extractSystemInstruction(cfg?: GeminiGenerateConfig): string {
  if (!cfg?.systemInstruction) return '';
  const si = cfg.systemInstruction;
  if (typeof si === 'string') return si;
  if (typeof si === 'object') {
    if ('parts' in si && si.parts) {
      return si.parts.map((p) => p?.text ?? '').join('\n');
    }
  }
  return '';
}

/**
 * Wrapper với fallback Groq. Caller dùng giống hệt `genAI.models.generateContent`.
 *
 * @example
 * const result = await generateContentWithFallback({
 *   model: cfg.chatModel,
 *   contents: [{ role: 'user', parts: [{ text: prompt }] }],
 *   config: { systemInstruction, responseMimeType: 'application/json' },
 * });
 * const raw = result.text;
 */
export async function generateContentWithFallback(
  opts: GenerateContentParams,
): Promise<GenerateContentResult> {
  // 1. Thử Gemini trước
  try {
    const r = await genAI.models.generateContent(opts);
    const text = r.text ?? '';
    if (text.length > 0) {
      return { text };
    }
    logger.warn('[ai] Gemini trả empty text — fallback Groq');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`[ai] Gemini failed (${msg.slice(0, TRUNCATE_ERR)}) — fallback Groq`);
  }

  // 2. Build Groq payload tương đương + gọi
  const systemPrompt = extractSystemInstruction(opts.config);
  const userPrompt = extractText(opts.contents);
  const wantsJson = opts.config?.responseMimeType === 'application/json';

  const groqText = await groqGenerate({
    systemPrompt,
    userPrompt,
    forceJson: wantsJson,
    temperature: opts.config?.temperature,
    maxTokens: opts.config?.maxOutputTokens,
  });

  return { text: groqText ?? '' };
}

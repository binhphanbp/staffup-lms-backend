import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import {
  CHAT_MODEL,
  EMBEDDING_MODEL,
  SYSTEM_PROMPT,
  LEARNING_SYSTEM_PROMPT,
  GRADING_SYSTEM_PROMPT,
  QUESTION_GENERATION_SYSTEM_PROMPT,
  COURSE_OUTLINE_SYSTEM_PROMPT,
  LESSON_CONTENT_SYSTEM_PROMPT,
  LEARNING_RECOMMENDATION_SYSTEM_PROMPT,
  CODE_LAB_REVIEW_SYSTEM_PROMPT,
  TOP_K_RESULTS,
  MAX_MESSAGES_PER_MINUTE,
} from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

/**
 * Module flags admins can toggle from the AI Configuration page.
 * When `false`, the relevant feature should refuse to run with HTTP 503.
 */
export interface AiModuleFlags {
  chatbot: boolean;
  dropoutPrediction: boolean;
  autoGrader: boolean;
  questionGenerator: boolean;
}

/**
 * Prompt overrides — when missing, the hard-coded constant from
 * `gemini.config.ts` is used as fallback.
 */
export interface AiPromptOverrides {
  systemPrompt?: string | null;
  learningSystemPrompt?: string | null;
  gradingSystemPrompt?: string | null;
  questionGenerationSystemPrompt?: string | null;
  courseOutlineSystemPrompt?: string | null;
  lessonContentSystemPrompt?: string | null;
  learningRecommendationSystemPrompt?: string | null;
  codeLabReviewSystemPrompt?: string | null;
}

export interface EffectiveAiConfig {
  provider: string;
  chatModel: string;
  embeddingModel: string;
  topKResults: number;
  maxMessagesPerMinute: number;
  temperature: number;
  modules: AiModuleFlags;
  prompts: {
    systemPrompt: string;
    learningSystemPrompt: string;
    gradingSystemPrompt: string;
    questionGenerationSystemPrompt: string;
    courseOutlineSystemPrompt: string;
    lessonContentSystemPrompt: string;
    learningRecommendationSystemPrompt: string;
    codeLabReviewSystemPrompt: string;
  };
  updatedAt: string;
}

const DEFAULT_MODULES: AiModuleFlags = {
  chatbot: true,
  dropoutPrediction: true,
  autoGrader: true,
  questionGenerator: true,
};

const DEFAULT_PROMPTS = {
  systemPrompt: SYSTEM_PROMPT,
  learningSystemPrompt: LEARNING_SYSTEM_PROMPT,
  gradingSystemPrompt: GRADING_SYSTEM_PROMPT,
  questionGenerationSystemPrompt: QUESTION_GENERATION_SYSTEM_PROMPT,
  courseOutlineSystemPrompt: COURSE_OUTLINE_SYSTEM_PROMPT,
  lessonContentSystemPrompt: LESSON_CONTENT_SYSTEM_PROMPT,
  learningRecommendationSystemPrompt: LEARNING_RECOMMENDATION_SYSTEM_PROMPT,
  codeLabReviewSystemPrompt: CODE_LAB_REVIEW_SYSTEM_PROMPT,
};

const CACHE_TTL_MS = 60_000;

let cache: { value: EffectiveAiConfig; expiresAt: number } | null = null;

const sanitizeModules = (raw: unknown): AiModuleFlags => {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_MODULES };
  const r = raw as Record<string, unknown>;
  return {
    chatbot: typeof r.chatbot === 'boolean' ? r.chatbot : DEFAULT_MODULES.chatbot,
    dropoutPrediction:
      typeof r.dropoutPrediction === 'boolean'
        ? r.dropoutPrediction
        : DEFAULT_MODULES.dropoutPrediction,
    autoGrader: typeof r.autoGrader === 'boolean' ? r.autoGrader : DEFAULT_MODULES.autoGrader,
    questionGenerator:
      typeof r.questionGenerator === 'boolean'
        ? r.questionGenerator
        : DEFAULT_MODULES.questionGenerator,
  };
};

const pickPrompt = (raw: unknown, key: keyof AiPromptOverrides, fallback: string): string => {
  if (!raw || typeof raw !== 'object') return fallback;
  const value = (raw as Record<string, unknown>)[key];
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }
  return fallback;
};

const buildEffective = (row: {
  provider: string;
  chatModel: string;
  embeddingModel: string;
  prompts: unknown;
  modules: unknown;
  topKResults: number;
  maxMessagesPerMinute: number;
  temperature: number;
  updatedAt: Date;
}): EffectiveAiConfig => ({
  provider: row.provider,
  chatModel: row.chatModel || CHAT_MODEL,
  embeddingModel: row.embeddingModel || EMBEDDING_MODEL,
  topKResults: row.topKResults || TOP_K_RESULTS,
  maxMessagesPerMinute: row.maxMessagesPerMinute || MAX_MESSAGES_PER_MINUTE,
  temperature: row.temperature ?? 0.4,
  modules: sanitizeModules(row.modules),
  prompts: {
    systemPrompt: pickPrompt(row.prompts, 'systemPrompt', DEFAULT_PROMPTS.systemPrompt),
    learningSystemPrompt: pickPrompt(
      row.prompts,
      'learningSystemPrompt',
      DEFAULT_PROMPTS.learningSystemPrompt,
    ),
    gradingSystemPrompt: pickPrompt(
      row.prompts,
      'gradingSystemPrompt',
      DEFAULT_PROMPTS.gradingSystemPrompt,
    ),
    questionGenerationSystemPrompt: pickPrompt(
      row.prompts,
      'questionGenerationSystemPrompt',
      DEFAULT_PROMPTS.questionGenerationSystemPrompt,
    ),
    courseOutlineSystemPrompt: pickPrompt(
      row.prompts,
      'courseOutlineSystemPrompt',
      DEFAULT_PROMPTS.courseOutlineSystemPrompt,
    ),
    lessonContentSystemPrompt: pickPrompt(
      row.prompts,
      'lessonContentSystemPrompt',
      DEFAULT_PROMPTS.lessonContentSystemPrompt,
    ),
    learningRecommendationSystemPrompt: pickPrompt(
      row.prompts,
      'learningRecommendationSystemPrompt',
      DEFAULT_PROMPTS.learningRecommendationSystemPrompt,
    ),
    codeLabReviewSystemPrompt: pickPrompt(
      row.prompts,
      'codeLabReviewSystemPrompt',
      DEFAULT_PROMPTS.codeLabReviewSystemPrompt,
    ),
  },
  updatedAt: row.updatedAt.toISOString(),
});

const buildFallback = (): EffectiveAiConfig => ({
  provider: 'gemini',
  chatModel: CHAT_MODEL,
  embeddingModel: EMBEDDING_MODEL,
  topKResults: TOP_K_RESULTS,
  maxMessagesPerMinute: MAX_MESSAGES_PER_MINUTE,
  temperature: 0.4,
  modules: { ...DEFAULT_MODULES },
  prompts: { ...DEFAULT_PROMPTS },
  updatedAt: new Date(0).toISOString(),
});

const fetchAndCache = async (): Promise<EffectiveAiConfig> => {
  try {
    const row = await prisma.aiConfig.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });
    const effective = buildEffective(row);
    cache = { value: effective, expiresAt: Date.now() + CACHE_TTL_MS };
    return effective;
  } catch (error) {
    logger.warn('Failed to load AiConfig from DB, using built-in defaults', error as Error);
    const fallback = buildFallback();
    cache = { value: fallback, expiresAt: Date.now() + CACHE_TTL_MS };
    return fallback;
  }
};

export const getEffectiveConfig = async (): Promise<EffectiveAiConfig> => {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }
  return fetchAndCache();
};

export const invalidateCache = (): void => {
  cache = null;
};

/**
 * Throw 503 when a feature flag is disabled. Use at the top of feature endpoints.
 */
export const ensureModuleEnabled = async (
  module: keyof AiModuleFlags,
  featureLabel: string,
): Promise<void> => {
  const cfg = await getEffectiveConfig();
  if (!cfg.modules[module]) {
    throw new AppError(
      `Tính năng "${featureLabel}" đã được Quản trị viên tạm tắt. Vui lòng liên hệ Admin để biết thêm chi tiết.`,
      503,
    );
  }
};

// =========================================================================
// Admin CRUD
// =========================================================================

export interface UpdateAiConfigInput {
  provider?: string;
  chatModel?: string;
  embeddingModel?: string;
  topKResults?: number;
  maxMessagesPerMinute?: number;
  temperature?: number;
  modules?: Partial<AiModuleFlags>;
  prompts?: AiPromptOverrides;
}

export const getAdminConfig = async (): Promise<EffectiveAiConfig> => {
  // Bypass cache for admin reads to always show latest values immediately
  invalidateCache();
  return getEffectiveConfig();
};

export const updateAdminConfig = async (
  input: UpdateAiConfigInput,
  updatedBy: bigint | null,
): Promise<EffectiveAiConfig> => {
  const existing = await prisma.aiConfig.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  const mergedModules: AiModuleFlags = {
    ...sanitizeModules(existing.modules),
    ...(input.modules ?? {}),
  };

  const existingPrompts =
    existing.prompts && typeof existing.prompts === 'object'
      ? (existing.prompts as Record<string, unknown>)
      : {};
  const mergedPrompts: Record<string, string | null> = { ...existingPrompts } as Record<
    string,
    string | null
  >;
  if (input.prompts) {
    for (const [key, value] of Object.entries(input.prompts)) {
      if (value === null || value === undefined) {
        delete mergedPrompts[key]; // null = revert to default fallback
      } else {
        mergedPrompts[key] = value;
      }
    }
  }

  const updated = await prisma.aiConfig.update({
    where: { id: 1 },
    data: {
      provider: input.provider ?? existing.provider,
      chatModel: input.chatModel ?? existing.chatModel,
      embeddingModel: input.embeddingModel ?? existing.embeddingModel,
      topKResults: input.topKResults ?? existing.topKResults,
      maxMessagesPerMinute: input.maxMessagesPerMinute ?? existing.maxMessagesPerMinute,
      temperature: input.temperature ?? existing.temperature,
      modules: mergedModules as unknown as Prisma.InputJsonValue,
      prompts: mergedPrompts as unknown as Prisma.InputJsonValue,
      updatedBy: updatedBy ?? existing.updatedBy,
    },
  });

  invalidateCache();
  const effective = buildEffective(updated);
  cache = { value: effective, expiresAt: Date.now() + CACHE_TTL_MS };
  return effective;
};

export const resetAdminConfig = async (updatedBy: bigint | null): Promise<EffectiveAiConfig> => {
  const updated = await prisma.aiConfig.upsert({
    where: { id: 1 },
    update: {
      provider: 'gemini',
      chatModel: CHAT_MODEL,
      embeddingModel: EMBEDDING_MODEL,
      topKResults: TOP_K_RESULTS,
      maxMessagesPerMinute: MAX_MESSAGES_PER_MINUTE,
      temperature: 0.4,
      modules: DEFAULT_MODULES as unknown as Prisma.InputJsonValue,
      prompts: {} as Prisma.InputJsonValue,
      updatedBy,
    },
    create: {
      id: 1,
      modules: DEFAULT_MODULES as unknown as Prisma.InputJsonValue,
      updatedBy,
    },
  });
  invalidateCache();
  const effective = buildEffective(updated);
  cache = { value: effective, expiresAt: Date.now() + CACHE_TTL_MS };
  return effective;
};

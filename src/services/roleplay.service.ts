import type { Prisma, RoleplayScenario } from '@prisma/client';
import { prisma } from '@/config/database';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ========================
// Types
// ========================

export interface RubricCriterion {
  key: string;
  label: string;
  description: string;
  weight: number;
}

export interface ScenarioSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  personaName: string;
  personaRole: string;
  personaTone: string;
  difficulty: string;
  category: string;
  estimatedMinutes: number;
  maxTurns: number;
  language: string;
  voiceHint: string | null;
  objectives: string[];
  rubric: RubricCriterion[];
  isActive: boolean;
}

export interface ScenarioDetail extends ScenarioSummary {
  context: string;
  openingLine: string;
}

export interface ScenarioListItem extends ScenarioSummary {
  attemptCount: number;
  bestScore: number | null;
}

export interface TurnSummary {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  orderIndex: number;
  createdAt: string;
}

export interface SessionSummary {
  id: string;
  scenarioId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  scenario: ScenarioSummary;
  turnCount: number;
  evaluation: EvaluationSummary | null;
}

export interface SessionDetail extends SessionSummary {
  turns: TurnSummary[];
}

export interface CriterionScore {
  key: string;
  label: string;
  score: number;
  max: number;
  feedback: string;
}

export interface EvaluationSummary {
  id: string;
  sessionId: string;
  overallScore: number;
  band: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  criterionScores: CriterionScore[];
  strengths: string[];
  improvements: string[];
  summary: string;
  createdAt: string;
}

export interface TurnResponse {
  turn: TurnSummary;
  shouldEnd: boolean;
  remainingTurns: number;
}

// ========================
// System prompts (Vietnamese)
// ========================

const buildPersonaSystemPrompt = (scenario: RoleplayScenario): string => {
  const objectives = (scenario.objectives as unknown as string[] | null) ?? [];
  const objectivesBlock =
    objectives.length > 0
      ? objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')
      : '(Không có mục tiêu cụ thể)';

  return `Bạn đang đóng vai **${scenario.personaName}** — ${scenario.personaRole}.

**Bối cảnh:**
${scenario.context}

**Mục tiêu của buổi roleplay (góc nhìn người học):**
${objectivesBlock}

**Quy tắc đóng vai:**
- LUÔN giữ đúng nhân vật, giọng điệu **${scenario.personaTone}**, trả lời ở ngôi xưng phù hợp với người Việt (bạn/anh/chị/em).
- KHÔNG tự xưng là AI, không phá vỡ vai trừ khi người học yêu cầu kết thúc rõ ràng.
- KHÔNG đưa ra đánh giá hay điểm số cho người học trong lúc roleplay — phần đó được xử lý ở bước evaluation riêng.
- Đẩy tình huống có chiều sâu: đặt câu hỏi tiếp, phản bác hợp lý, hoặc bộc lộ cảm xúc khi cần.
- Mỗi phản hồi NGẮN GỌN từ 1–4 câu (vì người học đang nói/nghe theo thời gian thực). Tránh đoạn văn dài.
- Ngôn ngữ: Tiếng Việt tự nhiên. Tránh tiếng Anh trừ khi tình huống yêu cầu.
- Nếu người học có vẻ bí, hãy gợi ý ngầm bằng cách hỏi lại hoặc nhấn mạnh nhu cầu của nhân vật.
- Nếu cuộc trò chuyện đã đạt mục tiêu hoặc bế tắc, có thể đưa ra tín hiệu kết thúc tự nhiên (ví dụ: "Cảm ơn em, anh sẽ suy nghĩ thêm.").

CHỈ trả lời bằng nội dung lời thoại của nhân vật, không thêm tiền tố như "Nhân vật:" hay đặt trong dấu ngoặc.`;
};

const EVALUATION_SYSTEM_PROMPT = `Bạn là chuyên gia coaching kỹ năng mềm (soft skills) cho doanh nghiệp.

Nhiệm vụ: Đánh giá phần thể hiện của **người học (User)** trong một buổi roleplay với AI đóng vai. Bạn sẽ đọc:
1. Mô tả tình huống + persona AI đóng.
2. Rubric đánh giá (gồm các tiêu chí với weight tổng = 100).
3. Toàn bộ transcript có gắn nhãn role.

Yêu cầu output **CHỈ** ở dạng JSON, theo schema:
{
  "criterionScores": [
    { "key": "<key>", "label": "<label>", "score": 0..100, "feedback": "..." }
  ],
  "overallScore": 0..100,
  "band": "excellent" | "good" | "needs_improvement" | "poor",
  "strengths": ["..."],
  "improvements": ["..."],
  "summary": "Đoạn tóm tắt 2-4 câu, tiếng Việt, hướng phát triển."
}

Quy tắc chấm:
- \`score\` từng tiêu chí là điểm 0–100 (KHÔNG nhân với weight). \`overallScore\` = trung bình có trọng số (theo weight rubric), làm tròn về số nguyên.
- \`band\`: excellent (≥85), good (70–84), needs_improvement (50–69), poor (<50).
- \`strengths\` và \`improvements\` mỗi cái 2–4 mục, dùng động từ chủ động (vd: "Lắng nghe chủ động khi khách phản đối", "Đề xuất thêm 1 phương án dự phòng").
- \`feedback\` mỗi tiêu chí ngắn gọn 1–2 câu, có ví dụ trích lại từ transcript khi có thể.
- TUYỆT ĐỐI không bỏ sót tiêu chí nào trong rubric. Giữ đúng \`key\` và \`label\` tôi cung cấp.
- Dùng tiếng Việt thân thiện nhưng chuyên nghiệp, xưng hô "bạn".
- Nếu người học bỏ giữa chừng (ít hơn 3 lượt), điểm thường ở mức poor/needs_improvement; ghi rõ trong summary.

CHỈ output JSON hợp lệ, không có markdown fence.`;

// ========================
// Default rubric (used when scenario doesn't define one)
// ========================

const DEFAULT_RUBRIC: RubricCriterion[] = [
  {
    key: 'communication',
    label: 'Giao tiếp & lắng nghe',
    description: 'Khả năng diễn đạt rõ ràng, đặt câu hỏi đúng, lắng nghe chủ động.',
    weight: 30,
  },
  {
    key: 'empathy',
    label: 'Đồng cảm & quản lý cảm xúc',
    description: 'Cảm nhận và phản hồi đúng cảm xúc của đối phương, giữ bình tĩnh.',
    weight: 25,
  },
  {
    key: 'problem_solving',
    label: 'Giải quyết vấn đề',
    description: 'Đưa ra giải pháp khả thi, có cấu trúc; cân nhắc nhiều phương án.',
    weight: 25,
  },
  {
    key: 'professionalism',
    label: 'Tác phong chuyên nghiệp',
    description: 'Giữ thái độ tích cực, tôn trọng, đúng chuẩn mực doanh nghiệp.',
    weight: 20,
  },
];

// ========================
// Helpers
// ========================

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringArray = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : fallback;

const stripJsonFence = (value: string): string => {
  let cleaned = value.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
};

const parseJsonObject = (value: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(stripJsonFence(value));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const clampScore = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
};

const normalizeBand = (
  value: unknown,
  overall: number,
): 'excellent' | 'good' | 'needs_improvement' | 'poor' => {
  if (
    value === 'excellent' ||
    value === 'good' ||
    value === 'needs_improvement' ||
    value === 'poor'
  ) {
    return value;
  }
  if (overall >= 85) return 'excellent';
  if (overall >= 70) return 'good';
  if (overall >= 50) return 'needs_improvement';
  return 'poor';
};

const sanitizeRubric = (raw: unknown): RubricCriterion[] => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_RUBRIC;
  }

  const criteria: RubricCriterion[] = raw
    .filter(isRecord)
    .map((item, idx) => ({
      key:
        typeof item['key'] === 'string' && item['key'].trim().length > 0
          ? (item['key'] as string).trim()
          : `criterion_${idx + 1}`,
      label:
        typeof item['label'] === 'string' && item['label'].trim().length > 0
          ? (item['label'] as string).trim()
          : `Tiêu chí ${idx + 1}`,
      description:
        typeof item['description'] === 'string' ? (item['description'] as string).trim() : '',
      weight:
        typeof item['weight'] === 'number' && Number.isFinite(item['weight'])
          ? Math.max(1, Math.min(100, Math.round(item['weight'] as number)))
          : 25,
    }))
    .slice(0, 8);

  if (criteria.length === 0) return DEFAULT_RUBRIC;

  // Renormalize weights to sum to 100
  const total = criteria.reduce((acc, c) => acc + c.weight, 0);
  if (total <= 0) {
    const even = Math.round(100 / criteria.length);
    criteria.forEach((c) => (c.weight = even));
  } else if (total !== 100) {
    criteria.forEach((c) => (c.weight = Math.round((c.weight / total) * 100)));
  }

  return criteria;
};

const sanitizeObjectives = (raw: unknown): string[] => {
  return stringArray(raw)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, 8);
};

const toScenarioSummary = (s: RoleplayScenario): ScenarioSummary => ({
  id: s.id.toString(),
  slug: s.slug,
  title: s.title,
  description: s.description,
  personaName: s.personaName,
  personaRole: s.personaRole,
  personaTone: s.personaTone,
  difficulty: s.difficulty,
  category: s.category,
  estimatedMinutes: s.estimatedMinutes,
  maxTurns: s.maxTurns,
  language: s.language,
  voiceHint: s.voiceHint,
  objectives: sanitizeObjectives(s.objectives),
  rubric: sanitizeRubric(s.evaluationRubric),
  isActive: s.isActive,
});

const toScenarioDetail = (s: RoleplayScenario): ScenarioDetail => ({
  ...toScenarioSummary(s),
  context: s.context,
  openingLine: s.openingLine,
});

const turnRoleFromDb = (role: string): 'user' | 'assistant' | 'system' => {
  if (role === 'user' || role === 'assistant' || role === 'system') return role;
  return 'system';
};

interface RawTurn {
  id: bigint;
  role: string;
  content: string;
  orderIndex: number;
  createdAt: Date;
}

const toTurnSummary = (turn: RawTurn): TurnSummary => ({
  id: turn.id.toString(),
  role: turnRoleFromDb(turn.role),
  content: turn.content,
  orderIndex: turn.orderIndex,
  createdAt: turn.createdAt.toISOString(),
});

interface RawEvaluation {
  id: bigint;
  sessionId: bigint;
  overallScore: number;
  band: string;
  criterionScores: Prisma.JsonValue;
  strengths: Prisma.JsonValue;
  improvements: Prisma.JsonValue;
  summary: string;
  createdAt: Date;
}

const sanitizeCriterionScores = (raw: unknown): CriterionScore[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item) => ({
      key: typeof item['key'] === 'string' ? item['key'] : '',
      label: typeof item['label'] === 'string' ? item['label'] : '',
      score: clampScore(item['score']),
      max: clampScore(item['max'] ?? 100),
      feedback: typeof item['feedback'] === 'string' ? item['feedback'] : '',
    }))
    .filter((c) => c.key.length > 0);
};

const toEvaluationSummary = (evaluation: RawEvaluation): EvaluationSummary => ({
  id: evaluation.id.toString(),
  sessionId: evaluation.sessionId.toString(),
  overallScore: clampScore(evaluation.overallScore),
  band: normalizeBand(evaluation.band, clampScore(evaluation.overallScore)),
  criterionScores: sanitizeCriterionScores(evaluation.criterionScores),
  strengths: stringArray(evaluation.strengths),
  improvements: stringArray(evaluation.improvements),
  summary: evaluation.summary,
  createdAt: evaluation.createdAt.toISOString(),
});

// ========================
// Scenario CRUD
// ========================

export const listActiveScenarios = async (userId: bigint): Promise<ScenarioListItem[]> => {
  const scenarios = await prisma.roleplayScenario.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { difficulty: 'asc' }, { createdAt: 'asc' }],
  });

  if (scenarios.length === 0) return [];

  const scenarioIds = scenarios.map((s) => s.id);

  const sessions = await prisma.roleplaySession.findMany({
    where: { userId, scenarioId: { in: scenarioIds } },
    select: {
      scenarioId: true,
      evaluation: {
        select: { overallScore: true },
      },
    },
  });

  const stats = new Map<string, { attempts: number; best: number | null }>();
  for (const s of sessions) {
    const key = s.scenarioId.toString();
    const current = stats.get(key) ?? { attempts: 0, best: null };
    current.attempts += 1;
    if (s.evaluation) {
      const score = s.evaluation.overallScore;
      if (current.best === null || score > current.best) current.best = score;
    }
    stats.set(key, current);
  }

  return scenarios.map((s) => {
    const stat = stats.get(s.id.toString()) ?? { attempts: 0, best: null };
    return {
      ...toScenarioSummary(s),
      attemptCount: stat.attempts,
      bestScore: stat.best,
    };
  });
};

export const listAllScenarios = async (): Promise<ScenarioDetail[]> => {
  const scenarios = await prisma.roleplayScenario.findMany({
    orderBy: [{ isActive: 'desc' }, { category: 'asc' }, { createdAt: 'asc' }],
  });
  return scenarios.map(toScenarioDetail);
};

export const getScenarioById = async (id: bigint): Promise<ScenarioDetail> => {
  const scenario = await prisma.roleplayScenario.findUnique({ where: { id } });
  if (!scenario) {
    throw new AppError('Tình huống roleplay không tồn tại.', 404);
  }
  return toScenarioDetail(scenario);
};

export interface CreateScenarioInput {
  slug: string;
  title: string;
  description: string;
  personaName: string;
  personaRole: string;
  personaTone?: string;
  context: string;
  openingLine: string;
  objectives?: string[];
  evaluationRubric?: RubricCriterion[];
  difficulty?: string;
  category?: string;
  estimatedMinutes?: number;
  maxTurns?: number;
  language?: string;
  voiceHint?: string | null;
  isActive?: boolean;
}

export const createScenario = async (
  input: CreateScenarioInput,
  createdById: bigint,
): Promise<ScenarioDetail> => {
  const existing = await prisma.roleplayScenario.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    throw new AppError('Slug này đã tồn tại, vui lòng chọn slug khác.', 409);
  }

  const created = await prisma.roleplayScenario.create({
    data: {
      slug: input.slug,
      title: input.title,
      description: input.description,
      personaName: input.personaName,
      personaRole: input.personaRole,
      personaTone: input.personaTone ?? 'neutral',
      context: input.context,
      openingLine: input.openingLine,
      objectives: sanitizeObjectives(input.objectives ?? []) as unknown as Prisma.InputJsonValue,
      evaluationRubric: sanitizeRubric(
        input.evaluationRubric ?? [],
      ) as unknown as Prisma.InputJsonValue,
      difficulty: input.difficulty ?? 'medium',
      category: input.category ?? 'communication',
      estimatedMinutes: input.estimatedMinutes ?? 8,
      maxTurns: input.maxTurns ?? 12,
      language: input.language ?? 'vi',
      voiceHint: input.voiceHint ?? null,
      isActive: input.isActive ?? true,
      createdById,
    },
  });

  return toScenarioDetail(created);
};

export type UpdateScenarioInput = Partial<CreateScenarioInput>;

export const updateScenario = async (
  id: bigint,
  input: UpdateScenarioInput,
): Promise<ScenarioDetail> => {
  const existing = await prisma.roleplayScenario.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Tình huống roleplay không tồn tại.', 404);
  }

  if (input.slug && input.slug !== existing.slug) {
    const dup = await prisma.roleplayScenario.findUnique({ where: { slug: input.slug } });
    if (dup) throw new AppError('Slug này đã tồn tại.', 409);
  }

  const data: Prisma.RoleplayScenarioUpdateInput = {};
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.personaName !== undefined) data.personaName = input.personaName;
  if (input.personaRole !== undefined) data.personaRole = input.personaRole;
  if (input.personaTone !== undefined) data.personaTone = input.personaTone;
  if (input.context !== undefined) data.context = input.context;
  if (input.openingLine !== undefined) data.openingLine = input.openingLine;
  if (input.objectives !== undefined) data.objectives = sanitizeObjectives(input.objectives);
  if (input.evaluationRubric !== undefined)
    data.evaluationRubric = sanitizeRubric(
      input.evaluationRubric,
    ) as unknown as Prisma.InputJsonValue;
  if (input.difficulty !== undefined) data.difficulty = input.difficulty;
  if (input.category !== undefined) data.category = input.category;
  if (input.estimatedMinutes !== undefined) data.estimatedMinutes = input.estimatedMinutes;
  if (input.maxTurns !== undefined) data.maxTurns = input.maxTurns;
  if (input.language !== undefined) data.language = input.language;
  if (input.voiceHint !== undefined) data.voiceHint = input.voiceHint;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const updated = await prisma.roleplayScenario.update({ where: { id }, data });
  return toScenarioDetail(updated);
};

export const deleteScenario = async (id: bigint): Promise<void> => {
  const existing = await prisma.roleplayScenario.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Tình huống roleplay không tồn tại.', 404);
  }
  await prisma.roleplayScenario.delete({ where: { id } });
};

// ========================
// Session lifecycle
// ========================

export const startSession = async (
  userId: bigint,
  scenarioId: bigint,
): Promise<{ session: SessionSummary; openingTurn: TurnSummary }> => {
  await ensureModuleEnabled('chatbot', 'Voice Roleplay');

  const scenario = await prisma.roleplayScenario.findUnique({
    where: { id: scenarioId },
  });
  if (!scenario || !scenario.isActive) {
    throw new AppError('Tình huống roleplay không tồn tại hoặc đã bị tắt.', 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    const session = await tx.roleplaySession.create({
      data: {
        scenarioId,
        userId,
        status: 'in_progress',
      },
    });

    const opening = await tx.roleplayTurn.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: scenario.openingLine,
        orderIndex: 0,
      },
    });

    return { session, opening };
  });

  const summary: SessionSummary = {
    id: result.session.id.toString(),
    scenarioId: scenarioId.toString(),
    status: result.session.status,
    startedAt: result.session.startedAt.toISOString(),
    endedAt: null,
    scenario: toScenarioSummary(scenario),
    turnCount: 1,
    evaluation: null,
  };

  return { session: summary, openingTurn: toTurnSummary(result.opening) };
};

const buildHistoryForGemini = (turns: RawTurn[]) =>
  turns
    .filter((t) => t.role === 'user' || t.role === 'assistant')
    .map((t) => ({
      role: t.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: t.content }],
    }));

export const sendUserTurn = async (
  userId: bigint,
  sessionId: bigint,
  message: string,
): Promise<TurnResponse> => {
  await ensureModuleEnabled('chatbot', 'Voice Roleplay');
  const cfg = await getEffectiveConfig();

  const session = await prisma.roleplaySession.findUnique({
    where: { id: sessionId },
    include: { scenario: true, turns: { orderBy: { orderIndex: 'asc' } } },
  });

  if (!session) {
    throw new AppError('Phiên roleplay không tồn tại.', 404);
  }
  if (session.userId !== userId) {
    throw new AppError('Bạn không có quyền truy cập phiên này.', 403);
  }
  if (session.status !== 'in_progress') {
    throw new AppError('Phiên này đã kết thúc.', 400);
  }

  const userTurnsCount = session.turns.filter((t) => t.role === 'user').length;
  if (userTurnsCount >= session.scenario.maxTurns) {
    throw new AppError(
      `Đã đạt giới hạn ${session.scenario.maxTurns} lượt cho tình huống này. Hãy kết thúc phiên để xem đánh giá.`,
      400,
    );
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    throw new AppError('Tin nhắn không được để trống.', 400);
  }

  const lastIndex =
    session.turns.length > 0 ? session.turns[session.turns.length - 1].orderIndex : -1;

  const historyAfterUser = [
    ...buildHistoryForGemini(session.turns),
    { role: 'user', parts: [{ text: trimmedMessage }] },
  ];

  // Call Gemini BEFORE persisting any turn. If AI fails, throw — do NOT
  // pollute transcript with a fake apology turn that would corrupt the
  // persona context for subsequent calls.
  let aiContent: string;
  try {
    const response = await genAI.models.generateContent({
      model: cfg.chatModel,
      contents: historyAfterUser,
      config: {
        systemInstruction: buildPersonaSystemPrompt(session.scenario),
        temperature: 0.85,
        maxOutputTokens: 512,
      },
    });
    aiContent = response.text?.trim() ?? '';
  } catch (error) {
    logger.error('Roleplay AI turn error:', error);
    throw new AppError('AI đang tạm thời không phản hồi. Vui lòng thử lại sau giây lát.', 503);
  }

  if (!aiContent) {
    throw new AppError('AI chưa trả lời được. Vui lòng thử gửi lại luợt thoại.', 503);
  }

  // Persist user turn + AI turn atomically AFTER AI succeeded.
  const aiTurn = await prisma.$transaction(async (tx) => {
    await tx.roleplayTurn.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: trimmedMessage,
        orderIndex: lastIndex + 1,
      },
    });
    return tx.roleplayTurn.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: aiContent,
        orderIndex: lastIndex + 2,
      },
    });
  });

  const newUserTurnsCount = userTurnsCount + 1;
  const remaining = Math.max(0, session.scenario.maxTurns - newUserTurnsCount);

  return {
    turn: toTurnSummary(aiTurn),
    shouldEnd: remaining === 0,
    remainingTurns: remaining,
  };
};

interface EvaluationPayload {
  overallScore: number;
  band: string;
  criterionScores: CriterionScore[];
  strengths: string[];
  improvements: string[];
  summary: string;
}

const computeWeightedOverall = (
  criterionScores: CriterionScore[],
  rubric: RubricCriterion[],
): number => {
  if (criterionScores.length === 0) return 0;
  const weightMap = new Map<string, number>();
  rubric.forEach((c) => weightMap.set(c.key, c.weight));
  let totalWeight = 0;
  let weighted = 0;
  for (const cs of criterionScores) {
    const w = weightMap.get(cs.key) ?? 0;
    if (w <= 0) continue;
    weighted += cs.score * w;
    totalWeight += w;
  }
  if (totalWeight === 0) {
    const avg = criterionScores.reduce((acc, c) => acc + c.score, 0) / criterionScores.length;
    return clampScore(avg);
  }
  return clampScore(weighted / totalWeight);
};

const evaluateWithGemini = async (
  scenario: RoleplayScenario,
  turns: RawTurn[],
): Promise<EvaluationPayload> => {
  const cfg = await getEffectiveConfig();
  const rubric = sanitizeRubric(scenario.evaluationRubric);
  const objectives = sanitizeObjectives(scenario.objectives);

  const transcript = turns
    .filter((t) => t.role === 'user' || t.role === 'assistant')
    .map((t) => `[${t.role === 'user' ? 'Người học' : scenario.personaName}] ${t.content}`)
    .join('\n');

  const userTurnCount = turns.filter((t) => t.role === 'user').length;

  const userPrompt = `**Tình huống:** ${scenario.title}
**Persona AI đóng:** ${scenario.personaName} — ${scenario.personaRole}
**Bối cảnh:** ${scenario.context}
**Mục tiêu người học cần đạt:**
${objectives.length > 0 ? objectives.map((o) => `- ${o}`).join('\n') : '- (Không cụ thể)'}

**Rubric (KHÔNG được đổi key/label):**
${rubric.map((c) => `- key="${c.key}" label="${c.label}" weight=${c.weight} — ${c.description}`).join('\n')}

**Số lượt nói của người học:** ${userTurnCount}

**Transcript:**
${transcript || '(Không có lượt nào)'}

Hãy chấm theo schema JSON đã quy định. Nhớ: \`criterionScores[*].key\` và \`label\` PHẢI khớp với rubric trên.`;

  const fallback = (): EvaluationPayload => {
    const baseScore = userTurnCount === 0 ? 0 : Math.max(35, 60 - (12 - userTurnCount) * 2);
    const criterionScores: CriterionScore[] = rubric.map((c) => ({
      key: c.key,
      label: c.label,
      score: baseScore,
      max: 100,
      feedback:
        'Hệ thống chưa thể đánh giá chi tiết tiêu chí này. Hãy thử lại buổi roleplay để nhận feedback đầy đủ.',
    }));
    const overallScore = computeWeightedOverall(criterionScores, rubric);
    return {
      overallScore,
      band: 'needs_improvement',
      criterionScores,
      strengths: [],
      improvements: [
        'Thử lại buổi roleplay với nhiều lượt trao đổi hơn để có dữ liệu đánh giá đầy đủ.',
      ],
      summary:
        userTurnCount === 0
          ? 'Bạn chưa có lượt nói nào trong phiên này nên chưa thể đánh giá thực chất.'
          : 'Hệ thống chưa hoàn tất đánh giá chi tiết, nhưng phiên đã được lưu lại.',
    };
  };

  try {
    const response = await genAI.models.generateContent({
      model: cfg.chatModel,
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: userPrompt }],
        },
      ],
      config: {
        systemInstruction: EVALUATION_SYSTEM_PROMPT,
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonObject(response.text ?? '');
    if (!parsed) {
      logger.warn('Roleplay evaluation: failed to parse JSON, using fallback.');
      return fallback();
    }

    const rawCriteria = sanitizeCriterionScores(parsed['criterionScores']);
    // Ensure every rubric criterion is present; fill missing with 0
    const merged: CriterionScore[] = rubric.map((c) => {
      const found = rawCriteria.find((rc) => rc.key === c.key);
      if (found) {
        return { ...found, label: c.label, max: 100 };
      }
      return {
        key: c.key,
        label: c.label,
        score: 0,
        max: 100,
        feedback: 'Không có dữ liệu để đánh giá tiêu chí này.',
      };
    });

    const overall = clampScore(parsed['overallScore'] ?? computeWeightedOverall(merged, rubric));
    const recomputed = computeWeightedOverall(merged, rubric);
    // Re-derive overall if AI's number diverges by >10 points from weighted average
    const overallScore = Math.abs(overall - recomputed) > 10 ? recomputed : overall;
    const band = normalizeBand(parsed['band'], overallScore);
    const strengths = stringArray(parsed['strengths']).slice(0, 5);
    const improvements = stringArray(parsed['improvements']).slice(0, 5);
    const summary =
      typeof parsed['summary'] === 'string' && parsed['summary'].trim().length > 0
        ? (parsed['summary'] as string).trim()
        : 'Buổi roleplay đã được ghi nhận. Xem chi tiết từng tiêu chí bên dưới.';

    return {
      overallScore,
      band,
      criterionScores: merged,
      strengths,
      improvements,
      summary,
    };
  } catch (error) {
    logger.error('Roleplay evaluation error:', error);
    return fallback();
  }
};

export const endSession = async (
  userId: bigint,
  sessionId: bigint,
): Promise<{ session: SessionDetail; evaluation: EvaluationSummary }> => {
  // NOTE: Intentionally do NOT call ensureModuleEnabled here. A user must
  // always be able to end their in‑progress session and view results, even
  // if an admin disables the chatbot module mid‑session. evaluateWithGemini
  // already provides a deterministic fallback if AI is unavailable.
  const session = await prisma.roleplaySession.findUnique({
    where: { id: sessionId },
    include: {
      scenario: true,
      turns: { orderBy: { orderIndex: 'asc' } },
      evaluation: true,
    },
  });

  if (!session) {
    throw new AppError('Phiên roleplay không tồn tại.', 404);
  }
  if (session.userId !== userId) {
    throw new AppError('Bạn không có quyền truy cập phiên này.', 403);
  }

  // Idempotency: if already evaluated, return existing
  if (session.evaluation) {
    return {
      session: await getSessionDetail(userId, sessionId),
      evaluation: toEvaluationSummary(session.evaluation),
    };
  }

  const payload = await evaluateWithGemini(session.scenario, session.turns);

  const evaluation = await prisma.$transaction(async (tx) => {
    await tx.roleplaySession.update({
      where: { id: session.id },
      data: { status: 'completed', endedAt: new Date() },
    });

    return tx.roleplayEvaluation.create({
      data: {
        sessionId: session.id,
        overallScore: payload.overallScore,
        band: payload.band,
        criterionScores: payload.criterionScores as unknown as Prisma.InputJsonValue,
        strengths: payload.strengths as unknown as Prisma.InputJsonValue,
        improvements: payload.improvements as unknown as Prisma.InputJsonValue,
        summary: payload.summary,
      },
    });
  });

  return {
    session: await getSessionDetail(userId, sessionId),
    evaluation: toEvaluationSummary(evaluation),
  };
};

export const abandonSession = async (userId: bigint, sessionId: bigint): Promise<SessionDetail> => {
  const session = await prisma.roleplaySession.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, status: true },
  });
  if (!session) throw new AppError('Phiên roleplay không tồn tại.', 404);
  if (session.userId !== userId) throw new AppError('Không có quyền.', 403);
  if (session.status !== 'in_progress') {
    return getSessionDetail(userId, sessionId);
  }
  await prisma.roleplaySession.update({
    where: { id: session.id },
    data: { status: 'abandoned', endedAt: new Date() },
  });
  return getSessionDetail(userId, sessionId);
};

// ========================
// Session retrieval
// ========================

export const getSessionDetail = async (
  userId: bigint,
  sessionId: bigint,
): Promise<SessionDetail> => {
  const session = await prisma.roleplaySession.findUnique({
    where: { id: sessionId },
    include: {
      scenario: true,
      turns: { orderBy: { orderIndex: 'asc' } },
      evaluation: true,
    },
  });

  if (!session) {
    throw new AppError('Phiên roleplay không tồn tại.', 404);
  }
  if (session.userId !== userId) {
    throw new AppError('Bạn không có quyền truy cập phiên này.', 403);
  }

  return {
    id: session.id.toString(),
    scenarioId: session.scenarioId.toString(),
    status: session.status,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
    scenario: toScenarioSummary(session.scenario),
    turnCount: session.turns.length,
    turns: session.turns.map(toTurnSummary),
    evaluation: session.evaluation ? toEvaluationSummary(session.evaluation) : null,
  };
};

export const listMySessions = async (
  userId: bigint,
  scenarioId?: bigint,
): Promise<SessionSummary[]> => {
  const where: Prisma.RoleplaySessionWhereInput = { userId };
  if (scenarioId) where.scenarioId = scenarioId;

  const sessions = await prisma.roleplaySession.findMany({
    where,
    include: {
      scenario: true,
      _count: { select: { turns: true } },
      evaluation: true,
    },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });

  return sessions.map((s) => ({
    id: s.id.toString(),
    scenarioId: s.scenarioId.toString(),
    status: s.status,
    startedAt: s.startedAt.toISOString(),
    endedAt: s.endedAt?.toISOString() ?? null,
    scenario: toScenarioSummary(s.scenario),
    turnCount: s._count.turns,
    evaluation: s.evaluation ? toEvaluationSummary(s.evaluation) : null,
  }));
};

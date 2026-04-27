import {
  question_kind,
  type AdaptiveQuizSession,
  type Prisma,
  type Question,
  type QuestionOption,
} from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils';

// ============================================================
// Adaptive Quiz Service (P2.1)
//
// Algorithm: Elo-style ability estimate over discrete difficulty (1..5).
//   - Each item has difficulty d in [1..5].
//   - User has ability θ that floats in [0..5] (start 2.5).
//   - Expected probability of correct: p = 1 / (1 + 10^((d - θ) / 1.5))
//   - After answer (1=correct, 0=wrong): θ' = θ + K * (correct - p), K=0.7
//     bounded to [0, 5].
//   - Next difficulty = clamp(round(θ + 0.5 if last correct else -0.5), 1..5)
//     (also fall back to nearest available difficulty in the bank).
// ============================================================

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;
const DEFAULT_MAX_QUESTIONS = 10;
const STARTING_ABILITY = 2.5;
const K_FACTOR = 0.7;
const ELIGIBLE_QUESTION_TYPES: question_kind[] = [
  question_kind.single_choice,
  question_kind.multiple_choice,
];

const expectedCorrect = (ability: number, difficulty: number) =>
  1 / (1 + Math.pow(10, (difficulty - ability) / 1.5));

const updateAbility = (ability: number, difficulty: number, correct: boolean) => {
  const expected = expectedCorrect(ability, difficulty);
  const next = ability + K_FACTOR * ((correct ? 1 : 0) - expected);
  return Math.min(MAX_DIFFICULTY, Math.max(0, next));
};

const pickNextDifficulty = (ability: number, lastCorrect: boolean | null) => {
  const base = lastCorrect === null ? ability : ability + (lastCorrect ? 0.5 : -0.5);
  const rounded = Math.round(base);
  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, rounded));
};

const bandFromAbility = (ability: number): string => {
  if (ability < 1.5) return 'Beginner';
  if (ability < 2.5) return 'Pre-Intermediate';
  if (ability < 3.5) return 'Intermediate';
  if (ability < 4.5) return 'Advanced';
  return 'Expert';
};

interface AdaptiveBankSummary {
  id: string;
  title: string;
  description: string | null;
  questionCount: number;
  difficultyCoverage: number[];
  category: { id: string; name: string } | null;
}

interface AdaptiveQuestionView {
  id: string;
  content: string;
  difficulty: number;
  questionType: string;
  options: Array<{ id: string; content: string; orderIndex: number }>;
}

interface AdaptiveItemView {
  id: string;
  orderIndex: number;
  difficulty: number;
  isCorrect: boolean;
  abilityBefore: number;
  abilityAfter: number;
  selectedOptionIds: string[];
  question: {
    id: string;
    content: string;
    explanation: string | null;
    options: Array<{ id: string; content: string; isCorrect: boolean; orderIndex: number }>;
  };
}

interface AdaptiveSessionView {
  id: string;
  questionBankId: string;
  questionBankTitle: string;
  status: string;
  maxQuestions: number;
  answeredCount: number;
  correctCount: number;
  abilityScore: number;
  currentDifficulty: number;
  band: string;
  startedAt: string;
  completedAt: string | null;
  /** the next un-answered item already pre-allocated */
  currentItem: { itemId: string; orderIndex: number; question: AdaptiveQuestionView } | null;
  /** answered items so far (for review on the live page) */
  answeredItems: AdaptiveItemView[];
}

interface AdaptiveSessionSummary {
  id: string;
  questionBankId: string;
  questionBankTitle: string;
  status: string;
  abilityScore: number;
  band: string;
  correctCount: number;
  answeredCount: number;
  maxQuestions: number;
  startedAt: string;
  completedAt: string | null;
}

const serializeBigInt = (v: bigint | string): string =>
  typeof v === 'bigint' ? v.toString() : String(v);

const toQuestionView = (q: Question & { options: QuestionOption[] }): AdaptiveQuestionView => ({
  id: serializeBigInt(q.id),
  content: q.content,
  difficulty: q.difficulty,
  questionType: q.questionType,
  options: q.options
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((o) => ({
      id: serializeBigInt(o.id),
      content: o.content,
      orderIndex: o.orderIndex,
    })),
});

const toItemView = (item: {
  id: bigint;
  orderIndex: number;
  difficulty: number;
  isCorrect: boolean;
  abilityBefore: number;
  abilityAfter: number;
  selectedOptions: Prisma.JsonValue | null;
  question: Question & { options: QuestionOption[] };
}): AdaptiveItemView => {
  const selected = Array.isArray(item.selectedOptions)
    ? (item.selectedOptions as unknown[]).map((v) => String(v))
    : [];
  return {
    id: serializeBigInt(item.id),
    orderIndex: item.orderIndex,
    difficulty: item.difficulty,
    isCorrect: item.isCorrect,
    abilityBefore: Number(item.abilityBefore.toFixed(3)),
    abilityAfter: Number(item.abilityAfter.toFixed(3)),
    selectedOptionIds: selected,
    question: {
      id: serializeBigInt(item.question.id),
      content: item.question.content,
      explanation: item.question.explanation,
      options: item.question.options
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((o) => ({
          id: serializeBigInt(o.id),
          content: o.content,
          isCorrect: o.isCorrect,
          orderIndex: o.orderIndex,
        })),
    },
  };
};

const toSessionSummary = (
  s: AdaptiveQuizSession & { questionBank: { title: string } },
): AdaptiveSessionSummary => ({
  id: serializeBigInt(s.id),
  questionBankId: serializeBigInt(s.questionBankId),
  questionBankTitle: s.questionBank.title,
  status: s.status,
  abilityScore: Number(s.abilityScore.toFixed(3)),
  band: s.band ?? bandFromAbility(s.abilityScore),
  correctCount: s.correctCount,
  answeredCount: s.answeredCount,
  maxQuestions: s.maxQuestions,
  startedAt: s.startedAt.toISOString(),
  completedAt: s.completedAt?.toISOString() ?? null,
});

// ----- Bank discovery -----

type BankWithQuestions = Prisma.QuestionBankGetPayload<{
  include: {
    category: { select: { id: true; name: true } };
    questions: { select: { id: true; difficulty: true } };
  };
}>;

export const listEligibleBanks = async (): Promise<AdaptiveBankSummary[]> => {
  const banks = (await prisma.questionBank.findMany({
    where: { isActive: true },
    include: {
      category: { select: { id: true, name: true } },
      questions: {
        where: {
          isActive: true,
          questionType: { in: ELIGIBLE_QUESTION_TYPES },
        },
        select: { id: true, difficulty: true },
      },
    },
    orderBy: { title: 'asc' },
  })) as BankWithQuestions[];

  return banks
    .map((b) => {
      const difficulties = Array.from(new Set(b.questions.map((q) => q.difficulty))).sort(
        (a, x) => a - x,
      );
      return {
        id: serializeBigInt(b.id),
        title: b.title,
        description: b.description,
        questionCount: b.questions.length,
        difficultyCoverage: difficulties,
        category: b.category ? { id: serializeBigInt(b.category.id), name: b.category.name } : null,
      };
    })
    .filter((b) => b.questionCount >= 5 && b.difficultyCoverage.length >= 2);
};

// ----- Question selection -----

const pickNextQuestion = async (
  sessionId: bigint,
  bankId: bigint,
  desiredDifficulty: number,
): Promise<(Question & { options: QuestionOption[] }) | null> => {
  const askedIds = await prisma.adaptiveQuizItem.findMany({
    where: { sessionId },
    select: { questionId: true },
  });
  const skipIds = askedIds.map((a) => a.questionId);

  // Try desired difficulty, then radiate outward (±1, ±2, …) until one is found
  for (let delta = 0; delta <= MAX_DIFFICULTY - MIN_DIFFICULTY; delta += 1) {
    const candidates = Array.from(
      new Set(
        [desiredDifficulty + delta, desiredDifficulty - delta].filter(
          (d) => d >= MIN_DIFFICULTY && d <= MAX_DIFFICULTY,
        ),
      ),
    );
    for (const d of candidates) {
      const found = await prisma.question.findFirst({
        where: {
          questionBankId: bankId,
          difficulty: d,
          isActive: true,
          questionType: { in: ELIGIBLE_QUESTION_TYPES },
          id: { notIn: skipIds.length > 0 ? skipIds : [BigInt(-1)] },
        },
        include: { options: true },
        orderBy: { id: 'asc' },
      });
      if (found) return found;
    }
  }
  return null;
};

// ----- Session lifecycle -----

const ensureSessionOwnedBy = async (sessionId: bigint, userId: bigint) => {
  const session = await prisma.adaptiveQuizSession.findUnique({
    where: { id: sessionId },
    include: {
      questionBank: { select: { title: true } },
    },
  });
  if (!session) throw new AppError('Không tìm thấy phiên thi', 404);
  if (session.userId !== userId) throw new AppError('Không có quyền truy cập phiên thi', 403);
  return session;
};

const buildSessionView = async (sessionId: bigint): Promise<AdaptiveSessionView> => {
  const session = await prisma.adaptiveQuizSession.findUnique({
    where: { id: sessionId },
    include: {
      questionBank: { select: { title: true } },
      items: {
        include: { question: { include: { options: true } } },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });
  if (!session) throw new AppError('Không tìm thấy phiên thi', 404);

  const answered = session.items.filter((i) => i.answeredAt);
  const pending = session.items.find((i) => !i.answeredAt);

  let currentItem: AdaptiveSessionView['currentItem'] = null;
  if (pending) {
    currentItem = {
      itemId: serializeBigInt(pending.id),
      orderIndex: pending.orderIndex,
      question: toQuestionView(pending.question),
    };
  }

  return {
    id: serializeBigInt(session.id),
    questionBankId: serializeBigInt(session.questionBankId),
    questionBankTitle: session.questionBank.title,
    status: session.status,
    maxQuestions: session.maxQuestions,
    answeredCount: session.answeredCount,
    correctCount: session.correctCount,
    abilityScore: Number(session.abilityScore.toFixed(3)),
    currentDifficulty: session.currentDifficulty,
    band: session.band ?? bandFromAbility(session.abilityScore),
    startedAt: session.startedAt.toISOString(),
    completedAt: session.completedAt?.toISOString() ?? null,
    currentItem,
    answeredItems: answered.map((i) =>
      toItemView({
        ...i,
        question: i.question,
      }),
    ),
  };
};

export const startSession = async (
  userId: bigint,
  input: { questionBankId: bigint; maxQuestions?: number },
): Promise<AdaptiveSessionView> => {
  const bank = await prisma.questionBank.findFirst({
    where: { id: input.questionBankId, isActive: true },
  });
  if (!bank) throw new AppError('Không tìm thấy ngân hàng câu hỏi', 404);

  const eligibleCount = await prisma.question.count({
    where: {
      questionBankId: bank.id,
      isActive: true,
      questionType: { in: ELIGIBLE_QUESTION_TYPES },
    },
  });
  if (eligibleCount < 5) {
    throw new AppError('Ngân hàng cần tối thiểu 5 câu trắc nghiệm để chạy adaptive quiz', 400);
  }

  const maxQuestions = Math.min(input.maxQuestions ?? DEFAULT_MAX_QUESTIONS, eligibleCount);

  const session = await prisma.adaptiveQuizSession.create({
    data: {
      userId,
      questionBankId: bank.id,
      status: 'in_progress',
      maxQuestions,
      currentDifficulty: 3,
      abilityScore: STARTING_ABILITY,
    },
  });

  // Pre-allocate first item so client gets a question on first GET.
  const first = await pickNextQuestion(session.id, bank.id, 3);
  if (first) {
    await prisma.adaptiveQuizItem.create({
      data: {
        sessionId: session.id,
        questionId: first.id,
        orderIndex: 0,
        difficulty: first.difficulty,
        abilityBefore: STARTING_ABILITY,
        abilityAfter: STARTING_ABILITY,
      },
    });
  }

  return buildSessionView(session.id);
};

export const getSession = async (
  sessionId: bigint,
  userId: bigint,
): Promise<AdaptiveSessionView> => {
  await ensureSessionOwnedBy(sessionId, userId);
  return buildSessionView(sessionId);
};

const optionIdsMatch = (selected: bigint[], correct: bigint[]): boolean => {
  if (selected.length !== correct.length) return false;
  const sortedSelected = [...selected].map((b) => b.toString()).sort();
  const sortedCorrect = [...correct].map((b) => b.toString()).sort();
  return sortedSelected.every((v, i) => v === sortedCorrect[i]);
};

export const submitAnswer = async (
  sessionId: bigint,
  userId: bigint,
  input: { itemId: bigint; selectedOptionIds: bigint[]; timeSpentMs?: number },
): Promise<AdaptiveSessionView> => {
  const session = await ensureSessionOwnedBy(sessionId, userId);
  if (session.status !== 'in_progress') {
    throw new AppError('Phiên thi đã kết thúc', 400);
  }

  const item = await prisma.adaptiveQuizItem.findUnique({
    where: { id: input.itemId },
    include: { question: { include: { options: true } } },
  });
  if (!item || item.sessionId !== session.id) {
    throw new AppError('Câu hỏi không thuộc phiên thi', 404);
  }
  if (item.answeredAt) {
    throw new AppError('Câu hỏi đã được trả lời', 400);
  }

  const correctOptionIds = item.question.options.filter((o) => o.isCorrect).map((o) => o.id);
  const correct = optionIdsMatch(input.selectedOptionIds, correctOptionIds);

  const abilityBefore = session.abilityScore;
  const abilityAfter = updateAbility(abilityBefore, item.difficulty, correct);
  const nextDifficulty = pickNextDifficulty(abilityAfter, correct);

  await prisma.$transaction(async (tx) => {
    await tx.adaptiveQuizItem.update({
      where: { id: item.id },
      data: {
        isCorrect: correct,
        selectedOptions: input.selectedOptionIds.map((id) => id.toString()),
        abilityBefore,
        abilityAfter,
        answeredAt: new Date(),
        timeSpentMs: input.timeSpentMs ?? null,
      },
    });

    await tx.adaptiveQuizSession.update({
      where: { id: session.id },
      data: {
        abilityScore: abilityAfter,
        currentDifficulty: nextDifficulty,
        correctCount: { increment: correct ? 1 : 0 },
        answeredCount: { increment: 1 },
      },
    });
  });

  // Decide whether to pre-allocate next question or auto-complete.
  const newAnsweredCount = session.answeredCount + 1;
  const reachedMax = newAnsweredCount >= session.maxQuestions;

  if (reachedMax) {
    await completeSession(session.id);
  } else {
    const next = await pickNextQuestion(session.id, session.questionBankId, nextDifficulty);
    if (next) {
      await prisma.adaptiveQuizItem.create({
        data: {
          sessionId: session.id,
          questionId: next.id,
          orderIndex: newAnsweredCount,
          difficulty: next.difficulty,
          abilityBefore: abilityAfter,
          abilityAfter,
        },
      });
    } else {
      // Bank exhausted — finalise.
      await completeSession(session.id);
    }
  }

  return buildSessionView(session.id);
};

const completeSession = async (sessionId: bigint) => {
  const s = await prisma.adaptiveQuizSession.findUnique({ where: { id: sessionId } });
  if (!s || s.status !== 'in_progress') return;
  await prisma.adaptiveQuizSession.update({
    where: { id: sessionId },
    data: {
      status: 'completed',
      band: bandFromAbility(s.abilityScore),
      completedAt: new Date(),
    },
  });
};

export const endSession = async (
  sessionId: bigint,
  userId: bigint,
): Promise<AdaptiveSessionView> => {
  const session = await ensureSessionOwnedBy(sessionId, userId);
  if (session.status === 'in_progress') {
    await completeSession(session.id);
  }
  return buildSessionView(sessionId);
};

export const abandonSession = async (
  sessionId: bigint,
  userId: bigint,
): Promise<AdaptiveSessionView> => {
  const session = await ensureSessionOwnedBy(sessionId, userId);
  if (session.status === 'in_progress') {
    await prisma.adaptiveQuizSession.update({
      where: { id: session.id },
      data: { status: 'abandoned', completedAt: new Date() },
    });
  }
  return buildSessionView(sessionId);
};

export const listMySessions = async (
  userId: bigint,
  filters: { status?: string; questionBankId?: bigint } = {},
): Promise<AdaptiveSessionSummary[]> => {
  const sessions = await prisma.adaptiveQuizSession.findMany({
    where: {
      userId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.questionBankId ? { questionBankId: filters.questionBankId } : {}),
    },
    include: { questionBank: { select: { title: true } } },
    orderBy: { startedAt: 'desc' },
    take: 50,
  });
  return sessions.map(toSessionSummary);
};

// ============================================================
// Admin (trainer/admin) — CRUD for adaptive bank tuning
// ============================================================

export interface AdminBankSummary {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  category: { id: string; name: string } | null;
  totalQuestions: number;
  eligibleQuestions: number;
  difficultyDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  isEligibleForAdaptive: boolean;
  updatedAt: string;
}

const emptyDistribution = (): Record<1 | 2 | 3 | 4 | 5, number> => ({
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
});

const clampDifficulty = (n: number) =>
  Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, Math.round(n)));

export const listAdminBanks = async (): Promise<AdminBankSummary[]> => {
  const banks = await prisma.questionBank.findMany({
    include: {
      category: { select: { id: true, name: true } },
      questions: {
        select: { id: true, difficulty: true, questionType: true, isActive: true },
      },
    },
    orderBy: { title: 'asc' },
  });

  return banks.map((b) => {
    const dist = emptyDistribution();
    let eligible = 0;
    for (const q of b.questions) {
      if (!q.isActive) continue;
      if (!ELIGIBLE_QUESTION_TYPES.includes(q.questionType)) continue;
      eligible += 1;
      const d = clampDifficulty(q.difficulty) as 1 | 2 | 3 | 4 | 5;
      dist[d] += 1;
    }
    const coverage = (Object.values(dist) as number[]).filter((c) => c > 0).length;
    return {
      id: serializeBigInt(b.id),
      title: b.title,
      description: b.description,
      isActive: b.isActive,
      category: b.category ? { id: serializeBigInt(b.category.id), name: b.category.name } : null,
      totalQuestions: b.questions.length,
      eligibleQuestions: eligible,
      difficultyDistribution: dist,
      isEligibleForAdaptive: eligible >= 5 && coverage >= 2,
      updatedAt: b.updatedAt.toISOString(),
    };
  });
};

export interface AdminBankDetail extends AdminBankSummary {
  questions: Array<{
    id: string;
    content: string;
    questionType: string;
    difficulty: number;
    isActive: boolean;
    optionsCount: number;
    correctOptionsCount: number;
  }>;
}

export const getAdminBank = async (bankId: bigint): Promise<AdminBankDetail> => {
  const bank = await prisma.questionBank.findUnique({
    where: { id: bankId },
    include: {
      category: { select: { id: true, name: true } },
      questions: {
        include: {
          options: { select: { id: true, isCorrect: true } },
        },
        orderBy: [{ difficulty: 'asc' }, { id: 'asc' }],
      },
    },
  });
  if (!bank) throw new AppError('Question bank not found', 404);

  const dist = emptyDistribution();
  let eligible = 0;
  for (const q of bank.questions) {
    if (!q.isActive) continue;
    if (!ELIGIBLE_QUESTION_TYPES.includes(q.questionType)) continue;
    eligible += 1;
    const d = clampDifficulty(q.difficulty) as 1 | 2 | 3 | 4 | 5;
    dist[d] += 1;
  }
  const coverage = (Object.values(dist) as number[]).filter((c) => c > 0).length;

  return {
    id: serializeBigInt(bank.id),
    title: bank.title,
    description: bank.description,
    isActive: bank.isActive,
    category: bank.category
      ? { id: serializeBigInt(bank.category.id), name: bank.category.name }
      : null,
    totalQuestions: bank.questions.length,
    eligibleQuestions: eligible,
    difficultyDistribution: dist,
    isEligibleForAdaptive: eligible >= 5 && coverage >= 2,
    updatedAt: bank.updatedAt.toISOString(),
    questions: bank.questions.map((q) => ({
      id: serializeBigInt(q.id),
      content: q.content,
      questionType: q.questionType,
      difficulty: q.difficulty,
      isActive: q.isActive,
      optionsCount: q.options.length,
      correctOptionsCount: q.options.filter((o) => o.isCorrect).length,
    })),
  };
};

export const bulkSetDifficulty = async (
  questionIds: bigint[],
  difficulty: number,
): Promise<{ updated: number }> => {
  const d = clampDifficulty(difficulty);
  if (questionIds.length === 0) {
    return { updated: 0 };
  }
  const result = await prisma.question.updateMany({
    where: { id: { in: questionIds } },
    data: { difficulty: d },
  });
  return { updated: result.count };
};

export type BankAutoStrategy = 'spread' | 'reset';

export const autoTuneBank = async (
  bankId: bigint,
  strategy: BankAutoStrategy,
): Promise<{ updated: number; strategy: BankAutoStrategy }> => {
  const bank = await prisma.questionBank.findUnique({
    where: { id: bankId },
    include: {
      questions: {
        where: {
          questionType: { in: ELIGIBLE_QUESTION_TYPES },
          isActive: true,
        },
        select: { id: true },
        orderBy: { id: 'asc' },
      },
    },
  });
  if (!bank) throw new AppError('Question bank not found', 404);

  if (strategy === 'reset') {
    const result = await prisma.question.updateMany({
      where: { id: { in: bank.questions.map((q) => q.id) } },
      data: { difficulty: 3 },
    });
    return { updated: result.count, strategy };
  }

  // Spread: round-robin assign difficulties 1..5 across the eligible questions
  await prisma.$transaction(
    bank.questions.map((q, i) =>
      prisma.question.update({
        where: { id: q.id },
        data: { difficulty: ((i % MAX_DIFFICULTY) + MIN_DIFFICULTY) as number },
      }),
    ),
  );
  return { updated: bank.questions.length, strategy };
};

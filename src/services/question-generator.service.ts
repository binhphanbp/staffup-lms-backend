import { prisma } from '@/config/database';
import { genAI, CHAT_MODEL, QUESTION_GENERATION_SYSTEM_PROMPT } from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';
import type {
  GenerateQuestionsInput,
  SaveAiQuestionsInput,
  DraftQuestionInput,
} from '@/schemas/question-generator.schema';

// ========================
// Types
// ========================

interface GeneratedOption {
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface GeneratedQuestion {
  tempId: string;
  questionType: 'single_choice' | 'multiple_choice' | 'essay';
  content: string;
  explanation: string | null;
  defaultPoints: number;
  options: GeneratedOption[];
}

interface GenerateResult {
  questions: GeneratedQuestion[];
  model: string;
  generatedAt: string;
}

// ========================
// Bank access guard (mirrors question.service.ts)
// ========================

async function assertBankAccess(bankId: string, userId: string, roleCodes: string[]) {
  const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(bankId) } });
  if (!bank) throw new AppError('Question bank not found', 404);
  const isAdmin = roleCodes.includes('admin');
  const isOwner = bank.ownerTrainerId.toString() === userId;
  if (!isAdmin && !isOwner) {
    throw new AppError('You do not have permission to access this bank', 403);
  }
  return bank;
}

// ========================
// Helpers
// ========================

const stripCodeFences = (raw: string): string => {
  let text = raw.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  return text.trim();
};

const generateTempId = (): string =>
  `ai-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildUserPrompt = (input: GenerateQuestionsInput): string => {
  const { topic, sourceContent, count, difficulty, questionTypes, language } = input;

  const langLabel = language === 'en' ? 'English' : 'Tiếng Việt';
  const difficultyLabel: Record<typeof difficulty, string> = {
    easy: 'Dễ — kiểm tra mức độ ghi nhớ và hiểu cơ bản.',
    medium: 'Trung bình — yêu cầu áp dụng kiến thức vào tình huống cụ thể.',
    hard: 'Khó — yêu cầu phân tích, tổng hợp, đánh giá.',
    mixed: 'Hỗn hợp — phối trộn các mức độ dễ, trung bình, khó.',
  };

  const lines: string[] = [];
  lines.push(`**Yêu cầu soạn đề:**`);
  lines.push(`- Số lượng câu hỏi: ${count}`);
  lines.push(`- Độ khó: ${difficultyLabel[difficulty]}`);
  lines.push(`- Loại câu hỏi cho phép: ${questionTypes.join(', ')}`);
  lines.push(`- Ngôn ngữ: ${langLabel}`);
  lines.push('');

  if (topic) {
    lines.push(`**Chủ đề / yêu cầu của giảng viên:**`);
    lines.push(topic);
    lines.push('');
  }

  if (sourceContent) {
    lines.push(`**Nội dung tài liệu nguồn (bám sát nội dung này để soạn):**`);
    lines.push('---');
    lines.push(sourceContent);
    lines.push('---');
    lines.push('');
  }

  lines.push(
    `Hãy sinh đúng ${count} câu hỏi, đa dạng loại trong ${questionTypes.join('/')}, và trả về JSON theo format đã quy định.`,
  );

  return lines.join('\n');
};

// Validate one generated question. Throws to drop invalid items.
const sanitizeQuestion = (raw: unknown): GeneratedQuestion | null => {
  if (!raw || typeof raw !== 'object') return null;
  const q = raw as Record<string, unknown>;

  const questionType = q.questionType;
  if (
    questionType !== 'single_choice' &&
    questionType !== 'multiple_choice' &&
    questionType !== 'essay'
  ) {
    return null;
  }

  const content = typeof q.content === 'string' ? q.content.trim() : '';
  if (content.length === 0) return null;

  const explanation =
    typeof q.explanation === 'string' && q.explanation.trim().length > 0
      ? q.explanation.trim()
      : null;

  const defaultPoints =
    typeof q.defaultPoints === 'number' && q.defaultPoints > 0 ? Math.floor(q.defaultPoints) : 1;

  let options: GeneratedOption[] = [];
  if (questionType !== 'essay') {
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    options = rawOptions
      .map((opt, idx): GeneratedOption | null => {
        if (!opt || typeof opt !== 'object') return null;
        const o = opt as Record<string, unknown>;
        const optContent = typeof o.content === 'string' ? o.content.trim() : '';
        if (optContent.length === 0) return null;
        const isCorrect = Boolean(o.isCorrect);
        const orderIndex =
          typeof o.orderIndex === 'number' && o.orderIndex > 0 ? Math.floor(o.orderIndex) : idx + 1;
        return { content: optContent, isCorrect, orderIndex };
      })
      .filter((o): o is GeneratedOption => o !== null);

    // Reindex sequentially to avoid duplicate orderIndex from the model
    options = options.map((opt, idx) => ({ ...opt, orderIndex: idx + 1 }));

    if (options.length < 2) return null;

    const correctCount = options.filter((o) => o.isCorrect).length;
    if (questionType === 'single_choice') {
      if (correctCount !== 1) {
        // If model produced 0 or many corrects, force exactly one (the first marked, else first option)
        const firstCorrectIdx = options.findIndex((o) => o.isCorrect);
        const correctIdx = firstCorrectIdx >= 0 ? firstCorrectIdx : 0;
        options = options.map((o, idx) => ({ ...o, isCorrect: idx === correctIdx }));
      }
    } else {
      // multiple_choice — ensure at least one correct
      if (correctCount < 1) {
        options = options.map((o, idx) => ({ ...o, isCorrect: idx === 0 }));
      }
    }
  }

  return {
    tempId: generateTempId(),
    questionType,
    content,
    explanation,
    defaultPoints,
    options,
  };
};

// ========================
// Service
// ========================

export class QuestionGeneratorService {
  /**
   * Generate a list of question drafts using Gemini AI.
   * The drafts are NOT persisted — caller must invoke `saveDrafts`
   * with the trainer-curated subset to actually create DB records.
   */
  static async generate(
    bankId: string,
    input: GenerateQuestionsInput,
    userId: string,
    roleCodes: string[],
  ): Promise<GenerateResult> {
    await assertBankAccess(bankId, userId, roleCodes);

    const userPrompt = buildUserPrompt(input);

    let aiResponse: string;
    try {
      const result = await genAI.models.generateContent({
        model: CHAT_MODEL,
        contents: [{ role: 'user' as const, parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: QUESTION_GENERATION_SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      });
      aiResponse = result.text ?? '';
    } catch (error) {
      logger.error(`Gemini question-generation error for bank ${bankId}:`, error);
      throw new AppError('Lỗi khi gọi AI sinh câu hỏi. Vui lòng thử lại.', 500);
    }

    let parsed: { questions?: unknown };
    try {
      parsed = JSON.parse(stripCodeFences(aiResponse));
    } catch {
      logger.error(`Failed to parse AI question generation response for bank ${bankId}`, {
        aiResponse,
      });
      throw new AppError('AI trả về dữ liệu không hợp lệ. Vui lòng thử lại với mô tả khác.', 502);
    }

    const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];
    const questions = rawQuestions
      .map(sanitizeQuestion)
      .filter((q): q is GeneratedQuestion => q !== null);

    if (questions.length === 0) {
      throw new AppError(
        'AI không sinh được câu hỏi hợp lệ. Vui lòng cung cấp chủ đề / nội dung rõ ràng hơn.',
        422,
      );
    }

    return {
      questions,
      model: CHAT_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Persist trainer-curated drafts as real Question + QuestionOption rows.
   * Each draft is validated again server-side via the Zod schema before reaching here.
   */
  static async saveDrafts(
    bankId: string,
    input: SaveAiQuestionsInput,
    userId: string,
    roleCodes: string[],
  ) {
    await assertBankAccess(bankId, userId, roleCodes);

    const created = await prisma.$transaction(
      input.questions.map((q: DraftQuestionInput) =>
        prisma.question.create({
          data: {
            questionBankId: BigInt(bankId),
            questionType: q.questionType,
            content: q.content,
            explanation: q.explanation ?? null,
            defaultPoints: q.defaultPoints ?? 1,
            options:
              q.options && q.options.length > 0
                ? {
                    create: q.options.map((opt, idx) => ({
                      content: opt.content,
                      isCorrect: opt.isCorrect,
                      orderIndex: opt.orderIndex || idx + 1,
                    })),
                  }
                : undefined,
          },
          include: { options: { orderBy: { orderIndex: 'asc' } } },
        }),
      ),
    );

    return { createdCount: created.length, questions: created };
  }
}

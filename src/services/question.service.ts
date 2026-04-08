import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  ListQuestionsQuery,
} from '@/schemas/question.schema';

type CreateQuestionPayload = CreateQuestionInput & { questionBankId: string };
import type { CreateOptionInput, UpdateOptionInput } from '@/schemas/question-option.schema';
import type { PaginatedResult } from '@/interfaces';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function assertBankAccess(bankId: string, userId: string, roleCodes: string[]) {
  const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(bankId) } });
  if (!bank) throw new AppError('Question bank not found', 404);
  const isAdmin = roleCodes.includes('admin');
  const isOwner = bank.ownerTrainerId.toString() === userId;
  if (!isAdmin && !isOwner)
    throw new AppError('You do not have permission to access this bank', 403);
  return bank;
}

async function assertQuestionInBank(questionId: string, bankId: string) {
  const question = await prisma.question.findFirst({
    where: { id: BigInt(questionId), questionBankId: BigInt(bankId) },
    include: { options: true },
  });
  if (!question) throw new AppError('Question not found', 404);
  return question;
}

function validateOptionsForType(questionType: string, options: { isCorrect: boolean }[]) {
  if (questionType === 'essay') {
    if (options.length > 0) throw new AppError('essay questions must not have options', 422);
    return;
  }
  if (options.length < 2)
    throw new AppError('single_choice and multiple_choice require at least 2 options', 422);
  const correctCount = options.filter((o) => o.isCorrect).length;
  if (questionType === 'single_choice' && correctCount !== 1) {
    throw new AppError('single_choice question must have exactly 1 correct option', 422);
  }
  if (questionType === 'multiple_choice' && correctCount < 1) {
    throw new AppError('multiple_choice question must have at least 1 correct option', 422);
  }
}

// ─── Question CRUD ────────────────────────────────────────────────────────────

export class QuestionService {
  static async create(data: CreateQuestionPayload, userId: string, roleCodes: string[]) {
    await assertBankAccess(data.questionBankId, userId, roleCodes);

    const question = await prisma.question.create({
      data: {
        questionBankId: BigInt(data.questionBankId),
        questionType: data.questionType,
        content: data.content,
        explanation: data.explanation,
        defaultPoints: data.defaultPoints ?? 1,
        options:
          data.options && data.options.length > 0
            ? {
                create: data.options.map((opt) => ({
                  content: opt.content,
                  isCorrect: opt.isCorrect,
                  orderIndex: opt.orderIndex,
                })),
              }
            : undefined,
      },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });

    return question;
  }

  static async findAll(
    bankId: string,
    query: ListQuestionsQuery,
    userId: string,
    roleCodes: string[],
  ): Promise<PaginatedResult<unknown>> {
    await assertBankAccess(bankId, userId, roleCodes);

    const { page = 1, limit = 10, questionType, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { questionBankId: BigInt(bankId) };
    if (questionType) where.questionType = questionType;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) where.content = { contains: search, mode: 'insensitive' };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { options: { orderBy: { orderIndex: 'asc' } } },
      }),
      prisma.question.count({ where }),
    ]);

    return {
      data: questions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async findById(bankId: string, id: string, userId: string, roleCodes: string[]) {
    await assertBankAccess(bankId, userId, roleCodes);
    return assertQuestionInBank(id, bankId);
  }

  static async update(
    bankId: string,
    id: string,
    data: UpdateQuestionInput,
    userId: string,
    roleCodes: string[],
  ) {
    await assertBankAccess(bankId, userId, roleCodes);
    await assertQuestionInBank(id, bankId);

    return prisma.question.update({
      where: { id: BigInt(id) },
      data: {
        content: data.content,
        explanation: data.explanation,
        defaultPoints: data.defaultPoints,
      },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  static async deactivate(bankId: string, id: string, userId: string, roleCodes: string[]) {
    await assertBankAccess(bankId, userId, roleCodes);
    await assertQuestionInBank(id, bankId);

    return prisma.question.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
  }

  // ─── Question Options CRUD ─────────────────────────────────────────────────

  static async createOption(
    bankId: string,
    questionId: string,
    data: CreateOptionInput,
    userId: string,
    roleCodes: string[],
  ) {
    await assertBankAccess(bankId, userId, roleCodes);
    const question = await assertQuestionInBank(questionId, bankId);

    if (question.questionType === 'essay') {
      throw new AppError('essay questions cannot have options', 422);
    }

    // If adding a correct option to single_choice, ensure no other correct option exists
    if (question.questionType === 'single_choice' && data.isCorrect) {
      const hasCorrect = question.options.some((o) => o.isCorrect);
      if (hasCorrect) {
        throw new AppError('single_choice question already has a correct option', 422);
      }
    }

    return prisma.questionOption.create({
      data: {
        questionId: BigInt(questionId),
        content: data.content,
        isCorrect: data.isCorrect,
        orderIndex: data.orderIndex,
      },
    });
  }

  static async updateOption(
    bankId: string,
    questionId: string,
    optionId: string,
    data: UpdateOptionInput,
    userId: string,
    roleCodes: string[],
  ) {
    await assertBankAccess(bankId, userId, roleCodes);
    const question = await assertQuestionInBank(questionId, bankId);

    const option = question.options.find((o) => o.id.toString() === optionId);
    if (!option) throw new AppError('Option not found', 404);

    // Validate: setting isCorrect=true on single_choice must not conflict
    if (question.questionType === 'single_choice' && data.isCorrect === true) {
      const otherCorrect = question.options.find(
        (o) => o.isCorrect && o.id.toString() !== optionId,
      );
      if (otherCorrect) {
        throw new AppError(
          'single_choice question already has a correct option. Set the other option to false first.',
          422,
        );
      }
    }

    // Validate: unsetting the only correct option on single_choice
    if (question.questionType === 'single_choice' && data.isCorrect === false) {
      const correctOptions = question.options.filter((o) => o.isCorrect);
      if (correctOptions.length === 1 && correctOptions[0].id.toString() === optionId) {
        throw new AppError('single_choice question must always have exactly 1 correct option', 422);
      }
    }

    return prisma.questionOption.update({
      where: { id: BigInt(optionId) },
      data: {
        content: data.content,
        isCorrect: data.isCorrect,
        orderIndex: data.orderIndex,
      },
    });
  }

  static async deleteOption(
    bankId: string,
    questionId: string,
    optionId: string,
    userId: string,
    roleCodes: string[],
  ) {
    await assertBankAccess(bankId, userId, roleCodes);
    const question = await assertQuestionInBank(questionId, bankId);

    const option = question.options.find((o) => o.id.toString() === optionId);
    if (!option) throw new AppError('Option not found', 404);

    // Must keep at least 2 options for choice questions
    if (question.options.length <= 2) {
      throw new AppError(
        'Cannot delete option: choice questions must have at least 2 options',
        422,
      );
    }

    // Cannot delete the only correct option on single_choice
    if (question.questionType === 'single_choice' && option.isCorrect) {
      throw new AppError(
        'Cannot delete the correct option of a single_choice question. Update another option to be correct first.',
        422,
      );
    }

    // Cannot delete all correct options on multiple_choice
    if (question.questionType === 'multiple_choice' && option.isCorrect) {
      const correctCount = question.options.filter((o) => o.isCorrect).length;
      if (correctCount === 1) {
        throw new AppError(
          'Cannot delete the only correct option of a multiple_choice question',
          422,
        );
      }
    }

    await prisma.questionOption.delete({ where: { id: BigInt(optionId) } });
  }
}

export { validateOptionsForType };

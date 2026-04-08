import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  ListQuestionsQuery,
} from '@/schemas/question.schema';
import type { PaginatedResult } from '@/interfaces';

export class QuestionService {
  static async create(data: CreateQuestionInput, userId: string, roleCodes: string[]) {
    // Verify bank exists and user has access
    const bank = await prisma.questionBank.findUnique({
      where: { id: BigInt(data.questionBankId) },
    });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to add questions to this bank', 403);
    }

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
    const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(bankId) } });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to view questions in this bank', 403);
    }

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
    const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(bankId) } });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to view this question', 403);
    }

    const question = await prisma.question.findFirst({
      where: { id: BigInt(id), questionBankId: BigInt(bankId) },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!question) throw new AppError('Question not found', 404);
    return question;
  }

  static async update(
    bankId: string,
    id: string,
    data: UpdateQuestionInput,
    userId: string,
    roleCodes: string[],
  ) {
    const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(bankId) } });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to update this question', 403);
    }

    const question = await prisma.question.findFirst({
      where: { id: BigInt(id), questionBankId: BigInt(bankId) },
    });
    if (!question) throw new AppError('Question not found', 404);

    // Replace options if provided
    if (data.options) {
      await prisma.questionOption.deleteMany({ where: { questionId: BigInt(id) } });
    }

    return prisma.question.update({
      where: { id: BigInt(id) },
      data: {
        content: data.content,
        explanation: data.explanation,
        defaultPoints: data.defaultPoints,
        options: data.options
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
  }

  static async deactivate(bankId: string, id: string, userId: string, roleCodes: string[]) {
    const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(bankId) } });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to deactivate this question', 403);
    }

    const question = await prisma.question.findFirst({
      where: { id: BigInt(id), questionBankId: BigInt(bankId) },
    });
    if (!question) throw new AppError('Question not found', 404);

    return prisma.question.update({
      where: { id: BigInt(id) },
      data: { isActive: false },
    });
  }
}

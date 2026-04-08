import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type {
  CreateQuestionBankInput,
  UpdateQuestionBankInput,
  ListQuestionBanksQuery,
} from '@/schemas/question-bank.schema';
import type { PaginatedResult } from '@/interfaces';

export class QuestionBankService {
  static async create(data: CreateQuestionBankInput, ownerTrainerId: string) {
    const bank = await prisma.questionBank.create({
      data: {
        title: data.title,
        description: data.description,
        isActive: data.isActive ?? true,
        ownerTrainerId: BigInt(ownerTrainerId),
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
      },
      include: {
        ownerTrainer: { select: { id: true, fullName: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });
    return bank;
  }

  static async findAll(
    query: ListQuestionBanksQuery,
    userId: string,
    roleCodes: string[],
  ): Promise<PaginatedResult<unknown>> {
    const { page = 1, limit = 10, categoryId, ownerTrainerId, search, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Trainers can only see their own banks
    if (roleCodes.includes('trainer') && !roleCodes.includes('admin')) {
      where.ownerTrainerId = BigInt(userId);
    } else if (ownerTrainerId) {
      where.ownerTrainerId = BigInt(ownerTrainerId);
    }

    if (categoryId) where.categoryId = BigInt(categoryId);
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [banks, total] = await Promise.all([
      prisma.questionBank.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ownerTrainer: { select: { id: true, fullName: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { questions: true } },
        },
      }),
      prisma.questionBank.count({ where }),
    ]);

    return {
      data: banks,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async findById(id: string) {
    const bank = await prisma.questionBank.findUnique({
      where: { id: BigInt(id) },
      include: {
        ownerTrainer: { select: { id: true, fullName: true, email: true } },
        category: { select: { id: true, name: true } },
        _count: { select: { questions: true } },
      },
    });
    if (!bank) throw new AppError('Question bank not found', 404);
    return bank;
  }

  static async update(
    id: string,
    data: UpdateQuestionBankInput,
    userId: string,
    roleCodes: string[],
  ) {
    const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(id) } });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to update this question bank', 403);
    }

    return prisma.questionBank.update({
      where: { id: BigInt(id) },
      data: {
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        categoryId:
          data.categoryId !== undefined
            ? data.categoryId
              ? BigInt(data.categoryId)
              : null
            : undefined,
      },
      include: {
        ownerTrainer: { select: { id: true, fullName: true, email: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  static async delete(id: string, userId: string, roleCodes: string[]) {
    const bank = await prisma.questionBank.findUnique({ where: { id: BigInt(id) } });
    if (!bank) throw new AppError('Question bank not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isOwner = bank.ownerTrainerId.toString() === userId;
    if (!isAdmin && !isOwner) {
      throw new AppError('You do not have permission to delete this question bank', 403);
    }

    await prisma.questionBank.delete({ where: { id: BigInt(id) } });
  }
}

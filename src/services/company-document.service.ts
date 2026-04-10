import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import { logger } from '@/config/logger';
import { indexCompanyDocument } from '@/services/embedding.service';
import type {
  CompanyDocumentListQuery,
  CreateCompanyDocumentInput,
  UpdateCompanyDocumentInput,
} from '@/schemas/company-document.schema';

export class CompanyDocumentService {
  /**
   * Get paginated list of company documents with search and filters.
   */
  static async getDocuments(query: CompanyDocumentListQuery) {
    const { search, category, isActive, page, limit } = query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [total, documents] = await Promise.all([
      prisma.companyDocument.count({ where }),
      prisma.companyDocument.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // Get chunk counts for each document
    const docIds = documents.map((d) => d.id);
    const chunkCounts =
      docIds.length > 0
        ? await prisma.$queryRawUnsafe<{ source_id: bigint; count: bigint }[]>(
            `SELECT source_id, COUNT(*)::bigint as count 
             FROM document_chunks 
             WHERE source_type = 'company_document' AND source_id = ANY($1::bigint[])
             GROUP BY source_id`,
            docIds,
          )
        : [];

    const chunkCountMap = new Map(
      chunkCounts.map((c) => [c.source_id.toString(), Number(c.count)]),
    );

    return {
      data: documents.map((doc) => ({
        id: doc.id.toString(),
        title: doc.title,
        category: doc.category,
        isActive: doc.isActive,
        uploadedById: doc.uploadedById.toString(),
        chunkCount: chunkCountMap.get(doc.id.toString()) || 0,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single company document by ID with content.
   */
  static async getDocumentById(id: string) {
    const documentId = BigInt(id);

    const doc = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new AppError('Tài liệu không tồn tại.', 404);
    }

    // Get chunk count
    const chunkResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint as count FROM document_chunks 
       WHERE source_type = 'company_document' AND source_id = $1`,
      documentId,
    );

    return {
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      category: doc.category,
      isActive: doc.isActive,
      uploadedById: doc.uploadedById.toString(),
      chunkCount: Number(chunkResult[0]?.count || 0),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Create a new company document and auto-index for RAG.
   */
  static async createDocument(data: CreateCompanyDocumentInput, uploadedById: bigint) {
    const doc = await prisma.companyDocument.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        isActive: data.isActive ?? true,
        uploadedById,
      },
    });

    // Auto-index the document for RAG
    let chunkCount = 0;
    try {
      chunkCount = await indexCompanyDocument(doc.id);
      logger.info(`✅ Auto-indexed document "${doc.title}" → ${chunkCount} chunks`);
    } catch (error) {
      logger.error(`⚠️ Failed to auto-index document "${doc.title}":`, error);
      // Don't fail the create operation — document is saved, indexing can be retried
    }

    return {
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      category: doc.category,
      isActive: doc.isActive,
      uploadedById: doc.uploadedById.toString(),
      chunkCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Update an existing company document. Re-indexes if content changed.
   */
  static async updateDocument(id: string, data: UpdateCompanyDocumentInput) {
    const documentId = BigInt(id);

    const existing = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!existing) {
      throw new AppError('Tài liệu không tồn tại.', 404);
    }

    const doc = await prisma.companyDocument.update({
      where: { id: documentId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // Re-index if content or title changed (affects embeddings & metadata)
    let chunkCount = 0;
    const needsReindex =
      (data.content !== undefined && data.content !== existing.content) ||
      (data.title !== undefined && data.title !== existing.title);

    if (needsReindex) {
      try {
        chunkCount = await indexCompanyDocument(doc.id);
        logger.info(`✅ Re-indexed document "${doc.title}" → ${chunkCount} chunks`);
      } catch (error) {
        logger.error(`⚠️ Failed to re-index document "${doc.title}":`, error);
      }
    }

    // Get current chunk count if we didn't re-index
    if (!needsReindex) {
      const chunkResult = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*)::bigint as count FROM document_chunks 
         WHERE source_type = 'company_document' AND source_id = $1`,
        documentId,
      );
      chunkCount = Number(chunkResult[0]?.count || 0);
    }

    return {
      id: doc.id.toString(),
      title: doc.title,
      content: doc.content,
      category: doc.category,
      isActive: doc.isActive,
      uploadedById: doc.uploadedById.toString(),
      chunkCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  /**
   * Soft-delete a company document and clean up related chunks.
   */
  static async deleteDocument(id: string) {
    const documentId = BigInt(id);

    const doc = await prisma.companyDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new AppError('Tài liệu không tồn tại.', 404);
    }

    // Soft-delete the document
    await prisma.companyDocument.update({
      where: { id: documentId },
      data: { isActive: false },
    });

    // Remove related chunks so they don't appear in RAG search
    const deleteResult = await prisma.$executeRawUnsafe(
      `DELETE FROM document_chunks WHERE source_type = 'company_document' AND source_id = $1`,
      documentId,
    );

    logger.info(`🗑️ Soft-deleted document "${doc.title}" and removed ${deleteResult} chunks`);
  }

  /**
   * Get distinct categories for filter dropdown.
   */
  static async getCategories(): Promise<string[]> {
    const results = await prisma.companyDocument.findMany({
      where: { category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    return results.map((r) => r.category).filter(Boolean) as string[];
  }
}

import { prisma } from '@/config/database';
import {
  genAI,
  EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  CHUNK_SIZE,
  CHUNK_OVERLAP,
  TOP_K_RESULTS,
} from '@/config/gemini.config';
import { logger } from '@/config/logger';

// ========================
// Types
// ========================

export interface SearchResult {
  id: bigint;
  sourceType: string;
  sourceId: bigint;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
}

interface ChunkData {
  sourceType: string;
  sourceId: bigint;
  chunkIndex: number;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[];
}

// ========================
// Text Chunking
// ========================

/**
 * Split text into overlapping chunks for embedding.
 * Respects sentence boundaries for better semantic coherence.
 */
export const chunkText = (text: string): string[] => {
  if (!text || text.trim().length === 0) return [];

  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (cleanText.length <= CHUNK_SIZE) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = Math.min(start + CHUNK_SIZE, cleanText.length);

    // Try to break at sentence boundary
    if (end < cleanText.length) {
      const lastPeriod = cleanText.lastIndexOf('.', end);
      const lastNewline = cleanText.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > start + CHUNK_SIZE * 0.5) {
        end = breakPoint + 1;
      }
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Advance start with overlap, but if we've reached the end, break
    if (end >= cleanText.length) break;
    start = end - CHUNK_OVERLAP;
  }

  return chunks;
};

// ========================
// Embedding Generation
// ========================

/**
 * Generate embedding vector for a text using Gemini text-embedding-004.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await genAI.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const values = response.embeddings?.[0]?.values;

    if (!values || values.length === 0) {
      throw new Error('Failed to generate embedding: no values returned from API');
    }

    return values;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    if (err.status === 400) {
      throw new Error(`Gemini API Error (400): ${err.message}. Check your GEMINI_API_KEY.`, {
        cause: error,
      });
    }
    throw error;
  }
};

// ========================
// Indexing Pipeline
// ========================

/**
 * Index a single company document into document_chunks with embeddings.
 */
export const indexCompanyDocument = async (documentId: bigint): Promise<number> => {
  const doc = await prisma.companyDocument.findUnique({
    where: { id: documentId },
  });

  if (!doc || !doc.isActive) {
    logger.warn(`Document ${documentId} not found or inactive, skipping`);
    return 0;
  }

  // Delete existing chunks for this document
  await prisma.$executeRawUnsafe(
    `DELETE FROM document_chunks WHERE source_type = 'company_document' AND source_id = $1`,
    documentId,
  );

  const chunks = chunkText(doc.content);

  if (chunks.length === 0) {
    logger.warn(`Document ${documentId} has no content to index`);
    return 0;
  }

  const chunkDataList: ChunkData[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);

    chunkDataList.push({
      sourceType: 'company_document',
      sourceId: documentId,
      chunkIndex: i,
      content: chunks[i],
      metadata: {
        documentTitle: doc.title,
        category: doc.category,
      },
      embedding,
    });
  }

  // Batch insert chunks with embeddings using raw SQL
  for (const chunk of chunkDataList) {
    const embeddingStr = `[${chunk.embedding.join(',')}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO document_chunks (source_type, source_id, chunk_index, content, metadata, embedding, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector, NOW(), NOW())
       ON CONFLICT (source_type, source_id, chunk_index) 
       DO UPDATE SET content = $4, metadata = $5::jsonb, embedding = $6::vector, updated_at = NOW()`,
      chunk.sourceType,
      chunk.sourceId,
      chunk.chunkIndex,
      chunk.content,
      JSON.stringify(chunk.metadata),
      embeddingStr,
    );
  }

  logger.info(`✅ Indexed document "${doc.title}" → ${chunkDataList.length} chunks`);
  return chunkDataList.length;
};

/**
 * Index all active company documents.
 */
export const indexAllDocuments = async (): Promise<{ indexed: number; totalChunks: number }> => {
  const documents = await prisma.companyDocument.findMany({
    where: { isActive: true },
    select: { id: true, title: true },
  });

  logger.info(`📄 Found ${documents.length} active documents to index`);

  let totalChunks = 0;

  for (const doc of documents) {
    try {
      const chunks = await indexCompanyDocument(doc.id);
      totalChunks += chunks;
    } catch (error) {
      logger.error(`❌ Failed to index document "${doc.title}":`, error);
    }
  }

  logger.info(`✅ Indexing complete: ${documents.length} docs, ${totalChunks} chunks`);
  return { indexed: documents.length, totalChunks };
};

// ========================
// Vector Search
// ========================

/**
 * Search for similar document chunks using cosine similarity.
 */
export const searchSimilarChunks = async (
  query: string,
  topK: number = TOP_K_RESULTS,
): Promise<SearchResult[]> => {
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(',')}]`;

  const results = await prisma.$queryRawUnsafe<SearchResult[]>(
    `SELECT 
       id, 
       source_type AS "sourceType", 
       source_id AS "sourceId", 
       content, 
       metadata,
       1 - (embedding <=> $1::vector) AS similarity
     FROM document_chunks
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    embeddingStr,
    topK,
  );

  return results;
};

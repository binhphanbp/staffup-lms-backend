/* eslint-disable no-console */
import 'dotenv/config';
import { Client } from 'pg';
import { GoogleGenAI } from '@google/genai';

// ============================================================
// Document Indexing Script with Retry Logic
// Generates vector embeddings for all company documents
// Run: npx tsx scripts/run-indexing.ts
// ============================================================

const EMBEDDING_MODEL = 'gemini-embedding-001';
const EMBEDDING_DIMENSIONS = 768;
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500; // base delay between API calls
const RETRY_DELAY_MS = 2000; // delay between retries

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function chunkText(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length <= CHUNK_SIZE) return [cleanText];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleanText.length) {
    let end = Math.min(start + CHUNK_SIZE, cleanText.length);
    if (end < cleanText.length) {
      const lastPeriod = cleanText.lastIndexOf('.', end);
      const lastNewline = cleanText.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > start + CHUNK_SIZE * 0.5) end = breakPoint + 1;
    }
    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    if (end >= cleanText.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

async function generateEmbeddingWithRetry(text: string, retries = MAX_RETRIES): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await genAI.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { outputDimensionality: EMBEDDING_DIMENSIONS },
      });
      const values = response.embeddings?.[0]?.values;
      if (!values || values.length === 0) {
        throw new Error('No embedding values returned');
      }
      return values;
    } catch (error: unknown) {
      const isLastAttempt = attempt === retries;
      const err = error as { status?: number; statusCode?: number; message?: string };
      const statusCode = err.status || err.statusCode;

      // Don't retry on auth/validation errors
      if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
        throw error;
      }

      if (isLastAttempt) {
        throw error;
      }

      console.warn(
        `   ⚠️  Attempt ${attempt}/${retries} failed: ${err.message}. Retrying in ${RETRY_DELAY_MS}ms...`,
      );
      await sleep(RETRY_DELAY_MS * attempt); // exponential backoff
    }
  }
  throw new Error('Exhausted all retries');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(60));
  console.log('  📊 StaffUp LMS — Document Indexing Pipeline');
  console.log('═'.repeat(60));
  console.log(`  Model: ${EMBEDDING_MODEL}`);
  console.log(`  Dimensions: ${EMBEDDING_DIMENSIONS}`);
  console.log(`  Chunk size: ${CHUNK_SIZE} chars (overlap: ${CHUNK_OVERLAP})`);
  console.log(`  Max retries: ${MAX_RETRIES}`);
  console.log('═'.repeat(60));
  console.log();

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to database\n');

  // Clear existing chunks
  const existing = await client.query('SELECT count(*) as count FROM document_chunks');
  if (parseInt(existing.rows[0].count) > 0) {
    await client.query('DELETE FROM document_chunks');
    console.log(`🗑️  Cleared ${existing.rows[0].count} existing chunks\n`);
  }

  const docs = await client.query(
    'SELECT id, title, content, category FROM company_documents WHERE is_active = true ORDER BY id',
  );

  if (docs.rows.length === 0) {
    console.log('⚠️  No active documents found! Please seed company documents first.');
    console.log('   Run: npx tsx prisma/seed-company-docs.ts');
    await client.end();
    return;
  }

  console.log(`📄 Found ${docs.rows.length} documents to index\n`);

  let totalChunks = 0;
  let successDocs = 0;
  let failedDocs = 0;
  const startTime = Date.now();

  for (let docIdx = 0; docIdx < docs.rows.length; docIdx++) {
    const doc = docs.rows[docIdx];
    const progress = `[${docIdx + 1}/${docs.rows.length}]`;

    try {
      const chunks = chunkText(doc.content);
      console.log(`${progress} 📝 "${doc.title}" → ${chunks.length} chunks`);

      for (let i = 0; i < chunks.length; i++) {
        const embedding = await generateEmbeddingWithRetry(chunks[i]);
        const embeddingStr = `[${embedding.join(',')}]`;

        await client.query(
          `INSERT INTO document_chunks (source_type, source_id, chunk_index, content, metadata, embedding, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector, NOW(), NOW())
           ON CONFLICT (source_type, source_id, chunk_index)
           DO UPDATE SET content = $4, metadata = $5::jsonb, embedding = $6::vector, updated_at = NOW()`,
          [
            'company_document',
            doc.id,
            i,
            chunks[i],
            JSON.stringify({ documentTitle: doc.title, category: doc.category }),
            embeddingStr,
          ],
        );

        const pct = Math.round(((i + 1) / chunks.length) * 100);
        process.stdout.write(`\r   ✅ Chunk ${i + 1}/${chunks.length} (${pct}%)`);

        // Delay between API calls to avoid rate limiting
        if (i < chunks.length - 1) {
          await sleep(BASE_DELAY_MS);
        }
      }

      console.log(' — Done!');
      totalChunks += chunks.length;
      successDocs++;
    } catch (error: unknown) {
      console.log();
      console.error(`   ❌ FAILED: ${(error as Error).message}`);
      failedDocs++;
    }
  }

  // Final verification
  const result = await client.query('SELECT count(*) as count FROM document_chunks');
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log();
  console.log('═'.repeat(60));
  console.log('  🎉 INDEXING COMPLETE');
  console.log('═'.repeat(60));
  console.log(`  ✅ Successful: ${successDocs}/${docs.rows.length} documents`);
  if (failedDocs > 0) console.log(`  ❌ Failed: ${failedDocs} documents`);
  console.log(`  📦 Total chunks in DB: ${result.rows[0].count}`);
  console.log(`  ⏱️  Time elapsed: ${elapsed}s`);
  console.log('═'.repeat(60));

  await client.end();
}

main().catch((e: unknown) => {
  const err = e as { message?: string; status?: number };
  console.error('\n💀 FATAL ERROR:', err.message);
  if (err.message?.includes('GEMINI_API_KEY') || err.status === 400) {
    console.error('   → Check your GEMINI_API_KEY in .env file');
  }
  process.exit(1);
});

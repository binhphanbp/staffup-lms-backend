-- Fix document_chunks_embedding_idx: switch from default btree to HNSW.
-- The default btree index breaks INSERTs because a 768-dim vector exceeds
-- the btree row-size limit (max 2704 bytes). HNSW is the correct index for
-- pgvector similarity search and works on empty tables without tuning.
DROP INDEX IF EXISTS "document_chunks_embedding_idx";

CREATE INDEX "document_chunks_embedding_idx"
ON "document_chunks" USING hnsw ("embedding" vector_cosine_ops);

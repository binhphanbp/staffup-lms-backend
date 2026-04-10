-- ========================
-- Enable pgvector Extension
-- ========================
CREATE EXTENSION IF NOT EXISTS vector;

-- ========================
-- Company Documents Table
-- ========================
CREATE TABLE "company_documents" (
    "id" BIGSERIAL NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "category" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "company_documents_pkey" PRIMARY KEY ("id")
);

-- ========================
-- Document Chunks Table (Vector Embeddings)
-- ========================
CREATE TABLE "document_chunks" (
    "id" BIGSERIAL NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "source_id" BIGINT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(768) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- ========================
-- Chat Sessions Table
-- ========================
CREATE TABLE "chat_sessions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "title" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- ========================
-- Chat Messages Table
-- ========================
CREATE TABLE "chat_messages" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "token_count" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- ========================
-- Indexes
-- ========================

-- Unique constraint on document chunks
CREATE UNIQUE INDEX "document_chunks_source_type_source_id_chunk_index_key" 
ON "document_chunks"("source_type", "source_id", "chunk_index");

-- Vector similarity search index (IVFFlat for performance)
CREATE INDEX "document_chunks_embedding_idx" 
ON "document_chunks" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Chat session indexes
CREATE INDEX "chat_sessions_user_id_idx" ON "chat_sessions"("user_id");

-- Chat message indexes
CREATE INDEX "chat_messages_session_id_created_at_idx" ON "chat_messages"("session_id", "created_at");

-- ========================
-- Foreign Keys
-- ========================
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" 
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" 
FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

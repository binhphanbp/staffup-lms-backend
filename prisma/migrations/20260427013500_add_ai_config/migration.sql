-- CreateTable: ai_config
CREATE TABLE "ai_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'gemini',
    "chat_model" VARCHAR(100) NOT NULL DEFAULT 'gemini-2.5-flash',
    "embedding_model" VARCHAR(100) NOT NULL DEFAULT 'gemini-embedding-001',
    "prompts" JSONB NOT NULL DEFAULT '{}',
    "modules" JSONB NOT NULL DEFAULT '{}',
    "top_k_results" INTEGER NOT NULL DEFAULT 5,
    "max_messages_per_minute" INTEGER NOT NULL DEFAULT 10,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "updated_by" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_config_pkey" PRIMARY KEY ("id")
);

-- Seed default singleton row (id = 1)
INSERT INTO "ai_config" ("id", "updated_at") VALUES (1, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

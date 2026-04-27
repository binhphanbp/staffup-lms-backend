-- CreateTable
CREATE TABLE "code_lab_problems" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "difficulty" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "category" VARCHAR(80) NOT NULL,
    "language" VARCHAR(20) NOT NULL,
    "problem_statement" TEXT NOT NULL,
    "starter_code" TEXT NOT NULL,
    "test_cases" JSONB NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "code_lab_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_submissions" (
    "id" BIGSERIAL NOT NULL,
    "problem_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "language" VARCHAR(20) NOT NULL,
    "code" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'error',
    "score" INTEGER NOT NULL DEFAULT 0,
    "summary" TEXT,
    "evaluation" JSONB,
    "model" VARCHAR(100),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "code_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "code_lab_problems_slug_key" ON "code_lab_problems"("slug");

-- CreateIndex
CREATE INDEX "code_lab_problems_language_idx" ON "code_lab_problems"("language");

-- CreateIndex
CREATE INDEX "code_lab_problems_difficulty_idx" ON "code_lab_problems"("difficulty");

-- CreateIndex
CREATE INDEX "code_submissions_user_id_created_at_idx" ON "code_submissions"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "code_submissions_problem_id_created_at_idx" ON "code_submissions"("problem_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "code_lab_problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

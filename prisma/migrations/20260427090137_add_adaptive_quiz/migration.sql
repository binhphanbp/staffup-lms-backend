-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "difficulty" SMALLINT NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "adaptive_quiz_sessions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "question_bank_id" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "max_questions" SMALLINT NOT NULL DEFAULT 10,
    "current_difficulty" SMALLINT NOT NULL DEFAULT 3,
    "ability_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "answered_count" INTEGER NOT NULL DEFAULT 0,
    "band" VARCHAR(40),
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "adaptive_quiz_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adaptive_quiz_items" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "order_index" SMALLINT NOT NULL,
    "difficulty" SMALLINT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "selected_options" JSONB,
    "ability_before" DOUBLE PRECISION NOT NULL,
    "ability_after" DOUBLE PRECISION NOT NULL,
    "time_spent_ms" INTEGER,
    "answered_at" TIMESTAMPTZ(6),

    CONSTRAINT "adaptive_quiz_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "adaptive_quiz_sessions_user_id_started_at_idx" ON "adaptive_quiz_sessions"("user_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "adaptive_quiz_sessions_question_bank_id_status_idx" ON "adaptive_quiz_sessions"("question_bank_id", "status");

-- CreateIndex
CREATE INDEX "adaptive_quiz_items_session_id_order_index_idx" ON "adaptive_quiz_items"("session_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "adaptive_quiz_items_session_id_question_id_key" ON "adaptive_quiz_items"("session_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "adaptive_quiz_items_session_id_order_index_key" ON "adaptive_quiz_items"("session_id", "order_index");

-- CreateIndex
CREATE INDEX "questions_question_bank_id_difficulty_is_active_idx" ON "questions"("question_bank_id", "difficulty", "is_active");

-- AddForeignKey
ALTER TABLE "adaptive_quiz_sessions" ADD CONSTRAINT "adaptive_quiz_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_quiz_sessions" ADD CONSTRAINT "adaptive_quiz_sessions_question_bank_id_fkey" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_quiz_items" ADD CONSTRAINT "adaptive_quiz_items_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "adaptive_quiz_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adaptive_quiz_items" ADD CONSTRAINT "adaptive_quiz_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

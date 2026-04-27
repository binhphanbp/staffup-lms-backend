-- CreateTable
CREATE TABLE "video_lesson_summaries" (
    "id" BIGSERIAL NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "transcript" TEXT,
    "chapters" JSONB,
    "flashcards" JSONB,
    "key_points" JSONB,
    "source" VARCHAR(20) NOT NULL DEFAULT 'ai',
    "model" VARCHAR(100),
    "generated_by_user_id" BIGINT,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "video_lesson_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "video_lesson_summaries_lesson_id_key" ON "video_lesson_summaries"("lesson_id");

-- CreateIndex
CREATE INDEX "video_lesson_summaries_lesson_id_idx" ON "video_lesson_summaries"("lesson_id");

-- AddForeignKey
ALTER TABLE "video_lesson_summaries" ADD CONSTRAINT "video_lesson_summaries_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

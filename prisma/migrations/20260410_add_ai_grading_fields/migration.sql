-- AlterTable: Add AI grading fields to attempt_responses
ALTER TABLE "attempt_responses" ADD COLUMN "ai_suggested_score" DECIMAL(6,2);
ALTER TABLE "attempt_responses" ADD COLUMN "ai_feedback" JSONB;
ALTER TABLE "attempt_responses" ADD COLUMN "ai_graded_at" TIMESTAMPTZ(6);

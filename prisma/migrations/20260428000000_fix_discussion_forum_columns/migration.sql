-- Fix column names to match Prisma schema.
-- The earlier migration `20260427120000_add_discussion_forum` already creates
-- the columns as `author_id`, but on environments where the discussion forum
-- was created with the older `author_user_id` name we still need to rename.
-- Wrapping in IF EXISTS makes this migration idempotent and safe to apply on
-- any environment, including a fresh `prisma migrate dev`.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'discussion_threads'
      AND column_name = 'author_user_id'
  ) THEN
    ALTER TABLE "discussion_threads" RENAME COLUMN "author_user_id" TO "author_id";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'discussion_replies'
      AND column_name = 'author_user_id'
  ) THEN
    ALTER TABLE "discussion_replies" RENAME COLUMN "author_user_id" TO "author_id";
  END IF;
END$$;

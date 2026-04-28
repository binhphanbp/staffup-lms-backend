-- Fix column names to match Prisma schema
ALTER TABLE "discussion_threads" RENAME COLUMN "author_user_id" TO "author_id";
ALTER TABLE "discussion_replies" RENAME COLUMN "author_user_id" TO "author_id";

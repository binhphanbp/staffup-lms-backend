-- CreateTable: user_gamification
CREATE TABLE "user_gamification" (
    "user_id" BIGINT NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "current_level" INTEGER NOT NULL DEFAULT 1,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_gamification_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "user_gamification_total_xp_idx" ON "user_gamification"("total_xp");

-- AddForeignKey
ALTER TABLE "user_gamification" ADD CONSTRAINT "user_gamification_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: xp_transactions
CREATE TABLE "xp_transactions" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "reference_id" VARCHAR(100),
    "description" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "xp_transactions_user_id_created_at_idx" ON "xp_transactions"("user_id", "created_at");

ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: badges
CREATE TABLE "badges" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(80) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "icon_name" VARCHAR(80) NOT NULL DEFAULT 'emoji_events',
    "tier" VARCHAR(20) NOT NULL DEFAULT 'bronze',
    "criteria" JSONB NOT NULL DEFAULT '{}',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateTable: user_badges
CREATE TABLE "user_badges" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "badge_id" BIGINT NOT NULL,
    "earned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");
CREATE UNIQUE INDEX "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");

ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey"
    FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default badges
INSERT INTO "badges" ("code", "name", "description", "icon_name", "tier", "criteria", "sort_order") VALUES
  ('first_steps',     'Bước Đầu Tiên',         'Hoàn thành bài học đầu tiên của bạn.',                  'school',                'bronze', '{"type":"lessons_completed","threshold":1}',  10),
  ('quick_learner',   'Học viên Tốc độ',       'Hoàn thành 10 bài học.',                                'rocket_launch',         'silver', '{"type":"lessons_completed","threshold":10}', 20),
  ('lesson_master',   'Bậc thầy Bài học',      'Hoàn thành 50 bài học.',                                'auto_stories',          'gold',   '{"type":"lessons_completed","threshold":50}', 30),
  ('first_quiz',      'Bài Kiểm tra Đầu tiên', 'Vượt qua bài quiz đầu tiên.',                           'quiz',                  'bronze', '{"type":"quizzes_passed","threshold":1}',     40),
  ('quiz_master',     'Bậc thầy Quiz',         'Vượt qua 10 bài quiz.',                                  'workspace_premium',     'gold',   '{"type":"quizzes_passed","threshold":10}',    50),
  ('course_champion', 'Nhà Vô địch Khóa học',  'Hoàn thành khóa học đầu tiên.',                         'military_tech',         'silver', '{"type":"courses_completed","threshold":1}',  60),
  ('streaker_7',      'Streak 7 ngày',         'Học liên tục 7 ngày không nghỉ.',                       'local_fire_department', 'silver', '{"type":"streak","threshold":7}',             70),
  ('streaker_30',     'Streak 30 ngày',        'Học liên tục 30 ngày — bạn là một huyền thoại!',         'whatshot',              'gold',   '{"type":"streak","threshold":30}',            80),
  ('level_5',         'Cấp độ 5',              'Đạt cấp độ 5.',                                          'star',                  'silver', '{"type":"level","threshold":5}',              90),
  ('level_10',        'Cấp độ 10',             'Đạt cấp độ 10 — Chuyên gia thực thụ.',                   'auto_awesome',          'gold',   '{"type":"level","threshold":10}',            100)
ON CONFLICT ("code") DO NOTHING;

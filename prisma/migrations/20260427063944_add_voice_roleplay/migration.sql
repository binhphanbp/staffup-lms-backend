-- CreateTable
CREATE TABLE "roleplay_scenarios" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "persona_name" VARCHAR(100) NOT NULL,
    "persona_role" VARCHAR(150) NOT NULL,
    "persona_tone" VARCHAR(50) NOT NULL DEFAULT 'neutral',
    "context" TEXT NOT NULL,
    "opening_line" TEXT NOT NULL,
    "objectives" JSONB NOT NULL DEFAULT '[]',
    "evaluation_rubric" JSONB NOT NULL DEFAULT '[]',
    "difficulty" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "category" VARCHAR(50) NOT NULL DEFAULT 'communication',
    "estimated_minutes" INTEGER NOT NULL DEFAULT 8,
    "max_turns" INTEGER NOT NULL DEFAULT 12,
    "language" VARCHAR(10) NOT NULL DEFAULT 'vi',
    "voice_hint" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roleplay_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roleplay_sessions" (
    "id" BIGSERIAL NOT NULL,
    "scenario_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),

    CONSTRAINT "roleplay_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roleplay_turns" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roleplay_turns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roleplay_evaluations" (
    "id" BIGSERIAL NOT NULL,
    "session_id" BIGINT NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "band" VARCHAR(20) NOT NULL,
    "criterion_scores" JSONB NOT NULL DEFAULT '[]',
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "improvements" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roleplay_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roleplay_scenarios_slug_key" ON "roleplay_scenarios"("slug");

-- CreateIndex
CREATE INDEX "roleplay_scenarios_is_active_idx" ON "roleplay_scenarios"("is_active");

-- CreateIndex
CREATE INDEX "roleplay_scenarios_category_idx" ON "roleplay_scenarios"("category");

-- CreateIndex
CREATE INDEX "roleplay_sessions_user_id_started_at_idx" ON "roleplay_sessions"("user_id", "started_at");

-- CreateIndex
CREATE INDEX "roleplay_sessions_scenario_id_idx" ON "roleplay_sessions"("scenario_id");

-- CreateIndex
CREATE INDEX "roleplay_turns_session_id_order_index_idx" ON "roleplay_turns"("session_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "roleplay_evaluations_session_id_key" ON "roleplay_evaluations"("session_id");

-- AddForeignKey
ALTER TABLE "roleplay_sessions" ADD CONSTRAINT "roleplay_sessions_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "roleplay_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleplay_sessions" ADD CONSTRAINT "roleplay_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleplay_turns" ADD CONSTRAINT "roleplay_turns_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "roleplay_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roleplay_evaluations" ADD CONSTRAINT "roleplay_evaluations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "roleplay_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

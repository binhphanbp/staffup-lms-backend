-- CreateTable
CREATE TABLE "skills" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(60),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "position_skills" (
    "id" BIGSERIAL NOT NULL,
    "position_title" VARCHAR(150) NOT NULL,
    "skill_id" BIGINT NOT NULL,
    "target_level" SMALLINT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "position_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "skill_id" BIGINT NOT NULL,
    "current_level" SMALLINT NOT NULL,
    "source" VARCHAR(20) NOT NULL DEFAULT 'self',
    "notes" TEXT,
    "last_assessed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_assessments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "skill_id" BIGINT NOT NULL,
    "level" SMALLINT NOT NULL,
    "source" VARCHAR(20) NOT NULL,
    "assessed_by_id" BIGINT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_course_recommendations" (
    "id" BIGSERIAL NOT NULL,
    "skill_id" BIGINT NOT NULL,
    "course_id" BIGINT NOT NULL,
    "min_level" SMALLINT NOT NULL DEFAULT 1,
    "max_level" SMALLINT NOT NULL DEFAULT 5,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_course_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE INDEX "skills_category_is_active_idx" ON "skills"("category", "is_active");

-- CreateIndex
CREATE INDEX "position_skills_position_title_idx" ON "position_skills"("position_title");

-- CreateIndex
CREATE INDEX "position_skills_skill_id_idx" ON "position_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "position_skills_position_title_skill_id_key" ON "position_skills"("position_title", "skill_id");

-- CreateIndex
CREATE INDEX "user_skills_user_id_idx" ON "user_skills"("user_id");

-- CreateIndex
CREATE INDEX "user_skills_skill_id_idx" ON "user_skills"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_user_id_skill_id_key" ON "user_skills"("user_id", "skill_id");

-- CreateIndex
CREATE INDEX "skill_assessments_user_id_created_at_idx" ON "skill_assessments"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "skill_assessments_skill_id_idx" ON "skill_assessments"("skill_id");

-- CreateIndex
CREATE INDEX "skill_course_recommendations_skill_id_idx" ON "skill_course_recommendations"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_course_recommendations_skill_id_course_id_key" ON "skill_course_recommendations"("skill_id", "course_id");

-- AddForeignKey
ALTER TABLE "position_skills" ADD CONSTRAINT "position_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_assessments" ADD CONSTRAINT "skill_assessments_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_course_recommendations" ADD CONSTRAINT "skill_course_recommendations_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_course_recommendations" ADD CONSTRAINT "skill_course_recommendations_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

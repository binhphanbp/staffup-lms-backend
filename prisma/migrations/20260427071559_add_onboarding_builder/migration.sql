-- CreateTable
CREATE TABLE "onboarding_templates" (
    "id" BIGSERIAL NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000) NOT NULL DEFAULT '',
    "target_position" VARCHAR(150),
    "department_id" BIGINT,
    "total_days" INTEGER NOT NULL DEFAULT 90,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "onboarding_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_plans" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT,
    "template_name" VARCHAR(200) NOT NULL,
    "assignee_id" BIGINT NOT NULL,
    "manager_id" BIGINT NOT NULL,
    "start_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "notes" VARCHAR(1000),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "onboarding_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_stages" (
    "id" BIGSERIAL NOT NULL,
    "template_id" BIGINT,
    "plan_id" BIGINT,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "order_index" INTEGER NOT NULL,
    "start_offset_days" INTEGER NOT NULL DEFAULT 0,
    "end_offset_days" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "onboarding_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_tasks" (
    "id" BIGSERIAL NOT NULL,
    "stage_id" BIGINT NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "description" VARCHAR(1000),
    "category" VARCHAR(30) NOT NULL DEFAULT 'learning',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "estimated_hours" INTEGER NOT NULL DEFAULT 2,
    "order_index" INTEGER NOT NULL,
    "course_id" BIGINT,
    "resource_url" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMPTZ(6),
    "completed_by_id" BIGINT,
    "manager_note" VARCHAR(500),

    CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_templates_slug_key" ON "onboarding_templates"("slug");

-- CreateIndex
CREATE INDEX "onboarding_templates_is_active_idx" ON "onboarding_templates"("is_active");

-- CreateIndex
CREATE INDEX "onboarding_templates_department_id_idx" ON "onboarding_templates"("department_id");

-- CreateIndex
CREATE INDEX "onboarding_plans_assignee_id_status_idx" ON "onboarding_plans"("assignee_id", "status");

-- CreateIndex
CREATE INDEX "onboarding_plans_manager_id_idx" ON "onboarding_plans"("manager_id");

-- CreateIndex
CREATE INDEX "onboarding_stages_template_id_order_index_idx" ON "onboarding_stages"("template_id", "order_index");

-- CreateIndex
CREATE INDEX "onboarding_stages_plan_id_order_index_idx" ON "onboarding_stages"("plan_id", "order_index");

-- CreateIndex
CREATE INDEX "onboarding_tasks_stage_id_order_index_idx" ON "onboarding_tasks"("stage_id", "order_index");

-- AddForeignKey
ALTER TABLE "onboarding_templates" ADD CONSTRAINT "onboarding_templates_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_templates" ADD CONSTRAINT "onboarding_templates_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_plans" ADD CONSTRAINT "onboarding_plans_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_plans" ADD CONSTRAINT "onboarding_plans_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_plans" ADD CONSTRAINT "onboarding_plans_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_stages" ADD CONSTRAINT "onboarding_stages_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_stages" ADD CONSTRAINT "onboarding_stages_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "onboarding_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "onboarding_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_tasks" ADD CONSTRAINT "onboarding_tasks_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

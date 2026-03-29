CREATE EXTENSION IF NOT EXISTS "citext";

DROP TABLE IF EXISTS "learner_risk_assessments" CASCADE;
DROP TABLE IF EXISTS "certificates" CASCADE;
DROP TABLE IF EXISTS "attempt_response_options" CASCADE;
DROP TABLE IF EXISTS "attempt_responses" CASCADE;
DROP TABLE IF EXISTS "quiz_attempt_questions" CASCADE;
DROP TABLE IF EXISTS "quiz_attempts" CASCADE;
DROP TABLE IF EXISTS "quiz_questions" CASCADE;
DROP TABLE IF EXISTS "quizzes" CASCADE;
DROP TABLE IF EXISTS "question_options" CASCADE;
DROP TABLE IF EXISTS "questions" CASCADE;
DROP TABLE IF EXISTS "question_banks" CASCADE;
DROP TABLE IF EXISTS "lesson_progress" CASCADE;
DROP TABLE IF EXISTS "enrollments" CASCADE;
DROP TABLE IF EXISTS "lesson_resources" CASCADE;
DROP TABLE IF EXISTS "lessons" CASCADE;
DROP TABLE IF EXISTS "modules" CASCADE;
DROP TABLE IF EXISTS "course_tags" CASCADE;
DROP TABLE IF EXISTS "roadmap_assignments" CASCADE;
DROP TABLE IF EXISTS "roadmap_courses" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "roadmaps" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "role_permissions" CASCADE;
DROP TABLE IF EXISTS "user_roles" CASCADE;
DROP TABLE IF EXISTS "permissions" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "departments" CASCADE;
DROP TABLE IF EXISTS "exam_results" CASCADE;

DROP TYPE IF EXISTS "risk_level" CASCADE;
DROP TYPE IF EXISTS "quiz_attempt_status" CASCADE;
DROP TYPE IF EXISTS "quiz_selection_mode" CASCADE;
DROP TYPE IF EXISTS "question_kind" CASCADE;
DROP TYPE IF EXISTS "enrollment_status" CASCADE;
DROP TYPE IF EXISTS "lesson_progress_status" CASCADE;
DROP TYPE IF EXISTS "lesson_kind" CASCADE;
DROP TYPE IF EXISTS "course_status" CASCADE;
DROP TYPE IF EXISTS "roadmap_assignment_status" CASCADE;
DROP TYPE IF EXISTS "ResourceType" CASCADE;
DROP TYPE IF EXISTS "LessonType" CASCADE;
DROP TYPE IF EXISTS "EnrollmentStatus" CASCADE;
DROP TYPE IF EXISTS "CourseStatus" CASCADE;
DROP TYPE IF EXISTS "Role" CASCADE;

CREATE TYPE "roadmap_assignment_status" AS ENUM ('assigned', 'in_progress', 'completed', 'dropped');
CREATE TYPE "course_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "lesson_kind" AS ENUM ('video', 'article', 'quiz');
CREATE TYPE "lesson_progress_status" AS ENUM ('not_started', 'in_progress', 'completed', 'skipped');
CREATE TYPE "enrollment_status" AS ENUM ('assigned', 'in_progress', 'completed', 'cancelled', 'expired');
CREATE TYPE "question_kind" AS ENUM ('single_choice', 'multiple_choice', 'essay');
CREATE TYPE "quiz_selection_mode" AS ENUM ('fixed', 'random_pool');
CREATE TYPE "quiz_attempt_status" AS ENUM ('in_progress', 'submitted', 'graded', 'expired', 'abandoned');
CREATE TYPE "risk_level" AS ENUM ('low', 'medium', 'high');

CREATE TABLE "departments" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "manager_user_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roles" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permissions" (
    "id" BIGSERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
    "id" BIGSERIAL NOT NULL,
    "parent_id" BIGINT,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "department_id" BIGINT NOT NULL,
    "full_name" VARCHAR(150) NOT NULL,
    "position_title" VARCHAR(150),
    "email" CITEXT NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "avatar_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_roles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,
    "assigned_by_user_id" BIGINT,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permissions" (
    "id" BIGSERIAL NOT NULL,
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roadmaps" (
    "id" BIGSERIAL NOT NULL,
    "department_id" BIGINT NOT NULL,
    "category_id" BIGINT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "target_position" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" BIGINT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "courses" (
    "id" BIGSERIAL NOT NULL,
    "owner_department_id" BIGINT,
    "trainer_user_id" BIGINT NOT NULL,
    "category_id" BIGINT,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "thumbnail_url" VARCHAR(500),
    "status" "course_status" NOT NULL DEFAULT 'draft',
    "estimated_duration_minutes" INTEGER,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_tags" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_tags_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roadmap_courses" (
    "id" BIGSERIAL NOT NULL,
    "roadmap_id" BIGINT NOT NULL,
    "course_id" BIGINT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roadmap_courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "roadmap_assignments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "roadmap_id" BIGINT NOT NULL,
    "assigned_by_user_id" BIGINT,
    "status" "roadmap_assignment_status" NOT NULL DEFAULT 'assigned',
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "dropped_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roadmap_assignments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "modules" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lessons" (
    "id" BIGSERIAL NOT NULL,
    "module_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "lesson_type" "lesson_kind" NOT NULL,
    "content_text" TEXT,
    "video_url" VARCHAR(500),
    "duration_seconds" INTEGER NOT NULL DEFAULT 0,
    "order_index" INTEGER NOT NULL,
    "is_preview" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lesson_resources" (
    "id" BIGSERIAL NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "resource_type" VARCHAR(50),
    "order_index" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lesson_resources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollments" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "course_id" BIGINT NOT NULL,
    "assigned_by_user_id" BIGINT,
    "status" "enrollment_status" NOT NULL DEFAULT 'assigned',
    "progress_percent_cache" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "completed_lessons_count_cache" INTEGER NOT NULL DEFAULT 0,
    "time_spent_seconds_cache" INTEGER NOT NULL DEFAULT 0,
    "assignment_note" TEXT,
    "due_at" TIMESTAMPTZ(6),
    "enrolled_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "last_activity_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lesson_progress" (
    "id" BIGSERIAL NOT NULL,
    "enrollment_id" BIGINT NOT NULL,
    "lesson_id" BIGINT NOT NULL,
    "status" "lesson_progress_status" NOT NULL DEFAULT 'not_started',
    "watch_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "last_position_seconds" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "last_accessed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_banks" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT,
    "owner_trainer_id" BIGINT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
    "id" BIGSERIAL NOT NULL,
    "question_bank_id" BIGINT NOT NULL,
    "question_type" "question_kind" NOT NULL,
    "content" TEXT NOT NULL,
    "explanation" TEXT,
    "default_points" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "question_options" (
    "id" BIGSERIAL NOT NULL,
    "question_id" BIGINT NOT NULL,
    "content" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quizzes" (
    "id" BIGSERIAL NOT NULL,
    "course_id" BIGINT NOT NULL,
    "lesson_id" BIGINT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "selection_mode" "quiz_selection_mode" NOT NULL DEFAULT 'fixed',
    "pass_score_percent" DECIMAL(5,2) NOT NULL DEFAULT 70.00,
    "time_limit_minutes" INTEGER,
    "max_attempts" INTEGER,
    "questions_to_pull" INTEGER,
    "shuffle_questions" BOOLEAN NOT NULL DEFAULT true,
    "shuffle_options" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_questions" (
    "id" BIGSERIAL NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "question_id" BIGINT NOT NULL,
    "order_index" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 1,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_attempts" (
    "id" BIGSERIAL NOT NULL,
    "enrollment_id" BIGINT NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "attempt_no" INTEGER NOT NULL,
    "status" "quiz_attempt_status" NOT NULL DEFAULT 'in_progress',
    "objective_score" DECIMAL(6,2),
    "manual_score" DECIMAL(6,2),
    "total_score" DECIMAL(6,2),
    "is_passed" BOOLEAN,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ(6),
    "graded_at" TIMESTAMPTZ(6),
    "graded_by_user_id" BIGINT,
    "time_spent_seconds" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "quiz_attempt_questions" (
    "id" BIGSERIAL NOT NULL,
    "attempt_id" BIGINT NOT NULL,
    "quiz_question_id" BIGINT,
    "question_id" BIGINT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "max_points" INTEGER NOT NULL DEFAULT 1,
    "question_snapshot" JSONB NOT NULL,
    "options_snapshot" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_attempt_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attempt_responses" (
    "id" BIGSERIAL NOT NULL,
    "attempt_question_id" BIGINT NOT NULL,
    "response_text" TEXT,
    "is_correct" BOOLEAN,
    "awarded_points" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "graded_by_user_id" BIGINT,
    "graded_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attempt_responses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "attempt_response_options" (
    "id" BIGSERIAL NOT NULL,
    "attempt_response_id" BIGINT NOT NULL,
    "question_option_id" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "attempt_response_options_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "certificates" (
    "id" BIGSERIAL NOT NULL,
    "enrollment_id" BIGINT NOT NULL,
    "certificate_code" VARCHAR(100) NOT NULL,
    "pdf_url" VARCHAR(500),
    "issued_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learner_risk_assessments" (
    "id" BIGSERIAL NOT NULL,
    "enrollment_id" BIGINT NOT NULL,
    "risk_score" DECIMAL(5,2) NOT NULL,
    "risk_level" "risk_level" NOT NULL,
    "model_version" VARCHAR(50),
    "reasons" JSONB,
    "recommendations" TEXT,
    "interventions" TEXT,
    "calculated_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "learner_risk_assessments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");
CREATE UNIQUE INDEX "permissions_module_action_key" ON "permissions"("module", "action");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "categories_parent_id_name_key" ON "categories"("parent_id", "name");
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_department_id_idx" ON "users"("department_id");
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");
CREATE UNIQUE INDEX "course_tags_course_id_tag_id_key" ON "course_tags"("course_id", "tag_id");
CREATE UNIQUE INDEX "roadmap_courses_roadmap_id_course_id_key" ON "roadmap_courses"("roadmap_id", "course_id");
CREATE UNIQUE INDEX "roadmap_courses_roadmap_id_order_index_key" ON "roadmap_courses"("roadmap_id", "order_index");
CREATE UNIQUE INDEX "roadmap_assignments_user_id_roadmap_id_key" ON "roadmap_assignments"("user_id", "roadmap_id");
CREATE UNIQUE INDEX "modules_course_id_order_index_key" ON "modules"("course_id", "order_index");
CREATE UNIQUE INDEX "lessons_module_id_order_index_key" ON "lessons"("module_id", "order_index");
CREATE UNIQUE INDEX "lesson_resources_lesson_id_order_index_key" ON "lesson_resources"("lesson_id", "order_index");
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");
CREATE UNIQUE INDEX "lesson_progress_enrollment_id_lesson_id_key" ON "lesson_progress"("enrollment_id", "lesson_id");
CREATE UNIQUE INDEX "question_options_question_id_order_index_key" ON "question_options"("question_id", "order_index");
CREATE UNIQUE INDEX "quizzes_lesson_id_key" ON "quizzes"("lesson_id");
CREATE UNIQUE INDEX "quiz_questions_quiz_id_question_id_key" ON "quiz_questions"("quiz_id", "question_id");
CREATE UNIQUE INDEX "quiz_questions_quiz_id_order_index_key" ON "quiz_questions"("quiz_id", "order_index");
CREATE UNIQUE INDEX "quiz_attempts_enrollment_id_quiz_id_attempt_no_key" ON "quiz_attempts"("enrollment_id", "quiz_id", "attempt_no");
CREATE UNIQUE INDEX "quiz_attempt_questions_attempt_id_display_order_key" ON "quiz_attempt_questions"("attempt_id", "display_order");
CREATE UNIQUE INDEX "quiz_attempt_questions_attempt_id_question_id_key" ON "quiz_attempt_questions"("attempt_id", "question_id");
CREATE UNIQUE INDEX "attempt_responses_attempt_question_id_key" ON "attempt_responses"("attempt_question_id");
CREATE UNIQUE INDEX "attempt_response_options_attempt_response_id_question_option_id_key" ON "attempt_response_options"("attempt_response_id", "question_option_id");
CREATE UNIQUE INDEX "certificates_enrollment_id_key" ON "certificates"("enrollment_id");
CREATE UNIQUE INDEX "certificates_certificate_code_key" ON "certificates"("certificate_code");
CREATE INDEX "learner_risk_assessments_enrollment_id_calculated_at_idx" ON "learner_risk_assessments"("enrollment_id", "calculated_at");

ALTER TABLE "categories"
    ADD CONSTRAINT "categories_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "users"
    ADD CONSTRAINT "users_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "departments"
    ADD CONSTRAINT "departments_manager_user_id_fkey"
    FOREIGN KEY ("manager_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_roles"
    ADD CONSTRAINT "user_roles_assigned_by_user_id_fkey"
    FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey"
    FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey"
    FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmaps"
    ADD CONSTRAINT "roadmaps_department_id_fkey"
    FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmaps"
    ADD CONSTRAINT "roadmaps_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "roadmaps"
    ADD CONSTRAINT "roadmaps_created_by_user_id_fkey"
    FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "courses"
    ADD CONSTRAINT "courses_owner_department_id_fkey"
    FOREIGN KEY ("owner_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "courses"
    ADD CONSTRAINT "courses_trainer_user_id_fkey"
    FOREIGN KEY ("trainer_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "courses"
    ADD CONSTRAINT "courses_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "course_tags"
    ADD CONSTRAINT "course_tags_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "course_tags"
    ADD CONSTRAINT "course_tags_tag_id_fkey"
    FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap_courses"
    ADD CONSTRAINT "roadmap_courses_roadmap_id_fkey"
    FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap_courses"
    ADD CONSTRAINT "roadmap_courses_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap_assignments"
    ADD CONSTRAINT "roadmap_assignments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap_assignments"
    ADD CONSTRAINT "roadmap_assignments_roadmap_id_fkey"
    FOREIGN KEY ("roadmap_id") REFERENCES "roadmaps"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "roadmap_assignments"
    ADD CONSTRAINT "roadmap_assignments_assigned_by_user_id_fkey"
    FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "modules"
    ADD CONSTRAINT "modules_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lessons"
    ADD CONSTRAINT "lessons_module_id_fkey"
    FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lesson_resources"
    ADD CONSTRAINT "lesson_resources_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "enrollments"
    ADD CONSTRAINT "enrollments_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "enrollments"
    ADD CONSTRAINT "enrollments_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "enrollments"
    ADD CONSTRAINT "enrollments_assigned_by_user_id_fkey"
    FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lesson_progress"
    ADD CONSTRAINT "lesson_progress_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lesson_progress"
    ADD CONSTRAINT "lesson_progress_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "question_banks"
    ADD CONSTRAINT "question_banks_category_id_fkey"
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "question_banks"
    ADD CONSTRAINT "question_banks_owner_trainer_id_fkey"
    FOREIGN KEY ("owner_trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "questions"
    ADD CONSTRAINT "questions_question_bank_id_fkey"
    FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "question_options"
    ADD CONSTRAINT "question_options_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quizzes"
    ADD CONSTRAINT "quizzes_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quizzes"
    ADD CONSTRAINT "quizzes_lesson_id_fkey"
    FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "quiz_questions"
    ADD CONSTRAINT "quiz_questions_quiz_id_fkey"
    FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quiz_questions"
    ADD CONSTRAINT "quiz_questions_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_quiz_id_fkey"
    FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_graded_by_user_id_fkey"
    FOREIGN KEY ("graded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_attempt_id_fkey"
    FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_quiz_question_id_fkey"
    FOREIGN KEY ("quiz_question_id") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attempt_responses"
    ADD CONSTRAINT "attempt_responses_attempt_question_id_fkey"
    FOREIGN KEY ("attempt_question_id") REFERENCES "quiz_attempt_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attempt_responses"
    ADD CONSTRAINT "attempt_responses_graded_by_user_id_fkey"
    FOREIGN KEY ("graded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "attempt_response_options"
    ADD CONSTRAINT "attempt_response_options_attempt_response_id_fkey"
    FOREIGN KEY ("attempt_response_id") REFERENCES "attempt_responses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "attempt_response_options"
    ADD CONSTRAINT "attempt_response_options_question_option_id_fkey"
    FOREIGN KEY ("question_option_id") REFERENCES "question_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "certificates"
    ADD CONSTRAINT "certificates_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "learner_risk_assessments"
    ADD CONSTRAINT "learner_risk_assessments_enrollment_id_fkey"
    FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "roles" ("code", "name", "description", "is_system")
VALUES
    ('admin', 'Administrator', 'Full system access', true),
    ('manager', 'Manager', 'Department and assignment management', true),
    ('trainer', 'Trainer', 'Course and quiz authoring', true),
    ('employee', 'Employee', 'Learner access', true)
ON CONFLICT ("code") DO NOTHING;

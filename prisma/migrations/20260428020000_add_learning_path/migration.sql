-- Module 1: Lộ trình Học tập Thích ứng — DAG 50 nodes + edges + employee test results

-- CreateEnum
CREATE TYPE "CurriculumNodeCategory" AS ENUM ('soft_skills', 'company', 'professional', 'compliance', 'leadership');

-- CreateTable
CREATE TABLE "curriculum_nodes" (
    "id" VARCHAR(10) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "category" "CurriculumNodeCategory" NOT NULL,
    "estimated_hours" INTEGER NOT NULL DEFAULT 2,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "curriculum_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_edges" (
    "id" SERIAL NOT NULL,
    "from_id" VARCHAR(10) NOT NULL,
    "to_id" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_skill_test_results" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "node_id" VARCHAR(10) NOT NULL,
    "score" SMALLINT,
    "source" VARCHAR(20) NOT NULL DEFAULT 'entry_test',
    "passed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_skill_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "curriculum_nodes_category_idx" ON "curriculum_nodes"("category");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_edges_from_id_to_id_key" ON "curriculum_edges"("from_id", "to_id");

-- CreateIndex
CREATE INDEX "curriculum_edges_to_id_idx" ON "curriculum_edges"("to_id");

-- CreateIndex
CREATE INDEX "employee_skill_test_results_user_id_idx" ON "employee_skill_test_results"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_skill_test_results_user_id_node_id_key" ON "employee_skill_test_results"("user_id", "node_id");

-- AddForeignKey
ALTER TABLE "curriculum_edges" ADD CONSTRAINT "curriculum_edges_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "curriculum_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_edges" ADD CONSTRAINT "curriculum_edges_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "curriculum_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skill_test_results" ADD CONSTRAINT "employee_skill_test_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_skill_test_results" ADD CONSTRAINT "employee_skill_test_results_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "curriculum_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

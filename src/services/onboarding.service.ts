import type { Prisma } from '@prisma/client';
import { generateContentWithFallback } from '@/utils/ai-generate';
import { prisma } from '@/config/database';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ========================
// Types
// ========================

export type OnboardingTaskCategory =
  | 'learning'
  | 'admin'
  | 'meeting'
  | 'practice'
  | 'review'
  | 'other';
export type OnboardingTaskPriority = 'low' | 'medium' | 'high';
export type OnboardingTaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped';
export type OnboardingPlanStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface OnboardingTaskDto {
  id: string;
  title: string;
  description: string | null;
  category: OnboardingTaskCategory;
  priority: OnboardingTaskPriority;
  estimatedHours: number;
  orderIndex: number;
  courseId: string | null;
  courseTitle: string | null;
  resourceUrl: string | null;
  status: OnboardingTaskStatus;
  completedAt: string | null;
  completedById: string | null;
  completedByName: string | null;
  managerNote: string | null;
}

export interface OnboardingStageDto {
  id: string;
  name: string;
  description: string | null;
  orderIndex: number;
  startOffsetDays: number;
  endOffsetDays: number;
  tasks: OnboardingTaskDto[];
}

export interface OnboardingTemplateSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  targetPosition: string | null;
  departmentId: string | null;
  departmentName: string | null;
  totalDays: number;
  isActive: boolean;
  isSystem: boolean;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  stageCount: number;
  planCount: number;
}

export interface OnboardingTemplateDetail extends OnboardingTemplateSummary {
  stages: OnboardingStageDto[];
}

export interface OnboardingPlanSummary {
  id: string;
  templateId: string | null;
  templateName: string;
  assigneeId: string;
  assigneeName: string;
  assigneePosition: string | null;
  assigneeAvatarUrl: string | null;
  managerId: string;
  managerName: string;
  startDate: string;
  status: OnboardingPlanStatus;
  notes: string | null;
  totalDays: number;
  totalTaskCount: number;
  completedTaskCount: number;
  progressPercent: number;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingPlanDetail extends OnboardingPlanSummary {
  stages: OnboardingStageDto[];
}

export interface AiTaskSuggestion {
  title: string;
  description: string;
  category: OnboardingTaskCategory;
  priority: OnboardingTaskPriority;
  estimatedHours: number;
}

export interface AiStageSuggestion {
  name: string;
  description: string;
  startOffsetDays: number;
  endOffsetDays: number;
  tasks: AiTaskSuggestion[];
}

export interface AiTemplateSuggestion {
  name: string;
  description: string;
  totalDays: number;
  stages: AiStageSuggestion[];
}

export interface AiGenerateInput {
  targetPosition: string;
  departmentName?: string | null;
  totalDays?: number;
  toneHint?: string | null;
  extraNotes?: string | null;
}

// ========================
// Helpers
// ========================

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stripJsonFence = (value: string): string => {
  let cleaned = value.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
};

const parseJsonObject = (value: string): Record<string, unknown> | null => {
  try {
    const parsed: unknown = JSON.parse(stripJsonFence(value));
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const TASK_CATEGORIES: OnboardingTaskCategory[] = [
  'learning',
  'admin',
  'meeting',
  'practice',
  'review',
  'other',
];
const TASK_PRIORITIES: OnboardingTaskPriority[] = ['low', 'medium', 'high'];
const TASK_STATUSES: OnboardingTaskStatus[] = ['pending', 'in_progress', 'done', 'skipped'];
const PLAN_STATUSES: OnboardingPlanStatus[] = ['active', 'completed', 'paused', 'cancelled'];

const normalizeCategory = (value: unknown): OnboardingTaskCategory => {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    const found = TASK_CATEGORIES.find((c) => c === lower);
    if (found) return found;
  }
  return 'learning';
};

const normalizePriority = (value: unknown): OnboardingTaskPriority => {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    const found = TASK_PRIORITIES.find((c) => c === lower);
    if (found) return found;
  }
  return 'medium';
};

const normalizeTaskStatus = (value: unknown): OnboardingTaskStatus => {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    const found = TASK_STATUSES.find((c) => c === lower);
    if (found) return found;
  }
  return 'pending';
};

const normalizePlanStatus = (value: unknown): OnboardingPlanStatus => {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    const found = PLAN_STATUSES.find((c) => c === lower);
    if (found) return found;
  }
  return 'active';
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || `template-${Date.now()}`;

// ========================
// Mappers
// ========================

type StageWithTasks = Prisma.OnboardingStageGetPayload<{
  include: { tasks: { include: { course: true; completedBy: true } } };
}>;

type TemplateWithRelations = Prisma.OnboardingTemplateGetPayload<{
  include: {
    department: true;
    createdBy: true;
    stages: { include: { tasks: { include: { course: true; completedBy: true } } } };
    _count: { select: { plans: true } };
  };
}>;

type PlanWithRelations = Prisma.OnboardingPlanGetPayload<{
  include: {
    assignee: true;
    manager: true;
    stages: { include: { tasks: { include: { course: true; completedBy: true } } } };
  };
}>;

const toTaskDto = (task: StageWithTasks['tasks'][number]): OnboardingTaskDto => ({
  id: task.id.toString(),
  title: task.title,
  description: task.description,
  category: normalizeCategory(task.category),
  priority: normalizePriority(task.priority),
  estimatedHours: task.estimatedHours,
  orderIndex: task.orderIndex,
  courseId: task.courseId?.toString() ?? null,
  courseTitle: task.course?.title ?? null,
  resourceUrl: task.resourceUrl,
  status: normalizeTaskStatus(task.status),
  completedAt: task.completedAt?.toISOString() ?? null,
  completedById: task.completedById?.toString() ?? null,
  completedByName: task.completedBy?.fullName ?? null,
  managerNote: task.managerNote,
});

const toStageDto = (stage: StageWithTasks): OnboardingStageDto => ({
  id: stage.id.toString(),
  name: stage.name,
  description: stage.description,
  orderIndex: stage.orderIndex,
  startOffsetDays: stage.startOffsetDays,
  endOffsetDays: stage.endOffsetDays,
  tasks: [...stage.tasks].sort((a, b) => a.orderIndex - b.orderIndex).map(toTaskDto),
});

const toTemplateSummary = (template: TemplateWithRelations): OnboardingTemplateSummary => {
  const taskCount = template.stages.reduce((acc, s) => acc + s.tasks.length, 0);
  return {
    id: template.id.toString(),
    slug: template.slug,
    name: template.name,
    description: template.description,
    targetPosition: template.targetPosition,
    departmentId: template.departmentId?.toString() ?? null,
    departmentName: template.department?.name ?? null,
    totalDays: template.totalDays,
    isActive: template.isActive,
    isSystem: template.isSystem,
    createdById: template.createdById?.toString() ?? null,
    createdByName: template.createdBy?.fullName ?? null,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    taskCount,
    stageCount: template.stages.length,
    planCount: template._count.plans,
  };
};

const toTemplateDetail = (template: TemplateWithRelations): OnboardingTemplateDetail => ({
  ...toTemplateSummary(template),
  stages: [...template.stages].sort((a, b) => a.orderIndex - b.orderIndex).map(toStageDto),
});

const computePlanProgress = (
  stages: PlanWithRelations['stages'],
): { totalTaskCount: number; completedTaskCount: number; progressPercent: number } => {
  let total = 0;
  let done = 0;
  stages.forEach((s) => {
    s.tasks.forEach((t) => {
      total += 1;
      if (t.status === 'done' || t.status === 'skipped') done += 1;
    });
  });
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { totalTaskCount: total, completedTaskCount: done, progressPercent: percent };
};

const toPlanSummary = (plan: PlanWithRelations): OnboardingPlanSummary => {
  const progress = computePlanProgress(plan.stages);
  // Derive totalDays from stages' max endOffsetDays
  const totalDays = plan.stages.reduce(
    (max, s) => (s.endOffsetDays > max ? s.endOffsetDays : max),
    0,
  );
  return {
    id: plan.id.toString(),
    templateId: plan.templateId?.toString() ?? null,
    templateName: plan.templateName,
    assigneeId: plan.assigneeId.toString(),
    assigneeName: plan.assignee.fullName,
    assigneePosition: plan.assignee.positionTitle,
    assigneeAvatarUrl: plan.assignee.avatarUrl,
    managerId: plan.managerId.toString(),
    managerName: plan.manager.fullName,
    startDate: plan.startDate.toISOString().slice(0, 10),
    status: normalizePlanStatus(plan.status),
    notes: plan.notes,
    totalDays: totalDays || 90,
    totalTaskCount: progress.totalTaskCount,
    completedTaskCount: progress.completedTaskCount,
    progressPercent: progress.progressPercent,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  };
};

const toPlanDetail = (plan: PlanWithRelations): OnboardingPlanDetail => ({
  ...toPlanSummary(plan),
  stages: [...plan.stages].sort((a, b) => a.orderIndex - b.orderIndex).map(toStageDto),
});

// ========================
// AI System Prompt (Vietnamese)
// ========================

const AI_TEMPLATE_SYSTEM_PROMPT = `Bạn là một HR Business Partner chuyên thiết kế lộ trình onboarding 30/60/90 ngày cho doanh nghiệp Việt Nam.

Khi nhận thông tin về vị trí, phòng ban, số ngày onboarding, hãy thiết kế một lộ trình thực tế gồm các giai đoạn (stage) và các task cụ thể.

Yêu cầu output **CHỈ** ở dạng JSON hợp lệ, theo schema:
{
  "name": "Tên lộ trình ngắn gọn (vd: 'Onboarding Junior Backend Developer 30/60/90 ngày')",
  "description": "Mô tả 1-2 câu về lộ trình.",
  "totalDays": 90,
  "stages": [
    {
      "name": "30 ngày đầu — Định hướng & Hội nhập",
      "description": "Mục tiêu của giai đoạn (1 câu).",
      "startOffsetDays": 0,
      "endOffsetDays": 30,
      "tasks": [
        {
          "title": "Task ngắn, hành động cụ thể",
          "description": "Mô tả 1-2 câu hướng dẫn.",
          "category": "learning" | "admin" | "meeting" | "practice" | "review" | "other",
          "priority": "low" | "medium" | "high",
          "estimatedHours": 1..40
        }
      ]
    }
  ]
}

Quy tắc:
- Tổng số ngày phải khớp với input (mặc định 90). Chia thành 3 stage nếu totalDays = 90 (0-30, 31-60, 61-90); 2 stage nếu 60; 1 stage nếu 30.
- Mỗi stage có 4-7 task. Tổng task toàn lộ trình 12-21.
- Task tiếng Việt tự nhiên, dùng động từ chủ động: "Tham gia buổi orientation", "Hoàn thành khóa học X", "1-1 với Tech Lead về codebase".
- Phối trộn category đa dạng: learning (đào tạo nội bộ/khóa), admin (giấy tờ, setup), meeting (1-1, sync), practice (làm task thật), review (đánh giá milestone).
- Stage 1 ưu tiên onboarding admin + giới thiệu team + tài liệu nội bộ.
- Stage 2 đẩy mạnh practice trên dự án thật + mentor pair.
- Stage 3 cho vai trò chủ động dẫn 1 phần việc, có review milestone với manager.
- estimatedHours: ước tính tổng giờ task. Đa số task 1-4h, một vài task lớn 8-16h.
- Không lặp lại tên task.
- Không output text ngoài JSON.`;

const buildUserPrompt = (input: AiGenerateInput): string => {
  const totalDays = input.totalDays ?? 90;
  const lines = [
    `Vị trí cần onboard: ${input.targetPosition}`,
    input.departmentName ? `Phòng ban: ${input.departmentName}` : 'Phòng ban: (không xác định)',
    `Tổng số ngày: ${totalDays}`,
  ];
  if (input.toneHint) lines.push(`Tone gợi ý: ${input.toneHint}`);
  if (input.extraNotes) lines.push(`Ghi chú thêm: ${input.extraNotes}`);
  lines.push('Hãy thiết kế lộ trình theo schema yêu cầu.');
  return lines.join('\n');
};

// ========================
// AI generate
// ========================

const sanitizeAiTask = (raw: unknown): AiTaskSuggestion | null => {
  if (!isRecord(raw)) return null;
  const title = typeof raw['title'] === 'string' ? raw['title'].trim() : '';
  if (!title) return null;
  const description = typeof raw['description'] === 'string' ? raw['description'].trim() : '';
  const hoursRaw = raw['estimatedHours'];
  const estimatedHours =
    typeof hoursRaw === 'number' && Number.isFinite(hoursRaw)
      ? Math.max(1, Math.min(80, Math.round(hoursRaw)))
      : 2;
  return {
    title: title.slice(0, 250),
    description: description.slice(0, 1000),
    category: normalizeCategory(raw['category']),
    priority: normalizePriority(raw['priority']),
    estimatedHours,
  };
};

const sanitizeAiStage = (raw: unknown): AiStageSuggestion | null => {
  if (!isRecord(raw)) return null;
  const name = typeof raw['name'] === 'string' ? raw['name'].trim() : '';
  if (!name) return null;
  const description = typeof raw['description'] === 'string' ? raw['description'].trim() : '';
  const startOffsetDays =
    typeof raw['startOffsetDays'] === 'number'
      ? Math.max(0, Math.round(raw['startOffsetDays']))
      : 0;
  const endOffsetDays =
    typeof raw['endOffsetDays'] === 'number'
      ? Math.max(startOffsetDays + 1, Math.round(raw['endOffsetDays']))
      : startOffsetDays + 30;
  const tasksRaw = Array.isArray(raw['tasks']) ? raw['tasks'] : [];
  const tasks = tasksRaw
    .map(sanitizeAiTask)
    .filter((t): t is AiTaskSuggestion => t !== null)
    .slice(0, 10);
  return {
    name: name.slice(0, 120),
    description: description.slice(0, 500),
    startOffsetDays,
    endOffsetDays,
    tasks,
  };
};

const buildFallbackSuggestion = (input: AiGenerateInput): AiTemplateSuggestion => {
  const totalDays = input.totalDays ?? 90;
  const position = input.targetPosition;
  return {
    name: `Onboarding ${position} ${totalDays} ngày`,
    description: `Lộ trình onboarding chuẩn ${totalDays} ngày cho vị trí ${position}.`,
    totalDays,
    stages: [
      {
        name: '30 ngày đầu — Định hướng & Hội nhập',
        description: 'Làm quen team, công cụ, quy trình nội bộ.',
        startOffsetDays: 0,
        endOffsetDays: 30,
        tasks: [
          {
            title: 'Buổi orientation cùng HR',
            description: 'Giới thiệu công ty, văn hoá, chính sách nhân sự.',
            category: 'meeting',
            priority: 'high',
            estimatedHours: 2,
          },
          {
            title: 'Setup tài khoản & môi trường làm việc',
            description: 'Email, công cụ nội bộ, máy tính, quyền truy cập.',
            category: 'admin',
            priority: 'high',
            estimatedHours: 3,
          },
          {
            title: '1-1 với manager trực tiếp',
            description: 'Định hướng vai trò, kỳ vọng 30 ngày đầu.',
            category: 'meeting',
            priority: 'high',
            estimatedHours: 1,
          },
          {
            title: 'Đọc tài liệu nội bộ phòng ban',
            description: 'Wiki, quy trình, tài liệu kỹ thuật cốt lõi.',
            category: 'learning',
            priority: 'medium',
            estimatedHours: 8,
          },
          {
            title: 'Shadow đồng nghiệp 2 ngày',
            description: 'Quan sát nhịp làm việc thực tế của team.',
            category: 'practice',
            priority: 'medium',
            estimatedHours: 16,
          },
        ],
      },
      ...(totalDays >= 60
        ? [
            {
              name: 'Day 31-60 — Bắt nhịp & Giao việc thật',
              description: 'Bắt đầu nhận task nhỏ, cặp với mentor.',
              startOffsetDays: 30,
              endOffsetDays: Math.min(60, totalDays),
              tasks: [
                {
                  title: 'Hoàn thành task đầu tiên cùng mentor',
                  description: 'Pair-work hoặc review chặt với mentor.',
                  category: 'practice' as OnboardingTaskCategory,
                  priority: 'high' as OnboardingTaskPriority,
                  estimatedHours: 16,
                },
                {
                  title: 'Tham gia 2 buổi sync team',
                  description: 'Nắm bối cảnh dự án đang chạy.',
                  category: 'meeting' as OnboardingTaskCategory,
                  priority: 'medium' as OnboardingTaskPriority,
                  estimatedHours: 2,
                },
                {
                  title: 'Review giữa kỳ với manager',
                  description: 'Phản hồi 2 chiều: bạn cần gì + manager kỳ vọng gì.',
                  category: 'review' as OnboardingTaskCategory,
                  priority: 'high' as OnboardingTaskPriority,
                  estimatedHours: 1,
                },
              ],
            },
          ]
        : []),
      ...(totalDays >= 90
        ? [
            {
              name: 'Day 61-90 — Chủ động & Kết thúc onboarding',
              description: 'Nhận trách nhiệm độc lập, hoàn tất lộ trình.',
              startOffsetDays: 60,
              endOffsetDays: totalDays,
              tasks: [
                {
                  title: 'Dẫn 1 sub-task end-to-end',
                  description: 'Từ phân tích → triển khai → release.',
                  category: 'practice' as OnboardingTaskCategory,
                  priority: 'high' as OnboardingTaskPriority,
                  estimatedHours: 24,
                },
                {
                  title: 'Đánh giá 90 ngày cùng manager',
                  description: 'Tổng kết, khoá lộ trình onboarding.',
                  category: 'review' as OnboardingTaskCategory,
                  priority: 'high' as OnboardingTaskPriority,
                  estimatedHours: 1,
                },
              ],
            },
          ]
        : []),
    ],
  };
};

export const generateAiTemplateSuggestion = async (
  input: AiGenerateInput,
): Promise<AiTemplateSuggestion> => {
  await ensureModuleEnabled('chatbot', 'Onboarding AI generator');
  const cfg = await getEffectiveConfig();
  const userPrompt = buildUserPrompt(input);
  const fallback = () => buildFallbackSuggestion(input);

  try {
    const response = await generateContentWithFallback({
      model: cfg.chatModel,
      contents: [{ role: 'user' as const, parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: AI_TEMPLATE_SYSTEM_PROMPT,
        temperature: 0.4,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonObject(response.text ?? '');
    if (!parsed) {
      logger.warn('Onboarding AI: failed to parse response, using fallback');
      return fallback();
    }

    const stagesRaw = Array.isArray(parsed['stages']) ? parsed['stages'] : [];
    const stages = stagesRaw
      .map(sanitizeAiStage)
      .filter((s): s is AiStageSuggestion => s !== null)
      .slice(0, 6);

    if (stages.length === 0) {
      logger.warn('Onboarding AI: no valid stages, using fallback');
      return fallback();
    }

    const totalDays = (() => {
      const fromAi = typeof parsed['totalDays'] === 'number' ? Math.round(parsed['totalDays']) : 0;
      if (fromAi > 0 && fromAi <= 365) return fromAi;
      return input.totalDays ?? 90;
    })();

    const name =
      typeof parsed['name'] === 'string' && parsed['name'].trim().length > 0
        ? parsed['name'].trim().slice(0, 200)
        : `Onboarding ${input.targetPosition} ${totalDays} ngày`;
    const description =
      typeof parsed['description'] === 'string' ? parsed['description'].trim().slice(0, 1000) : '';

    return { name, description, totalDays, stages };
  } catch (error) {
    logger.error('Onboarding AI generation failed', error);
    return fallback();
  }
};

// ========================
// Template CRUD
// ========================

const TEMPLATE_INCLUDE = {
  department: true,
  createdBy: true,
  stages: {
    include: {
      tasks: {
        include: { course: true, completedBy: true },
        orderBy: { orderIndex: 'asc' as const },
      },
    },
    orderBy: { orderIndex: 'asc' as const },
  },
  _count: { select: { plans: true } },
} satisfies Prisma.OnboardingTemplateInclude;

const PLAN_INCLUDE = {
  assignee: true,
  manager: true,
  stages: {
    include: {
      tasks: {
        include: { course: true, completedBy: true },
        orderBy: { orderIndex: 'asc' as const },
      },
    },
    orderBy: { orderIndex: 'asc' as const },
  },
} satisfies Prisma.OnboardingPlanInclude;

export interface ListTemplatesFilter {
  isActive?: boolean;
  departmentId?: string;
  search?: string;
}

export const listTemplates = async (
  filter: ListTemplatesFilter = {},
): Promise<OnboardingTemplateSummary[]> => {
  const where: Prisma.OnboardingTemplateWhereInput = {};
  if (filter.isActive !== undefined) where.isActive = filter.isActive;
  if (filter.departmentId) where.departmentId = BigInt(filter.departmentId);
  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
      { targetPosition: { contains: filter.search, mode: 'insensitive' } },
    ];
  }
  const templates = await prisma.onboardingTemplate.findMany({
    where,
    include: TEMPLATE_INCLUDE,
    orderBy: [{ isSystem: 'desc' }, { updatedAt: 'desc' }],
  });
  return templates.map(toTemplateSummary);
};

export const getTemplateDetail = async (id: string): Promise<OnboardingTemplateDetail> => {
  const template = await prisma.onboardingTemplate.findUnique({
    where: { id: BigInt(id) },
    include: TEMPLATE_INCLUDE,
  });
  if (!template) {
    throw new AppError('Không tìm thấy lộ trình onboarding.', 404);
  }
  return toTemplateDetail(template);
};

export interface UpsertTaskInput {
  id?: string;
  title: string;
  description?: string | null;
  category?: OnboardingTaskCategory;
  priority?: OnboardingTaskPriority;
  estimatedHours?: number;
  courseId?: string | null;
  resourceUrl?: string | null;
}

export interface UpsertStageInput {
  id?: string;
  name: string;
  description?: string | null;
  startOffsetDays: number;
  endOffsetDays: number;
  tasks: UpsertTaskInput[];
}

export interface UpsertTemplateInput {
  name: string;
  description?: string;
  targetPosition?: string | null;
  departmentId?: string | null;
  totalDays?: number;
  isActive?: boolean;
  stages: UpsertStageInput[];
}

const ensureUniqueSlug = async (base: string, ignoreId?: bigint): Promise<string> => {
  let slug = slugify(base);
  let suffix = 0;
  // Loop until unique
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await prisma.onboardingTemplate.findUnique({
      where: { slug: candidate },
    });
    if (!existing || (ignoreId && existing.id === ignoreId)) {
      return candidate;
    }
    suffix += 1;
    slug = slugify(base);
  }
};

const writeStagesAndTasks = async (
  tx: Prisma.TransactionClient,
  ownerKey: { templateId?: bigint; planId?: bigint },
  stages: UpsertStageInput[],
): Promise<void> => {
  // Wipe existing stages (cascades tasks) and recreate — simpler than diff-merge for MVP
  if (ownerKey.templateId) {
    await tx.onboardingStage.deleteMany({ where: { templateId: ownerKey.templateId } });
  } else if (ownerKey.planId) {
    await tx.onboardingStage.deleteMany({ where: { planId: ownerKey.planId } });
  }

  for (let i = 0; i < stages.length; i += 1) {
    const stage = stages[i];
    const created = await tx.onboardingStage.create({
      data: {
        templateId: ownerKey.templateId,
        planId: ownerKey.planId,
        name: stage.name.slice(0, 120),
        description: stage.description?.slice(0, 500) ?? null,
        orderIndex: i,
        startOffsetDays: Math.max(0, Math.round(stage.startOffsetDays)),
        endOffsetDays: Math.max(
          Math.round(stage.startOffsetDays) + 1,
          Math.round(stage.endOffsetDays),
        ),
      },
    });

    if (stage.tasks.length === 0) continue;

    await tx.onboardingTask.createMany({
      data: stage.tasks.map((task, idx) => ({
        stageId: created.id,
        title: task.title.slice(0, 250),
        description: task.description?.slice(0, 1000) ?? null,
        category: normalizeCategory(task.category),
        priority: normalizePriority(task.priority),
        estimatedHours: Math.max(1, Math.min(80, Math.round(task.estimatedHours ?? 2))),
        orderIndex: idx,
        courseId: task.courseId ? BigInt(task.courseId) : null,
        resourceUrl: task.resourceUrl?.slice(0, 500) ?? null,
        status: 'pending',
      })),
    });
  }
};

export const createTemplate = async (
  input: UpsertTemplateInput,
  createdById: string,
): Promise<OnboardingTemplateDetail> => {
  const slug = await ensureUniqueSlug(input.name);
  const template = await prisma.$transaction(async (tx) => {
    const created = await tx.onboardingTemplate.create({
      data: {
        slug,
        name: input.name.slice(0, 200),
        description: (input.description ?? '').slice(0, 1000),
        targetPosition: input.targetPosition?.slice(0, 150) ?? null,
        departmentId: input.departmentId ? BigInt(input.departmentId) : null,
        totalDays: Math.max(1, Math.min(365, Math.round(input.totalDays ?? 90))),
        isActive: input.isActive ?? true,
        isSystem: false,
        createdById: BigInt(createdById),
      },
    });
    await writeStagesAndTasks(tx, { templateId: created.id }, input.stages);
    return created;
  });
  return getTemplateDetail(template.id.toString());
};

export const updateTemplate = async (
  id: string,
  input: UpsertTemplateInput,
): Promise<OnboardingTemplateDetail> => {
  const existing = await prisma.onboardingTemplate.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError('Không tìm thấy lộ trình.', 404);
  if (existing.isSystem) {
    throw new AppError('Không thể chỉnh sửa lộ trình hệ thống. Hãy nhân bản trước.', 400);
  }

  await prisma.$transaction(async (tx) => {
    await tx.onboardingTemplate.update({
      where: { id: BigInt(id) },
      data: {
        name: input.name.slice(0, 200),
        description: (input.description ?? '').slice(0, 1000),
        targetPosition: input.targetPosition?.slice(0, 150) ?? null,
        departmentId: input.departmentId ? BigInt(input.departmentId) : null,
        totalDays: Math.max(1, Math.min(365, Math.round(input.totalDays ?? 90))),
        isActive: input.isActive ?? existing.isActive,
      },
    });
    await writeStagesAndTasks(tx, { templateId: BigInt(id) }, input.stages);
  });

  return getTemplateDetail(id);
};

export const deleteTemplate = async (id: string): Promise<void> => {
  const existing = await prisma.onboardingTemplate.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError('Không tìm thấy lộ trình.', 404);
  if (existing.isSystem) {
    throw new AppError('Không thể xoá lộ trình hệ thống.', 400);
  }
  await prisma.onboardingTemplate.delete({ where: { id: BigInt(id) } });
};

export const cloneTemplate = async (
  id: string,
  createdById: string,
): Promise<OnboardingTemplateDetail> => {
  const detail = await getTemplateDetail(id);
  return createTemplate(
    {
      name: `${detail.name} (bản sao)`,
      description: detail.description,
      targetPosition: detail.targetPosition,
      departmentId: detail.departmentId,
      totalDays: detail.totalDays,
      isActive: true,
      stages: detail.stages.map((stage) => ({
        name: stage.name,
        description: stage.description,
        startOffsetDays: stage.startOffsetDays,
        endOffsetDays: stage.endOffsetDays,
        tasks: stage.tasks.map((task) => ({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          courseId: task.courseId,
          resourceUrl: task.resourceUrl,
        })),
      })),
    },
    createdById,
  );
};

// ========================
// Plan CRUD
// ========================

export interface AssignPlanInput {
  templateId: string;
  assigneeId: string;
  startDate: string; // YYYY-MM-DD
  notes?: string | null;
}

export const assignPlanFromTemplate = async (
  input: AssignPlanInput,
  managerId: string,
): Promise<OnboardingPlanDetail> => {
  const template = await prisma.onboardingTemplate.findUnique({
    where: { id: BigInt(input.templateId) },
    include: TEMPLATE_INCLUDE,
  });
  if (!template) throw new AppError('Không tìm thấy lộ trình.', 404);

  const assignee = await prisma.user.findUnique({
    where: { id: BigInt(input.assigneeId) },
    select: { id: true, isActive: true },
  });
  if (!assignee || !assignee.isActive) {
    throw new AppError('Không tìm thấy nhân sự được giao.', 404);
  }

  const startDate = new Date(`${input.startDate}T00:00:00.000Z`);
  if (Number.isNaN(startDate.getTime())) {
    throw new AppError('Ngày bắt đầu không hợp lệ.', 400);
  }

  const plan = await prisma.$transaction(async (tx) => {
    const created = await tx.onboardingPlan.create({
      data: {
        templateId: template.id,
        templateName: template.name,
        assigneeId: BigInt(input.assigneeId),
        managerId: BigInt(managerId),
        startDate,
        status: 'active',
        notes: input.notes?.slice(0, 1000) ?? null,
      },
    });

    // Snapshot stages + tasks from template
    const sortedStages = [...template.stages].sort((a, b) => a.orderIndex - b.orderIndex);
    for (let i = 0; i < sortedStages.length; i += 1) {
      const stage = sortedStages[i];
      const newStage = await tx.onboardingStage.create({
        data: {
          planId: created.id,
          name: stage.name,
          description: stage.description,
          orderIndex: i,
          startOffsetDays: stage.startOffsetDays,
          endOffsetDays: stage.endOffsetDays,
        },
      });
      const sortedTasks = [...stage.tasks].sort((a, b) => a.orderIndex - b.orderIndex);
      if (sortedTasks.length > 0) {
        await tx.onboardingTask.createMany({
          data: sortedTasks.map((task, idx) => ({
            stageId: newStage.id,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            estimatedHours: task.estimatedHours,
            orderIndex: idx,
            courseId: task.courseId,
            resourceUrl: task.resourceUrl,
            status: 'pending',
          })),
        });
      }
    }
    return created;
  });

  return getPlanDetail(plan.id.toString());
};

export const getPlanDetail = async (id: string): Promise<OnboardingPlanDetail> => {
  const plan = await prisma.onboardingPlan.findUnique({
    where: { id: BigInt(id) },
    include: PLAN_INCLUDE,
  });
  if (!plan) throw new AppError('Không tìm thấy onboarding plan.', 404);
  return toPlanDetail(plan);
};

export interface ListPlansFilter {
  status?: OnboardingPlanStatus;
  assigneeId?: string;
  managerId?: string;
}

export const listPlans = async (filter: ListPlansFilter): Promise<OnboardingPlanSummary[]> => {
  const where: Prisma.OnboardingPlanWhereInput = {};
  if (filter.status) where.status = filter.status;
  if (filter.assigneeId) where.assigneeId = BigInt(filter.assigneeId);
  if (filter.managerId) where.managerId = BigInt(filter.managerId);
  const plans = await prisma.onboardingPlan.findMany({
    where,
    include: PLAN_INCLUDE,
    orderBy: [{ status: 'asc' }, { startDate: 'desc' }],
  });
  return plans.map(toPlanSummary);
};

export interface UpdatePlanInput {
  startDate?: string;
  status?: OnboardingPlanStatus;
  notes?: string | null;
}

export const updatePlan = async (
  id: string,
  input: UpdatePlanInput,
): Promise<OnboardingPlanDetail> => {
  const existing = await prisma.onboardingPlan.findUnique({ where: { id: BigInt(id) } });
  if (!existing) throw new AppError('Không tìm thấy onboarding plan.', 404);

  const data: Prisma.OnboardingPlanUpdateInput = {};
  if (input.startDate) {
    const date = new Date(`${input.startDate}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) throw new AppError('Ngày bắt đầu không hợp lệ.', 400);
    data.startDate = date;
  }
  if (input.status) data.status = normalizePlanStatus(input.status);
  if (input.notes !== undefined) data.notes = input.notes?.slice(0, 1000) ?? null;

  await prisma.onboardingPlan.update({ where: { id: BigInt(id) }, data });
  return getPlanDetail(id);
};

export const deletePlan = async (id: string): Promise<void> => {
  await prisma.onboardingPlan.delete({ where: { id: BigInt(id) } });
};

// ========================
// Plan task status (employee)
// ========================

export interface UpdateTaskStatusInput {
  status: OnboardingTaskStatus;
  managerNote?: string | null;
}

export const updatePlanTaskStatus = async (
  planId: string,
  taskId: string,
  input: UpdateTaskStatusInput,
  actingUserId: string,
): Promise<OnboardingPlanDetail> => {
  const task = await prisma.onboardingTask.findUnique({
    where: { id: BigInt(taskId) },
    include: { stage: true },
  });
  if (!task || task.stage.planId?.toString() !== planId) {
    throw new AppError('Không tìm thấy task trong onboarding plan này.', 404);
  }

  const status = normalizeTaskStatus(input.status);
  const data: Prisma.OnboardingTaskUpdateInput = { status };
  if (status === 'done' || status === 'skipped') {
    data.completedAt = new Date();
    data.completedBy = { connect: { id: BigInt(actingUserId) } };
  } else {
    data.completedAt = null;
    data.completedBy = { disconnect: true };
  }
  if (input.managerNote !== undefined) {
    data.managerNote = input.managerNote?.slice(0, 500) ?? null;
  }

  await prisma.onboardingTask.update({ where: { id: BigInt(taskId) }, data });

  // Auto-complete plan if all tasks done
  const plan = await prisma.onboardingPlan.findUnique({
    where: { id: BigInt(planId) },
    include: PLAN_INCLUDE,
  });
  if (plan) {
    const progress = computePlanProgress(plan.stages);
    if (
      plan.status === 'active' &&
      progress.totalTaskCount > 0 &&
      progress.completedTaskCount === progress.totalTaskCount
    ) {
      await prisma.onboardingPlan.update({
        where: { id: BigInt(planId) },
        data: { status: 'completed' },
      });
    }
  }

  return getPlanDetail(planId);
};

export interface ListUsersForAssignmentResult {
  users: Array<{
    id: string;
    fullName: string;
    email: string;
    positionTitle: string | null;
    avatarUrl: string | null;
    departmentName: string | null;
    activePlanId: string | null;
  }>;
}

export const listUsersForAssignment = async (
  managerId: string,
): Promise<ListUsersForAssignmentResult> => {
  const manager = await prisma.user.findUnique({
    where: { id: BigInt(managerId) },
    select: { departmentId: true },
  });
  const where: Prisma.UserWhereInput = { isActive: true };
  if (manager?.departmentId) where.departmentId = manager.departmentId;
  const users = await prisma.user.findMany({
    where,
    include: {
      department: { select: { name: true } },
      onboardingPlansAsAssignee: {
        where: { status: 'active' },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { fullName: 'asc' },
    take: 200,
  });
  return {
    users: users.map((u) => ({
      id: u.id.toString(),
      fullName: u.fullName,
      email: u.email,
      positionTitle: u.positionTitle,
      avatarUrl: u.avatarUrl,
      departmentName: u.department?.name ?? null,
      activePlanId: u.onboardingPlansAsAssignee[0]?.id.toString() ?? null,
    })),
  };
};

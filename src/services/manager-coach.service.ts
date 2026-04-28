import { genAI, CHAT_MODEL } from '@/config/gemini.config';
import { generateContentWithFallback } from '@/utils/ai-generate';
import { logger } from '@/config/logger';
import { prisma } from '@/config/database';

type EnrollmentStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
type RiskLevel = 'low' | 'medium' | 'high';
type ActionPriority = 'urgent' | 'high' | 'medium' | 'low';
type ChatRole = 'user' | 'assistant';

interface DepartmentSummary {
  id: string;
  name: string;
}

interface LearnerSummary {
  id: string;
  fullName: string;
  email: string;
  positionTitle: string | null;
  isActive: boolean;
}

interface EnrollmentSummary {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  positionTitle: string | null;
  courseId: string;
  courseTitle: string;
  status: EnrollmentStatus;
  progressPercent: number;
  dueAt: string | null;
  lastActivityAt: string | null;
  daysUntilDue: number | null;
}

interface RiskLearnerSummary extends EnrollmentSummary {
  riskScore: number;
  riskLevel: RiskLevel;
  recommendations: string | null;
  interventions: string | null;
  calculatedAt: string;
}

interface CourseLoadSummary {
  courseId: string;
  title: string;
  assigned: number;
  inProgress: number;
  completed: number;
  averageProgressPercent: number;
}

interface TeamMetrics {
  totalLearners: number;
  activeLearners: number;
  inactiveLearners: number;
  totalEnrollments: number;
  byStatus: Record<EnrollmentStatus, number>;
  completionRate: number;
  averageProgressPercent: number;
  overdueCount: number;
  upcomingDeadlineCount: number;
  stalledLearnerCount: number;
  risk: Record<RiskLevel, number>;
}

export interface ManagerCoachOverview {
  department: DepartmentSummary;
  metrics: TeamMetrics;
  learners: LearnerSummary[];
  atRiskLearners: RiskLearnerSummary[];
  upcomingDeadlines: EnrollmentSummary[];
  stalledLearners: EnrollmentSummary[];
  courseLoad: CourseLoadSummary[];
  generatedAt: string;
}

export interface ManagerCoachHistoryMessage {
  role: ChatRole;
  content: string;
}

interface ManagerCoachAction {
  label: string;
  reason: string;
  priority: ActionPriority;
}

export interface ManagerCoachChatResponse {
  answer: string;
  suggestedActions: ManagerCoachAction[];
  focusAreas: string[];
  generatedAt: string;
}

export interface WeeklyBriefingResponse {
  title: string;
  markdown: string;
  highlights: string[];
  risks: string[];
  actions: ManagerCoachAction[];
  weekOf: string;
  generatedAt: string;
}

const MANAGER_COACH_SYSTEM_PROMPT = `Bạn là **AI Manager Coach 360°** của StaffUp LMS.

Nhiệm vụ: hỗ trợ quản lý phòng ban hiểu tình hình đào tạo của team, phát hiện rủi ro sớm và đề xuất hành động cụ thể.

Quy tắc bắt buộc:
1. CHỈ dùng dữ liệu team được cung cấp trong prompt. Không bịa số liệu, tên nhân viên, khóa học hoặc hạn nộp.
2. Trả lời bằng tiếng Việt, giọng chuyên nghiệp, súc tích, hướng hành động.
3. Ưu tiên rủi ro cao, deadline quá hạn/sắp tới, học viên ít hoạt động, và khóa học có tiến độ thấp.
4. Không tiết lộ hoặc suy đoán dữ liệu ngoài phạm vi phòng ban hiện tại.
5. Nếu dữ liệu chưa đủ, nói rõ thiếu dữ liệu và đề xuất bước tiếp theo.

Bạn PHẢI trả về JSON hợp lệ, không markdown ngoài JSON:
{
  "answer": "Câu trả lời dạng Markdown ngắn gọn cho manager",
  "suggestedActions": [
    { "label": "Tên hành động", "reason": "Lý do", "priority": "urgent|high|medium|low" }
  ],
  "focusAreas": ["deadline", "risk", "engagement"]
}`;

const WEEKLY_BRIEFING_SYSTEM_PROMPT = `Bạn là chuyên gia L&D viết weekly briefing cho quản lý phòng ban.

Hãy tạo briefing tiếng Việt, ngắn gọn, có số liệu cụ thể, có phần ưu tiên tuần này và action checklist.
CHỈ dùng dữ liệu được cung cấp. Không bịa số liệu.

Bạn PHẢI trả về JSON hợp lệ, không markdown ngoài JSON:
{
  "title": "Tiêu đề briefing",
  "markdown": "Briefing Markdown đầy đủ",
  "highlights": ["Điểm sáng 1"],
  "risks": ["Rủi ro 1"],
  "actions": [
    { "label": "Tên hành động", "reason": "Lý do", "priority": "urgent|high|medium|low" }
  ]
}`;

const statusSeed = (): Record<EnrollmentStatus, number> => ({
  assigned: 0,
  in_progress: 0,
  completed: 0,
  cancelled: 0,
  expired: 0,
});

const riskSeed = (): Record<RiskLevel, number> => ({
  low: 0,
  medium: 0,
  high: 0,
});

const toIso = (date: Date | null | undefined): string | null => (date ? date.toISOString() : null);

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const daysUntil = (date: Date | null, now: Date): number | null => {
  if (!date) return null;
  return Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringArray = (value: unknown, fallback: string[] = []): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : fallback;

const normalizePriority = (value: unknown): ActionPriority => {
  if (value === 'urgent' || value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }
  return 'medium';
};

const parseActions = (value: unknown): ManagerCoachAction[] => {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      label: typeof item['label'] === 'string' ? item['label'] : 'Theo dõi học viên cần hỗ trợ',
      reason:
        typeof item['reason'] === 'string' ? item['reason'] : 'Dựa trên dữ liệu team hiện tại.',
      priority: normalizePriority(item['priority']),
    }))
    .slice(0, 6);
};

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

const buildEnrollmentSummary = (
  enrollment: {
    id: bigint;
    userId: bigint;
    status: EnrollmentStatus;
    progressPercentCache: unknown;
    dueAt: Date | null;
    lastActivityAt: Date | null;
    user: {
      fullName: string;
      email: string;
      positionTitle: string | null;
    };
    course: {
      id: bigint;
      title: string;
    };
  },
  now: Date,
): EnrollmentSummary => ({
  id: enrollment.id.toString(),
  userId: enrollment.userId.toString(),
  userName: enrollment.user.fullName,
  userEmail: enrollment.user.email,
  positionTitle: enrollment.user.positionTitle,
  courseId: enrollment.course.id.toString(),
  courseTitle: enrollment.course.title,
  status: enrollment.status,
  progressPercent: toNumber(enrollment.progressPercentCache),
  dueAt: toIso(enrollment.dueAt),
  lastActivityAt: toIso(enrollment.lastActivityAt),
  daysUntilDue: daysUntil(enrollment.dueAt, now),
});

const buildOverviewContext = (overview: ManagerCoachOverview): string => {
  const riskLines = overview.atRiskLearners
    .slice(0, 8)
    .map(
      (learner) =>
        `- ${learner.userName} (${learner.positionTitle ?? 'Chưa rõ vị trí'}) | ${learner.courseTitle} | risk ${learner.riskLevel} ${learner.riskScore} | progress ${learner.progressPercent}% | due ${learner.dueAt ?? 'không có'}`,
    )
    .join('\n');

  const deadlineLines = overview.upcomingDeadlines
    .slice(0, 8)
    .map(
      (item) =>
        `- ${item.userName} | ${item.courseTitle} | còn ${item.daysUntilDue} ngày | progress ${item.progressPercent}%`,
    )
    .join('\n');

  const stalledLines = overview.stalledLearners
    .slice(0, 8)
    .map(
      (item) =>
        `- ${item.userName} | ${item.courseTitle} | last activity ${item.lastActivityAt ?? 'chưa có'} | progress ${item.progressPercent}%`,
    )
    .join('\n');

  return `=== TEAM OVERVIEW: ${overview.department.name} ===
Generated: ${overview.generatedAt}

METRICS:
- Learners: ${overview.metrics.totalLearners} total, ${overview.metrics.activeLearners} active, ${overview.metrics.inactiveLearners} inactive
- Enrollments: ${overview.metrics.totalEnrollments}
- Assigned: ${overview.metrics.byStatus.assigned}, In progress: ${overview.metrics.byStatus.in_progress}, Completed: ${overview.metrics.byStatus.completed}
- Completion rate: ${overview.metrics.completionRate}%
- Average progress: ${overview.metrics.averageProgressPercent}%
- Overdue: ${overview.metrics.overdueCount}
- Due in 7 days: ${overview.metrics.upcomingDeadlineCount}
- Stalled learners: ${overview.metrics.stalledLearnerCount}
- Risk: high ${overview.metrics.risk.high}, medium ${overview.metrics.risk.medium}, low ${overview.metrics.risk.low}

AT-RISK LEARNERS:
${riskLines || '- Chưa có học viên rủi ro cao/trung bình trong dữ liệu hiện tại.'}

UPCOMING DEADLINES:
${deadlineLines || '- Không có deadline trong 7 ngày tới.'}

STALLED LEARNERS:
${stalledLines || '- Không có học viên bị chững lại theo ngưỡng 14 ngày.'}`;
};

export const getTeamOverview = async (departmentId: bigint): Promise<ManagerCoachOverview> => {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const stalledBefore = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [department, learners, enrollments] = await Promise.all([
    prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: {
        departmentId,
        userRoles: {
          some: { role: { code: 'employee' } },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        positionTitle: true,
        isActive: true,
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.enrollment.findMany({
      where: {
        user: { departmentId },
      },
      select: {
        id: true,
        userId: true,
        status: true,
        progressPercentCache: true,
        dueAt: true,
        lastActivityAt: true,
        user: {
          select: {
            fullName: true,
            email: true,
            positionTitle: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        learnerRiskAssessments: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
          select: {
            riskScore: true,
            riskLevel: true,
            recommendations: true,
            interventions: true,
            calculatedAt: true,
            expiresAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  const byStatus = statusSeed();
  const risk = riskSeed();
  const activeStatuses: EnrollmentStatus[] = ['assigned', 'in_progress'];
  const activeEnrollments = enrollments.filter((enrollment) =>
    activeStatuses.includes(enrollment.status),
  );

  for (const enrollment of enrollments) {
    byStatus[enrollment.status] += 1;
    const latestRisk = enrollment.learnerRiskAssessments[0];
    if (latestRisk && (!latestRisk.expiresAt || latestRisk.expiresAt >= now)) {
      risk[latestRisk.riskLevel] += 1;
    }
  }

  const completedCount = byStatus.completed;
  const totalEnrollments = enrollments.length;
  const completionRate =
    totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 1000) / 10 : 0;

  const averageProgressPercent =
    activeEnrollments.length > 0
      ? Math.round(
          (activeEnrollments.reduce(
            (sum, enrollment) => sum + toNumber(enrollment.progressPercentCache),
            0,
          ) /
            activeEnrollments.length) *
            10,
        ) / 10
      : 0;

  const enrollmentSummaries = enrollments.map((enrollment) =>
    buildEnrollmentSummary(enrollment, now),
  );

  const atRiskLearners: RiskLearnerSummary[] = [];

  for (const enrollment of enrollments) {
    const latestRisk = enrollment.learnerRiskAssessments[0];
    if (!latestRisk || (latestRisk.expiresAt && latestRisk.expiresAt < now)) continue;
    if (latestRisk.riskLevel === 'low') continue;

    atRiskLearners.push({
      ...buildEnrollmentSummary(enrollment, now),
      riskScore: toNumber(latestRisk.riskScore),
      riskLevel: latestRisk.riskLevel,
      recommendations: latestRisk.recommendations,
      interventions: latestRisk.interventions,
      calculatedAt: latestRisk.calculatedAt.toISOString(),
    });
  }

  atRiskLearners.sort((left, right) => right.riskScore - left.riskScore);

  const upcomingDeadlines = enrollmentSummaries
    .filter((enrollment) => {
      if (!enrollment.dueAt) return false;
      const dueAt = new Date(enrollment.dueAt);
      return dueAt >= now && dueAt <= sevenDaysLater && activeStatuses.includes(enrollment.status);
    })
    .sort((left, right) => (left.daysUntilDue ?? 0) - (right.daysUntilDue ?? 0))
    .slice(0, 10);

  const stalledLearners = enrollmentSummaries
    .filter((enrollment) => {
      if (!activeStatuses.includes(enrollment.status)) return false;
      if (enrollment.progressPercent >= 100) return false;
      if (!enrollment.lastActivityAt) return true;
      return new Date(enrollment.lastActivityAt) <= stalledBefore;
    })
    .sort((left, right) => left.progressPercent - right.progressPercent)
    .slice(0, 10);

  const overdueCount = enrollmentSummaries.filter((enrollment) => {
    if (!enrollment.dueAt) return false;
    return new Date(enrollment.dueAt) < now && activeStatuses.includes(enrollment.status);
  }).length;

  const courseMap = new Map<
    string,
    {
      title: string;
      assigned: number;
      inProgress: number;
      completed: number;
      totalProgress: number;
      count: number;
    }
  >();

  for (const enrollment of enrollmentSummaries) {
    const current = courseMap.get(enrollment.courseId) ?? {
      title: enrollment.courseTitle,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      totalProgress: 0,
      count: 0,
    };

    if (enrollment.status === 'assigned') current.assigned += 1;
    if (enrollment.status === 'in_progress') current.inProgress += 1;
    if (enrollment.status === 'completed') current.completed += 1;
    current.totalProgress += enrollment.progressPercent;
    current.count += 1;
    courseMap.set(enrollment.courseId, current);
  }

  const courseLoad = Array.from(courseMap.entries())
    .map(([courseId, course]) => ({
      courseId,
      title: course.title,
      assigned: course.assigned,
      inProgress: course.inProgress,
      completed: course.completed,
      averageProgressPercent:
        course.count > 0 ? Math.round((course.totalProgress / course.count) * 10) / 10 : 0,
    }))
    .sort((left, right) => right.assigned + right.inProgress - (left.assigned + left.inProgress))
    .slice(0, 8);

  return {
    department: {
      id: department?.id.toString() ?? departmentId.toString(),
      name: department?.name ?? 'Không rõ phòng ban',
    },
    metrics: {
      totalLearners: learners.length,
      activeLearners: learners.filter((learner) => learner.isActive).length,
      inactiveLearners: learners.filter((learner) => !learner.isActive).length,
      totalEnrollments,
      byStatus,
      completionRate,
      averageProgressPercent,
      overdueCount,
      upcomingDeadlineCount: upcomingDeadlines.length,
      stalledLearnerCount: stalledLearners.length,
      risk,
    },
    learners: learners.map((learner) => ({
      id: learner.id.toString(),
      fullName: learner.fullName,
      email: learner.email,
      positionTitle: learner.positionTitle,
      isActive: learner.isActive,
    })),
    atRiskLearners: atRiskLearners.slice(0, 10),
    upcomingDeadlines,
    stalledLearners,
    courseLoad,
    generatedAt: now.toISOString(),
  };
};

export const chat = async (
  departmentId: bigint,
  message: string,
  history: ManagerCoachHistoryMessage[] = [],
): Promise<ManagerCoachChatResponse> => {
  const overview = await getTeamOverview(departmentId);
  const context = buildOverviewContext(overview);
  const historyText = history
    .slice(-6)
    .map((item) => `${item.role === 'user' ? 'Manager' : 'Coach'}: ${item.content}`)
    .join('\n');

  try {
    const result = await generateContentWithFallback({
      model: CHAT_MODEL,
      contents: [
        {
          role: 'user' as const,
          parts: [
            {
              text: `${context}\n\nLỊCH SỬ GẦN ĐÂY:\n${historyText || 'Chưa có.'}\n\nCÂU HỎI CỦA MANAGER:\n${message}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: MANAGER_COACH_SYSTEM_PROMPT,
        temperature: 0.25,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonObject(result.text ?? '');
    if (!parsed || typeof parsed['answer'] !== 'string') {
      throw new Error('Manager Coach response is not valid JSON.');
    }

    return {
      answer: parsed['answer'],
      suggestedActions: parseActions(parsed['suggestedActions']),
      focusAreas: stringArray(parsed['focusAreas']).slice(0, 6),
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('Manager Coach chat error:', error);
    return {
      answer:
        'Hiện tại AI Coach chưa thể tạo phản hồi đầy đủ. Dựa trên dữ liệu hiện có, hãy ưu tiên xử lý học viên rủi ro cao, các khóa quá hạn và các học viên không có hoạt động gần đây.',
      suggestedActions: [
        {
          label: 'Rà soát danh sách rủi ro cao',
          reason: `${overview.metrics.risk.high} học viên đang ở mức rủi ro cao.`,
          priority: overview.metrics.risk.high > 0 ? 'urgent' : 'medium',
        },
      ],
      focusAreas: ['risk', 'deadlines', 'engagement'],
      generatedAt: new Date().toISOString(),
    };
  }
};

export const generateWeeklyBriefing = async (
  departmentId: bigint,
  focus?: string,
): Promise<WeeklyBriefingResponse> => {
  const overview = await getTeamOverview(departmentId);
  const context = buildOverviewContext(overview);
  const now = new Date();

  try {
    const result = await generateContentWithFallback({
      model: CHAT_MODEL,
      contents: [
        {
          role: 'user' as const,
          parts: [
            {
              text: `${context}\n\nFOCUS REQUEST: ${focus || 'this_week'}\n\nHãy tạo weekly briefing cho manager.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: WEEKLY_BRIEFING_SYSTEM_PROMPT,
        temperature: 0.25,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseJsonObject(result.text ?? '');
    if (!parsed || typeof parsed['markdown'] !== 'string') {
      throw new Error('Weekly briefing response is not valid JSON.');
    }

    return {
      title: typeof parsed['title'] === 'string' ? parsed['title'] : 'Weekly Training Briefing',
      markdown: parsed['markdown'],
      highlights: stringArray(parsed['highlights']).slice(0, 6),
      risks: stringArray(parsed['risks']).slice(0, 6),
      actions: parseActions(parsed['actions']),
      weekOf: now.toISOString(),
      generatedAt: now.toISOString(),
    };
  } catch (error) {
    logger.error('Manager Coach weekly briefing error:', error);
    return {
      title: `Briefing đào tạo tuần này — ${overview.department.name}`,
      markdown: `## Tóm tắt nhanh\n\n- Tổng học viên: ${overview.metrics.totalLearners}\n- Tiến độ trung bình: ${overview.metrics.averageProgressPercent}%\n- Quá hạn: ${overview.metrics.overdueCount}\n- Rủi ro cao: ${overview.metrics.risk.high}\n\n## Ưu tiên\n\n1. Xử lý học viên rủi ro cao.\n2. Nhắc các deadline quá hạn hoặc sắp tới.\n3. Theo dõi học viên chưa có hoạt động gần đây.`,
      highlights: [`${overview.metrics.completionRate}% tỷ lệ hoàn thành tổng thể.`],
      risks: [`${overview.metrics.risk.high} học viên rủi ro cao.`],
      actions: [
        {
          label: 'Can thiệp nhóm rủi ro cao',
          reason: 'Đây là nhóm có khả năng bỏ học hoặc chậm tiến độ cao nhất.',
          priority: overview.metrics.risk.high > 0 ? 'urgent' : 'medium',
        },
      ],
      weekOf: now.toISOString(),
      generatedAt: now.toISOString(),
    };
  }
};

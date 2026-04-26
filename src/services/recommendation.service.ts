import { prisma } from '@/config/database';
import { genAI, CHAT_MODEL, LEARNING_RECOMMENDATION_SYSTEM_PROMPT } from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';
import type { GetMyRecommendationsInput } from '@/schemas/recommendation.schema';

// ====================================================================
// Types
// ====================================================================

type Priority = 'high' | 'medium' | 'low';

export interface RecommendationCourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  estimatedDurationMinutes: number | null;
  category: { id: string; name: string } | null;
  status: 'published';
}

export interface RecommendationItem {
  course: RecommendationCourseSummary;
  priority: Priority;
  reasoning: string;
  suggestedOrder: number;
  basedOn: string[];
}

interface LearnerSnapshot {
  fullName: string;
  positionTitle: string | null;
  departmentName: string | null;
  enrolledCount: number;
  inProgressCount: number;
  completedCount: number;
  averageQuizScore: number | null; // 0-100
  averageQuizScoreLabel: string;
  latestRiskLevel: 'low' | 'medium' | 'high' | null;
  isNewLearner: boolean;
}

interface CompletedCourseRef {
  id: string;
  title: string;
  averageQuizScore: number | null;
  completedAt: string | null;
  progressPercent: number;
}

interface InProgressCourseRef {
  id: string;
  title: string;
  progressPercent: number;
  daysSinceLastActivity: number | null;
}

interface CandidateCoursePayload {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  estimatedDurationMinutes: number | null;
}

export interface RecommendationsResult {
  recommendations: RecommendationItem[];
  context: {
    learner: LearnerSnapshot;
    completed: CompletedCourseRef[];
    inProgress: InProgressCourseRef[];
    candidateCount: number;
  };
  model: string;
  generatedAt: string;
}

interface AiRecoOutput {
  courseId: string;
  priority: Priority;
  reasoning: string;
  suggestedOrder: number;
  basedOn: string[];
}

// ====================================================================
// Helpers
// ====================================================================

const PRIORITY_VALUES: ReadonlySet<Priority> = new Set<Priority>(['high', 'medium', 'low']);

const stripCodeFences = (raw: string): string => {
  let text = raw.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  return text.trim();
};

const decimalToNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof value === 'object' && 'toNumber' in (value as object)) {
    try {
      const n = (value as { toNumber: () => number }).toNumber();
      return Number.isFinite(n) ? n : null;
    } catch {
      return null;
    }
  }
  return null;
};

const daysBetween = (a: Date, b: Date): number =>
  Math.max(0, Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)));

const sanitizeBasedOn = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is string => typeof s === 'string')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.length <= 60)
    .slice(0, 4);
};

const sanitizePriority = (raw: unknown): Priority => {
  if (typeof raw === 'string' && PRIORITY_VALUES.has(raw as Priority)) {
    return raw as Priority;
  }
  return 'medium';
};

// ====================================================================
// Service
// ====================================================================

export class RecommendationService {
  /**
   * Generate personalized course recommendations for the requesting user.
   * Pulls learner profile, enrollment + quiz history, latest risk assessment,
   * and a pool of eligible candidate courses, then asks Gemini to choose
   * 3-5 courses with a Vietnamese reasoning per item.
   */
  static async getMyRecommendations(
    userId: string,
    input: GetMyRecommendationsInput,
  ): Promise<RecommendationsResult> {
    const userBigInt = BigInt(userId);

    // 1. Load learner profile
    const user = await prisma.user.findUnique({
      where: { id: userBigInt },
      include: { department: true },
    });
    if (!user) throw new AppError('User not found', 404);

    // 2. Load enrollments + course meta + quiz attempts (only completed graded ones)
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: userBigInt },
      include: {
        course: { include: { category: true } },
        quizAttempts: {
          where: { status: 'submitted' },
          select: { totalScore: true, isPassed: true, gradedAt: true, submittedAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const completedEnrollments = enrollments.filter((e) => e.status === 'completed');
    const inProgressEnrollments = enrollments.filter(
      (e) => e.status === 'in_progress' || e.status === 'assigned',
    );

    // 3. Aggregate quiz scores across all attempts
    const allScores = enrollments.flatMap((e) =>
      e.quizAttempts
        .map((q) => decimalToNumber(q.totalScore))
        .filter((n): n is number => n !== null),
    );
    const averageQuizScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((s, n) => s + n, 0) / allScores.length)
        : null;

    // 4. Latest risk assessment across all enrollments
    const latestRisk = await prisma.learnerRiskAssessment
      .findFirst({
        where: { enrollment: { userId: userBigInt } },
        orderBy: { calculatedAt: 'desc' },
        select: { riskLevel: true, calculatedAt: true },
      })
      .catch(() => null);

    const riskLevel: 'low' | 'medium' | 'high' | null = latestRisk
      ? ((latestRisk.riskLevel as 'low' | 'medium' | 'high') ?? null)
      : null;

    const isNewLearner = enrollments.length === 0;

    const learner: LearnerSnapshot = {
      fullName: user.fullName,
      positionTitle: user.positionTitle,
      departmentName: user.department?.name ?? null,
      enrolledCount: enrollments.length,
      inProgressCount: inProgressEnrollments.length,
      completedCount: completedEnrollments.length,
      averageQuizScore,
      averageQuizScoreLabel:
        averageQuizScore === null ? 'Chưa có dữ liệu quiz' : `${averageQuizScore}/100`,
      latestRiskLevel: riskLevel,
      isNewLearner,
    };

    // 5. Build summaries for prompt context
    const now = new Date();
    const completed: CompletedCourseRef[] = completedEnrollments.map((e) => {
      const scores = e.quizAttempts
        .map((q) => decimalToNumber(q.totalScore))
        .filter((n): n is number => n !== null);
      const avg =
        scores.length > 0 ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length) : null;
      return {
        id: e.course.id.toString(),
        title: e.course.title,
        averageQuizScore: avg,
        completedAt: e.completedAt?.toISOString() ?? null,
        progressPercent: Math.round(decimalToNumber(e.progressPercentCache) ?? 0),
      };
    });

    const inProgress: InProgressCourseRef[] = inProgressEnrollments.map((e) => ({
      id: e.course.id.toString(),
      title: e.course.title,
      progressPercent: Math.round(decimalToNumber(e.progressPercentCache) ?? 0),
      daysSinceLastActivity: e.lastActivityAt ? daysBetween(now, e.lastActivityAt) : null,
    }));

    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId.toString()));

    // 6. Candidate course pool — published, not enrolled.
    //    Prefer same department / no department; filter to top 30 most recent.
    const candidateRows = await prisma.course.findMany({
      where: {
        status: 'published',
        id: { notIn: enrollments.map((e) => e.courseId) },
        OR: [{ ownerDepartmentId: user.departmentId }, { ownerDepartmentId: null }],
      },
      include: { category: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 30,
    });

    const candidateCourses: CandidateCoursePayload[] = candidateRows.map((c) => ({
      id: c.id.toString(),
      title: c.title,
      description: c.description ?? null,
      category: c.category?.name ?? null,
      estimatedDurationMinutes: c.estimatedDurationMinutes,
    }));

    // 7. Short-circuit if there's nothing to recommend
    if (candidateCourses.length === 0) {
      return {
        recommendations: [],
        context: { learner, completed, inProgress, candidateCount: 0 },
        model: CHAT_MODEL,
        generatedAt: new Date().toISOString(),
      };
    }

    // 8. Call Gemini
    const aiOutputs = await this.callGemini(
      learner,
      completed,
      inProgress,
      candidateCourses,
      input,
    );

    // 9. Map AI output back to full course summaries; drop any unknown courseId
    //    or duplicate; cap at limit.
    const courseById = new Map(candidateRows.map((c) => [c.id.toString(), c]));
    const seen = new Set<string>();
    const recommendations: RecommendationItem[] = [];

    for (const out of aiOutputs) {
      if (seen.has(out.courseId)) continue;
      if (enrolledCourseIds.has(out.courseId)) continue;
      const course = courseById.get(out.courseId);
      if (!course) continue;
      seen.add(out.courseId);
      recommendations.push({
        course: {
          id: course.id.toString(),
          title: course.title,
          slug: course.slug,
          description: course.description ?? null,
          thumbnailUrl: course.thumbnailUrl ?? null,
          estimatedDurationMinutes: course.estimatedDurationMinutes,
          category: course.category
            ? { id: course.category.id.toString(), name: course.category.name }
            : null,
          status: 'published',
        },
        priority: out.priority,
        reasoning: out.reasoning,
        suggestedOrder: out.suggestedOrder,
        basedOn: out.basedOn,
      });
      if (recommendations.length >= input.limit) break;
    }

    // 10. Final sort by suggestedOrder ascending
    recommendations.sort((a, b) => a.suggestedOrder - b.suggestedOrder);

    return {
      recommendations,
      context: { learner, completed, inProgress, candidateCount: candidateCourses.length },
      model: CHAT_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }

  // ----------------------------------------------------------------
  // Gemini call
  // ----------------------------------------------------------------

  private static async callGemini(
    learner: LearnerSnapshot,
    completed: CompletedCourseRef[],
    inProgress: InProgressCourseRef[],
    candidateCourses: CandidateCoursePayload[],
    input: GetMyRecommendationsInput,
  ): Promise<AiRecoOutput[]> {
    const userPrompt = this.buildUserPrompt(
      learner,
      completed,
      inProgress,
      candidateCourses,
      input,
    );

    let aiResponse: string;
    try {
      const response = await genAI.models.generateContent({
        model: CHAT_MODEL,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: LEARNING_RECOMMENDATION_SYSTEM_PROMPT,
          temperature: 0.5,
          maxOutputTokens: 4096,
          responseMimeType: 'application/json',
        },
      });
      aiResponse = response.text?.trim() ?? '';
    } catch (err) {
      logger.error(
        `[Reco] Gemini call failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new AppError('AI service unavailable. Please try again later.', 502);
    }

    if (!aiResponse) {
      throw new AppError('AI service returned an empty response.', 502);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(aiResponse));
    } catch (err) {
      logger.error(
        `[Reco] Failed to parse Gemini JSON: ${err instanceof Error ? err.message : String(err)} | raw=${aiResponse.slice(0, 200)}`,
      );
      throw new AppError('AI service returned malformed JSON.', 502);
    }

    return this.sanitizeAiOutput(parsed, candidateCourses, input.limit);
  }

  // ----------------------------------------------------------------
  // Prompt + sanitiser
  // ----------------------------------------------------------------

  private static buildUserPrompt(
    learner: LearnerSnapshot,
    completed: CompletedCourseRef[],
    inProgress: InProgressCourseRef[],
    candidateCourses: CandidateCoursePayload[],
    input: GetMyRecommendationsInput,
  ): string {
    const completedJson = completed.length
      ? JSON.stringify(completed, null, 2)
      : '[] (chưa hoàn thành khoá nào)';
    const inProgressJson = inProgress.length
      ? JSON.stringify(inProgress, null, 2)
      : '[] (không có khoá đang học dở)';
    const candidatesJson = JSON.stringify(candidateCourses, null, 2);

    return `Hồ sơ học viên cần đề xuất khoá học tiếp theo.

=== HỒ SƠ HỌC VIÊN ===
- Họ tên: ${learner.fullName}
- Vị trí: ${learner.positionTitle ?? 'Chưa cập nhật'}
- Phòng ban: ${learner.departmentName ?? 'Chưa cập nhật'}
- Tổng số khoá đã đăng ký: ${learner.enrolledCount}
- Đang học: ${learner.inProgressCount}
- Đã hoàn thành: ${learner.completedCount}
- Điểm quiz trung bình tổng thể: ${learner.averageQuizScoreLabel}
- Mức rủi ro bỏ học gần nhất: ${learner.latestRiskLevel ?? 'Chưa đánh giá'}
- Học viên mới (chưa enrolled): ${learner.isNewLearner ? 'Có' : 'Không'}

=== KHOÁ ĐÃ HOÀN THÀNH ===
${completedJson}

=== KHOÁ ĐANG HỌC DỞ ===
${inProgressJson}

=== DANH SÁCH KHOÁ ỨNG VIÊN (chỉ chọn từ đây — đã lọc bỏ những khoá học viên đã đăng ký) ===
${candidatesJson}

=== YÊU CẦU ===
- Đề xuất tối đa ${input.limit} khoá phù hợp NHẤT cho học viên này.
- Trả về JSON theo schema:
{
  "recommendations": [
    {
      "courseId": "<id từ candidateCourses>",
      "priority": "high" | "medium" | "low",
      "reasoning": "Lý do cụ thể, 1-3 câu, tiếng Việt",
      "suggestedOrder": 1,
      "basedOn": ["Vị trí công việc", "Đã hoàn thành Onboarding", ...]
    }
  ]
}

Ngôn ngữ phản hồi: ${input.language === 'en' ? 'English' : 'Tiếng Việt (mặc định)'}.`;
  }

  private static sanitizeAiOutput(
    parsed: unknown,
    candidateCourses: CandidateCoursePayload[],
    limit: number,
  ): AiRecoOutput[] {
    if (typeof parsed !== 'object' || parsed === null) return [];
    const root = parsed as { recommendations?: unknown };
    if (!Array.isArray(root.recommendations)) return [];

    const validIds = new Set(candidateCourses.map((c) => c.id));
    const results: AiRecoOutput[] = [];
    let fallbackOrder = 1;

    for (const raw of root.recommendations) {
      if (typeof raw !== 'object' || raw === null) continue;
      const obj = raw as Record<string, unknown>;
      const courseId = typeof obj.courseId === 'string' ? obj.courseId.trim() : '';
      if (!courseId || !validIds.has(courseId)) continue;
      const reasoning =
        typeof obj.reasoning === 'string' && obj.reasoning.trim().length > 0
          ? obj.reasoning.trim().slice(0, 500)
          : 'Khoá này phù hợp với hồ sơ học tập của bạn.';
      const suggestedOrder =
        typeof obj.suggestedOrder === 'number' && Number.isFinite(obj.suggestedOrder)
          ? Math.max(1, Math.round(obj.suggestedOrder))
          : fallbackOrder;
      fallbackOrder += 1;

      results.push({
        courseId,
        priority: sanitizePriority(obj.priority),
        reasoning,
        suggestedOrder,
        basedOn: sanitizeBasedOn(obj.basedOn),
      });
      if (results.length >= limit) break;
    }

    return results;
  }
}

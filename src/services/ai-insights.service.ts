import { prisma } from '@/config/database';
import { genAI, CHAT_MODEL } from '@/config/gemini.config';
import { logger } from '@/config/logger';

// ========================
// Types
// ========================

export type InsightType = 'warning' | 'success' | 'info' | 'action';

export interface DashboardInsight {
  type: InsightType;
  title: string;
  description: string;
  suggestion: string;
}

export interface InsightsResponse {
  insights: DashboardInsight[];
  generatedAt: string;
  cached: boolean;
  scope: 'admin' | 'manager' | 'trainer';
}

interface AggregatedData {
  scope: 'admin' | 'manager' | 'trainer';
  summary: string;
}

// ========================
// In-Memory Cache (1 hour TTL)
// ========================

interface CacheEntry {
  data: DashboardInsight[];
  expiry: number;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const insightsCache = new Map<string, CacheEntry>();

const getCacheKey = (scope: string, scopeId?: string): string =>
  `insights:${scope}:${scopeId || 'all'}`;

const getCached = (key: string): DashboardInsight[] | null => {
  const entry = insightsCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    insightsCache.delete(key);
    return null;
  }
  return entry.data;
};

const setCache = (key: string, data: DashboardInsight[]): void => {
  insightsCache.set(key, { data, expiry: Date.now() + CACHE_TTL_MS });
};

// ========================
// System Prompt
// ========================

const INSIGHTS_SYSTEM_PROMPT = `Bạn là **Chuyên gia Phân tích Dữ liệu Đào tạo** của hệ thống StaffUp LMS.

**Vai trò:** Phân tích dữ liệu tổng hợp từ dashboard và đưa ra insights thực tế, actionable bằng tiếng Việt.

**Quy tắc:**
1. Phân tích CHÍNH XÁC dựa trên dữ liệu được cung cấp. KHÔNG bịa đặt số liệu.
2. Tập trung vào: bất thường (anomaly), xu hướng (trend), cảnh báo sớm (early warning), và điểm tích cực.
3. Mỗi insight PHẢI có hành động cụ thể (actionable suggestion).
4. Ưu tiên insights có tính khẩn cấp cao trước.
5. Tạo 4-8 insights, đa dạng type.

**Bạn PHẢI trả về JSON hợp lệ — CHỈ JSON, không text khác:**
[
  {
    "type": "warning" | "success" | "info" | "action",
    "title": "<Tiêu đề ngắn gọn, < 80 ký tự>",
    "description": "<Mô tả chi tiết kèm số liệu cụ thể, 1-2 câu>",
    "suggestion": "<Đề xuất hành động cụ thể>"
  }
]

**Hướng dẫn chọn type:**
- "warning": Chỉ số đáng lo ngại, cần hành động gấp (completion thấp, risk cao, quá hạn)
- "success": Kết quả tốt, đáng khen ngợi, có thể nhân rộng
- "info": Thống kê thú vị, xu hướng đáng chú ý
- "action": Đề xuất cải tiến chiến lược, tối ưu quy trình`;

// ========================
// Data Aggregation
// ========================

/**
 * Collect aggregate stats for Admin scope (toàn bộ hệ thống).
 */
const aggregateAdminData = async (): Promise<AggregatedData> => {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    totalCourses,
    publishedCourses,
    totalEnrollments,
    enrollmentsByStatus,
    risksByLevel,
    overdueCount,
    upcomingDeadlineCount,
    recentEnrollments30d,
    recentCompletions30d,
    quizAttempts,
    quizPassed,
    pendingGrading,
    avgProgress,
    courseCompletionsByTitle,
  ] = await Promise.all([
    // Users
    (prisma as any).user.count(),
    (prisma as any).user.count({ where: { isActive: true } }),
    // Courses
    (prisma as any).course.count(),
    (prisma as any).course.count({ where: { status: 'published' } }),
    // Enrollments
    (prisma as any).enrollment.count(),
    (prisma as any).enrollment.groupBy({ by: ['status'], _count: true }),
    // Risks
    (prisma as any).learnerRiskAssessment.groupBy({
      by: ['riskLevel'],
      where: { expiresAt: { gte: now } },
      _count: true,
    }),
    // Overdue
    (prisma as any).enrollment.count({
      where: {
        dueAt: { lt: now },
        status: { in: ['assigned', 'in_progress'] },
      },
    }),
    // Upcoming deadlines (next 7 days)
    (prisma as any).enrollment.count({
      where: {
        dueAt: { gte: now, lte: sevenDaysLater },
        status: { in: ['assigned', 'in_progress'] },
      },
    }),
    // Recent activity (30 days)
    (prisma as any).enrollment.count({
      where: { enrolledAt: { gte: thirtyDaysAgo } },
    }),
    (prisma as any).enrollment.count({
      where: { completedAt: { gte: thirtyDaysAgo } },
    }),
    // Quiz stats
    (prisma as any).quizAttempt.count({ where: { status: 'graded' } }),
    (prisma as any).quizAttempt.count({ where: { status: 'graded', isPassed: true } }),
    (prisma as any).quizAttempt.count({ where: { status: 'submitted', gradedAt: null } }),
    // Avg progress
    (prisma as any).enrollment.aggregate({
      where: { status: { in: ['in_progress', 'assigned'] } },
      _avg: { progressPercentCache: true },
    }),
    // Per-course completion rates (top 10 courses by enrollment count)
    (prisma as any).enrollment.groupBy({
      by: ['courseId'],
      _count: { _all: true },
      _avg: { progressPercentCache: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 10,
    }),
  ]);

  // Parse enrollment statuses
  const enrollStatMap: Record<string, number> = {};
  enrollmentsByStatus.forEach((e: any) => {
    enrollStatMap[e.status] = e._count;
  });

  const completedCount = enrollStatMap['completed'] || 0;
  const inProgressCount = enrollStatMap['in_progress'] || 0;
  const assignedCount = enrollStatMap['assigned'] || 0;
  const cancelledCount = enrollStatMap['cancelled'] || 0;

  const completionRate =
    totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100 * 10) / 10 : 0;

  // Parse risks
  const riskMap: Record<string, number> = {};
  risksByLevel.forEach((r: any) => {
    riskMap[r.riskLevel] = r._count;
  });

  const highRisk = riskMap['high'] || 0;
  const mediumRisk = riskMap['medium'] || 0;
  const lowRisk = riskMap['low'] || 0;
  const totalRisk = highRisk + mediumRisk + lowRisk;

  // Quiz pass rate
  const passRate = quizAttempts > 0 ? Math.round((quizPassed / quizAttempts) * 100 * 10) / 10 : 0;

  // Average progress
  const avgProgressPercent = avgProgress._avg?.progressPercentCache
    ? Math.round(Number(avgProgress._avg.progressPercentCache) * 10) / 10
    : 0;

  // Get course titles for top courses
  let courseCompletionInfo = '';
  if (courseCompletionsByTitle.length > 0) {
    const courseIds = courseCompletionsByTitle.map((c: any) => c.courseId);
    const courses = await (prisma as any).course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true },
    });
    const courseMap = new Map(courses.map((c: any) => [c.id.toString(), c.title]));

    const courseLines = courseCompletionsByTitle.map((c: any) => {
      const title = courseMap.get(c.courseId.toString()) || 'N/A';
      const avg = c._avg?.progressPercentCache
        ? Math.round(Number(c._avg.progressPercentCache))
        : 0;
      return `  - "${title}": ${c._count._all} học viên, tiến độ TB ${avg}%`;
    });
    courseCompletionInfo = `\nTop khóa học (theo số lượng ghi danh):\n${courseLines.join('\n')}`;
  }

  const summary = `=== BÁO CÁO TỔNG HỢP HỆ THỐNG (Admin) ===
Thời điểm: ${now.toLocaleDateString('vi-VN')}

NGƯỜI DÙNG:
- Tổng: ${totalUsers} | Đang hoạt động: ${activeUsers} | Không hoạt động: ${totalUsers - activeUsers}

KHÓA HỌC:
- Tổng: ${totalCourses} | Xuất bản: ${publishedCourses} | Nháp/Lưu trữ: ${totalCourses - publishedCourses}

GHI DANH:
- Tổng: ${totalEnrollments}
- Chưa bắt đầu (assigned): ${assignedCount}
- Đang học (in_progress): ${inProgressCount}
- Hoàn thành: ${completedCount}
- Hủy bỏ: ${cancelledCount}
- Tỷ lệ hoàn thành: ${completionRate}%
- Tiến độ trung bình (đang học): ${avgProgressPercent}%

HẠN NỘP:
- Quá hạn: ${overdueCount} enrollment
- Sắp hết hạn (7 ngày): ${upcomingDeadlineCount} enrollment

RỦI RO BỎ HỌC:
- Tổng đánh giá: ${totalRisk}
- Rủi ro CAO: ${highRisk}
- Rủi ro TRUNG BÌNH: ${mediumRisk}
- Rủi ro THẤP: ${lowRisk}

BÀI KIỂM TRA:
- Tổng lượt thi (đã chấm): ${quizAttempts}
- Đạt: ${quizPassed} (${passRate}%)
- Không đạt: ${quizAttempts - quizPassed}
- Chờ chấm: ${pendingGrading} bài

HOẠT ĐỘNG 30 NGÀY GẦN ĐÂY:
- Ghi danh mới: ${recentEnrollments30d}
- Hoàn thành: ${recentCompletions30d}
${courseCompletionInfo}`;

  return { scope: 'admin', summary };
};

/**
 * Collect aggregate stats for Manager scope (department-level).
 */
const aggregateManagerData = async (departmentId: bigint): Promise<AggregatedData> => {
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get department info
  const department = await (prisma as any).department.findUnique({
    where: { id: departmentId },
    select: { name: true },
  });

  const deptName = department?.name || 'Không rõ';

  const [
    totalLearners,
    activeLearners,
    totalEnrollments,
    enrollmentsByStatus,
    overdueCount,
    upcomingDeadlineCount,
    risksByLevel,
    avgProgress,
  ] = await Promise.all([
    (prisma as any).user.count({ where: { departmentId } }),
    (prisma as any).user.count({ where: { departmentId, isActive: true } }),
    (prisma as any).enrollment.count({ where: { user: { departmentId } } }),
    (prisma as any).enrollment.groupBy({
      by: ['status'],
      where: { user: { departmentId } },
      _count: true,
    }),
    (prisma as any).enrollment.count({
      where: {
        user: { departmentId },
        dueAt: { lt: now },
        status: { in: ['assigned', 'in_progress'] },
      },
    }),
    (prisma as any).enrollment.count({
      where: {
        user: { departmentId },
        dueAt: { gte: now, lte: sevenDaysLater },
        status: { in: ['assigned', 'in_progress'] },
      },
    }),
    (prisma as any).learnerRiskAssessment.groupBy({
      by: ['riskLevel'],
      where: { enrollment: { user: { departmentId } }, expiresAt: { gte: now } },
      _count: true,
    }),
    (prisma as any).enrollment.aggregate({
      where: { user: { departmentId }, status: { in: ['in_progress', 'assigned'] } },
      _avg: { progressPercentCache: true },
    }),
  ]);

  const enrollStatMap: Record<string, number> = {};
  enrollmentsByStatus.forEach((e: any) => {
    enrollStatMap[e.status] = e._count;
  });

  const completedCount = enrollStatMap['completed'] || 0;
  const completionRate =
    totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100 * 10) / 10 : 0;

  const riskMap: Record<string, number> = {};
  risksByLevel.forEach((r: any) => {
    riskMap[r.riskLevel] = r._count;
  });

  const avgProgressPercent = avgProgress._avg?.progressPercentCache
    ? Math.round(Number(avgProgress._avg.progressPercentCache) * 10) / 10
    : 0;

  const summary = `=== BÁO CÁO PHÒNG BAN: "${deptName}" (Manager) ===
Thời điểm: ${now.toLocaleDateString('vi-VN')}

NHÂN SỰ:
- Tổng nhân viên: ${totalLearners} | Hoạt động: ${activeLearners} | Không hoạt động: ${totalLearners - activeLearners}

GHI DANH:
- Tổng: ${totalEnrollments}
- Chưa bắt đầu: ${enrollStatMap['assigned'] || 0}
- Đang học: ${enrollStatMap['in_progress'] || 0}
- Hoàn thành: ${completedCount}
- Tỷ lệ hoàn thành: ${completionRate}%
- Tiến độ trung bình: ${avgProgressPercent}%

HẠN NỘP:
- Quá hạn: ${overdueCount}
- Sắp hết hạn (7 ngày): ${upcomingDeadlineCount}

RỦI RO BỎ HỌC:
- Rủi ro CAO: ${riskMap['high'] || 0}
- Rủi ro TRUNG BÌNH: ${riskMap['medium'] || 0}
- Rủi ro THẤP: ${riskMap['low'] || 0}`;

  return { scope: 'manager', summary };
};

/**
 * Collect aggregate stats for Trainer scope (courses they manage).
 */
const aggregateTrainerData = async (trainerId: bigint): Promise<AggregatedData> => {
  const now = new Date();

  const [
    totalCourses,
    publishedCourses,
    totalEnrollments,
    enrollmentsByStatus,
    pendingGrading,
    quizAttempts,
    quizPassed,
    avgProgress,
  ] = await Promise.all([
    (prisma as any).course.count({ where: { trainerUserId: trainerId } }),
    (prisma as any).course.count({ where: { trainerUserId: trainerId, status: 'published' } }),
    (prisma as any).enrollment.count({ where: { course: { trainerUserId: trainerId } } }),
    (prisma as any).enrollment.groupBy({
      by: ['status'],
      where: { course: { trainerUserId: trainerId } },
      _count: true,
    }),
    (prisma as any).quizAttempt.count({
      where: {
        quiz: { course: { trainerUserId: trainerId } },
        status: 'submitted',
        gradedAt: null,
      },
    }),
    (prisma as any).quizAttempt.count({
      where: { quiz: { course: { trainerUserId: trainerId } }, status: 'graded' },
    }),
    (prisma as any).quizAttempt.count({
      where: { quiz: { course: { trainerUserId: trainerId } }, status: 'graded', isPassed: true },
    }),
    (prisma as any).enrollment.aggregate({
      where: { course: { trainerUserId: trainerId }, status: { in: ['in_progress', 'assigned'] } },
      _avg: { progressPercentCache: true },
    }),
  ]);

  const enrollStatMap: Record<string, number> = {};
  enrollmentsByStatus.forEach((e: any) => {
    enrollStatMap[e.status] = e._count;
  });

  const completedCount = enrollStatMap['completed'] || 0;
  const completionRate =
    totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100 * 10) / 10 : 0;

  const passRate = quizAttempts > 0 ? Math.round((quizPassed / quizAttempts) * 100 * 10) / 10 : 0;

  const avgProgressPercent = avgProgress._avg?.progressPercentCache
    ? Math.round(Number(avgProgress._avg.progressPercentCache) * 10) / 10
    : 0;

  const summary = `=== BÁO CÁO GIẢNG VIÊN (Trainer) ===
Thời điểm: ${now.toLocaleDateString('vi-VN')}

KHÓA HỌC CỦA TÔI:
- Tổng: ${totalCourses} | Xuất bản: ${publishedCourses}

HỌC VIÊN:
- Tổng ghi danh: ${totalEnrollments}
- Chưa bắt đầu: ${enrollStatMap['assigned'] || 0}
- Đang học: ${enrollStatMap['in_progress'] || 0}
- Hoàn thành: ${completedCount}
- Tỷ lệ hoàn thành: ${completionRate}%
- Tiến độ trung bình: ${avgProgressPercent}%

BÀI KIỂM TRA:
- Tổng lượt thi (đã chấm): ${quizAttempts}
- Tỷ lệ đạt: ${passRate}%
- Chờ chấm: ${pendingGrading} bài`;

  return { scope: 'trainer', summary };
};

// ========================
// Gemini Analysis
// ========================

/**
 * Call Gemini to analyze aggregated data and generate insights.
 */
const analyzeWithGemini = async (data: AggregatedData): Promise<DashboardInsight[]> => {
  const prompt = `Dưới đây là dữ liệu tổng hợp từ hệ thống đào tạo nội bộ. Hãy phân tích và tạo insights.\n\n${data.summary}`;

  try {
    const result = await genAI.models.generateContent({
      model: CHAT_MODEL,
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: prompt }],
        },
      ],
      config: {
        systemInstruction: INSIGHTS_SYSTEM_PROMPT,
        temperature: 0.3,
        maxOutputTokens: 4096,
      },
    });

    const responseText = result.text ?? '';

    // Parse JSON — strip markdown code blocks if present
    let cleaned = responseText.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const insights: DashboardInsight[] = JSON.parse(cleaned);

    // Validate structure
    return insights
      .filter(
        (i) =>
          i &&
          typeof i.type === 'string' &&
          ['warning', 'success', 'info', 'action'].includes(i.type) &&
          typeof i.title === 'string' &&
          typeof i.description === 'string' &&
          typeof i.suggestion === 'string',
      )
      .slice(0, 10); // Cap at 10 insights
  } catch (error) {
    logger.error('AI Insights Gemini analysis error:', error);

    // Return a static fallback insight
    return [
      {
        type: 'info',
        title: 'Không thể tạo phân tích AI',
        description:
          'Hiện tại hệ thống AI không thể phân tích dữ liệu. Dữ liệu thô vẫn hiển thị bình thường trên Dashboard.',
        suggestion: 'Nhấn "Phân tích lại" sau vài phút hoặc liên hệ quản trị viên.',
      },
    ];
  }
};

// ========================
// Public API
// ========================

/**
 * Generate AI insights for Admin dashboard (system-wide).
 */
export const generateAdminInsights = async (forceRefresh = false): Promise<InsightsResponse> => {
  const cacheKey = getCacheKey('admin');

  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) {
      return {
        insights: cached,
        generatedAt: new Date().toISOString(),
        cached: true,
        scope: 'admin',
      };
    }
  }

  logger.info('🧠 Generating AI insights for Admin dashboard...');
  const data = await aggregateAdminData();
  const insights = await analyzeWithGemini(data);
  setCache(cacheKey, insights);

  return {
    insights,
    generatedAt: new Date().toISOString(),
    cached: false,
    scope: 'admin',
  };
};

/**
 * Generate AI insights for Manager dashboard (department-scoped).
 */
export const generateManagerInsights = async (
  departmentId: bigint,
  forceRefresh = false,
): Promise<InsightsResponse> => {
  const cacheKey = getCacheKey('manager', departmentId.toString());

  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) {
      return {
        insights: cached,
        generatedAt: new Date().toISOString(),
        cached: true,
        scope: 'manager',
      };
    }
  }

  logger.info(`🧠 Generating AI insights for Manager (dept: ${departmentId})...`);
  const data = await aggregateManagerData(departmentId);
  const insights = await analyzeWithGemini(data);
  setCache(cacheKey, insights);

  return {
    insights,
    generatedAt: new Date().toISOString(),
    cached: false,
    scope: 'manager',
  };
};

/**
 * Generate AI insights for Trainer dashboard (trainer-scoped).
 */
export const generateTrainerInsights = async (
  trainerId: bigint,
  forceRefresh = false,
): Promise<InsightsResponse> => {
  const cacheKey = getCacheKey('trainer', trainerId.toString());

  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) {
      return {
        insights: cached,
        generatedAt: new Date().toISOString(),
        cached: true,
        scope: 'trainer',
      };
    }
  }

  logger.info(`🧠 Generating AI insights for Trainer (id: ${trainerId})...`);
  const data = await aggregateTrainerData(trainerId);
  const insights = await analyzeWithGemini(data);
  setCache(cacheKey, insights);

  return {
    insights,
    generatedAt: new Date().toISOString(),
    cached: false,
    scope: 'trainer',
  };
};

/**
 * Force invalidate cache (useful for admin refresh button).
 */
export const invalidateInsightsCache = (scope?: string, scopeId?: string): void => {
  if (scope) {
    insightsCache.delete(getCacheKey(scope, scopeId));
  } else {
    insightsCache.clear();
  }
  logger.info(`🗑️ Insights cache invalidated: ${scope || 'all'}`);
};

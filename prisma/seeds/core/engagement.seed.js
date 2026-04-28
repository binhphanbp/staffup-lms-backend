/**
 * Seed engagement / activity demo data so trainer + admin dashboards have
 * meaningful numbers out of the box. Each seeder is idempotent — safe to run
 * multiple times.
 *
 *   - certificates       : for completed enrollments
 *   - risk assessments   : for in-progress enrollments
 *   - video summaries    : for video lessons (AI-generated transcript / chapters)
 *   - roleplay sessions  : completed conversations + evaluation
 *   - onboarding plans   : assigned plans for student1 (new hire scenario)
 *   - adaptive sessions  : completed adaptive quiz attempts
 *   - code submissions   : sample submissions for code-lab problems
 *   - chat sessions      : sample AI chatbot history
 *   - skill assessments  : history rows so trend charts have data points
 */

const STUDENT_EMAILS = [
  'student1@staffup.local',
  'student2@staffup.local',
  'student3@staffup.local',
];
const TRAINER_EMAIL = 'trainer1@staffup.local';
const ADMIN_EMAIL = 'admin@staffup.local';

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

async function seedCertificates(context) {
  const { prisma } = context;
  const completedEnrollments = await prisma.enrollment.findMany({
    where: { status: 'completed' },
    include: { course: true, user: true },
  });

  let count = 0;
  for (const enrollment of completedEnrollments) {
    const existing = await prisma.certificate.findUnique({
      where: { enrollmentId: enrollment.id },
    });
    if (existing) continue;

    const issuedAt = enrollment.completedAt ?? new Date();
    const code = `CERT-${enrollment.id.toString().padStart(6, '0')}-${issuedAt
      .getFullYear()
      .toString()}`;

    await prisma.certificate.create({
      data: {
        enrollmentId: enrollment.id,
        certificateCode: code,
        pdfUrl: `https://staffup.local/certificates/${code}.pdf`,
        issuedAt,
      },
    });
    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Risk assessments
// ---------------------------------------------------------------------------

const RISK_FIXTURES = [
  {
    studentEmail: 'student1@staffup.local',
    courseSlug: 'nodejs-api-fundamentals',
    riskScore: 72,
    riskLevel: 'high',
    reasons: [
      { code: 'low_engagement', label: 'Thời gian học giảm 40% trong 7 ngày qua' },
      { code: 'missed_deadline', label: 'Bỏ lỡ 2 bài học có hạn' },
    ],
    recommendations:
      'Liên hệ học viên để hiểu trở ngại. Lên lịch 1-1 với mentor trong tuần này.',
    interventions:
      '1. Gửi lời nhắc qua email\n2. Lên lịch họp với line manager\n3. Đánh giá khối lượng công việc hiện tại',
  },
  {
    studentEmail: 'student3@staffup.local',
    courseSlug: 'python-programming-basics-advanced',
    riskScore: 45,
    riskLevel: 'medium',
    reasons: [
      { code: 'slower_progress', label: 'Tiến độ chậm hơn trung bình lớp 25%' },
    ],
    recommendations:
      'Cung cấp tài liệu bổ sung cho phần Decorators. Đề xuất pair-learning với học viên Python tốt hơn.',
    interventions: 'Gợi ý pair-learning với student2',
  },
  {
    studentEmail: 'student1@staffup.local',
    courseSlug: 'python-programming-basics-advanced',
    riskScore: 18,
    riskLevel: 'low',
    reasons: [{ code: 'consistent_progress', label: 'Tiến độ ổn định, đúng kỳ vọng' }],
    recommendations: 'Tiếp tục theo dõi. Có thể đề xuất khóa nâng cao sau khi hoàn thành.',
    interventions: null,
  },
  {
    studentEmail: 'student2@staffup.local',
    courseSlug: 'vuejs-progressive-framework',
    riskScore: 12,
    riskLevel: 'low',
    reasons: [
      { code: 'high_engagement', label: 'Tham gia tích cực, vượt tiến độ' },
      { code: 'streak_active', label: 'Streak 12 ngày liên tục' },
    ],
    recommendations: 'Học viên tốt. Cân nhắc đề xuất role mentor.',
    interventions: null,
  },
];

async function seedRiskAssessments(context) {
  const { prisma } = context;
  let count = 0;

  for (const fixture of RISK_FIXTURES) {
    const user = await prisma.user.findUnique({ where: { email: fixture.studentEmail } });
    const course = await prisma.course.findUnique({ where: { slug: fixture.courseSlug } });
    if (!user || !course) continue;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (!enrollment) continue;

    const existing = await prisma.learnerRiskAssessment.findFirst({
      where: { enrollmentId: enrollment.id },
    });
    if (existing) continue;

    const calculatedAt = new Date(Date.now() - 24 * 3600 * 1000);
    const expiresAt = new Date(Date.now() + 6 * 24 * 3600 * 1000);

    await prisma.learnerRiskAssessment.create({
      data: {
        enrollmentId: enrollment.id,
        riskScore: fixture.riskScore,
        riskLevel: fixture.riskLevel,
        modelVersion: 'risk-v1.0',
        reasons: fixture.reasons,
        recommendations: fixture.recommendations,
        interventions: fixture.interventions,
        calculatedAt,
        expiresAt,
      },
    });
    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Video lesson summaries
// ---------------------------------------------------------------------------

async function seedVideoLessonSummaries(context) {
  const { prisma } = context;
  // Pick first 6 video lessons across cloudinary courses
  const lessons = await prisma.lesson.findMany({
    where: { lessonType: 'video', videoUrl: { not: null } },
    take: 6,
    orderBy: { id: 'asc' },
  });

  let count = 0;
  for (const lesson of lessons) {
    const existing = await prisma.videoLessonSummary.findUnique({
      where: { lessonId: lesson.id },
    });
    if (existing) continue;

    await prisma.videoLessonSummary.create({
      data: {
        lessonId: lesson.id,
        transcript: `Đây là transcript demo của bài "${lesson.title}". Trong bài này, giảng viên giới thiệu các khái niệm cốt lõi và minh hoạ qua ví dụ thực tế. Học viên cần nắm vững các nguyên tắc trước khi sang bài kế tiếp.`,
        chapters: [
          { startSeconds: 0, title: 'Mở đầu & mục tiêu' },
          { startSeconds: 60, title: 'Khái niệm chính' },
          { startSeconds: 240, title: 'Ví dụ thực hành' },
          { startSeconds: 480, title: 'Tổng kết' },
        ],
        keyPoints: [
          'Hiểu khái niệm cốt lõi và áp dụng được vào tình huống thực tế',
          'Phân biệt với các khái niệm tương đương dễ nhầm',
          'Best practice khi triển khai trong production',
        ],
        flashcards: [
          {
            front: `${lesson.title} là gì?`,
            back: 'Là kỹ thuật / khái niệm được giới thiệu ở bài này, nền tảng cho các bài tiếp theo.',
          },
          {
            front: 'Khi nào nên áp dụng?',
            back: 'Khi cần giải quyết bài toán phù hợp với pattern này.',
          },
        ],
        source: 'ai',
        model: 'gemini-2.0-flash',
      },
    });
    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Roleplay sessions
// ---------------------------------------------------------------------------

async function seedRoleplaySessions(context) {
  const { prisma } = context;
  const scenarios = await prisma.roleplayScenario.findMany({ take: 3 });
  if (scenarios.length === 0) return 0;

  const students = await prisma.user.findMany({
    where: { email: { in: STUDENT_EMAILS } },
  });
  if (students.length === 0) return 0;

  let count = 0;
  for (let i = 0; i < scenarios.length; i += 1) {
    const scenario = scenarios[i];
    const student = students[i % students.length];

    const existing = await prisma.roleplaySession.findFirst({
      where: { scenarioId: scenario.id, userId: student.id, status: 'completed' },
    });
    if (existing) continue;

    const startedAt = new Date(Date.now() - (i + 2) * 86400000);
    const endedAt = new Date(startedAt.getTime() + 18 * 60 * 1000);

    const session = await prisma.roleplaySession.create({
      data: {
        scenarioId: scenario.id,
        userId: student.id,
        status: 'completed',
        startedAt,
        endedAt,
      },
    });

    const turns = [
      { role: 'system', content: 'Bắt đầu cuộc hội thoại theo kịch bản.', orderIndex: 0 },
      {
        role: 'assistant',
        content: 'Xin chào, tôi là khách hàng. Tôi cần được hỗ trợ về sản phẩm của các bạn.',
        orderIndex: 1,
      },
      {
        role: 'user',
        content:
          'Chào anh/chị! Em rất sẵn lòng hỗ trợ. Anh/chị đang gặp vấn đề cụ thể như thế nào với sản phẩm ạ?',
        orderIndex: 2,
      },
      {
        role: 'assistant',
        content: 'Tôi đặt hàng đã 5 ngày nhưng chưa nhận được. Tôi cần giải quyết gấp.',
        orderIndex: 3,
      },
      {
        role: 'user',
        content:
          'Em rất xin lỗi vì sự bất tiện này. Em sẽ tra cứu đơn hàng ngay. Anh/chị cho em xin mã đơn để kiểm tra status vận chuyển nhé?',
        orderIndex: 4,
      },
      {
        role: 'assistant',
        content: 'Mã đơn của tôi là ORD-12345. Tôi cần biết khi nào nhận được.',
        orderIndex: 5,
      },
      {
        role: 'user',
        content:
          'Cảm ơn anh/chị. Em đã tra cứu — đơn đang ở trung tâm vận chuyển và sẽ giao trong 24h tới. Em cũng sẽ liên hệ shipper để đẩy nhanh, đồng thời gửi anh/chị mã giảm giá 10% cho lần mua tiếp theo. Anh/chị thấy giải pháp này được không ạ?',
        orderIndex: 6,
      },
      {
        role: 'assistant',
        content: 'Cảm ơn em, vậy được. Mong em theo sát giúp anh.',
        orderIndex: 7,
      },
    ];

    for (const turn of turns) {
      await prisma.roleplayTurn.create({
        data: {
          sessionId: session.id,
          role: turn.role,
          content: turn.content,
          orderIndex: turn.orderIndex,
          createdAt: new Date(startedAt.getTime() + turn.orderIndex * 60 * 1000),
        },
      });
    }

    await prisma.roleplayEvaluation.create({
      data: {
        sessionId: session.id,
        overallScore: [78, 85, 92][i] ?? 80,
        band: [78, 85, 92][i] >= 90 ? 'excellent' : [78, 85, 92][i] >= 80 ? 'good' : 'fair',
        criterionScores: [
          { criterion: 'Empathy & lắng nghe', score: 85 },
          { criterion: 'Giải quyết vấn đề', score: 80 },
          { criterion: 'Ngôn ngữ chuyên nghiệp', score: 88 },
          { criterion: 'Đề xuất giải pháp', score: 82 },
        ],
        strengths: [
          'Bắt đầu bằng lời xin lỗi chân thành',
          'Chủ động đề xuất giải pháp bồi thường (mã giảm giá)',
          'Giữ ngữ điệu chuyên nghiệp suốt cuộc hội thoại',
        ],
        improvements: [
          'Có thể hỏi thêm context cảm xúc trước khi nhảy vào giải pháp',
          'Nên xác nhận cụ thể về timeline (giờ phút) để khách hàng tin tưởng hơn',
        ],
        summary:
          'Hội thoại được xử lý tốt. Điểm mạnh là sự đồng cảm và đề xuất bồi thường. Cần luyện thêm về kỹ năng lắng nghe chủ động (active listening) để hiểu sâu hơn nhu cầu khách hàng trước khi giải quyết.',
      },
    });

    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Onboarding plans
// ---------------------------------------------------------------------------

async function seedOnboardingPlans(context) {
  const { prisma } = context;
  const newHire = await prisma.user.findUnique({
    where: { email: 'student1@staffup.local' },
  });
  const manager = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!newHire || !manager) return 0;

  const existing = await prisma.onboardingPlan.findFirst({
    where: { assigneeId: newHire.id, status: { in: ['active', 'in_progress'] } },
  });
  if (existing) return 0;

  const template = await prisma.onboardingTemplate.findFirst({ orderBy: { id: 'asc' } });

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const plan = await prisma.onboardingPlan.create({
    data: {
      templateId: template?.id ?? null,
      templateName: template?.name ?? 'Onboarding Backend Developer',
      assigneeId: newHire.id,
      managerId: manager.id,
      startDate,
      status: 'active',
      notes: 'Plan onboarding dành cho Junior Backend Developer mới gia nhập đội.',
    },
  });

  const stages = [
    {
      name: 'Tuần 1: Hiểu công ty & quy trình',
      description: 'Làm quen tools, đọc tài liệu nội bộ, gặp các team chính',
      orderIndex: 0,
      startOffsetDays: 0,
      endOffsetDays: 7,
      tasks: [
        {
          title: 'Cài đặt môi trường dev (Node, pnpm, Docker)',
          category: 'setup',
          priority: 'high',
          estimatedHours: 2,
          status: 'completed',
          completedDaysAgo: 6,
        },
        {
          title: 'Đọc tài liệu kiến trúc microservices',
          category: 'learning',
          priority: 'medium',
          estimatedHours: 3,
          status: 'completed',
          completedDaysAgo: 5,
        },
        {
          title: '1-1 với line manager — định hướng 90 ngày đầu',
          category: 'meeting',
          priority: 'high',
          estimatedHours: 1,
          status: 'completed',
          completedDaysAgo: 4,
        },
      ],
    },
    {
      name: 'Tuần 2-3: Nền tảng kỹ thuật',
      description: 'Hoàn thành các khóa học bắt buộc, làm quen codebase',
      orderIndex: 1,
      startOffsetDays: 7,
      endOffsetDays: 21,
      tasks: [
        {
          title: 'Hoàn thành khóa Python Programming',
          category: 'learning',
          priority: 'high',
          estimatedHours: 16,
          status: 'in_progress',
        },
        {
          title: 'Hoàn thành khóa Node.js API Fundamentals',
          category: 'learning',
          priority: 'high',
          estimatedHours: 12,
          status: 'in_progress',
        },
        {
          title: 'Pair-programming với senior trên 1 ticket nhỏ',
          category: 'practice',
          priority: 'medium',
          estimatedHours: 4,
          status: 'pending',
        },
      ],
    },
    {
      name: 'Tuần 4: Tự lập với hỗ trợ',
      description: 'Nhận ticket độc lập, code review từ senior',
      orderIndex: 2,
      startOffsetDays: 21,
      endOffsetDays: 30,
      tasks: [
        {
          title: 'Tự ship 2 ticket nhỏ vào production',
          category: 'practice',
          priority: 'high',
          estimatedHours: 8,
          status: 'pending',
        },
        {
          title: 'Review 360° với manager + 2 đồng nghiệp',
          category: 'meeting',
          priority: 'medium',
          estimatedHours: 1,
          status: 'pending',
        },
      ],
    },
  ];

  for (const stage of stages) {
    const created = await prisma.onboardingStage.create({
      data: {
        planId: plan.id,
        name: stage.name,
        description: stage.description,
        orderIndex: stage.orderIndex,
        startOffsetDays: stage.startOffsetDays,
        endOffsetDays: stage.endOffsetDays,
      },
    });
    for (let idx = 0; idx < stage.tasks.length; idx += 1) {
      const task = stage.tasks[idx];
      await prisma.onboardingTask.create({
        data: {
          stageId: created.id,
          title: task.title,
          category: task.category,
          priority: task.priority,
          estimatedHours: task.estimatedHours,
          orderIndex: idx,
          status: task.status,
          completedAt:
            task.status === 'completed' && task.completedDaysAgo
              ? new Date(Date.now() - task.completedDaysAgo * 86400000)
              : null,
          completedById: task.status === 'completed' ? newHire.id : null,
        },
      });
    }
  }

  return 1;
}

// ---------------------------------------------------------------------------
// Adaptive quiz sessions
// ---------------------------------------------------------------------------

async function seedAdaptiveQuizSessions(context) {
  const { prisma } = context;
  const banks = await prisma.questionBank.findMany({ take: 2, orderBy: { id: 'asc' } });
  if (banks.length === 0) return 0;

  const students = await prisma.user.findMany({
    where: { email: { in: STUDENT_EMAILS } },
  });

  let count = 0;
  for (let i = 0; i < Math.min(banks.length * 2, students.length * banks.length); i += 1) {
    const bank = banks[i % banks.length];
    const student = students[i % students.length];

    const existing = await prisma.adaptiveQuizSession.findFirst({
      where: { userId: student.id, questionBankId: bank.id, status: 'completed' },
    });
    if (existing) continue;

    const questions = await prisma.question.findMany({
      where: { questionBankId: bank.id },
      take: 8,
    });
    if (questions.length === 0) continue;

    const startedAt = new Date(Date.now() - (i + 1) * 2 * 86400000);
    const completedAt = new Date(startedAt.getTime() + 14 * 60 * 1000);

    let ability = 0.0;
    const items = [];
    for (let q = 0; q < questions.length; q += 1) {
      const isCorrect = Math.random() > 0.3;
      const before = ability;
      ability += isCorrect ? 0.2 : -0.15;
      items.push({
        questionId: questions[q].id,
        orderIndex: q,
        difficulty: 2 + (q % 4),
        isCorrect,
        abilityBefore: before,
        abilityAfter: ability,
        timeSpentMs: 15000 + Math.floor(Math.random() * 60000),
        answeredAt: new Date(startedAt.getTime() + (q + 1) * 90 * 1000),
      });
    }
    const correctCount = items.filter((it) => it.isCorrect).length;
    const band = ability > 0.5 ? 'advanced' : ability > 0 ? 'proficient' : 'developing';

    const session = await prisma.adaptiveQuizSession.create({
      data: {
        userId: student.id,
        questionBankId: bank.id,
        status: 'completed',
        maxQuestions: 10,
        currentDifficulty: 3,
        abilityScore: ability,
        correctCount,
        answeredCount: items.length,
        band,
        startedAt,
        completedAt,
      },
    });

    for (const item of items) {
      await prisma.adaptiveQuizItem.create({
        data: {
          sessionId: session.id,
          ...item,
        },
      });
    }

    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Code submissions
// ---------------------------------------------------------------------------

async function seedCodeSubmissions(context) {
  const { prisma } = context;
  const problems = await prisma.codeLabProblem.findMany({ take: 3 });
  const students = await prisma.user.findMany({
    where: { email: { in: STUDENT_EMAILS } },
  });

  let count = 0;
  for (const problem of problems) {
    for (const student of students) {
      const existing = await prisma.codeSubmission.findFirst({
        where: { problemId: problem.id, userId: student.id },
      });
      if (existing) continue;

      // First failed, then passing submission per (student, problem)
      await prisma.codeSubmission.create({
        data: {
          problemId: problem.id,
          userId: student.id,
          language: 'python',
          code: '# Lần thử đầu — chưa đầy đủ\ndef solution():\n    return None\n',
          status: 'failed',
          score: 30,
          summary: 'Chưa xử lý được edge case khi input rỗng.',
          evaluation: {
            tests: [
              { name: 'simple input', passed: true },
              { name: 'empty input', passed: false, error: 'Returned None' },
            ],
          },
          model: 'gemini-2.0-flash',
          createdAt: new Date(Date.now() - 3 * 86400000),
        },
      });
      await prisma.codeSubmission.create({
        data: {
          problemId: problem.id,
          userId: student.id,
          language: 'python',
          code: '# Hoàn chỉnh — handle edge cases\ndef solution(arr):\n    if not arr:\n        return 0\n    return sum(arr)\n',
          status: 'passed',
          score: 95,
          summary: 'Pass tất cả test case. Code clean và có handle edge case.',
          evaluation: {
            tests: [
              { name: 'simple input', passed: true },
              { name: 'empty input', passed: true },
              { name: 'large input', passed: true },
            ],
          },
          model: 'gemini-2.0-flash',
          createdAt: new Date(Date.now() - 2 * 86400000),
        },
      });
      count += 2;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// AI chat sessions (chatbot history)
// ---------------------------------------------------------------------------

const SAMPLE_CHATS = [
  {
    studentEmail: 'student1@staffup.local',
    title: 'Hỏi về async/await trong Python',
    messages: [
      {
        role: 'user',
        content: 'Anh ơi giải thích cho em sự khác nhau giữa async và threading trong Python với?',
      },
      {
        role: 'assistant',
        content:
          'Tốt thôi! Tóm gọn:\n\n- **threading**: nhiều thread thực sự, OS schedule. Tốt cho I/O-bound nhưng có GIL nên không tận dụng multi-core cho CPU-bound. Stack riêng, expensive context switch.\n- **async/await**: cooperative concurrency, single-thread event loop. Mỗi coroutine yield khi await I/O. Rẻ (1000s of coroutines), nhưng tasks CPU-bound sẽ block event loop.\n\nRule of thumb: I/O-heavy (nhiều API call, DB query) → async. CPU-heavy (xử lý ảnh, ML) → multiprocessing. Lib đồng bộ kế thừa → threading.',
      },
    ],
  },
  {
    studentEmail: 'student2@staffup.local',
    title: 'Vue 3 reactive vs ref',
    messages: [
      {
        role: 'user',
        content: 'Khi nào dùng ref(), khi nào dùng reactive() trong Vue 3?',
      },
      {
        role: 'assistant',
        content:
          'Quy tắc đơn giản:\n\n- **`ref()`**: cho primitive (number, string, boolean) hoặc khi cần reassign object. Truy cập qua `.value` trong setup script. Auto-unwrap trong template.\n- **`reactive()`**: cho object/array khi cần mutate trực tiếp `state.x = y`. Không reassign được (sẽ mất reactivity).\n\nThực tế: **Composition API mới — dùng `ref` cho mọi thứ**. Đỡ phải nhớ rule, đỡ destructure mất reactivity. `reactive` chỉ dùng khi muốn syntax mutate object kiểu OOP.',
      },
      {
        role: 'user',
        content: 'Vậy `toRefs()` để làm gì ạ?',
      },
      {
        role: 'assistant',
        content:
          '`toRefs(reactive_obj)` chuyển object reactive thành object có các property là `ref`, để có thể destructure mà không mất reactivity:\n\n```ts\nconst state = reactive({ x: 1, y: 2 })\nconst { x, y } = toRefs(state)\n// x.value, y.value vẫn reactive\n```\n\nDùng khi return từ composable hoặc cần expose nhiều state ra template.',
      },
    ],
  },
];

async function seedChatSessions(context) {
  const { prisma } = context;
  const users = await prisma.user.findMany({
    where: { email: { in: SAMPLE_CHATS.map((c) => c.studentEmail) } },
  });
  const userByEmail = new Map(users.map((u) => [u.email, u]));

  let count = 0;
  for (const chat of SAMPLE_CHATS) {
    const user = userByEmail.get(chat.studentEmail);
    if (!user) continue;

    const existing = await prisma.chatSession.findFirst({
      where: { userId: user.id, title: chat.title },
    });
    if (existing) continue;

    const session = await prisma.chatSession.create({
      data: {
        userId: user.id,
        title: chat.title,
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
    });
    for (let i = 0; i < chat.messages.length; i += 1) {
      const msg = chat.messages[i];
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          role: msg.role,
          content: msg.content,
          tokenCount: Math.ceil(msg.content.length / 4),
          createdAt: new Date(Date.now() - 2 * 86400000 + i * 60 * 1000),
        },
      });
    }
    count += 1;
  }
  return count;
}

// ---------------------------------------------------------------------------
// Skill assessment history
// ---------------------------------------------------------------------------

async function seedSkillAssessments(context) {
  const { prisma } = context;
  const users = await prisma.user.findMany({
    where: { email: { in: STUDENT_EMAILS } },
  });
  const trainer = await prisma.user.findUnique({ where: { email: TRAINER_EMAIL } });
  if (!trainer) return 0;

  // Pick top 5 skills
  const skills = await prisma.skill.findMany({ take: 5, orderBy: { id: 'asc' } });

  let count = 0;
  for (const user of users) {
    for (const skill of skills) {
      const existing = await prisma.skillAssessment.findFirst({
        where: { userId: user.id, skillId: skill.id },
      });
      if (existing) continue;

      // Two history points: 30 days ago + recent
      const baseLevel = 1 + Math.floor(Math.random() * 3);
      await prisma.skillAssessment.create({
        data: {
          userId: user.id,
          skillId: skill.id,
          level: baseLevel,
          source: 'self',
          assessedById: user.id,
        },
      });
      await prisma.skillAssessment.create({
        data: {
          userId: user.id,
          skillId: skill.id,
          level: Math.min(5, baseLevel + 1),
          source: 'manager',
          assessedById: trainer.id,
        },
      });
      count += 2;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

async function seedEngagement(context) {
  console.log('💎Seeding engagement / activity demo data...');

  const certificates = await seedCertificates(context);
  const risks = await seedRiskAssessments(context);
  const summaries = await seedVideoLessonSummaries(context);
  const sessions = await seedRoleplaySessions(context);
  const onboarding = await seedOnboardingPlans(context);
  const adaptive = await seedAdaptiveQuizSessions(context);
  const submissions = await seedCodeSubmissions(context);
  const chats = await seedChatSessions(context);
  const assessments = await seedSkillAssessments(context);

  console.log(
    `✅Engagement: ${certificates} certificates, ${risks} risk rows, ${summaries} video summaries, ${sessions} roleplay sessions, ${onboarding} onboarding plans, ${adaptive} adaptive quiz sessions, ${submissions} code submissions, ${chats} chat sessions, ${assessments} skill assessments\n`,
  );

  return {
    certificates,
    risks,
    summaries,
    sessions,
    onboarding,
    adaptive,
    submissions,
    chats,
    assessments,
  };
}

module.exports = { seedEngagement };

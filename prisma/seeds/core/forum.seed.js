/**
 * Seed discussion forum threads + replies for popular courses.
 * Idempotent: checks for existing threads per course before inserting.
 */

const STUDENT_EMAILS = [
  'student1@staffup.local',
  'student2@staffup.local',
  'student3@staffup.local',
];

const TRAINER_EMAILS = ['trainer1@staffup.local', 'trainer2@staffup.local'];
const ADMIN_EMAIL = 'admin@staffup.local';

// Threads grouped by course slug. Each thread has 2-5 replies. Idempotency key
// is composed of (courseSlug + title).
const THREADS_BY_COURSE = {
  'python-programming-basics-advanced': [
    {
      title: 'Sự khác biệt giữa list comprehension và generator expression?',
      authorEmail: 'student1@staffup.local',
      body: 'Khi nào nên dùng list comprehension `[x for x in ...]` và khi nào nên dùng generator `(x for x in ...)` ? Mình thấy syntax gần giống nhau, mong các thầy giải thích.',
      isPinned: false,
      isResolved: true,
      replies: [
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Câu hỏi hay! List comprehension tạo ngay toàn bộ list trong RAM, còn generator chỉ tạo iterator lazy — không tốn memory. Khi data lớn hoặc chỉ cần duyệt một lần, dùng generator. Khi cần index hoặc duyệt nhiều lần, dùng list.',
          isAccepted: true,
          daysAgo: 5,
        },
        {
          authorEmail: 'student2@staffup.local',
          body: 'Cảm ơn thầy, em hiểu rồi. Vậy `sum(x*2 for x in range(1000000))` sẽ tốt hơn `sum([x*2 for x in range(1000000)])` đúng không ạ?',
          daysAgo: 4,
        },
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Chính xác, generator version sẽ chạy nhanh hơn và không tốn 8MB memory cho list trung gian.',
          daysAgo: 4,
        },
      ],
    },
    {
      title: '[Pinned] Lộ trình ôn tập trước khi làm quiz cuối khóa',
      authorEmail: 'trainer1@staffup.local',
      body: 'Trước khi làm bài quiz tổng kết, các bạn nên ôn lại: (1) Data structures (list/dict/set/tuple), (2) Functions & closures, (3) Decorators, (4) Generators, (5) Exception handling, (6) File I/O. Mỗi phần dành 30 phút là đủ.',
      isPinned: true,
      replies: [
        {
          authorEmail: 'student3@staffup.local',
          body: 'Cảm ơn thầy, em sẽ làm theo. Phần decorator em vẫn còn mơ hồ, có ví dụ thực tế không thầy?',
          daysAgo: 2,
        },
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Em xem lại bài 12 module 4 — có ví dụ `@cache`, `@retry`, `@timing`. Practice 3 cái đó là vững.',
          daysAgo: 2,
        },
      ],
    },
  ],
  'nodejs-api-fundamentals': [
    {
      title: 'Express middleware async/await không catch được error?',
      authorEmail: 'student1@staffup.local',
      body: 'Em viết middleware async như này:\n```js\napp.get("/x", async (req, res) => { throw new Error("boom"); })\n```\nNhưng server không trả 500 mà bị unhandled rejection. Lỗi của em là gì ạ?',
      replies: [
        {
          authorEmail: 'trainer2@staffup.local',
          body: 'Express 4 không tự catch async error. Hai cách fix: (1) wrap bằng `try/catch` rồi gọi `next(err)`, (2) viết helper `catchAsync(fn) => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next)`. Express 5 thì tự lo (đã có trong khóa này).',
          isAccepted: true,
          daysAgo: 3,
        },
        {
          authorEmail: 'student1@staffup.local',
          body: 'Cảm ơn thầy! Em đã làm theo cách (2) và work ngay. Vậy là Express 5 sẽ tốt hơn cho async heavy?',
          daysAgo: 3,
        },
      ],
    },
    {
      title: 'Validate request với Zod hay Joi?',
      authorEmail: 'student3@staffup.local',
      body: 'Project mới em đang phân vân giữa Zod và Joi. Đặc biệt là phần TypeScript inference. Trainer có gợi ý gì không?',
      replies: [
        {
          authorEmail: 'trainer2@staffup.local',
          body: 'Nếu dùng TypeScript thì Zod ăn đứt — `z.infer<typeof schema>` cho ra type tự động. Joi vẫn tốt cho JS thuần và có ecosystem cũ. Khóa này dùng Zod làm chuẩn.',
          isAccepted: true,
          daysAgo: 7,
        },
      ],
    },
  ],
  'nextjs-typescript-modern-web': [
    {
      title: 'Server Component vs Client Component: khi nào dùng cái nào?',
      authorEmail: 'student2@staffup.local',
      body: 'Em đang gặp khó khăn quyết định component nào nên là server, component nào nên là client. Có rule of thumb không ạ?',
      isResolved: true,
      replies: [
        {
          authorEmail: 'trainer2@staffup.local',
          body: 'Default là Server Component. Chỉ thêm `"use client"` khi cần: (1) browser API (window/localStorage), (2) state/effects (useState/useEffect), (3) event handlers (onClick), (4) thư viện chỉ chạy client (Framer Motion, etc.). Nếu chỉ render data — luôn server.',
          isAccepted: true,
          daysAgo: 6,
        },
        {
          authorEmail: 'student2@staffup.local',
          body: 'Vậy nếu component gốc là client, thì children hoàn toàn là client phải không thầy? Em thử pass server component vào children và nó vẫn render được.',
          daysAgo: 6,
        },
        {
          authorEmail: 'trainer2@staffup.local',
          body: 'Đúng rồi! Khi truyền server component qua prop `children`, Next render trên server rồi đổ HTML xuống. Đây là pattern hay — client component bao bọc, server component bên trong.',
          daysAgo: 5,
        },
      ],
    },
  ],
  'uiux-design-figma': [
    {
      title: 'Auto-layout vs Constraint trong Figma',
      authorEmail: 'student2@staffup.local',
      body: 'Em chưa rõ khi nào dùng Auto-layout, khi nào dùng Constraint. Auto-layout nhìn giống flexbox CSS, còn Constraint thì giống absolute positioning?',
      replies: [
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Suy luận của em chính xác. Auto-layout = flexbox (responsive, dynamic content). Constraint = position relative (giữ vị trí khi resize). Modern UI design — 90% dùng Auto-layout. Constraint chỉ dùng cho overlay/floating elements.',
          isAccepted: true,
          daysAgo: 8,
        },
      ],
    },
  ],
  'devops-aws-complete-guide': [
    {
      title: 'EC2 vs ECS vs Lambda: chọn cái nào cho microservice nhỏ?',
      authorEmail: 'student3@staffup.local',
      body: 'Em có 1 service Node.js xử lý webhook (~100 req/min, peak 500 req/min). Nên deploy lên đâu cho tiết kiệm chi phí + dễ maintain?',
      replies: [
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Workload đó hợp Lambda nhất: pay-per-request, scale tự động, không cần lo server. Chỉ chú ý cold start (~200-500ms) — nếu cần latency thấp thì provisioned concurrency. ECS Fargate cho long-running. EC2 chỉ khi cần fine-tune OS / GPU.',
          isAccepted: true,
          daysAgo: 4,
        },
        {
          authorEmail: 'student3@staffup.local',
          body: 'Cảm ơn thầy. Em sẽ thử Lambda. CDK hay Terraform để IaC?',
          daysAgo: 3,
        },
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Cả 2 đều tốt. CDK nếu team toàn TS/Python (state vẫn là CloudFormation), Terraform nếu multi-cloud hoặc đã quen HCL. Khóa này có cả 2.',
          daysAgo: 3,
        },
      ],
    },
    {
      title: 'IAM Policy bị deny mặc dù role có quyền — tại sao?',
      authorEmail: 'student1@staffup.local',
      body: 'Role em có policy `s3:GetObject` cho bucket `my-bucket/*`, nhưng vẫn bị `AccessDenied`. Bucket policy không có deny gì cả. Lạ quá!',
      replies: [
        {
          authorEmail: 'trainer1@staffup.local',
          body: 'Check xem có SCP (Service Control Policy) ở Organization level không. Hoặc bucket có encryption KMS — cần thêm `kms:Decrypt` trên CMK. Hoặc Block Public Access. CloudTrail event có chi tiết deny reason rất rõ.',
          daysAgo: 9,
        },
      ],
    },
  ],
  'vuejs-progressive-framework': [
    {
      title: 'Composition API vs Options API — production có nên migrate?',
      authorEmail: 'student2@staffup.local',
      body: 'Project cũ Vue 2 Options API, giờ Vue 3 nên migrate sang Composition API không? Hay giữ Options API cho consistency?',
      replies: [
        {
          authorEmail: 'trainer2@staffup.local',
          body: 'Nếu codebase nhỏ (<5K LOC) — migrate luôn cho consistency. Nếu lớn — dùng Composition API cho code mới + refactor dần file by file. Composition API tốt hơn cho TypeScript + reuse logic (composables).',
          isAccepted: true,
          daysAgo: 11,
        },
      ],
    },
  ],
};

async function seedForumThreads(context) {
  const { prisma } = context;
  console.log('💬Seeding discussion forum...');

  const userEmails = [...STUDENT_EMAILS, ...TRAINER_EMAILS, ADMIN_EMAIL];
  const users = await prisma.user.findMany({
    where: { email: { in: userEmails } },
  });
  const userByEmail = new Map(users.map((u) => [u.email, u]));

  const courseSlugs = Object.keys(THREADS_BY_COURSE);
  const courses = await prisma.course.findMany({
    where: { slug: { in: courseSlugs } },
  });
  const courseBySlug = new Map(courses.map((c) => [c.slug, c]));

  let threadsCreated = 0;
  let repliesCreated = 0;

  for (const slug of courseSlugs) {
    const course = courseBySlug.get(slug);
    if (!course) {
      console.log(`     ⚠  Course not found: ${slug}`);
      continue;
    }

    for (const threadData of THREADS_BY_COURSE[slug]) {
      const author = userByEmail.get(threadData.authorEmail);
      if (!author) continue;

      const existing = await prisma.discussionThread.findFirst({
        where: { courseId: course.id, title: threadData.title },
      });

      if (existing) continue;

      const replyCount = threadData.replies?.length ?? 0;
      const lastReplyAt =
        replyCount > 0
          ? new Date(Date.now() - threadData.replies[replyCount - 1].daysAgo * 86400000)
          : null;

      const thread = await prisma.discussionThread.create({
        data: {
          courseId: course.id,
          authorId: author.id,
          title: threadData.title,
          body: threadData.body,
          isPinned: threadData.isPinned ?? false,
          isLocked: threadData.isLocked ?? false,
          isResolved: threadData.isResolved ?? false,
          viewCount: 30 + Math.floor(Math.random() * 200),
          replyCount,
          lastReplyAt,
          createdAt: new Date(Date.now() - 14 * 86400000),
        },
      });
      threadsCreated += 1;

      for (const replyData of threadData.replies ?? []) {
        const replyAuthor = userByEmail.get(replyData.authorEmail);
        if (!replyAuthor) continue;
        await prisma.discussionReply.create({
          data: {
            threadId: thread.id,
            authorId: replyAuthor.id,
            body: replyData.body,
            isAccepted: replyData.isAccepted ?? false,
            createdAt: new Date(Date.now() - replyData.daysAgo * 86400000),
          },
        });
        repliesCreated += 1;
      }
    }
  }

  console.log(`✅Forum: ${threadsCreated} threads, ${repliesCreated} replies\n`);

  return { threads: threadsCreated, replies: repliesCreated };
}

module.exports = { seedForumThreads };

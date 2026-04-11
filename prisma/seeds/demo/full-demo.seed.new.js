// ============================================================
// full-demo.seed.js  –  Comprehensive demo data for StaffUp LMS
// Run via:  SEED_DEMO=1 pnpm prisma db seed
// ============================================================

const argon2 = require('argon2');
const { basePermissions, rolePermissionCodes, systemRoles } = require('../shared/rbac.data');

const DEFAULT_PASSWORD = process.env.SEED_DEMO_PASSWORD?.trim() || 'Demo@2026';
let prisma;

// ─── MASTER DATA ─────────────────────────────────────────────────────────────

const DEPARTMENTS = [
  'Kỹ thuật phần mềm',
  'Sản phẩm & UX',
  'DevOps & Hạ tầng',
  'Dữ liệu & AI',
  'Marketing & Truyền thông',
  'Kinh doanh & Bán hàng',
  'Nhân sự & Đào tạo',
  'Tài chính & Kế toán',
  'Vận hành & Hậu cần',
  'An ninh thông tin',
];

const TRAINERS = [
  { fullName: 'Nguyễn Minh Tuấn', email: 'tuan.nguyen@staffup.local', position: 'Senior Software Engineer', dept: 0 },
  { fullName: 'Trần Thị Lan Anh', email: 'lananh.tran@staffup.local', position: 'Lead Data Scientist', dept: 3 },
  { fullName: 'Lê Hoàng Nam', email: 'nam.le@staffup.local', position: 'Cloud Architect', dept: 2 },
  { fullName: 'Phạm Thùy Linh', email: 'linh.pham@staffup.local', position: 'Product Manager', dept: 1 },
  { fullName: 'Võ Đức Hải', email: 'hai.vo@staffup.local', position: 'Security Engineer', dept: 9 },
];

const EMPLOYEES = [
  { fullName: 'Nguyễn Văn An', email: 'an.nguyen@staffup.local', position: 'Junior Developer', dept: 0 },
  { fullName: 'Trần Thị Bình', email: 'binh.tran@staffup.local', position: 'Frontend Developer', dept: 0 },
  { fullName: 'Lê Minh Cường', email: 'cuong.le@staffup.local', position: 'Backend Developer', dept: 0 },
  { fullName: 'Phạm Thị Dung', email: 'dung.pham@staffup.local', position: 'QA Engineer', dept: 0 },
  { fullName: 'Hoàng Văn Em', email: 'em.hoang@staffup.local', position: 'DevOps Engineer', dept: 2 },
  { fullName: 'Vũ Thị Fương', email: 'fuong.vu@staffup.local', position: 'Data Analyst', dept: 3 },
  { fullName: 'Đặng Minh Giang', email: 'giang.dang@staffup.local', position: 'ML Engineer', dept: 3 },
  { fullName: 'Bùi Thị Hà', email: 'ha.bui@staffup.local', position: 'UI/UX Designer', dept: 1 },
  { fullName: 'Đinh Văn Inh', email: 'inh.dinh@staffup.local', position: 'Product Designer', dept: 1 },
  { fullName: 'Phan Thị Joanh', email: 'joanh.phan@staffup.local', position: 'Marketing Specialist', dept: 4 },
  { fullName: 'Lý Minh Khoa', email: 'khoa.ly@staffup.local', position: 'Content Creator', dept: 4 },
  { fullName: 'Ngô Thị Lan', email: 'lan.ngo@staffup.local', position: 'Sales Executive', dept: 5 },
  { fullName: 'Đỗ Văn Mạnh', email: 'manh.do@staffup.local', position: 'Business Analyst', dept: 5 },
  { fullName: 'Hồ Thị Nga', email: 'nga.ho@staffup.local', position: 'HR Specialist', dept: 6 },
  { fullName: 'Trịnh Văn Oanh', email: 'oanh.trinh@staffup.local', position: 'Training Coordinator', dept: 6 },
  { fullName: 'Lưu Thị Phương', email: 'phuong.luu@staffup.local', position: 'Accountant', dept: 7 },
  { fullName: 'Điền Văn Quang', email: 'quang.dien@staffup.local', position: 'Financial Analyst', dept: 7 },
  { fullName: 'Cần Thị Rin', email: 'rin.can@staffup.local', position: 'Operations Manager', dept: 8 },
  { fullName: 'Sung Văn Sơn', email: 'son.sung@staffup.local', position: 'Logistics Coordinator', dept: 8 },
  { fullName: 'Tạ Thị Thanh', email: 'thanh.ta@staffup.local', position: 'Security Analyst', dept: 9 },
  { fullName: 'Uông Văn Uy', email: 'uy.uong@staffup.local', position: 'Penetration Tester', dept: 9 },
  { fullName: 'Vương Thị Vân', email: 'van.vuong@staffup.local', position: 'Full Stack Developer', dept: 0 },
  { fullName: 'Xích Minh Xuân', email: 'xuan.xich@staffup.local', position: 'System Administrator', dept: 2 },
  { fullName: 'Yến Thị Ý', email: 'y.yen@staffup.local', position: 'Data Engineer', dept: 3 },
  { fullName: 'Đào Văn Zung', email: 'zung.dao@staffup.local', position: 'Mobile Developer', dept: 0 },
];

const COURSES_DATA = [
  {
    title: 'Lập trình Node.js từ cơ bản đến nâng cao',
    slug: 'nodejs-co-ban-nang-cao',
    description: 'Học lập trình Node.js từ đầu, bao gồm Express, RESTful API, xác thực JWT và kết nối cơ sở dữ liệu.',
    catIdx: 0, trainerIdx: 0, deptIdx: 0, duration: 660,
    tags: ['nodejs', 'javascript', 'express'],
    status: 'published',
  },
  {
    title: 'React & Next.js – Xây dựng ứng dụng hiện đại',
    slug: 'react-nextjs-hien-dai',
    description: 'Thành thạo React hooks, Context API, Next.js App Router, SSR và tối ưu hiệu năng frontend.',
    catIdx: 1, trainerIdx: 0, deptIdx: 0, duration: 720,
    tags: ['react', 'nextjs', 'typescript'],
    status: 'published',
  },
  {
    title: 'TypeScript Nâng cao – Patterns & Best Practices',
    slug: 'typescript-nang-cao',
    description: 'Kiểu dữ liệu nâng cao, generics, decorators, design patterns và kiến trúc ứng dụng TypeScript.',
    catIdx: 0, trainerIdx: 0, deptIdx: 0, duration: 480,
    tags: ['typescript', 'nodejs'],
    status: 'published',
  },
  {
    title: 'Docker & Kubernetes – Container hóa ứng dụng',
    slug: 'docker-kubernetes',
    description: 'Đóng gói ứng dụng với Docker, quản lý cluster Kubernetes, CI/CD pipeline và Helm charts.',
    catIdx: 2, trainerIdx: 2, deptIdx: 2, duration: 540,
    tags: ['docker', 'kubernetes', 'devops'],
    status: 'published',
  },
  {
    title: 'AWS Cloud – Từ Practitioner đến Solutions Architect',
    slug: 'aws-cloud-architect',
    description: 'Các dịch vụ AWS cốt lõi: EC2, S3, RDS, Lambda, VPC, IAM và thiết kế kiến trúc đám mây.',
    catIdx: 5, trainerIdx: 2, deptIdx: 2, duration: 600,
    tags: ['aws', 'cloud'],
    status: 'published',
  },
  {
    title: 'Python cho Khoa học Dữ liệu',
    slug: 'python-data-science',
    description: 'Phân tích dữ liệu với Pandas, NumPy, Matplotlib và xây dựng mô hình Machine Learning cơ bản.',
    catIdx: 3, trainerIdx: 1, deptIdx: 3, duration: 660,
    tags: ['python', 'data-science', 'machine-learning'],
    status: 'published',
  },
  {
    title: 'Machine Learning với TensorFlow & PyTorch',
    slug: 'machine-learning-tensorflow',
    description: 'Deep learning, mạng neural, NLP và computer vision với TensorFlow 2.x và PyTorch.',
    catIdx: 3, trainerIdx: 1, deptIdx: 3, duration: 780,
    tags: ['python', 'machine-learning', 'deep-learning'],
    status: 'published',
  },
  {
    title: 'PostgreSQL – Thiết kế và tối ưu cơ sở dữ liệu',
    slug: 'postgresql-database-design',
    description: 'Schema design, indexing, query optimization, partitioning và high availability cho PostgreSQL.',
    catIdx: 0, trainerIdx: 0, deptIdx: 0, duration: 420,
    tags: ['postgresql', 'sql', 'database'],
    status: 'published',
  },
  {
    title: 'An ninh thông tin – Bảo mật ứng dụng web',
    slug: 'web-security-basics',
    description: 'OWASP Top 10, penetration testing, mã hóa dữ liệu, OAuth 2.0 và bảo mật API.',
    catIdx: 6, trainerIdx: 4, deptIdx: 9, duration: 540,
    tags: ['security', 'owasp', 'pentesting'],
    status: 'published',
  },
  {
    title: 'Product Management – Từ Ý tưởng đến Launch',
    slug: 'product-management',
    description: 'Product discovery, roadmap, OKRs, A/B testing, user research và go-to-market strategy.',
    catIdx: 7, trainerIdx: 3, deptIdx: 1, duration: 480,
    tags: ['product', 'management', 'agile'],
    status: 'published',
  },
  {
    title: 'UI/UX Design – Figma & Design System',
    slug: 'uiux-design-figma',
    description: 'Quy trình thiết kế UX, prototyping với Figma, design tokens, accessibility và usability testing.',
    catIdx: 8, trainerIdx: 3, deptIdx: 1, duration: 420,
    tags: ['design', 'figma', 'ux'],
    status: 'published',
  },
  {
    title: 'Git & GitHub – Quy trình làm việc chuyên nghiệp',
    slug: 'git-github-workflow',
    description: 'Branching strategies, pull requests, code review, Git hooks, GitHub Actions và monorepo.',
    catIdx: 2, trainerIdx: 0, deptIdx: 0, duration: 300,
    tags: ['git', 'github', 'devops'],
    status: 'published',
  },
  {
    title: 'Agile & Scrum – Quản lý dự án hiệu quả',
    slug: 'agile-scrum-management',
    description: 'Scrum framework, Sprint planning, retrospectives, Kanban và kỹ năng Scrum Master.',
    catIdx: 7, trainerIdx: 3, deptIdx: 1, duration: 300,
    tags: ['agile', 'scrum', 'management'],
    status: 'published',
  },
  {
    title: 'Microservices với Spring Boot & Kafka',
    slug: 'microservices-springboot-kafka',
    description: 'Thiết kế microservices, event-driven architecture, Kafka, API Gateway và service mesh.',
    catIdx: 0, trainerIdx: 0, deptIdx: 0, duration: 600,
    tags: ['java', 'microservices', 'kafka'],
    status: 'published',
  },
  {
    title: 'Redis & Caching Strategies',
    slug: 'redis-caching',
    description: 'Các pattern caching, Redis data structures, pub/sub, Lua scripting và cluster setup.',
    catIdx: 0, trainerIdx: 0, deptIdx: 0, duration: 240,
    tags: ['redis', 'caching', 'nodejs'],
    status: 'draft',
  },
];

const CATEGORIES = [
  { name: 'Phát triển Backend', slug: 'backend-development' },
  { name: 'Phát triển Frontend', slug: 'frontend-development' },
  { name: 'DevOps & CI/CD', slug: 'devops-cicd' },
  { name: 'Khoa học Dữ liệu & AI', slug: 'data-science-ai' },
  { name: 'Phát triển Mobile', slug: 'mobile-development' },
  { name: 'Điện toán đám mây', slug: 'cloud-computing' },
  { name: 'An ninh thông tin', slug: 'information-security' },
  { name: 'Quản lý & Kỹ năng mềm', slug: 'management-soft-skills' },
  { name: 'Thiết kế UI/UX', slug: 'ui-ux-design' },
  { name: 'Cơ sở dữ liệu', slug: 'databases' },
];

const TAGS_RAW = [
  'javascript', 'typescript', 'nodejs', 'react', 'nextjs', 'python',
  'docker', 'kubernetes', 'aws', 'cloud', 'postgresql', 'sql', 'database',
  'security', 'owasp', 'pentesting', 'git', 'github', 'devops',
  'agile', 'scrum', 'management', 'product', 'design', 'figma', 'ux',
  'machine-learning', 'deep-learning', 'data-science', 'kafka',
  'microservices', 'java', 'redis', 'caching', 'express',
];

// ─── CLEAR DATABASE ────────────────────────────────────────────────────────────

async function clearDatabase() {
  console.log('Clearing existing data...');
  await prisma.attemptResponseOption.deleteMany();
  await prisma.attemptResponse.deleteMany();
  await prisma.quizAttemptQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.learnerRiskAssessment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lessonResource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.roadmapAssignment.deleteMany();
  await prisma.roadmapCourse.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.courseTag.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.authSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  console.log('Database cleared');
}

// ─── DEPARTMENTS ───────────────────────────────────────────────────────────────

async function seedDepartments() {
  console.log('Seeding departments...');
  await prisma.department.createMany({
    data: DEPARTMENTS.map((name) => ({ name, isActive: true })),
  });
  const all = await prisma.department.findMany({ orderBy: { id: 'asc' } });
  console.log(all.length + ' departments created');
  return all;
}

// ─── RBAC ──────────────────────────────────────────────────────────────────────

async function seedRolesAndPermissions() {
  console.log('Seeding roles and permissions...');
  for (const role of systemRoles) {
    await prisma.role.create({ data: { ...role, isSystem: true } });
  }
  for (const [code, module, action, description] of basePermissions) {
    await prisma.permission.create({ data: { code, module, action, description } });
  }
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();
  const roleMap = new Map(roles.map((r) => [r.code, r.id]));
  const permissionMap = new Map(permissions.map((p) => [p.code, p.id]));
  for (const [roleCode, permCodes] of Object.entries(rolePermissionCodes)) {
    const roleId = roleMap.get(roleCode);
    for (const permCode of permCodes) {
      const permissionId = permissionMap.get(permCode);
      if (roleId && permissionId) {
        await prisma.rolePermission.create({ data: { roleId, permissionId } });
      }
    }
  }
  console.log(roles.length + ' roles, ' + permissions.length + ' permissions');
  return { roles, permissions };
}

// ─── USERS ────────────────────────────────────────────────────────────────────

async function seedUsers(departments, roles) {
  console.log('Seeding users...');
  const passwordHash = await argon2.hash(DEFAULT_PASSWORD);
  const adminRole = roles.find((r) => r.code === 'admin');
  const trainerRole = roles.find((r) => r.code === 'trainer');
  const employeeRole = roles.find((r) => r.code === 'employee');

  const users = [];

  // Admin
  const admin = await prisma.user.create({
    data: {
      fullName: 'Admin He thong',
      email: 'admin@staffup.local',
      positionTitle: 'System Administrator',
      departmentId: departments[6].id,
      passwordHash,
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      isActive: true,
    },
  });
  await prisma.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });
  users.push(admin);

  // Trainers
  for (let i = 0; i < TRAINERS.length; i++) {
    const t = TRAINERS[i];
    const user = await prisma.user.create({
      data: {
        fullName: t.fullName,
        email: t.email,
        positionTitle: t.position,
        departmentId: departments[t.dept].id,
        passwordHash,
        avatarUrl: 'https://i.pravatar.cc/150?img=' + (i + 2),
        isActive: true,
      },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: trainerRole.id } });
    users.push(user);
  }

  // Employees
  for (let i = 0; i < EMPLOYEES.length; i++) {
    const e = EMPLOYEES[i];
    const user = await prisma.user.create({
      data: {
        fullName: e.fullName,
        email: e.email,
        positionTitle: e.position,
        departmentId: departments[e.dept].id,
        passwordHash,
        avatarUrl: 'https://i.pravatar.cc/150?img=' + (i + 10),
        isActive: i < 22,
      },
    });
    await prisma.userRole.create({ data: { userId: user.id, roleId: employeeRole.id } });
    users.push(user);
  }

  console.log(users.length + ' users (1 admin, ' + TRAINERS.length + ' trainers, ' + EMPLOYEES.length + ' employees)');
  return users;
}

// ─── CATEGORIES & TAGS ────────────────────────────────────────────────────────

async function seedCategoriesAndTags() {
  console.log('Seeding categories and tags...');
  await prisma.category.createMany({ data: CATEGORIES });
  await prisma.tag.createMany({
    data: TAGS_RAW.map((name) => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') })),
  });
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
  const tags = await prisma.tag.findMany({ orderBy: { id: 'asc' } });
  const tagMap = new Map(tags.map((t) => [t.slug, t.id]));
  console.log(categories.length + ' categories, ' + tags.length + ' tags');
  return { categories, tags, tagMap };
}

// ─── COURSES ──────────────────────────────────────────────────────────────────

async function seedCourses(users, departments, categories, tagMap) {
  console.log('Seeding courses...');
  const trainers = users.slice(1, 1 + TRAINERS.length);

  const courseThumbPhotos = [
    '1461749236802-b8d952c5b8e7', '1516321318423-f06f85e504b3', '1555066931-bf19f8fd1085',
    '1518770660439-4636190af475', '1451187580459-43490279c0fa', '1504639725590-34d0984388bd',
    '1517077304055-6e89abbf09b0', '1558494949-ef010cbdcc31', '1550751827-4bd374c3f58b',
    '1507003211169-0a1dd7228f2d', '1573496359142-b8d87734a5a2', '1522071820081-009f0129c71c',
    '1531297484001-80022131f5a1', '1526374965328-7f61d4dc18c5', '1460925895917-afdab827c52f',
  ];

  const courses = [];
  for (let i = 0; i < COURSES_DATA.length; i++) {
    const cd = COURSES_DATA[i];
    const trainer = trainers[cd.trainerIdx];
    const cat = categories[cd.catIdx];
    const dept = departments[cd.deptIdx];
    const photoId = courseThumbPhotos[i % courseThumbPhotos.length];
    const daysPublished = 30 + i * 7;
    const publishedAt = new Date(Date.now() - daysPublished * 86400000);

    const course = await prisma.course.create({
      data: {
        title: cd.title,
        slug: cd.slug,
        description: cd.description,
        categoryId: cat.id,
        trainerUserId: trainer.id,
        ownerDepartmentId: dept.id,
        estimatedDurationMinutes: cd.duration,
        thumbnailUrl: 'https://images.unsplash.com/photo-' + photoId + '?w=400&q=80',
        status: cd.status,
        publishedAt: cd.status === 'published' ? publishedAt : null,
      },
    });

    for (const tagSlug of cd.tags) {
      const tagId = tagMap.get(tagSlug);
      if (tagId) await prisma.courseTag.create({ data: { courseId: course.id, tagId } });
    }

    courses.push(course);
  }
  console.log(courses.length + ' courses');
  return courses;
}

// ─── MODULES & LESSONS ────────────────────────────────────────────────────────

const MODULE_TITLE_SETS = [
  ['Gioi thieu & Tong quan', 'Kien thuc nen tang', 'Thuc hanh co ban', 'Nang cao & Toi uu', 'Du an thuc te & Review'],
  ['Cai dat moi truong', 'Cac khai niem cot loi', 'Xay dung tinh nang', 'Trien khai & Testing'],
  ['Overview & Setup', 'Core Concepts', 'Advanced Patterns', 'Real-world Project'],
];

const LESSON_TITLE_SETS = [
  'Bai 1: Tong quan chu de',
  'Bai 2: Cai dat va cau hinh moi truong',
  'Bai 3: Khai niem va cau truc co ban',
  'Bai 4: Vi du thuc hanh dau tien',
  'Bai 5: Cac tinh nang quan trong',
  'Bai 6: Xu ly loi va debugging',
  'Quiz kiem tra kien thuc',
];

async function seedModulesAndLessons(courses) {
  console.log('Seeding modules and lessons...');
  let totalModules = 0, totalLessons = 0;

  for (let ci = 0; ci < courses.length; ci++) {
    const course = courses[ci];
    const moduleSet = MODULE_TITLE_SETS[ci % MODULE_TITLE_SETS.length];
    const numModules = 3 + (ci % 3);

    for (let m = 0; m < numModules; m++) {
      const mod = await prisma.module.create({
        data: {
          courseId: course.id,
          title: moduleSet[m] || ('Module ' + (m + 1)),
          orderIndex: m + 1,
        },
      });
      totalModules++;

      const numLessons = 4 + (m % 3);
      for (let l = 0; l < numLessons; l++) {
        const kinds = ['video', 'video', 'article', 'quiz'];
        const lessonType = l === numLessons - 1 ? 'quiz' : kinds[l % 3];
        await prisma.lesson.create({
          data: {
            moduleId: mod.id,
            title: LESSON_TITLE_SETS[l] || ('Bai ' + (l + 1)),
            lessonType,
            contentText: lessonType === 'article' ? ('Noi dung bai hoc chi tiet module ' + (m + 1) + ', bai ' + (l + 1)) : null,
            videoUrl: lessonType === 'video' ? ('https://example.com/videos/' + course.slug + '-m' + (m + 1) + '-l' + (l + 1) + '.mp4') : null,
            durationSeconds: lessonType === 'video' ? 600 + l * 180 : lessonType === 'article' ? 300 : 900,
            orderIndex: l + 1,
            isPreview: l === 0 && m === 0,
          },
        });
        totalLessons++;
      }
    }
  }
  console.log(totalModules + ' modules, ' + totalLessons + ' lessons');
}

// ─── ROADMAPS ─────────────────────────────────────────────────────────────────

async function seedRoadmaps(departments, categories, admin, courses) {
  console.log('Seeding roadmaps...');

  const roadmapsData = [
    {
      title: 'Lo trinh Backend Developer',
      description: 'Toan bo kien thuc can thiet de tro thanh mot Backend Developer chuyen nghiep tai StaffUp.',
      targetPosition: 'Backend Developer',
      deptIdx: 0, catIdx: 0,
      courseIdxs: [0, 2, 7, 14],
    },
    {
      title: 'Lo trinh Frontend Developer',
      description: 'Hoc React, Next.js va TypeScript de xay dung giao dien web hien dai.',
      targetPosition: 'Frontend Developer',
      deptIdx: 0, catIdx: 1,
      courseIdxs: [1, 2, 11],
    },
    {
      title: 'Lo trinh Full Stack Developer',
      description: 'Ket hop backend va frontend de tro thanh Full Stack Developer toan dien.',
      targetPosition: 'Full Stack Developer',
      deptIdx: 0, catIdx: 0,
      courseIdxs: [0, 1, 2, 7, 11],
    },
    {
      title: 'Lo trinh DevOps Engineer',
      description: 'Docker, Kubernetes, AWS va CI/CD pipeline cho ky su DevOps.',
      targetPosition: 'DevOps Engineer',
      deptIdx: 2, catIdx: 2,
      courseIdxs: [3, 4, 11],
    },
    {
      title: 'Lo trinh Data Scientist',
      description: 'Python, Machine Learning va AI de phan tich du lieu doanh nghiep.',
      targetPosition: 'Data Scientist',
      deptIdx: 3, catIdx: 3,
      courseIdxs: [5, 6],
    },
    {
      title: 'Lo trinh Cloud Architect',
      description: 'Thiet ke kien truc dam may voi AWS va ky thuat container hoa.',
      targetPosition: 'Cloud Architect',
      deptIdx: 2, catIdx: 5,
      courseIdxs: [3, 4],
    },
    {
      title: 'Lo trinh Security Engineer',
      description: 'Bao mat ung dung web va ha tang CNTT cho ky su an ninh thong tin.',
      targetPosition: 'Security Engineer',
      deptIdx: 9, catIdx: 6,
      courseIdxs: [8],
    },
    {
      title: 'Lo trinh Product Manager',
      description: 'Quan ly san pham tu y tuong den launch, OKRs va user research.',
      targetPosition: 'Product Manager',
      deptIdx: 1, catIdx: 7,
      courseIdxs: [9, 12],
    },
    {
      title: 'Lo trinh UI/UX Designer',
      description: 'Design thinking, Figma va xay dung design system chuyen nghiep.',
      targetPosition: 'UI/UX Designer',
      deptIdx: 1, catIdx: 8,
      courseIdxs: [10, 12],
    },
    {
      title: 'Nang luc cot loi Ky su phan mem',
      description: 'Git, Agile va TypeScript - bo ky nang nen tang cho moi ky su phan mem.',
      targetPosition: 'Software Engineer',
      deptIdx: 0, catIdx: 0,
      courseIdxs: [11, 12, 2],
    },
  ];

  const roadmaps = [];
  for (const rd of roadmapsData) {
    const roadmap = await prisma.roadmap.create({
      data: {
        title: rd.title,
        description: rd.description,
        targetPosition: rd.targetPosition,
        departmentId: departments[rd.deptIdx].id,
        categoryId: categories[rd.catIdx].id,
        createdByUserId: admin.id,
        isActive: true,
      },
    });
    for (let i = 0; i < rd.courseIdxs.length; i++) {
      const courseIdx = rd.courseIdxs[i];
      if (courseIdx < courses.length) {
        await prisma.roadmapCourse.create({
          data: {
            roadmapId: roadmap.id,
            courseId: courses[courseIdx].id,
            orderIndex: i + 1,
            isRequired: i < 2,
          },
        });
      }
    }
    roadmaps.push(roadmap);
  }
  console.log(roadmaps.length + ' roadmaps');
  return roadmaps;
}

// ─── ENROLLMENTS ──────────────────────────────────────────────────────────────

async function seedEnrollments(users, courses, admin) {
  console.log('Seeding enrollments...');
  const employees = users.filter((_, i) => i > TRAINERS.length);
  const publishedCourses = courses.filter((c) => c.status === 'published');

  let enrollCount = 0, certCount = 0;
  const now = Date.now();

  for (let ei = 0; ei < employees.length; ei++) {
    const emp = employees[ei];
    const numCourses = 2 + (ei % 4);
    const startCourse = (ei * 3) % publishedCourses.length;

    for (let ci = 0; ci < numCourses; ci++) {
      const course = publishedCourses[(startCourse + ci) % publishedCourses.length];

      const existing = await prisma.enrollment.findFirst({
        where: { userId: emp.id, courseId: course.id },
      });
      if (existing) continue;

      const daysAgo = 5 + ei * 2 + ci;
      const enrolledAt = new Date(now - daysAgo * 86400000);

      let progressPercent;
      const slot = (ei + ci) % 5;
      if (slot === 0) progressPercent = 100;
      else if (slot === 1) progressPercent = 75 + (ei % 20);
      else if (slot === 2) progressPercent = 40 + (ei % 35);
      else if (slot === 3) progressPercent = 10 + (ei % 25);
      else progressPercent = 0;

      progressPercent = Math.min(100, progressPercent);
      const isCompleted = progressPercent >= 100;
      const hasStarted = progressPercent > 0;

      const isDue = ei % 4 === 0;
      let dueAt = null;
      if (isDue && !isCompleted) {
        dueAt = new Date(now + (ei % 3 === 0 ? -3 : 5) * 86400000);
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: emp.id,
          courseId: course.id,
          assignedByUserId: admin.id,
          status: isCompleted ? 'completed' : hasStarted ? 'in_progress' : 'assigned',
          progressPercentCache: progressPercent,
          completedLessonsCountCache: Math.floor(progressPercent / 10),
          timeSpentSecondsCache: progressPercent * 180,
          dueAt,
          enrolledAt,
          startedAt: hasStarted ? new Date(enrolledAt.getTime() + 86400000) : null,
          completedAt: isCompleted ? new Date(now - 86400000) : null,
          lastActivityAt: hasStarted ? new Date(now - (ei % 5) * 3600000) : null,
        },
      });
      enrollCount++;

      if (isCompleted) {
        const certCode = 'CERT-' + new Date().getFullYear() + '-' + String(certCount + 1).padStart(4, '0');
        await prisma.certificate.create({
          data: {
            enrollmentId: enrollment.id,
            certificateCode: certCode,
            pdfUrl: 'https://staffup.local/certificates/' + certCode + '.pdf',
            issuedAt: enrollment.completedAt || new Date(),
          },
        });
        certCount++;
      }

      if (hasStarted) {
        const modules = await prisma.module.findMany({
          where: { courseId: course.id },
          include: { lessons: { orderBy: { orderIndex: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        });
        const allLessons = modules.flatMap((m) => m.lessons);
        const targetDone = Math.floor((progressPercent / 100) * allLessons.length);

        for (let li = 0; li < allLessons.length; li++) {
          const lesson = allLessons[li];
          if (li < targetDone) {
            await prisma.lessonProgress.upsert({
              where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
              create: {
                enrollmentId: enrollment.id,
                lessonId: lesson.id,
                status: 'completed',
                watchTimeSeconds: lesson.durationSeconds,
                lastPositionSeconds: lesson.durationSeconds,
                startedAt: new Date(enrolledAt.getTime() + li * 3600000),
                completedAt: new Date(enrolledAt.getTime() + (li + 1) * 3600000),
                lastAccessedAt: new Date(now - (ei % 12) * 3600000),
              },
              update: {},
            });
          } else if (li === targetDone && !isCompleted) {
            await prisma.lessonProgress.upsert({
              where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
              create: {
                enrollmentId: enrollment.id,
                lessonId: lesson.id,
                status: 'in_progress',
                watchTimeSeconds: Math.floor(lesson.durationSeconds * 0.5),
                lastPositionSeconds: Math.floor(lesson.durationSeconds * 0.5),
                startedAt: new Date(now - 3600000),
                lastAccessedAt: new Date(now - (ei % 2) * 1800000),
              },
              update: {},
            });
            break;
          }
        }
      }
    }
  }

  // Extra: cancelled/expired for variety
  const extraStatuses = [
    { empIdx: 0, courseIdx: 12, status: 'cancelled', progress: 20 },
    { empIdx: 1, courseIdx: 13, status: 'expired', progress: 45, dueAt: new Date(now - 30 * 86400000) },
    { empIdx: 5, courseIdx: 11, status: 'cancelled', progress: 10 },
  ];
  for (const ex of extraStatuses) {
    const emp = employees[ex.empIdx];
    const course = courses[ex.courseIdx];
    if (!emp || !course) continue;
    const existing = await prisma.enrollment.findFirst({ where: { userId: emp.id, courseId: course.id } });
    if (existing) continue;
    await prisma.enrollment.create({
      data: {
        userId: emp.id,
        courseId: course.id,
        assignedByUserId: admin.id,
        status: ex.status,
        progressPercentCache: ex.progress,
        completedLessonsCountCache: Math.floor(ex.progress / 10),
        timeSpentSecondsCache: ex.progress * 120,
        dueAt: ex.dueAt || null,
        enrolledAt: new Date(now - 45 * 86400000),
        startedAt: new Date(now - 43 * 86400000),
        lastActivityAt: new Date(now - 40 * 86400000),
      },
    });
    enrollCount++;
  }

  console.log(enrollCount + ' enrollments, ' + certCount + ' certificates');
}

// ─── ROADMAP ASSIGNMENTS ───────────────────────────────────────────────────────

async function seedRoadmapAssignments(users, roadmaps, admin) {
  console.log('Seeding roadmap assignments...');
  const employees = users.filter((_, i) => i > TRAINERS.length);
  let count = 0;

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const roadmap = roadmaps[i % roadmaps.length];
    const statuses = ['assigned', 'in_progress', 'in_progress', 'completed'];
    const status = statuses[i % 4];
    const daysAgo = 14 + i * 2;

    await prisma.roadmapAssignment.create({
      data: {
        userId: emp.id,
        roadmapId: roadmap.id,
        assignedByUserId: admin.id,
        status,
        assignedAt: new Date(Date.now() - daysAgo * 86400000),
        startedAt: status !== 'assigned' ? new Date(Date.now() - (daysAgo - 2) * 86400000) : null,
        completedAt: status === 'completed' ? new Date(Date.now() - 86400000) : null,
      },
    });
    count++;
  }
  console.log(count + ' roadmap assignments');
}

// ─── LESSON RESOURCES ─────────────────────────────────────────────────────────

async function seedLessonResources() {
  console.log('Seeding lesson resources...');
  const lessons = await prisma.lesson.findMany({ orderBy: { id: 'asc' }, take: 40 });
  let count = 0;
  const resourceTypes = ['pdf', 'slide', 'doc'];
  const resourceNames = ['Tai lieu tham khao', 'Slide bai giang', 'Bai tap thuc hanh', 'Cheat sheet'];

  for (const lesson of lessons) {
    const num = 1 + (count % 2);
    for (let i = 0; i < num; i++) {
      await prisma.lessonResource.create({
        data: {
          lessonId: lesson.id,
          fileName: resourceNames[i % resourceNames.length] + ' - Bai ' + lesson.orderIndex + '.' + resourceTypes[i % resourceTypes.length],
          fileUrl: 'https://staffup.local/resources/lesson-' + lesson.id + '-' + (i + 1) + '.' + resourceTypes[i % resourceTypes.length],
          resourceType: resourceTypes[i % resourceTypes.length],
          orderIndex: i + 1,
        },
      });
      count++;
    }
  }
  console.log(count + ' lesson resources');
}

// ─── QUESTION BANKS & QUESTIONS ───────────────────────────────────────────────

const QB_DATA = [
  { title: 'Ngan hang cau hoi Node.js & Express', catIdx: 0 },
  { title: 'Ngan hang cau hoi React & Next.js', catIdx: 1 },
  { title: 'Ngan hang cau hoi TypeScript', catIdx: 0 },
  { title: 'Ngan hang cau hoi Docker & Kubernetes', catIdx: 2 },
  { title: 'Ngan hang cau hoi AWS Cloud', catIdx: 5 },
  { title: 'Ngan hang cau hoi Python & Data Science', catIdx: 3 },
  { title: 'Ngan hang cau hoi Machine Learning', catIdx: 3 },
  { title: 'Ngan hang cau hoi SQL & PostgreSQL', catIdx: 9 },
  { title: 'Ngan hang cau hoi Bao mat ung dung', catIdx: 6 },
  { title: 'Ngan hang cau hoi Agile & Scrum', catIdx: 7 },
  { title: 'Ngan hang cau hoi Product Management', catIdx: 7 },
  { title: 'Ngan hang cau hoi UI/UX Design', catIdx: 8 },
];

const GENERIC_QUESTIONS = [
  { type: 'single_choice', opts: ['Dap an A - Chinh xac', 'Dap an B - Sai', 'Dap an C - Sai', 'Dap an D - Sai'], correct: [0] },
  { type: 'single_choice', opts: ['Lua chon 1', 'Lua chon 2 - Dung', 'Lua chon 3', 'Lua chon 4'], correct: [1] },
  { type: 'multiple_choice', opts: ['Tinh nang A', 'Tinh nang B', 'Tinh nang C', 'Tinh nang D - Sai'], correct: [0, 1, 2] },
  { type: 'essay', opts: [], correct: [] },
  { type: 'single_choice', opts: ['True', 'False', 'Maybe', 'None of above'], correct: [0] },
  { type: 'multiple_choice', opts: ['Phuong phap 1', 'Phuong phap 2', 'Khong co phuong phap nao', 'Phuong phap 4'], correct: [0, 1] },
  { type: 'essay', opts: [], correct: [] },
  { type: 'single_choice', opts: ['Option A', 'Option B', 'Option C - correct', 'Option D'], correct: [2] },
];

async function seedQuestionBanks(users, categories) {
  console.log('Seeding question banks and questions...');
  const trainers = users.slice(1, 1 + TRAINERS.length);
  const qbs = [];
  let qCount = 0, optCount = 0;

  for (let i = 0; i < QB_DATA.length; i++) {
    const qbd = QB_DATA[i];
    const qb = await prisma.questionBank.create({
      data: {
        categoryId: categories[qbd.catIdx].id,
        ownerTrainerId: trainers[i % trainers.length].id,
        title: qbd.title,
        description: 'Bo cau hoi danh gia kien thuc: ' + qbd.title,
        isActive: true,
      },
    });
    qbs.push(qb);

    const numQuestions = 8;
    for (let q = 0; q < numQuestions; q++) {
      const gq = GENERIC_QUESTIONS[q % GENERIC_QUESTIONS.length];
      const pts = 1 + (q % 3);

      const question = await prisma.question.create({
        data: {
          questionBankId: qb.id,
          questionType: gq.type,
          content: 'Cau hoi ' + (q + 1) + ' cua ngan hang: ' + qbd.title + '. Hay chon dap an dung nhat.',
          explanation: 'Giai thich chi tiet dap an cho cau hoi ' + (q + 1) + '.',
          defaultPoints: pts,
          isActive: true,
        },
      });
      qCount++;

      for (let o = 0; o < gq.opts.length; o++) {
        await prisma.questionOption.create({
          data: {
            questionId: question.id,
            content: gq.opts[o],
            isCorrect: gq.correct.includes(o),
            orderIndex: o + 1,
          },
        });
        optCount++;
      }
    }
  }

  console.log(qbs.length + ' question banks, ' + qCount + ' questions, ' + optCount + ' options');
  return qbs;
}

// ─── QUIZZES & ATTEMPTS ───────────────────────────────────────────────────────

async function seedQuizzesAndAttempts(courses, questionBanks, users) {
  console.log('Seeding quizzes and attempts...');
  const publishedCourses = courses.filter((c) => c.status === 'published');
  let quizCount = 0, attemptCount = 0;

  for (let ci = 0; ci < publishedCourses.length; ci++) {
    const course = publishedCourses[ci];
    const qb = questionBanks[ci % questionBanks.length];

    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: 'Kiem tra cuoi khoa: ' + course.title,
        description: 'Bai kiem tra danh gia kien thuc tong hop sau khoa hoc ' + course.title,
        selectionMode: ci % 3 === 0 ? 'random_pool' : 'fixed',
        passScorePercent: 70,
        timeLimitMinutes: 30 + (ci % 3) * 10,
        maxAttempts: 3,
        questionsToPull: ci % 3 === 0 ? 5 : null,
        shuffleQuestions: true,
        shuffleOptions: true,
      },
    });
    quizCount++;

    const questions = await prisma.question.findMany({
      where: { questionBankId: qb.id },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
      take: 5,
      orderBy: { id: 'asc' },
    });

    const quizQuestions = [];
    for (let qi = 0; qi < questions.length; qi++) {
      const qq = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionId: questions[qi].id,
          orderIndex: qi + 1,
          points: questions[qi].defaultPoints,
          isRequired: true,
        },
      });
      quizQuestions.push({ ...qq, question: questions[qi] });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id, status: { in: ['in_progress', 'completed'] } },
      take: 8,
    });

    for (const enrollment of enrollments) {
      const numAttempts = 1 + (attemptCount % 2);
      for (let at = 0; at < numAttempts; at++) {
        const score = 55 + Math.floor(Math.random() * 45);
        const isPassed = score >= 70;
        const statuses = ['graded', 'graded', 'submitted'];
        const attemptStatus = statuses[attemptCount % 3];
        const daysAgo = 3 + at;

        const attempt = await prisma.quizAttempt.create({
          data: {
            enrollmentId: enrollment.id,
            quizId: quiz.id,
            attemptNo: at + 1,
            status: attemptStatus,
            objectiveScore: score,
            totalScore: attemptStatus === 'graded' ? score : null,
            isPassed: attemptStatus === 'graded' ? isPassed : null,
            startedAt: new Date(Date.now() - daysAgo * 86400000),
            submittedAt: new Date(Date.now() - daysAgo * 86400000 + 28 * 60000),
            gradedAt: attemptStatus === 'graded' ? new Date(Date.now() - daysAgo * 86400000 + 35 * 60000) : null,
            timeSpentSeconds: 1200 + at * 300,
          },
        });
        attemptCount++;

        for (let aq = 0; aq < quizQuestions.length; aq++) {
          const qq = quizQuestions[aq];
          const q = qq.question;

          const aqRecord = await prisma.quizAttemptQuestion.create({
            data: {
              attemptId: attempt.id,
              quizQuestionId: qq.id,
              questionId: q.id,
              displayOrder: aq + 1,
              maxPoints: qq.points,
              questionSnapshot: { content: q.content, type: q.questionType },
              optionsSnapshot: q.options.map((o) => ({ id: o.id.toString(), content: o.content, orderIndex: o.orderIndex })),
            },
          });

          const isCorrect = Math.random() > 0.3;
          const awarded = isCorrect ? qq.points : 0;

          const response = await prisma.attemptResponse.create({
            data: {
              attemptQuestionId: aqRecord.id,
              responseText: q.questionType === 'essay' ? 'Cau tra loi cua hoc vien cho cau hoi tu luan nay...' : null,
              isCorrect: q.questionType !== 'essay' ? isCorrect : null,
              awardedPoints: attemptStatus === 'graded' ? awarded : null,
              gradedAt: attemptStatus === 'graded' ? attempt.gradedAt : null,
            },
          });

          if (q.questionType !== 'essay' && q.options.length > 0) {
            const correctOpts = q.options.filter((o) => o.isCorrect);
            const wrongOpts = q.options.filter((o) => !o.isCorrect);
            let selectedOpts = [];
            if (isCorrect) {
              selectedOpts = q.questionType === 'single_choice'
                ? (correctOpts.length > 0 ? [correctOpts[0]] : [])
                : correctOpts;
            } else {
              selectedOpts = wrongOpts.length > 0 ? [wrongOpts[0]] : (q.options.length > 0 ? [q.options[0]] : []);
            }

            for (const opt of selectedOpts) {
              if (opt) {
                await prisma.attemptResponseOption.create({
                  data: { attemptResponseId: response.id, questionOptionId: opt.id },
                });
              }
            }
          }
        }
      }
    }
  }

  console.log(quizCount + ' quizzes, ' + attemptCount + ' attempts');
}

// ─── RISK ASSESSMENTS ─────────────────────────────────────────────────────────

async function seedRiskAssessments() {
  console.log('Seeding risk assessments...');
  const enrollments = await prisma.enrollment.findMany({
    where: { status: { in: ['in_progress', 'assigned'] } },
    take: 20,
  });

  let count = 0;
  for (const enr of enrollments) {
    const riskScore = 15 + Math.floor(Math.random() * 75);
    const riskLevel = riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high';
    await prisma.learnerRiskAssessment.create({
      data: {
        enrollmentId: enr.id,
        riskScore,
        riskLevel,
        modelVersion: 'v2.1',
        reasons: {
          lowActivity: riskScore > 50,
          slowProgress: riskScore > 40,
          missedDeadlines: riskScore > 65,
        },
        recommendations: riskLevel === 'high'
          ? 'Can can thiep ngay: lien he hoc vien va ho tro ke hoach hoc tap'
          : riskLevel === 'medium'
          ? 'Theo doi va nhac nho hoc vien hoan thanh bai hoc'
          : 'Hoc vien dang tien trien tot, tiep tuc theo doi',
        interventions: riskLevel === 'high' ? 'Goi dien cho hoc vien, tao lich hoc co dinh' : null,
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    count++;
  }
  console.log(count + ' risk assessments');
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function runDemoSeed(context) {
  prisma = context.prisma;
  console.log('Starting comprehensive demo seed...');

  await clearDatabase();

  const departments = await seedDepartments();
  const { roles, permissions } = await seedRolesAndPermissions();
  const users = await seedUsers(departments, roles);
  const { categories, tags, tagMap } = await seedCategoriesAndTags();
  const courses = await seedCourses(users, departments, categories, tagMap);
  await seedModulesAndLessons(courses);
  await seedLessonResources();
  const admin = users[0];
  const roadmaps = await seedRoadmaps(departments, categories, admin, courses);
  await seedEnrollments(users, courses, admin);
  await seedRoadmapAssignments(users, roadmaps, admin);
  const questionBanks = await seedQuestionBanks(users, categories);
  await seedQuizzesAndAttempts(courses, questionBanks, users);
  await seedRiskAssessments();

  const [uCount, cCount, enrCount, certCount, attCount, qbCount] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.quizAttempt.count(),
    prisma.questionBank.count(),
  ]);

  console.log('\n=== Demo Seed Complete ===');
  console.log('Users:           ' + uCount);
  console.log('Courses:         ' + cCount);
  console.log('Enrollments:     ' + enrCount);
  console.log('Certificates:    ' + certCount);
  console.log('Quiz Attempts:   ' + attCount);
  console.log('Question Banks:  ' + qbCount);
  console.log('\nTest accounts (password: ' + DEFAULT_PASSWORD + '):');
  console.log('Admin:   admin@staffup.local');
  console.log('Trainer: tuan.nguyen@staffup.local');
  console.log('Student: an.nguyen@staffup.local');
}

module.exports = { runDemoSeed };

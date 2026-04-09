const argon2 = require('argon2');

const DEFAULT_TRAINER_PASSWORD = process.env.SEED_TRAINER_PASSWORD || 'Trainer123';

const TRAINER_FIXTURES = [
  {
    fullName: 'Course Trainer One',
    email: 'trainer1@staffup.local',
    positionTitle: 'Backend Trainer',
  },
  {
    fullName: 'Course Trainer Two',
    email: 'trainer2@staffup.local',
    positionTitle: 'Product Trainer',
  },
];

const CATEGORY_FIXTURES = [
  { name: 'Backend Development', slug: 'backend-development' },
  { name: 'Product Management', slug: 'product-management' },
  { name: 'Leadership', slug: 'leadership' },
];

const TAG_FIXTURES = [
  { name: 'nodejs', slug: 'nodejs' },
  { name: 'api', slug: 'api' },
  { name: 'product', slug: 'product' },
  { name: 'leadership', slug: 'leadership' },
];

async function seedTrainerUsers({ prisma }, department) {
  console.log('Seeding trainer fixtures...');

  const trainerRole = await prisma.role.findUnique({
    where: { code: 'trainer' },
  });

  if (!trainerRole) {
    throw new Error('Trainer role is missing. Seed RBAC data before seeding trainer fixtures.');
  }

  const passwordHash = await argon2.hash(DEFAULT_TRAINER_PASSWORD);
  const trainers = [];

  for (const fixture of TRAINER_FIXTURES) {
    const existingUser = await prisma.user.findUnique({
      where: { email: fixture.email },
    });

    const trainer = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            departmentId: department.id,
            fullName: fixture.fullName,
            positionTitle: fixture.positionTitle,
            isActive: true,
          },
        })
      : await prisma.user.create({
          data: {
            departmentId: department.id,
            fullName: fixture.fullName,
            positionTitle: fixture.positionTitle,
            email: fixture.email,
            passwordHash,
            isActive: true,
          },
        });

    await prisma.userRole.createMany({
      data: [{ userId: trainer.id, roleId: trainerRole.id }],
      skipDuplicates: true,
    });

    trainers.push(trainer);
  }

  console.log(`Trainer fixtures ready: ${trainers.length}`);

  return {
    trainers,
    defaultPassword: DEFAULT_TRAINER_PASSWORD,
  };
}

async function seedCourseCatalog({ prisma }) {
  console.log('Seeding course catalog fixtures...');

  const categories = [];
  for (const fixture of CATEGORY_FIXTURES) {
    const category = await prisma.category.upsert({
      where: { slug: fixture.slug },
      update: {
        name: fixture.name,
      },
      create: {
        name: fixture.name,
        slug: fixture.slug,
      },
    });

    categories.push(category);
  }

  const tags = [];
  for (const fixture of TAG_FIXTURES) {
    const tag = await prisma.tag.upsert({
      where: { slug: fixture.slug },
      update: {
        name: fixture.name,
      },
      create: fixture,
    });

    tags.push(tag);
  }

  console.log(`Catalog fixtures ready: ${categories.length} categories, ${tags.length} tags`);

  return { categories, tags };
}

async function seedCourseFixtures({ prisma }, department, trainers, catalog) {
  console.log('Seeding course fixtures...');

  const categoryBySlug = new Map(catalog.categories.map((category) => [category.slug, category]));
  const tagBySlug = new Map(catalog.tags.map((tag) => [tag.slug, tag]));
  const trainerByEmail = new Map(trainers.map((trainer) => [trainer.email, trainer]));

  const courseFixtures = [
    {
      title: 'Node.js API Fundamentals',
      slug: 'nodejs-api-fundamentals',
      description: 'Build REST APIs with Express, validation, and layered service design.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
      status: 'published',
      estimatedDurationMinutes: 180,
      categorySlug: 'backend-development',
      trainerEmail: 'trainer1@staffup.local',
      tagSlugs: ['nodejs', 'api'],
    },
    {
      title: 'Advanced Backend Patterns',
      slug: 'advanced-backend-patterns',
      description:
        'Repository patterns, background jobs, observability, and operational safeguards.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      status: 'draft',
      estimatedDurationMinutes: 240,
      categorySlug: 'backend-development',
      trainerEmail: 'trainer1@staffup.local',
      tagSlugs: ['nodejs', 'api'],
    },
    {
      title: 'Product Discovery Workshop',
      slug: 'product-discovery-workshop',
      description: 'Customer interviews, problem framing, and outcome-driven roadmap planning.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
      status: 'published',
      estimatedDurationMinutes: 150,
      categorySlug: 'product-management',
      trainerEmail: 'trainer2@staffup.local',
      tagSlugs: ['product'],
    },
    {
      title: 'Leadership Essentials for Team Leads',
      slug: 'leadership-essentials-team-leads',
      description: 'Coaching, delegation, feedback loops, and performance rituals for new leads.',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
      status: 'archived',
      estimatedDurationMinutes: 120,
      categorySlug: 'leadership',
      trainerEmail: 'trainer2@staffup.local',
      tagSlugs: ['leadership'],
    },
  ];

  const courses = [];

  for (const fixture of courseFixtures) {
    const trainer = trainerByEmail.get(fixture.trainerEmail);
    const category = categoryBySlug.get(fixture.categorySlug);

    if (!trainer) {
      throw new Error(`Missing trainer fixture: ${fixture.trainerEmail}`);
    }

    if (!category) {
      throw new Error(`Missing category fixture: ${fixture.categorySlug}`);
    }

    const publishedAt = fixture.status === 'published' ? new Date() : null;

    const course = await prisma.course.upsert({
      where: { slug: fixture.slug },
      update: {
        title: fixture.title,
        description: fixture.description,
        thumbnailUrl: fixture.thumbnailUrl,
        status: fixture.status,
        estimatedDurationMinutes: fixture.estimatedDurationMinutes,
        categoryId: category.id,
        trainerUserId: trainer.id,
        ownerDepartmentId: department.id,
        publishedAt,
      },
      create: {
        title: fixture.title,
        slug: fixture.slug,
        description: fixture.description,
        thumbnailUrl: fixture.thumbnailUrl,
        status: fixture.status,
        estimatedDurationMinutes: fixture.estimatedDurationMinutes,
        categoryId: category.id,
        trainerUserId: trainer.id,
        ownerDepartmentId: department.id,
        publishedAt,
      },
    });

    await prisma.courseTag.deleteMany({
      where: { courseId: course.id },
    });

    const courseTags = fixture.tagSlugs
      .map((tagSlug) => tagBySlug.get(tagSlug))
      .filter(Boolean)
      .map((tag) => ({
        courseId: course.id,
        tagId: tag.id,
      }));

    if (courseTags.length > 0) {
      await prisma.courseTag.createMany({
        data: courseTags,
        skipDuplicates: true,
      });
    }

    courses.push(course);
  }

  console.log(`Course fixtures ready: ${courses.length}`);

  return courses;
}

async function seedCourseFixturesBundle(context, department) {
  const trainerState = await seedTrainerUsers(context, department);
  const catalog = await seedCourseCatalog(context);
  const courses = await seedCourseFixtures(context, department, trainerState.trainers, catalog);

  return {
    trainers: trainerState.trainers,
    trainerPassword: trainerState.defaultPassword,
    categories: catalog.categories,
    tags: catalog.tags,
    courses,
  };
}

module.exports = {
  seedCourseFixturesBundle,
};

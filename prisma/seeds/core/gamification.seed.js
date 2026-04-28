/**
 * Seed gamification data: UserGamification + XpTransactions + UserBadges
 * for student users so leaderboard / achievements / level page have data.
 *
 * Idempotent: skips if user_gamification row already exists for the user.
 */

const STUDENT_EMAILS = [
  'student1@staffup.local',
  'student2@staffup.local',
  'student3@staffup.local',
];

// Per-student gamification fixtures. XP roughly tracks each student's
// enrollment progress so it aligns with their journey.
const STUDENT_GAMIFICATION = {
  // Junior backend dev — 2 in-progress courses
  'student1@staffup.local': {
    totalXp: 540,
    currentLevel: 4,
    currentStreak: 5,
    longestStreak: 11,
    activityDaysAgo: 0,
    transactions: [
      { amount: 20, source: 'lesson_complete', daysAgo: 0, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 1, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 2, description: 'Đậu quiz module 2' },
      { amount: 10, source: 'streak_bonus', daysAgo: 1, description: 'Streak 5 ngày' },
      { amount: 20, source: 'lesson_complete', daysAgo: 3, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 4, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 5, description: 'Đậu quiz module 1' },
      { amount: 20, source: 'lesson_complete', daysAgo: 6, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 8, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 9, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 10, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 12, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 14, description: 'Đậu quiz Python cơ bản' },
      { amount: 20, source: 'lesson_complete', daysAgo: 15, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 16, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 17, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 18, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 19, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 20, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 22, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 23, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 24, description: 'Hoàn thành bài học' },
    ],
    badges: ['first_steps', 'quick_learner', 'level_5'],
  },
  // Frontend dev — 1 completed course + active learner
  // (badge codes match seeded badges: first_quiz, quiz_master, streaker_7, streaker_30, level_5, level_10)
  'student2@staffup.local': {
    totalXp: 1280,
    currentLevel: 6,
    currentStreak: 12,
    longestStreak: 22,
    activityDaysAgo: 0,
    transactions: [
      { amount: 200, source: 'course_complete', daysAgo: 5, description: 'Hoàn thành Python cơ bản' },
      { amount: 100, source: 'certificate_issue', daysAgo: 5, description: 'Nhận chứng chỉ' },
      { amount: 50, source: 'quiz_pass', daysAgo: 6, description: 'Đậu quiz cuối khóa' },
      { amount: 20, source: 'lesson_complete', daysAgo: 0, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 1, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 2, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 3, description: 'Đậu quiz Vue.js' },
      { amount: 10, source: 'streak_bonus', daysAgo: 1, description: 'Streak 12 ngày' },
      { amount: 10, source: 'streak_bonus', daysAgo: 7, description: 'Streak 7 ngày' },
      { amount: 20, source: 'lesson_complete', daysAgo: 4, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 7, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 8, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 9, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 10, description: 'Đậu quiz UI/UX' },
      { amount: 20, source: 'lesson_complete', daysAgo: 11, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 12, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 13, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 14, description: 'Đậu quiz Vue.js' },
      { amount: 20, source: 'lesson_complete', daysAgo: 15, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 16, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 18, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 20, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 22, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 24, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 26, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 28, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 30, description: 'Hoàn thành bài học' },
    ],
    badges: ['first_steps', 'quick_learner', 'lesson_master', 'first_quiz', 'quiz_master', 'course_champion', 'streaker_7', 'level_5'],
  },
  // Backend dev — slower pace
  'student3@staffup.local': {
    totalXp: 320,
    currentLevel: 3,
    currentStreak: 2,
    longestStreak: 6,
    activityDaysAgo: 1,
    transactions: [
      { amount: 20, source: 'lesson_complete', daysAgo: 1, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 3, description: 'Đậu quiz' },
      { amount: 20, source: 'lesson_complete', daysAgo: 5, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 7, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 9, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 11, description: 'Hoàn thành bài học' },
      { amount: 50, source: 'quiz_pass', daysAgo: 13, description: 'Đậu quiz' },
      { amount: 20, source: 'lesson_complete', daysAgo: 15, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 17, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 19, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 20, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 22, description: 'Hoàn thành bài học' },
      { amount: 20, source: 'lesson_complete', daysAgo: 24, description: 'Hoàn thành bài học' },
    ],
    badges: ['first_steps', 'first_quiz'],
  },
};

async function seedGamification(context) {
  const { prisma } = context;
  console.log('🎮Seeding gamification data...');

  const students = await prisma.user.findMany({
    where: { email: { in: STUDENT_EMAILS } },
  });
  const studentByEmail = new Map(students.map((u) => [u.email, u]));

  const badges = await prisma.badge.findMany();
  const badgeByCode = new Map(badges.map((b) => [b.code, b]));

  let usersUpdated = 0;
  let txCreated = 0;
  let badgesAwarded = 0;

  for (const email of STUDENT_EMAILS) {
    const student = studentByEmail.get(email);
    if (!student) continue;

    const fixture = STUDENT_GAMIFICATION[email];
    if (!fixture) continue;

    const existing = await prisma.userGamification.findUnique({
      where: { userId: student.id },
    });
    if (existing) continue;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivityDate = new Date(today);
    lastActivityDate.setDate(today.getDate() - fixture.activityDaysAgo);

    await prisma.userGamification.create({
      data: {
        userId: student.id,
        totalXp: fixture.totalXp,
        currentLevel: fixture.currentLevel,
        currentStreak: fixture.currentStreak,
        longestStreak: fixture.longestStreak,
        lastActivityDate,
      },
    });
    usersUpdated += 1;

    for (const tx of fixture.transactions) {
      await prisma.xpTransaction.create({
        data: {
          userId: student.id,
          amount: tx.amount,
          source: tx.source,
          description: tx.description,
          createdAt: new Date(Date.now() - tx.daysAgo * 86400000),
        },
      });
      txCreated += 1;
    }

    for (const badgeCode of fixture.badges) {
      const badge = badgeByCode.get(badgeCode);
      if (!badge) continue;
      const existingBadge = await prisma.userBadge.findUnique({
        where: { userId_badgeId: { userId: student.id, badgeId: badge.id } },
      });
      if (existingBadge) continue;
      await prisma.userBadge.create({
        data: {
          userId: student.id,
          badgeId: badge.id,
          earnedAt: new Date(Date.now() - 7 * 86400000 * Math.random()),
        },
      });
      badgesAwarded += 1;
    }
  }

  console.log(
    `✅Gamification: ${usersUpdated} learners, ${txCreated} XP transactions, ${badgesAwarded} badges\n`,
  );
  return { learners: usersUpdated, transactions: txCreated, badges: badgesAwarded };
}

module.exports = { seedGamification };

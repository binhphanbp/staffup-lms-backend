import { prisma } from '@/config/database';

/**
 * Recalculates and persists enrollment progress caches:
 *   - progressPercentCache
 *   - completedLessonsCountCache
 *   - timeSpentSecondsCache
 *   - lastActivityAt
 *
 * Call this after any lessonProgress mutation.
 */
export async function recalculateEnrollmentCache(enrollmentId: string): Promise<void> {
  const db = prisma as any;

  const enrollment = await db.enrollment.findUnique({
    where: { id: BigInt(enrollmentId) },
    include: {
      course: {
        include: {
          modules: {
            include: { lessons: { select: { id: true } } },
          },
        },
      },
      lessonProgress: {
        select: { status: true, watchTimeSeconds: true },
      },
    },
  });

  if (!enrollment) return;

  const totalLessons: number = enrollment.course.modules.reduce(
    (sum: number, m: any) => sum + m.lessons.length,
    0,
  );

  const completedLessons: number = enrollment.lessonProgress.filter(
    (lp: any) => lp.status === 'completed',
  ).length;

  const totalWatchTime: number = enrollment.lessonProgress.reduce(
    (sum: number, lp: any) => sum + (lp.watchTimeSeconds || 0),
    0,
  );

  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  await db.enrollment.update({
    where: { id: BigInt(enrollmentId) },
    data: {
      progressPercentCache: progressPercent.toFixed(2),
      completedLessonsCountCache: completedLessons,
      timeSpentSecondsCache: totalWatchTime,
      lastActivityAt: new Date(),
    },
  });
}

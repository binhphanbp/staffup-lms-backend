import { prisma, withTransaction, type TransactionClient } from '@/config/database';
import type {
  CreateReplyInput,
  CreateThreadInput,
  ListThreadsQuery,
  UpdateReplyInput,
  UpdateThreadInput,
} from '@/schemas/forum.schema';
import { AppError } from '@/utils';

type ForumRole = 'learner' | 'trainer' | 'admin';
type SortOrder = 'asc' | 'desc';

interface ForumAccess {
  course: {
    id: bigint;
    trainerUserId: bigint;
    title: string;
  };
  role: ForumRole;
}

const activeEnrollmentStatuses = [
  'assigned' as const,
  'in_progress' as const,
  'completed' as const,
];

const userSelect = {
  id: true,
  fullName: true,
  email: true,
  avatarUrl: true,
};

interface ForumUser {
  id: bigint;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface ForumLesson {
  id: bigint;
  title: string;
}

interface ThreadSummaryRecord {
  id: bigint;
  courseId: bigint;
  lessonId: bigint | null;
  authorId: bigint;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  isResolved: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: ForumUser;
  lesson: ForumLesson | null;
}

interface ReplyRecord {
  id: bigint;
  threadId: bigint;
  authorId: bigint;
  parentReplyId: bigint | null;
  body: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: ForumUser;
  childReplies?: ReplyRecord[];
}

interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface DiscussionReplyResponse {
  id: string;
  threadId: string;
  authorId: string;
  parentReplyId: string | null;
  body: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: UserResponse;
  childReplies: DiscussionReplyResponse[];
}

interface ThreadDetailRecord extends ThreadSummaryRecord {
  replies: ReplyRecord[];
}

export class ForumService {
  private static get db() {
    return prisma;
  }

  private static isAdmin(roleCodes: string[]) {
    return roleCodes.includes('admin');
  }

  private static isTrainer(roleCodes: string[]) {
    return roleCodes.includes('trainer');
  }

  private static canModerate(access: ForumAccess) {
    return access.role === 'trainer' || access.role === 'admin';
  }

  private static async assertCourseAccess(
    courseId: string,
    userId: string,
    roleCodes: string[],
  ): Promise<ForumAccess> {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(courseId) },
      select: {
        id: true,
        trainerUserId: true,
        title: true,
      },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    const userBigInt = BigInt(userId);

    if (this.isAdmin(roleCodes)) {
      return { course, role: 'admin' };
    }

    if (course.trainerUserId === userBigInt && this.isTrainer(roleCodes)) {
      return { course, role: 'trainer' };
    }

    const enrollment = await this.db.enrollment.findFirst({
      where: {
        courseId: course.id,
        userId: userBigInt,
        status: { in: activeEnrollmentStatuses },
      },
      select: { id: true },
    });

    if (!enrollment) {
      throw new AppError('You must be enrolled in this course to access its forum.', 403);
    }

    return { course, role: 'learner' };
  }

  private static async assertLessonBelongsToCourse(lessonId: string, courseId: bigint) {
    const lesson = await this.db.lesson.findFirst({
      where: {
        id: BigInt(lessonId),
        module: {
          courseId,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!lesson) {
      throw new AppError('Lesson does not belong to this course.', 400);
    }

    return lesson;
  }

  private static async getThreadOrThrow(threadId: string) {
    const thread = await this.db.discussionThread.findFirst({
      where: {
        id: BigInt(threadId),
        deletedAt: null,
      },
      include: {
        course: {
          select: {
            id: true,
            trainerUserId: true,
            title: true,
          },
        },
      },
    });

    if (!thread) {
      throw new AppError('Discussion thread not found.', 404);
    }

    return thread;
  }

  private static async getReplyOrThrow(replyId: string) {
    const reply = await this.db.discussionReply.findFirst({
      where: {
        id: BigInt(replyId),
        deletedAt: null,
      },
      include: {
        thread: {
          include: {
            course: {
              select: {
                id: true,
                trainerUserId: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!reply) {
      throw new AppError('Discussion reply not found.', 404);
    }

    return reply;
  }

  private static mapUser(user: ForumUser): UserResponse {
    return {
      id: user.id.toString(),
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl,
    };
  }

  private static mapLesson(lesson: ForumLesson | null) {
    if (!lesson) {
      return null;
    }

    return {
      id: lesson.id.toString(),
      title: lesson.title,
    };
  }

  private static mapThreadSummary(thread: ThreadSummaryRecord) {
    return {
      id: thread.id.toString(),
      courseId: thread.courseId.toString(),
      lessonId: thread.lessonId?.toString() ?? null,
      authorId: thread.authorId.toString(),
      title: thread.title,
      body: thread.body,
      excerpt: thread.body.length > 180 ? `${thread.body.slice(0, 180)}...` : thread.body,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      isResolved: thread.isResolved,
      viewCount: thread.viewCount,
      replyCount: thread.replyCount,
      lastReplyAt: thread.lastReplyAt,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      author: this.mapUser(thread.author),
      lesson: this.mapLesson(thread.lesson),
    };
  }

  private static mapReply(reply: ReplyRecord): DiscussionReplyResponse {
    return {
      id: reply.id.toString(),
      threadId: reply.threadId.toString(),
      authorId: reply.authorId.toString(),
      parentReplyId: reply.parentReplyId?.toString() ?? null,
      body: reply.body,
      isAccepted: reply.isAccepted,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      author: this.mapUser(reply.author),
      childReplies: (reply.childReplies ?? []).map((child) => this.mapReply(child)),
    };
  }

  static async listThreads(
    courseId: string,
    query: ListThreadsQuery,
    userId: string,
    roleCodes: string[],
  ) {
    const access = await this.assertCourseAccess(courseId, userId, roleCodes);
    const where = {
      courseId: access.course.id,
      deletedAt: null,
    } as {
      courseId: bigint;
      deletedAt: null;
      lessonId?: bigint;
      isResolved?: boolean;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        body?: { contains: string; mode: 'insensitive' };
      }>;
    };

    if (query.lessonId) {
      await this.assertLessonBelongsToCourse(query.lessonId, access.course.id);
      where.lessonId = BigInt(query.lessonId);
    }

    if (query.status === 'open') {
      where.isResolved = false;
    } else if (query.status === 'resolved') {
      where.isResolved = true;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { body: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Express 5 fix: ensure page and limit are numbers (middleware mutation doesn't work)
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;
    const orderBy =
      query.sort === 'popular'
        ? [
            { isPinned: 'desc' as SortOrder },
            { replyCount: 'desc' as SortOrder },
            { viewCount: 'desc' as SortOrder },
            { createdAt: 'desc' as SortOrder },
          ]
        : [
            { isPinned: 'desc' as SortOrder },
            { lastReplyAt: 'desc' as SortOrder },
            { createdAt: 'desc' as SortOrder },
          ];

    const [threads, total] = await Promise.all([
      this.db.discussionThread.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: { select: userSelect },
          lesson: { select: { id: true, title: true } },
        },
      }),
      this.db.discussionThread.count({ where }),
    ]);

    return {
      data: threads.map((thread: ThreadSummaryRecord) => this.mapThreadSummary(thread)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createThread(
    courseId: string,
    input: CreateThreadInput,
    userId: string,
    roleCodes: string[],
  ) {
    const access = await this.assertCourseAccess(courseId, userId, roleCodes);

    if (input.lessonId) {
      await this.assertLessonBelongsToCourse(input.lessonId, access.course.id);
    }

    const thread = await this.db.discussionThread.create({
      data: {
        courseId: access.course.id,
        lessonId: input.lessonId ? BigInt(input.lessonId) : null,
        authorId: BigInt(userId),
        title: input.title,
        body: input.body,
      },
      include: {
        author: { select: userSelect },
        lesson: { select: { id: true, title: true } },
      },
    });

    return this.mapThreadSummary(thread);
  }

  static async getThread(threadId: string, userId: string, roleCodes: string[]) {
    const thread = await this.getThreadOrThrow(threadId);
    await this.assertCourseAccess(thread.courseId.toString(), userId, roleCodes);

    const updatedThread = await this.db.discussionThread.update({
      where: { id: thread.id },
      data: {
        viewCount: { increment: 1 },
      },
      include: {
        author: { select: userSelect },
        lesson: { select: { id: true, title: true } },
        replies: {
          where: {
            deletedAt: null,
            parentReplyId: null,
          },
          orderBy: [{ isAccepted: 'desc' }, { createdAt: 'asc' }],
          include: {
            author: { select: userSelect },
            childReplies: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'asc' },
              include: {
                author: { select: userSelect },
              },
            },
          },
        },
      },
    });

    return {
      ...this.mapThreadSummary(updatedThread),
      replies: (updatedThread as ThreadDetailRecord).replies.map((reply) => this.mapReply(reply)),
    };
  }

  static async updateThread(
    threadId: string,
    input: UpdateThreadInput,
    userId: string,
    roleCodes: string[],
  ) {
    const thread = await this.getThreadOrThrow(threadId);
    const access = await this.assertCourseAccess(thread.courseId.toString(), userId, roleCodes);
    const isAuthor = thread.authorId === BigInt(userId);

    if (!isAuthor && !this.canModerate(access)) {
      throw new AppError('You do not have permission to update this thread.', 403);
    }

    const updated = await this.db.discussionThread.update({
      where: { id: thread.id },
      data: input,
      include: {
        author: { select: userSelect },
        lesson: { select: { id: true, title: true } },
      },
    });

    return this.mapThreadSummary(updated);
  }

  static async deleteThread(threadId: string, userId: string, roleCodes: string[]) {
    const thread = await this.getThreadOrThrow(threadId);
    const access = await this.assertCourseAccess(thread.courseId.toString(), userId, roleCodes);
    const isAuthor = thread.authorId === BigInt(userId);

    if (!isAuthor && access.role !== 'admin') {
      throw new AppError('You do not have permission to delete this thread.', 403);
    }

    await this.db.discussionThread.update({
      where: { id: thread.id },
      data: { deletedAt: new Date() },
    });
  }

  static async toggleThreadFlag(
    threadId: string,
    flag: 'isPinned' | 'isLocked' | 'isResolved',
    userId: string,
    roleCodes: string[],
  ) {
    const thread = await this.getThreadOrThrow(threadId);
    const access = await this.assertCourseAccess(thread.courseId.toString(), userId, roleCodes);
    const isAuthor = thread.authorId === BigInt(userId);

    if (flag === 'isResolved') {
      if (!isAuthor && !this.canModerate(access)) {
        throw new AppError('You do not have permission to resolve this thread.', 403);
      }
    } else if (!this.canModerate(access)) {
      throw new AppError('Only trainers or admins can moderate this thread.', 403);
    }

    const updated = await this.db.discussionThread.update({
      where: { id: thread.id },
      data: { [flag]: !thread[flag] },
      include: {
        author: { select: userSelect },
        lesson: { select: { id: true, title: true } },
      },
    });

    return this.mapThreadSummary(updated);
  }

  static async createReply(
    threadId: string,
    input: CreateReplyInput,
    userId: string,
    roleCodes: string[],
  ) {
    const thread = await this.getThreadOrThrow(threadId);
    await this.assertCourseAccess(thread.courseId.toString(), userId, roleCodes);

    if (thread.isLocked) {
      throw new AppError('This discussion is locked.', 400);
    }

    if (input.parentReplyId) {
      const parentReply = await this.db.discussionReply.findFirst({
        where: {
          id: BigInt(input.parentReplyId),
          threadId: thread.id,
          parentReplyId: null,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!parentReply) {
        throw new AppError('Parent reply not found in this thread.', 400);
      }
    }

    const reply = await withTransaction(async (tx: TransactionClient) => {
      const created = await tx.discussionReply.create({
        data: {
          threadId: thread.id,
          authorId: BigInt(userId),
          parentReplyId: input.parentReplyId ? BigInt(input.parentReplyId) : null,
          body: input.body,
        },
        include: {
          author: { select: userSelect },
          childReplies: {
            where: { deletedAt: null },
            include: {
              author: { select: userSelect },
            },
          },
        },
      });

      await tx.discussionThread.update({
        where: { id: thread.id },
        data: {
          replyCount: { increment: 1 },
          lastReplyAt: new Date(),
        },
      });

      return created;
    });

    return this.mapReply(reply);
  }

  static async updateReply(
    replyId: string,
    input: UpdateReplyInput,
    userId: string,
    roleCodes: string[],
  ) {
    const reply = await this.getReplyOrThrow(replyId);
    const access = await this.assertCourseAccess(
      reply.thread.courseId.toString(),
      userId,
      roleCodes,
    );
    const isAuthor = reply.authorId === BigInt(userId);

    if (!isAuthor && access.role !== 'admin') {
      throw new AppError('You do not have permission to update this reply.', 403);
    }

    const updated = await this.db.discussionReply.update({
      where: { id: reply.id },
      data: input,
      include: {
        author: { select: userSelect },
        childReplies: {
          where: { deletedAt: null },
          include: {
            author: { select: userSelect },
          },
        },
      },
    });

    return this.mapReply(updated);
  }

  static async deleteReply(replyId: string, userId: string, roleCodes: string[]) {
    const reply = await this.getReplyOrThrow(replyId);
    const access = await this.assertCourseAccess(
      reply.thread.courseId.toString(),
      userId,
      roleCodes,
    );
    const isAuthor = reply.authorId === BigInt(userId);

    if (!isAuthor && access.role !== 'admin') {
      throw new AppError('You do not have permission to delete this reply.', 403);
    }

    await withTransaction(async (tx: TransactionClient) => {
      await tx.discussionReply.update({
        where: { id: reply.id },
        data: { deletedAt: new Date() },
      });

      await tx.discussionThread.update({
        where: { id: reply.threadId },
        data: {
          replyCount: { decrement: 1 },
        },
      });
    });
  }

  static async toggleAcceptedReply(replyId: string, userId: string, roleCodes: string[]) {
    const reply = await this.getReplyOrThrow(replyId);
    const access = await this.assertCourseAccess(
      reply.thread.courseId.toString(),
      userId,
      roleCodes,
    );
    const isThreadAuthor = reply.thread.authorId === BigInt(userId);

    if (!isThreadAuthor && !this.canModerate(access)) {
      throw new AppError('You do not have permission to accept this reply.', 403);
    }

    const updated = await withTransaction(async (tx: TransactionClient) => {
      const nextAccepted = !reply.isAccepted;

      if (nextAccepted) {
        await tx.discussionReply.updateMany({
          where: {
            threadId: reply.threadId,
            deletedAt: null,
            isAccepted: true,
          },
          data: { isAccepted: false },
        });
      }

      const acceptedReply = await tx.discussionReply.update({
        where: { id: reply.id },
        data: { isAccepted: nextAccepted },
        include: {
          author: { select: userSelect },
          childReplies: {
            where: { deletedAt: null },
            include: {
              author: { select: userSelect },
            },
          },
        },
      });

      await tx.discussionThread.update({
        where: { id: reply.threadId },
        data: { isResolved: nextAccepted },
      });

      return acceptedReply;
    });

    return this.mapReply(updated);
  }
}

import { z } from 'zod';

const idSchema = z.string().regex(/^\d+$/, 'Invalid ID');

export const courseForumParamsSchema = z.object({
  courseId: idSchema,
});

export const threadParamsSchema = z.object({
  threadId: idSchema,
});

export const replyParamsSchema = z.object({
  replyId: idSchema,
});

export const listThreadsQuerySchema = z.object({
  lessonId: idSchema.optional(),
  status: z.enum(['open', 'resolved']).optional(),
  sort: z.enum(['recent', 'popular']).default('recent'),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const createThreadSchema = z.object({
  title: z.string().trim().min(10).max(200),
  body: z.string().trim().min(20).max(5000),
  lessonId: idSchema.optional(),
});

export const updateThreadSchema = createThreadSchema.pick({ title: true, body: true }).partial();

export const createReplySchema = z.object({
  body: z.string().trim().min(5).max(2000),
  parentReplyId: idSchema.optional(),
});

export const updateReplySchema = createReplySchema.pick({ body: true });

export type ListThreadsQuery = z.infer<typeof listThreadsQuerySchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type UpdateThreadInput = z.infer<typeof updateThreadSchema>;
export type CreateReplyInput = z.infer<typeof createReplySchema>;
export type UpdateReplyInput = z.infer<typeof updateReplySchema>;

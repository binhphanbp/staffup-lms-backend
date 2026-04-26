import { z } from 'zod';

const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

export const managerCoachChatSchema = z.object({
  message: z.string().min(1, 'Tin nhắn không được để trống').max(2000),
  history: z.array(historyMessageSchema).max(10).optional(),
});

export const weeklyBriefingSchema = z.object({
  focus: z.string().max(1000).optional(),
});

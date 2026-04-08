import { z } from 'zod';

export const createQuestionBankSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateQuestionBankSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const listQuestionBanksSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  categoryId: z.string().optional(),
  ownerTrainerId: z.string().optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateQuestionBankInput = z.infer<typeof createQuestionBankSchema>;
export type UpdateQuestionBankInput = z.infer<typeof updateQuestionBankSchema>;
export type ListQuestionBanksQuery = z.infer<typeof listQuestionBanksSchema>;

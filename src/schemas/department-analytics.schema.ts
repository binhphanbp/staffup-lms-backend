import { z } from 'zod';

export const departmentAnalyticsQuerySchema = z.object({
  days: z
    .enum(['7', '30', '60', '90'])
    .optional()
    .transform((v) => (v ? Number(v) : 30)),
  departmentId: z.string().regex(/^\d+$/, 'departmentId phải là số nguyên dương').optional(),
});

export type DepartmentAnalyticsQuery = z.infer<typeof departmentAnalyticsQuerySchema>;

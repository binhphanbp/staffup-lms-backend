import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalBooleanQuerySchema,
  paginationLimitQuerySchema,
  paginationPageQuerySchema,
  requiredStringSchema,
  searchQuerySchema,
} from '@/schemas/shared.schema';

export const companyDocumentIdParamSchema = z.object({
  id: numericIdStringSchema('Document ID'),
});

export const companyDocumentListQuerySchema = z.object({
  search: searchQuerySchema,
  category: z.string().trim().max(100).optional(),
  isActive: optionalBooleanQuerySchema,
  page: paginationPageQuerySchema,
  limit: paginationLimitQuerySchema,
});

export const createCompanyDocumentSchema = z.object({
  title: requiredStringSchema('Title', 2, 300),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required.')
    .max(100000, 'Content must be at most 100000 characters long.'),
  category: z.string().trim().max(100, 'Category must be at most 100 characters long.').optional(),
  isActive: z.boolean().optional(),
});

export const updateCompanyDocumentSchema = z
  .object({
    title: requiredStringSchema('Title', 2, 300).optional(),
    content: z
      .string()
      .trim()
      .min(1, 'Content is required.')
      .max(100000, 'Content must be at most 100000 characters long.')
      .optional(),
    category: z
      .string()
      .trim()
      .max(100, 'Category must be at most 100 characters long.')
      .optional()
      .nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.category !== undefined ||
      data.isActive !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export type CompanyDocumentListQuery = z.infer<typeof companyDocumentListQuerySchema>;
export type CreateCompanyDocumentInput = z.infer<typeof createCompanyDocumentSchema>;
export type UpdateCompanyDocumentInput = z.infer<typeof updateCompanyDocumentSchema>;

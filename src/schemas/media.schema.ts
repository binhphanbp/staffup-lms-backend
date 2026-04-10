import { z } from 'zod';

const mediaResourceTypeSchema = z.enum(['image', 'video', 'raw']).optional();

export const mediaListQuerySchema = z.object({
  folder: z
    .string()
    .trim()
    .min(1, 'folder is required.')
    .max(255, 'folder must be at most 255 characters long.'),
  resourceType: mediaResourceTypeSchema,
  maxResults: z.coerce
    .number()
    .int()
    .min(1, 'maxResults must be at least 1.')
    .max(100, 'maxResults must be at most 100.')
    .default(30),
  nextCursor: z
    .string()
    .trim()
    .max(500, 'nextCursor must be at most 500 characters long.')
    .optional(),
});

export const mediaFolderListQuerySchema = z.object({
  path: z.string().trim().max(255, 'path must be at most 255 characters long.').optional(),
  maxResults: z.coerce
    .number()
    .int()
    .min(1, 'maxResults must be at least 1.')
    .max(100, 'maxResults must be at most 100.')
    .default(100),
  nextCursor: z
    .string()
    .trim()
    .max(500, 'nextCursor must be at most 500 characters long.')
    .optional(),
});

export type MediaListQuery = z.infer<typeof mediaListQuerySchema>;
export type MediaFolderListQuery = z.infer<typeof mediaFolderListQuerySchema>;

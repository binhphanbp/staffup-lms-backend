import { z } from 'zod';

const nodeId = z.string().regex(/^L\d{2}$|^[A-Za-z]$|^[A-Za-z0-9_-]{1,10}$/, 'nodeId không hợp lệ');

export const previewSchema = z.object({
  body: z.object({
    userId: z.coerce.number().int().positive().optional(),
    passedNodeIds: z.array(nodeId).optional(),
  }),
});

export const generateEmailSchema = z.object({
  body: z
    .object({
      userId: z.coerce.number().int().positive().optional(),
      employee: z
        .object({
          fullName: z.string().min(1).max(150),
          position: z.string().min(1).max(150),
          department: z.string().min(1).max(150),
          startDate: z.string().optional(),
          testScore: z.coerce.number().int().min(0).max(100).optional(),
        })
        .optional(),
      passedNodeIds: z.array(nodeId).optional(),
    })
    .refine((d) => d.userId !== undefined || d.employee !== undefined, {
      message: 'Cần cung cấp userId hoặc employee.',
    }),
});

export const addEdgeSchema = z.object({
  body: z.object({
    fromId: nodeId,
    toId: nodeId,
  }),
});

export const setTestResultsSchema = z.object({
  body: z.object({
    userId: z.coerce.number().int().positive(),
    nodeIds: z.array(nodeId),
  }),
});

import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as learningPathService from '@/services/learning-path.service';
import { prisma } from '@/config/database';
import { catchAsync, sendSuccess, AppError } from '@/utils';

/**
 * GET /api/v1/learning-path/graph
 * Trả về 50 node + tất cả edge (để FE render React Flow).
 */
export const getGraph = catchAsync(async (_req: AuthRequest, res: Response) => {
  const graph = await learningPathService.getGraph();
  sendSuccess(res, graph, 'Curriculum graph loaded');
});

/**
 * POST /api/v1/learning-path/preview
 * Body: { userId?, passedNodeIds? }
 *  - Nếu userId → đọc DB để lấy passed-set
 *  - Nếu passedNodeIds → override (UI judge mode hoặc preset)
 */
export const previewPath = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, passedNodeIds } = req.body as {
    userId?: number;
    passedNodeIds?: string[];
  };
  const result = await learningPathService.previewForUser(
    userId !== undefined ? BigInt(userId) : null,
    passedNodeIds,
  );
  sendSuccess(res, result, 'Path preview computed');
});

/**
 * POST /api/v1/learning-path/generate-email
 * Body: { userId, employee, passedNodeIds? }
 * Yêu cầu role: admin / manager / trainer.
 * - Nếu employee không cung cấp đủ → tự bù từ DB user.
 */
export const generateEmail = catchAsync(async (req: AuthRequest, res: Response) => {
  const {
    userId,
    employee: providedEmployee,
    passedNodeIds,
  } = req.body as {
    userId?: number;
    employee?: learningPathService.EmployeeSnapshot;
    passedNodeIds?: string[];
  };

  let snapshot: learningPathService.EmployeeSnapshot;
  if (providedEmployee && providedEmployee.fullName && providedEmployee.position) {
    snapshot = providedEmployee;
  } else if (userId !== undefined) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: { department: true },
    });
    if (!user) throw new AppError('Nhân viên không tồn tại.', 404);
    snapshot = {
      fullName: user.fullName,
      position: user.positionTitle ?? 'Nhân viên',
      department: user.department?.name ?? 'Phòng ban',
      startDate: user.createdAt.toISOString().slice(0, 10),
      testScore: providedEmployee?.testScore,
    };
  } else {
    throw new AppError('Cần cung cấp userId hoặc employee.', 400);
  }

  const preview = await learningPathService.previewForUser(
    userId !== undefined ? BigInt(userId) : null,
    passedNodeIds,
  );

  const email = await learningPathService.generateEmail(snapshot, preview);
  sendSuccess(res, { email, preview }, 'Email generated');
});

/**
 * POST /api/v1/learning-path/edges  — admin only
 */
export const addEdge = catchAsync(async (req: AuthRequest, res: Response) => {
  const { fromId, toId } = req.body as { fromId: string; toId: string };
  const edge = await learningPathService.addEdge(fromId, toId);
  sendSuccess(res, edge, 'Edge added', 201);
});

/**
 * DELETE /api/v1/learning-path/edges/:id  — admin only
 */
export const removeEdge = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) throw new AppError('Edge id không hợp lệ.', 400);
  const r = await learningPathService.removeEdge(id);
  sendSuccess(res, r, 'Edge removed');
});

/**
 * POST /api/v1/learning-path/test-results  — admin only
 * Body: { userId, nodeIds: string[] }  — replace toàn bộ test result của user.
 */
export const setTestResults = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, nodeIds } = req.body as { userId: number; nodeIds: string[] };
  const r = await learningPathService.setTestResults(BigInt(userId), nodeIds);
  sendSuccess(res, r, 'Test results updated');
});

/**
 * GET /api/v1/learning-path/users — list users (employees) cho dropdown FE.
 */
export const listEmployees = catchAsync(async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      fullName: true,
      email: true,
      positionTitle: true,
      avatarUrl: true,
      department: { select: { id: true, name: true } },
    },
    orderBy: { fullName: 'asc' },
    take: 100,
  });
  // Convert BigInt → string for JSON
  const data = users.map((u) => ({
    id: u.id.toString(),
    fullName: u.fullName,
    email: u.email,
    position: u.positionTitle ?? '',
    avatarUrl: u.avatarUrl,
    department: u.department ? { id: u.department.id.toString(), name: u.department.name } : null,
  }));
  sendSuccess(res, data, 'Employees loaded');
});

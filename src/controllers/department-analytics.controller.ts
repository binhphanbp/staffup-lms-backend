import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as departmentAnalyticsService from '@/services/department-analytics.service';
import { catchAsync, sendSuccess } from '@/utils';

const resolveDepartmentId = (req: AuthRequest): bigint => {
  const queryDeptId = req.query['departmentId'];
  const isAdmin = (req.user?.roleCodes ?? []).includes('admin');
  if (isAdmin && typeof queryDeptId === 'string' && /^\d+$/.test(queryDeptId)) {
    return BigInt(queryDeptId);
  }
  if (req.user?.departmentId === null || req.user?.departmentId === undefined) {
    throw new Error('Người dùng hiện tại chưa được gán phòng ban.');
  }
  return BigInt(req.user.departmentId);
};

export const getDepartmentAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const days = Number(req.query['days'] ?? 30);
  const departmentId = resolveDepartmentId(req);
  const data = await departmentAnalyticsService.getDepartmentAnalytics(departmentId, days);
  sendSuccess(res, data, 'Department analytics retrieved successfully');
});

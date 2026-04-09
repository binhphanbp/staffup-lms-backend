import type { Response, NextFunction, Request } from 'express';
import { DepartmentService } from '@/services/department.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';

export class DepartmentController {
  /**
   * Get all departments
   */
  static getDepartments = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const departments = await DepartmentService.getDepartments();
    sendSuccess(res, departments, 'Departments retrieved successfully');
  });

  /**
   * Get department by ID with full details
   */
  static getDepartment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const department = await DepartmentService.getDepartmentById(id as string);
    sendSuccess(res, department, 'Department retrieved successfully');
  });

  /**
   * Get paginated users in a department with optional isActive filter
   * Query params: page, limit, isActive (true | false)
   */
  static getDepartmentUsers = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      // After validation, req.query is already transformed by Zod
      const { page, limit, isActive } = req.query;

      // Get requestUserId from auth middleware if available
      const requestUserId = (req as any).user?.userId;

      const result = await DepartmentService.getUsersByDepartment(
        id as string,
        {
          page: page as number,
          limit: limit as number,
          isActive: isActive as boolean | undefined,
        },
        requestUserId,
      );
      sendSuccess(res, result, 'Department users retrieved successfully');
    },
  );

  /**
   * Create a new department
   */
  static createDepartment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const newDepartment = await DepartmentService.createDepartment(req.body);
    sendCreated(res, newDepartment, 'Department created successfully');
  });

  /**
   * Update an existing department
   */
  static updateDepartment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updatedDepartment = await DepartmentService.updateDepartment(id as string, req.body);
    sendSuccess(res, updatedDepartment, 'Department updated successfully');
  });

  /**
   * Assign manager to department
   */
  static assignManager = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { managerUserId } = req.body;
    const updatedDepartment = await DepartmentService.assignManager(id as string, managerUserId);
    sendSuccess(res, updatedDepartment, 'Manager assigned to department successfully');
  });

  /**
   * Remove manager from department
   */
  static removeManager = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updatedDepartment = await DepartmentService.removeManager(id as string);
    sendSuccess(res, updatedDepartment, 'Manager removed from department successfully');
  });

  /**
   * Delete a department
   */
  static deleteDepartment = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    await DepartmentService.deleteDepartment(id as string);
    sendSuccess(res, null, 'Department deleted successfully');
  });
}

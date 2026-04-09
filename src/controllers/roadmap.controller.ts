import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import { RoadmapService } from '@/services/roadmap.service';
import { catchAsync, sendSuccess } from '@/utils';

export const createRoadmap = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const roadmap = await RoadmapService.createRoadmap(req.body, userId);

  sendSuccess(res, roadmap, 'Roadmap created successfully', 201);
});

export const updateRoadmap = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const roadmap = await RoadmapService.updateRoadmap(roadmapId, req.body, userId);

  sendSuccess(res, roadmap, 'Roadmap updated successfully');
});

export const deleteRoadmap = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const result = await RoadmapService.deleteRoadmap(roadmapId, userId);

  sendSuccess(res, result, 'Roadmap deleted successfully');
});

export const getRoadmapById = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const roadmap = await RoadmapService.getRoadmapById(roadmapId, userId);

  sendSuccess(res, roadmap, 'Roadmap retrieved successfully');
});

export const listRoadmaps = catchAsync(async (req: AuthRequest, res: Response) => {
  const { departmentId, categoryId, isActive, page, limit } = req.query;
  const userId = req.user!.userId;

  const result = await RoadmapService.listRoadmaps(
    {
      departmentId: departmentId as string,
      categoryId: categoryId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
    userId,
  );

  sendSuccess(res, result, 'Roadmaps retrieved successfully');
});

export const addCourseToRoadmap = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.roadmapId)
    ? req.params.roadmapId[0]
    : req.params.roadmapId;
  const userId = req.user!.userId;

  const result = await RoadmapService.addCourseToRoadmap(roadmapId, req.body, userId);

  sendSuccess(res, result, 'Course added to roadmap successfully', 201);
});

export const removeCourseFromRoadmap = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.roadmapId)
    ? req.params.roadmapId[0]
    : req.params.roadmapId;
  const courseId = Array.isArray(req.params.courseId)
    ? req.params.courseId[0]
    : req.params.courseId;
  const userId = req.user!.userId;

  const result = await RoadmapService.removeCourseFromRoadmap(roadmapId, courseId, userId);

  sendSuccess(res, result, 'Course removed from roadmap successfully');
});

export const updateRoadmapCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.roadmapId)
    ? req.params.roadmapId[0]
    : req.params.roadmapId;
  const courseId = Array.isArray(req.params.courseId)
    ? req.params.courseId[0]
    : req.params.courseId;
  const userId = req.user!.userId;

  const result = await RoadmapService.updateRoadmapCourse(roadmapId, courseId, req.body, userId);

  sendSuccess(res, result, 'Roadmap course updated successfully');
});

export const reorderRoadmapCourses = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.roadmapId)
    ? req.params.roadmapId[0]
    : req.params.roadmapId;
  const userId = req.user!.userId;

  const result = await RoadmapService.reorderRoadmapCourses(
    roadmapId,
    req.body.courseOrders,
    userId,
  );

  sendSuccess(res, result, 'Roadmap courses reordered successfully');
});

export const assignRoadmapToUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const roadmapId = Array.isArray(req.params.roadmapId)
    ? req.params.roadmapId[0]
    : req.params.roadmapId;
  const assignedByUserId = req.user!.userId;

  const result = await RoadmapService.assignRoadmapToUsers(roadmapId, req.body, assignedByUserId);

  sendSuccess(res, result, 'Roadmap assigned to users successfully', 201);
});

export const listRoadmapAssignments = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, roadmapId, status, departmentId, page, limit } = req.query;
  const requestUserId = req.user!.userId;

  const result = await RoadmapService.listRoadmapAssignments(
    {
      userId: userId as string,
      roadmapId: roadmapId as string,
      status: status as string,
      departmentId: departmentId as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
    requestUserId,
  );

  sendSuccess(res, result, 'Roadmap assignments retrieved successfully');
});

export const updateAssignmentStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const assignmentId = Array.isArray(req.params.assignmentId)
    ? req.params.assignmentId[0]
    : req.params.assignmentId;

  const result = await RoadmapService.updateAssignmentStatus(
    assignmentId,
    req.body.status,
    req.user!.userId,
    req.user!.roleCodes,
  );

  sendSuccess(res, result, 'Assignment status updated successfully');
});

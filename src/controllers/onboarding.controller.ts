import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as onboarding from '@/services/onboarding.service';
import { catchAsync, sendCreated, sendNoContent, sendSuccess } from '@/utils';

const getParam = (raw: string | string[] | undefined): string => {
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
};

const getQuery = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return undefined;
};

// ----- Templates -----

export const listTemplates = catchAsync(async (req: AuthRequest, res: Response) => {
  const isActiveStr = getQuery(req.query.isActive);
  const items = await onboarding.listTemplates({
    isActive: isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined,
    departmentId: getQuery(req.query.departmentId),
    search: getQuery(req.query.search),
  });
  sendSuccess(res, items, 'Onboarding templates retrieved successfully');
});

export const getTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  const detail = await onboarding.getTemplateDetail(getParam(req.params.id));
  sendSuccess(res, detail, 'Onboarding template retrieved successfully');
});

export const createTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  const created = await onboarding.createTemplate(req.body, req.user!.userId);
  sendCreated(res, created, 'Onboarding template created successfully');
});

export const updateTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  const updated = await onboarding.updateTemplate(getParam(req.params.id), req.body);
  sendSuccess(res, updated, 'Onboarding template updated successfully');
});

export const deleteTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  await onboarding.deleteTemplate(getParam(req.params.id));
  sendNoContent(res);
});

export const cloneTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  const cloned = await onboarding.cloneTemplate(getParam(req.params.id), req.user!.userId);
  sendCreated(res, cloned, 'Onboarding template cloned successfully');
});

export const generateTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  const suggestion = await onboarding.generateAiTemplateSuggestion(req.body);
  sendSuccess(res, suggestion, 'AI suggestion generated');
});

// ----- Plans -----

export const listPlans = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const scope = getQuery(req.query.scope);
  const filter: onboarding.ListPlansFilter = {
    status: getQuery(req.query.status) as onboarding.OnboardingPlanStatus | undefined,
  };
  if (scope === 'mine') {
    filter.assigneeId = userId;
  } else if (scope === 'team') {
    filter.managerId = userId;
  } else {
    const assigneeId = getQuery(req.query.assigneeId);
    const managerId = getQuery(req.query.managerId);
    if (assigneeId) filter.assigneeId = assigneeId;
    if (managerId) filter.managerId = managerId;
  }
  const plans = await onboarding.listPlans(filter);
  sendSuccess(res, plans, 'Onboarding plans retrieved successfully');
});

export const getMyActivePlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const plans = await onboarding.listPlans({
    assigneeId: req.user!.userId,
    status: 'active',
  });
  if (plans.length === 0) {
    sendSuccess(res, null, 'No active onboarding plan');
    return;
  }
  const detail = await onboarding.getPlanDetail(plans[0].id);
  sendSuccess(res, detail, 'Active onboarding plan retrieved');
});

export const getPlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const detail = await onboarding.getPlanDetail(getParam(req.params.id));
  sendSuccess(res, detail, 'Onboarding plan retrieved successfully');
});

export const assignPlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const created = await onboarding.assignPlanFromTemplate(req.body, req.user!.userId);
  sendCreated(res, created, 'Onboarding plan assigned successfully');
});

export const updatePlan = catchAsync(async (req: AuthRequest, res: Response) => {
  const updated = await onboarding.updatePlan(getParam(req.params.id), req.body);
  sendSuccess(res, updated, 'Onboarding plan updated successfully');
});

export const deletePlan = catchAsync(async (req: AuthRequest, res: Response) => {
  await onboarding.deletePlan(getParam(req.params.id));
  sendNoContent(res);
});

export const updatePlanTaskStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const planId = getParam(req.params.id);
  const taskId = getParam(req.params.taskId);
  const updated = await onboarding.updatePlanTaskStatus(planId, taskId, req.body, req.user!.userId);
  sendSuccess(res, updated, 'Task status updated successfully');
});

export const listAssignableUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await onboarding.listUsersForAssignment(req.user!.userId);
  sendSuccess(res, result, 'Assignable users retrieved successfully');
});

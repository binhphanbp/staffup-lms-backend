import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as svc from '@/services/skill-gap.service';
import { catchAsync, sendCreated, sendSuccess } from '@/utils';

const userId = (req: AuthRequest): bigint => BigInt(req.user!.userId);
const param = (raw: string | string[] | undefined): string =>
  Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
const queryString = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return undefined;
};
const isAdmin = (req: AuthRequest): boolean => Boolean(req.user?.roleCodes?.includes('admin'));

// ---------- Skill catalog ----------

export const listSkills = catchAsync(async (req: AuthRequest, res: Response) => {
  const isActiveStr = queryString(req.query.isActive);
  const skills = await svc.listSkills({
    category: queryString(req.query.category),
    q: queryString(req.query.q),
    isActive: isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined,
  });
  sendSuccess(res, skills, 'Skills retrieved successfully');
});

export const createSkill = catchAsync(async (req: AuthRequest, res: Response) => {
  const skill = await svc.createSkill(req.body);
  sendCreated(res, skill, 'Skill created successfully');
});

export const updateSkill = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  const skill = await svc.updateSkill(id, req.body);
  sendSuccess(res, skill, 'Skill updated successfully');
});

export const deleteSkill = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  await svc.deleteSkill(id);
  sendSuccess(res, { id: id.toString() }, 'Skill deleted successfully');
});

// ---------- Position skills ----------

export const listPositionTitles = catchAsync(async (_req: AuthRequest, res: Response) => {
  const titles = await svc.listPositionTitles();
  sendSuccess(res, titles, 'Position titles retrieved successfully');
});

export const listPositionSkills = catchAsync(async (req: AuthRequest, res: Response) => {
  const positionTitle = queryString(req.query.positionTitle) ?? '';
  const rows = await svc.listPositionSkills(positionTitle);
  sendSuccess(res, rows, 'Position skills retrieved successfully');
});

export const upsertPositionSkill = catchAsync(async (req: AuthRequest, res: Response) => {
  const row = await svc.upsertPositionSkill({
    positionTitle: req.body.positionTitle,
    skillId: BigInt(req.body.skillId),
    targetLevel: req.body.targetLevel,
    weight: req.body.weight,
    isCore: req.body.isCore,
  });
  sendSuccess(res, row, 'Position skill saved successfully');
});

export const deletePositionSkill = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  await svc.deletePositionSkill(id);
  sendSuccess(res, { id: id.toString() }, 'Position skill deleted successfully');
});

// ---------- User self-assessment ----------

export const getMyProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const profile = await svc.getMyProfile(userId(req));
  sendSuccess(res, profile, 'Skill profile retrieved successfully');
});

export const setMySkillLevel = catchAsync(async (req: AuthRequest, res: Response) => {
  const skillId = BigInt(param(req.params.skillId));
  const updated = await svc.setMySkillLevel(userId(req), skillId, req.body.level, req.body.notes);
  sendSuccess(res, updated, 'Skill level updated successfully');
});

export const managerAssess = catchAsync(async (req: AuthRequest, res: Response) => {
  const updated = await svc.managerAssessSkill(
    userId(req),
    BigInt(req.body.userId),
    BigInt(req.body.skillId),
    req.body.level,
    req.body.notes,
  );
  sendSuccess(res, updated, 'Skill assessment recorded successfully');
});

// ---------- Gap analysis ----------

export const getMyGap = catchAsync(async (req: AuthRequest, res: Response) => {
  const gap = await svc.getMyGap(userId(req));
  sendSuccess(res, gap, 'My skill gap retrieved successfully');
});

export const getUserGap = catchAsync(async (req: AuthRequest, res: Response) => {
  const targetId = BigInt(param(req.params.userId));
  const gap = await svc.getUserGap(userId(req), targetId);
  sendSuccess(res, gap, 'User skill gap retrieved successfully');
});

export const getTeamRollUp = catchAsync(async (req: AuthRequest, res: Response) => {
  const departmentId = BigInt(param(req.params.departmentId));
  const result = await svc.getTeamRollUp(departmentId, userId(req), isAdmin(req));
  sendSuccess(res, result, 'Team skill roll-up retrieved successfully');
});

// ---------- AI ----------

export const aiSuggestSkills = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await svc.aiSuggestSkillsForPosition(req.body.positionTitle, req.body.context);
  sendSuccess(res, result, 'AI suggestions generated successfully');
});

// ---------- Course recommendations ----------

export const listSkillRecommendations = catchAsync(async (req: AuthRequest, res: Response) => {
  const skillId = BigInt(param(req.params.skillId));
  const rows = await svc.listSkillCourseRecommendations(skillId);
  sendSuccess(res, rows, 'Skill course recommendations retrieved successfully');
});

export const setSkillRecommendation = catchAsync(async (req: AuthRequest, res: Response) => {
  const skillId = BigInt(param(req.params.skillId));
  const row = await svc.setSkillCourseRecommendation({
    skillId,
    courseId: BigInt(req.body.courseId),
    minLevel: req.body.minLevel,
    maxLevel: req.body.maxLevel,
    priority: req.body.priority,
  });
  sendSuccess(res, row, 'Recommendation saved successfully');
});

export const removeSkillRecommendation = catchAsync(async (req: AuthRequest, res: Response) => {
  const skillId = BigInt(param(req.params.skillId));
  const courseId = BigInt(param(req.params.courseId));
  await svc.removeSkillCourseRecommendation(skillId, courseId);
  sendSuccess(
    res,
    { skillId: skillId.toString(), courseId: courseId.toString() },
    'Recommendation removed successfully',
  );
});

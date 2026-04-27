import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as roleplayService from '@/services/roleplay.service';
import { catchAsync, sendCreated, sendNoContent, sendSuccess } from '@/utils';

const getUserId = (req: AuthRequest): bigint => BigInt(req.user!.userId);

const getParam = (raw: string | string[] | undefined): string => {
  if (Array.isArray(raw)) return raw[0] ?? '';
  return raw ?? '';
};

const getQuery = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return undefined;
};

// ----- Scenarios (student) -----

export const listScenarios = catchAsync(async (req: AuthRequest, res: Response) => {
  const items = await roleplayService.listActiveScenarios(getUserId(req));
  sendSuccess(res, items, 'Roleplay scenarios retrieved successfully');
});

export const getScenarioDetail = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(getParam(req.params.id));
  const detail = await roleplayService.getScenarioById(id);
  sendSuccess(res, detail, 'Scenario retrieved successfully');
});

// ----- Scenarios (admin/trainer) -----

export const adminListScenarios = catchAsync(async (_req: AuthRequest, res: Response) => {
  const items = await roleplayService.listAllScenarios();
  sendSuccess(res, items, 'All roleplay scenarios retrieved successfully');
});

export const createScenario = catchAsync(async (req: AuthRequest, res: Response) => {
  const created = await roleplayService.createScenario(req.body, getUserId(req));
  sendCreated(res, created, 'Scenario created successfully');
});

export const updateScenario = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(getParam(req.params.id));
  const updated = await roleplayService.updateScenario(id, req.body);
  sendSuccess(res, updated, 'Scenario updated successfully');
});

export const deleteScenario = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(getParam(req.params.id));
  await roleplayService.deleteScenario(id);
  sendNoContent(res);
});

// ----- Sessions -----

export const startSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await roleplayService.startSession(getUserId(req), BigInt(req.body.scenarioId));
  sendCreated(res, result, 'Roleplay session started');
});

export const sendTurn = catchAsync(async (req: AuthRequest, res: Response) => {
  const sessionId = BigInt(getParam(req.params.sessionId));
  const result = await roleplayService.sendUserTurn(getUserId(req), sessionId, req.body.message);
  sendSuccess(res, result, 'AI turn generated');
});

export const endSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const sessionId = BigInt(getParam(req.params.sessionId));
  const result = await roleplayService.endSession(getUserId(req), sessionId);
  sendSuccess(res, result, 'Roleplay session evaluated');
});

export const abandonSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const sessionId = BigInt(getParam(req.params.sessionId));
  const result = await roleplayService.abandonSession(getUserId(req), sessionId);
  sendSuccess(res, result, 'Roleplay session abandoned');
});

export const getSessionDetail = catchAsync(async (req: AuthRequest, res: Response) => {
  const sessionId = BigInt(getParam(req.params.sessionId));
  const detail = await roleplayService.getSessionDetail(getUserId(req), sessionId);
  sendSuccess(res, detail, 'Roleplay session retrieved');
});

export const listMySessions = catchAsync(async (req: AuthRequest, res: Response) => {
  const scenarioIdRaw = getQuery(req.query.scenarioId);
  const items = await roleplayService.listMySessions(
    getUserId(req),
    scenarioIdRaw ? BigInt(scenarioIdRaw) : undefined,
  );
  sendSuccess(res, items, 'Roleplay sessions retrieved');
});

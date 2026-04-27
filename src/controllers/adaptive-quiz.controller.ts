import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as svc from '@/services/adaptive-quiz.service';
import { catchAsync, sendCreated, sendSuccess } from '@/utils';

const userId = (req: AuthRequest): bigint => BigInt(req.user!.userId);
const param = (raw: string | string[] | undefined): string =>
  Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
const queryString = (raw: unknown): string | undefined => {
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string') return raw[0];
  return undefined;
};

export const listEligibleBanks = catchAsync(async (_req: AuthRequest, res: Response) => {
  const banks = await svc.listEligibleBanks();
  sendSuccess(res, banks, 'Eligible question banks retrieved successfully');
});

export const startSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const session = await svc.startSession(userId(req), {
    questionBankId: BigInt(req.body.questionBankId),
    maxQuestions: req.body.maxQuestions,
  });
  sendCreated(res, session, 'Adaptive quiz session started successfully');
});

export const getSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  const session = await svc.getSession(id, userId(req));
  sendSuccess(res, session, 'Adaptive quiz session retrieved successfully');
});

export const submitAnswer = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  const session = await svc.submitAnswer(id, userId(req), {
    itemId: BigInt(req.body.itemId),
    selectedOptionIds: (req.body.selectedOptionIds as string[]).map((s) => BigInt(s)),
    timeSpentMs: req.body.timeSpentMs,
  });
  sendSuccess(res, session, 'Adaptive quiz answer submitted successfully');
});

export const endSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  const session = await svc.endSession(id, userId(req));
  sendSuccess(res, session, 'Adaptive quiz session ended successfully');
});

export const abandonSession = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = BigInt(param(req.params.id));
  const session = await svc.abandonSession(id, userId(req));
  sendSuccess(res, session, 'Adaptive quiz session abandoned successfully');
});

export const listMySessions = catchAsync(async (req: AuthRequest, res: Response) => {
  const status = queryString(req.query.status);
  const bankId = queryString(req.query.questionBankId);
  const sessions = await svc.listMySessions(userId(req), {
    status,
    questionBankId: bankId ? BigInt(bankId) : undefined,
  });
  sendSuccess(res, sessions, 'Adaptive quiz sessions retrieved successfully');
});

import type { Response } from 'express';
import type { ApiResponse } from '@/interfaces';

const normalizeJsonValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, normalizeJsonValue(nestedValue)]),
    );
  }

  return value;
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: Omit<ApiResponse<T>, 'success'>,
): void => {
  const normalizedData = normalizeJsonValue(data) as Omit<ApiResponse<T>, 'success'>;

  res.status(statusCode).json({
    success: statusCode < 400,
    ...normalizedData,
  });
};

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
): void => {
  sendResponse(res, statusCode, { data, message });
};

export const sendCreated = <T>(
  res: Response,
  data?: T,
  message: string = 'Created successfully',
): void => {
  sendResponse(res, 201, { data, message });
};

export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

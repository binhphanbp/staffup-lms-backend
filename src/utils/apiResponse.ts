import type { Response } from 'express';
import type { ApiResponse } from '@/interfaces';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data: Omit<ApiResponse<T>, 'success'>,
): void => {
  res.status(statusCode).json({
    success: statusCode < 400,
    ...data,
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

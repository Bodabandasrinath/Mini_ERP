import { Response } from 'express';
import { ApiResponse, PaginationMeta } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  pagination?: PaginationMeta
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 500,
  errors: any[] = []
) => {
  const response: ApiResponse = {
    success: false,
    message,
    errors,
  };

  return res.status(statusCode).json(response);
};

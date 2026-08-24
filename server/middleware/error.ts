import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '../types/api';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message: err.message || 'An unexpected error occurred.',
      details: err instanceof AppError ? err.details : undefined
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(404).json(response);
};

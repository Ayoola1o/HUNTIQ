import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, HealthResponse } from '../types/api';
import { config } from '../config/env';

export const healthRouter = Router();

const startTime = Date.now();

healthRouter.get('/health', (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memoryUsageMb = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  const healthData: HealthResponse = {
    status: 'ok',
    service: 'huntiq-api',
    version: config.apiVersion,
    uptimeSeconds,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    memoryUsageMb
  };

  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: healthData,
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  res.status(200).json(response);
});

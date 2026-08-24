export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
    durationMs?: number;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  service: 'huntiq-api';
  version: string;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  memoryUsageMb: number;
}

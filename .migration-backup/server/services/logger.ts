export type IngestionEvent =
  | 'JOB_SYNC_STARTED'
  | 'JOB_SYNC_COMPLETED'
  | 'JOB_SYNC_FAILED'
  | 'JOB_CREATED'
  | 'JOB_UPDATED'
  | 'JOB_DUPLICATE'
  | 'COMPANY_RESOLVED'
  | 'COMPANY_UNRESOLVED'
  | 'SIGNAL_CREATED'
  | 'SIGNAL_DUPLICATE'
  | 'LEAD_CREATED'
  | 'LEAD_SKIPPED';

export interface LogContext {
  workspaceId?: string;
  companyId?: string;
  provider?: string;
  counts?: number;
  durationMs?: number;
  [key: string]: unknown;
}

export class Logger {
  public static info(event: IngestionEvent | string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp,
      event,
      message,
      context: context || {}
    }));
  }

  public static warn(event: IngestionEvent | string, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp,
      event,
      message,
      context: context || {}
    }));
  }

  public static error(event: IngestionEvent | string, message: string, error?: unknown, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const errorDetails = error instanceof Error 
      ? { name: error.name, message: error.message }
      : error;

    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp,
      event,
      message,
      error: errorDetails,
      context: context || {}
    }));
  }
}

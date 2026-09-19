import { postgresPool } from '../../database/connection';
import type { MeetingRepository } from './meeting-repository';
import { PostgresMeetingRepository } from './postgres-meeting.repository';
import { InMemoryMeetingRepository } from './in-memory-meeting.repository';

export * from './meeting-repository';
export * from './postgres-meeting.repository';
export * from './in-memory-meeting.repository';

import { config } from '../../config/env';

export const createMeetingRepository = (): MeetingRepository => {
  if (postgresPool) {
    return new PostgresMeetingRepository(postgresPool);
  }
  if (config.nodeEnv === 'production' || process.env.VERCEL === '1') {
    const err = new Error('[HUNTIQ-REPOSITORY] Cannot initialize MeetingRepository in production without PostgreSQL connection.');
    (err as any).statusCode = 503;
    (err as any).code = 'DATABASE_UNAVAILABLE';
    throw err;
  }
  return new InMemoryMeetingRepository();
};

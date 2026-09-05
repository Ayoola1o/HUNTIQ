import { postgresPool } from '../../database/connection';
import type { MeetingRepository } from './meeting-repository';
import { PostgresMeetingRepository } from './postgres-meeting.repository';
import { InMemoryMeetingRepository } from './in-memory-meeting.repository';

export * from './meeting-repository';
export * from './postgres-meeting.repository';
export * from './in-memory-meeting.repository';

export const createMeetingRepository = (): MeetingRepository => {
  if (postgresPool) {
    return new PostgresMeetingRepository(postgresPool);
  }
  return new InMemoryMeetingRepository();
};

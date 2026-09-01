import { Pool } from 'pg';
import { config } from '../config/env';

export const postgresPool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
    })
  : undefined;

export const pool = postgresPool;
export default postgresPool;


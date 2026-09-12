import { Pool } from 'pg';
import { config } from '../config/env';

const isLocal = !config.databaseUrl || 
  config.databaseUrl.includes('localhost') || 
  config.databaseUrl.includes('127.0.0.1');

export const postgresPool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: isLocal ? false : { rejectUnauthorized: false }
    })
  : undefined;

export const pool = postgresPool;
export default postgresPool;


export interface ServerConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigins: string[];
  apiVersion: string;
  jwtSecret: string;
  databaseUrl?: string;
}

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: (process.env.NODE_ENV as ServerConfig['nodeEnv']) || 'development',
  corsOrigins: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  apiVersion: '1.0.0',
  jwtSecret: process.env.JWT_SECRET || 'hnt_dev_secret_jwt_key_98a7fbc2',
  databaseUrl: process.env.DATABASE_URL
};

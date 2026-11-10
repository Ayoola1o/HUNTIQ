import cors from 'cors';
import { config } from '../config/env';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser agents, matching allowed origins, localhost, or supported deployment previews
    if (
      !origin || 
      config.corsOrigins.includes(origin) || 
      origin.startsWith('http://localhost:') || 
      origin.startsWith('http://127.0.0.1:') || 
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.replit.dev') ||
      origin.endsWith('.replit.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked request from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-HUNTIQ-API-KEY', 
    'x-huntiq-api-key',
    'Idempotency-Key'
  ]
});

import fs from 'node:fs';
import path from 'node:path';

// 1. Copy Frontend Build to root dist/
const srcDir = path.resolve('artifacts/huntiq/dist/public');
const destDir = path.resolve('dist');

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`[HUNTIQ] Successfully copied frontend build from ${srcDir} to ${destDir}`);
} else {
  console.warn(`[HUNTIQ] Warning: Frontend build directory ${srcDir} does not exist`);
}

// 2. Sync Serverless Backend Artifacts to api/
const apiServerDist = path.resolve('artifacts/api-server/dist');
const apiDir = path.resolve('api');
const migrationsSrc = path.resolve('artifacts/api-server/src/database/migrations');
const migrationsDest = path.resolve('api/migrations');

if (fs.existsSync(apiServerDist)) {
  const files = fs.readdirSync(apiServerDist);
  for (const file of files) {
    if (file.endsWith('.mjs') && file !== 'index.mjs') {
      fs.copyFileSync(path.join(apiServerDist, file), path.join(apiDir, file));
    }
  }
  const indexSrc = path.join(apiServerDist, 'index.mjs');
  if (fs.existsSync(indexSrc)) {
    fs.copyFileSync(indexSrc, path.join(apiDir, 'server.mjs'));
    console.log(`[HUNTIQ] Successfully synced server bundle to api/server.mjs`);
  }
}

if (fs.existsSync(migrationsSrc)) {
  fs.cpSync(migrationsSrc, migrationsDest, { recursive: true });
  console.log(`[HUNTIQ] Successfully synced SQL migrations to api/migrations`);
}

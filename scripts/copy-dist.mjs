import fs from 'node:fs';
import path from 'node:path';

const srcDir = path.resolve('artifacts/huntiq/dist/public');
const destDir = path.resolve('dist');

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, destDir, { recursive: true });
  console.log(`[HUNTIQ] Successfully copied frontend build from ${srcDir} to ${destDir}`);
} else {
  console.warn(`[HUNTIQ] Warning: Source directory ${srcDir} does not exist`);
}

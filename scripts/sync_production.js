/**
 * Syncs the freshly built client/dist/ bundle into production/,
 * wiping any stale assets from prior builds so production/ never drifts.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const distDir = path.join(ROOT_DIR, 'client', 'dist');
const prodDir = path.join(ROOT_DIR, 'production');

if (!fs.existsSync(distDir)) {
  console.error(`❌ Error: Build output not found at ${distDir}. Run Vite build first.`);
  process.exit(1);
}

console.log(`🧹 Cleaning stale production directory: ${prodDir}`);
fs.rmSync(prodDir, { recursive: true, force: true });
fs.mkdirSync(prodDir, { recursive: true });

console.log(`📦 Copying fresh bundle from ${distDir} -> ${prodDir}`);
fs.cpSync(distDir, prodDir, { recursive: true });

console.log('✅ production/ synchronized cleanly with client/dist/.');


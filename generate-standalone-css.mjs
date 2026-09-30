import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distAssetsDir = path.join(rootDir, 'dist', 'assets');
const outputFile = path.join(rootDir, 'src', 'standalone-css.ts');

if (!fs.existsSync(distAssetsDir)) {
  console.error('Run "npx vite build" first so dist/assets/*.css exists.');
  process.exit(1);
}

const cssFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.css'));
if (cssFiles.length === 0) {
  console.error('No CSS file found in dist/assets/');
  process.exit(1);
}

const cssContent = fs.readFileSync(path.join(distAssetsDir, cssFiles[0]), 'utf8');
const tsContent = `export const STANDALONE_CSS = ${JSON.stringify(cssContent)};\n`;
fs.writeFileSync(outputFile, tsContent, 'utf8');
console.log('Updated src/standalone-css.ts successfully.');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const distDir = path.join(rootDir, 'dist');
const androidAssetsPublicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');
const androidAssetsRootDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets');

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(distDir)) {
  console.error('Error: dist/ directory does not exist. Run "npx vite build" first.');
  process.exit(1);
}

// Clean previous public assets in Android project
if (fs.existsSync(androidAssetsPublicDir)) {
  fs.rmSync(androidAssetsPublicDir, { recursive: true, force: true });
}
fs.mkdirSync(androidAssetsPublicDir, { recursive: true });

// Copy dist/* to android/app/src/main/assets/public/ and android/app/src/main/assets/
copyRecursiveSync(distDir, androidAssetsPublicDir);
copyRecursiveSync(distDir, androidAssetsRootDir);

console.log('Successfully synced web build from dist/ to android/app/src/main/assets/public/');

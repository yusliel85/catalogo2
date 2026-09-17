import fs from 'fs';
import path from 'path';

const distDir = path.resolve(process.cwd(), 'dist');
const targetDir = path.resolve(process.cwd(), 'android/app/src/main/assets/www');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node-only server files
    if (entry.name === 'server.cjs' || entry.name === 'server.cjs.map') {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('[Android Sync] Cleaning target directory:', targetDir);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  console.log('[Android Sync] Copying dist assets to android/app/src/main/assets/www ...');
  copyDirRecursive(distDir, targetDir);

  // Also copy public/icon.png if present
  const iconPath = path.resolve(process.cwd(), 'public/icon.png');
  if (fs.existsSync(iconPath)) {
    fs.copyFileSync(iconPath, path.join(targetDir, 'icon.png'));
  }

  console.log('[Android Sync] ✅ Assets successfully synchronized to Android assets directory!');
} catch (err) {
  console.error('[Android Sync] ❌ Error syncing assets:', err);
  process.exit(1);
}

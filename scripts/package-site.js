/**
 * K.E.S.F Website Packaging Script
 * Prepares the production bundle in 'dist/' and generates a ready-to-upload ZIP archive.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'www');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ZIP_DIST_PATH = path.join(DIST_DIR, 'kesf-website-deploy.zip');
const ZIP_ROOT_PATH = path.join(ROOT_DIR, 'kesf-website-deploy.zip');

console.log('====================================================');
console.log('  Packaging K.E.S.F Website for Production Hosting  ');
console.log('====================================================');

// 1. Verify Source Files
if (!fs.existsSync(SRC_DIR)) {
  console.error(`Error: Source directory "${SRC_DIR}" does not exist.`);
  process.exit(1);
}

const requiredFiles = ['index.html', 'style.css', 'app.js', 'assets'];
for (const file of requiredFiles) {
  const filePath = path.join(SRC_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Required file or folder "${file}" missing in www/`);
    process.exit(1);
  }
}

// 2. Clean and Recreate dist/ Directory
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DIST_DIR, { recursive: true });

// 3. Helper to copy directories recursively
function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyRecursiveSync(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('Copying production assets from www/ to dist/...');
copyRecursiveSync(SRC_DIR, DIST_DIR);

// 4. Calculate File Counts and Size
let totalFiles = 0;
let totalSizeBytes = 0;

function calculateStats(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      calculateStats(fullPath);
    } else {
      totalFiles++;
      totalSizeBytes += fs.statSync(fullPath).size;
    }
  }
}
calculateStats(DIST_DIR);

const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
console.log(`Copied ${totalFiles} files (${totalSizeMB} MB) to dist/`);

// 5. Create Standalone Deployment ZIP Archive
console.log('Generating deployment ZIP archive...');

// Remove any existing old zip files
if (fs.existsSync(ZIP_ROOT_PATH)) {
  fs.unlinkSync(ZIP_ROOT_PATH);
}

try {
  // On Windows PowerShell: Compress-Archive
  const psCmd = `powershell -NoProfile -Command "Compress-Archive -Path '${DIST_DIR}\\*' -DestinationPath '${ZIP_ROOT_PATH}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });
  
  // Also copy a copy into dist/
  if (fs.existsSync(ZIP_ROOT_PATH)) {
    fs.copyFileSync(ZIP_ROOT_PATH, ZIP_DIST_PATH);
    const zipSizeMB = (fs.statSync(ZIP_ROOT_PATH).size / (1024 * 1024)).toFixed(2);
    console.log(`ZIP created successfully: kesf-website-deploy.zip (${zipSizeMB} MB)`);
  }
} catch (err) {
  console.warn('Warning: Could not create zip archive automatically:', err.message);
}

console.log('\n====================================================');
console.log('  Packaging Completed Successfully!                 ');
console.log('====================================================');
console.log(`Production Folder : ${DIST_DIR}`);
console.log(`Deployable Archive: ${ZIP_ROOT_PATH}`);
console.log('\nReady for deployment to:');
console.log('  - cPanel / Shared Hosting : Upload and extract kesf-website-deploy.zip into public_html');
console.log('  - Netlify Drop            : Drag & drop the "dist" folder or "kesf-website-deploy.zip" onto netlify.com/drop');
console.log('  - Vercel                  : Run "npx vercel" or connect repo (vercel.json configured)');
console.log('  - Cloudflare Pages        : Upload "dist" folder in Cloudflare Pages dashboard');
console.log('  - GitHub Pages            : Push to repo or publish "www" directory\n');

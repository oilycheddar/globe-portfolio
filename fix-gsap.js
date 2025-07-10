const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔧 Fixing GSAP registry references...');

// Remove package-lock.json if it exists
if (fs.existsSync('package-lock.json')) {
  console.log('📦 Removing old package-lock.json...');
  fs.unlinkSync('package-lock.json');
}

// Remove node_modules if it exists
if (fs.existsSync('node_modules')) {
  console.log('🗑️  Removing node_modules...');
  execSync('rm -rf node_modules', { stdio: 'inherit' });
}

// Clear npm cache
console.log('🧹 Clearing npm cache...');
execSync('npm cache clean --force', { stdio: 'inherit' });

// Reinstall dependencies
console.log('📥 Installing dependencies with public GSAP...');
execSync('npm install', { stdio: 'inherit' });

console.log('✅ GSAP registry fix complete!');
console.log('🚀 You can now deploy to Vercel without authentication issues.'); 
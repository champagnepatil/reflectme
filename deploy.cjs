#!/usr/bin/env node

/**
 * ReflectMe Deployment Helper
 * Automated deployment script for Netlify
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ReflectMe Deployment Helper\n');

// Check if required files exist
const requiredFiles = [
  'netlify.toml',
  'public/_redirects',
  'package.json'
];

console.log('📋 Checking required files...');
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - Missing!`);
    process.exit(1);
  }
}

// Check if dist folder exists (build artifacts)
if (fs.existsSync('dist')) {
  console.log('✅ dist/ - Build artifacts found');
} else {
  console.log('⚠️  dist/ folder not found. Running build...\n');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed successfully!\n');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Display deployment options
console.log('🌐 Deployment Options:\n');
console.log('1. Deploy via Netlify CLI (requires netlify-cli installed)');
console.log('2. Deploy via Git (push to GitHub + connect to Netlify)');
console.log('3. Manual drag & drop (upload dist folder to Netlify)\n');

console.log('📝 Environment Variables Needed:');
console.log('  VITE_GEMINI_API_KEY - For AI features');
console.log('  VITE_SUPABASE_URL   - For database (optional)');
console.log('  VITE_SUPABASE_ANON_KEY - For database (optional)\n');

console.log('🎯 After deployment, test these routes:');
console.log('  /                  - Homepage');
console.log('  /client           - Client dashboard (demo data)');
console.log('  /therapist        - Therapist portal (demo data)');
console.log('  /client/journal   - AI-powered journal');
console.log('  /client/insights  - Analytics dashboard');
console.log('  /client/chat      - AI companion chat\n');

console.log('✨ ReflectMe is ready for deployment!');
console.log('📖 See README.md for detailed deployment instructions.'); 
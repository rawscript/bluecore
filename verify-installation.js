// Script to verify that the published package can be installed and run

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Verifying bluecore-pkg installation...');

try {
  // Create a temporary directory for testing
  const testDir = path.join(__dirname, 'temp-test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  process.chdir(testDir);
  
  // Initialize npm project
  execSync('npm init -y', { stdio: 'inherit' });
  
  // Install bluecore-pkg
  console.log('Installing bluecore-pkg...');
  execSync('npm install bluecore-pkg', { stdio: 'inherit' });
  
  // Test if bluecore command is available
  console.log('Testing bluecore command...');
  const versionOutput = execSync('npx bluecore --version', { encoding: 'utf8' });
  console.log('Bluecore version:', versionOutput.trim());
  
  // Test init command
  console.log('Testing bluecore init...');
  execSync('npx bluecore init', { stdio: 'inherit' });
  
  // Check if rhezusport.json was created
  if (fs.existsSync('rhezusport.json')) {
    console.log('✓ rhezusport.json created successfully');
  } else {
    console.log('✗ rhezusport.json was not created');
  }
  
  console.log('Installation verification completed successfully!');
  
  // Clean up
  process.chdir(__dirname);
  fs.rmSync(testDir, { recursive: true, force: true });
  
} catch (error) {
  console.error('Error during verification:', error.message);
  process.chdir(__dirname);
  // Clean up
  const testDir = path.join(__dirname, 'temp-test');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
}
const fs = require('fs');
const path = require('path');

// Import our modules
const {
  getWindowsDrives,
  findRhezusportFiles
} = require('./lib/registryManager');

console.log('Testing cross-driver functionality...');

// Test getting Windows drives
console.log('Available drives:', getWindowsDrives());

// Test finding rhezusport files across drives
(async () => {
  try {
    const files = await findRhezusportFiles();
    console.log('Found rhezusport files:', files);
  } catch (error) {
    console.error('Error finding rhezusport files:', error);
  }
})();
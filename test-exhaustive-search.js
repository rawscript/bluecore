const fs = require('fs');
const path = require('path');

// Import our modules
const {
  findRhezusportFiles,
  getWindowsDrives
} = require('./lib/registryManager');

console.log('Testing exhaustive cross-driver search functionality...');

// Test getting Windows drives
console.log('Available drives:', getWindowsDrives());

// Test finding rhezusport files across the entire system
(async () => {
  try {
    console.time('Exhaustive Search Time');
    const files = await findRhezusportFiles();
    console.timeEnd('Exhaustive Search Time');
    console.log('Found rhezusport files:', files);
    console.log('Total files found:', files.length);
  } catch (error) {
    console.error('Error finding rhezusport files:', error);
  }
})();
const fs = require('fs');
const path = require('path');

// Import our modules
const {
  findRhezusportFiles
} = require('./lib/registryManager');

console.log('Testing optimized cross-driver search functionality...');

// Test finding rhezusport files across drives with optimized search
(async () => {
  try {
    console.time('Search Time');
    const files = await findRhezusportFiles();
    console.timeEnd('Search Time');
    console.log('Found rhezusport files:', files);
    console.log('Total files found:', files.length);
  } catch (error) {
    console.error('Error finding rhezusport files:', error);
  }
})();
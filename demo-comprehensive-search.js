const fs = require('fs');
const path = require('path');

// Import our modules
const {
  findRhezusportFiles,
  getWindowsDrives
} = require('./lib/registryManager');

console.log('=== Bluecore Comprehensive Search Demo ===');
console.log('This demo shows how bluecore can find packages across your entire system');

// Show system information
console.log('\nSystem Information:');
console.log('Available drives:', getWindowsDrives());
console.log('Current working directory:', process.cwd());
console.log('Home directory:', require('os').homedir());

// Perform comprehensive search
(async () => {
  console.log('\nStarting comprehensive search across all drives...');
  console.time('Comprehensive Search');
  
  try {
    const files = await findRhezusportFiles();
    console.timeEnd('Comprehensive Search');
    
    console.log('\nResults:');
    console.log(`Found ${files.length} rhezusport files across your system`);
    
    if (files.length > 0) {
      console.log('\nLocated rhezusport files:');
      files.forEach((file, index) => {
        console.log(`${index + 1}. ${file}`);
      });
    } else {
      console.log('No rhezusport files found. This is normal for a new installation.');
    }
    
    console.log('\n=== Search Complete ===');
    console.log('Bluecore will now be able to reuse packages from any of these locations!');
  } catch (error) {
    console.error('Error during search:', error.message);
  }
})();
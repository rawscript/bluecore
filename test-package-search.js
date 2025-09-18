const fs = require('fs');
const path = require('path');

// Import our modules
const {
  findPackageInstallations,
  getWindowsDrives
} = require('./lib/registryManager');

console.log('=== Bluecore Package Search Demo ===');
console.log('This demo shows how bluecore can find actual package installations across your system');

// Show system information
console.log('\nSystem Information:');
console.log('Available drives:', getWindowsDrives());
console.log('Current working directory:', process.cwd());
console.log('Home directory:', require('os').homedir());

// Test searching for specific packages
(async () => {
  console.log('\nSearching for common packages across the system...');
  console.time('Package Search');
  
  try {
    // Search for some common packages
    const packagesToFind = ['lodash', 'chalk', 'express', '@google/generative-ai'];
    const foundPackages = await findPackageInstallations(packagesToFind);
    
    console.timeEnd('Package Search');
    
    console.log('\nResults:');
    if (Object.keys(foundPackages).length > 0) {
      console.log('Found packages:');
      for (const [pkg, paths] of Object.entries(foundPackages)) {
        console.log(`  ${pkg}:`);
        paths.forEach(p => console.log(`    - ${p}`));
      }
    } else {
      console.log('No packages found. This is normal if these packages are not installed on your system.');
    }
    
    console.log('\n=== Package Search Complete ===');
  } catch (error) {
    console.error('Error during package search:', error.message);
  }
})();
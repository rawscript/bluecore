const fs = require('fs');
const path = require('path');

// Import our modules
const {
  getWindowsDrives
} = require('./lib/registryManager');

console.log('Testing cross-driver functionality...');

// Test getting Windows drives
console.log('Available drives:', getWindowsDrives());

console.log('Cross-driver functionality test completed.');
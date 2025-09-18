// Simple test script to verify bluecore functionality

const fs = require('fs');
const path = require('path');

// Test registry manager functions
const {
  findRhezusportFiles,
  loadRhezusportRegistry,
  saveRhezusportRegistry,
  getLatestRhezusportFile,
  mergeRegistries,
  RHEZUSPORT_FILE
} = require('./lib/registryManager');

console.log('Testing registry manager functions...');

// Test save and load registry
const testRegistry = {
  "test-package": {
    versions: {
      "1.0.0": {
        locations: ["/test/path"],
        lastUsed: new Date().toISOString()
      }
    }
  }
};

const testFilePath = path.join(__dirname, 'test-rhezusport.json');
console.log('Saving test registry...');
saveRhezusportRegistry(testRegistry, testFilePath);

console.log('Loading test registry...');
const loadedRegistry = loadRhezusportRegistry(testFilePath);
console.log('Loaded registry:', JSON.stringify(loadedRegistry, null, 2));

// Clean up test file
if (fs.existsSync(testFilePath)) {
  fs.unlinkSync(testFilePath);
  console.log('Test file cleaned up');
}

console.log('Registry manager tests completed successfully!');
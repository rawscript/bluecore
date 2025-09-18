// Enhanced test script to verify bluecore functionality

const fs = require('fs');
const path = require('path');
const os = require('os');

// Test registry manager functions
const {
  loadRhezusportRegistry,
  saveRhezusportRegistry,
  mergeRegistries,
  RHEZUSPORT_FILE
} = require('./lib/registryManager');

console.log('Testing enhanced registry manager functions...');

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

// Test merging registries
console.log('Testing registry merging...');
const registry1 = {
  "package-a": {
    versions: {
      "1.0.0": {
        locations: ["/path1"],
        lastUsed: new Date().toISOString()
      }
    }
  }
};

const registry2 = {
  "package-a": {
    versions: {
      "1.0.0": {
        locations: ["/path2"],
        lastUsed: new Date().toISOString()
      }
    }
  },
  "package-b": {
    versions: {
      "2.0.0": {
        locations: ["/path3"],
        lastUsed: new Date().toISOString()
      }
    }
  }
};

const merged = mergeRegistries([registry1, registry2]);
console.log('Merged registry:', JSON.stringify(merged, null, 2));

// Clean up test file
if (fs.existsSync(testFilePath)) {
  fs.unlinkSync(testFilePath);
  console.log('Test file cleaned up');
}

console.log('Enhanced registry manager tests completed successfully!');
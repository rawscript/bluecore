const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const { RHEZUSPORT_FILE } = require('./registryManager');

// Directories to skip during search to avoid system files
const SKIP_DIRS = new Set([
  '$RECYCLE.BIN',
  'System Volume Information',
  'Windows',
  'Program Files',
  'Program Files (x86)',
  'ProgramData'
]);

/**
 * Check if a directory should be skipped
 * @param {string} dirName - Name of the directory
 * @returns {boolean} True if directory should be skipped
 */
function shouldSkipDirectory(dirName) {
  return SKIP_DIRS.has(dirName);
}

/**
 * Worker function to search a directory for rhezusport files using breadth-first search
 * @param {string} rootDir - Directory to search
 * @returns {Promise<Array<string>>} Promise that resolves with found file paths
 */
function searchDirectory(rootDir) {
  return new Promise((resolve) => {
    const results = [];
    const queue = [rootDir];
    const maxDirs = 5000; // Limit total directories to search to prevent memory issues
    let dirsSearched = 0;
    
    while (queue.length > 0 && dirsSearched < maxDirs) {
      const currentDir = queue.shift();
      dirsSearched++;
      
      try {
        const files = fs.readdirSync(currentDir, { withFileTypes: true });
        
        for (const file of files) {
          // Skip known system directories
          if (shouldSkipDirectory(file.name)) {
            continue;
          }

          const filePath = path.join(currentDir, file.name);

          if (file.isDirectory()) {
            // Add directory to queue for later processing
            queue.push(filePath);
          } else if (file.name === RHEZUSPORT_FILE) {
            // Found a rhezusport file
            results.push(filePath);
          }
        }
      } catch (error) {
        // Continue searching even if we can't access a directory
      }
    }
    
    resolve(results);
  });
}

// Worker execution
(async () => {
  const { directory } = workerData;
  try {
    const results = await searchDirectory(directory);
    parentPort.postMessage({ directory, results });
  } catch (error) {
    parentPort.postMessage({ directory, error: error.message });
  }
})();
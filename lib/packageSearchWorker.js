const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');

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
 * Check if a path is likely to contain a node_modules directory
 * @param {string} dirPath - Path to check
 * @returns {boolean} True if path likely contains node_modules
 */
function isLikelyProjectPath(dirPath) {
  // Common project indicators
  const indicators = ['package.json', 'node_modules', '.git'];
  return indicators.some(indicator => fs.existsSync(path.join(dirPath, indicator)));
}

/**
 * Find package installations directly by searching for node_modules
 * @param {string} rootDir - Directory to search
 * @param {Array<string>} targetPackages - Packages to look for
 * @returns {Promise<Object>} Found packages with their paths
 */
function searchForPackages(rootDir, targetPackages) {
  return new Promise((resolve) => {
    const results = {};
    const queue = [rootDir];
    const maxDirs = 3000; // Limit total directories to search
    let dirsSearched = 0;
    
    while (queue.length > 0 && dirsSearched < maxDirs) {
      const currentDir = queue.shift();
      dirsSearched++;
      
      try {
        // Check if this directory is likely to be a project directory
        if (isLikelyProjectPath(currentDir)) {
          // Check for node_modules in this directory
          const nodeModulesPath = path.join(currentDir, 'node_modules');
          if (fs.existsSync(nodeModulesPath) && fs.statSync(nodeModulesPath).isDirectory()) {
            // Look for target packages in node_modules
            for (const pkg of targetPackages) {
              const packagePath = path.join(nodeModulesPath, pkg);
              if (fs.existsSync(packagePath)) {
                if (!results[pkg]) {
                  results[pkg] = [];
                }
                results[pkg].push(packagePath);
              }
            }
          }
        }
        
        // Continue searching subdirectories
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
  const { directory, packages } = workerData;
  try {
    const results = await searchForPackages(directory, packages);
    parentPort.postMessage({ directory, results });
  } catch (error) {
    parentPort.postMessage({ directory, error: error.message });
  }
})();
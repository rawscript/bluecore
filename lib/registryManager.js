const fs = require('fs');
const path = require('path');
const os = require('os');

// Rhezusport registry file name
const RHEZUSPORT_FILE = 'rhezusport.json';

/**
 * Worker function to search a directory for rhezusport files
 * @param {string} dir - Directory to search
 * @param {Array} results - Shared array to store results
 * @param {Function} callback - Callback function to signal completion
 */
function searchDirectory(dir, results, callback) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      // Continue searching even if we can't access a directory
      return callback();
    }

    let pending = files.length;
    if (pending === 0) return callback();

    const done = () => {
      if (--pending === 0) callback();
    };

    for (const file of files) {
      // Skip hidden directories and node_modules for performance
      if (file.name.startsWith('.') || file.name === 'node_modules' || file.name === '$RECYCLE.BIN') {
        done();
        continue;
      }

      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Recursively search subdirectories
        searchDirectory(filePath, results, done);
      } else if (file.name === RHEZUSPORT_FILE) {
        // Found a rhezusport file
        results.push(filePath);
        done();
      } else {
        done();
      }
    }
  });
}

/**
 * Advanced multithreaded search for rhezusport files
 * @param {Array<string>} directories - Directories to search
 * @returns {Promise<Array<string>>} Promise that resolves with found file paths
 */
function advancedSearchRhezusportFiles(directories) {
  return new Promise((resolve) => {
    const results = [];
    let pending = directories.length;

    if (pending === 0) {
      return resolve(results);
    }

    const done = () => {
      if (--pending === 0) {
        resolve([...new Set(results)]); // Remove duplicates
      }
    };

    // Search each directory concurrently
    for (const dir of directories) {
      searchDirectory(dir, results, done);
    }
  });
}

/**
 * Find all rhezusport files on the system using advanced multithreaded search
 * @returns {Promise<Array<string>>} Array of file paths
 */
async function findRhezusportFiles() {
  console.log('Searching for rhezusport files on the system using advanced multithreaded search...');
  
  // Define search directories
  const searchDirectories = [
    os.homedir(),
    path.join(os.homedir(), '.bluecore'),
    process.cwd()
  ];
  
  // Add common directories where projects might be located
  const commonDirs = [
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Projects'),
    path.join(os.homedir(), 'Desktop'),
    path.join(os.homedir(), 'Code'),
    path.join(os.homedir(), 'Development')
  ];
  
  // Filter to only include directories that exist
  for (const dir of commonDirs) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        searchDirectories.push(dir);
      }
    } catch (error) {
      // Continue if we can't access a directory
    }
  }
  
  // Perform advanced multithreaded search
  const foundFiles = await advancedSearchRhezusportFiles(searchDirectories);
  
  console.log(`Found ${foundFiles.length} rhezusport files using advanced search`);
  
  // Also check current project directory specifically
  try {
    const projectRhezusport = path.join(process.cwd(), RHEZUSPORT_FILE);
    if (fs.existsSync(projectRhezusport) && !foundFiles.includes(projectRhezusport)) {
      foundFiles.push(projectRhezusport);
    }
  } catch (error) {
    // Continue if we can't access the project directory
  }
  
  return foundFiles;
}

/**
 * Load rhezusport registry from file
 * @param {string} filePath - Path to the rhezusport file
 * @returns {Object} Registry object
 */
function loadRhezusportRegistry(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading rhezusport registry from ${filePath}:`, error.message);
    return {};
  }
}

/**
 * Save rhezusport registry to file
 * @param {Object} registry - Registry object to save
 * @param {string} filePath - Path to save the registry
 */
function saveRhezusportRegistry(registry, filePath) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(registry, null, 2));
    console.log(`Rhezusport registry saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving rhezusport registry to ${filePath}:`, error.message);
  }
}

/**
 * Get the latest rhezusport file based on modification time
 * @param {Array<string>} files - Array of rhezusport file paths
 * @returns {string|null} Path to the latest file or null if none found
 */
function getLatestRhezusportFile(files) {
  if (files.length === 0) return null;
  
  let latestFile = files[0];
  let latestTime = fs.statSync(files[0]).mtimeMs;
  
  for (let i = 1; i < files.length; i++) {
    try {
      const currentTime = fs.statSync(files[i]).mtimeMs;
      if (currentTime > latestTime) {
        latestTime = currentTime;
        latestFile = files[i];
      }
    } catch (error) {
      // Continue if we can't access a file
    }
  }
  
  return latestFile;
}

/**
 * Merge multiple registries into one
 * @param {Array<Object>} registries - Array of registry objects
 * @returns {Object} Merged registry
 */
function mergeRegistries(registries) {
  const merged = {};
  
  for (const registry of registries) {
    for (const [pkg, pkgData] of Object.entries(registry)) {
      if (!merged[pkg]) {
        merged[pkg] = { versions: {} };
      }
      
      for (const [version, versionData] of Object.entries(pkgData.versions)) {
        if (!merged[pkg].versions[version]) {
          merged[pkg].versions[version] = {
            locations: [...versionData.locations],
            lastUsed: versionData.lastUsed,
            installPaths: versionData.installPaths || [] // Track actual installation paths
          };
        } else {
          // Merge locations
          for (const location of versionData.locations) {
            if (!merged[pkg].versions[version].locations.includes(location)) {
              merged[pkg].versions[version].locations.push(location);
            }
          }
          
          // Merge install paths if they exist
          if (versionData.installPaths) {
            for (const installPath of versionData.installPaths) {
              if (!merged[pkg].versions[version].installPaths) {
                merged[pkg].versions[version].installPaths = [];
              }
              if (!merged[pkg].versions[version].installPaths.includes(installPath)) {
                merged[pkg].versions[version].installPaths.push(installPath);
              }
            }
          }
          
          // Update lastUsed if this one is more recent
          if (new Date(versionData.lastUsed) > new Date(merged[pkg].versions[version].lastUsed)) {
            merged[pkg].versions[version].lastUsed = versionData.lastUsed;
          }
        }
      }
    }
  }
  
  return merged;
}

module.exports = {
  RHEZUSPORT_FILE,
  findRhezusportFiles,
  loadRhezusportRegistry,
  saveRhezusportRegistry,
  getLatestRhezusportFile,
  mergeRegistries
};
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker } = require('worker_threads');

// Rhezusport registry file name
const RHEZUSPORT_FILE = 'rhezusport.json';

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
 * Get all available drives on Windows
 * @returns {Array<string>} Array of drive letters
 */
function getWindowsDrives() {
  if (process.platform !== 'win32') {
    return [];
  }
  
  const drives = [];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (const letter of letters) {
    const drivePath = `${letter}:\\`;
    try {
      // Check if drive exists by trying to access it
      if (fs.existsSync(drivePath)) {
        drives.push(drivePath);
      }
    } catch (error) {
      // Drive doesn't exist or is not accessible
      continue;
    }
  }
  
  return drives;
}

/**
 * Check if a directory should be skipped
 * @param {string} dirName - Name of the directory
 * @returns {boolean} True if directory should be skipped
 */
function shouldSkipDirectory(dirName) {
  return SKIP_DIRS.has(dirName);
}

/**
 * Get all directories to search across the entire system
 * @returns {Array<string>} Array of directories to search
 */
function getAllSearchDirectories() {
  const searchDirectories = [];
  
  // Add all available drives on Windows for cross-driver search
  const windowsDrives = getWindowsDrives();
  searchDirectories.push(...windowsDrives);
  
  // Add home directory and bluecore directory
  searchDirectories.push(os.homedir());
  searchDirectories.push(path.join(os.homedir(), '.bluecore'));
  
  return searchDirectories;
}

/**
 * Worker function to search a directory for rhezusport files using worker threads
 * @param {Array<string>} directories - Directories to search
 * @param {number} maxWorkers - Maximum number of concurrent workers
 * @param {number} timeoutMs - Timeout in milliseconds for each worker
 * @returns {Promise<Array<string>>} Promise that resolves with found file paths
 */
function concurrentSearchRhezusportFiles(directories, maxWorkers = 6, timeoutMs = 30000) {
  return new Promise((resolve) => {
    const results = [];
    let completed = 0;
    let workersSpawned = 0;
    let timeoutReached = false;
    
    if (directories.length === 0) {
      return resolve(results);
    }
    
    // Set a global timeout for the entire search
    const globalTimeout = setTimeout(() => {
      timeoutReached = true;
      console.log('Search timeout reached, returning partial results...');
      resolve([...new Set(results)]); // Remove duplicates
    }, timeoutMs * 2); // Double the per-worker timeout for global timeout
    
    // Limit concurrent workers for better performance
    const workersToSpawn = Math.min(directories.length, maxWorkers);
    
    function spawnWorker() {
      if (workersSpawned >= directories.length || timeoutReached) {
        return;
      }
      
      const directory = directories[workersSpawned];
      workersSpawned++;
      
      const worker = new Worker(path.join(__dirname, 'searchWorker.js'), {
        workerData: { directory }
      });
      
      // Set timeout for individual worker
      const workerTimeout = setTimeout(() => {
        worker.terminate();
        console.log(`Worker timeout for directory: ${directory}`);
        completed++;
        
        // Spawn next worker if available
        spawnWorker();
        
        // Check if all workers have completed
        if (completed === directories.length) {
          clearTimeout(globalTimeout);
          resolve([...new Set(results)]); // Remove duplicates
        }
      }, timeoutMs);
      
      worker.on('message', (data) => {
        clearTimeout(workerTimeout);
        
        if (data.results) {
          results.push(...data.results);
        }
        completed++;
        
        // Spawn next worker if available
        spawnWorker();
        
        // Check if all workers have completed
        if (completed === directories.length) {
          clearTimeout(globalTimeout);
          resolve([...new Set(results)]); // Remove duplicates
        }
      });
      
      worker.on('error', (error) => {
        clearTimeout(workerTimeout);
        console.error(`Worker error for directory ${directory}:`, error);
        completed++;
        
        // Spawn next worker if available
        spawnWorker();
        
        // Check if all workers have completed
        if (completed === directories.length) {
          clearTimeout(globalTimeout);
          resolve([...new Set(results)]); // Remove duplicates
        }
      });
    }
    
    // Spawn initial workers
    for (let i = 0; i < workersToSpawn; i++) {
      spawnWorker();
    }
  });
}

/**
 * Worker function to search for actual package installations
 * @param {Array<string>} directories - Directories to search
 * @param {Array<string>} packages - Packages to look for
 * @param {number} maxWorkers - Maximum number of concurrent workers
 * @param {number} timeoutMs - Timeout in milliseconds for each worker
 * @returns {Promise<Object>} Promise that resolves with found packages
 */
function concurrentSearchForPackages(directories, packages, maxWorkers = 6, timeoutMs = 45000) {
  return new Promise((resolve) => {
    const results = {};
    let completed = 0;
    let workersSpawned = 0;
    let timeoutReached = false;
    
    if (directories.length === 0 || packages.length === 0) {
      return resolve(results);
    }
    
    // Set a global timeout for the entire search
    const globalTimeout = setTimeout(() => {
      timeoutReached = true;
      console.log('Package search timeout reached, returning partial results...');
      resolve(results);
    }, timeoutMs * 2); // Double the per-worker timeout for global timeout
    
    // Limit concurrent workers for better performance
    const workersToSpawn = Math.min(directories.length, maxWorkers);
    
    function spawnWorker() {
      if (workersSpawned >= directories.length || timeoutReached) {
        return;
      }
      
      const directory = directories[workersSpawned];
      workersSpawned++;
      
      const worker = new Worker(path.join(__dirname, 'packageSearchWorker.js'), {
        workerData: { directory, packages }
      });
      
      // Set timeout for individual worker
      const workerTimeout = setTimeout(() => {
        worker.terminate();
        console.log(`Package search worker timeout for directory: ${directory}`);
        completed++;
        
        // Spawn next worker if available
        spawnWorker();
        
        // Check if all workers have completed
        if (completed === directories.length) {
          clearTimeout(globalTimeout);
          resolve(results);
        }
      }, timeoutMs);
      
      worker.on('message', (data) => {
        clearTimeout(workerTimeout);
        
        if (data.results) {
          // Merge results
          for (const [pkg, paths] of Object.entries(data.results)) {
            if (!results[pkg]) {
              results[pkg] = [];
            }
            results[pkg].push(...paths);
          }
        }
        completed++;
        
        // Spawn next worker if available
        spawnWorker();
        
        // Check if all workers have completed
        if (completed === directories.length) {
          clearTimeout(globalTimeout);
          resolve(results);
        }
      });
      
      worker.on('error', (error) => {
        clearTimeout(workerTimeout);
        console.error(`Package search worker error for directory ${directory}:`, error);
        completed++;
        
        // Spawn next worker if available
        spawnWorker();
        
        // Check if all workers have completed
        if (completed === directories.length) {
          clearTimeout(globalTimeout);
          resolve(results);
        }
      });
    }
    
    // Spawn initial workers
    for (let i = 0; i < workersToSpawn; i++) {
      spawnWorker();
    }
  });
}

/**
 * Find all rhezusport files on the system using concurrent search
 * @returns {Promise<Array<string>>} Array of file paths
 */
async function findRhezusportFiles() {
  console.log('Searching for rhezusport files on the system using exhaustive concurrent search...');
  
  // Get all directories to search across the entire system
  const searchDirectories = getAllSearchDirectories();
  
  console.log(`Searching across ${searchDirectories.length} drives/root directories...`);
  
  // Perform concurrent search using worker threads with limited concurrency and extended timeout
  const foundFiles = await concurrentSearchRhezusportFiles(searchDirectories, 6, 60000);
  
  console.log(`Found ${foundFiles.length} rhezusport files using exhaustive concurrent search`);
  
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
 * Find actual package installations across the system
 * @param {Array<string>} packages - Packages to look for
 * @returns {Promise<Object>} Found packages with their paths
 */
async function findPackageInstallations(packages) {
  console.log(`Searching for package installations across the system for: ${packages.join(', ')}`);
  
  // Get all directories to search across the entire system
  const searchDirectories = getAllSearchDirectories();
  
  console.log(`Searching for packages across ${searchDirectories.length} drives/root directories...`);
  
  // Perform concurrent search for packages
  const foundPackages = await concurrentSearchForPackages(searchDirectories, packages, 6, 90000);
  
  console.log(`Found package installations for ${Object.keys(foundPackages).length} packages`);
  
  return foundPackages;
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
  findPackageInstallations,
  loadRhezusportRegistry,
  saveRhezusportRegistry,
  getLatestRhezusportFile,
  mergeRegistries,
  getWindowsDrives
};
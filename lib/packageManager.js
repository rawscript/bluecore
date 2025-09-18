const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Get current project dependencies from package.json
 * @returns {Object} Dependencies object
 */
function getCurrentProjectDependencies() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.warn('No package.json found in current directory');
      return {};
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    return dependencies;
  } catch (error) {
    console.error('Error reading project package.json:', error.message);
    return {};
  }
}

/**
 * Create a symlink to an existing package installation
 * @param {string} sourcePath - Path to the existing package installation
 * @param {string} targetPath - Path where the symlink should be created
 */
function createSymlink(sourcePath, targetPath) {
  try {
    // Ensure parent directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Remove existing file/directory if it exists
    if (fs.existsSync(targetPath)) {
      fs.rmSync(targetPath, { recursive: true });
    }
    
    // Create symlink
    fs.symlinkSync(sourcePath, targetPath, 'junction'); // 'junction' works on both Windows and Unix
    console.log(`Created symlink from ${targetPath} to ${sourcePath}`);
    return true;
  } catch (error) {
    console.error(`Error creating symlink from ${sourcePath} to ${targetPath}:`, error.message);
    return false;
  }
}

/**
 * Install packages using npm with symlink optimization
 * @param {Object} packages - Object with package names as keys and versions as values
 * @param {Object} existingPackages - Registry of existing packages with installation paths
 */
function installPackagesWithNpm(packages, existingPackages = {}) {
  if (Object.keys(packages).length === 0) {
    console.log('No packages to install.');
    return;
  }
  
  console.log('Installing packages with npm:', Object.keys(packages));
  
  // Separate packages that can be symlinked vs those that need installation
  const packagesToSymlink = {};
  const packagesToInstall = {};
  
  for (const [pkg, version] of Object.entries(packages)) {
    // Check if this package exists elsewhere with a valid installation path
    if (existingPackages[pkg] && 
        existingPackages[pkg].versions[version] && 
        existingPackages[pkg].versions[version].installPaths &&
        existingPackages[pkg].versions[version].installPaths.length > 0) {
      
      // Use the first valid installation path
      const sourcePath = existingPackages[pkg].versions[version].installPaths[0];
      if (fs.existsSync(sourcePath)) {
        packagesToSymlink[pkg] = { version, sourcePath };
        continue;
      }
    }
    
    // If we can't symlink, we need to install
    packagesToInstall[pkg] = version;
  }
  
  // Create symlinks for packages that can be symlinked
  for (const [pkg, { version, sourcePath }] of Object.entries(packagesToSymlink)) {
    const targetPath = path.join(process.cwd(), 'node_modules', pkg);
    if (createSymlink(sourcePath, targetPath)) {
      console.log(`Symlinked ${pkg}@${version} from ${sourcePath}`);
    } else {
      // If symlink fails, add to install list
      packagesToInstall[pkg] = version;
    }
  }
  
  // Install packages that couldn't be symlinked
  if (Object.keys(packagesToInstall).length > 0) {
    try {
      const deps = Object.entries(packagesToInstall).map(([pkg, version]) => `${pkg}@${version}`);
      const depString = deps.join(' ');
      console.log(`Running: npm install ${depString}`);
      execSync(`npm install ${depString}`, { stdio: 'inherit' });
      console.log('Packages installed successfully!');
    } catch (error) {
      console.error('Error installing packages:', error.message);
    }
  } else {
    console.log('All packages were symlinked, no new installations needed!');
  }
}

/**
 * Install packages using yarn with symlink optimization
 * @param {Object} packages - Object with package names as keys and versions as values
 * @param {Object} existingPackages - Registry of existing packages with installation paths
 */
function installPackagesWithYarn(packages, existingPackages = {}) {
  if (Object.keys(packages).length === 0) {
    console.log('No packages to install.');
    return;
  }
  
  console.log('Installing packages with yarn:', Object.keys(packages));
  
  // Separate packages that can be symlinked vs those that need installation
  const packagesToSymlink = {};
  const packagesToInstall = {};
  
  for (const [pkg, version] of Object.entries(packages)) {
    // Check if this package exists elsewhere with a valid installation path
    if (existingPackages[pkg] && 
        existingPackages[pkg].versions[version] && 
        existingPackages[pkg].versions[version].installPaths &&
        existingPackages[pkg].versions[version].installPaths.length > 0) {
      
      // Use the first valid installation path
      const sourcePath = existingPackages[pkg].versions[version].installPaths[0];
      if (fs.existsSync(sourcePath)) {
        packagesToSymlink[pkg] = { version, sourcePath };
        continue;
      }
    }
    
    // If we can't symlink, we need to install
    packagesToInstall[pkg] = version;
  }
  
  // Create symlinks for packages that can be symlinked
  for (const [pkg, { version, sourcePath }] of Object.entries(packagesToSymlink)) {
    const targetPath = path.join(process.cwd(), 'node_modules', pkg);
    if (createSymlink(sourcePath, targetPath)) {
      console.log(`Symlinked ${pkg}@${version} from ${sourcePath}`);
    } else {
      // If symlink fails, add to install list
      packagesToInstall[pkg] = version;
    }
  }
  
  // Install packages that couldn't be symlinked
  if (Object.keys(packagesToInstall).length > 0) {
    try {
      const deps = Object.entries(packagesToInstall).map(([pkg, version]) => `${pkg}@${version}`);
      const depString = deps.join(' ');
      console.log(`Running: yarn add ${depString}`);
      execSync(`yarn add ${depString}`, { stdio: 'inherit' });
      console.log('Packages installed successfully!');
    } catch (error) {
      console.error('Error installing packages:', error.message);
    }
  } else {
    console.log('All packages were symlinked, no new installations needed!');
  }
}

/**
 * Detect which package manager is used in the project
 * @returns {string} 'npm' or 'yarn'
 */
function detectPackageManager() {
  // Check for yarn.lock file
  if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  }
  
  // Check for package-lock.json or npm-shrinkwrap.json
  if (fs.existsSync(path.join(process.cwd(), 'package-lock.json')) || 
      fs.existsSync(path.join(process.cwd(), 'npm-shrinkwrap.json'))) {
    return 'npm';
  }
  
  // Default to npm
  return 'npm';
}

/**
 * Install packages using the detected package manager with symlink optimization
 * @param {Object} packages - Object with package names as keys and versions as values
 * @param {Object} existingPackages - Registry of existing packages with installation paths
 */
function installPackages(packages, existingPackages = {}) {
  const packageManager = detectPackageManager();
  
  if (packageManager === 'yarn') {
    installPackagesWithYarn(packages, existingPackages);
  } else {
    installPackagesWithNpm(packages, existingPackages);
  }
}

module.exports = {
  getCurrentProjectDependencies,
  installPackages,
  detectPackageManager
};
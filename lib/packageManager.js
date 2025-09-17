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
 * Install packages using npm
 * @param {Object} packages - Object with package names as keys and versions as values
 */
function installPackagesWithNpm(packages) {
  if (Object.keys(packages).length === 0) {
    console.log('No packages to install.');
    return;
  }
  
  console.log('Installing packages with npm:', Object.keys(packages));
  
  // Separate dependencies and devDependencies
  const deps = [];
  const devDeps = [];
  
  // For simplicity, we'll install all as regular dependencies
  // In a real implementation, we'd check package.json to determine the correct type
  for (const [pkg, version] of Object.entries(packages)) {
    deps.push(`${pkg}@${version}`);
  }
  
  try {
    if (deps.length > 0) {
      const depString = deps.join(' ');
      console.log(`Running: npm install ${depString}`);
      execSync(`npm install ${depString}`, { stdio: 'inherit' });
    }
    
    console.log('Packages installed successfully!');
  } catch (error) {
    console.error('Error installing packages:', error.message);
  }
}

/**
 * Install packages using yarn
 * @param {Object} packages - Object with package names as keys and versions as values
 */
function installPackagesWithYarn(packages) {
  if (Object.keys(packages).length === 0) {
    console.log('No packages to install.');
    return;
  }
  
  console.log('Installing packages with yarn:', Object.keys(packages));
  
  // Separate dependencies and devDependencies
  const deps = [];
  const devDeps = [];
  
  // For simplicity, we'll install all as regular dependencies
  // In a real implementation, we'd check package.json to determine the correct type
  for (const [pkg, version] of Object.entries(packages)) {
    deps.push(`${pkg}@${version}`);
  }
  
  try {
    if (deps.length > 0) {
      const depString = deps.join(' ');
      console.log(`Running: yarn add ${depString}`);
      execSync(`yarn add ${depString}`, { stdio: 'inherit' });
    }
    
    console.log('Packages installed successfully!');
  } catch (error) {
    console.error('Error installing packages:', error.message);
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
 * Install packages using the detected package manager
 * @param {Object} packages - Object with package names as keys and versions as values
 */
function installPackages(packages) {
  const packageManager = detectPackageManager();
  
  if (packageManager === 'yarn') {
    installPackagesWithYarn(packages);
  } else {
    installPackagesWithNpm(packages);
  }
}

module.exports = {
  getCurrentProjectDependencies,
  installPackages,
  detectPackageManager
};
#!/usr/bin/env node

// Bluecore - Package management optimization tool
// Main entry point

const fs = require('fs');
const path = require('path');

// Import our modules
const {
  findRhezusportFiles,
  loadRhezusportRegistry,
  saveRhezusportRegistry,
  getLatestRhezusportFile,
  mergeRegistries,
  RHEZUSPORT_FILE
} = require('./lib/registryManager');

const {
  getCurrentProjectDependencies,
  installPackages,
  detectPackageManager
} = require('./lib/packageManager');

const {
  getAISuggestions,
  suggestPackagesForMissing
} = require('./lib/aiIntegration');

const {
  showHelp,
  showVersion
} = require('./lib/cli');

// Display banner with blue coloring
function showBanner() {
  console.log('\x1b[34m%s\x1b[0m', `
██████╗ ██╗               ███████╗
██╔══██╗██║     ██╔═══██  ██╔════╝
██████╔╝██║     ██║   ██║ █████╗  
██╔══██╗██║     ██║   ██║ ██╔══╝  
██████╔╝███████╗╚██████╔╝ ███████╗
╚═════╝ ╚══════╝ ╚═════╝  ╚══════╝
                                                          
Package Management Optimization Tool v1.2.0
Reuse existing packages instead of reinstalling them!
  `);
}

// Function to find existing packages on the system
async function findExistingPackages() {
  console.log('Searching for existing packages on the system...');
  
  // Find all rhezusport files using advanced multithreaded search
  const rhezusportFiles = await findRhezusportFiles();
  
  console.log(`Found ${rhezusportFiles.length} rhezusport files`);
  
  if (rhezusportFiles.length === 0) {
    console.log('No rhezusport files found. Creating a new registry.');
    return {};
  }
  
  // Load all registries
  const registries = rhezusportFiles.map(file => {
    console.log(`Loading registry from ${file}`);
    return loadRhezusportRegistry(file);
  });
  
  // Merge all registries
  const mergedRegistry = mergeRegistries(registries);
  
  return mergedRegistry;
}

// Function to update rhezusport with current project packages
function updateRhezusportWithCurrentPackages(registry) {
  const currentDeps = getCurrentProjectDependencies();
  
  for (const [pkg, version] of Object.entries(currentDeps)) {
    if (!registry[pkg]) {
      registry[pkg] = {
        versions: {}
      };
    }
    
    if (!registry[pkg].versions[version]) {
      registry[pkg].versions[version] = {
        locations: [process.cwd()],
        lastUsed: new Date().toISOString(),
        installPaths: [] // Initialize install paths array
      };
    } else {
      // Update last used timestamp
      registry[pkg].versions[version].lastUsed = new Date().toISOString();
      
      // Add current location if not already present
      if (!registry[pkg].versions[version].locations.includes(process.cwd())) {
        registry[pkg].versions[version].locations.push(process.cwd());
      }
    }
    
    // Add the actual installation path for this package
    const installPath = path.join(process.cwd(), 'node_modules', pkg);
    if (!registry[pkg].versions[version].installPaths) {
      registry[pkg].versions[version].installPaths = [];
    }
    
    if (!registry[pkg].versions[version].installPaths.includes(installPath)) {
      registry[pkg].versions[version].installPaths.push(installPath);
    }
  }
  
  return registry;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Handle help and version flags
  if (args.includes('-h') || args.includes('--help') || args.includes('help')) {
    showBanner();
    showHelp();
    return;
  }
  
  if (args.includes('-v') || args.includes('--version')) {
    showBanner();
    showVersion();
    return;
  }
  
  if (args.length === 0) {
    showBanner();
    showHelp();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'rebase':
      showBanner();
      await handleRebase();
      break;
    case 'init':
      showBanner();
      await handleInit();
      break;
    case 'suggest':
      showBanner();
      await handleSuggest();
      break;
    default:
      showBanner();
      console.log(`Unknown command: ${command}`);
      showHelp();
  }
}

// Handle rebase command
async function handleRebase() {
  console.log('Rebasing project packages...');
  
  // Find existing packages using advanced multithreaded search
  const existingPackages = await findExistingPackages();
  
  // Get current project dependencies
  const currentDeps = getCurrentProjectDependencies();
  
  console.log('Current project dependencies:', Object.keys(currentDeps));
  
  // Determine which packages are missing
  const missingPackages = {};
  
  for (const [pkg, version] of Object.entries(currentDeps)) {
    if (!existingPackages[pkg] || !existingPackages[pkg].versions[version]) {
      missingPackages[pkg] = version;
      console.log(`Package ${pkg}@${version} is missing and needs to be installed`);
    } else {
      console.log(`Package ${pkg}@${version} already exists in registry, checking for symlink possibility...`);
      
      // Check if we have installation paths for this package
      if (existingPackages[pkg].versions[version].installPaths && 
          existingPackages[pkg].versions[version].installPaths.length > 0) {
        console.log(`Package ${pkg}@${version} can be symlinked from existing installation`);
      } else {
        // If no installation path, we still need to install it
        missingPackages[pkg] = version;
        console.log(`Package ${pkg}@${version} needs to be installed (no valid installation path found)`);
      }
    }
  }
  
  // Get AI suggestions for missing packages
  if (Object.keys(missingPackages).length > 0) {
    console.log('Getting AI suggestions for missing packages...');
    const suggestions = await suggestPackagesForMissing(Object.keys(missingPackages));
    console.log('AI suggestions:', JSON.stringify(suggestions, null, 2));
  }
  
  // Install missing packages or create symlinks
  if (Object.keys(missingPackages).length > 0 || Object.keys(existingPackages).length > 0) {
    console.log('Installing missing packages or creating symlinks...');
    installPackages(missingPackages, existingPackages);
  } else {
    console.log('All required packages are already available!');
  }
  
  // Update rhezusport with current project packages
  const updatedRegistry = updateRhezusportWithCurrentPackages(existingPackages);
  
  // Save updated registry
  const rhezusportPath = path.join(process.cwd(), RHEZUSPORT_FILE);
  saveRhezusportRegistry(updatedRegistry, rhezusportPath);
  
  console.log('Rebase completed successfully!');
}

// Handle init command
async function handleInit() {
  console.log('Initializing bluecore in current project...');
  
  // Create rhezusport file in current directory
  const rhezusportPath = path.join(process.cwd(), RHEZUSPORT_FILE);
  
  if (fs.existsSync(rhezusportPath)) {
    console.log('Rhezusport file already exists in this project.');
    return;
  }
  
  // Create empty registry
  const registry = {};
  saveRhezusportRegistry(registry, rhezusportPath);
  
  console.log('Bluecore initialized successfully!');
}

// Handle suggest command
async function handleSuggest() {
  console.log('Getting AI suggestions for package updates...');
  
  // Get current project dependencies
  const currentDeps = getCurrentProjectDependencies();
  
  // Get AI suggestions
  const suggestions = await getAISuggestions(currentDeps);
  
  console.log('AI Suggestions:');
  console.log(JSON.stringify(suggestions, null, 2));
}

// Run main function
main().catch(console.error);
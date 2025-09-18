// Test script to verify symlink functionality in Bluecore

const fs = require('fs');
const path = require('path');

console.log('Testing Bluecore symlink functionality...');

// Test if symlinks are properly created and resolved
function testSymlinkFunctionality() {
  try {
    // Check if we're in a project with node_modules
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('No node_modules directory found in current project');
      return;
    }
    
    // Look for symlinked packages
    const packages = fs.readdirSync(nodeModulesPath, { withFileTypes: true });
    
    let symlinkCount = 0;
    let regularCount = 0;
    
    for (const pkg of packages) {
      const pkgPath = path.join(nodeModulesPath, pkg.name);
      const stats = fs.lstatSync(pkgPath);
      
      if (stats.isSymbolicLink()) {
        symlinkCount++;
        const target = fs.readlinkSync(pkgPath);
        console.log(`Symlink: ${pkg.name} -> ${target}`);
      } else {
        regularCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Symlinked packages: ${symlinkCount}`);
    console.log(`Regular packages: ${regularCount}`);
    console.log(`Total packages: ${packages.length}`);
    
  } catch (error) {
    console.error('Error testing symlink functionality:', error.message);
  }
}

testSymlinkFunctionality();
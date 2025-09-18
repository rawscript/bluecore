const fs = require('fs');
const path = require('path');

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Bluecore - Package management optimization tool

Usage: bluecore [command] [options]

Commands:
  init        Initialize bluecore in the current project
  rebase      Install missing packages and update registry
  suggest     Get AI suggestions for package updates
  help        Show this help message

Options:
  -h, --help  Show help information
  -v, --version  Show version information

Examples:
  bluecore init
  bluecore rebase
  bluecore suggest
  bluecore help

Description:
Bluecore helps you avoid reinstalling packages you already have on your system.
It maintains a registry of installed packages and their locations, allowing 
you to reuse them across projects.

How it works:
1. Bluecore maintains a registry file called 'rhezusport.json'
2. When you run 'bluecore rebase', it:
   - Searches for existing packages in the registry
   - Installs only missing packages
   - Updates the registry with current project packages
3. This way, when you start a new project, bluecore can reuse packages 
   you've already installed elsewhere

For more information, visit the documentation.
`);
}

/**
 * Display version information
 */
function showVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  console.log(`Bluecore v${packageJson.version}`);
}

module.exports = {
  showHelp,
  showVersion
};
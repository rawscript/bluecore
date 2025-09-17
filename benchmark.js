// Benchmark script to compare search performance

const fs = require('fs');
const path = require('path');
const os = require('os');

// Original sequential search function (for comparison)
function sequentialSearch(dir, results = []) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      // Skip hidden directories and node_modules
      if (file.startsWith('.') || file === 'node_modules') {
        continue;
      }
      
      const filePath = path.join(dir, file);
      
      try {
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          // Recursively search subdirectories
          sequentialSearch(filePath, results);
        } else if (file === 'rhezusport.json') {
          // Found a rhezusport file
          results.push(filePath);
        }
      } catch (error) {
        // Continue searching even if we can't access a file/directory
        continue;
      }
    }
  } catch (error) {
    // Continue searching even if we can't access a directory
  }
  
  return results;
}

// New multithreaded search function
function multithreadedSearch(dir, results, callback) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
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
        multithreadedSearch(filePath, results, done);
      } else if (file.name === 'rhezusport.json') {
        // Found a rhezusport file
        results.push(filePath);
        done();
      } else {
        done();
      }
    }
  });
}

function advancedSearch(directories) {
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
      multithreadedSearch(dir, results, done);
    }
  });
}

async function runBenchmark() {
  console.log('Running benchmark comparison...');
  
  // Define search directories
  const searchDirectories = [
    os.homedir(),
    path.join(os.homedir(), 'Documents'),
    path.join(os.homedir(), 'Projects')
  ].filter(dir => {
    try {
      return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    } catch (error) {
      return false;
    }
  });
  
  console.log(`Testing with ${searchDirectories.length} directories`);
  
  // Test sequential search
  console.log('Testing sequential search...');
  const startTime1 = Date.now();
  const results1 = [];
  
  for (const dir of searchDirectories) {
    sequentialSearch(dir, results1);
  }
  
  const endTime1 = Date.now();
  console.log(`Sequential search found ${results1.length} files in ${endTime1 - startTime1}ms`);
  
  // Test multithreaded search
  console.log('Testing multithreaded search...');
  const startTime2 = Date.now();
  const results2 = await advancedSearch(searchDirectories);
  const endTime2 = Date.now();
  
  console.log(`Multithreaded search found ${results2.length} files in ${endTime2 - startTime2}ms`);
  
  // Calculate improvement
  const improvement = ((endTime1 - startTime1) - (endTime2 - startTime2)) / (endTime1 - startTime1) * 100;
  console.log(`Performance improvement: ${improvement.toFixed(2)}%`);
}

// Run the benchmark
runBenchmark().catch(console.error);
// Performance test for the enhanced registry manager

const { findRhezusportFiles } = require('./lib/registryManager');

async function runPerformanceTest() {
  console.log('Starting performance test for advanced multithreaded search...');
  
  // Measure search time
  const startTime = Date.now();
  
  try {
    const files = await findRhezusportFiles();
    const endTime = Date.now();
    
    console.log(`Search completed in ${endTime - startTime} milliseconds`);
    console.log(`Found ${files.length} rhezusport files`);
    
    if (files.length > 0) {
      console.log('Sample of found files:');
      files.slice(0, 5).forEach(file => console.log(`  - ${file}`));
    }
    
    console.log('Performance test completed successfully!');
  } catch (error) {
    console.error('Error during performance test:', error.message);
  }
}

// Run the performance test
runPerformanceTest();
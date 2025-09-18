const fs = require('fs');
const path = require('path');

// Test the package search worker directly
const { Worker } = require('worker_threads');

console.log('Testing package search worker...');

// Create a worker to search in a specific directory
const worker = new Worker(path.join(__dirname, 'lib', 'packageSearchWorker.js'), {
  workerData: { 
    directory: process.cwd(),
    packages: ['chalk', '@google/generative-ai']
  }
});

worker.on('message', (data) => {
  console.log('Worker results:', data);
  if (data.results) {
    console.log('Found packages:');
    for (const [pkg, paths] of Object.entries(data.results)) {
      console.log(`  ${pkg}: ${paths.length} installation(s)`);
      paths.forEach(p => console.log(`    - ${p}`));
    }
  }
});

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

worker.on('exit', (code) => {
  console.log(`Worker exited with code ${code}`);
});
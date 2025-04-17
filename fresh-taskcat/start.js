const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Start the Expo server
console.log('Starting Expo development server for Task Cat...');
const expo = spawn('npx', ['expo', 'start', '--web', '--host', '0.0.0.0'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

expo.on('error', (error) => {
  console.error('Failed to start Expo server:', error);
});

expo.on('close', (code) => {
  console.log(`Expo server exited with code ${code}`);
});
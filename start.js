const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Start the Expo server
console.log('Starting Expo development server for Task Cat...');
const expo = spawn('npx', ['expo', 'start', '--web', '--port', '5000'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    CI: '1', // For non-interactive mode
    EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
    REACT_NATIVE_PACKAGER_HOSTNAME: '0.0.0.0'
  }
});

expo.on('error', (error) => {
  console.error('Failed to start Expo server:', error);
});

expo.on('close', (code) => {
  console.log(`Expo server exited with code ${code}`);
});
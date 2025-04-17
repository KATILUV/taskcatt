// Script to start Expo with custom configuration for iOS, Android, and web (for demonstration)
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Start Expo with support for web preview
const expoProcess = spawn('expo', ['start', '--port', '5000', '--web'], {
  stdio: 'inherit',
  shell: true
});

console.log('Starting Expo development server for iOS, Android, and web preview...');

expoProcess.on('error', (error) => {
  console.error('Failed to start Expo:', error);
});

expoProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Expo process exited with code ${code}`);
  }
});
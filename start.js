// Script to start Expo with custom configuration for iOS and Android only
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Start Expo for mobile platforms only
const expoProcess = spawn('expo', ['start', '--port', '5000'], {
  stdio: 'inherit',
  shell: true
});

console.log('Starting Expo development server for iOS and Android...');

expoProcess.on('error', (error) => {
  console.error('Failed to start Expo:', error);
});

expoProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Expo process exited with code ${code}`);
  }
});
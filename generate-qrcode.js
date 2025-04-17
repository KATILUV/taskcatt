const qrcode = require('qrcode');
const fs = require('fs');

// The Expo URL from the logs
const expoUrl = 'exp://172.31.128.71:5000';

// Generate QR code as a data URL
qrcode.toDataURL(expoUrl, function (err, url) {
  if (err) {
    console.error('Error generating QR code:', err);
    return;
  }
  
  // Extract the base64 data
  const base64Data = url.replace(/^data:image\/png;base64,/, "");
  
  // Save the QR code as a PNG file
  fs.writeFileSync('expo-qrcode.png', base64Data, 'base64');
  console.log('QR code generated and saved as expo-qrcode.png');
  console.log('You can now view and download this file from the Replit Files panel.');
});
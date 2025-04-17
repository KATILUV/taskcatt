const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const { join } = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static('public'));

// Generate QR code for easy mobile connection
const generateQRCode = async (url) => {
  try {
    return await QRCode.toString(url, { type: 'terminal' });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return 'QR Code generation failed.';
  }
};

// Get the server's IP address
const getIPAddress = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

// Set up a basic server with minimalist HTML
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Cat Web</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        header {
          background-color: #6200ee;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .button {
          background-color: #6200ee;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Task Cat</h1>
      </header>
      <main>
        <div class="card">
          <h2>Home Screen</h2>
          <p>Welcome to Task Cat! A simple and playful task management app.</p>
          <button class="button" onclick="navigateToRoutine()">Go to Routine</button>
        </div>
      </main>
      <script>
        function navigateToRoutine() {
          window.location.href = '/routine';
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

app.get('/routine', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Task Cat Web - Routine</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background-color: #f5f5f5;
        }
        header {
          background-color: #6200ee;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .button {
          background-color: #6200ee;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 1rem;
        }
        .card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Task Cat - Routines</h1>
      </header>
      <main>
        <div class="card">
          <h2>Routine Screen</h2>
          <p>This is where you manage your recurring tasks and routines.</p>
          <button class="button" onclick="navigateToHome()">Go back to Home</button>
        </div>
      </main>
      <script>
        function navigateToHome() {
          window.location.href = '/';
        }
      </script>
    </body>
    </html>
  `;
  res.send(html);
});

// Start the server
app.listen(PORT, async () => {
  const ip = getIPAddress();
  const url = `http://${ip}:${PORT}`;
  const qrCode = await generateQRCode(url);
  
  console.log(`\nTask Cat Web running at: ${url}`);
  console.log(`\nScan QR code to open on mobile:`)
  console.log(qrCode);
  console.log('\nPress Ctrl+C to stop the server');
});
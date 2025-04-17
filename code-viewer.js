const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 5000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Create views directory if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'views'))) {
  fs.mkdirSync(path.join(__dirname, 'views'));
}

// Create the EJS template
const indexTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Cat App - Code Viewer</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #0066cc;
    }
    h2 {
      color: #0066cc;
      margin-top: 30px;
    }
    .file-tree {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e1e4e8;
      font-family: monospace;
      margin-bottom: 20px;
    }
    .file-tree pre {
      margin: 0;
    }
    .code-section {
      margin-bottom: 30px;
    }
    .code-header {
      background-color: #f1f1f1;
      padding: 10px;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border: 1px solid #ddd;
      font-weight: bold;
    }
    .code-content {
      background-color: #f8f9fa;
      padding: 15px;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
      border: 1px solid #ddd;
      border-top: none;
      overflow-x: auto;
      font-family: monospace;
    }
    .app-summary {
      background-color: #e9f7fe;
      padding: 15px;
      border-radius: 4px;
      border-left: 4px solid #0066cc;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <h1>Task Cat App - Mobile React Native Project</h1>
  
  <div class="app-summary">
    <h3>Project Overview</h3>
    <p>A TypeScript-based mobile app using Expo, React Navigation, and React Native.</p>
    <p>Features:</p>
    <ul>
      <li>TypeScript with strict mode</li>
      <li>React Navigation for screen management</li>
      <li>Home and Routine screens with navigation</li>
      <li>Minimal, clean project structure</li>
    </ul>
  </div>

  <h2>Project Structure</h2>
  <div class="file-tree">
    <pre><%= fileTree %></pre>
  </div>

  <h2>App Entry Point</h2>
  <div class="code-section">
    <div class="code-header">App.tsx</div>
    <div class="code-content">
      <pre><%= appCode %></pre>
    </div>
  </div>

  <h2>Home Screen</h2>
  <div class="code-section">
    <div class="code-header">screens/HomeScreen.tsx</div>
    <div class="code-content">
      <pre><%= homeScreenCode %></pre>
    </div>
  </div>

  <h2>Routine Screen</h2>
  <div class="code-section">
    <div class="code-header">screens/RoutineScreen.tsx</div>
    <div class="code-content">
      <pre><%= routineScreenCode %></pre>
    </div>
  </div>

  <h2>App Configuration</h2>
  <div class="code-section">
    <div class="code-header">app.json</div>
    <div class="code-content">
      <pre><%= appJsonCode %></pre>
    </div>
  </div>
</body>
</html>`;

// Write template to disk
fs.writeFileSync(path.join(__dirname, 'views', 'index.ejs'), indexTemplate);

// Helper function to generate file tree
function generateFileTree(dir, prefix = '') {
  let tree = '';
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach((file, index) => {
    const isLast = index === files.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const newPrefix = isLast ? '    ' : '│   ';
    
    if (file.name !== 'node_modules' && file.name !== '.git' && !file.name.startsWith('.') && file.name !== 'views' && file.name !== 'code-viewer.js') {
      tree += prefix + connector + file.name + '\n';
      
      if (file.isDirectory()) {
        tree += generateFileTree(path.join(dir, file.name), prefix + newPrefix);
      }
    }
  });
  
  return tree;
}

// Helper function to read file content
function safeReadFileSync(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return `Error reading file: ${err.message}`;
  }
}

// Route to display the code
app.get('/', (req, res) => {
  const fileTree = generateFileTree(__dirname);
  const appCode = safeReadFileSync(path.join(__dirname, 'App.tsx'));
  const homeScreenCode = safeReadFileSync(path.join(__dirname, 'screens', 'HomeScreen.tsx'));
  const routineScreenCode = safeReadFileSync(path.join(__dirname, 'screens', 'RoutineScreen.tsx'));
  const appJsonCode = safeReadFileSync(path.join(__dirname, 'app.json'));
  
  res.render('index', { 
    fileTree, 
    appCode, 
    homeScreenCode, 
    routineScreenCode, 
    appJsonCode
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Code viewer server running at http://localhost:${port}`);
});
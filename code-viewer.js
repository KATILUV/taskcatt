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
    .structure-section, .tech-section, .design-section {
      background-color: #fff;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e1e4e8;
      margin-bottom: 20px;
    }
    .structure-section h3, .tech-section h3, .design-section h3 {
      color: #0066cc;
      margin-top: 15px;
      margin-bottom: 10px;
    }
    .tech-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .tech-table th, .tech-table td {
      border: 1px solid #e1e4e8;
      padding: 8px 12px;
      text-align: left;
    }
    .tech-table th {
      background-color: #f1f8ff;
    }
    .color-palette {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 15px;
    }
    .color-item {
      width: 150px;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
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
      <li>Task management with drag-and-drop reordering</li>
      <li>Task categorization with filtering</li>
      <li>Progress tracking and statistics</li>
    </ul>
  </div>

  <h2>App Structure</h2>
  <div class="structure-section">
    <h3>Navigation Structure</h3>
    <ul>
      <li><strong>HomeScreen</strong> - Dashboard with progress statistics and category breakdown</li>
      <li><strong>RoutineScreen</strong> - Task management interface with filtering and drag-and-drop</li>
    </ul>
    
    <h3>Components</h3>
    <ul>
      <li><strong>TaskItem</strong> - Renders an individual task with category badge and completion toggle</li>
      <li><strong>TaskInput</strong> - Form for adding new tasks with category selection</li>
      <li><strong>CategorySelector</strong> - Interactive category filter/selector with color-coded badges</li>
      <li><strong>ProgressBar</strong> - Visual representation of task completion progress</li>
    </ul>
    
    <h3>Data Flow</h3>
    <p>The app uses AsyncStorage for persisting tasks between sessions. Tasks are loaded on app startup and synchronized whenever changes occur. The data flow follows a unidirectional pattern where:</p>
    <ol>
      <li>User actions trigger state updates</li>
      <li>State changes are persisted to storage</li>
      <li>UI updates reflect the current state</li>
    </ol>
  </div>

  <h2>Tech Stack</h2>
  <div class="tech-section">
    <table class="tech-table">
      <tr>
        <th>Technology</th>
        <th>Purpose</th>
      </tr>
      <tr>
        <td>React Native</td>
        <td>Cross-platform mobile UI framework</td>
      </tr>
      <tr>
        <td>Expo</td>
        <td>Development platform and toolchain</td>
      </tr>
      <tr>
        <td>TypeScript</td>
        <td>Type-safe JavaScript development</td>
      </tr>
      <tr>
        <td>React Navigation</td>
        <td>Screen navigation and routing</td>
      </tr>
      <tr>
        <td>Async Storage</td>
        <td>Persistent data storage</td>
      </tr>
      <tr>
        <td>React Native Draggable FlatList</td>
        <td>Drag-and-drop functionality for task reordering</td>
      </tr>
    </table>
  </div>

  <h2>UI Design System</h2>
  <div class="design-section">
    <h3>Color Palette</h3>
    <div class="color-palette">
      <div class="color-item" style="background-color: #0066cc; color: white;">Primary: #0066cc</div>
      <div class="color-item" style="background-color: #4CAF50; color: white;">Health: #4CAF50</div>
      <div class="color-item" style="background-color: #2196F3; color: white;">Work: #2196F3</div>
      <div class="color-item" style="background-color: #9C27B0; color: white;">Personal: #9C27B0</div>
      <div class="color-item" style="background-color: #757575; color: white;">Other: #757575</div>
      <div class="color-item" style="background-color: #f8f9fa; color: black;">Background: #f8f9fa</div>
      <div class="color-item" style="background-color: white; color: black; border: 1px solid #ddd;">Surface: #ffffff</div>
      <div class="color-item" style="background-color: #333333; color: white;">Text Primary: #333333</div>
      <div class="color-item" style="background-color: #666666; color: white;">Text Secondary: #666666</div>
    </div>
    
    <h3>Typography</h3>
    <p>The app uses the system default font stack with carefully selected size hierarchy:</p>
    <ul>
      <li><strong>Headers:</strong> 20-28px, bold</li>
      <li><strong>Body:</strong> 14-16px, regular</li>
      <li><strong>Labels:</strong> 12-14px, regular or medium</li>
    </ul>
    
    <h3>Component Styling</h3>
    <ul>
      <li><strong>Cards:</strong> White background, rounded corners (12px), subtle elevation</li>
      <li><strong>Buttons:</strong> Blue background (#0066cc), rounded corners (8px), bold white text</li>
      <li><strong>Input Fields:</strong> Light background, subtle border, adequate padding</li>
      <li><strong>Category Badges:</strong> Color-coded, small indicators with rounded shape</li>
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
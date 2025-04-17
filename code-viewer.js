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

// Create assets directory for screenshots if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Create placeholder screenshots that represent what the app would look like
function createPlaceholderScreenshots() {
  // Create placeholder images directory
  const imagesDir = path.join(assetsDir, 'screenshots');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }

  // Create SVG placeholders
  const homeScreenSVG = `<svg width="360" height="640" xmlns="http://www.w3.org/2000/svg">
    <rect width="360" height="640" fill="#f8f9fa"/>
    <rect x="0" y="0" width="360" height="70" fill="#0066cc"/>
    <text x="20" y="40" font-family="Inter, Arial" font-size="24" fill="white" font-weight="600">Task Cat</text>
    <text x="20" y="60" font-family="Inter, Arial" font-size="14" fill="rgba(255,255,255,0.8)">Stay purr-fectly organized!</text>
    
    <!-- Progress Card -->
    <rect x="20" y="90" width="320" height="120" rx="16" ry="16" fill="white" stroke="#eee" stroke-width="1" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"/>
    <text x="40" y="120" font-family="Inter, Arial" font-size="16" font-weight="600" fill="#333">Your Progress</text>
    <text x="280" y="120" font-family="Inter, Arial" font-size="16" font-weight="600" fill="#0066cc">75%</text>
    <rect x="40" y="140" width="260" height="16" rx="8" ry="8" fill="#eee"/>
    <rect x="40" y="140" width="195" height="16" rx="8" ry="8" fill="#0066cc"/>
    <text x="160" y="180" font-family="Inter, Arial" font-size="14" fill="#666" text-anchor="middle">Almost there! Keep going!</text>
    
    <!-- Stats Card -->
    <rect x="20" y="230" width="320" height="100" rx="16" ry="16" fill="white" stroke="#eee" stroke-width="1" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"/>
    <rect x="40" y="250" width="80" height="60" rx="8" ry="8" fill="rgba(0,102,204,0.1)"/>
    <text x="80" y="280" font-family="Inter, Arial" font-size="20" font-weight="600" fill="#0066cc" text-anchor="middle">16</text>
    <text x="80" y="300" font-family="Inter, Arial" font-size="12" fill="#666" text-anchor="middle">Total Tasks</text>
    
    <rect x="140" y="250" width="80" height="60" rx="8" ry="8" fill="rgba(76,175,80,0.1)"/>
    <text x="180" y="280" font-family="Inter, Arial" font-size="20" font-weight="600" fill="#4CAF50" text-anchor="middle">12</text>
    <text x="180" y="300" font-family="Inter, Arial" font-size="12" fill="#666" text-anchor="middle">Completed</text>
    
    <rect x="240" y="250" width="80" height="60" rx="8" ry="8" fill="rgba(229,57,53,0.1)"/>
    <text x="280" y="280" font-family="Inter, Arial" font-size="20" font-weight="600" fill="#E53935" text-anchor="middle">4</text>
    <text x="280" y="300" font-family="Inter, Arial" font-size="12" fill="#666" text-anchor="middle">Remaining</text>
    
    <!-- Categories Card -->
    <rect x="20" y="350" width="320" height="140" rx="16" ry="16" fill="white" stroke="#eee" stroke-width="1" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))"/>
    <text x="40" y="380" font-family="Inter, Arial" font-size="16" font-weight="600" fill="#333">Category Breakdown</text>
    
    <rect x="40" y="400" width="280" height="30" rx="8" ry="8" fill="rgba(76,175,80,0.1)"/>
    <circle cx="55" cy="415" r="6" fill="#4CAF50"/>
    <text x="70" y="419" font-family="Inter, Arial" font-size="14" fill="#333" font-weight="500">Health</text>
    <text x="300" y="419" font-family="Inter, Arial" font-size="14" fill="#666" text-anchor="end">5</text>
    
    <rect x="40" y="440" width="280" height="30" rx="8" ry="8" fill="rgba(33,150,243,0.1)"/>
    <circle cx="55" cy="455" r="6" fill="#2196F3"/>
    <text x="70" y="459" font-family="Inter, Arial" font-size="14" fill="#333" font-weight="500">Work</text>
    <text x="300" y="459" font-family="Inter, Arial" font-size="14" fill="#666" text-anchor="end">7</text>
    
    <!-- Floating Action Button -->
    <circle cx="320" cy="560" r="30" fill="#0066cc" filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.2))"/>
    <rect x="310" y="550" width="20" height="4" fill="white" rx="2" ry="2"/>
    <rect x="310" y="557" width="20" height="4" fill="white" rx="2" ry="2"/>
    <rect x="310" y="564" width="20" height="4" fill="white" rx="2" ry="2"/>
  </svg>`;

  const routineScreenSVG = `<svg width="360" height="640" xmlns="http://www.w3.org/2000/svg">
    <rect width="360" height="640" fill="#f8f9fa"/>
    <rect x="0" y="0" width="360" height="70" fill="#0066cc"/>
    <text x="20" y="40" font-family="Inter, Arial" font-size="24" font-weight="600" fill="white">My Routines</text>
    <rect x="300" y="25" width="40" height="25" rx="12" ry="12" fill="rgba(255,255,255,0.2)"/>
    <text x="320" y="42" font-family="Inter, Arial" font-size="12" font-weight="500" fill="white" text-anchor="middle">Home</text>
    
    <!-- Filter Section -->
    <rect x="0" y="70" width="360" height="140" fill="white" filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.1))"/>
    <text x="20" y="95" font-family="Inter, Arial" font-size="14" font-weight="600" fill="#333">Categories</text>
    
    <rect x="20" y="105" width="100" height="30" rx="15" ry="15" fill="#f5f5f5" stroke="#0066cc" stroke-width="1.5"/>
    <text x="70" y="125" font-family="Inter, Arial" font-size="12" font-weight="500" fill="#333" text-anchor="middle">All Categories</text>
    
    <rect x="130" y="105" width="70" height="30" rx="15" ry="15" fill="white" stroke="#4CAF50" stroke-width="1"/>
    <circle cx="145" cy="120" r="4" fill="#4CAF50"/>
    <text x="165" y="125" font-family="Inter, Arial" font-size="12" fill="#666">Health</text>
    
    <rect x="210" y="105" width="70" height="30" rx="15" ry="15" fill="white" stroke="#2196F3" stroke-width="1"/>
    <circle cx="225" cy="120" r="4" fill="#2196F3"/>
    <text x="245" y="125" font-family="Inter, Arial" font-size="12" fill="#666">Work</text>
    
    <text x="20" y="165" font-family="Inter, Arial" font-size="14" font-weight="600" fill="#333">Priority</text>
    
    <rect x="20" y="175" width="100" height="30" rx="15" ry="15" fill="#f5f5f5" stroke="#0066cc" stroke-width="1.5"/>
    <text x="70" y="195" font-family="Inter, Arial" font-size="12" font-weight="500" fill="#333" text-anchor="middle">All Priorities</text>
    
    <rect x="130" y="175" width="70" height="30" rx="15" ry="15" fill="white" stroke="#E53935" stroke-width="1"/>
    <circle cx="145" cy="190" r="4" fill="#E53935"/>
    <text x="165" y="195" font-family="Inter, Arial" font-size="12" fill="#666">High</text>
    
    <rect x="210" y="175" width="70" height="30" rx="15" ry="15" fill="white" stroke="#FB8C00" stroke-width="1"/>
    <circle cx="225" cy="190" r="4" fill="#FB8C00"/>
    <text x="245" y="195" font-family="Inter, Arial" font-size="12" fill="#666">Medium</text>
    
    <!-- Task Cards -->
    <rect x="20" y="230" width="320" height="100" rx="16" ry="16" fill="white" stroke="#eee" stroke-width="1" filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.1))"/>
    <circle cx="40" cy="250" r="10" fill="white" stroke="#0066cc" stroke-width="2"/>
    <text x="70" y="255" font-family="Inter, Arial" font-size="16" font-weight="500" fill="#333">Finish project proposal</text>
    <circle cx="310" cy="250" r="10" fill="#ffeeee"/>
    <text x="310" y="254" font-family="Inter, Arial" font-size="14" fill="#f44336" text-anchor="middle">×</text>
    
    <rect x="40" y="280" width="60" height="20" rx="10" ry="10" fill="rgba(229,57,53,0.2)"/>
    <circle cx="50" cy="290" r="4" fill="#E53935"/>
    <text x="70" y="293" font-family="Inter, Arial" font-size="10" font-weight="500" fill="#E53935">High</text>
    
    <rect x="110" y="280" width="70" height="20" rx="10" ry="10" fill="rgba(33,150,243,0.2)"/>
    <text x="145" y="293" font-family="Inter, Arial" font-size="10" font-weight="500" fill="#2196F3">Work</text>
    
    <text x="40" y="315" font-family="Inter, Arial" font-size="12" fill="#666">📅 Due: Apr 20</text>
    <text x="280" y="315" font-family="Inter, Arial" font-size="12" fill="#0066cc">🔄 Daily</text>
    
    <rect x="20" y="350" width="320" height="100" rx="16" ry="16" fill="white" stroke="#eee" stroke-width="1" filter="drop-shadow(0px 1px 3px rgba(0,0,0,0.1))"/>
    <circle cx="40" cy="370" r="10" fill="white" stroke="#0066cc" stroke-width="2"/>
    <text x="70" y="375" font-family="Inter, Arial" font-size="16" font-weight="500" fill="#333">Morning exercise routine</text>
    <circle cx="310" cy="370" r="10" fill="#ffeeee"/>
    <text x="310" y="374" font-family="Inter, Arial" font-size="14" fill="#f44336" text-anchor="middle">×</text>
    
    <rect x="40" y="400" width="70" height="20" rx="10" ry="10" fill="rgba(251,140,0,0.2)"/>
    <circle cx="50" cy="410" r="4" fill="#FB8C00"/>
    <text x="70" y="413" font-family="Inter, Arial" font-size="10" font-weight="500" fill="#FB8C00">Medium</text>
    
    <rect x="120" y="400" width="70" height="20" rx="10" ry="10" fill="rgba(76,175,80,0.2)"/>
    <text x="155" y="413" font-family="Inter, Arial" font-size="10" font-weight="500" fill="#4CAF50">Health</text>
    
    <text x="40" y="435" font-family="Inter, Arial" font-size="12" fill="#666">📅 Due: Apr 17</text>
    <text x="280" y="435" font-family="Inter, Arial" font-size="12" fill="#0066cc">🔄 Weekly</text>
    
    <!-- Floating Action Button -->
    <circle cx="320" cy="560" r="30" fill="#0066cc" filter="drop-shadow(0px 3px 5px rgba(0,0,0,0.2))"/>
    <text x="320" y="568" font-family="Inter, Arial" font-size="24" font-weight="bold" fill="white" text-anchor="middle">+</text>
  </svg>`;

  const taskCardDetailSVG = `<svg width="360" height="640" xmlns="http://www.w3.org/2000/svg">
    <rect width="360" height="640" fill="#f8f9fa"/>
    
    <!-- Bottom Sheet Background -->
    <rect x="0" y="0" width="360" height="640" fill="rgba(0,0,0,0.5)"/>
    
    <!-- Task Card in Bottom Sheet -->
    <rect x="0" y="180" width="360" height="460" rx="16" ry="16" fill="white" stroke="#eee" stroke-width="1" filter="drop-shadow(0px -2px 10px rgba(0,0,0,0.2))"/>
    
    <!-- Bottom Sheet Header -->
    <rect x="0" y="180" width="360" height="50" rx="16" ry="16" fill="white"/>
    <line x1="150" y1="195" x2="210" y2="195" stroke="#999" stroke-width="4" stroke-linecap="round"/>
    <text x="50" y="215" font-family="Inter, Arial" font-size="16" font-weight="600" fill="#333">Task Details</text>
    <circle cx="320" cy="205" r="15" fill="#ffeeee"/>
    <text x="320" y="210" font-family="Inter, Arial" font-size="16" fill="#f44336" text-anchor="middle">×</text>
    
    <!-- Task Title -->
    <circle cx="50" cy="255" r="15" fill="white" stroke="#0066cc" stroke-width="2"/>
    <text x="80" y="260" font-family="Inter, Arial" font-size="18" font-weight="500" fill="#333">Complete slide deck</text>
    
    <!-- Card Content -->
    <rect x="50" y="285" width="90" height="30" rx="15" ry="15" fill="rgba(229,57,53,0.2)"/>
    <circle cx="65" cy="300" r="6" fill="#E53935"/>
    <text x="95" y="305" font-family="Inter, Arial" font-size="14" font-weight="500" fill="#E53935">High</text>
    
    <rect x="150" y="285" width="95" height="30" rx="15" ry="15" fill="rgba(33,150,243,0.2)"/>
    <text x="197" y="305" font-family="Inter, Arial" font-size="14" font-weight="500" fill="#2196F3">Work</text>
    
    <!-- Card Footer -->
    <text x="50" y="345" font-family="Inter, Arial" font-size="14" fill="#666">📅 Due: Apr 19, 2025</text>
    <text x="50" y="375" font-family="Inter, Arial" font-size="14" fill="#0066cc">🔄 Weekly</text>
    <text x="50" y="405" font-family="Inter, Arial" font-size="14" fill="#FB8C00">🔔 Reminder set</text>
    
    <!-- Recurrence Settings -->
    <rect x="40" y="435" width="280" height="80" rx="8" ry="8" fill="rgba(0,102,204,0.05)" stroke="#e1e4e8" stroke-width="1"/>
    <text x="60" y="455" font-family="Inter, Arial" font-size="14" font-weight="600" fill="#333">Recurrence Settings</text>
    <text x="60" y="480" font-family="Inter, Arial" font-size="13" fill="#666">Pattern: Weekly (Mon, Wed, Fri)</text>
    <text x="60" y="500" font-family="Inter, Arial" font-size="13" fill="#666">Until: June 30, 2025 (10 occurrences)</text>
    
    <!-- Reminder Settings -->
    <rect x="40" y="530" width="280" height="80" rx="8" ry="8" fill="rgba(251,140,0,0.05)" stroke="#e1e4e8" stroke-width="1"/>
    <text x="60" y="550" font-family="Inter, Arial" font-size="14" font-weight="600" fill="#333">Reminder Settings</text>
    <text x="60" y="575" font-family="Inter, Arial" font-size="13" fill="#666">Time: 9:00 AM on due date</text>
    <text x="60" y="595" font-family="Inter, Arial" font-size="13" fill="#666">Method: Push notification</text>
  </svg>`;

  fs.writeFileSync(path.join(imagesDir, 'home-screen.svg'), homeScreenSVG);
  fs.writeFileSync(path.join(imagesDir, 'routine-screen.svg'), routineScreenSVG);
  fs.writeFileSync(path.join(imagesDir, 'task-card-detail.svg'), taskCardDetailSVG);
}

// Create placeholder screenshots
createPlaceholderScreenshots();

// Create the EJS template with screenshots
const indexTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Cat App - Code Viewer</title>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 20px;
      color: #333;
      background-color: #f5f7f9;
    }
    h1 {
      color: #0066cc;
      border-bottom: 2px solid #e1e4e8;
      padding-bottom: 10px;
    }
    h2 {
      color: #0066cc;
      margin-top: 40px;
    }
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .file-tree {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e1e4e8;
      font-family: monospace;
      margin-bottom: 20px;
    }
    .file-tree pre {
      margin: 0;
    }
    .code-section {
      margin-bottom: 30px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .code-header {
      background-color: #0066cc;
      color: white;
      padding: 10px 15px;
      font-weight: bold;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .code-content {
      background-color: #f8f9fa;
      padding: 15px;
      border: 1px solid #ddd;
      border-top: none;
      overflow-x: auto;
      font-family: monospace;
      max-height: 400px;
      overflow-y: auto;
    }
    .app-summary {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #0066cc;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .section-container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .section-container h3 {
      color: #0066cc;
      margin-top: 15px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e1e4e8;
      padding-bottom: 5px;
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
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .screenshots-section {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-top: 20px;
    }
    .screenshot-item {
      flex: 1;
      min-width: 300px;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .screenshot-header {
      background-color: #0066cc;
      color: white;
      padding: 10px 15px;
      font-weight: bold;
    }
    .screenshot-img {
      padding: 15px;
      display: flex;
      justify-content: center;
    }
    .screenshot-img img {
      max-width: 100%;
      height: auto;
      max-height: 600px;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    .screenshot-desc {
      padding: 0 15px 15px;
      color: #666;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }
    @media (max-width: 768px) {
      .grid-2 {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="content-container">
    <h1>Task Cat App - Mobile Task Management Application</h1>
    
    <div class="app-summary">
      <h3>Project Overview</h3>
      <p>A TypeScript-based mobile app for task management, built with Expo, React Navigation, and React Native.</p>
      <p>Features:</p>
      <ul>
        <li>TypeScript with strict mode for enhanced code reliability</li>
        <li>React Navigation for screen management with Home and Routine screens</li>
        <li>Drag-and-drop task reordering with smooth animations</li>
        <li>Task categorization with color-coded filtering system</li>
        <li>Priority levels (High, Medium, Low) with visual indicators</li>
        <li>Progress tracking and statistics visualization</li>
        <li>Recurring task functionality with daily, weekly, and monthly patterns</li>
        <li>Clean card-based UI with the Inter font family for modern typography</li>
      </ul>
    </div>
    
    <h2>App Screenshots</h2>
    <div class="screenshots-section">
      <div class="screenshot-item">
        <div class="screenshot-header">Home Screen</div>
        <div class="screenshot-img">
          <img src="/assets/screenshots/home-screen.svg" alt="Home Screen" />
        </div>
        <div class="screenshot-desc">
          <p>The home screen displays task progress, statistics, and category breakdown. The card-based design showcases the clean, minimalist aesthetic with plenty of whitespace.</p>
        </div>
      </div>
      
      <div class="screenshot-item">
        <div class="screenshot-header">Task Management Screen</div>
        <div class="screenshot-img">
          <img src="/assets/screenshots/routine-screen.svg" alt="Routine Screen" />
        </div>
        <div class="screenshot-desc">
          <p>The task management screen shows the filterable task list with draggable cards. Each task has category badges, priority indicators, and other metadata.</p>
        </div>
      </div>
      
      <div class="screenshot-item">
        <div class="screenshot-header">Task Card Detail</div>
        <div class="screenshot-img">
          <img src="/assets/screenshots/task-card-detail.svg" alt="Task Card Detail" />
        </div>
        <div class="screenshot-desc">
          <p>Close-up of a task card showing the detailed design with the new card-based layout. Notice the clean typography using the Inter font family, color-coded badges, and intuitive layout.</p>
        </div>
      </div>
    </div>
    
    <h2>App Structure</h2>
    <div class="section-container">
      <div class="grid-2">
        <div>
          <h3>Navigation Structure</h3>
          <ul>
            <li><strong>HomeScreen</strong> - Dashboard with progress statistics and category breakdown</li>
            <li><strong>RoutineScreen</strong> - Task management interface with filtering and drag-and-drop</li>
          </ul>
          
          <h3>Components</h3>
          <ul>
            <li><strong>TaskItem</strong> - Card-based task display with completion toggle</li>
            <li><strong>TaskInput</strong> - Form for adding new tasks with category selection</li>
            <li><strong>CategorySelector</strong> - Interactive category filter with color-coded badges</li>
            <li><strong>PrioritySelector</strong> - Priority level selector (High, Medium, Low)</li>
            <li><strong>ProgressBar</strong> - Visual representation of task completion progress</li>
            <li><strong>RecurrenceSelector</strong> - Settings for recurring task patterns</li>
            <li><strong>ReminderSelector</strong> - Configure task reminders and notifications</li>
          </ul>
        </div>
        
        <div>
          <h3>Services</h3>
          <ul>
            <li><strong>StorageService</strong> - AsyncStorage handling for task persistence</li>
            <li><strong>RecurrenceService</strong> - Logic for recurring task patterns</li>
            <li><strong>ReminderService</strong> - Task notification and reminder functionality</li>
          </ul>
          
          <h3>Data Flow</h3>
          <p>The app uses a unidirectional data flow pattern:</p>
          <ol>
            <li>User actions trigger state updates in screen components</li>
            <li>State changes are persisted to AsyncStorage via services</li>
            <li>UI updates reflect the current application state</li>
            <li>Recurring tasks generate instances based on patterns</li>
            <li>Task completion status is tracked and visualized</li>
          </ol>
        </div>
      </div>
    </div>

    <h2>UI Design System</h2>
    <div class="section-container">
      <h3>Typography System</h3>
      <p>The app uses the Inter font family with a consistent typography scale:</p>
      <ul>
        <li><strong>Headers (H1):</strong> Inter-Bold, 28px, letterSpacing: 0.25</li>
        <li><strong>Subheaders (H2):</strong> Inter-SemiBold, 24px, letterSpacing: 0.25</li>
        <li><strong>Section Titles (H3):</strong> Inter-SemiBold, 20px, letterSpacing: 0.15</li>
        <li><strong>Body Text (Body1):</strong> Inter, 16px, letterSpacing: 0.5</li>
        <li><strong>Secondary Text (Body2):</strong> Inter, 14px, letterSpacing: 0.25</li>
        <li><strong>Button Text:</strong> Inter-Medium, 14px, letterSpacing: 1.25, uppercase</li>
        <li><strong>Caption Text:</strong> Inter, 12px, letterSpacing: 0.4</li>
      </ul>
      
      <h3>Color Palette</h3>
      <div class="color-palette">
        <div class="color-item" style="background-color: #0066cc; color: white;">Primary: #0066cc</div>
        <div class="color-item" style="background-color: #4CAF50; color: white;">Health: #4CAF50</div>
        <div class="color-item" style="background-color: #2196F3; color: white;">Work: #2196F3</div>
        <div class="color-item" style="background-color: #9C27B0; color: white;">Personal: #9C27B0</div>
        <div class="color-item" style="background-color: #757575; color: white;">Other: #757575</div>
        <div class="color-item" style="background-color: #E53935; color: white;">High Priority: #E53935</div>
        <div class="color-item" style="background-color: #FB8C00; color: white;">Medium Priority: #FB8C00</div>
        <div class="color-item" style="background-color: #43A047; color: white;">Low Priority: #43A047</div>
        <div class="color-item" style="background-color: #f8f9fa; color: black;">Background: #f8f9fa</div>
        <div class="color-item" style="background-color: white; color: black; border: 1px solid #ddd;">Card Background: #ffffff</div>
      </div>
      
      <h3>Component Styling</h3>
      <ul>
        <li><strong>Cards:</strong> White background, rounded corners (16px), medium shadow depth</li>
        <li><strong>Task Cards:</strong> Sectioned layout with header, content, and footer</li>
        <li><strong>Category Badges:</strong> Semi-transparent color backgrounds with matching text</li>
        <li><strong>Priority Indicators:</strong> Color dots with matching text for visual hierarchy</li>
        <li><strong>Buttons:</strong> Blue background, rounded corners, uppercase text</li>
        <li><strong>Checkboxes:</strong> Circular with checkmark, color change on completion</li>
      </ul>
    </div>

    <h2>Project Structure</h2>
    <div class="file-tree">
      <pre><%= fileTree %></pre>
    </div>

    <h2>Task Card Component (TaskItem.tsx)</h2>
    <div class="code-section">
      <div class="code-header">components/TaskItem.tsx</div>
      <div class="code-content">
        <pre><%= taskItemCode %></pre>
      </div>
    </div>

    <h2>Theme and Typography System</h2>
    <div class="code-section">
      <div class="code-header">utils/Theme.ts</div>
      <div class="code-content">
        <pre><%= themeCode %></pre>
      </div>
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
  const taskItemCode = safeReadFileSync(path.join(__dirname, 'components', 'TaskItem.tsx'));
  const themeCode = safeReadFileSync(path.join(__dirname, 'utils', 'Theme.ts'));
  
  res.render('index', { 
    fileTree, 
    appCode, 
    homeScreenCode, 
    routineScreenCode, 
    appJsonCode,
    taskItemCode,
    themeCode
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Code viewer server running at http://localhost:${port}`);
});
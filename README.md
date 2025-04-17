# Task Cat

Task Cat is a playful task management application built with Expo and React Native. It helps users manage their daily tasks and recurring routines with a delightful cat-themed interface.

## Features

- **Task Management**: Create, edit, delete, and mark tasks as complete
- **Recurring Tasks**: Set up recurring routines with custom schedules
- **Task Categories**: Organize tasks by Health, Work, Personal, and Other categories
- **Priority Levels**: Assign High, Medium, or Low priority to tasks
- **Reminders**: Set reminders for important tasks
- **Confetti Celebration**: Enjoy a fun confetti animation when completing tasks

## Tech Stack

- **TypeScript**: For type-safe code
- **Expo**: For cross-platform mobile development
- **React Native**: Core framework
- **React Navigation**: For screen navigation
- **React Native Reanimated**: For smooth animations
- **AsyncStorage**: For local data persistence

## Project Structure

- `/components`: Reusable UI components
- `/models`: TypeScript interfaces and type definitions
- `/screens`: Main app screens
- `/services`: Business logic and data management
- `/utils`: Helper functions and utilities
- `/assets`: Images and other static assets

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or Yarn
- Expo CLI
- Expo Go app on your mobile device (optional)

### Installation

1. Download the project from Replit:
   - Click the three dots menu in the Replit interface
   - Select "Download as zip"
   - Extract the zip file to a local directory

2. Install dependencies with the --legacy-peer-deps flag to avoid dependency conflicts:
   ```
   npm install --legacy-peer-deps
   ```
   
   If you prefer using yarn:
   ```
   yarn install --ignore-engines
   ```
   
### Running Locally

1. Start the Expo development server:
   ```
   npx expo start
   ```
2. You'll see a QR code in your terminal. Scan it with:
   - iOS: Camera app, then tap the notification
   - Android: Expo Go app's QR scanner
   
3. Alternative options:
   - Press 'a' to open on Android emulator
   - Press 'i' to open on iOS simulator
   - Press 'w' to open in a web browser

### Troubleshooting

If you encounter any issues:
- Clear cache with: `npx expo start --clear`
- Make sure Expo Go is up to date
- Check your device and computer are on the same network

#### Dependency Conflicts

If you see errors like:
```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
...
peer react-native@"^0.0.0-0 || 0.60 - 0.72 || 1000.0.0" from @react-native-async-storage/async-storage
```

Use one of these solutions:
1. Install with the legacy peer deps flag: `npm install --legacy-peer-deps`
2. Use the force flag: `npm install --force`
3. Use yarn with the ignore-engines flag: `yarn install --ignore-engines`

#### Package Version Warnings

You may see warnings about package compatibility with the current Expo SDK version:
```
The following packages should be updated for best compatibility with the installed expo version:
  react-native-gesture-handler@2.14.0 - expected version: ~2.20.2
  react-native-reanimated@3.6.2 - expected version: ~3.16.1
  react-native-safe-area-context@4.8.2 - expected version: 4.12.0
  react-native-screens@3.29.0 - expected version: ~4.4.0
```

To fix these warnings when running locally:

```bash
# Install with force option to override dependency conflicts
npm install react-native-gesture-handler@~2.20.2 react-native-reanimated@~3.16.1 react-native-safe-area-context@4.12.0 react-native-screens@~4.4.0 --force
```

Note: The app should work fine even with these warnings, as they're just compatibility recommendations.

## Usage

- **Home Screen**: View and manage one-time tasks
- **Routine Screen**: View and manage recurring tasks
- **Add Task**: Tap the + button to create a new task
- **Complete Task**: Tap the circle next to a task to mark it as complete
- **Edit Task**: Tap on a task to edit its details
- **Delete Task**: Tap the trash icon to delete a task

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
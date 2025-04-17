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

1. Clone the repository or download the project files
2. Install dependencies:
   ```
   npm install
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
export type TaskCategory = 'Health' | 'Work' | 'Personal' | 'Other';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type RecurrencePattern = 'None' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const TASK_CATEGORIES: TaskCategory[] = ['Health', 'Work', 'Personal', 'Other'];
export const TASK_PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];
export const RECURRENCE_PATTERNS: RecurrencePattern[] = ['None', 'Daily', 'Weekly', 'Monthly', 'Custom'];
export const WEEK_DAYS: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface RecurrenceSettings {
  pattern: RecurrencePattern;
  interval?: number; // How often the recurrence happens (e.g., every 2 days, every 3 weeks)
  weekDays?: WeekDay[]; // For weekly recurrence, which days of the week
  monthDay?: number; // For monthly recurrence, which day of the month
  endDate?: number | null; // Optional end date for the recurrence
  occurrences?: number | null; // Optional number of occurrences after which recurrence stops
}

export interface ReminderSettings {
  enabled: boolean;
  time?: number; // Time in milliseconds (from midnight) when reminder should trigger
  reminderDate?: number; // For one-time reminders, absolute date
  notificationId?: string; // ID for tracking scheduled notifications
}

export interface TaskCompletionRecord {
  date: number; // Timestamp of completion
  instanceId?: string; // For recurring tasks, identifies which instance was completed
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  category: TaskCategory;
  priority: TaskPriority;
  // New fields for recurring tasks
  recurrence?: RecurrenceSettings;
  reminder?: ReminderSettings;
  completionHistory?: TaskCompletionRecord[];
  // For recurring tasks
  parentTaskId?: string; // For instances of recurring tasks, references the original task
  instanceDate?: number; // For instances of recurring tasks, the specific date of this instance
}
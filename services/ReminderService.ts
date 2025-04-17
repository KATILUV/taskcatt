import { Task, ReminderSettings } from '../models/Task';

/**
 * Service for handling task reminders
 * Note: In a real mobile app, this would use the device's notification system
 * Since this is a demo in a web environment, we'll simulate the functionality
 */
export const ReminderService = {
  /**
   * Schedule a reminder for a task
   * @param task The task to schedule a reminder for
   * @returns Promise that resolves to a notification ID
   */
  scheduleReminder: async (task: Task): Promise<string | null> => {
    if (!task.reminder || !task.reminder.enabled) {
      return null;
    }

    try {
      // Generate a unique ID for this notification
      const notificationId = `notification_${task.id}_${Date.now()}`;
      
      // Here we would use the device's notification API
      // For example with Expo:
      // await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: "Task Reminder",
      //     body: task.title,
      //     data: { taskId: task.id },
      //   },
      //   trigger: getReminderTrigger(task),
      // });
      
      // For simulation purposes, we'll just log it
      console.log(`Scheduled reminder for task: ${task.title}`);
      
      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return null;
    }
  },

  /**
   * Cancel a scheduled reminder
   * @param notificationId The ID of the notification to cancel
   */
  cancelReminder: async (notificationId: string): Promise<boolean> => {
    try {
      // Here we would cancel the notification
      // For example with Expo:
      // await Notifications.cancelScheduledNotificationAsync(notificationId);
      
      // For simulation purposes, we'll just log it
      console.log(`Cancelled reminder: ${notificationId}`);
      
      return true;
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      return false;
    }
  },

  /**
   * Update a task's reminder settings
   * @param task The task to update
   * @param reminderSettings The new reminder settings
   * @returns Updated task with new reminder settings and notification ID
   */
  updateReminder: async (task: Task, reminderSettings: ReminderSettings): Promise<Task> => {
    // Cancel the existing reminder if there is one
    if (task.reminder?.notificationId) {
      await ReminderService.cancelReminder(task.reminder.notificationId);
    }
    
    // Create updated task with new reminder settings
    const updatedTask = {
      ...task,
      reminder: reminderSettings
    };
    
    // Schedule the new reminder if enabled
    if (reminderSettings.enabled) {
      const notificationId = await ReminderService.scheduleReminder(updatedTask);
      
      // Update the task with the new notification ID
      if (notificationId) {
        updatedTask.reminder.notificationId = notificationId;
      }
    }
    
    return updatedTask;
  },

  /**
   * Calculate the next reminder time based on recurrence pattern
   * @param task The task to calculate reminder for
   * @returns Date object for the next reminder
   */
  getNextReminderTime: (task: Task): Date | null => {
    if (!task.reminder || !task.reminder.enabled) {
      return null;
    }

    // If it's a one-time reminder with a specific date
    if (task.reminder.reminderDate) {
      return new Date(task.reminder.reminderDate);
    }

    // If it's a recurring task
    if (task.recurrence && task.recurrence.pattern !== 'None') {
      // For recurring tasks, we need to find the next instance date and set the reminder for it
      if (task.instanceDate) {
        // This is already a task instance with a specific date
        const instanceDate = new Date(task.instanceDate);
        
        // If there's a specific time set for the reminder, use it
        if (task.reminder.time) {
          const hours = Math.floor(task.reminder.time / (60 * 60 * 1000));
          const minutes = Math.floor((task.reminder.time % (60 * 60 * 1000)) / (60 * 1000));
          instanceDate.setHours(hours, minutes, 0, 0);
        }
        
        // Only return if the date is in the future
        if (instanceDate.getTime() > Date.now()) {
          return instanceDate;
        }
      }
      
      // For parent recurring tasks (or if instance date is in the past),
      // we would need to use the RecurrenceService to calculate the next instance
      // For now, default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // If there's a specific time, set it
      if (task.reminder.time) {
        const hours = Math.floor(task.reminder.time / (60 * 60 * 1000));
        const minutes = Math.floor((task.reminder.time % (60 * 60 * 1000)) / (60 * 1000));
        tomorrow.setHours(hours, minutes, 0, 0);
      }
      
      return tomorrow;
    }

    // If it's a daily time-based reminder (e.g., "remind me at 9am")
    if (task.reminder.time) {
      const now = new Date();
      const reminderTime = new Date(now);
      
      // Set the time portion based on the milliseconds since midnight
      const millisSinceMidnight = task.reminder.time;
      const hours = Math.floor(millisSinceMidnight / (60 * 60 * 1000));
      const minutes = Math.floor((millisSinceMidnight % (60 * 60 * 1000)) / (60 * 1000));
      
      reminderTime.setHours(hours, minutes, 0, 0);
      
      // If the time has already passed today, schedule for tomorrow
      if (reminderTime.getTime() < now.getTime()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }
      
      return reminderTime;
    }

    return null;
  }
};
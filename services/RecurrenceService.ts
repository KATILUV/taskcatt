import { 
  Task, 
  RecurrencePattern, 
  RecurrenceSettings,
  WeekDay
} from '../models/Task';

/**
 * Service for handling recurring task logic
 */
export const RecurrenceService = {
  /**
   * Check if a task is recurring
   */
  isRecurring: (task: Task): boolean => {
    return !!task.recurrence && task.recurrence.pattern !== 'None';
  },

  /**
   * Generate the next instance date for a recurring task
   * @param baseDate The date to calculate from (usually last instance or creation date)
   * @param recurrence The recurrence settings
   * @returns Timestamp for the next instance date or null if no more occurrences
   */
  getNextInstanceDate: (baseDate: number, recurrence: RecurrenceSettings): number | null => {
    if (recurrence.pattern === 'None') {
      return null;
    }

    // Check if recurrence should end
    if (recurrence.endDate && baseDate >= recurrence.endDate) {
      return null;
    }

    const baseDateTime = new Date(baseDate);
    let nextDate = new Date(baseDate);
    const interval = recurrence.interval || 1;

    switch (recurrence.pattern) {
      case 'Daily':
        nextDate.setDate(baseDateTime.getDate() + interval);
        break;

      case 'Weekly':
        if (recurrence.weekDays && recurrence.weekDays.length > 0) {
          // Find the next applicable weekday
          const currentDayIndex = baseDateTime.getDay(); // 0 is Sunday in JS
          const weekDayIndices = recurrence.weekDays.map(day => getWeekdayIndex(day));
          
          // Find the next weekday index that's greater than current
          let nextDayIndex = weekDayIndices.find(index => index > currentDayIndex);
          
          if (nextDayIndex !== undefined) {
            // Found a day later this week
            const daysToAdd = nextDayIndex - currentDayIndex;
            nextDate.setDate(baseDateTime.getDate() + daysToAdd);
          } else {
            // No days later this week, move to the first day next week
            const firstDayNextWeek = Math.min(...weekDayIndices);
            const daysToAdd = 7 - currentDayIndex + firstDayNextWeek;
            nextDate.setDate(baseDateTime.getDate() + daysToAdd);
          }
        } else {
          // Simple weekly recurrence
          nextDate.setDate(baseDateTime.getDate() + (7 * interval));
        }
        break;

      case 'Monthly':
        if (recurrence.monthDay) {
          // Set to specific day of month
          nextDate = new Date(baseDateTime.getFullYear(), baseDateTime.getMonth() + interval, recurrence.monthDay);
          
          // If the day doesn't exist in the month (e.g., Feb 30th), use the last day
          const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
          if (recurrence.monthDay > lastDayOfMonth) {
            nextDate.setDate(lastDayOfMonth);
          }
        } else {
          // Simple monthly recurrence, same day each month
          nextDate.setMonth(baseDateTime.getMonth() + interval);
        }
        break;

      case 'Custom':
        // Custom logic can be added here
        break;

      default:
        return null;
    }

    return nextDate.getTime();
  },

  /**
   * Generate instances for a recurring task up to a limit or end date
   * @param task The recurring task template
   * @param fromDate The date to start generating from
   * @param toDate The date to stop generating at
   * @param maxInstances Maximum number of instances to generate
   * @returns Array of task instances
   */
  generateInstances: (
    task: Task, 
    fromDate: number = Date.now(), 
    toDate: number = fromDate + 30 * 24 * 60 * 60 * 1000, // Default: next 30 days
    maxInstances: number = 10
  ): Task[] => {
    if (!RecurrenceService.isRecurring(task) || !task.recurrence) {
      return [];
    }

    const instances: Task[] = [];
    let currentDate = fromDate;
    let instanceCount = 0;

    // Use either creation date or the fromDate as the base
    const baseDate = Math.max(task.createdAt, fromDate);
    
    // Find the first occurrence after the fromDate
    let nextInstanceDate = RecurrenceService.getNextInstanceDate(baseDate, task.recurrence);

    while (
      nextInstanceDate && 
      nextInstanceDate <= toDate && 
      instanceCount < maxInstances
    ) {
      // Create the task instance
      const instance: Task = {
        ...task,
        id: `${task.id}_${nextInstanceDate}`,
        parentTaskId: task.id,
        instanceDate: nextInstanceDate,
        completed: false, // Each instance starts as not completed
      };

      instances.push(instance);
      instanceCount++;

      // Calculate the next instance date
      nextInstanceDate = RecurrenceService.getNextInstanceDate(nextInstanceDate, task.recurrence);
    }

    return instances;
  },

  /**
   * Update completion status for a recurring task and its instances
   * @param task The completed task instance
   * @param tasks The full task list
   * @returns Updated task list with correct completion status
   */
  updateCompletionStatus: (task: Task, tasks: Task[]): Task[] => {
    // If this is a recurring task instance
    if (task.parentTaskId && task.instanceDate) {
      // Find the parent task
      const parentTask = tasks.find(t => t.id === task.parentTaskId);
      
      if (parentTask) {
        // Update the completion history of the parent task
        const updatedParent = {
          ...parentTask,
          completionHistory: [
            ...(parentTask.completionHistory || []),
            { date: Date.now(), instanceId: task.id }
          ]
        };
        
        // Replace the parent task in the array
        return tasks.map(t => t.id === parentTask.id ? updatedParent : t);
      }
    }
    
    // If it's not an instance or parent not found, return original list
    return tasks;
  }
};

/**
 * Helper to convert WeekDay to JavaScript day index (0-6, where 0 is Sunday)
 */
function getWeekdayIndex(day: WeekDay): number {
  const map: Record<WeekDay, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  return map[day];
}
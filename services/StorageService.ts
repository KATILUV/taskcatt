import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../models/Task';
import { RecurrenceService } from './RecurrenceService';
import { ReminderService } from './ReminderService';

const TASKS_STORAGE_KEY = 'taskcat_tasks';
const TASK_INSTANCES_KEY = 'taskcat_task_instances';
const SETTINGS_KEY = 'taskcat_settings';

export const StorageService = {
  /**
   * Save tasks to AsyncStorage
   */
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      // Separate parent tasks from instances
      const parentTasks = tasks.filter(task => !task.parentTaskId);
      
      const jsonValue = JSON.stringify(parentTasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
      
      // Generate and save instances separately
      await StorageService.generateAndSaveInstances(parentTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  /**
   * Load tasks from AsyncStorage with optional instance generation
   * @param includeInstances Whether to include task instances
   * @param fromDate Start date for instances
   * @param toDate End date for instances
   */
  loadTasks: async (
    includeInstances: boolean = true,
    fromDate: number = Date.now(),
    toDate: number = fromDate + 14 * 24 * 60 * 60 * 1000 // Default 2 weeks
  ): Promise<Task[]> => {
    try {
      // Load parent tasks
      const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      const parentTasks: Task[] = jsonValue != null ? JSON.parse(jsonValue) : [];
      
      if (!includeInstances) {
        return parentTasks;
      }
      
      // Load or generate instances for recurring tasks
      const instances = await StorageService.loadTaskInstances(parentTasks, fromDate, toDate);
      
      // Combine parent tasks and instances, filtering out completed instances
      return [...parentTasks, ...instances].filter(task => {
        // If it's an instance with a parent, check if it's in the past
        if (task.parentTaskId && task.instanceDate) {
          const now = Date.now();
          // Keep incomplete future instances or instances from today
          return !task.completed || task.instanceDate >= now - (24 * 60 * 60 * 1000);
        }
        return true;
      });
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },
  
  /**
   * Generate and save task instances for recurring tasks
   */
  generateAndSaveInstances: async (
    parentTasks: Task[], 
    fromDate: number = Date.now(),
    toDate: number = fromDate + 14 * 24 * 60 * 60 * 1000 // Default 2 weeks
  ): Promise<void> => {
    try {
      // Filter for recurring tasks only
      const recurringTasks = parentTasks.filter(task => 
        RecurrenceService.isRecurring(task)
      );
      
      if (recurringTasks.length === 0) {
        return;
      }
      
      // Generate instances for each recurring task
      let allInstances: Task[] = [];
      for (const task of recurringTasks) {
        const taskInstances = RecurrenceService.generateInstances(task, fromDate, toDate);
        allInstances = [...allInstances, ...taskInstances];
      }
      
      // Save the instances
      await StorageService.saveTaskInstances(allInstances);
      
      // Schedule reminders for instances
      for (const instance of allInstances) {
        if (instance.reminder?.enabled) {
          await ReminderService.scheduleReminder(instance);
        }
      }
    } catch (error) {
      console.error('Error generating task instances:', error);
    }
  },
  
  /**
   * Save task instances to storage
   */
  saveTaskInstances: async (instances: Task[]): Promise<void> => {
    try {
      // Load existing instances
      const existingJson = await AsyncStorage.getItem(TASK_INSTANCES_KEY);
      const existingInstances: Task[] = existingJson ? JSON.parse(existingJson) : [];
      
      // Merge instances, giving priority to new instances
      const existingIds = new Set(existingInstances.map(t => t.id));
      const newInstances = instances.filter(t => !existingIds.has(t.id));
      
      const mergedInstances = [...existingInstances, ...newInstances];
      
      // Save back to storage
      await AsyncStorage.setItem(TASK_INSTANCES_KEY, JSON.stringify(mergedInstances));
    } catch (error) {
      console.error('Error saving task instances:', error);
    }
  },
  
  /**
   * Load task instances from storage or generate if needed
   */
  loadTaskInstances: async (
    parentTasks: Task[], 
    fromDate: number = Date.now(),
    toDate: number = fromDate + 14 * 24 * 60 * 60 * 1000 // Default 2 weeks
  ): Promise<Task[]> => {
    try {
      // Load existing instances
      const existingJson = await AsyncStorage.getItem(TASK_INSTANCES_KEY);
      let existingInstances: Task[] = existingJson ? JSON.parse(existingJson) : [];
      
      // Filter instances to the requested date range
      existingInstances = existingInstances.filter(task => 
        task.instanceDate && 
        task.instanceDate >= fromDate && 
        task.instanceDate <= toDate
      );
      
      // Check if we need to generate additional instances
      const recurringParentIds = parentTasks
        .filter(task => RecurrenceService.isRecurring(task))
        .map(task => task.id);
      
      // Find which parents already have instances in the time range
      const existingParentIds = new Set(
        existingInstances
          .filter(task => task.parentTaskId)
          .map(task => task.parentTaskId)
      );
      
      // Generate instances for parents that don't have them yet
      const parentsNeedingInstances = parentTasks.filter(task => 
        RecurrenceService.isRecurring(task) && 
        !existingParentIds.has(task.id)
      );
      
      if (parentsNeedingInstances.length > 0) {
        let newInstances: Task[] = [];
        
        for (const parent of parentsNeedingInstances) {
          const instances = RecurrenceService.generateInstances(parent, fromDate, toDate);
          newInstances = [...newInstances, ...instances];
        }
        
        // Save the new instances
        if (newInstances.length > 0) {
          await StorageService.saveTaskInstances(newInstances);
          existingInstances = [...existingInstances, ...newInstances];
        }
      }
      
      return existingInstances;
    } catch (error) {
      console.error('Error loading task instances:', error);
      return [];
    }
  },
  
  /**
   * Update a specific task and save to storage
   */
  updateTask: async (updatedTask: Task): Promise<boolean> => {
    try {
      const tasks = await StorageService.loadTasks(false); // Load only parent tasks
      
      // If it's a parent task, update it
      if (!updatedTask.parentTaskId) {
        const updatedTasks = tasks.map(task => 
          task.id === updatedTask.id ? updatedTask : task
        );
        
        await StorageService.saveTasks(updatedTasks);
        return true;
      }
      
      // If it's an instance, update it separately
      const instances = await StorageService.loadTaskInstances(tasks);
      const updatedInstances = instances.map(instance => 
        instance.id === updatedTask.id ? updatedTask : instance
      );
      
      await StorageService.saveTaskInstances(updatedInstances);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  },
  
  /**
   * Delete a task and its instances
   */
  deleteTask: async (taskId: string, deleteAllInstances: boolean = true): Promise<boolean> => {
    try {
      // Load parent tasks
      const tasks = await StorageService.loadTasks(false);
      
      // Check if it's a parent task
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        // Remove from parent tasks
        tasks.splice(taskIndex, 1);
        await StorageService.saveTasks(tasks);
        
        // If requested, also delete all instances
        if (deleteAllInstances) {
          const instances = await StorageService.loadTaskInstances(tasks);
          const filteredInstances = instances.filter(t => t.parentTaskId !== taskId);
          await StorageService.saveTaskInstances(filteredInstances);
        }
        
        return true;
      }
      
      // If not a parent, try to delete an instance
      const instances = await StorageService.loadTaskInstances(tasks);
      const instanceIndex = instances.findIndex(t => t.id === taskId);
      
      if (instanceIndex >= 0) {
        instances.splice(instanceIndex, 1);
        await StorageService.saveTaskInstances(instances);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },
  
  /**
   * Save user settings
   */
  saveSettings: async (settings: Record<string, any>): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
  
  /**
   * Load user settings
   */
  loadSettings: async (): Promise<Record<string, any>> => {
    try {
      const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }
};
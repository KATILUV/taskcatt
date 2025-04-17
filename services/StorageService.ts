import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../models/Task';
import { RecurrenceService } from './RecurrenceService';
import { ReminderService } from './ReminderService';

// Storage keys
const TASKS_STORAGE_KEY = 'taskcat_tasks';
const TASK_INSTANCES_KEY = 'taskcat_task_instances';
const SETTINGS_KEY = 'taskcat_settings';

// In-memory cache to reduce AsyncStorage reads
const taskCache = {
  parentTasks: null as Task[] | null,
  instances: null as Task[] | null,
  settings: null as Record<string, any> | null,
  lastLoaded: {
    parentTasks: 0,
    instances: 0,
    settings: 0
  }
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export const StorageService = {
  /**
   * Save tasks to AsyncStorage and update cache
   */
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      // Separate parent tasks from instances
      const parentTasks = tasks.filter(task => !task.parentTaskId);
      
      const jsonValue = JSON.stringify(parentTasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
      
      // Update cache
      taskCache.parentTasks = [...parentTasks];
      taskCache.lastLoaded.parentTasks = Date.now();
      
      // Generate and save instances separately
      await StorageService.generateAndSaveInstances(parentTasks);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  /**
   * Load tasks from AsyncStorage with optional instance generation
   * Uses caching for improved performance
   * @param includeInstances Whether to include task instances
   * @param fromDate Start date for instances
   * @param toDate End date for instances
   * @param bypassCache Force reload from storage even if cache is valid
   */
  loadTasks: async (
    includeInstances: boolean = true,
    fromDate: number = Date.now(),
    toDate: number = fromDate + 14 * 24 * 60 * 60 * 1000, // Default 2 weeks
    bypassCache: boolean = false
  ): Promise<Task[]> => {
    try {
      let parentTasks: Task[] = [];
      const now = Date.now();
      
      // Check if we can use cached parent tasks
      if (
        !bypassCache && 
        taskCache.parentTasks !== null && 
        now - taskCache.lastLoaded.parentTasks < CACHE_EXPIRATION
      ) {
        // Use cached parent tasks
        parentTasks = [...taskCache.parentTasks];
      } else {
        // Load parent tasks from storage
        const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        parentTasks = jsonValue != null ? JSON.parse(jsonValue) : [];
        
        // Update cache
        taskCache.parentTasks = [...parentTasks];
        taskCache.lastLoaded.parentTasks = now;
      }
      
      // Early return for efficiency when instances aren't needed
      if (!includeInstances) {
        return parentTasks;
      }
      
      // Fast path: If no recurring tasks, don't bother with instances
      const hasRecurringTasks = parentTasks.some(task => 
        RecurrenceService.isRecurring(task)
      );
      
      if (!hasRecurringTasks) {
        return parentTasks; // No instances to load if no recurring tasks
      }
      
      // Load or generate instances for recurring tasks
      const instances = await StorageService.loadTaskInstances(parentTasks, fromDate, toDate);
      
      // If no instances found, just return parent tasks
      if (instances.length === 0) {
        return parentTasks;
      }
      
      const oneDayInMs = 24 * 60 * 60 * 1000;
      
      // Create a combined array with optimal capacity
      const result = [...parentTasks];
      
      // Only add instances that are relevant (not completed and not in the past)
      for (const instance of instances) {
        if (
          instance.parentTaskId && 
          instance.instanceDate && 
          (!instance.completed || instance.instanceDate >= now - oneDayInMs)
        ) {
          result.push(instance);
        }
      }
      
      return result;
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
   * Save task instances to storage and update cache
   */
  saveTaskInstances: async (instances: Task[]): Promise<void> => {
    try {
      if (instances.length === 0) {
        return; // Nothing to save
      }
      
      // Load existing instances only if needed
      const existingJson = await AsyncStorage.getItem(TASK_INSTANCES_KEY);
      
      // If no existing instances, just save the new ones
      if (!existingJson) {
        await AsyncStorage.setItem(TASK_INSTANCES_KEY, JSON.stringify(instances));
        
        // Update cache
        taskCache.instances = [...instances];
        taskCache.lastLoaded.instances = Date.now();
        return;
      }
      
      // Otherwise, merge preserving existing instances that aren't being updated
      const existingInstances: Task[] = JSON.parse(existingJson);
      
      // Create a map for faster lookups
      const existingInstanceMap = new Map<string, Task>();
      existingInstances.forEach(instance => {
        existingInstanceMap.set(instance.id, instance);
      });
      
      // Update existing instances or add new ones
      instances.forEach(instance => {
        existingInstanceMap.set(instance.id, instance);
      });
      
      // Convert map back to array
      const mergedInstances = Array.from(existingInstanceMap.values());
      
      // Save back to storage
      await AsyncStorage.setItem(TASK_INSTANCES_KEY, JSON.stringify(mergedInstances));
      
      // Update cache
      taskCache.instances = [...mergedInstances];
      taskCache.lastLoaded.instances = Date.now();
    } catch (error) {
      console.error('Error saving task instances:', error);
    }
  },
  
  /**
   * Load task instances from storage or generate if needed
   * Uses caching to improve performance
   * @param parentTasks Parent tasks to generate instances for
   * @param fromDate Start date for the instance range
   * @param toDate End date for the instance range
   * @param bypassCache Force reload from storage even if cache is valid
   */
  loadTaskInstances: async (
    parentTasks: Task[], 
    fromDate: number = Date.now(),
    toDate: number = fromDate + 14 * 24 * 60 * 60 * 1000, // Default 2 weeks
    bypassCache: boolean = false
  ): Promise<Task[]> => {
    try {
      // Quick check if there are any recurring tasks at all
      const recurringParentIds = parentTasks
        .filter(task => RecurrenceService.isRecurring(task))
        .map(task => task.id);
      
      if (recurringParentIds.length === 0) {
        return []; // No recurring tasks, so no instances needed
      }
      
      const now = Date.now();
      
      // Check if we can use cached instances
      if (
        !bypassCache && 
        taskCache.instances !== null && 
        now - taskCache.lastLoaded.instances < CACHE_EXPIRATION
      ) {
        // Filter cached instances by date range and parent IDs
        return taskCache.instances.filter(task => 
          task.parentTaskId && 
          recurringParentIds.includes(task.parentTaskId) &&
          task.instanceDate && 
          task.instanceDate >= fromDate && 
          task.instanceDate <= toDate
        );
      }
      
      // If cache invalid or bypassed, load from storage
      const existingJson = await AsyncStorage.getItem(TASK_INSTANCES_KEY);
      
      // Early return if no instances stored (we'll need to generate new ones)
      if (!existingJson) {
        // Generate new instances for all recurring tasks directly with optimized approach
        const allNewInstances: Task[] = [];
        
        // Pre-allocate expected array capacity based on parent count
        const recurringParents = parentTasks.filter(t => RecurrenceService.isRecurring(t));
        allNewInstances.length = recurringParents.length * 5; // Estimate 5 instances per parent
        
        let actualLength = 0;
        
        // Generate instances in batch
        for (const parent of recurringParents) {
          const instances = RecurrenceService.generateInstances(parent, fromDate, toDate);
          for (const instance of instances) {
            allNewInstances[actualLength++] = instance;
          }
        }
        
        // Trim array to actual size
        allNewInstances.length = actualLength;
        
        // Cache the new instances
        taskCache.instances = [...allNewInstances];
        taskCache.lastLoaded.instances = now;
        
        // Save and return the newly generated instances
        if (allNewInstances.length > 0) {
          await StorageService.saveTaskInstances(allNewInstances);
        }
        return allNewInstances;
      }
      
      // Parse existing instances from storage
      let existingInstances: Task[] = JSON.parse(existingJson);
      
      // Cache all instances for future use
      taskCache.instances = [...existingInstances];
      taskCache.lastLoaded.instances = now;
      
      // Use Set for fast lookups of parent IDs
      const recurringParentSet = new Set(recurringParentIds);
      
      // Optimization: If there are lots of instances, filter by parent ID first before date filtering
      if (existingInstances.length > 100) {
        // First filter by parent ID (faster than date comparison)
        existingInstances = existingInstances.filter(task =>
          task.parentTaskId && recurringParentSet.has(task.parentTaskId)
        );
      }
      
      // Then filter by date range
      existingInstances = existingInstances.filter(task => 
        task.instanceDate && 
        task.instanceDate >= fromDate && 
        task.instanceDate <= toDate
      );
      
      // Find which parents already have instances in the time range - use Set for O(1) lookups
      const existingParentSet = new Set<string>();
      for (const task of existingInstances) {
        if (task.parentTaskId) {
          existingParentSet.add(task.parentTaskId);
        }
      }
      
      // Generate instances only for parents that don't have them yet
      const parentsNeedingInstances: Task[] = [];
      for (const task of parentTasks) {
        if (RecurrenceService.isRecurring(task) && !existingParentSet.has(task.id)) {
          parentsNeedingInstances.push(task);
        }
      }
      
      if (parentsNeedingInstances.length > 0) {
        // Calculate bulk instances with optimized memory allocation
        const newInstances: Task[] = [];
        
        for (const parent of parentsNeedingInstances) {
          const instances = RecurrenceService.generateInstances(parent, fromDate, toDate);
          newInstances.push(...instances);
        }
        
        // Save the new instances only if we have any
        if (newInstances.length > 0) {
          await StorageService.saveTaskInstances(newInstances);
          
          // Update cache with new instances
          taskCache.instances = [...(taskCache.instances || []), ...newInstances];
          
          // Add to result set
          existingInstances.push(...newInstances);
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
   * Save user settings and update cache
   */
  saveSettings: async (settings: Record<string, any>): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
      
      // Update cache
      taskCache.settings = { ...settings };
      taskCache.lastLoaded.settings = Date.now();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
  
  /**
   * Load user settings with caching
   * @param bypassCache Force reload from storage even if cache is valid
   */
  loadSettings: async (bypassCache: boolean = false): Promise<Record<string, any>> => {
    try {
      const now = Date.now();
      
      // Check if we can use cached settings
      if (
        !bypassCache && 
        taskCache.settings !== null && 
        now - taskCache.lastLoaded.settings < CACHE_EXPIRATION
      ) {
        // Use cached settings
        return { ...taskCache.settings };
      }
      
      // Load settings from storage
      const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
      const settings = jsonValue != null ? JSON.parse(jsonValue) : {};
      
      // Update cache
      taskCache.settings = { ...settings };
      taskCache.lastLoaded.settings = now;
      
      return settings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  },

  /**
   * Add a new task and save to storage
   */
  addTask: async (task: Task): Promise<boolean> => {
    try {
      // Load only parent tasks (no instances) for efficiency
      const tasks = await StorageService.loadTasks(false);
      
      // Add the new task
      tasks.push(task);
      
      // Save all tasks
      await StorageService.saveTasks(tasks);
      
      // If the task is recurring, generate instances immediately
      if (RecurrenceService.isRecurring(task)) {
        await StorageService.generateAndSaveInstances([task]);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding task:', error);
      return false;
    }
  }
};
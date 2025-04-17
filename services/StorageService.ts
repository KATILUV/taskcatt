import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../models/Task';

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
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  /**
   * Load tasks from AsyncStorage with caching
   */
  loadTasks: async (
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
      
      return parentTasks;
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },
  
  /**
   * Update a specific task and save to storage
   */
  updateTask: async (updatedTask: Task): Promise<boolean> => {
    try {
      const tasks = await StorageService.loadTasks(false);
      
      const updatedTasks = tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      );
      
      await StorageService.saveTasks(updatedTasks);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  },
  
  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<boolean> => {
    try {
      // Load tasks
      const tasks = await StorageService.loadTasks(false);
      
      // Filter out the task to delete
      const filteredTasks = tasks.filter(t => t.id !== taskId);
      
      // Save the filtered tasks
      await StorageService.saveTasks(filteredTasks);
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  },
  
  /**
   * Add a new task
   */
  addTask: async (task: Task): Promise<boolean> => {
    try {
      // Load existing tasks
      const tasks = await StorageService.loadTasks(false);
      
      // Add the new task
      tasks.push(task);
      
      // Save all tasks
      await StorageService.saveTasks(tasks);
      
      return true;
    } catch (error) {
      console.error('Error adding task:', error);
      return false;
    }
  }
};
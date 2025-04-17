import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../models/Task';

const TASKS_STORAGE_KEY = 'taskcat_tasks';

export const StorageService = {
  /**
   * Save tasks to AsyncStorage
   */
  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(tasks);
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  /**
   * Load tasks from AsyncStorage
   */
  loadTasks: async (): Promise<Task[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  },
};
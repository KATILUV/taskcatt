export type TaskCategory = 'Health' | 'Work' | 'Personal' | 'Other';

export const TASK_CATEGORIES: TaskCategory[] = ['Health', 'Work', 'Personal', 'Other'];

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  category: TaskCategory;
}
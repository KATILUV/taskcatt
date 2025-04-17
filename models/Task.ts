export type TaskCategory = 'Health' | 'Work' | 'Personal' | 'Other';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export const TASK_CATEGORIES: TaskCategory[] = ['Health', 'Work', 'Personal', 'Other'];
export const TASK_PRIORITIES: TaskPriority[] = ['High', 'Medium', 'Low'];

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  category: TaskCategory;
  priority: TaskPriority;
}
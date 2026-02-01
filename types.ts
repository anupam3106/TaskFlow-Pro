
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string; // ISO string
  completed: boolean;
  createdAt: string;
  reminderSent: boolean;
  subTasks?: string[];
}

export type FilterType = 'ALL' | 'TODAY' | 'UPCOMING' | 'COMPLETED';
export type SortType = 'DATE' | 'PRIORITY' | 'NAME';

export interface AppTheme {
  darkMode: boolean;
  accentColor: string;
}

export interface AlarmState {
  active: boolean;
  task?: Task;
}

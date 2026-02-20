export interface User {
  name?: string;
  username: string;
  password?: string;
}

export interface Win {
  id: string;
  text: string;
  category?: string;
  timestamp: number;
  linkedTargetId?: string;
}

export interface Target {
  id: string;
  text: string;
  createdAt: number;
  targetDate?: number;
  completed: boolean;
}

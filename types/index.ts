export interface User {
  id: string;
  name?: string;
  username: string;
  password?: string;
}

export interface Win {
  id: string;
  userId: string;
  text: string;
  category?: string;
  timestamp: number;
  linkedTargetId?: string;
}

export interface Target {
  id: string;
  userId: string;
  text: string;
  createdAt: number;
  targetDate?: number;
  completed: boolean;
}

export interface SubTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  status: 'done' | 'working' | 'stuck';
  createdAt: string;
  completedAt: string | null;
  owner: {
    name: string;
    avatar: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string | null;
  completed: boolean;
  subTasks: SubTask[];
  status: 'done' | 'working' | 'stuck';
  createdAt: string;
  completedAt: string | null;
  owner: {
    name: string;
    avatar: string;
  };
  month: 'this' | 'next';
}
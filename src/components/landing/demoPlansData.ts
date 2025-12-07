// Type definitions for public plans displayed in the landing page

export interface DemoNode {
  id: string;
  title: string;
  type: 'phase' | 'task' | 'subtask';
  status: 'completed' | 'in_progress' | 'not_started';
  assignedTo?: string; // GitHub username
  isMCP?: boolean; // AI agent assigned
  dueDate?: string;
  completedAt?: string;
  children?: DemoNode[];
}

export interface GitHubRepo {
  owner: string;
  name: string;
  stars: number;
  url: string;
}

export interface DemoPlan {
  id: string;
  title: string;
  description: string;
  githubRepo?: GitHubRepo;
  lastUpdated: Date;
  lastUpdatedBy: string; // GitHub username
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
  nodes: DemoNode[];
}

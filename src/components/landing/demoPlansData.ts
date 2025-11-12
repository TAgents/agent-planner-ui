// Demo data for featured public plans showcase

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
  githubRepo: GitHubRepo;
  lastUpdated: Date;
  lastUpdatedBy: string; // GitHub username
  progress: number; // 0-100
  totalTasks: number;
  completedTasks: number;
  nodes: DemoNode[];
}

// Featured public plans
export const DEMO_PLANS: DemoPlan[] = [
  {
    id: 'react-v19',
    title: 'React.js v19 Release Plan',
    description: 'Preparing the next major release of React',
    githubRepo: {
      owner: 'facebook',
      name: 'react',
      stars: 234000,
      url: 'https://github.com/facebook/react'
    },
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    lastUpdatedBy: 'gaearon',
    progress: 80,
    totalTasks: 20,
    completedTasks: 16,
    nodes: [
      {
        id: 'phase-1',
        title: 'Phase 1: Compiler Features',
        type: 'phase',
        status: 'completed',
        children: [
          {
            id: 'task-1-1',
            title: 'Auto-memoization',
            type: 'task',
            status: 'completed',
            assignedTo: 'gaearon',
            dueDate: 'Dec 1',
            completedAt: 'Dec 1'
          },
          {
            id: 'task-1-2',
            title: 'Forget API implementation',
            type: 'task',
            status: 'completed',
            assignedTo: 'poteto',
            dueDate: 'Dec 5',
            completedAt: 'Dec 5'
          },
          {
            id: 'task-1-3',
            title: 'Performance benchmarks',
            type: 'task',
            status: 'completed',
            assignedTo: 'sophiebits',
            dueDate: 'Dec 8',
            completedAt: 'Dec 8'
          }
        ]
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Documentation Updates',
        type: 'phase',
        status: 'in_progress',
        children: [
          {
            id: 'task-2-1',
            title: 'Compiler guide',
            type: 'task',
            status: 'completed',
            assignedTo: 'rachelnabors',
            completedAt: 'Dec 10'
          },
          {
            id: 'task-2-2',
            title: 'Migration tutorial',
            type: 'task',
            status: 'in_progress',
            assignedTo: 'react-docs-bot',
            isMCP: true,
            dueDate: 'Dec 15',
            children: [
              {
                id: 'subtask-2-2-1',
                title: 'Setup instructions',
                type: 'subtask',
                status: 'completed',
                assignedTo: 'react-docs-bot',
                isMCP: true,
                completedAt: 'Dec 12'
              },
              {
                id: 'subtask-2-2-2',
                title: 'Common patterns',
                type: 'subtask',
                status: 'in_progress',
                assignedTo: 'react-docs-bot',
                isMCP: true
              },
              {
                id: 'subtask-2-2-3',
                title: 'Troubleshooting guide',
                type: 'subtask',
                status: 'not_started',
                assignedTo: 'react-docs-bot',
                isMCP: true
              }
            ]
          },
          {
            id: 'task-2-3',
            title: 'API reference updates',
            type: 'task',
            status: 'not_started',
            assignedTo: 'rickhanlonii',
            dueDate: 'Dec 18'
          }
        ]
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Testing & Release',
        type: 'phase',
        status: 'not_started',
        children: [
          {
            id: 'task-3-1',
            title: 'Beta release',
            type: 'task',
            status: 'not_started',
            dueDate: 'Dec 20'
          },
          {
            id: 'task-3-2',
            title: 'Community feedback',
            type: 'task',
            status: 'not_started',
            dueDate: 'Dec 25'
          }
        ]
      }
    ]
  },
  {
    id: 'vscode-november',
    title: 'VS Code November Iteration',
    description: 'Monthly iteration plan for Visual Studio Code',
    githubRepo: {
      owner: 'microsoft',
      name: 'vscode',
      stars: 168000,
      url: 'https://github.com/microsoft/vscode'
    },
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    lastUpdatedBy: 'alexdima',
    progress: 65,
    totalTasks: 18,
    completedTasks: 12,
    nodes: [
      {
        id: 'phase-1',
        title: 'Phase 1: Editor Improvements',
        type: 'phase',
        status: 'completed',
        children: [
          {
            id: 'task-1-1',
            title: 'Inline completion enhancements',
            type: 'task',
            status: 'completed',
            assignedTo: 'alexdima',
            completedAt: 'Nov 5'
          },
          {
            id: 'task-1-2',
            title: 'Sticky scroll performance',
            type: 'task',
            status: 'completed',
            assignedTo: 'hediet',
            completedAt: 'Nov 8'
          }
        ]
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Extension API',
        type: 'phase',
        status: 'in_progress',
        children: [
          {
            id: 'task-2-1',
            title: 'Language model API',
            type: 'task',
            status: 'completed',
            assignedTo: 'jrieken',
            completedAt: 'Nov 10'
          },
          {
            id: 'task-2-2',
            title: 'Testing API improvements',
            type: 'task',
            status: 'in_progress',
            assignedTo: 'connor4312',
            dueDate: 'Nov 15'
          },
          {
            id: 'task-2-3',
            title: 'Documentation generation',
            type: 'task',
            status: 'in_progress',
            assignedTo: 'vscode-docs-bot',
            isMCP: true,
            dueDate: 'Nov 18'
          }
        ]
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Performance & Stability',
        type: 'phase',
        status: 'not_started',
        children: [
          {
            id: 'task-3-1',
            title: 'Memory leak investigation',
            type: 'task',
            status: 'not_started',
            dueDate: 'Nov 20'
          },
          {
            id: 'task-3-2',
            title: 'Startup time optimization',
            type: 'task',
            status: 'not_started',
            dueDate: 'Nov 25'
          }
        ]
      }
    ]
  },
  {
    id: 'nextjs-15',
    title: 'Next.js 15 Roadmap',
    description: 'Feature roadmap for Next.js version 15',
    githubRepo: {
      owner: 'vercel',
      name: 'next.js',
      stars: 128000,
      url: 'https://github.com/vercel/next.js'
    },
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    lastUpdatedBy: 'timneutkens',
    progress: 55,
    totalTasks: 16,
    completedTasks: 9,
    nodes: [
      {
        id: 'phase-1',
        title: 'Phase 1: Turbopack Integration',
        type: 'phase',
        status: 'completed',
        children: [
          {
            id: 'task-1-1',
            title: 'Turbopack dev mode',
            type: 'task',
            status: 'completed',
            assignedTo: 'timneutkens',
            completedAt: 'Oct 28'
          },
          {
            id: 'task-1-2',
            title: 'Build optimization',
            type: 'task',
            status: 'completed',
            assignedTo: 'sokra',
            completedAt: 'Nov 1'
          }
        ]
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Server Actions Enhancements',
        type: 'phase',
        status: 'in_progress',
        children: [
          {
            id: 'task-2-1',
            title: 'Improved error handling',
            type: 'task',
            status: 'completed',
            assignedTo: 'shuding',
            completedAt: 'Nov 5'
          },
          {
            id: 'task-2-2',
            title: 'Progressive enhancement',
            type: 'task',
            status: 'in_progress',
            assignedTo: 'feedthejim',
            dueDate: 'Nov 15'
          },
          {
            id: 'task-2-3',
            title: 'Streaming support',
            type: 'task',
            status: 'in_progress',
            assignedTo: 'huozhi',
            dueDate: 'Nov 20'
          }
        ]
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Developer Experience',
        type: 'phase',
        status: 'not_started',
        children: [
          {
            id: 'task-3-1',
            title: 'Improved error messages',
            type: 'task',
            status: 'not_started',
            dueDate: 'Nov 25'
          },
          {
            id: 'task-3-2',
            title: 'AI-powered documentation',
            type: 'task',
            status: 'not_started',
            assignedTo: 'nextjs-docs-bot',
            isMCP: true,
            dueDate: 'Dec 1'
          }
        ]
      }
    ]
  }
];

import { request } from './api';

// GitHub integration service
export const githubService = {
  // Check if GitHub is connected for current user
  checkConnection: async () => {
    return request<{
      connected: boolean;
      github_username: string | null;
      github_avatar_url: string | null;
    }>({
      method: 'GET',
      url: '/github/status',
    });
  },

  // List user's GitHub repositories
  listRepos: async () => {
    return request<{
      repos: Array<{
        id: number;
        name: string;
        full_name: string;
        owner: string;
        description: string | null;
        html_url: string;
        private: boolean;
        language: string | null;
        stargazers_count: number;
        forks_count: number;
        updated_at: string;
        default_branch: string;
      }>;
    }>({
      method: 'GET',
      url: '/github/repos',
    });
  },

  // Get repository details
  getRepo: async (owner: string, name: string) => {
    return request<{
      id: number;
      name: string;
      full_name: string;
      owner: string;
      description: string | null;
      html_url: string;
      private: boolean;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      open_issues_count: number;
      updated_at: string;
      default_branch: string;
      topics: string[];
    }>({
      method: 'GET',
      url: `/github/repos/${owner}/${name}`,
    });
  },

  // Get repository content (README, file structure, languages)
  getRepoContent: async (owner: string, name: string) => {
    return request<{
      readme: string | null;
      file_structure: Array<{
        name: string;
        type: 'file' | 'dir';
        path: string;
        size: number;
      }>;
      languages: Record<string, number>;
    }>({
      method: 'GET',
      url: `/github/repos/${owner}/${name}/content`,
    });
  },

  // Create a single GitHub issue
  createIssue: async (owner: string, name: string, data: {
    title: string;
    body?: string;
    labels?: string[];
  }) => {
    return request<{
      id: number;
      number: number;
      title: string;
      html_url: string;
      state: string;
      created_at: string;
    }>({
      method: 'POST',
      url: `/github/repos/${owner}/${name}/issues`,
      data,
    });
  },

  // Bulk create GitHub issues from plan tasks
  createIssuesFromTasks: async (owner: string, name: string, data: {
    tasks: Array<{
      id: string;
      title: string;
      description?: string;
      context?: string;
      node_type?: string;
      status?: string;
    }>;
    planTitle: string;
    planUrl: string;
  }) => {
    return request<{
      created: number;
      failed: number;
      results: Array<{
        task_id: string;
        task_title: string;
        issue_number: number;
        issue_url: string;
        success: boolean;
      }>;
      errors: Array<{
        task_id: string;
        task_title: string;
        error: string;
        success: boolean;
      }>;
    }>({
      method: 'POST',
      url: `/github/repos/${owner}/${name}/issues/bulk`,
      data,
    });
  },

  // Search GitHub repositories
  searchRepos: async (query: string) => {
    return request<{
      repos: Array<{
        id: number;
        name: string;
        full_name: string;
        owner: string;
        description: string | null;
        html_url: string;
        private: boolean;
        language: string | null;
        stargazers_count: number;
      }>;
    }>({
      method: 'GET',
      url: '/github/search',
      params: { q: query },
    });
  },
};

// Slack Integration API
export interface SlackStatus {
  connected: boolean;
  team_name?: string;
  channel_id?: string;
  channel_name?: string;
  installed_at?: string;
}

export interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}

export const slackService = {
  getStatus: async () => {
    return request<SlackStatus>({
      method: 'GET',
      url: '/integrations/slack/status',
    });
  },

  getInstallUrl: async () => {
    return request<{ url: string }>({
      method: 'GET',
      url: '/integrations/slack/install',
    });
  },

  listChannels: async () => {
    return request<{ channels: SlackChannel[] }>({
      method: 'GET',
      url: '/integrations/slack/channels',
    });
  },

  setChannel: async (channelId: string, channelName: string) => {
    return request<{ success: boolean; channel_id: string; channel_name: string }>({
      method: 'PUT',
      url: '/integrations/slack/channel',
      data: { channelId, channelName },
    });
  },

  disconnect: async () => {
    return request<{ success: boolean }>({
      method: 'DELETE',
      url: '/integrations/slack',
    });
  },

  sendTestMessage: async () => {
    return request<{ success: boolean }>({
      method: 'POST',
      url: '/integrations/slack/test',
    });
  },
};

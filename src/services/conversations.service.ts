/**
 * Conversations / chat API service. CRUD + action-confirm go through the
 * shared `request` (axios) helper; token streaming is handled separately in
 * `useChatStream` (raw fetch + ReadableStream, since EventSource can't set the
 * Authorization header).
 */
import { request } from './api-client';

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
};

export const conversationService = {
  list: () => request<Conversation[]>({ method: 'GET', url: '/conversations' }),
  get: (id: string) => request<Conversation>({ method: 'GET', url: `/conversations/${id}` }),
  create: (title?: string) =>
    request<Conversation>({ method: 'POST', url: '/conversations', data: title ? { title } : {} }),
  rename: (id: string, title: string) =>
    request<Conversation>({ method: 'PATCH', url: `/conversations/${id}`, data: { title } }),
  remove: (id: string) => request<void>({ method: 'DELETE', url: `/conversations/${id}` }),
  getMessages: (id: string) => request<ChatMessage[]>({ method: 'GET', url: `/conversations/${id}/messages` }),
  confirmAction: (id: string, actionId: string, approve: boolean) =>
    request<{ ok: boolean; status: string; summary?: string; error?: string }>({
      method: 'POST',
      url: `/conversations/${id}/actions/${actionId}/confirm`,
      data: { approve },
    }),
};

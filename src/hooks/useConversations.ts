import { useQuery, useMutation, useQueryClient } from 'react-query';
import { conversationService } from '../services/conversations.service';
import { getSession } from '../services/api-client';

function userId(): string {
  const s = getSession();
  return s?.user?.id || s?.user?.email || 'anonymous';
}

export function useConversations() {
  const uid = userId();
  const qc = useQueryClient();
  const hasSession = !!getSession();

  const query = useQuery(['conversations', uid], () => conversationService.list(), {
    enabled: hasSession,
    staleTime: 30 * 1000,
    retry: false,
  });

  const createConversation = useMutation((title?: string) => conversationService.create(title), {
    onSuccess: () => qc.invalidateQueries(['conversations', uid]),
  });

  const deleteConversation = useMutation((id: string) => conversationService.remove(id), {
    onSuccess: () => qc.invalidateQueries(['conversations', uid]),
  });

  return {
    conversations: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createConversation,
    deleteConversation,
  };
}

export function useConversationMessages(conversationId?: string) {
  const query = useQuery(
    ['conversation', conversationId, 'messages'],
    () => conversationService.getMessages(conversationId!),
    { enabled: !!conversationId, staleTime: 5 * 1000, retry: false },
  );
  return { messages: query.data || [], isLoading: query.isLoading, refetch: query.refetch };
}

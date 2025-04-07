// src/hooks/useNodeComments.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { commentService } from '../services/api'; // Assuming apiClient exports commentService
import { Comment } from '../types';

export const useNodeComments = (planId: string, nodeId: string, options = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['nodeComments', planId, nodeId];

  const { data: commentsData, isLoading, error, refetch } = useQuery(
    queryKey,
    () => commentService.getComments(planId, nodeId),
    {
      enabled: !!planId && !!nodeId,
      staleTime: 60 * 1000 * 5, // 5 minutes
      ...options,
    }
  );

  const addCommentMutation = useMutation(
    (commentData: { content: string; comment_type?: string }) =>
      commentService.addComment(planId, nodeId, commentData.content, commentData.comment_type),
    {
      onSuccess: () => {
        // When a comment is added, refetch the comments list
        queryClient.invalidateQueries(queryKey);
      },
      onError: (err: any) => {
        console.error("Error adding comment:", err);
        // Optionally show an error message to the user
      }
    }
  );

  // Safely handle different response formats
  let comments: Comment[] = [];
  if (commentsData) {
    if (Array.isArray(commentsData)) {
      comments = commentsData;
    } else if (commentsData.data && Array.isArray(commentsData.data)) {
      comments = commentsData.data;
    }
  }

  return {
    comments,
    isLoading,
    error,
    refetch,
    addComment: addCommentMutation.mutate,
    isAddingComment: addCommentMutation.isLoading,
  };
};
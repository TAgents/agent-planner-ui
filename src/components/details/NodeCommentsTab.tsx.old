import React, { useState } from 'react';
import { useNodeComments } from '../../hooks/useNodeComments';
import { formatDate } from '../../utils/planUtils';
import { MessageSquare } from 'lucide-react';

interface NodeCommentsTabProps {
  planId: string;
  nodeId: string;
}

const NodeCommentsTab: React.FC<NodeCommentsTabProps> = ({ planId, nodeId }) => {
  const { comments, isLoading, error, addComment, isAddingComment } = useNodeComments(planId, nodeId);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    addComment({ content: newComment }, {
      onSuccess: () => {
        setNewComment('');
      }
    });
  };

  if (isLoading) return <div className="p-4 text-center">Loading comments...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading comments.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Comments</h3>
      </div>
      
      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          rows={3}
        />
        <button
          type="submit"
          disabled={isAddingComment || !newComment.trim()}
          className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingComment ? 'Adding...' : 'Add Comment'}
        </button>
      </form>

      {/* Comments List */}
      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            No comments yet
          </div>
        ) : (
          comments.map((comment: any) => (
            <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">
                      {comment.user_id && comment.user_id.charAt(0) ? comment.user_id.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    User {comment.user_id}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(comment.created_at)}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NodeCommentsTab; 
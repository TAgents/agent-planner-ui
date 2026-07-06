import React, { useState } from 'react';
import { SubjectType } from '../../services/timeline.service';
import { useTimelineComments } from '../../hooks/useTimeline';

export interface CommentComposerProps {
  subjectType: SubjectType;
  subjectId: string;
  placeholder?: string;
}

/**
 * Comment compose box for any subject (node / plan / goal / workspace) via the
 * polymorphic timeline comment endpoint.
 */
export const CommentComposer: React.FC<CommentComposerProps> = ({
  subjectType, subjectId, placeholder = 'Add a comment…',
}) => {
  const [content, setContent] = useState('');
  const { add } = useTimelineComments({ subjectType, subjectId });

  const submit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    add.mutate(
      { subjectType, subjectId, content: trimmed },
      { onSuccess: () => setContent('') }
    );
  };

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
        }}
        rows={2}
        placeholder={placeholder}
        className="w-full resize-y bg-transparent text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none"
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">⌘/Ctrl+Enter to post</span>
        <button
          type="button"
          onClick={submit}
          disabled={!content.trim() || add.isLoading}
          className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {add.isLoading ? 'Posting…' : 'Comment'}
        </button>
      </div>
      {add.isError && (
        <p className="text-[11px] text-red-500 mt-1">{(add.error as Error)?.message || 'Failed to post comment.'}</p>
      )}
    </div>
  );
};

export default CommentComposer;

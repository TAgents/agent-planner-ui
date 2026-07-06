import React, { useState } from 'react';
import { SubjectType } from '../../services/timeline.service';
import { useTimelineComments } from '../../hooks/useTimeline';
import { PrimaryButton } from '../v1';

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
    <div className="rounded-md border border-border bg-surface p-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
        }}
        rows={2}
        placeholder={placeholder}
        className="w-full resize-y bg-transparent text-[12.5px] text-text placeholder-text-muted focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-muted">⌘/Ctrl+Enter to post</span>
        <PrimaryButton onClick={submit} disabled={!content.trim() || add.isLoading}>
          {add.isLoading ? 'Posting…' : 'Comment'}
        </PrimaryButton>
      </div>
      {add.isError && (
        <p className="mt-1 text-[11px] text-red">{(add.error as Error)?.message || 'Failed to post comment.'}</p>
      )}
    </div>
  );
};

export default CommentComposer;

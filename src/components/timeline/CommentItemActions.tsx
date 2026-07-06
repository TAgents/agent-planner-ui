import React, { useState } from 'react';
import { TimelineEntry, SubjectType } from '../../services/timeline.service';
import { useTimelineComments } from '../../hooks/useTimeline';
import { LinkButton, PrimaryButton } from '../v1';

export interface CommentItemActionsProps {
  entry: TimelineEntry;
  scope: { subjectType: SubjectType; subjectId: string };
}

/**
 * Author-only edit / soft-delete controls for a timeline comment. The server
 * enforces author-only; these controls just surface it. Edit opens a small
 * inline panel; delete confirms first.
 */
export const CommentItemActions: React.FC<CommentItemActionsProps> = ({ entry, scope }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.content || '');
  const { edit, remove } = useTimelineComments(scope);

  const save = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === entry.content) { setEditing(false); return; }
    edit.mutate({ id: entry.id, content: trimmed }, { onSuccess: () => setEditing(false) });
  };

  const del = () => {
    if (window.confirm('Delete this comment?')) remove.mutate({ id: entry.id });
  };

  if (editing) {
    return (
      <div className="absolute right-0 top-0 z-10 w-64 rounded-md border border-border bg-surface p-2 shadow-lg">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full resize-y bg-transparent text-[12.5px] text-text focus:outline-none"
          autoFocus
        />
        <div className="mt-1 flex justify-end gap-2">
          <LinkButton onClick={() => { setEditing(false); setDraft(entry.content || ''); }}>Cancel</LinkButton>
          <PrimaryButton onClick={save} disabled={edit.isLoading}>Save</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <LinkButton onClick={() => { setDraft(entry.content || ''); setEditing(true); }} title="Edit">Edit</LinkButton>
      <LinkButton onClick={del} disabled={remove.isLoading} title="Delete" className="hover:text-red">Delete</LinkButton>
    </span>
  );
};

export default CommentItemActions;

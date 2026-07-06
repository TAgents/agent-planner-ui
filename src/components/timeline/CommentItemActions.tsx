import React, { useState } from 'react';
import { TimelineEntry, SubjectType } from '../../services/timeline.service';
import { useTimelineComments } from '../../hooks/useTimeline';

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
      <div className="absolute right-0 top-0 z-10 w-64 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full resize-y bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
          autoFocus
        />
        <div className="flex justify-end gap-2 mt-1">
          <button type="button" onClick={() => { setEditing(false); setDraft(entry.content || ''); }}
            className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={edit.isLoading}
            className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <button type="button" onClick={() => { setDraft(entry.content || ''); setEditing(true); }}
        title="Edit" className="text-[11px] text-gray-400 hover:text-blue-600">Edit</button>
      <button type="button" onClick={del} disabled={remove.isLoading}
        title="Delete" className="text-[11px] text-gray-400 hover:text-red-600">Delete</button>
    </span>
  );
};

export default CommentItemActions;

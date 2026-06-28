import React from 'react';
import { SubjectType, TimelineEntry } from '../../services/timeline.service';
import { useAuth } from '../../hooks/useAuth';
import { Timeline } from './Timeline';
import { CommentComposer } from './CommentComposer';
import { CommentItemActions } from './CommentItemActions';

export interface SubjectTimelineProps {
  subjectType: SubjectType;
  subjectId: string;
  /** Hide the comment composer (read-only view). */
  readOnly?: boolean;
  showFilter?: boolean;
  limit?: number;
  className?: string;
}

// Map a subject onto the timeline scope query param so the server applies the
// matching per-scope access check.
const SCOPE_KEY: Record<SubjectType, 'nodeId' | 'planId' | 'goalId' | 'workspaceId' | undefined> = {
  node: 'nodeId',
  plan: 'planId',
  goal: 'goalId',
  workspace: 'workspaceId',
  org: undefined,
};

/**
 * The reusable "comment box + activity" for any subject — node, plan, goal, or
 * workspace. Renders the unified Timeline with a comment composer on top and
 * author-only edit/delete controls on the caller's own comments.
 */
export const SubjectTimeline: React.FC<SubjectTimelineProps> = ({
  subjectType, subjectId, readOnly = false, showFilter = true, limit = 50, className,
}) => {
  const { userId } = useAuth();
  const scopeKey = SCOPE_KEY[subjectType];
  const scopeProps = scopeKey ? { [scopeKey]: subjectId } : { subjectType, subjectId };

  const renderItemActions = (entry: TimelineEntry): React.ReactNode => {
    if (entry.kind !== 'comment') return null;
    if (!userId || entry.actor_id !== userId) return null;
    return <CommentItemActions entry={entry} scope={{ subjectType, subjectId }} />;
  };

  return (
    <Timeline
      {...scopeProps}
      showFilter={showFilter}
      limit={limit}
      className={className}
      header={readOnly ? undefined : <CommentComposer subjectType={subjectType} subjectId={subjectId} />}
      renderItemActions={renderItemActions}
      emptyLabel={readOnly ? 'No activity yet.' : 'No activity yet — start the conversation.'}
    />
  );
};

export default SubjectTimeline;

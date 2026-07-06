import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  timelineService,
  TimelineQuery,
  TimelinePage,
  TraceResponse,
  TimelineEntry,
  SubjectType,
} from '../services/timeline.service';

const timelineKey = (q: TimelineQuery) => ['timeline', q];
const traceKey = (correlationId?: string) => ['timeline-trace', correlationId];

/** Query the unified timeline for a scope (plan/node/goal/workspace). */
export function useTimeline(query: TimelineQuery, enabled = true) {
  return useQuery<TimelinePage>(
    timelineKey(query),
    () => timelineService.getTimeline(query),
    {
      enabled: enabled && hasScope(query),
      staleTime: 15 * 1000,
      refetchInterval: 30 * 1000,
      keepPreviousData: true,
    }
  );
}

/** Fetch one Execution Trace (entries grouped by correlation_id). */
export function useTrace(correlationId?: string) {
  return useQuery<TraceResponse>(
    traceKey(correlationId),
    () => timelineService.getTrace(correlationId as string),
    { enabled: !!correlationId, staleTime: 15 * 1000 }
  );
}

function hasScope(q: TimelineQuery): boolean {
  return !!(q.planId || q.nodeId || q.goalId || q.workspaceId || q.subjectId || q.correlationId);
}

/** Comment mutations — invalidate the relevant timeline scope on success. */
export function useTimelineComments(scope: TimelineQuery) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries(['timeline']);

  const add = useMutation<TimelineEntry, Error, { subjectType: SubjectType; subjectId: string; content: string }>(
    ({ subjectType, subjectId, content }) =>
      timelineService.addComment({ subject_type: subjectType, subject_id: subjectId, content }),
    { onSuccess: invalidate }
  );

  const edit = useMutation<TimelineEntry, Error, { id: string; content: string }>(
    ({ id, content }) => timelineService.editComment(id, content),
    { onSuccess: invalidate }
  );

  const remove = useMutation<void, Error, { id: string }>(
    ({ id }) => timelineService.deleteComment(id),
    { onSuccess: invalidate }
  );

  return { add, edit, remove, scope };
}

export default useTimeline;

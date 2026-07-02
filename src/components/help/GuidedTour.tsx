import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Kicker, PrimaryButton, GhostButton } from '../v1';

/**
 * Guided interactive product tour. Launched from the sidebar "Guided tour"
 * button, it walks the user through the app by spotlighting real on-screen
 * elements (matched via `data-tour="…"` attributes) with a positioned
 * tooltip. Steps can pin a route, in which case the tour navigates there and
 * waits for the target to mount before highlighting it.
 */

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';

type Step = {
  /** `data-tour` selector to spotlight. Omit for a centered, target-less step. */
  selector?: string;
  /** Navigate here before showing the step (if not already there). */
  route?: string;
  placement?: Placement;
  title: string;
  body: React.ReactNode;
};

const STEPS: Step[] = [
  {
    placement: 'center',
    title: 'Welcome to AgentPlanner',
    body: 'A 30-second tour of how you and your agents work together. You set direction; they do the work. You can skip anytime.',
  },
  {
    selector: '[data-tour="nav-mission"]',
    placement: 'right',
    title: 'Mission',
    body: 'Your home base — goals in motion, what needs your attention, and the decisions agents have queued for you.',
  },
  {
    selector: '[data-tour="nav-workspaces"]',
    placement: 'right',
    title: 'Workspaces',
    body: 'Folders that own your goals and plans. Create one per initiative or project to keep work scoped.',
  },
  {
    selector: '[data-tour="nav-goals"]',
    placement: 'right',
    title: 'Goals',
    body: 'Your outcomes lead here — each goal heads the plans pursuing it. We’ll open this in a moment.',
  },
  {
    selector: '[data-tour="nav-know"]',
    placement: 'right',
    title: 'Knowledge',
    body: 'Everything agents have learned — a timeline, coverage of what you need, and a graph of how facts connect.',
  },
  {
    selector: '[data-tour="nav-blueprints"]',
    placement: 'right',
    title: 'Blueprints',
    body: 'Reusable operating models. Save a plan’s shape, then fork it into any workspace to start fresh.',
  },
  {
    route: '/app/goals',
    selector: '[data-tour="create-actions"]',
    placement: 'bottom',
    title: 'Create work',
    body: 'Add a goal to aim at, or a plan to pursue it. New plans start inactive — just an idea — so agents won’t spend tokens until you activate them.',
  },
  {
    route: '/app/goals',
    selector: '[data-tour="plan-filters"]',
    placement: 'bottom',
    title: 'Find anything',
    body: 'Filter by status or workspace, search across goals and plans, and toggle empty goals into view.',
  },
  {
    route: '/app/goals',
    selector: '[data-tour="plan-list"]',
    placement: 'top',
    title: 'Goal-grouped',
    body: 'Each goal heads the plans pursuing it; plans with no goal sit under “Plans without a goal”. Open any row for its live detail — Compass, critical path, and the tasks agents are working.',
  },
  {
    route: '/app/dashboard',
    selector: '[data-tour="chat-composer"]',
    placement: 'right',
    title: 'Just ask — the assistant does the rest',
    body: 'The assistant is always here on the left, on every screen. The fastest way to get anything done: tell it. It can do everything you can here — find work, create goals & plans, make changes — and it always asks before deleting. Go ahead, type your first message. (Replay this tour anytime from Help.)',
  },
];

const TIP_WIDTH = 320;

export function GuidedTour({ run, onClose }: { run: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tipPos, setTipPos] = useState<{ top: number; left: number } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const step = STEPS[i];

  // Reset to the first step each time the tour is launched.
  useEffect(() => {
    if (run) setI(0);
  }, [run]);

  // Esc closes the tour.
  useEffect(() => {
    if (!run) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run, onClose]);

  // Navigate to the step's route if needed.
  useEffect(() => {
    if (!run || !step) return;
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, i]);

  // Locate (poll) the target element, then track it on scroll/resize.
  useEffect(() => {
    if (!run || !step) return;
    let timer = 0;
    let tries = 0;
    let cancelled = false;

    const measure = (el: HTMLElement) => setRect(el.getBoundingClientRect());

    const find = () => {
      if (cancelled) return;
      if (!step.selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        measure(el);
      } else if (tries++ < 40) {
        timer = window.setTimeout(find, 50);
      } else {
        setRect(null); // give up → centered fallback
      }
    };
    find();

    const onMove = () => {
      if (!step.selector) return;
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) measure(el);
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, i, location.pathname]);

  // Position the tooltip relative to the target (or center it).
  useLayoutEffect(() => {
    if (!run) return;
    const tip = tipRef.current;
    const tw = tip?.offsetWidth ?? TIP_WIDTH;
    const th = tip?.offsetHeight ?? 160;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 12;
    const pad = 10;

    let top: number;
    let left: number;
    if (!rect || step?.placement === 'center') {
      top = (vh - th) / 2;
      left = (vw - tw) / 2;
    } else {
      switch (step?.placement ?? 'bottom') {
        case 'right':
          left = rect.right + gap;
          top = rect.top;
          break;
        case 'left':
          left = rect.left - tw - gap;
          top = rect.top;
          break;
        case 'top':
          left = rect.left;
          top = rect.top - th - gap;
          break;
        default: // bottom
          left = rect.left;
          top = rect.bottom + gap;
      }
    }
    left = Math.max(pad, Math.min(left, vw - tw - pad));
    top = Math.max(pad, Math.min(top, vh - th - pad));
    setTipPos({ top, left });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, rect, i]);

  if (!run || !step) return null;

  const last = i === STEPS.length - 1;
  const next = () => (last ? onClose() : setI((n) => n + 1));
  const back = () => setI((n) => Math.max(0, n - 1));

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Click-blocker — makes the tour modal so the user can't desync it. */}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      {/* Spotlight (or a flat dim when there's no target). */}
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-amber transition-all duration-200"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          }}
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-black/55" />
      )}

      {/* Tooltip */}
      <div
        ref={tipRef}
        className="absolute rounded-[12px] border border-border bg-surface p-4 shadow-2xl"
        style={{
          width: TIP_WIDTH,
          top: tipPos?.top ?? -9999,
          left: tipPos?.left ?? -9999,
        }}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <Kicker>◆ Guided tour</Kicker>
          <span className="font-mono text-[10px] tracking-[0.08em] text-text-muted">
            {i + 1} / {STEPS.length}
          </span>
        </div>
        <h3 className="font-display text-[16px] font-bold tracking-[-0.02em] text-text">
          {step.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-[1.5] text-text-sec">{step.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted transition-colors hover:text-text-sec"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {i > 0 && <GhostButton onClick={back}>Back</GhostButton>}
            <PrimaryButton onClick={next}>{last ? 'Done' : 'Next →'}</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuidedTour;

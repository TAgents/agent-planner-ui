import React from 'react';
import { Link } from 'react-router-dom';

const FinalCtaSection: React.FC = () => (
  <section className="border-b border-border bg-surface-hi">
    <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-9 px-6 py-20 sm:px-9">
      <div className="max-w-[560px]">
        <h3 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-text">
          Spin up one live workspace. Reuse the process forever.
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-text-sec">
          Fork your next workspace from a Blueprint, link a goal, and let agents help move it forward.
        </p>
      </div>
      <div className="flex gap-2.5">
        <Link
          to="/login"
          className="rounded-md bg-amber px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90"
        >
          Create Workspace →
        </Link>
        <Link
          to="/explore"
          className="rounded-md border border-border bg-surface px-5 py-2.5 font-medium text-text transition-colors hover:bg-surface-hi"
        >
          Browse Blueprints
        </Link>
      </div>
    </div>
  </section>
);

export default FinalCtaSection;

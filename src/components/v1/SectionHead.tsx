import React from 'react';
import { cn } from './cn';
import { Kicker } from './Kicker';

export type SectionHeadProps = {
  kicker?: React.ReactNode;
  title: React.ReactNode;
  /** Right-aligned slot for pills, counts, or actions. */
  right?: React.ReactNode;
  className?: string;
};

export function SectionHead({ kicker, title, right, className }: SectionHeadProps) {
  return (
    <div className={cn('flex items-end justify-between mb-3', className)}>
      <div>
        {kicker && <Kicker className="mb-1">{kicker}</Kicker>}
        <div className="font-display text-[17px] font-semibold tracking-[-0.02em] text-text">
          {title}
        </div>
      </div>
      {right}
    </div>
  );
}

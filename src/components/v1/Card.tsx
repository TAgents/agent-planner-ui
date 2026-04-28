import React from 'react';
import { cn } from './cn';

export type CardProps = {
  /** Padding in px. Pass 0 for cards whose children manage their own padding (e.g. row containers). */
  pad?: number;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'>;

export function Card({ pad = 16, className, children, style, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn('bg-surface border border-border rounded-[10px]', className)}
      style={{ padding: pad, ...style }}
    >
      {children}
    </div>
  );
}

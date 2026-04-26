/**
 * v1 redesign — shared chrome primitives.
 * Built per design_handoff_agentplanner/03-component-inventory.md.
 *
 * These are the base primitives every Phase 1+ page composes from.
 * Existing (legacy) components live elsewhere under src/components/ and
 * remain unchanged during the migration window.
 */
export { AppShell } from './AppShell';
export type { AppShellProps, AppShellNavId, AppShellNavItem } from './AppShell';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Pill } from './Pill';
export type { PillProps, PillColor } from './Pill';

export { Kicker } from './Kicker';
export type { KickerProps } from './Kicker';

export { SectionHead } from './SectionHead';
export type { SectionHeadProps } from './SectionHead';

export { StatusDot } from './StatusDot';
export type { StatusDotProps } from './StatusDot';

export { StatusSpine } from './StatusSpine';
export type { StatusSpineProps } from './StatusSpine';

export { ProposedChip } from './ProposedChip';
export type { ProposedChipProps } from './ProposedChip';

export { TokenBlock } from './TokenBlock';
export type { TokenBlockProps } from './TokenBlock';

export { PrimaryButton, GhostButton } from './Button';

export { StepCard } from './StepCard';
export type { StepCardProps, StepState } from './StepCard';

export { SnippetBlock } from './SnippetBlock';
export type { SnippetBlockProps, SnippetLine } from './SnippetBlock';

export { ClientTile } from './ClientTile';
export type { ClientTileProps } from './ClientTile';

export { TestPanel } from './TestPanel';
export type {
  TestPanelProps,
  TestPanelStatCard,
  TestPanelError,
  TestPanelProvenance,
} from './TestPanel';

export { AuthSplitLayout, SSOButton } from './AuthSplitLayout';
export type { AuthSplitLayoutProps, SSOButtonProps } from './AuthSplitLayout';

export { Spark } from './Spark';
export type { SparkProps } from './Spark';

export { CoherenceDial } from './CoherenceDial';
export type { CoherenceDialProps } from './CoherenceDial';

export { cn } from './cn';

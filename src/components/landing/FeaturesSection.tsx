import React from 'react';

type FeatureCard = {
  letter: 'K' | 'G' | 'P';
  axis: 'Knowledge' | 'Goals' | 'Plans';
  title: string;
  body: string;
  /** CSS var token referenced for sigil + watermark color. */
  toneVar: 'violet' | 'amber' | 'emerald';
};

const CARDS: FeatureCard[] = [
  {
    letter: 'K',
    axis: 'Knowledge',
    title: 'Temporal knowledge graph',
    body: 'Facts with valid_from/valid_to. Outdated facts flagged. Contradictions surfaced.',
    toneVar: 'violet',
  },
  {
    letter: 'G',
    axis: 'Goals',
    title: 'Goals with structure',
    body: 'Outcomes, metrics, constraints, principles. Quality-scored against a clear rubric.',
    toneVar: 'amber',
  },
  {
    letter: 'P',
    axis: 'Plans',
    title: 'Plans agents commit to',
    body: 'Hierarchical task trees, dependency graph, decision handoffs to humans.',
    toneVar: 'emerald',
  },
];

/**
 * Three feature cards — knowledge, goals, plans. Each card has a sigil chip
 * (K/G/P) in the axis tone, a giant low-opacity watermark letter
 * behind the body copy, the axis label as a kicker, the feature title,
 * and a one-sentence description. Layout matches the design handoff.
 */
const FeaturesSection: React.FC = () => {
  return (
    <section className="border-t border-border/60 bg-bg">
      <div className="mx-auto grid max-w-[1180px] gap-3 px-6 py-12 sm:px-9 md:grid-cols-3">
        {CARDS.map((c) => (
          <FeatureCardView key={c.letter} card={c} />
        ))}
      </div>
    </section>
  );
};

const FeatureCardView: React.FC<{ card: FeatureCard }> = ({ card }) => {
  const sigilStyle: React.CSSProperties = {
    background: `rgb(var(--${card.toneVar}) / 0.18)`,
    color: `rgb(var(--${card.toneVar}))`,
    border: `1px solid rgb(var(--${card.toneVar}) / 0.5)`,
  };
  const watermarkStyle: React.CSSProperties = {
    color: `rgb(var(--${card.toneVar}) / 0.06)`,
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-6">
      <span
        aria-hidden
        style={watermarkStyle}
        className="pointer-events-none absolute -right-4 top-4 select-none font-display text-[180px] font-bold leading-none tracking-[-0.04em]"
      >
        {card.letter}
      </span>
      <span
        aria-hidden
        style={sigilStyle}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md font-display text-[18px] font-bold"
      >
        {card.letter}
      </span>
      <p className="relative mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
        {card.axis}
      </p>
      <h3 className="relative mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
        {card.title}
      </h3>
      <p className="relative mt-3 max-w-[34ch] text-[12.5px] leading-[1.55] text-text-sec">
        {card.body}
      </p>
    </div>
  );
};

export default FeaturesSection;

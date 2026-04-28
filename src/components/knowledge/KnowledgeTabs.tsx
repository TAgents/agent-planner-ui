import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Sub-nav for the three Knowledge surfaces. Mounted at the top of every
 * /app/knowledge/* page so the user can switch between the lenses
 * (Timeline / Coverage / Graph) without going back to the rail.
 */
const KnowledgeTabs: React.FC = () => {
  const tabs = [
    { to: '/app/knowledge/coverage', label: 'Coverage', sub: 'Do we have what we need?' },
    { to: '/app/knowledge/timeline', label: 'Timeline', sub: 'When did we learn it?' },
    { to: '/app/knowledge/graph', label: 'Graph', sub: 'How is it connected?' },
  ];

  return (
    <nav
      aria-label="Knowledge views"
      className="mb-6 flex items-center gap-1 border-b border-border pb-2"
    >
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            [
              'flex flex-col rounded-md px-3 py-1.5 transition-colors',
              isActive
                ? 'bg-surface text-text'
                : 'text-text-sec hover:bg-surface-hi/40 hover:text-text',
            ].join(' ')
          }
        >
          <span className="font-display text-[12.5px] font-semibold tracking-tight">
            {t.label}
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-text-muted">
            {t.sub}
          </span>
        </NavLink>
      ))}
    </nav>
  );
};

export default KnowledgeTabs;

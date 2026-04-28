import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import KnowledgeTabs from '../KnowledgeTabs';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <KnowledgeTabs />
    </MemoryRouter>,
  );

describe('KnowledgeTabs', () => {
  const expected: Array<[string, string]> = [
    ['Timeline', '/app/knowledge/timeline'],
    ['Coverage', '/app/knowledge/coverage'],
    ['Graph', '/app/knowledge/graph'],
  ];

  it.each(expected)('renders %s tab linking to %s', (label, href) => {
    renderAt('/app/knowledge/timeline');
    const link = screen.getByText(label).closest('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', href);
  });

  it('marks the active tab with aria-current=page', () => {
    renderAt('/app/knowledge/coverage');
    const nav = screen.getByRole('navigation', { name: /knowledge views/i });
    const active = within(nav)
      .getAllByRole('link')
      .find((a) => a.getAttribute('aria-current') === 'page');
    expect(active).toBeDefined();
    expect(active).toHaveAttribute('href', '/app/knowledge/coverage');
  });

  it('exposes exactly three nav links', () => {
    renderAt('/app/knowledge/timeline');
    const nav = screen.getByRole('navigation', { name: /knowledge views/i });
    expect(within(nav).getAllByRole('link')).toHaveLength(3);
  });
});

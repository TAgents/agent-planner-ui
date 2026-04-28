import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import HeroSection from '../HeroSection';

const renderHero = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>
    </HelmetProvider>,
  );

describe('HeroSection "Connects to" inline list', () => {
  it.each([
    ['Claude Desktop', '/connect/claude-desktop'],
    ['Claude Code', '/connect/claude-code'],
    ['Cursor', '/connect/cursor'],
    ['Windsurf', '/connect/openclaw'],
  ])('"%s" link deep-links to %s', (name, href) => {
    renderHero();
    const link = screen.getByText(name).closest('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', href);
  });

  it('exposes a "$ install mcp" CTA pointing at /connect', () => {
    renderHero();
    const cta = screen.getByText(/install mcp/i).closest('a');
    expect(cta).not.toBeNull();
    expect(cta).toHaveAttribute('href', '/connect');
  });
});

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

/**
 * Workspace-first hero (v1.1). Asserts the two primary CTAs and the
 * top-of-hero kicker copy. The old "Connects to" inline client list
 * was removed when the hero was reframed around Workspace + Blueprint —
 * /connect/* deep links still work; they just aren't on the hero.
 */
describe('HeroSection', () => {
  it('renders the shared-brain headline', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Your agents need/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/shared brain/i);
  });

  it('CTA "Create a workspace" links to /login', () => {
    renderHero();
    const cta = screen.getByText(/Create a workspace/i).closest('a');
    expect(cta).not.toBeNull();
    expect(cta).toHaveAttribute('href', '/login');
  });

  it('CTA "Explore Blueprints" links to /explore', () => {
    renderHero();
    const cta = screen.getByText(/Explore Blueprints/i).closest('a');
    expect(cta).not.toBeNull();
    expect(cta).toHaveAttribute('href', '/explore');
  });

  it('renders the "Operating system for repeatable work" kicker', () => {
    renderHero();
    expect(screen.getByText(/Operating system for repeatable work/i)).toBeInTheDocument();
  });
});

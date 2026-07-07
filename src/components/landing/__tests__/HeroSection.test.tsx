import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
 * Path-toggle hero ("Flow v2" structure). Asserts the headline, the kicker,
 * the agent/human toggle, and each path's primary affordance: the agent path
 * leads with the quick-connect card (chips + connect handoff), the human
 * path leads with the chat framing.
 */
describe('HeroSection', () => {
  it('renders the goals-and-plans headline', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Define goals and plans/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Agents implement/i);
  });

  it('renders the "Operating system for repeatable work" kicker', () => {
    renderHero();
    expect(screen.getByText(/Operating system for repeatable work/i)).toBeInTheDocument();
  });

  it('defaults to the agent path with the quick-connect card', () => {
    renderHero();
    expect(screen.getByText(/Quick connect/i)).toBeInTheDocument();
    // Claude Desktop leads and its handoff routes into its connect guide.
    const handoff = screen.getByText(/Get your token/i).closest('a');
    expect(handoff).toHaveAttribute('href', '/connect/claude-desktop');
  });

  it('switching client chips retargets the connect handoff', () => {
    renderHero();
    fireEvent.click(screen.getByRole('tab', { name: 'Cursor' }));
    const handoff = screen.getByText(/Get your token/i).closest('a');
    expect(handoff).toHaveAttribute('href', '/connect/cursor');
  });

  it('the human path shows the chat framing and routes to /login', () => {
    renderHero();
    fireEvent.click(screen.getByRole('tab', { name: /I’m human/i }));
    expect(screen.getByText(/as a conversation/i)).toBeInTheDocument();
    const cta = screen.getByText(/Open chat →/i).closest('a');
    expect(cta).toHaveAttribute('href', '/login');
  });
});

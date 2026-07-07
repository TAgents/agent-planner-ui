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
 * Lovable-style hero: headline over a Human/Agents toggle. Human (default)
 * = one big prompt box whose submit stashes the question for the ChatDock;
 * Agents = quick-connect card with per-client handoff into /connect/:client.
 */
describe('HeroSection', () => {
  afterEach(() => localStorage.clear());

  it('renders the goals-and-plans headline', () => {
    renderHero();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Define goals and plans/i);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Agents implement/i);
  });

  it('defaults to the human path: big prompt box with suggestions', () => {
    renderHero();
    expect(screen.getByLabelText(/Ask the assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/How are my goals doing\?/i)).toBeInTheDocument();
  });

  it('submitting the prompt stashes the question for the ChatDock', () => {
    renderHero();
    const box = screen.getByLabelText(/Ask the assistant/i);
    fireEvent.change(box, { target: { value: 'What is blocked?' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    expect(localStorage.getItem('ap-chat-landing-draft')).toBe('What is blocked?');
  });

  it('a suggestion chip fills the prompt box', () => {
    renderHero();
    fireEvent.click(screen.getByText(/What should I focus on next\?/i));
    expect(screen.getByLabelText(/Ask the assistant/i)).toHaveValue(
      'What should I focus on next?',
    );
  });

  it('the Agents tab shows the quick-connect card with the connect handoff', () => {
    renderHero();
    fireEvent.click(screen.getByRole('tab', { name: /Agents/i }));
    expect(screen.getByText(/Quick connect/i)).toBeInTheDocument();
    const handoff = screen.getByText(/Get your token/i).closest('a');
    expect(handoff).toHaveAttribute('href', '/connect/claude-desktop');
    fireEvent.click(screen.getByRole('tab', { name: 'Cursor' }));
    expect(screen.getByText(/Get your token/i).closest('a')).toHaveAttribute(
      'href',
      '/connect/cursor',
    );
  });
});

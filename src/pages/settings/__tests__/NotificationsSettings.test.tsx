import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationsSettings from '../NotificationsSettings';

describe('NotificationsSettings', () => {
  it('renders the four channel toggles', () => {
    render(<NotificationsSettings />);
    expect(screen.getByText('Decision queue email')).toBeInTheDocument();
    expect(screen.getByText('Stale-goal digest')).toBeInTheDocument();
    expect(screen.getByText('Slack — decision pings')).toBeInTheDocument();
    expect(screen.getByText('Slack — completion summary')).toBeInTheDocument();
  });

  it('reports the correct enabled count by default (2 of 4)', () => {
    render(<NotificationsSettings />);
    expect(screen.getByText(/2 enabled/i)).toBeInTheDocument();
  });

  it('toggling a switch flips its aria-checked state', () => {
    render(<NotificationsSettings />);
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(4);
    const first = switches[0];
    expect(first).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-checked', 'false');
  });
});
